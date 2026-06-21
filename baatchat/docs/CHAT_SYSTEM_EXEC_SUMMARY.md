# Loaner ↔ Investor Chat — Executive Summary

*One-page overview · 2026-06-15 · full detail in `CHAT_SYSTEM_PLAN.md`*

---

## What we're building

A private messaging feature that lets an **investor (långiver)** talk directly to a **loaner (låntaker)** — e.g. Veien Hjem Trondheim AS and its investors. Each investor gets a **private 1-to-1 conversation** with the loaner; investors never see each other. **Built entirely on Cloudflare.**

## Why it matters

- **Closer investor relationships** — investors can ask the project owner questions directly, in one place.
- **Trust & transparency** — communication is on the record, not scattered across personal email.
- **Compliance built in** — Oblinor can read and moderate every conversation (watchdog).
- **One modern platform** — frontend, backend, database, and live chat all run on Cloudflare: fast worldwide, low cost, little to maintain.

## The rules — automatic, not manual

| Rule | How it's guaranteed |
|---|---|
| Only investors who **actually invested** in a loaner can message them | Enforced from the investment (order) data we sync — no one can start a chat they're not entitled to |
| Conversations are **private** between each investor and the loaner | Separate thread per investor; investors can't see each other |
| A loaner is a **team** — several contacts share one inbox | Flexible; we can add or remove contact persons anytime |
| **Oblinor admins** can read & moderate everything | Watchdog access, with a full audit trail |

## The big picture

```
   Invested in this loaner?
   ┌─────────────┐
   │  Investor A │──┐
   │  Investor B │──┼──▶ [ private 1-to-1 chat ] ──▶ Loaner team
   │  …          │──┘                                 (one shared inbox)
   └─────────────┘
   ┌─────────────┐
   │  Investor X │····▶ ✗ BLOCKED  (never invested → no chat)
   └─────────────┘
            ▲
            │   👁  Oblinor admin watchdog — reads & can moderate everything
```

## Everything runs on Cloudflare

```
[ Cloudflare ]  Web app  →  Backend API  →  Live-chat engine
                                  │                 │
                                  └──▶  Database  ◀─┘
                Scheduled sync ──pulls only what we need──▶ Oblinor (source of truth)
```

We **reuse our existing Oblinor system as the master record** and copy only a **small, specific slice** of data (loaners, loans, investments, and the investors who invested). Oblinor stays the single source of truth — we never change it.

## Technology

| Layer | Technology |
|---|---|
| **Frontend** (the web app) | **React + Vite**, TypeScript, Tailwind — hosted on **Cloudflare Pages** |
| **Backend** (API & login) | **Cloudflare Workers** (Hono), TypeScript |
| **Chat delivery** | v1: the app **checks for new messages** every few seconds (no extra service, **free**). Instant "live" delivery can be added later (Cloudflare Durable Objects), still free. |
| **Database** | **Cloudflare D1** |
| **Login** | Email one-time code (no passwords), sent via **SendGrid** |
| **Data sync** | A scheduled **Cloudflare Worker** pulls the minimal data from Oblinor |

All one language (TypeScript) end-to-end, all one platform (Cloudflare). **v1 runs entirely on Cloudflare's free plan — €0/month** (apart from your domain and email sending).

## Only the data we need

```
Oblinor  ──sync──▶  Cloudflare
  Loaner   → id, org no, company, contact, email, phone, address
  Investor → id, name, email
  Loan     → id, amount, address, security
  Order    → id, loan, investor, shares, amount
  (nothing else — no documents, no full user base, no extra detail)
```

Privacy-friendly, small, and fast. If we need more later, we add it on purpose.

## Rollout — incremental, low-risk

1. Sync the minimal data + wire up the permission rules (who can talk to whom).
2. Secure email-code login.
3. Core messaging (send / receive / history).
4. Live, instant delivery.
5. Polished, mobile-friendly interface.
6. Hardening, moderation tools, compliance.

## Decisions still needed from leadership

- **Data retention / GDPR:** how long we keep messages, and how we disclose that admins can read them.
- **Attachments:** should investors/loaners share files in version 1?
- **Notifications:** email or push alerts when a message arrives while offline?

---

*Recommendation: approve Stage 1–2 (data sync + login) to validate the approach quickly, then review before building the full interface.*
