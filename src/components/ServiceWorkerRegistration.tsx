"use client";

import { useEffect } from "react";

/**
 * Service Worker für PWA-Installierbarkeit.
 *
 * Der SW cached bewusst NICHTS (siehe public/sw.js) — bei Next.js führt
 * cache-first zu kaputtem Layout nach jedem Deploy (alte CSS/JS zu neuem HTML).
 *
 * Zusätzlich: alte Caches (v1) werden hier aktiv gelöscht, damit Nutzer,
 * die den kaputten SW schon installiert haben, wieder eine korrekte Seite sehen.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname === "localhost") return;

    // 1) Alte Caches sofort leeren (repariert bereits betroffene Geräte)
    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((k) => caches.delete(k));
      }).catch(() => {});
    }

    // 2) SW registrieren/aktualisieren
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          // Sofort nach Updates suchen — verhindert veraltete Versionen
          reg.update().catch(() => {});
        })
        .catch(() => {});
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
