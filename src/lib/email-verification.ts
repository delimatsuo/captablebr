import { createHmac, createHash, timingSafeEqual } from "crypto";
import { DEV_MODE } from "./dev-mode";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function getSecret(): string {
  if (process.env.EMAIL_VERIFICATION_SECRET) {
    return process.env.EMAIL_VERIFICATION_SECRET;
  }
  // Derive from Firebase service account key (always available in production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return createHash("sha256")
      .update("email-verification:" + process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      .digest("hex");
  }
  if (DEV_MODE) {
    return "dev-secret-captablebr-email-verification";
  }
  throw new Error("EMAIL_VERIFICATION_SECRET or FIREBASE_SERVICE_ACCOUNT_KEY is required");
}

export function generateEmailToken(email: string, ts: number): string {
  return createHmac("sha256", getSecret())
    .update(`${email.toLowerCase().trim()}:${ts}`)
    .digest("hex");
}

export function verifyEmailToken(
  email: string,
  ts: number,
  token: string
): { valid: boolean; error?: string } {
  if (Date.now() - ts > TOKEN_EXPIRY_MS) {
    return { valid: false, error: "Link expirado. Solicite um novo." };
  }

  const expected = generateEmailToken(email, ts);

  if (expected.length !== token.length) {
    return { valid: false, error: "Token inválido." };
  }

  const valid = timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  return valid ? { valid: true } : { valid: false, error: "Token inválido." };
}
