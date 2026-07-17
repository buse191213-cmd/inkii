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

        // Position: Vorrang hat die vom Admin PRO Empfehlungsprodukt
        // festgelegte Position (data-logo-*). Fehlt sie, nutzen wir die
        // Platzierung aus dem Konfigurator, sonst Brusthöhe zentriert.
        const adminX = card.dataset.logoX;
        const adminY = card.dataset.logoY;
        const adminW = card.dataset.logoWidth;
        const adminR = card.dataset.logoRotation;
        const hasAdminPos = adminX !== "" && adminX != null && adminX !== undefined;

        const x = hasAdminPos ? Number(adminX) : (placement?.x ?? 50);
        const y = hasAdminPos ? Number(adminY) : (placement?.y ?? 38);
        const width = hasAdminPos ? Number(adminW) : (placement?.width ?? 26);
        const rotation = hasAdminPos ? Number(adminR) : (placement?.rotation ?? 0);

        // Das Kartenbild finden, um seine tatsächlich sichtbare Fläche zu
        // berücksichtigen. Bei object-fit:contain lässt ein nicht-quadratisches
        // Bild oben/unten (oder seitlich) Rand — die im Admin gesetzten
        // Prozentwerte beziehen sich aber auf DIESE Bildfläche. Ohne Korrektur
        // sitzt das Logo verschoben.
        const cardImg = card.querySelector<HTMLImageElement>('img:not(.' + OVERLAY_CLASS + ')');

        const place = (imgNatW: number, imgNatH: number) => {
          const rect = card.getBoundingClientRect();
          const cw = rect.width, ch = rect.height;
          // Sichtbare Bildfläche bei contain
          let dispW = cw, dispH = ch, offX = 0, offY = 0;
          if (imgNatW > 0 && imgNatH > 0) {
            const scale = Math.min(cw / imgNatW, ch / imgNatH);
            dispW = imgNatW * scale;
            dispH = imgNatH * scale;
            offX = (cw - dispW) / 2;
            offY = (ch - dispH) / 2;
          }
          // Prozent (relativ zur Bildfläche) → Pixel in der Karte
          const pxLeft = offX + (x / 100) * dispW;
          const pxTop = offY + (y / 100) * dispH;
          const pxWidth = (width / 100) * dispW;

          img.style.left = `${(pxLeft / cw) * 100}%`;
          img.style.top = `${(pxTop / ch) * 100}%`;
          img.style.width = `${(pxWidth / cw) * 100}%`;
          // Höhe = Breite (quadratischer Rahmen), damit translate(-50%,-50%)
          // exakt wie im Admin-Editor zentriert. Das Logo selbst wird per
          // object-fit:contain in dieses Quadrat eingepasst — sonst würde ein
          // breites Logo eine geringe Höhe bekommen und optisch nach oben
          // rutschen (Ursache der Verschiebung).
          img.style.aspectRatio = "1 / 1";
          img.style.height = "auto";
          img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        };

        const img = document.createElement("img");
        img.src = logoUrl;
        img.alt = "";
        img.className = OVERLAY_CLASS;
        img.setAttribute("aria-hidden", "true");
        Object.assign(img.style, {
          position: "absolute",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: "3",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,.12))",
          opacity: "0.96",
        } as CSSStyleDeclaration);
        card.appendChild(img);

        // Position berechnen — sobald die natürlichen Maße des Produktbildes
        // bekannt sind (für die contain-Korrektur).
        if (cardImg && cardImg.naturalWidth > 0) {
          place(cardImg.naturalWidth, cardImg.naturalHeight);
        } else if (cardImg) {
          cardImg.addEventListener("load", () => place(cardImg.naturalWidth, cardImg.naturalHeight), { once: true });
          // Fallback, falls schon geladen aber Maße 0 (Cache-Fälle)
          place(1, 1);
        } else {
          place(1, 1);
        }
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
