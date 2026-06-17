"use client";

import { useState, useEffect } from "react";
import DtfEngine from "./DtfEngine";

const LABELS = {
  de: "Eigenes Design hochladen",
  en: "Upload Your Own Design",
  tr: "Kendi Tasarımını Yükle",
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

  const label = LABELS[locale];

  return (
    <>
      <button
        type="button"
        className="dtf-launcher-btn"
        onClick={() => setOpen(true)}
        aria-label={label}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <path d="M17 8l-5-5-5 5"/>
          <path d="M12 3v12"/>
        </svg>
        <span>{label}</span>
      </button>

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
