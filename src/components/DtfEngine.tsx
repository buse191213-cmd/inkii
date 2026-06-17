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
  const { addOrUpdate } = useMerkliste();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data as OrderData;
      if (!d || d.type !== "dtf-anfrage" || !d.order) return;

      // Her seçilen ürün için Merkliste'ye ayrı item ekle
      const ts = Date.now();
      for (const p of d.order.products) {
        const noteLines: string[] = [];
        noteLines.push(`📨 EIGENES DTF-DESIGN`);
        if (p.printPosition) noteLines.push(`Druckposition: ${p.printPosition}`);
        if (p.printSizeCm) {
          noteLines.push(`Druckbreite: ${p.printSizeCm} cm${p.recommendedRange ? ` (Empfohlen: ${p.recommendedRange})` : ""}`);
        }
        if (p.designerLogoCm) noteLines.push(`Designer-Größe: ${p.designerLogoCm} cm`);
        if (p.placement) {
          noteLines.push(`Designer-Position: ${p.placement.leftPct}% von links, ${p.placement.topPct}% von oben`);
        }
        if (d.order!.deadline && d.order!.deadline !== "—") noteLines.push(`Liefertermin: ${d.order!.deadline}`);
        if (d.order!.note && d.order!.note !== "—") noteLines.push(`Bemerkung: ${d.order!.note}`);
        noteLines.push("");
        noteLines.push("── DATEIEN ──");
        if (d.designUrl) noteLines.push(`Design (PNG): ${d.designUrl}`);
        if (d.vectorUrl) noteLines.push(`Vektor (SVG): ${d.vectorUrl}`);
        if (d.reportUrl) noteLines.push(`Bericht (PDF): ${d.reportUrl}`);
        if (d.quality) noteLines.push(`KI-Qualität: ${d.quality}/100`);

        addOrUpdate({
          id: `dtf-${ts}-${p.name.toLowerCase().replace(/[^a-z]/g, "")}`,
          code: `DTF-${ts}`,
          name: `Eigenes DTF-Design — ${p.name}`,
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
  }, [productName, productCode, onClose, router, addOrUpdate]);

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
