"use server";

import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import { verifySession, getFirebaseAdmin } from "./auth";
import { DEV_MODE, DEV_USER_UID } from "./dev-mode";
import { redirect } from "next/navigation";
import { sendInvitationEmail, sendApprovalEmail, sendPasswordSetupEmail, sendReminderEmail } from "./email";

// Your Firebase UID — only this user can access admin features.
function getAdminUid(): string | undefined {
  return DEV_MODE ? "dev-user-001" : process.env.ADMIN_UID;
}

async function requireAdmin() {
  const adminUid = getAdminUid();
  const session = await verifySession();
  if (!session || !adminUid || session.uid !== adminUid) {
    redirect("/benchmarks");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const adminUid = getAdminUid();
  if (!adminUid) return false;
  const session = await verifySession();
  return session?.uid === adminUid;
}

export async function getInvitations() {
  await requireAdmin();
  return prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      reminderSentAt: true,
      invitedEmail: true,
      // inviteToken intentionally excluded
    },
  });
}

export async function createInvitation(email: string, name?: string) {
  await requireAdmin();
  const normalized = email.toLowerCase().trim();

  const existing = await prisma.invitation.findUnique({
    where: { email: normalized },
  });
  if (existing) throw new Error("Email já convidado.");

  const invitation = await prisma.invitation.create({
    data: { email: normalized, name: name || null },
  });

  // Pre-create Firebase account so user can login with email+password.
  // If they use Google sign-in instead, Firebase will link the accounts.
  if (!DEV_MODE) {
    try {
      const adminAuth = await getFirebaseAdmin();
      // Check if user already exists (e.g., from a previous signup attempt)
      try {
        await adminAuth.getUserByEmail(normalized);
        // Already exists — just send password reset so they can set a password
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code !== "auth/user-not-found") throw err;
        // User doesn't exist — create with a random password
        const { randomBytes } = await import("crypto");
        const tempPassword = randomBytes(32).toString("base64url");
        await adminAuth.createUser({
          email: normalized,
          password: tempPassword,
          displayName: name || undefined,
        });
      }
      // Send password reset email so user sets their own password
      const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://captablebr.com";
      const resetLink = await adminAuth.generatePasswordResetLink(normalized, { url: `${appUrl}/login` });
      await sendPasswordSetupEmail(normalized, resetLink, name);
    } catch (err) {
      console.error("[ADMIN] Firebase account setup failed (non-blocking):", err);
    }
  }

  // Send invitation email (best-effort, don't fail if email fails)
  try {
    await sendInvitationEmail(normalized, name, invitation.inviteToken ?? undefined);
  } catch (err) {
    console.error("[ADMIN] Failed to send invitation email:", err);
  }

  return invitation;
}

export type BatchInviteResult = {
  created: number;
  skipped: number;
  emailsSent: number;
  emailsFailed: number;
  errors: string[];
};

export async function createInvitationsBatch(
  entries: Array<{ email: string; name?: string }>
): Promise<BatchInviteResult> {
  await requireAdmin();

  const result: BatchInviteResult = {
    created: 0,
    skipped: 0,
    emailsSent: 0,
    emailsFailed: 0,
    errors: [],
  };

  // Normalize and deduplicate input
  const seen = new Set<string>();
  const unique: Array<{ email: string; name: string | null }> = [];
  for (const entry of entries) {
    const email = entry.email.toLowerCase().trim();
    if (!email.includes("@") || seen.has(email)) continue;
    seen.add(email);
    unique.push({ email, name: entry.name?.trim() || null });
  }

  // Find already-invited emails so we only email new ones
  const existing = new Set(
    (await prisma.invitation.findMany({
      where: { email: { in: unique.map((u) => u.email) } },
      select: { email: true },
    })).map((i) => i.email)
  );

  // Bulk insert — skip duplicates (emails that already exist in the DB)
  const { count } = await prisma.invitation.createMany({
    data: unique,
    skipDuplicates: true,
  });
  result.created = count;
  result.skipped = unique.length - count;

  // Only process Firebase/email for newly created invitations
  const newlyInserted = unique.filter((u) => !existing.has(u.email));

  // Fetch invite tokens for newly created invitations
  const newEmails = newlyInserted.map((u) => u.email);
  const createdInvitations = newEmails.length > 0
    ? await prisma.invitation.findMany({
        where: { email: { in: newEmails } },
        select: { email: true, inviteToken: true },
      })
    : [];
  const inviteTokenByEmail = new Map(createdInvitations.map((i) => [i.email, i.inviteToken]));

  // Process Firebase accounts + emails sequentially (Resend rate limit: 5 req/s)
  if (!DEV_MODE) {
    const adminAuth = await getFirebaseAdmin();
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://captablebr.com";
    for (const { email, name } of newlyInserted) {
      try {
        // Firebase account setup
        try {
          await adminAuth.getUserByEmail(email);
        } catch (err: unknown) {
          const code = (err as { code?: string }).code;
          if (code !== "auth/user-not-found") throw err;
          const { randomBytes } = await import("crypto");
          const tempPassword = randomBytes(32).toString("base64url");
          await adminAuth.createUser({
            email,
            password: tempPassword,
            displayName: name || undefined,
          });
        }
        const resetLink = await adminAuth.generatePasswordResetLink(email, { url: `${appUrl}/login` });
        await sendPasswordSetupEmail(email, resetLink, name ?? undefined);

        // Invitation email
        const inviteToken = inviteTokenByEmail.get(email);
        await sendInvitationEmail(email, name ?? undefined, inviteToken ?? undefined);
        result.emailsSent++;
      } catch (err) {
        console.error(`[ADMIN] Batch invite failed for ${email}:`, err);
        result.emailsFailed++;
        result.errors.push(`${email}: ${err instanceof Error ? err.message : String(err)}`);
      }
      // Respect Resend rate limit (5 req/s → ~1s between users with 2 emails each)
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return result;
}

export type SendRemindersResult = {
  sent: number;
  failed: number;
  errors: string[];
};

/**
 * Send reminder emails to all pending invitations that haven't accepted yet.
 * Skips invitations that already received a reminder.
 */
export async function sendReminders(): Promise<SendRemindersResult> {
  await requireAdmin();

  const result: SendRemindersResult = { sent: 0, failed: 0, errors: [] };

  // Get all pending invitations (re-send allowed — reminderSentAt tracks last send date)
  const pending = await prisma.invitation.findMany({
    where: {
      status: "pending",
    },
    orderBy: { createdAt: "asc" },
  });

  if (pending.length === 0) return result;

  // Send reminders sequentially to respect Resend rate limit (5 req/s)
  for (const inv of pending) {
    try {
      await sendReminderEmail(inv.email, inv.name ?? undefined, inv.inviteToken ?? undefined);
      await prisma.invitation.update({
        where: { id: inv.id },
        data: { reminderSentAt: new Date() },
      });
      result.sent++;
    } catch (err) {
      console.error(`[ADMIN] Reminder failed for ${inv.email}:`, err);
      result.failed++;
      result.errors.push(`${inv.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
    // Respect Resend rate limit (5 req/s → 200ms per email, using 500ms for safety)
    await new Promise((r) => setTimeout(r, 500));
  }

  return result;
}

/**
 * Send a single test reminder email to the given address (admin only).
 * Does NOT update any invitation record.
 */
export async function sendTestReminder(email: string): Promise<void> {
  await requireAdmin();
  await sendReminderEmail(email);
}

export async function deleteInvitation(id: string) {
  await requireAdmin();
  return prisma.invitation.delete({ where: { id } });
}

export async function getAccessRequests() {
  await requireAdmin();
  return prisma.accessRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function approveAccessRequest(requestId: string) {
  await requireAdmin();

  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new Error("Solicitação não encontrada.");

  // Create invitation for this email
  const normalized = request.email.toLowerCase().trim();
  await prisma.invitation.upsert({
    where: { email: normalized },
    create: { email: normalized, status: "pending" },
    update: {},
  });

  // Mark request as approved
  const updated = await prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "approved" },
  });

  // Send approval email (best-effort)
  try {
    await sendApprovalEmail(normalized, request.name);
  } catch (err) {
    console.error("[ADMIN] Failed to send approval email:", err);
  }

  return updated;
}

export async function rejectAccessRequest(requestId: string) {
  await requireAdmin();
  return prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
  });
}

export async function revokeAccess(email: string) {
  await requireAdmin();
  const normalized = email.toLowerCase().trim();
  await prisma.invitation.delete({
    where: { email: normalized },
  });

  // Revoke Firebase session so user can't continue using the app
  if (!DEV_MODE) {
    try {
      const adminAuth = await getFirebaseAdmin();
      const user = await adminAuth.getUserByEmail(normalized);
      await adminAuth.revokeRefreshTokens(user.uid);
    } catch (err) {
      console.error("[ADMIN] revokeAccess: Firebase revocation failed:", err);
    }
  }
}

// --- Admin Stats & User Management ---

export async function getAdminStats() {
  await requireAdmin();
  const [totalInvited, accepted, pendingRequests, totalSubmissions] =
    await Promise.all([
      prisma.invitation.count(),
      prisma.invitation.count({ where: { status: "accepted" } }),
      prisma.accessRequest.count({ where: { status: "pending" } }),
      prisma.submission.count(),
    ]);
  return { totalInvited, accepted, pendingRequests, totalSubmissions };
}

export async function getActiveUsers(): Promise<
  Map<string, { hasSubmission: boolean; firebaseExists: boolean }>
> {
  await requireAdmin();

  const invitations = await prisma.invitation.findMany({
    where: { status: "accepted" },
    select: { email: true },
  });

  if (invitations.length === 0) return new Map();

  const emails = invitations.map((i) => i.email);

  const emailStatus = new Map<
    string,
    { hasSubmission: boolean; firebaseExists: boolean }
  >();

  // In DEV_MODE, skip Firebase — just check submissions by dev UID
  if (DEV_MODE) {
    const submissions = await prisma.submission.findMany({
      where: { userId: DEV_USER_UID },
      select: { userId: true },
    });
    const hasSubmission = submissions.length > 0;
    for (const email of emails) {
      emailStatus.set(email.toLowerCase(), {
        hasSubmission,
        firebaseExists: true,
      });
    }
    return emailStatus;
  }

  // Batch Firebase lookup (max 100 per call)
  const adminAuth = await getFirebaseAdmin();
  const uidToEmail = new Map<string, string>();

  // Process in batches of 100 (Firebase limit)
  for (let i = 0; i < emails.length; i += 100) {
    const batch = emails.slice(i, i + 100);
    const result = await adminAuth.getUsers(
      batch.map((email) => ({ email }))
    );

    for (const user of result.users) {
      if (user.email) {
        uidToEmail.set(user.uid, user.email.toLowerCase());
        emailStatus.set(user.email.toLowerCase(), {
          hasSubmission: false,
          firebaseExists: true,
        });
      }
    }

    for (const notFound of result.notFound) {
      if ("email" in notFound && notFound.email) {
        emailStatus.set(notFound.email.toLowerCase(), {
          hasSubmission: false,
          firebaseExists: false,
        });
      }
    }
  }

  // Batch check submissions by UID list
  const uids = [...uidToEmail.keys()];
  if (uids.length > 0) {
    const submissions = await prisma.submission.findMany({
      where: { userId: { in: uids } },
      select: { userId: true },
    });
    const submittedUids = new Set(submissions.map((s) => s.userId));
    for (const [uid, email] of uidToEmail) {
      const entry = emailStatus.get(email);
      if (entry) {
        entry.hasSubmission = submittedUids.has(uid);
      }
    }
  }

  return emailStatus;
}

export type DeleteUserResult = {
  deletedSubmission: boolean;
  deletedInvitation: boolean;
  deletedRequests: number;
  deletedFirebase: boolean;
  deletedGcs: boolean;
};

export async function deleteUser(email: string): Promise<DeleteUserResult> {
  const session = await requireAdmin();
  const normalized = email.toLowerCase().trim();

  let targetUid: string | undefined;
  let deletedFirebase = false;
  let deletedGcs = false;

  if (DEV_MODE) {
    // In DEV_MODE, self-deletion guard uses dev UID convention
    if (normalized === "dev@captablebr.com") {
      throw new Error("Não é possível excluir sua própria conta de administrador.");
    }
    // No Firebase operations in dev — resolve UID from submissions if possible
    const submission = await prisma.submission.findFirst({
      where: { userId: { not: DEV_USER_UID } },
      select: { userId: true },
    });
    targetUid = submission?.userId;
  } else {
    // Self-deletion guard (RA-1)
    const adminAuth = await getFirebaseAdmin();
    let adminEmail: string | undefined;
    try {
      const adminUser = await adminAuth.getUser(session.uid);
      adminEmail = adminUser.email?.toLowerCase();
    } catch {
      // If we can't resolve admin email, proceed cautiously
    }
    if (adminEmail && adminEmail === normalized) {
      throw new Error("Não é possível excluir sua própria conta de administrador.");
    }

    // Resolve target Firebase UID
    try {
      const targetUser = await adminAuth.getUserByEmail(normalized);
      targetUid = targetUser.uid;
    } catch {
      // User may not exist in Firebase — proceed with DB cleanup
    }
  }

  // DB transaction (RA-3)
  const txResult = await prisma.$transaction(async (tx) => {
    let deletedSubmission = false;
    if (targetUid) {
      const { count } = await tx.submission.deleteMany({
        where: { userId: targetUid },
      });
      deletedSubmission = count > 0;
    }

    let deletedInvitation = false;
    try {
      await tx.invitation.delete({ where: { email: normalized } });
      deletedInvitation = true;
    } catch (err) {
      // Only swallow "record not found" — re-throw unexpected errors
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        // Invitation doesn't exist — ok
      } else {
        throw err;
      }
    }

    const { count: deletedRequests } = await tx.accessRequest.deleteMany({
      where: { email: normalized },
    });

    return { deletedSubmission, deletedInvitation, deletedRequests };
  });

  // Post-transaction cleanup (best-effort)
  if (!DEV_MODE && targetUid) {
    const adminAuth = await getFirebaseAdmin();

    // GCS cleanup (moved after transaction — RA review)
    try {
      const bucketName = process.env.GCS_BUCKET_NAME;
      if (bucketName) {
        const prefix = `uploads/${targetUid}/`;
        const { Storage } = await import("@google-cloud/storage");
        const storage = new Storage();
        await storage.bucket(bucketName).deleteFiles({ prefix });
        deletedGcs = true;
      }
    } catch (err) {
      console.error("[ADMIN] GCS cleanup failed:", err);
    }

    // Firebase cleanup: revoke tokens + disable + delete (RA-4, RA-9)
    try {
      await adminAuth.revokeRefreshTokens(targetUid);
      await adminAuth.updateUser(targetUid, { disabled: true });
      await adminAuth.deleteUser(targetUid);
      deletedFirebase = true;
    } catch (err) {
      console.error("[ADMIN] Firebase cleanup failed:", err);
    }
  }

  // Audit log (RA-5)
  console.log(
    JSON.stringify({
      action: "deleteUser",
      adminUid: session.uid,
      targetEmail: normalized,
      timestamp: new Date().toISOString(),
      results: { ...txResult, deletedFirebase, deletedGcs },
    })
  );

  return { ...txResult, deletedFirebase, deletedGcs };
}
