/**
 * INKII Works — Service Worker (minimal)
 *
 * WICHTIG: Bewusst KEIN Caching von CSS/JS/HTML.
 * Next.js ändert bei jedem Deploy die Asset-Hashes; ein cache-first
 * Service Worker liefert dann alte Styles/Skripte zu neuem HTML →
 * kaputtes Layout, falsche Bilder, langsame Seiten.
 *
 * Dieser SW existiert nur, damit die Seite als PWA installierbar ist.
 * Alle Requests gehen direkt ans Netzwerk (Browser-Cache greift weiterhin).
 */

const CACHE = "inkii-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Alle alten Caches löschen (auch die kaputten aus v1)
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Kein fetch-Handler mit Caching → Netzwerk entscheidet, immer aktuell.
