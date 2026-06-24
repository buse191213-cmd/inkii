"use client";

import { useEffect, useState, useMemo } from "react";
import { ProductIcon } from "@/lib/icons";

/**
 * Dosya adından full URL'e çözer. "BY102_Black.jpg" → tüm görseller listesinde
 * URL'i bu ismi içerenle eşleştir, bulunamazsa string olduğu gibi kal.
 */
function resolveUrl(rel: string, allImages: string[]): string {
  if (!rel) return rel;
  if (rel.startsWith("http://") || rel.startsWith("https://") || rel.startsWith("/")) {
    return rel; // Zaten absolute
  }
  // Dosya adıyla eşleşen full URL'i bul
  const match = allImages.find((url) => url.toLowerCase().includes(rel.toLowerCase()));
  return match || rel;
}

export default function ProductGallery({
  images,
  colorImages,
  name,
  iconName,
}: {
  images: string[];
  colorImages?: Record<string, string[]>;
  name: string;
  iconName: string;
}) {
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  // Aktif renge göre gösterilecek görseller (relative path'leri çöz)
  const currentImages = useMemo(() => {
    if (activeColor && colorImages) {
      // Renk anahtarını esnek eşleştir (büyük/küçük + Türkçe/Almanca karakter)
      const norm = (s: string) => s.toLowerCase().trim()
        .replace(/ß/g, "ss").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ä/g, "a")
        .replace(/[^a-z0-9]/g, "");
      const target = norm(activeColor);
      const matchedKey = Object.keys(colorImages).find((k) => norm(k) === target);
      const rels = matchedKey ? colorImages[matchedKey] : null;
      if (rels && rels.length > 0) {
        return rels.map((r) => resolveUrl(r, images));
      }
    }
    return images;
  }, [activeColor, colorImages, images]);

  // Renk değişimi dinleyici
  useEffect(() => {
    function onColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      setActiveColor(ce.detail?.color || null);
      setActive(0);
    }
    window.addEventListener("product-color-change", onColor as EventListener);
    return () => window.removeEventListener("product-color-change", onColor as EventListener);
  }, []);

  if (currentImages.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery-main gallery-empty">
          <ProductIcon name={iconName} />
        </div>
      </div>
    );
  }

  return (
    <div className="gallery">
      <div className="gallery-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={currentImages[active]} alt={name} key={currentImages[active]} />
      </div>
      {currentImages.length > 1 && (
        <div className="gallery-thumbs">
          {currentImages.map((url, i) => (
            <button
              key={url}
              className={`gallery-thumb${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
