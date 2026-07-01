# STORE-PUBLISH — shipping Monterosso to the App Store + Google Play

The dashboard app (`baatchat/web`, deployed as the Cloudflare Worker `monterosso-app`)
is now an installable **PWA**: it has a web manifest, a minimal service worker (app-shell
caching only), maskable icons and Apple home-screen metas. Users can already "install" it
from the **Get the app** link in the dashboard rail (Android → Chrome install prompt;
iOS → Share → Add to Home Screen).

This doc is the path to also publishing **native store listings** wrapping that same PWA.
No submission has been made yet — this is the runbook.

---

## Recommended approach: PWABuilder (wrap the live PWA)

Because the app is already a solid PWA, the lowest-effort route is
[**PWABuilder**](https://www.pwabuilder.com/) — point it at the deployed URL and it
generates ready-to-submit shells:

- **Android** → a **Trusted Web Activity (TWA)** `.aab` bundle. The native shell just
  renders the live site full-screen (needs a Digital Asset Links file, see below).
- **iOS** → an Xcode project wrapping the PWA in a `WKWebView`. Apple requires the app
  to be built/signed in Xcode and submitted from a Mac.

**Alternative: Capacitor** (`@capacitor/core` + `ios`/`android` platforms). Use this only
if we later need native APIs (push, camera, biometrics, in-app purchase). It bundles the
web build into a native container instead of loading the live URL. Heavier to maintain —
skip it until a native capability is actually required.

> Decision: start with **PWABuilder/TWA** for Android and the PWABuilder iOS wrapper.
> Migrate to Capacitor only when a native feature forces it.

---

## Assets needed (gather before either store)

Current placeholder icons are a **gold "M" monogram on ink** (`baatchat/web/public/icon.svg`
→ generated PNGs). They are production-usable but generic — **commission real brand art**
before launch (ideally an anchor/wave mark consistent with the landing).

| Asset | Spec | Status |
|---|---|---|
| App icon (source) | 1024×1024 PNG, no alpha, no rounded corners | ⚠️ placeholder monogram |
| Maskable icon | 512×512, content in center 80% safe zone | ✅ `maskable-512.png` (placeholder) |
| Manifest icons | 192 + 512 PNG + SVG | ✅ generated |
| iOS App Store icon | 1024×1024 | ⚠️ derive from real 1024 art |
| Splash screens | iOS launch images / Android 12 splash | ❌ to create |
| Screenshots | iOS: 6.7" + 5.5" + iPad; Android: phone + tablet, ≥2 each | ❌ to capture |
| Feature graphic (Play) | 1024×500 | ❌ to create |
| Privacy policy URL | public page | ❌ **required by both stores** |
| Store listing copy | name, subtitle, description, keywords (EN + IT) | ❌ to write |
| Support URL / contact | e.g. kgl@oblinor.no | ✅ available |

---

## iOS App Store — steps

1. Enroll in the **Apple Developer Program** ($99/yr) → App Store Connect access.
2. In PWABuilder, generate the **iOS package**; open it in **Xcode** (Mac required).
3. Set bundle id (e.g. `no.oblinor.monterosso`), version, and the 1024 icon.
4. Create the app record in **App Store Connect**; fill listing, privacy details
   ("App Privacy" questionnaire), and upload screenshots.
5. Archive & upload the build via Xcode → submit for **TestFlight**, then **Review**.
6. ⚠️ Apple rejects thin web wrappers under **Guideline 4.2** ("minimum functionality").
   Mitigate: ensure it works offline (service worker ✅), feels app-like (standalone ✅,
   no browser chrome), and ideally add at least one native touch (e.g. push or share).

## Google Play — steps

1. Create a **Google Play Console** account (one-time $25).
2. In PWABuilder, generate the **Android/TWA** package → download the `.aab` + the
   `assetlinks.json` it produces.
3. Host `assetlinks.json` at **`https://<app-domain>/.well-known/assetlinks.json`**
   (serve it from the Cloudflare Worker) so the TWA opens without a URL bar. Paste the
   SHA-256 signing-key fingerprint from Play Console into that file.
4. Create the app in Play Console, complete **Data safety** + content rating forms,
   upload store listing, screenshots, feature graphic, and privacy policy URL.
5. Upload the `.aab`, roll out to **internal testing** → **production**.

---

## Pre-submission checklist

- [ ] Real brand icon (1024) + regenerate the icon set + maskable safe zone
- [ ] Splash/launch screens
- [ ] Screenshots for every required device size (EN + IT)
- [ ] Public **privacy policy** page live
- [ ] Store listing copy (name, subtitle, description, keywords) EN + IT
- [ ] Android: `assetlinks.json` served at `/.well-known/` with the Play signing fingerprint
- [ ] iOS: bundle id, signing cert, provisioning profile; passes Guideline 4.2 smell test
- [ ] Verify installed PWA launches standalone + works offline (already true locally)

---

## What already exists in the repo (PWA foundation)

- `baatchat/web/public/manifest.webmanifest` — name/short_name, `display: standalone`,
  theme/background `#fffefc`, icon set incl. maskable.
- `baatchat/web/public/sw.js` — minimal service worker: caches the app shell only
  (never the API, never non-GET/cross-origin); network-first navigations, SWR for assets.
- `baatchat/web/public/icon.svg` + `icon-192/512`, `maskable-512`, `apple-touch-icon` PNGs
  (**placeholder monogram — replace with real art**).
- `baatchat/web/index.html` — manifest link, apple-touch-icon, theme-color + apple/mobile
  web-app metas, and service-worker registration.
- `baatchat/web/src/features/dashboard/components/GetAppDialog.tsx` — the in-app
  "Get the app" sheet (Android install prompt / iOS instructions / coming-soon store badges).
