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
 * Shared branded email shell — blue header with CaptableBR logo, white card body, footer.
 */
function brandedEmail(body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 36px; height: 36px; background-color: rgba(255,255,255,0.2); border-radius: 10px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-weight: 700; font-size: 16px; line-height: 36px;">C</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: -0.02em;">CaptableBR</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 32px 40px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 24px 0 0 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
                CaptableBR — Benchmarks de compensação para executivos C-level
                <br>Um produto da <a href="https://ellaexecutivesearch.com" style="color: #9ca3af; text-decoration: underline;">Ella Executive Search</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
  <tr>
    <td style="background-color: #2563eb; border-radius: 10px;">
      <a href="${href}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: -0.01em;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

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
    html: brandedEmail(`
      <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
        Você foi convidado!
      </h1>
      <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
        Você recebeu acesso à plataforma CaptableBR — benchmarks de compensação para executivos C-level de startups brasileiras.
      </p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
        Faça login com sua conta Google para começar a explorar os benchmarks de equity, salário e vesting.
      </p>
      ${ctaButton(`${APP_URL}/login`, "Acessar CaptableBR")}
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #9ca3af;">
        Se você não esperava este email, pode ignorá-lo.
      </p>
    `),
  });
}

/**
 * Send email verification link for signup (replaces Firebase's default email).
 * Branded HTML with CaptableBR identity.
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  if (!resend) {
    console.warn("[EMAIL] Resend not configured, skipping verification email to:", email);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "CaptableBR — Verifique seu email",
    html: brandedEmail(`
      <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
        Verifique seu email
      </h1>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
        Clique no botão abaixo para confirmar seu email e continuar o cadastro no CaptableBR.
      </p>
      ${ctaButton(verificationUrl, "Verificar email e continuar")}
      <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #9ca3af;">
        Ou copie e cole este link no navegador:
      </p>
      <p style="margin: 0 0 32px 0; font-size: 12px; line-height: 1.5; color: #2563eb; word-break: break-all;">
        ${escapeHtml(verificationUrl)}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6b7280;">
              Este link expira em <strong style="color: #374151;">1 hora</strong>. Se você não solicitou esta verificação, pode ignorar este email.
            </p>
          </td>
        </tr>
      </table>
    `),
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
    html: brandedEmail(`
      <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
        Acesso aprovado!
      </h1>
      <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
        Olá ${escapeHtml(name)}, seu perfil foi verificado e seu acesso ao CaptableBR foi aprovado.
      </p>
      <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #6b7280;">
        Faça login com sua conta Google para explorar os benchmarks de compensação executiva.
      </p>
      ${ctaButton(`${APP_URL}/login`, "Acessar CaptableBR")}
    `),
  });
}
