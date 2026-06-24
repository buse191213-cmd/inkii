"use client";

import { useState, useEffect } from "react";
import DtfEngine from "./DtfEngine";

const LABELS = {
  de: {
    title: "Eigenes Design hochladen",
    sub: "Klicken zum Hochladen oder Drag & Drop",
    hint: "Maximale Dateigröße 10 MB · PNG, JPG · KI entfernt Hintergrund automatisch",
    cta: "Design Studio öffnen →",
  },
  en: {
    title: "Upload Your Own Design",
    sub: "Click to upload or Drag & Drop",
    hint: "Maximum file size 10 MB · PNG, JPG · AI removes background automatically",
    cta: "Open Design Studio →",
  },
  tr: {
    title: "Kendi Tasarımını Yükle",
    sub: "Yüklemek için tıklayın veya Sürükle Bırak",
    hint: "Maks 10 MB · PNG, JPG · Yapay zeka arka planı otomatik kaldırır",
    cta: "Tasarım Stüdyosu Aç →",
  },
};

function getLocale(): "de" | "en" | "tr" {
  if (typeof document === "undefined") return "de";
  const match = document.cookie.match(/inkii_locale=([^;]+)/);
  const v = match?.[1];
  return (v === "en" || v === "tr" || v === "de") ? v : "de";
}

export default function DesignerLauncher({
  productName,
  productCode,
}: {
  productName: string;
  productCode?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<"de" | "en" | "tr">("de");

  useEffect(() => { setLocale(getLocale()); }, []);

  const L = LABELS[locale];

  return (
    <>
      <div
        className="dtf-launcher-card"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        aria-label={L.title}
      >
        <div className="dtf-launcher-head">
          <div className="dtf-launcher-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
          </div>
          <div className="dtf-launcher-body">
            <h3 className="dtf-launcher-title">{L.title}</h3>
            <p className="dtf-launcher-sub">{L.sub}</p>
          </div>
        </div>
        <p className="dtf-launcher-hint">{L.hint}</p>
        <span className="dtf-launcher-cta">{L.cta}</span>
      </div>

      {open && (
        <DtfEngine
          onClose={() => setOpen(false)}
          productName={productName}
          productCode={productCode}
          locale={locale}
        />
      )}
    </>
  );
}
