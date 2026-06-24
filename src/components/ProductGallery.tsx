"use client";

import { useEffect, useState } from "react";
import { ProductIcon } from "@/lib/icons";

/**
 * Ürün galerisi - renk seçimine duyarlı.
 * Aktif renk değişince (window event 'product-color-change' ile) o renge ait görseller gösterilir.
 * Renk için görsel yoksa default `images` listesi kullanılır.
 */
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

  // Aktif renge göre gösterilecek görseller
  const currentImages = (() => {
    if (activeColor && colorImages && colorImages[activeColor]?.length) {
      return colorImages[activeColor];
    }
    return images;
  })();

  // Detail page'inden renk değişiklik event'i dinle
  useEffect(() => {
    function onColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      setActiveColor(ce.detail?.color || null);
      setActive(0); // Renk değiştiğinde ilk görsele dön
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
