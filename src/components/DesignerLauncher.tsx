"use client";

import { useState, useEffect } from "react";
import DtfEngine from "./DtfEngine";

const LABELS = {
  de: {
    badge: "⚡ KI-Optimierung inklusive",
    title: "Ihr Design hochladen",
    desc: "Laden Sie Ihr Logo oder Motiv hoch und erhalten Sie sofort eine Druckvorschau.",
    feat1: "Hintergrund automatisch entfernt",
    feat2: "Kostenlose Druckdaten-Prüfung",
    feat3: "Vorschau in Sekunden",
    cta: "DESIGN HOCHLADEN",
    foot1: "PNG · JPG · SVG · PDF",
    foot2: "Max. 10 MB",
    proof: "✓ Kostenlos · ✓ Unverbindlich · ✓ Antwort in 24h",
  },
  en: {
    badge: "⚡ AI Optimization Included",
    title: "Upload Your Design",
    desc: "Upload your logo or artwork and receive an instant print preview.",
    feat1: "Background removed automatically",
    feat2: "Free print data check",
    feat3: "Preview in seconds",
    cta: "UPLOAD DESIGN",
    foot1: "PNG · JPG · SVG · PDF",
    foot2: "Max. 10 MB",
    proof: "✓ Free · ✓ No commitment · ✓ 24h response",
  },
  tr: {
    badge: "⚡ AI Optimizasyonu Dahil",
    title: "Tasarımınızı Yükleyin",
    desc: "Logonuzu veya tasarımınızı yükleyin, anında baskı önizlemesi alın.",
    feat1: "Arka plan otomatik kaldırılır",
    feat2: "Ücretsiz baskı veri kontrolü",
    feat3: "Saniyeler içinde önizleme",
    cta: "TASARIMI YÜKLE",
    foot1: "PNG · JPG · SVG · PDF",
    foot2: "Maks. 10 MB",
    proof: "✓ Ücretsiz · ✓ Bağlayıcı değil · ✓ 24 saat içinde dönüş",
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
      <div className="dtf-prem" role="button" tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(true); }}
        aria-label={L.title}
      >
        <div className="dtf-prem-badge">{L.badge}</div>
        <div className="dtf-prem-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
        </div>
        <h3 className="dtf-prem-title">{L.title}</h3>
        <p className="dtf-prem-desc">{L.desc}</p>
        <ul className="dtf-prem-features">
          <li><span className="dtf-prem-check">✓</span>{L.feat1}</li>
          <li><span className="dtf-prem-check">✓</span>{L.feat2}</li>
          <li><span className="dtf-prem-check">✓</span>{L.feat3}</li>
        </ul>
        <button
          type="button"
          className="dtf-prem-cta"
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        >
          {L.cta} <span className="dtf-prem-cta-arrow">→</span>
        </button>
        <div className="dtf-prem-proof">{L.proof}</div>
        <div className="dtf-prem-foot">
          <span>{L.foot1}</span>
          <span className="dtf-prem-foot-dot">•</span>
          <span>{L.foot2}</span>
        </div>
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
