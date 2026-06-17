"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
      logoCm?: string;
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

export default function DtfEngine({
  onClose,
  productName,
  productCode,
}: {
  onClose: () => void;
  productName?: string;
  productCode?: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data as OrderData;
      if (!d || d.type !== "dtf-anfrage") return;

      // Kontakt mesajını oluştur
      const lines: string[] = [];
      lines.push(`📨 EIGENES DTF-DESIGN ANGEFORDERT`);
      if (productName) lines.push(`Ausgangsprodukt: ${productName}${productCode ? ` (${productCode})` : ""}`);

      if (d.order) {
        lines.push("");
        lines.push("── PRODUKTE & PLATZIERUNG ──");
        for (const p of d.order.products) {
          lines.push(`• ${p.name}: ${p.qty} Stück`);
          if (p.logoCm) {
            lines.push(`   Breite (im Designer): ${p.logoCm} cm`);
          }
          if (p.placement) {
            lines.push(`   Position: ${p.placement.leftPct}% von links, ${p.placement.topPct}% von oben`);
          }
        }
        lines.push(`GESAMT: ${d.order.totalQty} Stück`);
        lines.push("");
        lines.push("── DRUCKDETAILS (Wunsch) ──");
        lines.push(`Position: ${d.order.position}`);
        lines.push(`Breite: ${d.order.width}`);
        if (d.order.height !== "auto") lines.push(`Höhe: ${d.order.height}`);
        if (d.order.textileColor && d.order.textileColor !== "—") lines.push(`Textilfarbe: ${d.order.textileColor}`);
        if (d.order.deadline && d.order.deadline !== "—") lines.push(`Liefertermin: ${d.order.deadline}`);
        if (d.order.note && d.order.note !== "—") {
          lines.push("");
          lines.push("Bemerkung:");
          lines.push(d.order.note);
        }
      }

      lines.push("");
      lines.push("── DATEIEN ──");
      if (d.designUrl) lines.push(`Design (PNG): ${d.designUrl}`);
      if (d.vectorUrl) lines.push(`Vektor (SVG): ${d.vectorUrl}`);
      if (d.reportUrl) lines.push(`Qualitätsbericht (PDF): ${d.reportUrl}`);
      if (d.printSizeCm) lines.push(`Original-Druckgröße: ${d.printSizeCm.width} × ${d.printSizeCm.height} cm`);
      if (d.quality) lines.push(`KI-Qualität: ${d.quality}/100`);

      const note = lines.join("\n");
      const params = new URLSearchParams({ note });
      if (productName) params.set("product", productName);
      if (productCode) params.set("code", productCode);
      if (d.designUrl) params.set("design", d.designUrl);

      onClose();
      router.push(`/kontakt?${params.toString()}`);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [productName, productCode, onClose, router]);

  const params = new URLSearchParams();
  if (productName) params.set("product", productName);
  if (productCode) params.set("code", productCode);
  const iframeSrc = `/dtf-engine/index.html${params.toString() ? `?${params.toString()}` : ""}`;

  return (
    <div className="dtf-overlay">
      <div className="dtf-modal">
        <button
          className="dtf-close"
          onClick={onClose}
          aria-label="Schließen"
          title="Schließen"
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
