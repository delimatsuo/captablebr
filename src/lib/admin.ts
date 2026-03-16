"use server";

import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import { verifySession, getFirebaseAdmin } from "./auth";
import { DEV_MODE, DEV_USER_UID } from "./dev-mode";
import { redirect } from "next/navigation";
import { sendInvitationEmail, sendApprovalEmail, sendPasswordSetupEmail } from "./email";

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
    data: { email: normalized },
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
      const resetLink = await adminAuth.generatePasswordResetLink(normalized);
      await sendPasswordSetupEmail(normalized, resetLink, name);
    } catch (err) {
      console.error("[ADMIN] Firebase account setup failed (non-blocking):", err);
    }
  }

  // Send invitation email (best-effort, don't fail if email fails)
  try {
    await sendInvitationEmail(normalized, name);
  } catch (err) {
    console.error("[ADMIN] Failed to send invitation email:", err);
  }

  return invitation;
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
