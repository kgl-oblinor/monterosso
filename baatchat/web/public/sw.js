/* Monterosso — minimal, safe service worker.
 *
 * Goal: make the app installable + give an offline-capable shell. It caches ONLY the
 * static app shell (HTML/JS/CSS/icons/fonts) on this origin. It never touches the API
 * (which lives on a separate origin) and never caches non-GET or cross-origin requests.
 *
 * Strategy:
 *   - navigations  → network-first, fall back to cached shell ('/') when offline (SPA).
 *   - static asset → stale-while-revalidate (fast, self-healing on new deploys).
 * Vite emits content-hashed asset filenames, so cached assets are immutable and safe.
 */
const CACHE = "monterosso-shell-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only handle same-origin GET. Everything else (API, POST, cross-origin) is untouched.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // SPA navigations: try the network, fall back to the cached shell when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html").then((r) => r || caches.match("/")))
    );
    return;
  }

  // Static assets: serve from cache immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
