"use client";

import { useEffect } from "react";

/**
 * Blendet das vom Kunden hochgeladene Logo als kleine Vorschau auf die
 * „Das könnte Ihnen auch gefallen"-Produktkarten ein.
 *
 * Idee: Wenn der Kunde oben ein Design hochlädt, sieht er unten sofort,
 * wie sein Motiv auf den empfohlenen Produkten wirken könnte → Cross-Selling.
 *
 * Umsetzung bewusst einfach: feste Position (Brusthöhe, zentriert). Das Logo
 * kommt aus dem globalen Event „inkii-design-preview", das DetailOrderForm/
 * DesignUploadTabs beim Upload feuert. Ohne Logo passiert nichts — die Karten
 * bleiben unverändert.
 */
export default function RelatedLogoPreview() {
  useEffect(() => {
    const OVERLAY_CLASS = "related-logo-overlay";

    type Placement = { x: number; y: number; width: number; rotation: number } | null;

    function apply(logoUrl: string | null, placement: Placement) {
      const cards = document.querySelectorAll<HTMLElement>('[data-related-card="1"]');
      cards.forEach((card) => {
        // Alte Overlays entfernen
        card.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((el) => el.remove());
        if (!logoUrl) return;

        if (getComputedStyle(card).position === "static") {
          card.style.position = "relative";
        }

        // cardCrop (Zoom/Pan) der Karte — das Produktbild ist evtl. gezoomt,
        // also muss das Logo denselben Transform bekommen, sonst sitzt es
        // relativ zum Bild verschoben.
        const zoom = parseFloat(card.dataset.cropZoom || "1") || 1;
        const tx = parseFloat(card.dataset.cropTx || "0") || 0;
        const ty = parseFloat(card.dataset.cropTy || "0") || 0;

        // Position/Größe aus dem Konfigurator (Prozent, wie im Hauptbild).
        const x = placement?.x ?? 50;
        const y = placement?.y ?? 38;
        const width = placement?.width ?? 26;
        const rotation = placement?.rotation ?? 0;

        // Wrapper trägt den cardCrop-Transform (identisch zum Produktbild:
        // scale + translate, gleiche Origin, gleiches padding von 4px).
        const wrap = document.createElement("div");
        wrap.className = OVERLAY_CLASS;
        wrap.setAttribute("aria-hidden", "true");
        Object.assign(wrap.style, {
          position: "absolute",
          inset: "0", // gallery-main hat kein padding → identisches Koordinatensystem
          pointerEvents: "none",
          zIndex: "3",
          transform: (zoom !== 1 || tx !== 0 || ty !== 0)
            ? `scale(${zoom}) translate(${-tx}%, ${ty}%)`
            : "",
          transformOrigin: "center",
          overflow: "hidden",
        } as CSSStyleDeclaration);

        const img = document.createElement("img");
        img.src = logoUrl;
        img.alt = "";
        Object.assign(img.style, {
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          objectFit: "contain",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,.12))",
          opacity: "0.96",
        } as CSSStyleDeclaration);

        wrap.appendChild(img);
        card.appendChild(wrap);
      });
    }

    // Event vom Upload-Bereich: { logoUrl, placement }
    function onPreview(e: Event) {
      const ce = e as CustomEvent<{ logoUrl?: string | null; placement?: Placement }>;
      apply(ce.detail?.logoUrl ?? null, ce.detail?.placement ?? null);
    }

    window.addEventListener("inkii-design-preview", onPreview);
    return () => window.removeEventListener("inkii-design-preview", onPreview);
  }, []);

  return null;
}
