import { cookies } from "next/headers";
import { prisma } from "./db";
import { DEV_MODE } from "./dev-mode";

export async function getFirebaseAdmin() {
  if (process.env.NODE_ENV === "production" && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required in production");
  }

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  let app;
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      app = initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
    } else {
      app = initializeApp();
    }
  }
  return getAuth(app);
}

export async function verifySession(): Promise<{ uid: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  if (DEV_MODE) {
    return { uid: sessionCookie };
  }

  try {
    const adminAuth = await getFirebaseAdmin();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

/**
 * Verify the ID token AND check that the user's email is in the invitations table.
 * Falls back to invite token cookie if email does not match any invitation.
 * Returns { uid, email } if authorized, throws if not invited.
 */
export async function verifyAndAuthorize(idToken: string): Promise<{ uid: string; email: string }> {
  if (DEV_MODE) {
    return { uid: idToken, email: "dev@captablebr.com" };
  }

  const adminAuth = await getFirebaseAdmin();
  const decoded = await adminAuth.verifyIdToken(idToken);
  const email = decoded.email;

  if (!email) {
    throw new Error("NO_EMAIL");
  }

  const normalizedEmail = email.toLowerCase();

  // --- Primary check: email match ---
  const invitation = await prisma.invitation.findUnique({
    where: { email: normalizedEmail },
  });

  if (invitation) {
    console.log("[AUTH] UID:", decoded.uid, "| invited by email:", normalizedEmail);
    const displayName = decoded.name as string | undefined;
    if (invitation.status === "pending" || (!invitation.name && displayName)) {
      await prisma.invitation.update({
        where: { email: normalizedEmail },
        data: {
          status: "accepted",
          ...(displayName && !invitation.name ? { name: displayName } : {}),
        },
      });
    }
    return { uid: decoded.uid, email: normalizedEmail };
  }

  // --- Fallback: invite token cookie ---
  const cookieStore = await cookies();
  const inviteToken = cookieStore.get("invite_token")?.value;

  if (!inviteToken) {
    throw new Error("NOT_INVITED");
  }

  const tokenInvitation = await prisma.invitation.findUnique({
    where: { inviteToken },
  });

  if (!tokenInvitation) {
    console.log("[AUTH] UID:", decoded.uid, "| invite token not found or already consumed");
    throw new Error("NOT_INVITED");
  }

  // Claim the invitation: update email to the actual login email, preserve original, consume token
  const displayName = decoded.name as string | undefined;
  await prisma.invitation.update({
    where: { id: tokenInvitation.id },
    data: {
      email: normalizedEmail,
      invitedEmail: tokenInvitation.email,
      inviteToken: null, // consume token — prevents anyone else from claiming this invitation
      status: "accepted",
      ...(displayName && !tokenInvitation.name ? { name: displayName } : {}),
    },
  });

  console.log("[AUTH] UID:", decoded.uid, "| invited by token:", tokenInvitation.email, "-> login email:", normalizedEmail);
  return { uid: decoded.uid, email: normalizedEmail };
}

export async function createSessionCookie(idToken: string): Promise<string> {
  if (DEV_MODE) {
    return idToken;
  }

  const adminAuth = await getFirebaseAdmin();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  return adminAuth.createSessionCookie(idToken, { expiresIn });
}

export { DEV_MODE, DEV_USER_UID } from "./dev-mode";
