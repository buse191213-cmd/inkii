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

    type Placement = { x: number; y: number; width: number; rotation: number } | null;

    function apply(logoUrl: string | null, placement: Placement) {
      const cards = document.querySelectorAll<HTMLElement>('[data-related-card="1"]');
      cards.forEach((card) => {
        card.querySelectorAll(`.${OVERLAY_CLASS}`).forEach((el) => el.remove());
        if (!logoUrl) return;

        if (getComputedStyle(card).position === "static") {
          card.style.position = "relative";
        }

        // Vom Admin PRO Empfehlung gesetzte Position hat Vorrang, sonst die
        // Platzierung des Kunden, sonst Brusthöhe zentriert.
        const adminX = card.dataset.logoX;
        const adminY = card.dataset.logoY;
        const adminW = card.dataset.logoWidth;
        const adminR = card.dataset.logoRotation;
        const hasAdminPos = adminX !== "" && adminX != null && adminX !== undefined;

        const x = hasAdminPos ? Number(adminX) : (placement?.x ?? 50);
        const y = hasAdminPos ? Number(adminY) : (placement?.y ?? 38);
        const width = hasAdminPos ? Number(adminW) : (placement?.width ?? 26);
        const rotation = hasAdminPos ? Number(adminR) : (placement?.rotation ?? 0);

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
      const ce = e as CustomEvent<{ logoUrl?: string | null; placement?: Placement }>;
      apply(ce.detail?.logoUrl ?? null, ce.detail?.placement ?? null);
    }

    window.addEventListener("inkii-design-preview", onPreview);
    return () => window.removeEventListener("inkii-design-preview", onPreview);
  }, []);

  return null;
}
