"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Props = {
  productName: string;
  frontImage: string;   // Ürünün ön görseli
  backImage?: string;   // Arka görseli (opsiyonel)
  onSave?: (design: SavedDesign) => void;
};

export type SavedDesign = {
  side: "front" | "back";
  imageDataUrl: string;    // Yüklenen tasarım
  x: number;               // %  (0-100)
  y: number;               // %  (0-100)
  width: number;           // %  (5-80)
  rotation: number;        // deg (-180 to 180)
  productImageUrl: string; // Hangi ürün görseline uygulandı
};

type Placement = {
  x: number;
  y: number;
  width: number;
  rotation: number;
  imageDataUrl: string;
  imageAspect: number; // width/height
};

const EMPTY_PLACEMENT: Omit<Placement, "imageDataUrl" | "imageAspect"> = {
  x: 50,
  y: 50,
  width: 30,
  rotation: 0,
};

export default function ProductCustomizer({
  productName,
  frontImage,
  backImage,
  onSave,
}: Props) {
  const [side, setSide] = useState<"front" | "back">("front");
  const [placements, setPlacements] = useState<{
    front: Placement | null;
    back: Placement | null;
  }>({ front: null, back: null });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number; mode: "move" | "resize" | null }>({ x: 0, y: 0, startX: 0, startY: 0, mode: null });

  const current = placements[side];
  const hasBack = Boolean(backImage);

  // File upload → design için
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
      // Aspect ratio öğrenmek için Image yükle
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        setPlacements((prev) => ({
          ...prev,
          [side]: {
            ...EMPTY_PLACEMENT,
            imageDataUrl: dataUrl,
            imageAspect: aspect,
          },
        }));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Same file tekrar yüklenebilsin
  }, [side]);

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, mode: "move" | "resize") => {
      if (!current) return;
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: current.x,
        startY: mode === "move" ? current.y : current.width, // resize için width'i sakla
        mode,
      };
    },
    [current]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const start = dragStartRef.current;
      if (!start.mode || !current || !canvasRef.current) return;

      const canvas = canvasRef.current.getBoundingClientRect();
      const dx = ((e.clientX - start.x) / canvas.width) * 100;
      const dy = ((e.clientY - start.y) / canvas.height) * 100;

      if (start.mode === "move") {
        const newX = Math.max(5, Math.min(95, start.startX + dx));
        const newY = Math.max(5, Math.min(95, start.startY + dy));
        setPlacements((prev) => ({
          ...prev,
          [side]: prev[side] ? { ...prev[side]!, x: newX, y: newY } : null,
        }));
      } else if (start.mode === "resize") {
        // Corner drag: sağ-alt köşe, mesafeye göre büyür
        const newWidth = Math.max(8, Math.min(80, start.startY + (dx + dy) / 2));
        setPlacements((prev) => ({
          ...prev,
          [side]: prev[side] ? { ...prev[side]!, width: newWidth } : null,
        }));
      }
    },
    [current, side]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragStartRef.current.mode = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleRotate = (delta: number) => {
    if (!current) return;
    setPlacements((prev) => ({
      ...prev,
      [side]: prev[side]
        ? { ...prev[side]!, rotation: (prev[side]!.rotation + delta) % 360 }
        : null,
    }));
  };

  const handleRemove = () => {
    setPlacements((prev) => ({ ...prev, [side]: null }));
  };

  const handleReset = () => {
    if (!current) return;
    setPlacements((prev) => ({
      ...prev,
      [side]: prev[side] ? { ...prev[side]!, ...EMPTY_PLACEMENT } : null,
    }));
  };

  const handleSaveDesign = () => {
    // Her taraf için kaydedilen tasarımı topla
    if (placements.front) {
      onSave?.({
        side: "front",
        imageDataUrl: placements.front.imageDataUrl,
        x: placements.front.x,
        y: placements.front.y,
        width: placements.front.width,
        rotation: placements.front.rotation,
        productImageUrl: frontImage,
      });
    }
    if (placements.back && backImage) {
      onSave?.({
        side: "back",
        imageDataUrl: placements.back.imageDataUrl,
        x: placements.back.x,
        y: placements.back.y,
        width: placements.back.width,
        rotation: placements.back.rotation,
        productImageUrl: backImage,
      });
    }
    alert("Design gespeichert! ✓");
  };

  const activeImage = side === "front" ? frontImage : (backImage || frontImage);
  const totalDesigns = (placements.front ? 1 : 0) + (placements.back ? 1 : 0);

  // Prevent scroll on drag
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prevent = (e: TouchEvent) => {
      if (dragStartRef.current.mode) e.preventDefault();
    };
    canvas.addEventListener("touchmove", prevent, { passive: false });
    return () => canvas.removeEventListener("touchmove", prevent);
  }, []);

  return (
    <div className="pc-wrap">
      {/* Header */}
      <div className="pc-header">
        <div>
          <h3 className="pc-title">
            <span className="pc-title-icon" aria-hidden>✧</span>
            Personalisieren Sie Ihr Produkt
          </h3>
          <p className="pc-subtitle">
            Laden Sie Ihr Logo hoch und platzieren Sie es auf {hasBack ? "Vorder- oder Rückseite" : "dem Produkt"}
          </p>
        </div>
        {totalDesigns > 0 && (
          <div className="pc-badge">
            {totalDesigns} Design{totalDesigns > 1 ? "s" : ""} ✓
          </div>
        )}
      </div>

      {/* Side toggle */}
      {hasBack && (
        <div className="pc-side-toggle">
          <button
            type="button"
            className={`pc-side-btn${side === "front" ? " active" : ""}`}
            onClick={() => setSide("front")}
          >
            <span className="pc-side-icon">▲</span>
            Vorderseite
            {placements.front && <span className="pc-side-check">✓</span>}
          </button>
          <button
            type="button"
            className={`pc-side-btn${side === "back" ? " active" : ""}`}
            onClick={() => setSide("back")}
          >
            <span className="pc-side-icon">▼</span>
            Rückseite
            {placements.back && <span className="pc-side-check">✓</span>}
          </button>
        </div>
      )}

      {/* Canvas + Product Image */}
      <div className="pc-canvas-wrap">
        <div
          className="pc-canvas"
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={`${productName} — ${side === "front" ? "Vorderseite" : "Rückseite"}`}
            className="pc-product-img"
            draggable={false}
          />

          {/* Print area guide (visual hint) */}
          <div className="pc-print-area" aria-hidden />

          {/* Design overlay */}
          {current && (
            <div
              className="pc-design-layer"
              style={{
                left: `${current.x}%`,
                top: `${current.y}%`,
                width: `${current.width}%`,
                transform: `translate(-50%, -50%) rotate(${current.rotation}deg)`,
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.imageDataUrl}
                alt="Ihr Design"
                className="pc-design-img"
                style={{ aspectRatio: current.imageAspect }}
                draggable={false}
              />

              {/* Corner handles */}
              <div
                className="pc-handle pc-handle-br"
                onPointerDown={(e) => handlePointerDown(e, "resize")}
                aria-label="Größe ändern"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8 L8 2 M5 8 L8 5" />
                </svg>
              </div>

              {/* Delete button */}
              <button
                type="button"
                className="pc-handle pc-handle-remove"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                aria-label="Design entfernen"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="pc-controls">
        {!current ? (
          <button
            type="button"
            className="pc-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <path d="M17 8l-5-5-5 5"/>
              <path d="M12 3v12"/>
            </svg>
            Design für {side === "front" ? "Vorderseite" : "Rückseite"} hochladen
          </button>
        ) : (
          <div className="pc-actions">
            <button type="button" className="pc-btn-icon" onClick={() => handleRotate(-15)} title="Nach links drehen">
              ↺
            </button>
            <button type="button" className="pc-btn-icon" onClick={() => handleRotate(15)} title="Nach rechts drehen">
              ↻
            </button>
            <div className="pc-btn-sep" />
            <button type="button" className="pc-btn-text" onClick={handleReset}>
              Zurücksetzen
            </button>
            <button type="button" className="pc-btn-text" onClick={() => fileInputRef.current?.click()}>
              Anderes Design
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
      </div>

      {/* Info + Save */}
      <div className="pc-footer">
        <div className="pc-hints">
          <span>✦ Ziehen zum Verschieben</span>
          <span>✦ Ecke ziehen zum Skalieren</span>
          <span>✦ PNG, JPG, SVG bis 10 MB</span>
        </div>
        {totalDesigns > 0 && (
          <button type="button" className="pc-save-btn" onClick={handleSaveDesign}>
            Design speichern
            <span aria-hidden>→</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .pc-wrap {
          background: #fafbf9;
          border: 1px solid #e3e6df;
          padding: 24px;
          margin-top: 32px;
          border-radius: 4px;
        }
        .pc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .pc-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f1a16;
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pc-title-icon {
          color: #5e8470;
          font-size: 1.3rem;
        }
        .pc-subtitle {
          font-size: 0.85rem;
          color: #5a6660;
          margin: 0;
        }
        .pc-badge {
          background: #d1fae5;
          color: #065f46;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .pc-side-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .pc-side-btn {
          flex: 1;
          background: #fff;
          border: 1px solid #e3e6df;
          padding: 10px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f1a16;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 4px;
          transition: all 0.15s;
          position: relative;
        }
        .pc-side-btn:hover { border-color: #0f1a16; }
        .pc-side-btn.active {
          background: #0f1a16;
          color: #fff;
          border-color: #0f1a16;
        }
        .pc-side-icon {
          font-size: 0.7rem;
          opacity: 0.6;
        }
        .pc-side-check {
          color: #10b981;
          margin-left: 4px;
        }
        .pc-side-btn.active .pc-side-check { color: #fff; }
        .pc-canvas-wrap {
          background: #fff;
          border: 1px solid #e3e6df;
          margin-bottom: 16px;
          border-radius: 4px;
          overflow: hidden;
        }
        .pc-canvas {
          position: relative;
          width: 100%;
          padding-bottom: 100%; /* Kare oran */
          user-select: none;
          touch-action: none;
        }
        .pc-product-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          user-select: none;
          -webkit-user-drag: none;
        }
        .pc-print-area {
          position: absolute;
          left: 30%;
          top: 25%;
          width: 40%;
          height: 45%;
          border: 1px dashed rgba(94, 132, 112, 0.35);
          pointer-events: none;
          border-radius: 2px;
        }
        .pc-design-layer {
          position: absolute;
          cursor: move;
          user-select: none;
          touch-action: none;
        }
        .pc-design-layer:hover {
          outline: 2px solid #5e8470;
          outline-offset: 2px;
        }
        .pc-design-img {
          width: 100%;
          height: auto;
          display: block;
          pointer-events: none;
        }
        .pc-handle {
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
          cursor: nwse-resize;
          padding: 0;
          font-size: 0.75rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .pc-handle-br {
          bottom: -11px;
          right: -11px;
        }
        .pc-handle-remove {
          top: -11px;
          right: -11px;
          background: #dc2626;
          cursor: pointer;
        }
        .pc-controls {
          margin-bottom: 14px;
        }
        .pc-upload-btn {
          width: 100%;
          background: #0f1a16;
          color: #fff;
          border: none;
          padding: 14px 18px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 4px;
          transition: transform 0.15s;
        }
        .pc-upload-btn:hover {
          transform: translateY(-1px);
        }
        .pc-actions {
          display: flex;
          gap: 6px;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: #fff;
          border: 1px solid #e3e6df;
          border-radius: 4px;
          flex-wrap: wrap;
        }
        .pc-btn-icon, .pc-btn-text {
          background: transparent;
          border: none;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #0f1a16;
          transition: background 0.15s;
          border-radius: 3px;
        }
        .pc-btn-icon {
          font-size: 1.2rem;
          padding: 6px 12px;
        }
        .pc-btn-icon:hover, .pc-btn-text:hover {
          background: #f1f4ef;
        }
        .pc-btn-sep {
          width: 1px;
          height: 20px;
          background: #e3e6df;
        }
        .pc-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pc-hints {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          font-size: 0.72rem;
          color: #7a857f;
        }
        .pc-save-btn {
          background: #5e8470;
          color: #fff;
          border: none;
          padding: 10px 18px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 4px;
          transition: all 0.15s;
        }
        .pc-save-btn:hover {
          background: #4a6a5a;
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .pc-wrap { padding: 16px; }
          .pc-hints { font-size: 0.68rem; gap: 10px; }
          .pc-footer { flex-direction: column; align-items: stretch; }
          .pc-save-btn { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
