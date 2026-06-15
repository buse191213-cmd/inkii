"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * DTF-Engine Modal — Orijinal HTML iframe ile.
 * Sadece ✕ butonu ile kapanır.
 * "Anfrage senden" butonu basıldığında iframe postMessage ile bilgi yollar,
 * burada yakalanır ve kontakt sayfasına tasarım verisi ile yönlendirilir.
 */
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

  // postMessage dinleyici: iframe'den "Anfrage senden" geldiğinde
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || d.type !== "dtf-anfrage") return;
      // Kontakt sayfasına tasarım verisi ile yönlendir
      const note = [
        `Eigenes DTF-Design${productName ? ` für: ${productName}` : ""}${productCode ? ` (${productCode})` : ""}`,
        d.designUrl ? `Design (PNG): ${d.designUrl}` : "",
        d.vectorUrl ? `Vektor (SVG): ${d.vectorUrl}` : "",
        d.reportUrl ? `Qualitätsbericht (PDF): ${d.reportUrl}` : "",
        d.printSizeCm ? `Druckgröße: ${d.printSizeCm.width} x ${d.printSizeCm.height} cm` : "",
        d.quality ? `Druckqualität: ${d.quality}/100` : "",
      ].filter(Boolean).join("\n");

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

  // iframe src'e product params iletelim — buton içinde okuyacak
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
