"use client";

import { useState, useRef, useEffect } from "react";

type PrintAreaBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  widthCm: number;
  heightCm: number;
};

/**
 * Admin: ürün görseli üstünde baskı alanını fareyle sürükleyerek çizer.
 * Werbeartikel (çanta, şapka vb.) için — her ürünün farklı görseli olduğundan
 * sabit preset yerine manuel çizim daha doğru.
 * Form submit'e hidden input "customPrintArea" JSON olarak gönderir.
 * Boş bırakılırsa (temizlenirse) preset (printAreaType) kullanılır.
 */
export default function PrintAreaEditor({
  firstImage,
  initial,
}: {
  firstImage?: string;
  initial?: PrintAreaBox | null;
}) {
  const [box, setBox] = useState<PrintAreaBox | null>(initial ?? null);
  const [widthCm, setWidthCm] = useState(initial?.widthCm ?? 25);
  const [heightCm, setHeightCm] = useState(initial?.heightCm ?? 30);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawStart = useRef<{ x: number; y: number } | null>(null);
  const [drawing, setDrawing] = useState(false);
  /**
   * Rahmen übernimmt das Seitenverhältnis des Bildes — genau wie die
   * Shop-Galerie. Dadurch füllt das Bild den Rahmen komplett aus (kein
   * Leerraum durch contain) und die gezeichneten Prozentwerte liegen im
   * Shop exakt an derselben Stelle — auf Desktop wie auf dem Handy.
   */
  const [imgAspect, setImgAspect] = useState<number | null>(null);

  useEffect(() => {
    if (!firstImage) { setImgAspect(null); return; }
    let cancelled = false;
    const im = new window.Image();
    im.onload = () => {
      if (!cancelled && im.naturalWidth && im.naturalHeight) {
        setImgAspect(im.naturalWidth / im.naturalHeight);
      }
    };
    im.src = firstImage;
    return () => { cancelled = true; };
  }, [firstImage]);

  useEffect(() => {
    if (initial) {
      setBox(initial);
      setWidthCm(initial.widthCm);
      setHeightCm(initial.heightCm);
    }
  }, [initial?.left, initial?.top]);

  function pointToPercent(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const p = pointToPercent(e.clientX, e.clientY);
    drawStart.current = p;
    setDrawing(true);
    setBox({ left: p.x, top: p.y, right: p.x, bottom: p.y, widthCm, heightCm });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!drawing || !drawStart.current) return;
    const p = pointToPercent(e.clientX, e.clientY);
    const s = drawStart.current;
    setBox({
      left: Math.min(s.x, p.x),
      top: Math.min(s.y, p.y),
      right: Math.max(s.x, p.x),
      bottom: Math.max(s.y, p.y),
      widthCm,
      heightCm,
    });
  }

  function handleMouseUp() {
    setDrawing(false);
    drawStart.current = null;
  }

  function clearBox() {
    setBox(null);
  }

  const finalBox = box
    ? { ...box, widthCm, heightCm }
    : null;
  const json = finalBox ? JSON.stringify(finalBox) : "";

  return (
    <div>
      <input type="hidden" name="customPrintArea" value={json} readOnly />

      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10, lineHeight: 1.5 }}>
        <strong>Werbeartikel (Tasche, Cap, Tasse…):</strong> Ziehen Sie mit der Maus ein Rechteck über das Produktbild,
        um den Druckbereich zu definieren. Für Textilien (T-Shirt, Hoodie) leer lassen — dann wird der Standard verwendet.
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: 320,
            aspectRatio: "4 / 3",
            background: "#f4f5f3",
            border: "1px solid #e5e7eb",
            position: "relative",
            flexShrink: 0,
            cursor: "crosshair",
            userSelect: "none",
            overflow: "hidden",
          }}
        >
          {firstImage ? (
            <img
              src={firstImage}
              alt="Produkt"
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>
              Kein Bild
            </div>
          )}

          {/* Çizilen baskı alanı */}
          {box && (
            <div
              style={{
                position: "absolute",
                left: `${box.left}%`,
                top: `${box.top}%`,
                width: `${box.right - box.left}%`,
                height: `${box.bottom - box.top}%`,
                border: "2px dashed #004537",
                background: "rgba(0, 69, 55, 0.12)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        {/* Kontroller */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Druckbreite (cm)
            </label>
            <input
              type="number"
              min={1}
              value={widthCm}
              onChange={(e) => setWidthCm(Number(e.target.value))}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 4 }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Druckhöhe (cm)
            </label>
            <input
              type="number"
              min={1}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 4 }}
            />
          </div>

          {box && (
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
              Position: {Math.round(box.left)}% / {Math.round(box.top)}% —{" "}
              {Math.round(box.right)}% / {Math.round(box.bottom)}%
            </div>
          )}

          <button
            type="button"
            onClick={clearBox}
            style={{
              background: "#f1f5f9",
              color: "#475569",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Zurücksetzen (Standard verwenden)
          </button>
        </div>
      </div>
    </div>
  );
}
