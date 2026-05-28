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
  posX: number;            // 0–100 (% horizontal)
  posY: number;            // 0–100 (% vertikal)
};

export default function PhotoMockup({
  photoUrl,
  logoUrl,
  logoScale,
  colorOverlay,
  applyColor,
  posX,
  posY,
}: Props) {
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

        {/* Logo overlay — serbest konum (X/Y %) */}
        {logoUrl && (
          <div
            className="pm-logo"
            style={{
              top: `${posY}%`,
              left: `${posX}%`,
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
