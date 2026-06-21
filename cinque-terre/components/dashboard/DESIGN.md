# Dashboard shell — design spec (Lane G)

A stilrent, calm desktop dashboard **frame** for the customer↔skipper
chat (Lane A) and the admin/skipper inbox (Lane C). The shell owns the
outer layout only; each lane fills the content area with its own UI.

## Layout

```
┌──────┬──────────────────────────────┐
│ chat │                              │
│      │                              │
│      │        content area          │
│      │      (children, empty by     │
│      │         default)             │
│ prof │                              │
└──────┴──────────────────────────────┘
  72px            flex: 1
```

- **Closed (narrow) left sidebar — `.dash__sidebar`, 72px.**
  Chat icon pinned to the **top**, profile icon pinned to the **bottom**
  (`justify-content: space-between`), nothing in between. One hairline
  right seam (`border-right`) — the single structural edge the system
  allows; everything else separates by air.
- **Large content area — `.dash__content`, `flex: 1`.** Clean solid cream,
  scrolls on overflow. Empty by default (`.dash__empty`).
- Full-height (`100dvh`), desktop-first. Not responsive-collapsed yet —
  add a mobile breakpoint when a lane needs one.

## Tokens (scoped to `.dash`, mirror the site fasit)

| Token | Value | Use |
|---|---|---|
| `--cream` | `#f7f1e3` | content surface |
| `--cream-2` | `#efe7d3` | sidebar (a half-step deeper) |
| `--ink` | `#07182a` | text |
| `--ink-82/55/12` | ink at 82/55/12% | body / muted / hairline |
| `--gold` | `#c8862e` | hover + active accent |
| `--terracotta` | `#a8743f` | eyebrows / labels |
| `--s1..--s7` | 4·8·12·16·24·32·48 | 4px spacing scale |
| `--t-xs..--t-xl` | 11→28px | 1.2 type scale |
| `--r` | `0` | sharp corners everywhere |

Fonts come from the **global** `app/layout.js` `<link>` (Fraunces,
Limelight, Great Vibes) — no extra font loading here. `.dash` sets
Fraunces as the base family.

## Components

- **`DashboardShell.js`** — the frame. Props (all optional):
  `active` (`"chat"`|`"profile"`), `onChat()`, `onProfile()`, `children`.
  Renders the sidebar + content area; sets the body background to cream
  while mounted and restores it on unmount (so the dark landing body
  never bleeds at the edges). Imports `dashboard.css`.
- **`DashboardSidebar.js`** — the closed sidebar (chat top / profile
  bottom). Same `active` / `onChat` / `onProfile` props.
- **`Icons.js`** — `ChatIcon`, `ProfileIcon`: thin stroke line-art
  (`fill:none; stroke:currentColor`), colour + size from CSS.

All are `"use client"` (they take click handlers).

## How chat (A) and admin (C) reuse it

```jsx
import DashboardShell from "@/components/dashboard/DashboardShell";

// Chat (Lane A)
<DashboardShell active="chat" onProfile={openProfile}>
  <ChatThread code={code} />
</DashboardShell>

// Admin / skipper (Lane C)
<DashboardShell active="chat" onProfile={openProfile}>
  <SkipperInbox />
</DashboardShell>
```

- Build content inside `.dash` so the scoped tokens (`var(--s4)`,
  `var(--gold)`, …) are in scope; wrap padded content in `.dash__pad`
  or set your own.
- Keep the rules: solid cream surfaces, sharp corners, 4px spacing,
  Fraunces text / Great Vibes for script links, separation by air.
- Need a third destination later? Add an icon to `Icons.js` and a button
  to `DashboardSidebar.js` — the sidebar stays "closed", icons only.

## Open questions (for Krin / integration, Lane F)

1. Sidebar currently has only chat + profile (per the brief). If admin
   needs more destinations (e.g. inbox vs. settings), confirm whether it
   stays icon-only or gains a thin label-on-hover.
2. No expanded/open sidebar state was requested — should there be a
   conversation list that slides out, or does the content area host that?
3. Mobile: the brief is desktop-only. A collapse-to-top-bar breakpoint
   can be added when chat/admin land on phones.
