# RESEARCH-GLASS — Monterosso glass + photo-background layer

Cited best-practice research for the **new design layer** Kristian added: transparent glass popups,
a selectable background (1 animated day/night scene + several full-screen photo backgrounds), and the
rule that opening the booking popup hides everything living and shows only the still background behind
the glass. Every principle is translated into **our** system:

> cream `#f7f1e3`, ink `#07182a`, gold `#ead27e` (primary CTA, **always ink text** — gold+cream = 1.33:1),
> terracotta `#a8743f`, Fraunces / Limelight / Great Vibes, radius 0, 4px spacing, 1.2 scale.

Carries forward from `RESEARCH-UX.md`: gold CTA = ink label, one gold CTA per screen, sticky bottom on mobile.

---

## 1. Glassmorphism done right (blur, transparency, stroke)

1. **Blur 10–20px for normal glass; push to ≥40–100px when the background is busy** (our animated scene
   or a detailed photo). NN/g: a 25px blur over intricate content still leaves "distinguishable edges"
   that fight the text; 100px makes background elements "blend together" so the panel reads as one calm
   surface. Rule: **glass over a photo/animated scene uses 40px+ blur; glass over a near-solid still
   background can use ~16px.** Source: [NN/g — Glassmorphism](https://www.nngroup.com/articles/glassmorphism/)
2. **Fill opacity 10–40%, tuned to backdrop brightness.** Stay near the low end (10–20%) only over a
   simple/still background; raise toward 30–40% over a busy or high-contrast photo. Our glass is built
   on **cream-tinted** translucency (`rgba(247,241,227, …)`) in light scenes and **ink-tinted**
   (`rgba(7,24,42, …)`) over dark/night photos, so the glass adapts like real colored glass instead of
   washing out. Source: [UX Pilot — Glassmorphism best practices](https://uxpilot.ai/blogs/glassmorphism-ui), [NN/g](https://www.nngroup.com/articles/glassmorphism/)
3. **A 1px stroke is non-negotiable — it defines the glass edge for low-vision users.** With radius 0,
   our panels are sharp rectangles; give them a hairline **1px border** (warm-white `rgba(255,255,255,.35)`
   on dark backdrops, ink `rgba(7,24,42,.18)` on light) so the pane's shape never disappears into the
   photo. Source: [Axess Lab — Glassmorphism & accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/), [UX Pilot](https://uxpilot.ai/blogs/glassmorphism-ui)
4. **Stabilize text contrast with a semi-opaque color *behind the text*, not by killing translucency
   everywhere.** Layer a ~20–30% tint beneath the text block inside the glass so body copy hits 4.5:1
   regardless of what photo sits behind. This keeps the pane translucent while the *reading zone* stays
   solid enough. Source: [Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/), [New Target — Glassmorphism with accessibility](https://www.newtarget.com/web-insights-blog/glassmorphism/)
5. **Test every glass surface in BOTH light and dark scenes.** Transparency, blur, shadow and tint all
   shift with the backdrop; a pane that reads in the day scene can wash out at night. Since our backgrounds
   are user-switchable, **the same popup must be verified over every shipped background.** Source: [Figr — Glassmorphism guide](https://figr.design/blog/glassmorphism-0e8b1)
6. **Provide a solid fallback + respect Reduce Transparency.** Browsers without `backdrop-filter`, and
   users with the OS "Reduce Transparency" setting, must get a **solid cream (light) / solid ink (dark)
   panel** — same layout, no blur. This is also our graceful-degradation path on weak GPUs. Source: [Apple HIG materials accessibility, via designedforhumans](https://designedforhumans.tech/blog/liquid-glass-smart-or-bad-for-accessibility), [Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)

## 2. Apple "Liquid Glass" / materials principles (the heavyweight reference)

1. **Content-first: the background serves the foreground, never competes.** Liquid Glass is built so
   underlying content "shines through" while subtle top-to-bottom light-to-dark gradients keep foreground
   text legible. Our glass should feel like a lens over Monterosso, not a frosted wall. Source: [LogRocket — Adopting Liquid Glass](https://blog.logrocket.com/ux-design/adopting-liquid-glass-examples-best-practices/)
2. **Glass on ONE layer only — never stack glass on glass.** Reserve the effect for "the most important
   functional elements." For us: the **booking popup is the glass surface**; cards, nav and toggles
   behind it should NOT also be glass at the same moment. Source: [LogRocket](https://blog.logrocket.com/ux-design/adopting-liquid-glass-examples-best-practices/)
3. **Use the clear/transparent variant ONLY over bold, bright, media-rich content that survives dimming;
   otherwise use the more opaque ("regular") variant.** Translated: over a calm photo we can go more
   transparent; over a low-contrast or pale photo, fall back to a more opaque cream/ink glass so text
   stays readable. Source: [LogRocket](https://blog.logrocket.com/ux-design/adopting-liquid-glass-examples-best-practices/)
4. **The system tints the glass from the brightness underneath — and that improves contrast.** Mirror
   this: our glass tint follows the active background (cream-tint over light, ink-tint over dark) rather
   than a single fixed transparency. Source: [Wikipedia — Liquid Glass](https://en.wikipedia.org/wiki/Liquid_Glass), [createwithswift — Liquid Glass](https://www.createwithswift.com/liquid-glass-redefining-design-through-hierarchy-harmony-and-consistency/)
5. **Minimum 4.5:1 text contrast *after* the blur/tint is applied** — measure the rendered result, not
   the source colors. Apple bakes lighting/shaders specifically to keep on-glass text legible. Source: [designedforhumans — Liquid Glass accessibility](https://designedforhumans.tech/blog/liquid-glass-smart-or-bad-for-accessibility)

## 3. Text + button legibility OVER a photo background (scrim technique)

1. **Add a scrim — a semi-transparent overlay between photo and content — as the default for any text
   over a photo.** It "instantly quiets the background and creates a consistent, high-contrast surface."
   For our hero text directly on a photo (outside the glass), this is mandatory. Source: [Smashing — Accessible text over images (Part 1)](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/), [NN/g — Text over images](https://www.nngroup.com/articles/text-over-images/)
2. **Concrete scrim opacities: ~30–50% black for light text, ~20–30% white for dark text.** NN/g raised a
   black scrim from 30%→50% to reach contrast. Since our hero text is **ink**, prefer a **cream/white
   scrim (20–30%)** OR a localized cream plate behind the ink text; reserve dark scrims for cream-text
   moments. Source: [NN/g — Text over images](https://www.nngroup.com/articles/text-over-images/), [Smashing Part 1](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/)
3. **Prefer a gradient scrim ("floor fade") at the bottom edge** rather than dimming the whole photo —
   it preserves the image while guaranteeing contrast exactly where the sticky gold CTA and caption live.
   "The lower portion of photos tends to lend itself well to added effects." Source: [NN/g — Text over images](https://www.nngroup.com/articles/text-over-images/)
4. **Measure at the worst pixel, both extremes.** WCAG gives no formula for text-over-image, so test the
   lowest-contrast spot and verify against BOTH a bright and a dark photo in the switcher. Use a contrast
   analyzer on the *rendered* output. Source: [WebAIM — Contrast](https://webaim.org/articles/contrast/), [NN/g](https://www.nngroup.com/articles/text-over-images/)
5. **The gold CTA keeps its rule everywhere: gold fill + ink label (11.95:1).** Over a photo the *gold
   shape itself* must stay defined — keep its 1px ink border and sit it on the bottom scrib/glass so the
   gold-on-photo edge never falls below 3:1. Source: [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html), [RESEARCH-UX §3]
6. **Place text in the calm region of the photo when you can ("copy space")** — choosing low-detail crops
   reduces how much scrim you need and keeps the image feeling premium, not muddy. Source: [Smashing Part 1](https://www.smashingmagazine.com/2023/08/designing-accessible-text-over-images-part1/)

## 4. Selectable-background (toggle) UX

1. **Keep the switcher discreet and OUT of the hero — a small labeled `<button>`/icon, not a banner.**
   Use a real `<button>` for focusability and keyboard events; never decorate the hero with it. A corner
   control (e.g. bottom-left, opposite the sticky gold CTA) keeps the hero clean. Source: [web.dev — Theme switch component](https://web.dev/articles/building/a-theme-switch-component), [Inclusive Components — Theme switcher](https://inclusive-components.design/a-theme-switcher/)
2. **Persist the choice in `localStorage` and restore it on return; offer an "auto" that follows the
   day/night scene.** Permanent memory of the last pick is the expected behavior; allow resetting to auto
   so the living day/night scene can resume. Source: [aleksandrhovhannisyan — Perfect theme switch](https://www.aleksandrhovhannisyan.com/blog/the-perfect-theme-switch/), [Dylan Smith — UX of dark mode toggles](https://dylanatsmith.com/wrote/the-ux-of-dark-mode-toggles)
3. **Set the chosen background BEFORE paint with a tiny blocking script in `<head>`** so there's no flash
   of the wrong scene/photo on load. Source: [web.dev](https://web.dev/articles/building/a-theme-switch-component), [Aleksandr Hovhannisyan](https://www.aleksandrhovhannisyan.com/blog/the-perfect-theme-switch/)
4. **Show options as visual thumbnails, with the current one clearly marked.** Backgrounds are visual;
   a small popover of labeled preview swatches (with the active state indicated, per RESEARCH-UX §4.4
   "always indicate current") beats a text dropdown. Source: [Inclusive Components — Theme switcher](https://inclusive-components.design/a-theme-switcher/)
5. **A background switch must not move or restyle the UI — only the layer behind the glass changes.**
   Glass tint/scrim re-tune automatically (see §1.2, §2.4), but layout, type and the gold CTA stay put,
   honoring "same action, same place" (RESEARCH-UX §5). Source: [NN/g — Consistency & Standards](https://www.nngroup.com/articles/consistency-and-standards/)

## 5. "Subtle / quiet / elegant" design (restraint without being boring)

1. **One accent color carries the action — ours is gold, and only the primary CTA.** A 2–3 color palette
   with a single accent reads as elegant and makes the CTA unmistakable; gold used decoratively would
   kill the signal (already our rule). Source: [Creatype — Minimalist UI principles](https://creatypestudio.co/principle-of-minimalist-ui-design/), [RESEARCH-UX §3.5]
2. **Generous whitespace is the elegance, not ornament.** "Whitespace creates a sense of elegance and
   sophistication" and builds hierarchy. With radius 0 + 4px grid, lean on *space and the 1.2 type scale*
   for richness rather than borders, shadows or extra color. Source: [Virtualspirit — Whitespace guide](https://virtualspirit.me/insights/307/minimalist-ui-ux-design-a-guide-on-how-to-use-whitespace), [Mockflow — Minimalism](https://mockflow.com/blog/minimalism-ui-design)
3. **Motion discipline: animation should *hint and guide*, never demand attention.** "Subtle animations
   can replace labels and hint at next steps without clutter." Our living day/night scene must stay
   slow/ambient; reserve crisp micro-interactions for confirming taps. Respect Reduce Motion. Source: [Creatype](https://creatypestudio.co/principle-of-minimalist-ui-design/), [Mockflow](https://mockflow.com/blog/minimalism-ui-design)
4. **Clear visual hierarchy through size/weight/position, not decoration.** Strategically vary element
   size and prominence to guide the eye — our 1.2 scale + Fraunces weights do this; don't add boxes to
   create importance. Source: [Mockflow — Minimalism](https://mockflow.com/blog/minimalism-ui-design)
5. **The line between "elegant calm" and "boring" is intentional contrast + one moment of expression.**
   Modern minimalism is "balance between restraint and richness": keep 95% quiet, then let ONE thing
   sing — the living scene, the script (Great Vibes) link, or the gold ticket. The line to "overpvyntet"
   is crossed when more than one thing competes for that role. Source: [Times of Design — New rules of minimalist UI 2025](https://timesofdesign.com/the-new-rules-of-minimalist-ui-what-works-in-2025/), [Artversion — Minimal design](https://artversion.com/blog/minimal-design-and-clean-ui-the-modern-approach-to-enhancing-user-experience/)

## 6. Image performance (our hero photos are ~3 MB PNG — far too heavy)

1. **Stop shipping PNG for photos. "PNG is wrong for heroes unless transparency is involved."** Convert
   the full-screen backgrounds to **AVIF (with a WebP fallback)** via `<picture>`. AVIF is ~50% smaller
   than JPEG; WebP ~25–34% smaller, 97%+ support. Source: [CodeAva — WebP vs AVIF vs PNG vs JPEG 2026](https://www.codeava.com/blog/webp-vs-avif-vs-png-vs-jpeg), [corewebvitals.io — Fix slow hero images](https://www.corewebvitals.io/pagespeed/fix-slow-hero-images-core-web-vitals)
2. **Target ≤100 KB on mobile, ≤200 KB on desktop for the hero/background image** (from ~3 MB — a 95%+
   cut). Quality 75–80 is visually indistinguishable from 100. Source: [corewebvitals.io](https://www.corewebvitals.io/pagespeed/fix-slow-hero-images-core-web-vitals), [bulkaudits — Improve LCP](https://www.bulkaudits.com/blog/how-to-improve-lcp)
3. **Serve responsive sizes — never push desktop-res photos to phones.** Use `srcset`/`sizes` (or
   `image-set` for CSS backgrounds) so a phone downloads a phone-width image, not the 2400px master.
   Source: [corewebvitals.io](https://www.corewebvitals.io/pagespeed/fix-slow-hero-images-core-web-vitals), [Savvy — CSS image-set](https://savvy.co.il/en/blog/css/css-image-set-smart-fallbacks/)
4. **The above-the-fold background is the LCP element: load it eager + `fetchpriority="high"` and preload
   ONLY it.** Never lazy-load the hero; preload the single LCP variant (not both AVIF and WebP) and let
   the CDN negotiate via `Accept` + `Vary: Accept`. Saves 200–500ms LCP. Source: [corewebvitals.io](https://www.corewebvitals.io/pagespeed/fix-slow-hero-images-core-web-vitals), [bulkaudits](https://www.bulkaudits.com/blog/how-to-improve-lcp)
5. **Switcher photos that are NOT the initial background should be lazy/on-demand**, and ideally
   preloaded only on switcher-hover so we don't pay for every photo on first paint. Source: [bulkaudits — Improve LCP](https://www.bulkaudits.com/blog/how-to-improve-lcp)
6. **The animated day/night scene should be CSS/SVG/canvas, not a heavy video/GIF** where possible, and
   must pause/freeze when the booking popup opens (our rule) — which also frees the GPU the blur needs.
   Source: [corewebvitals.io](https://www.corewebvitals.io/pagespeed/fix-slow-hero-images-core-web-vitals)

---

## The 10 rules to adopt first

1. **Blur scales with backdrop: ≥40px over photos/animation, ~16px over a still simple background.**
2. **Glass fill 10–40% opacity, tinted by scene** — cream-tint over light, ink-tint over dark.
3. **Every glass pane gets a 1px hairline stroke** (radius 0 makes the edge critical for low vision).
4. **Put a 20–30% tint behind the text block inside the glass** so body copy stays ≥4.5:1 over any photo.
5. **Glass on one layer only** — when the booking popup opens it is THE glass; everything else is still/flat.
6. **Hero text over a bare photo needs a scrim** (cream 20–30% for ink text), preferably a bottom floor-fade.
7. **Gold CTA = ink label + 1px ink border, always**, even on glass/photo (11.95:1; gold+cream = 1.33:1).
8. **Background switcher = discreet corner `<button>`, thumbnail picker, persisted in localStorage + auto.**
9. **One accent (gold), heavy whitespace, disciplined ambient motion** — 95% quiet, one thing sings.
10. **Hero photos → AVIF+WebP `<picture>`, ≤100KB mobile, responsive `srcset`, eager + `fetchpriority=high`,
    preload only the LCP image.** (Down from ~3MB PNG.)

## The 3 collisions between "glass over photo" and "legibility / elegance" — and the fix

1. **Transparency vs. contrast.** The more see-through and beautiful the glass, the more a busy photo
   bleeds through and drops text below 4.5:1. **Fix:** decouple the two — keep the *pane* translucent but
   put a 20–30% scene-matched tint ONLY behind the text block, and raise blur to ≥40px over photos so the
   backdrop becomes a soft wash, not detail. (§1.4, §1.1, §3.2)
2. **A user-switchable background breaks any single fixed glass styling.** A glass + scrim tuned for the
   day scene washes out on a bright photo or a night scene — and the user controls which is active.
   **Fix:** make tint + scrim + blur *adapt to the active background* (cream-tint/dark-scrim logic), set
   the background pre-paint to avoid flash, and treat "verify the popup over EVERY shipped background" as
   a release gate. (§1.5, §2.3, §2.4, §4.3)
3. **"Beautiful glass + living scene + photos" pulls toward over-decoration and toward heavy/slow.**
   Multiple translucent layers and a 3MB animated hero fight the "quiet, elegant" goal and tank LCP.
   **Fix:** glass on one layer only, one accent (gold) and heavy whitespace instead of more effects,
   ambient (not attention-seeking) motion that *freezes when the popup opens* — which also frees the GPU
   for the blur — and AVIF/WebP photos at ≤100KB mobile. Elegance comes from restraint + performance,
   not more layers. (§2.2, §5.1, §5.3, §5.5, §6)
