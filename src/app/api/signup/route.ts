import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validations";
import { validateLinkedInUrl, runVerification } from "@/lib/verification";
import { getFirebaseAdmin } from "@/lib/auth";
import { verifyEmailToken } from "@/lib/email-verification";
import { computeLegacyRole, type RoleLevel, type RoleFunction } from "@/lib/types";

// Simple in-memory rate limiter: 5 requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ips = forwardedFor?.split(",").map(s => s.trim()) || [];
  const ip = ips[ips.length - 1] || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 1 hora." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Validate input
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos" },
      { status: 400 }
    );
  }

  const { email, name, linkedinUrl, roleLevel, roleFunction, lgpdConsent, tosConsent, firebaseIdToken, verificationTs, verificationToken } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Email verification: accept either HMAC token (new) or Firebase ID token (legacy)
  let emailVerified = false;
  let firebaseUid: string | null = null;

  if (verificationTs && verificationToken) {
    // New: HMAC-based verification (branded email via Resend)
    const result = verifyEmailToken(normalizedEmail, verificationTs, verificationToken);
    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Token de verificação inválido." },
        { status: 400 }
      );
    }
    emailVerified = true;
  } else if (firebaseIdToken) {
    // Legacy: Firebase email link verification
    try {
      const adminAuth = await getFirebaseAdmin();
      const decoded = await adminAuth.verifyIdToken(firebaseIdToken);
      if (decoded.email?.toLowerCase() !== normalizedEmail) {
        return NextResponse.json(
          { error: "O email verificado não corresponde ao email informado." },
          { status: 400 }
        );
      }
      emailVerified = decoded.email_verified === true
        || decoded.firebase?.sign_in_provider === "emailLink";
      firebaseUid = decoded.uid;
    } catch {
      return NextResponse.json(
        { error: "Token de verificação inválido. Tente novamente." },
        { status: 400 }
      );
    }
  }

  if (!emailVerified) {
    return NextResponse.json(
      { error: "Verificação de email obrigatória. Verifique sua caixa de entrada." },
      { status: 400 }
    );
  }

  // Validate LinkedIn URL format
  if (!validateLinkedInUrl(linkedinUrl)) {
    return NextResponse.json(
      { error: "URL do LinkedIn inválida. Use o formato: linkedin.com/in/seu-perfil" },
      { status: 400 }
    );
  }

  // Check for existing invitation or pending access request, and create atomically
  let accessRequest;
  try {
    accessRequest = await prisma.$transaction(async (tx) => {
      const existingInvitation = await tx.invitation.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingInvitation) {
        throw new Error("DUPLICATE_INVITATION");
      }

      const existingRequest = await tx.accessRequest.findFirst({
        where: { email: normalizedEmail, status: { in: ["pending", "approved"] } },
      });
      if (existingRequest) {
        throw new Error("DUPLICATE_REQUEST");
      }

      const role = computeLegacyRole(roleLevel as RoleLevel, (roleFunction || null) as RoleFunction | null);
      return tx.accessRequest.create({
        data: {
          email: normalizedEmail,
          name,
          linkedinUrl,
          role,
          lgpdConsent,
          tosConsent,
          status: "pending",
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE_INVITATION") {
      return NextResponse.json(
        { error: "Este email já possui acesso. Faça login." },
        { status: 409 }
      );
    }
    if (err instanceof Error && err.message === "DUPLICATE_REQUEST") {
      return NextResponse.json(
        { error: "Já existe uma solicitação para este email." },
        { status: 409 }
      );
    }
    throw err;
  }

  // Run verification synchronously (up to ~60s)
  const declaredRole = computeLegacyRole(roleLevel as RoleLevel, (roleFunction || null) as RoleFunction | null);
  const verification = await runVerification(linkedinUrl, name, declaredRole);

  // Helper to delete the temporary Firebase email-link user
  async function cleanupTempFirebaseUser() {
    if (!firebaseUid) return;
    try {
      const adminAuth = await getFirebaseAdmin();
      await adminAuth.deleteUser(firebaseUid);
    } catch {
      // Best-effort: if deletion fails, user can still sign in with Google later
      console.warn("[SIGNUP] Failed to delete temp Firebase user:", firebaseUid);
    }
  }

  if (verification.result === "auto_approved") {
    // Transaction: update AccessRequest + create Invitation
    await prisma.$transaction([
      prisma.accessRequest.update({
        where: { id: accessRequest.id },
        data: {
          status: "approved",
          verificationResult: verification.result,
          verificationReason: verification.reason,
          detectedTitle: verification.detectedTitle,
          linkedinData: verification.profileSummary ? JSON.parse(JSON.stringify(verification.profileSummary)) : undefined,
          autoVerified: true,
          emailVerified: true,
        },
      }),
      prisma.invitation.upsert({
        where: { email: normalizedEmail },
        create: { email: normalizedEmail, status: "pending" },
        update: {},
      }),
    ]);

    // Delete temp Firebase user so Google sign-in works later
    await cleanupTempFirebaseUser();

    return NextResponse.json({
      status: "approved",
      requestToken: accessRequest.requestToken,
    });
  }

  // Not auto-approved: update with verification data and queue for review
  await prisma.accessRequest.update({
    where: { id: accessRequest.id },
    data: {
      verificationResult: verification.result,
      verificationReason: verification.reason,
      detectedTitle: verification.detectedTitle,
      linkedinData: verification.profileSummary ? JSON.parse(JSON.stringify(verification.profileSummary)) : undefined,
      emailVerified: true,
    },
  });

  // Delete temp Firebase user so Google sign-in works later
  await cleanupTempFirebaseUser();

  return NextResponse.json({
    status: verification.result === "scrape_failed" ? "scrape_failed" : "pending_review",
    requestToken: accessRequest.requestToken,
  });
}
