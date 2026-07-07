"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { ProductIcon } from "@/lib/icons";

function resolveUrl(rel: string, allImages: string[]): string {
  if (!rel) return rel;
  if (rel.startsWith("http://") || rel.startsWith("https://") || rel.startsWith("/")) return rel;
  const match = allImages.find((url) => url.toLowerCase().includes(rel.toLowerCase()));
  return match || rel;
}

type Placement = {
  imageDataUrl: string;
  imageAspect: number;
  x: number;    // %
  y: number;    // %
  width: number; // %
  rotation: number;
};

const EMPTY: Omit<Placement, "imageDataUrl" | "imageAspect"> = {
  x: 50, y: 50, width: 30, rotation: 0,
};

export default function ProductGallery({
  images,
  colorImages,
  colors,
  name,
  iconName,
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

  // Her image için ayrı design slot: index bazlı
  const [designs, setDesigns] = useState<Record<number, Placement | null>>({});

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number; startVal: number; startVal2: number; mode: "move" | "resize" | null }>({ x: 0, y: 0, startVal: 0, startVal2: 0, mode: null });

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

  useEffect(() => {
    function onColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      setActiveColor(ce.detail?.color || null);
      setActive(0);
    }
    window.addEventListener("product-color-change", onColor as EventListener);
    return () => window.removeEventListener("product-color-change", onColor as EventListener);
  }, []);

  // Current design for active image
  const currentDesign = designs[active] || null;
  const totalDesigns = Object.values(designs).filter(Boolean).length;

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Bitte laden Sie ein Bild hoch (PNG, JPG, SVG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Datei ist zu groß. Maximal 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        setDesigns((prev) => ({
          ...prev,
          [active]: { ...EMPTY, imageDataUrl: dataUrl, imageAspect: aspect },
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [active]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "resize") => {
      if (!currentDesign) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        startVal: currentDesign.x,
        startVal2: mode === "move" ? currentDesign.y : currentDesign.width,
        mode,
      };
    },
    [currentDesign]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = dragRef.current;
      if (!start.mode || !currentDesign || !canvasRef.current) return;

      const canvas = canvasRef.current.getBoundingClientRect();
      const dx = ((e.clientX - start.x) / canvas.width) * 100;
      const dy = ((e.clientY - start.y) / canvas.height) * 100;

      if (start.mode === "move") {
        const newX = Math.max(5, Math.min(95, start.startVal + dx));
        const newY = Math.max(5, Math.min(95, start.startVal2 + dy));
        setDesigns((prev) => ({
          ...prev,
          [active]: prev[active] ? { ...prev[active]!, x: newX, y: newY } : null,
        }));
      } else if (start.mode === "resize") {
        const newWidth = Math.max(8, Math.min(80, start.startVal2 + (dx + dy) / 2));
        setDesigns((prev) => ({
          ...prev,
          [active]: prev[active] ? { ...prev[active]!, width: newWidth } : null,
        }));
      }
    },
    [currentDesign, active]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current.mode = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  const handleRotate = (delta: number) => {
    if (!currentDesign) return;
    setDesigns((prev) => ({
      ...prev,
      [active]: prev[active] ? { ...prev[active]!, rotation: prev[active]!.rotation + delta } : null,
    }));
  };

  const handleRemove = () => {
    setDesigns((prev) => ({ ...prev, [active]: null }));
  };

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
      {/* Design badge + upload chip */}
      <div className="gal-toolbar">
        <div className="gal-toolbar-hint">
          <span className="gal-toolbar-icon" aria-hidden>✧</span>
          <span>Ihr Design darauf platzieren</span>
        </div>
        {totalDesigns > 0 && (
          <div className="gal-badge">{totalDesigns} Design{totalDesigns > 1 ? "s" : ""} ✓</div>
        )}
      </div>

      <div
        className="gallery-main"
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {currentImages.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={currentImages[active]} alt={name} key={currentImages[active]} draggable={false} />
        ) : (
          <div className="gallery-empty"><ProductIcon name={iconName} /></div>
        )}

        {/* Design overlay — direkt ürün görselinin üstünde */}
        {currentDesign && (
          <div
            className="gal-design-layer"
            style={{
              left: `${currentDesign.x}%`,
              top: `${currentDesign.y}%`,
              width: `${currentDesign.width}%`,
              transform: `translate(-50%, -50%) rotate(${currentDesign.rotation}deg)`,
            }}
            onPointerDown={(e) => handlePointerDown(e, "move")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentDesign.imageDataUrl}
              alt="Ihr Design"
              className="gal-design-img"
              style={{ aspectRatio: currentDesign.imageAspect }}
              draggable={false}
            />
            <div
              className="gal-handle gal-handle-br"
              onPointerDown={(e) => handlePointerDown(e, "resize")}
              aria-label="Größe ändern"
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8 L8 2 M5 8 L8 5"/>
              </svg>
            </div>
            <button
              type="button"
              className="gal-handle gal-handle-remove"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              aria-label="Design entfernen"
            >
              ✕
            </button>
          </div>
        )}

        {/* Design controls (design varsa) */}
        {currentDesign && (
          <div className="gal-controls">
            <button type="button" className="gal-ctrl-btn" onClick={() => handleRotate(-15)} title="Nach links drehen">↺</button>
            <button type="button" className="gal-ctrl-btn" onClick={() => handleRotate(15)} title="Nach rechts drehen">↻</button>
            <button type="button" className="gal-ctrl-btn" onClick={() => fileInputRef.current?.click()} title="Anderes Design">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              </svg>
            </button>
          </div>
        )}

        {/* Upload button (design yoksa) */}
        {!currentDesign && (
          <button
            type="button"
            className="gal-upload-cta"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            </svg>
            Design hochladen
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      {currentImages.length > 1 && (
        <div className="gallery-thumbs">
          {currentImages.map((url, i) => (
            <button
              key={url}
              className={`gallery-thumb${i === active ? " active" : ""}${designs[i] ? " has-design" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              {designs[i] && <span className="thumb-check" aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .gal-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding: 8px 12px;
          background: #fafbf9;
          border: 1px solid #e3e6df;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        .gal-toolbar-hint {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #5a6660;
        }
        .gal-toolbar-icon {
          color: #5e8470;
          font-size: 1rem;
        }
        .gal-badge {
          background: #d1fae5;
          color: #065f46;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .gallery-main {
          position: relative;
          user-select: none;
          touch-action: none;
        }
        .gal-design-layer {
          position: absolute;
          cursor: move;
          user-select: none;
          touch-action: none;
          z-index: 5;
        }
        .gal-design-layer:hover {
          outline: 2px solid #5e8470;
          outline-offset: 2px;
        }
        .gal-design-img {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
        }
        .gal-handle {
          position: absolute;
          width: 22px;
          height: 22px;
          background: #0f1a16;
          color: #fff;
          border: 2px solid #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 0.7rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: nwse-resize;
        }
        .gal-handle-br { bottom: -11px; right: -11px; }
        .gal-handle-remove {
          top: -11px;
          right: -11px;
          background: #dc2626;
          cursor: pointer;
        }
        .gal-controls {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          background: rgba(15,26,22,0.92);
          padding: 4px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          z-index: 6;
        }
        .gal-ctrl-btn {
          background: transparent;
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          font-size: 1.05rem;
          cursor: pointer;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .gal-ctrl-btn:hover {
          background: rgba(255,255,255,0.15);
        }
        .gal-upload-cta {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f1a16;
          color: #fff;
          border: none;
          padding: 10px 18px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
          z-index: 4;
        }
        .gal-upload-cta:hover {
          transform: translateX(-50%) translateY(-1px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.3);
        }
        .thumb-check {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #10b981;
          color: #fff;
          font-size: 0.6rem;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .gallery-thumb.has-design { position: relative; }
      `}</style>
    </div>
  );
}
