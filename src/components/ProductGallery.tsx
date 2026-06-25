"use client";

import { useEffect, useState, useMemo } from "react";
import { ProductIcon } from "@/lib/icons";
import { colorHex, colorLabel } from "@/lib/catalog-options";

function resolveUrl(rel: string, allImages: string[]): string {
  if (!rel) return rel;
  if (rel.startsWith("http://") || rel.startsWith("https://") || rel.startsWith("/")) return rel;
  const match = allImages.find((url) => url.toLowerCase().includes(rel.toLowerCase()));
  return match || rel;
}

export default function ProductGallery({
  images,
  colorImages,
  colors,
  name,
  iconName,
  cardCrop,
}: {
  images: string[];
  colorImages?: Record<string, string[]>;
  colors?: string[];
  name: string;
  iconName: string;
  cardCrop?: string;
}) {
  const [activeColor, setActiveColor] = useState<string | null>(colors?.[0] ?? null);
  const [active, setActive] = useState(0);

  const currentImages = useMemo(() => {
    if (activeColor && colorImages) {
      const norm = (s: string) => s.toLowerCase().trim()
        .replace(/ß/g, "ss").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ä/g, "a")
        .replace(/[^a-z0-9]/g, "");
      const target = norm(activeColor);
      const matchedKey = Object.keys(colorImages).find((k) => norm(k) === target);
      const rels = matchedKey ? colorImages[matchedKey] : null;
      if (rels && rels.length > 0) {
        const resolved = rels.map((r) => resolveUrl(r, images));
        const usable = resolved.filter((u) =>
          u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")
        );
        if (usable.length > 0) return usable;
      }
    }
    return images;
  }, [activeColor, colorImages, images]);

  // Dış event dinle (DetailOrderForm'dan renk değişikliği)
  useEffect(() => {
    function onColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      setActiveColor(ce.detail?.color || null);
      setActive(0);
    }
    window.addEventListener("product-color-change", onColor as EventListener);
    return () => window.removeEventListener("product-color-change", onColor as EventListener);
  }, []);

  // Galeri butonundan tıklayınca DetailOrderForm'a bildir
  function selectColor(c: string) {
    setActiveColor(c);
    setActive(0);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("external-color-select", { detail: { color: c } }));
    }
  }

  if (currentImages.length === 0 && (!colors || colors.length === 0)) {
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
        {currentImages.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentImages[active]}
            alt={name}
            key={currentImages[active]}
            style={(() => {
              try {
                if (!cardCrop) return undefined;
                const c = JSON.parse(cardCrop);
                const zoom = Number(c.zoom) || 1;
                const tx = Number(c.x) || 0;
                const ty = Number(c.y) || 0;
                if (zoom === 1 && tx === 0 && ty === 0) return undefined;
                return {
                  transform: `scale(${zoom}) translate(${tx}%, ${ty}%)`,
                  transformOrigin: "center",
                };
              } catch { return undefined; }
            })()}
          />
        ) : (
          <div className="gallery-empty"><ProductIcon name={iconName} /></div>
        )}
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
