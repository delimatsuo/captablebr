import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "CaptableBR <noreply@from.ellaexecutivesearch.com>";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://staging.captablebr.com";

/**
 * Send invitation email to a new user.
 */
export async function sendInvitationEmail(email: string) {
  if (!resend) {
    console.warn("[EMAIL] Resend not configured, skipping invitation email to:", email);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Você foi convidado para o CaptableBR",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 32px;">
          <strong style="font-size: 18px;">CaptableBR</strong>
        </div>
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #111;">
          Você foi convidado!
        </h1>
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 24px;">
          Você recebeu acesso à plataforma CaptableBR — benchmarks de compensação para executivos C-level de startups brasileiras.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 32px;">
          Faça login com sua conta Google para começar a explorar os benchmarks de equity, salário e vesting.
        </p>
        <a href="${APP_URL}/login" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          Acessar CaptableBR
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          CaptableBR é um produto da <a href="https://ellaexecutivesearch.com" style="color: #999;">Ella Executive Search</a>.
          <br>Se você não esperava este email, pode ignorá-lo.
        </p>
      </div>
    `,
  });
}

/**
 * Send approval notification to a user whose access request was approved.
 */
export async function sendApprovalEmail(email: string, name: string) {
  if (!resend) {
    console.warn("[EMAIL] Resend not configured, skipping approval email to:", email);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Seu acesso ao CaptableBR foi aprovado!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 32px;">
          <strong style="font-size: 18px;">CaptableBR</strong>
        </div>
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: #111;">
          Acesso aprovado!
        </h1>
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 24px;">
          Olá ${escapeHtml(name)}, seu perfil foi verificado e seu acesso ao CaptableBR foi aprovado.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 32px;">
          Faça login com sua conta Google para explorar os benchmarks de compensação executiva.
        </p>
        <a href="${APP_URL}/login" style="display: inline-block; background: #111; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          Acessar CaptableBR
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          CaptableBR é um produto da <a href="https://ellaexecutivesearch.com" style="color: #999;">Ella Executive Search</a>.
        </p>
      </div>
    `,
  });
}
