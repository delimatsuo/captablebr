import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "CaptableBR <noreply@from.ellaexecutivesearch.com>";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Resend SDK returns { data, error } instead of throwing. Unwrap and throw on error. */
function unwrapResend(result: { data: unknown; error: unknown }): void {
  if (result.error) {
    const err = result.error as { message?: string; statusCode?: number };
    throw new Error(`Resend error ${err.statusCode || ""}: ${err.message || JSON.stringify(result.error)}`);
  }
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
      <a href="${escapeHtml(href)}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: -0.01em;">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`;
}

/**
 * Send invitation email to a new user.
 */
export async function sendInvitationEmail(email: string, name?: string) {
  if (!resend) {
    console.warn("[EMAIL] Resend not configured, skipping invitation email to:", email);
    return;
  }

  const greeting = name ? `Olá ${escapeHtml(name)},` : "Olá,";

  unwrapResend(await resend.emails.send({
    from: "Deli Matsuo — Ella Executive Search <noreply@from.ellaexecutivesearch.com>",
    replyTo: "deli@ellaexecutivesearch.com",
    to: email,
    subject: "Dados de equity em startups brasileiras — contribua e acesse benchmarks grátis",
    html: brandedEmail(`
      <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
        Ajude a construir a primeira base de dados de compensação executiva do Brasil
      </h1>

      <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        ${greeting}
      </p>
      <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Sou Deli Matsuo, sócio da <a href="https://www.ellaexecutivesearch.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">Ella Executive Search</a>, boutique de executive search especializada em startups de tecnologia entre Brasil e EUA.
      </p>
      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Nos últimos anos, assessorando executivos e fundadores em contratações C-level, percebemos um problema recorrente: <strong>não existem dados confiáveis sobre compensação executiva em startups brasileiras</strong>. Enquanto nos EUA ferramentas como Carta Total Comp e Pave já são padrão, aqui cada negociação de equity, salário e vesting acontece praticamente no escuro.
      </p>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Por isso criamos o <strong>CaptableBR</strong> — uma plataforma <strong>gratuita</strong> de benchmarks de compensação para executivos C-level, VP e diretores de startups no Brasil.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f5ff; border-radius: 10px; margin: 0 0 20px 0;">
        <tr>
          <td style="padding: 20px 24px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1e40af;">O que você ganha ao participar:</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
              <strong>→</strong> Acesso imediato a benchmarks de equity (%), salário, vesting e remuneração total<br>
              <strong>→</strong> Dados segmentados por cargo, estágio da empresa e setor<br>
              <strong>→</strong> Simulador de vesting para projetar o valor dos seus grants<br>
              <strong>→</strong> Informação concreta para suas próximas negociações
            </p>
          </td>
        </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-radius: 10px; margin: 0 0 20px 0;">
        <tr>
          <td style="padding: 20px 24px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #92400e;">O que precisamos de você:</p>
            <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #374151;">
              <strong>→</strong> Preencha seus dados de compensação — leva cerca de 3 minutos<br>
              <strong>→</strong> Todos os dados são 100% anonimizados e agregados<br>
              <strong>→</strong> Benchmarks só aparecem com 10+ respostas por segmento<br>
              <strong>→</strong> Seus dados são protegidos pela LGPD e podem ser excluídos a qualquer momento
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Seu acesso já está liberado. Clique abaixo para começar:
      </p>

      ${ctaButton(`${APP_URL}/login`, "Participar e acessar benchmarks")}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6; margin: 0 0 20px 0;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
              <strong style="color: #374151;">Dica:</strong> Use seu <strong>email pessoal</strong> para login (Gmail, Outlook, etc.) — assim seus dados ficam completamente desvinculados da sua empresa.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Quanto mais executivos contribuírem, mais relevantes ficam os benchmarks para todos. Sua participação faz diferença.
      </p>

      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Qualquer dúvida, responda este email ou me chame no WhatsApp.
      </p>

      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #374151;">
        Abraço,<br>
        <strong>Deli Matsuo</strong><br>
        <span style="color: #6b7280;">Sócio — <a href="https://www.ellaexecutivesearch.com" style="color: #6b7280; text-decoration: underline;">Ella Executive Search</a></span>
      </p>
    `),
  }));
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

  unwrapResend(await resend.emails.send({
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
  }));
}

/**
 * Send approval notification to a user whose access request was approved.
 */
export async function sendApprovalEmail(email: string, name: string) {
  if (!resend) {
    console.warn("[EMAIL] Resend not configured, skipping approval email to:", email);
    return;
  }

  unwrapResend(await resend.emails.send({
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
  }));
}

/**
 * Send password setup email for pre-registered users (non-Gmail).
 * This is sent alongside the invitation email so they can set their password.
 */
export async function sendPasswordSetupEmail(email: string, resetLink: string, name?: string) {
  if (!resend) {
    console.warn("[EMAIL] Resend not configured, skipping password setup email to:", email);
    return;
  }

  const greeting = name ? `Olá ${escapeHtml(name)},` : "Olá,";

  unwrapResend(await resend.emails.send({
    from: FROM_EMAIL,
    replyTo: "deli@ellaexecutivesearch.com",
    to: email,
    subject: "CaptableBR — Crie sua senha de acesso",
    html: brandedEmail(`
      <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
        Crie sua senha
      </h1>
      <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        ${greeting}
      </p>
      <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #374151;">
        Se você não usa Gmail, clique no botão abaixo para criar uma senha e acessar o CaptableBR com seu email.
      </p>
      ${ctaButton(resetLink, "Criar minha senha")}
      <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #9ca3af;">
        Ou copie e cole este link no navegador:
      </p>
      <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.5; color: #2563eb; word-break: break-all;">
        ${escapeHtml(resetLink)}
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #9ca3af;">
        Se você usa Gmail, ignore este email — basta fazer login com Google.
      </p>
    `),
  }));
}
