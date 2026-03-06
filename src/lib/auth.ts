import { cookies } from "next/headers";
import { prisma } from "./db";

const DEV_MODE = !process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const DEV_USER_UID = "dev-user-001";

async function getFirebaseAdmin() {
  // Dynamic import to avoid crashes when Firebase isn't configured
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
 * Returns { uid, email } if authorized, throws if not invited.
 */
export async function verifyAndAuthorize(idToken: string): Promise<{ uid: string; email: string }> {
  if (DEV_MODE) {
    return { uid: idToken, email: "dev@captablebr.com" };
  }

  const adminAuth = await getFirebaseAdmin();
  const decoded = await adminAuth.verifyIdToken(idToken);
  const email = decoded.email;

  console.log("[AUTH] Firebase email:", email, "| UID:", decoded.uid);

  if (!email) {
    throw new Error("NO_EMAIL");
  }

  // Check invitation
  const invitation = await prisma.invitation.findUnique({
    where: { email: email.toLowerCase() },
  });
  console.log("[AUTH] Invitation found:", !!invitation, "for", email.toLowerCase());

  if (!invitation) {
    throw new Error("NOT_INVITED");
  }

  // Mark as accepted if still pending
  if (invitation.status === "pending") {
    await prisma.invitation.update({
      where: { email: email.toLowerCase() },
      data: { status: "accepted" },
    });
  }

  return { uid: decoded.uid, email };
}

export async function createSessionCookie(idToken: string): Promise<string> {
  if (DEV_MODE) {
    return idToken;
  }

  const adminAuth = await getFirebaseAdmin();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  return adminAuth.createSessionCookie(idToken, { expiresIn });
}

export { DEV_MODE, DEV_USER_UID };
