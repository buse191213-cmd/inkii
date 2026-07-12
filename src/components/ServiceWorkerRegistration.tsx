"use client";

import { useEffect } from "react";

/**
 * Registriert den Service Worker (PWA-Installation).
 * Läuft nur im Browser, nur in Produktion, und blockiert nichts.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Im Dev-Modus nicht registrieren (stört HMR)
    if (window.location.hostname === "localhost") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] Service Worker konnte nicht registriert werden:", err);
      });
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
