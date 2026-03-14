import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateEmailToken } from "@/lib/email-verification";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

// Simple in-memory rate limiter: 3 verification emails per IP per 15 min
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 900_000 });
    return false;
  }
  entry.count++;
  return entry.count > 3;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em 15 minutos." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const ts = Date.now();
  const token = generateEmailToken(email, ts);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://staging.captablebr.com";
  const verificationUrl = `${appUrl}/request-access?verify=1&email=${encodeURIComponent(email)}&ts=${ts}&token=${token}`;

  try {
    await sendVerificationEmail(email, verificationUrl);
  } catch (err) {
    console.error("[VERIFY-EMAIL] Failed to send:", err);
    return NextResponse.json(
      { error: "Erro ao enviar email. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ sent: true });
}
