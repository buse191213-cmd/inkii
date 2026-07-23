"use client";

import { useEffect } from "react";

/**
 * Blendet das vom Kunden hochgeladene Logo als Vorschau auf die
 * „Das könnte Ihnen auch gefallen"-Produktkarten ein (Cross-Selling).
 *
 * Koordinatensystem — bewusst identisch zum Admin-Editor (RecLogoEditor):
 * x/y/width sind Prozent des QUADRATISCHEN Kartenrahmens. Keine
 * Letterbox-Umrechnung. Das Produktbild liegt hier wie im Admin per
 * object-fit:contain im Quadrat, also entspricht „40 % im Admin" exakt
 * „40 % hier". Das Logo bekommt einen quadratischen Rahmen (aspect-ratio:1)
 * mit object-fit:contain — genau wie der LOGO-Platzhalter im Admin —, damit
 * translate(-50%,-50%) in beiden Fällen gleich zentriert.
 */
export default function RelatedLogoPreview() {
  useEffect(() => {
    const OVERLAY_CLASS = "related-logo-overlay";

    function apply(logoUrl: string | null) {
      const cards = document.querySelectorAll<HTMLElement>('[data-related-card="1"]');
      cards.forEach((card) => {
        card.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((el) => el.remove());
        if (!logoUrl) return;

        if (getComputedStyle(card).position === "static") {
          card.style.position = "relative";
        }

        // Nur anzeigen, wenn der Admin für DIESES Empfehlungsprodukt eine
        // Position festgelegt hat. Ohne Admin-Position lieber gar kein Logo,
        // als ein Logo an einer möglicherweise falschen Stelle.
        const adminX = card.dataset.logoX;
        const adminY = card.dataset.logoY;
        const adminW = card.dataset.logoWidth;
        const adminR = card.dataset.logoRotation;
        const hasAdminPos = adminX !== "" && adminX != null && adminX !== undefined;
        if (!hasAdminPos) return;

        const x = Number(adminX);
        const y = Number(adminY);
        const width = Number(adminW);
        const rotation = Number(adminR);

        // Debug: welches Produkt, Werte, UND die tatsächliche Bildposition
        const rect = card.getBoundingClientRect();
        const cardName = card.closest("article")?.querySelector(".mm-card-name, .mm-card-title, h3, h4")?.textContent?.trim().slice(0, 20) || "?";
        const cardImg = card.querySelector<HTMLImageElement>("img:not(." + OVERLAY_CLASS + ")");
        let imgInfo = "kein img";
        if (cardImg) {
          const ir = cardImg.getBoundingClientRect();
          imgInfo = `img=${Math.round(ir.width)}x${Math.round(ir.height)} imgTop-cardTop=${Math.round(ir.top - rect.top)} nat=${cardImg.naturalWidth}x${cardImg.naturalHeight}`;
        }
        console.log(`[REL] "${cardName}" x=${x} y=${y} | card=${Math.round(rect.width)}x${Math.round(rect.height)} | ${imgInfo}`);

        const img = document.createElement("img");
        img.src = logoUrl;
        img.alt = "";
        img.className = OVERLAY_CLASS;
        img.setAttribute("aria-hidden", "true");
        // Direkt in Karten-Prozent (kein Letterbox), quadratisch zentriert —
        // exakt wie der LOGO-Platzhalter im Admin-Editor.
        Object.assign(img.style, {
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          aspectRatio: "1 / 1",
          height: "auto",
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

    function onPreview(e: Event) {
      const ce = e as CustomEvent<{ logoUrl?: string | null }>;
      apply(ce.detail?.logoUrl ?? null);
    }

    window.addEventListener("inkii-design-preview", onPreview);
    return () => window.removeEventListener("inkii-design-preview", onPreview);
  }, []);

  return null;
}
