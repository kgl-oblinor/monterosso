// Admin broadcast email (Phase 4). Lets an admin compose a rich-text message and send it
// to a chosen audience: loaners who hold at least one loan, investors who have actually
// invested (≥1 order), both, or a hand-picked set. Reuses the SendGrid sender + the
// branded Oblinor email shell (see email.ts). Each recipient gets their OWN email
// (one SendGrid "personalization" per address) so addresses are never exposed to others.

import type { Env } from "./index";

// --- audience -> recipients --------------------------------------------------
// "loaner with a loan"   = EXISTS a row in loans for that loaner
// "investor who invested" = EXISTS an order for that user
// Empty/null emails are filtered out at the SQL layer.

export type Audience = "loaners" | "investors" | "all" | "selected";

export interface Recipient {
  id: number;
  type: "loaner" | "investor";
  name: string | null;
  email: string;
}

const HAS_LOAN = `EXISTS (SELECT 1 FROM loans WHERE loaner_id = ln.loaner_id)`;
const HAS_ORDER = `EXISTS (SELECT 1 FROM orders WHERE user_id = iv.user_id)`;
const VALID_LOANER_EMAIL = `ln.email IS NOT NULL AND trim(ln.email) <> ''`;
const VALID_INVESTOR_EMAIL = `iv.email IS NOT NULL AND trim(iv.email) <> ''`;

async function loanerRecipients(env: Env): Promise<Recipient[]> {
  const { results } = await env.DB.prepare(
    `SELECT ln.loaner_id AS id, ln.company_name AS name, ln.email AS email
       FROM loaners ln
      WHERE ${HAS_LOAN} AND ${VALID_LOANER_EMAIL}`
  ).all<{ id: number; name: string | null; email: string }>();
  return (results ?? []).map((r) => ({ id: r.id, type: "loaner", name: r.name, email: r.email }));
}

async function investorRecipients(env: Env): Promise<Recipient[]> {
  const { results } = await env.DB.prepare(
    `SELECT iv.user_id AS id, iv.name AS name, iv.email AS email
       FROM investors iv
      WHERE ${HAS_ORDER} AND ${VALID_INVESTOR_EMAIL}`
  ).all<{ id: number; name: string | null; email: string }>();
  return (results ?? []).map((r) => ({ id: r.id, type: "investor", name: r.name, email: r.email }));
}

/** Resolve the full recipient list for a broadcast. For "selected", pass the chosen ids. */
export async function resolveRecipients(
  env: Env,
  audience: Audience,
  selected?: { loaners?: number[]; investors?: number[] }
): Promise<Recipient[]> {
  let list: Recipient[] = [];
  if (audience === "loaners" || audience === "all") list = list.concat(await loanerRecipients(env));
  if (audience === "investors" || audience === "all")
    list = list.concat(await investorRecipients(env));
  if (audience === "selected") {
    const wantL = new Set(selected?.loaners ?? []);
    const wantI = new Set(selected?.investors ?? []);
    if (wantL.size) list = list.concat((await loanerRecipients(env)).filter((r) => wantL.has(r.id)));
    if (wantI.size)
      list = list.concat((await investorRecipients(env)).filter((r) => wantI.has(r.id)));
  }
  // Dedupe by lowercased email (a person could appear in both pools).
  const seen = new Set<string>();
  return list.filter((r) => {
    const key = r.email.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Count only (cheap) — used by the UI to show "will send to N" before composing. */
export async function audienceCount(env: Env, audience: Audience): Promise<number> {
  if (audience === "loaners" || audience === "investors") {
    const sql =
      audience === "loaners"
        ? `SELECT count(*) AS n FROM loaners ln WHERE ${HAS_LOAN} AND ${VALID_LOANER_EMAIL}`
        : `SELECT count(*) AS n FROM investors iv WHERE ${HAS_ORDER} AND ${VALID_INVESTOR_EMAIL}`;
    const row = await env.DB.prepare(sql).first<{ n: number }>();
    return Number(row?.n ?? 0);
  }
  // "all" — dedupe matters, so resolve and count distinct emails.
  return (await resolveRecipients(env, "all")).length;
}

/** Searchable, paginated recipient picker for the "specific recipients" mode. */
export async function listRecipients(
  env: Env,
  opts: { group: "loaners" | "investors"; search?: string; limit: number; offset: number }
): Promise<{ recipients: Recipient[]; total: number }> {
  const term = (opts.search ?? "").trim().toLowerCase();
  const like = `%${term}%`;

  if (opts.group === "loaners") {
    const where = `WHERE ${HAS_LOAN} AND ${VALID_LOANER_EMAIL}${
      term ? ` AND (lower(ln.company_name) LIKE ? OR lower(ln.email) LIKE ? OR lower(ln.org_number) LIKE ?)` : ``
    }`;
    const countStmt = term
      ? env.DB.prepare(`SELECT count(*) AS n FROM loaners ln ${where}`).bind(like, like, like)
      : env.DB.prepare(`SELECT count(*) AS n FROM loaners ln ${where}`);
    const total = Number((await countStmt.first<{ n: number }>())?.n ?? 0);

    const sql = `SELECT ln.loaner_id AS id, ln.company_name AS name, ln.email AS email
                   FROM loaners ln ${where} ORDER BY ln.company_name LIMIT ? OFFSET ?`;
    const stmt = term
      ? env.DB.prepare(sql).bind(like, like, like, opts.limit, opts.offset)
      : env.DB.prepare(sql).bind(opts.limit, opts.offset);
    const { results } = await stmt.all<{ id: number; name: string | null; email: string }>();
    return {
      total,
      recipients: (results ?? []).map((r) => ({ id: r.id, type: "loaner", name: r.name, email: r.email })),
    };
  }

  const where = `WHERE ${HAS_ORDER} AND ${VALID_INVESTOR_EMAIL}${
    term ? ` AND (lower(iv.name) LIKE ? OR lower(iv.email) LIKE ?)` : ``
  }`;
  const countStmt = term
    ? env.DB.prepare(`SELECT count(*) AS n FROM investors iv ${where}`).bind(like, like)
    : env.DB.prepare(`SELECT count(*) AS n FROM investors iv ${where}`);
  const total = Number((await countStmt.first<{ n: number }>())?.n ?? 0);

  const sql = `SELECT iv.user_id AS id, iv.name AS name, iv.email AS email
                 FROM investors iv ${where} ORDER BY iv.name LIMIT ? OFFSET ?`;
  const stmt = term
    ? env.DB.prepare(sql).bind(like, like, opts.limit, opts.offset)
    : env.DB.prepare(sql).bind(opts.limit, opts.offset);
  const { results } = await stmt.all<{ id: number; name: string | null; email: string }>();
  return {
    total,
    recipients: (results ?? []).map((r) => ({ id: r.id, type: "investor", name: r.name, email: r.email })),
  };
}

// --- drafts ------------------------------------------------------------------
// Save/reload a composed broadcast (subject + body + chosen audience/recipients). No
// scheduling — that needs a cron trigger and is deferred.

export interface DraftSummary {
  id: number;
  subject: string;
  audience: string;
  updatedAt: string;
}

export interface DraftFull extends DraftSummary {
  html: string;
  selected: unknown;
}

export async function saveDraft(
  env: Env,
  d: { id?: number; subject: string; html: string; audience: string; selected?: unknown }
): Promise<number> {
  const selectedJson = d.selected ? JSON.stringify(d.selected) : null;
  if (d.id) {
    await env.DB.prepare(
      `UPDATE email_drafts SET subject=?, html=?, audience=?, selected_json=?, updated_at=datetime('now') WHERE id=?`
    )
      .bind(d.subject, d.html, d.audience, selectedJson, d.id)
      .run();
    return d.id;
  }
  const row = await env.DB.prepare(
    `INSERT INTO email_drafts (subject, html, audience, selected_json) VALUES (?, ?, ?, ?) RETURNING id`
  )
    .bind(d.subject, d.html, d.audience, selectedJson)
    .first<{ id: number }>();
  return row!.id;
}

export async function listDrafts(env: Env): Promise<DraftSummary[]> {
  const { results } = await env.DB.prepare(
    `SELECT id, subject, audience, updated_at AS updatedAt FROM email_drafts ORDER BY updated_at DESC`
  ).all<DraftSummary>();
  return results ?? [];
}

export async function getDraft(env: Env, id: number): Promise<DraftFull | null> {
  const r = await env.DB.prepare(
    `SELECT id, subject, html, audience, selected_json, updated_at AS updatedAt FROM email_drafts WHERE id=?`
  )
    .bind(id)
    .first<{ id: number; subject: string; html: string; audience: string; selected_json: string | null; updatedAt: string }>();
  if (!r) return null;
  return {
    id: r.id,
    subject: r.subject,
    html: r.html,
    audience: r.audience,
    updatedAt: r.updatedAt,
    selected: r.selected_json ? JSON.parse(r.selected_json) : null,
  };
}

export async function deleteDraft(env: Env, id: number): Promise<boolean> {
  const r = await env.DB.prepare(`DELETE FROM email_drafts WHERE id=?`).bind(id).run();
  return (r.meta?.changes ?? 0) > 0;
}

// --- HTML shell --------------------------------------------------------------
// Wrap the admin's rich-text content in the same branded card used for OTP emails so
// every broadcast looks like an official Oblinor email (logo header + signed footer).

const TEAL = "#2A666D";
const NAVY = "#1f4a50";
const MUTED = "#5b6b70";
const LOGO = "https://chat.oblinor.no/oblinor-logo-color.png";

/** Strip tags for a plain-text fallback part (keeps line breaks readable). */
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Branded wrapper. `inner` is the admin's sanitized rich-text HTML. */
export function wrapHtml(subject: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="no" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eef1f2;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f2;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;box-shadow:0 1px 4px rgba(19,53,67,0.08);">
          <tr>
            <td align="center" style="padding:34px 24px 10px;">
              <img src="${LOGO}" width="190" height="48" alt="Oblinor" style="display:block;border:0;outline:none;text-decoration:none;width:190px;height:48px;">
            </td>
          </tr>
          <tr>
            <td style="padding:14px 36px 8px;color:${NAVY};font-size:15px;line-height:1.6;">
              <div style="color:#243b3f;font-size:15px;line-height:1.6;">${inner}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 0;">
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

// Word-count limits, enforced server-side too so the UI can't be bypassed.
export const SUBJECT_MIN_WORDS = 3;
export const SUBJECT_MAX_WORDS = 100;
export const BODY_MIN_WORDS = 5;
export const BODY_MAX_WORDS = 1000;

export function countWords(text: string): number {
  const t = text.replace(/\s+/g, " ").trim();
  return t ? t.split(" ").length : 0;
}

/** Validate subject/body word counts. Returns an error message, or null when valid. */
export function validateWordLimits(subject: string, html: string): string | null {
  const subjectWords = countWords(subject);
  if (subjectWords < SUBJECT_MIN_WORDS) return `Emne må ha minst ${SUBJECT_MIN_WORDS} ord`;
  if (subjectWords > SUBJECT_MAX_WORDS) return `Emne kan ha maks ${SUBJECT_MAX_WORDS} ord`;
  const bodyWords = countWords(html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " "));
  if (bodyWords < BODY_MIN_WORDS) return `Innhold må ha minst ${BODY_MIN_WORDS} ord`;
  if (bodyWords > BODY_MAX_WORDS) return `Innhold kan ha maks ${BODY_MAX_WORDS} ord`;
  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- send --------------------------------------------------------------------
// SendGrid allows up to 1000 personalizations per request; we chunk smaller to stay
// well under request-size limits and the Worker subrequest cap. One content body is
// shared; each personalization is a separate recipient (separate email).

const CHUNK = 800;

export interface SendResult {
  sent: number;
  failed: number;
  recipients: number;
  errors: string[];
}

export async function sendBroadcast(
  env: Env,
  opts: { subject: string; html: string; emails: string[] }
): Promise<SendResult> {
  if (!env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set");
  const subject = opts.subject.trim();
  if (!subject) throw new Error("subject required");

  const wrapped = wrapHtml(subject, opts.html);
  const text = htmlToText(opts.html);
  const result: SendResult = { sent: 0, failed: 0, recipients: opts.emails.length, errors: [] };

  for (let i = 0; i < opts.emails.length; i += CHUNK) {
    const chunk = opts.emails.slice(i, i + CHUNK);
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: chunk.map((email) => ({ to: [{ email }] })),
        from: { email: env.SENDGRID_FROM, name: "Oblinor" },
        subject,
        content: [
          { type: "text/plain", value: text },
          { type: "text/html", value: wrapped },
        ],
      }),
    });
    if (res.ok) {
      result.sent += chunk.length;
    } else {
      result.failed += chunk.length;
      result.errors.push(`${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
  }
  return result;
}
