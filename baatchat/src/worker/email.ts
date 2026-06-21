// Transactional email via SendGrid (used for the account-verification one-time code).
// Needs SENDGRID_API_KEY (secret) + SENDGRID_FROM (a verified sender address).
//
// NOTE: this code is NOT a login code — login is email + password. It's a one-time
// "engangskode" sent to prove ownership of the on-file email when claiming/registering
// an account or resetting a password. Copy below reflects that.

import type { Env } from "./index";

// Oblinor brand
const TEAL = "#2A666D"; // brand teal (matches logo) — accent + code
const NAVY = "#1f4a50"; // headings (slightly darker teal)
const MUTED = "#5b6b70"; // secondary text
// Full color logo (chevron + OBLINOR wordmark), rasterized from Color_1.svg and hosted
// on our own Pages domain so email clients (which don't render SVG) can show it.
const LOGO = "https://chat.oblinor.no/oblinor-logo-color.png"; // 1440x364 (ratio ~3.96)

const SUBJECT = "Din engangskode til Oblinor-chat";

function textVersion(code: string): string {
  return (
    `Din engangskode er ${code}\n\n` +
    `Bruk koden for å bekrefte e-posten din og fullføre registreringen i Oblinor-chat.\n` +
    `Koden er gyldig i 10 minutter. Har du ikke bedt om den, kan du se bort fra denne e-posten.\n\n` +
    `Med vennlig hilsen\nOblinor\n\n` +
    `Oblinor AS | C. J. Hambros plass 2D, 0164 Oslo\n` +
    `post@oblinor.no | oblinor.no | 920 52 000`
  );
}

// Table-based HTML so it renders consistently across Gmail/Outlook/Apple Mail on both
// mobile and desktop. All styles inline; a single fluid card maxes out at 480px.
function htmlVersion(code: string): string {
  return `<!DOCTYPE html>
<html lang="no" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f2;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Din engangskode er ${code} – gyldig i 10 minutter.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f2;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-shadow:0 1px 4px rgba(19,53,67,0.08);">
          <tr>
            <td align="center" style="padding:34px 24px 6px;">
              <img src="${LOGO}" width="190" height="48" alt="Oblinor" style="display:block;border:0;outline:none;text-decoration:none;width:190px;height:48px;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 32px 0;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:${NAVY};font-weight:600;">Bekreft e-posten din</h1>
              <p style="margin:10px 0 0;font-size:15px;line-height:1.55;color:${MUTED};">Bruk engangskoden under for å bekrefte kontoen din i Oblinor-chat.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:22px 24px 4px;">
              <div style="display:inline-block;background:#f3f7f8;border:1px solid #dbe7ea;border-radius:10px;padding:16px 28px;">
                <span style="font-size:34px;letter-spacing:10px;font-weight:700;color:${TEAL};font-family:'SF Mono',Menlo,Consolas,monospace;">${code}</span>
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
              <p style="margin:0 0 12px;font-size:14px;color:${NAVY};">Med vennlig hilsen</p>
              <img src="${LOGO}" width="150" height="38" alt="Oblinor" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;width:150px;height:38px;">
              <p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:${MUTED};text-align:center;">
                Oblinor AS &nbsp;|&nbsp; C. J. Hambros plass 2D, 0164 Oslo<br>
                <a href="mailto:post@oblinor.no" style="color:${TEAL};text-decoration:none;">post@oblinor.no</a> &nbsp;|&nbsp;
                <a href="https://oblinor.no" style="color:${TEAL};text-decoration:none;">oblinor.no</a> &nbsp;|&nbsp;
                <a href="tel:+4792052000" style="color:${TEAL};text-decoration:none;">920 52 000</a>
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
      from: { email: env.SENDGRID_FROM, name: "Oblinor" },
      subject: SUBJECT,
      content: [
        // Order matters: text/plain first, then text/html (richest last) per RFC 2046.
        { type: "text/plain", value: textVersion(code) },
        { type: "text/html", value: htmlVersion(code) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`sendgrid ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}
