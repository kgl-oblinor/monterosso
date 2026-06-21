# RESEARCH-UX — Monterosso boat platform

Best-practice UX research, translated into **our** design system (cream `#f7f1e3`, ink `#07182a`,
gold `#ead27e` primary CTA, terracotta `#a8743f`; gold "ticket", radius 0, 4px spacing, calm
forward verbs). Audience: older, non-technical tourist on mobile. Every principle below is a rule
we can follow, with a source.

---

## 1. Button placement — mobile-first

1. **Primary CTA = full-width gold ticket, pinned to the bottom (sticky), always at the same y.**
   Bottom is reached fastest (eye ends scan at bottom) AND is closest to the thumb. Make it
   full-width rather than bottom-right — bottom-right is a "red thumb zone" on big phones for
   one-handed use. Source: [UX Movement — Optimal CTA placement](https://uxmovement.com/mobile/optimal-placement-for-mobile-call-to-action-buttons/)
2. **One primary CTA per screen.** A screen must have exactly one gold ticket so it's unmistakably
   *the* action. Everything else is secondary/tertiary. Source: [Carbon Design System — Button usage](https://v10.carbondesignsystem.com/components/button/usage/)
3. **Sticky bottom CTA on long pages** so the tourist can act without scrolling back. Re-state the
   same gold ticket above-the-fold AND sticky at bottom (same words, same color). Source:
   [LandingPageFlow — CTA placement 2026](https://www.landingpageflow.com/post/best-cta-placement-strategies-for-landing-pages)
4. **Minimum touch target 44×44 px** (our ticket is full-width so width is fine; enforce ≥44px
   height + 4px-grid padding). Same minimum for back/nav taps. Source:
   [LandingMetrics — Mobile CTA ease](https://www.landingmetrics.com/metrics/mobile-cta-interaction-ease)
5. **If a secondary action sits next to the primary, stack it ABOVE the ticket** (vertical), not
   beside it — neutral/ghost on top, gold ticket on bottom. Source: [UX Movement (above)](https://uxmovement.com/mobile/optimal-placement-for-mobile-call-to-action-buttons/)

## 2. Button hierarchy & type

1. **Three tiers, mapped to our system:** primary = **solid gold ticket** (the one action);
   secondary = **ghost** (ink outline, transparent fill, ink text); tertiary = **script link**
   (Great Vibes, underline-on-hover). Source: [SubUX — Button hierarchy](https://subux.pro/guides/article/button-hierarchy-primary-secondary-tertiary)
2. **Exactly one high-emphasis (gold) button visible at a time.** A single high-emphasis button
   makes all others read as lower priority. Source: [Carbon Design System](https://v10.carbondesignsystem.com/components/button/usage/)
3. **Never put two solid buttons side by side, and don't mix all three tiers in one group.**
   With 3+ actions, demote extras to ghost/link so the gold ticket stays alone. Source:
   [SubUX — Button hierarchy](https://subux.pro/guides/article/button-hierarchy-primary-secondary-tertiary)
4. **Ghost = destructive/alternative path** (e.g. "Not now", "Change date"); **script link =
   low-stakes navigation** (e.g. "Read the captain's note"). Keep ghost soft so it never competes
   with gold. Source: [LogRocket — Ghost buttons](https://blog.logrocket.com/ux-design/using-ghost-buttons-effective-ctas/)
5. **Calm forward verbs only** ("Continue", "Explore", "Reserve our day") — never "BOOK NOW!".
   Consistent verb = consistent meaning (see §5). Source: project design system.

## 3. Color & contrast for CTAs (load-bearing — measured for our exact hex)

1. **Gold ticket MUST use ink text, never cream/white.** Measured: gold `#ead27e` + ink `#07182a`
   = **11.95:1** (passes AAA). Gold + cream = **1.33:1**, gold + white = **1.5:1** — both FAIL
   badly and are unreadable for older eyes. Rule: **gold background ⇒ ink label, always.**
   Source: [WCAG 1.4.3 Contrast (Minimum), 4.5:1](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html); ratios computed via [WCAG formula](https://webaim.org/articles/contrast/).
2. **The gold ticket needs a definition edge against cream.** Gold vs cream page = only **1.33:1**,
   well under the 3:1 needed for UI-component boundaries — so a gold button on a cream page nearly
   disappears. Give the ticket a **1–2px ink border** (or sit it on an ink footer bar) so its shape
   is visible. Source: [WCAG 1.4.11 Non-text Contrast, 3:1](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)
3. **Body text = ink on cream (15.89:1, AAA).** Use ink-on-cream for all reading content; it's our
   most legible pair and ideal for an older audience. Source: [WCAG formula / WebAIM](https://webaim.org/articles/contrast/)
4. **Terracotta is a TEXT-on-dark / accent color, not a CTA fill for small text.** Terracotta
   `#a8743f` + cream = **3.56:1**: passes large-text (3:1) and non-text (3:1), FAILS normal body
   text (needs 4.5:1). Use terracotta only for large headings/accents or as a fill behind cream
   text at ≥18.66px bold / 24px regular. Source: [WCAG 1.4.3 large-text exception](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
5. **Signal "the one action" by color scarcity:** gold appears ONLY on the primary CTA, nowhere
   else. If gold is also decorative, the CTA loses its "this is the thing to tap" signal. Reserve
   gold for the ticket. Source: [DesignStudio — CTA best practices](https://www.designstudiouiux.com/blog/cta-button-design-best-practices/)

## 4. Navigation logic (landing + many subpages, and dashboard)

1. **Hub-and-spoke: landing is the hub; every subpage links cleanly back to it.** The site logo
   (top-left) is the universal "home" — a long-standing convention users already expect. Keep it
   in the same spot on every page. Source: [NN/G — Consistency & Standards](https://www.nngroup.com/articles/consistency-and-standards/)
2. **Breadcrumbs reflect HIERARCHY, not history**, placed at the top below the header. Use them once
   the site is ≥3 levels deep; skip them for flat 1–2-level sections. The current page is the last
   crumb and is **not clickable**. Source: [NN/G — Breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/)
3. **Breadcrumbs supplement, never replace, primary nav.** Keep a persistent global header/footer
   for the main paths; breadcrumbs only aid wayfinding for people who deep-linked in. On mobile,
   show only the last 1–2 levels to save space; tap targets ≥1cm. Source: [NN/G — Breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/)
4. **Always indicate the current section** in the nav — 95% of sites fail this. Highlight the active
   page so the tourist always knows "where am I". Source: [NN/G — Breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/)
5. **Dashboard: collapsible sidebar, icon+label expanded / icon+tooltip collapsed, ≤5–7 top items.**
   Persist the collapse state across sessions; 200–300ms ease transition. The ink-dark sidebar
   differentiates it from cream content. Source: [ALF Design — Sidebar UX 2026](https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps)
6. **Dashboard primary action lives in a fixed header slot** (one gold "Continue"/"New trip"
   ticket), separate from the sidebar — same y, every dashboard view. Source:
   [ALF Design — Sidebar UX](https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps)

## 5. Consistency principles

1. **Same action = same place, same color, same word, everywhere.** Functional cornerstones (the
   primary CTA, back, home) must live in fixed positions across all screens. Source:
   [NN/G — Consistency & Standards (Heuristic #4)](https://www.nngroup.com/articles/consistency-and-standards/)
2. **Jakob's Law — match conventions users already know.** Logo top-left = home; one accent color =
   the action; underlined/colored text = a link. Don't invent novel patterns for an older audience.
   Source: [NN/G — Jakob's Law / 10 Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
3. **One label per concept.** "Continue" everywhere — never "Continue" on one page and "Next"/
   "Proceed" elsewhere. Inconsistent wording is "extremely confusing for users". Source:
   [IxDF — Consistency & Standards](https://ixdf.org/literature/article/principle-of-consistency-and-standards-in-user-interface-design)
4. **Internal + external consistency.** Internal: a component (the gold ticket) looks/behaves
   identically across landing and dashboard. External: follow web norms (sticky bottom CTA,
   breadcrumbs, top-left logo) so prior knowledge transfers. Source:
   [NN/G — Consistency & Standards](https://www.nngroup.com/articles/consistency-and-standards/)

---

### The 8 rules we should adopt first
1. **Gold ticket = ink text, always** (11.95:1; cream/white on gold fails at ~1.3:1).
2. **One gold CTA per screen**, full-width, **sticky at the bottom, same y** everywhere.
3. **Give the gold ticket a 1px ink border** so it's visible on cream (gold-on-cream is 1.33:1).
4. **Three tiers only:** solid gold (primary) → ghost ink (secondary) → script link (tertiary);
   never two solids side by side.
5. **Reserve gold exclusively for the primary action** — color scarcity = the "tap me" signal.
6. **Logo top-left = home on every page; highlight the current section.**
7. **Breadcrumbs by hierarchy, top of page, last crumb non-clickable, supplement (not replace) nav.**
8. **Same action = same place + same color + same word**, landing and dashboard alike (Jakob's Law).
