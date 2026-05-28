"use client";

/**
 * Foto-Mockup Ansicht: echtes Produktfoto + realistische Logo-Überlagerung.
 * Logo wird mit Perspektive, weichem Schatten und multiply-Blend auf das
 * Foto gelegt — sieht aus wie aufgedruckt (Mockey-Stil).
 */

type Props = {
  photoUrl: string;
  logoUrl: string | null;
  logoScale: number;       // 0.05 – 0.35 (Anteil der Foto-Breite)
  colorOverlay: string;    // Stofffarbe als multiply-Layer
  applyColor: boolean;     // Farbüberlagerung an/aus
  posKey: string;          // Logo-Position
};

// Pozisyon: foto içinde % konum (her ürün için designer'da ayarlanır)
const POSITION_STYLES: Record<string, { top: string; left: string }> = {
  "brust-mitte": { top: "42%", left: "50%" },
  "brust-links": { top: "38%", left: "40%" },
  "brust-rechts": { top: "38%", left: "60%" },
  "bauch": { top: "58%", left: "50%" },
  "vorne": { top: "46%", left: "50%" },
  "mitte": { top: "48%", left: "50%" },
  "oben": { top: "32%", left: "50%" },
  "kapuze": { top: "20%", left: "50%" },
};

export default function PhotoMockup({
  photoUrl,
  logoUrl,
  logoScale,
  colorOverlay,
  applyColor,
  posKey,
}: Props) {
  const posStyle = POSITION_STYLES[posKey] || POSITION_STYLES["brust-mitte"];

  return (
    <div className="pm-stage">
      <div className="pm-frame">
        {/* Ürün fotoğrafı */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="Produkt" className="pm-product" />

        {/* Renk katmanı: beyaz ürünü renklendirir (multiply) */}
        {applyColor && (
          <div
            className="pm-color-layer"
            style={{ backgroundColor: colorOverlay }}
          />
        )}

        {/* Logo overlay */}
        {logoUrl && (
          <div
            className="pm-logo"
            style={{
              top: posStyle.top,
              left: posStyle.left,
              width: `${Math.round(logoScale * 100)}%`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" />
          </div>
        )}
      </div>
    </div>
  );
}
