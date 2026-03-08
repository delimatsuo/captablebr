import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validations";
import { validateLinkedInUrl, runVerification } from "@/lib/verification";

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
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
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

  const { email, name, linkedinUrl, role, lgpdConsent } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Validate LinkedIn URL format
  if (!validateLinkedInUrl(linkedinUrl)) {
    return NextResponse.json(
      { error: "URL do LinkedIn inválida. Use o formato: linkedin.com/in/seu-perfil" },
      { status: 400 }
    );
  }

  // Check for existing invitation or pending access request
  const [existingInvitation, existingRequest] = await Promise.all([
    prisma.invitation.findUnique({ where: { email: normalizedEmail } }),
    prisma.accessRequest.findFirst({
      where: { email: normalizedEmail, status: { in: ["pending", "approved"] } },
    }),
  ]);

  if (existingInvitation) {
    return NextResponse.json(
      { error: "Este email já possui acesso. Faça login." },
      { status: 409 }
    );
  }

  if (existingRequest) {
    return NextResponse.json(
      { error: "Já existe uma solicitação para este email." },
      { status: 409 }
    );
  }

  // Create access request
  const accessRequest = await prisma.accessRequest.create({
    data: {
      email: normalizedEmail,
      name,
      linkedinUrl,
      role,
      lgpdConsent,
      status: "pending",
    },
  });

  // Run verification synchronously (up to ~60s)
  const verification = await runVerification(linkedinUrl, name, role);

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
        },
      }),
      prisma.invitation.upsert({
        where: { email: normalizedEmail },
        create: { email: normalizedEmail, status: "pending" },
        update: {},
      }),
    ]);

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
    },
  });

  return NextResponse.json({
    status: verification.result === "scrape_failed" ? "scrape_failed" : "pending_review",
    requestToken: accessRequest.requestToken,
  });
}
