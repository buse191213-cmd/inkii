"use client";

import { useState } from "react";
import { ProductIcon } from "@/lib/icons";

/** Galerie im Monday-Merch-Stil:
 *  vertikale Thumbs links, großes Hauptbild rechts. */
export default function ProductGallery({
  images,
  name,
  iconName,
}: {
  images: string[];
  name: string;
  iconName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="mm-gallery">
        <div className="mm-gallery-main mm-gallery-empty">
          <ProductIcon name={iconName} />
        </div>
      </div>
    );
  }

  return (
    <div className="mm-gallery">
      {images.length > 1 && (
        <div className="mm-gallery-thumbs">
          {images.map((url, i) => (
            <button
              key={url}
              className={`mm-gallery-thumb${i === active ? " active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1}`}
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
      <div className="mm-gallery-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} />
      </div>
    </div>
  );
}
