/**
 * INKII Works — Service Worker
 * Minimal: ermöglicht PWA-Installation und cached statische Assets.
 * Bewusst KEIN aggressives Caching von HTML/API — Shop-Daten (Preise,
 * Warenkorb, Bestellungen) müssen immer aktuell sein.
 */

const CACHE = "inkii-static-v1";

// Nur statische, unveränderliche Assets vorab cachen
const PRECACHE = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Nur GET, nur same-origin
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API / Server Actions / Admin niemals cachen — immer Netzwerk
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/kasse") ||
    url.pathname.startsWith("/konto") ||
    url.pathname.startsWith("/warenkorb")
  ) {
    return;
  }

  // Statische Assets: cache-first
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|jpe?g|svg|webp|gif|ico|woff2?|ttf|css|js)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
  }
  // HTML/Seiten: kein Caching → immer frisch (Preise, Lager, Warenkorb)
});
