"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "inkii-cookie-consent-v1";

/**
 * Google Analytics 4 — DSGVO-konform.
 *
 * Lädt GA NUR, wenn der Nutzer im Cookie-Banner "Analyse" akzeptiert hat.
 * Ohne Einwilligung wird kein Skript geladen und kein Cookie gesetzt.
 *
 * Die Messung-ID kommt aus NEXT_PUBLIC_GA_ID (Vercel Environment Variable).
 * Ist sie nicht gesetzt, passiert nichts — die Seite läuft normal weiter.
 */
export default function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    function readConsent() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return setAllowed(false);
        const parsed = JSON.parse(raw);
        setAllowed(Boolean(parsed?.analytics));
      } catch {
        setAllowed(false);
      }
    }

    readConsent();

    // Nutzer ändert Einstellungen im Banner → sofort reagieren
    window.addEventListener("storage", readConsent);
    window.addEventListener("inkii-cookie-consent-changed", readConsent);
    return () => {
      window.removeEventListener("storage", readConsent);
      window.removeEventListener("inkii-cookie-consent-changed", readConsent);
    };
  }, []);

  if (!gaId || !allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Lax;Secure'
          });
        `}
      </Script>
    </>
  );
}
