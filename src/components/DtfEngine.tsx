"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMerkliste } from "./MerklisteProvider";

type OrderData = {
  type: string;
  designUrl?: string;
  vectorUrl?: string;
  reportUrl?: string;
  productName?: string;
  productCode?: string;
  order?: {
    products: {
      name: string;
      qty: number;
      printPosition?: string;
      printSizeCm?: number;
      recommendedRange?: string;
      designerLogoCm?: string;
      placement?: { topPct: number; leftPct: number; widthPct: number };
    }[];
    totalQty: number;
    position: string;
    width: string;
    height: string;
    textileColor: string;
    deadline: string;
    note: string;
  };
  printSizeCm?: { width: number; height: number };
  quality?: number | null;
};

// Mail format çevirileri (Merkliste'ye ürün eklenirken note alanına yazılır)
const MAIL_LABELS = {
  de: {
    title: "📨 EIGENES DTF-DESIGN",
    position: "Druckposition",
    width: "Druckbreite",
    recommended: "Empfohlen",
    designerSize: "Designer-Größe",
    designerPos: "Designer-Position",
    fromLeft: "von links",
    fromTop: "von oben",
    deadline: "Liefertermin",
    note: "Bemerkung",
    filesHeader: "── DATEIEN ──",
    designPng: "Design (PNG)",
    vectorSvg: "Vektor (SVG)",
    reportPdf: "Bericht (PDF)",
    quality: "KI-Qualität",
    itemPrefix: "Eigenes DTF-Design",
    closeLabel: "Schließen",
  },
  en: {
    title: "📨 CUSTOM DTF DESIGN",
    position: "Print Position",
    width: "Print Width",
    recommended: "Recommended",
    designerSize: "Designer Size",
    designerPos: "Designer Position",
    fromLeft: "from left",
    fromTop: "from top",
    deadline: "Delivery Date",
    note: "Note",
    filesHeader: "── FILES ──",
    designPng: "Design (PNG)",
    vectorSvg: "Vector (SVG)",
    reportPdf: "Report (PDF)",
    quality: "AI Quality",
    itemPrefix: "Custom DTF Design",
    closeLabel: "Close",
  },
  tr: {
    title: "📨 ÖZEL DTF TASARIMI",
    position: "Baskı Konumu",
    width: "Baskı Genişliği",
    recommended: "Önerilen",
    designerSize: "Tasarımcı Boyutu",
    designerPos: "Tasarımcı Konumu",
    fromLeft: "soldan",
    fromTop: "üstten",
    deadline: "Teslim Tarihi",
    note: "Not",
    filesHeader: "── DOSYALAR ──",
    designPng: "Tasarım (PNG)",
    vectorSvg: "Vektör (SVG)",
    reportPdf: "Rapor (PDF)",
    quality: "AI Kalite",
    itemPrefix: "Özel DTF Tasarımı",
    closeLabel: "Kapat",
  },
};

export default function DtfEngine({
  onClose,
  productName,
  productCode,
  locale = "de",
}: {
  onClose: () => void;
  productName?: string;
  productCode?: string | null;
  locale?: "de" | "en" | "tr";
}) {
  const router = useRouter();
  const { addOrUpdate } = useMerkliste();
  const L = MAIL_LABELS[locale];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data as OrderData;
      if (!d || d.type !== "dtf-anfrage" || !d.order) return;

      const ts = Date.now();
      for (const p of d.order.products) {
        const noteLines: string[] = [];
        noteLines.push(L.title);
        if (p.printPosition) noteLines.push(`${L.position}: ${p.printPosition}`);
        if (p.printSizeCm) {
          noteLines.push(`${L.width}: ${p.printSizeCm} cm${p.recommendedRange ? ` (${L.recommended}: ${p.recommendedRange})` : ""}`);
        }
        if (p.designerLogoCm) noteLines.push(`${L.designerSize}: ${p.designerLogoCm} cm`);
        if (p.placement) {
          noteLines.push(`${L.designerPos}: ${p.placement.leftPct}% ${L.fromLeft}, ${p.placement.topPct}% ${L.fromTop}`);
        }
        if (d.order!.deadline && d.order!.deadline !== "—") noteLines.push(`${L.deadline}: ${d.order!.deadline}`);
        if (d.order!.note && d.order!.note !== "—") noteLines.push(`${L.note}: ${d.order!.note}`);
        noteLines.push("");
        noteLines.push(L.filesHeader);
        if (d.designUrl) noteLines.push(`${L.designPng}: ${d.designUrl}`);
        if (d.vectorUrl) noteLines.push(`${L.vectorSvg}: ${d.vectorUrl}`);
        if (d.reportUrl) noteLines.push(`${L.reportPdf}: ${d.reportUrl}`);
        if (d.quality) noteLines.push(`${L.quality}: ${d.quality}/100`);

        addOrUpdate({
          id: `dtf-${ts}-${p.name.toLowerCase().replace(/[^a-z]/g, "")}`,
          code: `DTF-${ts}`,
          name: `${L.itemPrefix} — ${p.name}`,
          image: d.designUrl || null,
          qty: p.qty,
          note: noteLines.join("\n"),
          color: null,
          colorLabel: d.order!.textileColor && d.order!.textileColor !== "—" ? d.order!.textileColor : null,
        });
      }

      onClose();
      router.push("/merkzettel");
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [productName, productCode, onClose, router, addOrUpdate, L]);

  // iframe src'e lang param geçir — HTML lang lookup kullanır
  const params = new URLSearchParams();
  if (productName) params.set("product", productName);
  if (productCode) params.set("code", productCode);
  params.set("lang", locale);
  const iframeSrc = `/dtf-engine/index.html?${params.toString()}`;

  return (
    <div className="dtf-overlay">
      <div className="dtf-modal">
        <button
          className="dtf-close"
          onClick={onClose}
          aria-label={L.closeLabel}
          title={L.closeLabel}
        >
          ✕
        </button>
        <iframe
          src={iframeSrc}
          title="DTF-Engine"
          className="dtf-iframe"
        />
      </div>
    </div>
  );
}
