"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
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

type Side = "front" | "back";

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
  const [side, setSide] = useState<Side>("front");
  const [designs, setDesigns] = useState<{ front: Placement | null; back: Placement | null }>({
    front: null,
    back: null,
  });

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

  // SADECE ilk 2 görseli kullan (ön + arka)
  const frontImage = currentImages[0] || "";
  const backImage = currentImages[1] || null;
  const hasBack = Boolean(backImage);

  const activeImage = side === "front" ? frontImage : backImage;
  const currentDesign = designs[side];
  const totalDesigns = (designs.front ? 1 : 0) + (designs.back ? 1 : 0);

  useEffect(() => {
    function onColor(e: Event) {
      const ce = e as CustomEvent<{ color: string | null }>;
      setActiveColor(ce.detail?.color || null);
      setSide("front");
    }
    window.addEventListener("product-color-change", onColor as EventListener);
    return () => window.removeEventListener("product-color-change", onColor as EventListener);
  }, []);

  // Auto-switch to front if back is not available
  useEffect(() => {
    if (side === "back" && !hasBack) setSide("front");
  }, [side, hasBack]);

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
          [side]: { ...EMPTY, imageDataUrl: dataUrl, imageAspect: aspect },
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [side]);

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
          [side]: prev[side] ? { ...prev[side]!, x: newX, y: newY } : null,
        }));
      } else if (start.mode === "resize") {
        const newWidth = Math.max(8, Math.min(80, start.startVal2 + (dx + dy) / 2));
        setDesigns((prev) => ({
          ...prev,
          [side]: prev[side] ? { ...prev[side]!, width: newWidth } : null,
        }));
      }
    },
    [currentDesign, side]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current.mode = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, []);

  const handleRotate = (delta: number) => {
    if (!currentDesign) return;
    setDesigns((prev) => ({
      ...prev,
      [side]: prev[side] ? { ...prev[side]!, rotation: prev[side]!.rotation + delta } : null,
    }));
  };

  const handleRemove = () => {
    setDesigns((prev) => ({ ...prev, [side]: null }));
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
      {/* Side Tabs — Merchery style */}
      <div className="gal-tabs">
        <button
          type="button"
          className={`gal-tab${side === "front" ? " active" : ""}`}
          onClick={() => setSide("front")}
        >
          <span className="gal-tab-icon">◐</span>
          <span className="gal-tab-label">Vorderseite</span>
          {designs.front && <span className="gal-tab-check">✓</span>}
        </button>
        <button
          type="button"
          className={`gal-tab${side === "back" ? " active" : ""}${!hasBack ? " disabled" : ""}`}
          onClick={() => hasBack && setSide("back")}
          disabled={!hasBack}
          title={!hasBack ? "Kein Rückseiten-Bild verfügbar" : undefined}
        >
          <span className="gal-tab-icon">◑</span>
          <span className="gal-tab-label">Rückseite</span>
          {designs.back && <span className="gal-tab-check">✓</span>}
          {!hasBack && <span className="gal-tab-lock">🔒</span>}
        </button>
      </div>

      {totalDesigns > 0 && (
        <div className="gal-status">
          <span className="gal-status-icon">✓</span>
          <span>{totalDesigns} Design{totalDesigns > 1 ? "s" : ""} platziert</span>
          <span className="gal-status-detail">
            {designs.front && <span>Vorderseite ✓</span>}
            {designs.back && <span>Rückseite ✓</span>}
          </span>
        </div>
      )}

      <div
        className="gallery-main"
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {activeImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={activeImage} alt={`${name} — ${side === "front" ? "Vorderseite" : "Rückseite"}`} draggable={false} />
        ) : (
          <div className="gallery-empty"><ProductIcon name={iconName} /></div>
        )}

        {/* Design overlay */}
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

        {/* Controls when design exists */}
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

        {/* Upload CTA when no design on current side */}
        {!currentDesign && activeImage && (
          <button
            type="button"
            className="gal-upload-cta"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            </svg>
            Design für {side === "front" ? "Vorderseite" : "Rückseite"} hochladen
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

      {/* Contact CTA if no back image */}
      {!hasBack && (
        <div className="gal-contact-cta">
          <div className="gal-contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="gal-contact-body">
            <div className="gal-contact-title">Rückseiten-Druck gewünscht?</div>
            <div className="gal-contact-text">
              Kein Problem — kontaktieren Sie uns für individuelle Anfragen und wir kümmern uns um die Rückseite Ihrer Bestellung.
            </div>
          </div>
          <div className="gal-contact-actions">
            <Link href="/kontakt" className="gal-contact-btn primary">
              Kontakt aufnehmen →
            </Link>
            <a
              href="https://wa.me/491606767001?text=Hallo%20INKII%20Works%2C%20ich%20m%C3%B6chte%20die%20R%C3%BCckseite%20eines%20Produkts%20bedrucken%20lassen."
              target="_blank"
              rel="noopener noreferrer"
              className="gal-contact-btn wa"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .gal-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          background: #fafbf9;
          padding: 4px;
          border-radius: 6px;
          border: 1px solid #e3e6df;
        }
        .gal-tab {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #5a6660;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s;
          letter-spacing: 0.2px;
          position: relative;
        }
        .gal-tab:hover:not(.disabled):not(.active) {
          background: #fff;
          color: #0f1a16;
        }
        .gal-tab.active {
          background: #0f1a16;
          color: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        }
        .gal-tab.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .gal-tab-icon { font-size: 1.1rem; opacity: 0.75; }
        .gal-tab-label { letter-spacing: 0.5px; }
        .gal-tab-check {
          background: #10b981;
          color: #fff;
          font-size: 0.55rem;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          margin-left: 4px;
        }
        .gal-tab-lock { font-size: 0.7rem; opacity: 0.7; margin-left: 4px; }
        .gal-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          margin-bottom: 10px;
          background: #d1fae5;
          color: #065f46;
          border-radius: 4px;
          font-size: 0.78rem;
          font-weight: 600;
          flex-wrap: wrap;
        }
        .gal-status-icon {
          background: #10b981;
          color: #fff;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .gal-status-detail {
          margin-left: auto;
          display: flex;
          gap: 10px;
          font-size: 0.72rem;
          opacity: 0.85;
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
        .gal-contact-cta {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          margin-top: 12px;
          background: linear-gradient(135deg, #fff8e6 0%, #fef3c7 100%);
          border: 1px solid #fbbf24;
          border-radius: 6px;
          flex-wrap: wrap;
        }
        .gal-contact-icon {
          width: 42px;
          height: 42px;
          background: #fbbf24;
          color: #78350f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gal-contact-body {
          flex: 1;
          min-width: 200px;
        }
        .gal-contact-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: #78350f;
          margin-bottom: 4px;
        }
        .gal-contact-text {
          font-size: 0.78rem;
          color: #92400e;
          line-height: 1.4;
        }
        .gal-contact-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .gal-contact-btn {
          padding: 9px 16px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-decoration: none;
          border-radius: 4px;
          transition: transform 0.15s;
          display: inline-flex;
          align-items: center;
        }
        .gal-contact-btn:hover { transform: translateY(-1px); }
        .gal-contact-btn.primary {
          background: #0f1a16;
          color: #fff;
        }
        .gal-contact-btn.wa {
          background: #25d366;
          color: #fff;
        }
        @media (max-width: 640px) {
          .gal-status-detail { margin-left: 0; width: 100%; }
          .gal-contact-cta { flex-direction: column; align-items: stretch; text-align: left; }
          .gal-contact-actions { justify-content: stretch; }
          .gal-contact-btn { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
