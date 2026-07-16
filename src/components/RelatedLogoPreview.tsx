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

        // Sicherstellen, dass das Overlay relativ zur Karte positioniert wird
        if (getComputedStyle(card).position === "static") {
          card.style.position = "relative";
        }

        // Position/Größe aus dem Konfigurator übernehmen (Prozentwerte,
        // relativ zum Produktbild — passt 1:1 auf die quadratische Karte).
        // Fallback: Brusthöhe zentriert, falls keine Platzierung vorliegt.
        const x = placement?.x ?? 50;
        const y = placement?.y ?? 38;
        const width = placement?.width ?? 26;
        const rotation = placement?.rotation ?? 0;

        const img = document.createElement("img");
        img.src = logoUrl;
        img.alt = "";
        img.className = OVERLAY_CLASS;
        img.setAttribute("aria-hidden", "true");
        Object.assign(img.style, {
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: "3",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,.12))",
          opacity: "0.96",
        } as CSSStyleDeclaration);
        card.appendChild(img);
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
