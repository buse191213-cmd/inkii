"use client";

import { useState, useEffect } from "react";
import DtfEngine from "./DtfEngine";

const LABELS = {
  de: {
    title: "Ihr Design hochladen",
    hint: "KI-Optimierung · Vorschau in Sekunden",
  },
  en: {
    title: "Upload Your Design",
    hint: "AI optimization · Preview in seconds",
  },
  tr: {
    title: "Tasarımınızı Yükleyin",
    hint: "AI optimizasyonu · Anında önizleme",
  },
};

function getLocale(): "de" | "en" | "tr" {
  if (typeof document === "undefined") return "de";
  const match = document.cookie.match(/inkii_locale=([^;]+)/);
  const v = match?.[1];
  return (v === "en" || v === "tr" || v === "de") ? v : "de";
}

export default function FooterDesignLink() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<"de" | "en" | "tr">("de");

  useEffect(() => { setLocale(getLocale()); }, []);

  const L = LABELS[locale];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="foot-design-link"
        aria-label={L.title}
      >
        <span className="fdl-icon" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <path d="M17 8l-5-5-5 5"/>
            <path d="M12 3v12"/>
          </svg>
        </span>
        <span className="fdl-text">
          <span className="fdl-title">{L.title}</span>
          <span className="fdl-hint">{L.hint}</span>
        </span>
        <span className="fdl-arrow" aria-hidden>→</span>
      </button>

      {open && (
        <DtfEngine
          onClose={() => setOpen(false)}
          productName="Individuelles Design"
          productCode={null}
          locale={locale}
        />
      )}
    </>
  );
}
