// Transactional email via SendGrid (used for the account-verification one-time code).
// Needs SENDGRID_API_KEY (secret) + EMAIL_FROM (a verified sender address) + PLATFORM_NAME.
//
// This is NOT a login code — login is email + password. It's a one-time "engangskode" sent
// to prove ownership of the on-file email when onboarding (claiming) an account.

import type { Env } from "./index";

// Neutral, configurable palette (no hardcoded brand). Tunable per platform later if needed.
const ACCENT = "#2A666D"; // accent + code
const HEADING = "#1f4a50";
const MUTED = "#5b6b70";

function textVersion(env: Env, code: string): string {
  const platform = env.PLATFORM_NAME || "chat";
  return (
    `Din engangskode er ${code}\n\n` +
    `Bruk koden for å bekrefte e-posten din og fullføre registreringen i ${platform}.\n` +
    `Koden er gyldig i 10 minutter. Har du ikke bedt om den, kan du se bort fra denne e-posten.\n\n` +
    `Med vennlig hilsen\n${platform}\n\n` +
    (env.SUPPORT_EMAIL ? `Kontakt: ${env.SUPPORT_EMAIL}\n` : "")
  );
}

// Table-based HTML so it renders consistently across mail clients. All styles inline.
function htmlVersion(env: Env, code: string): string {
  const platform = escapeHtml(env.PLATFORM_NAME || "chat");
  const support = env.SUPPORT_EMAIL
    ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:${MUTED};text-align:center;">
         <a href="mailto:${escapeHtml(env.SUPPORT_EMAIL)}" style="color:${ACCENT};text-decoration:none;">${escapeHtml(env.SUPPORT_EMAIL)}</a>
       </p>`
    : "";
  return `<!DOCTYPE html>
<html lang="no" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Din engangskode</title>
</head>
<body style="margin:0;padding:0;background:#eef1f2;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Din engangskode er ${code} – gyldig i 10 minutter.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f2;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-shadow:0 1px 4px rgba(19,53,67,0.08);">
          <tr>
            <td align="center" style="padding:30px 32px 0;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:${HEADING};font-weight:600;">Bekreft e-posten din</h1>
              <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:${MUTED};">Bruk engangskoden under for å bekrefte kontoen din i ${platform}.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 24px 4px;">
              <div style="display:inline-block;background:#f3f7f8;border:1px solid #dbe7ea;border-radius:10px;padding:16px 28px;">
                <span style="font-size:34px;letter-spacing:10px;font-weight:700;color:${ACCENT};font-family:'SF Mono',Menlo,Consolas,monospace;">${code}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 32px 8px;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:${MUTED};">Koden er gyldig i 10 minutter. Har du ikke bedt om den, kan du trygt se bort fra denne e-posten.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;">
              <div style="border-top:1px solid #e6ebec;"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 32px 32px;text-align:center;">
              <p style="margin:0;font-size:14px;color:${HEADING};">Med vennlig hilsen</p>
              <p style="margin:6px 0 0;font-size:15px;font-weight:600;color:${HEADING};">${platform}</p>
              ${support}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendOtpEmail(env: Env, to: string, code: string): Promise<void> {
  if (!env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set");

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: env.EMAIL_FROM, name: env.PLATFORM_NAME || "chat" },
      subject: `Din engangskode til ${env.PLATFORM_NAME || "chat"}`,
      content: [
        // Order matters: text/plain first, then text/html (richest last) per RFC 2046.
        { type: "text/plain", value: textVersion(env, code) },
        { type: "text/html", value: htmlVersion(env, code) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`sendgrid ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}
