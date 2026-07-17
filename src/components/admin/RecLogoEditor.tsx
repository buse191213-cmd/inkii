"use client";

import { useRef, useState } from "react";

export type LogoPos = { x: number; y: number; width: number; rotation: number };

/**
 * Editor für die Logo-Position auf EINEM empfohlenen Produkt.
 *
 * Einfaches, robustes Koordinatensystem: Alle Prozentwerte (x, y, width)
 * beziehen sich auf den QUADRATISCHEN Rahmen, NICHT auf die sichtbare
 * Bildfläche. Das Produktbild liegt per object-fit:contain zentriert im
 * Rahmen — und auf der Website liegt dasselbe Bild ebenso in einer
 * quadratischen Karte. „50 % des Rahmens" = „50 % der Karte", ohne
 * Letterbox-Umrechnung (die zuvor die Fehlerquelle war).
 */
export default function RecLogoEditor({
  image,
  value,
  onChange,
}: {
  image: string | null;
  value: LogoPos;
  onChange: (v: LogoPos) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function pointerToPercent(e: React.PointerEvent | PointerEvent) {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }

  function handleDown(e: React.PointerEvent) {
    e.preventDefault();
    setDragging(true);
    frameRef.current?.setPointerCapture?.(e.pointerId);
    const p = pointerToPercent(e);
    if (p) onChange({ ...value, x: p.x, y: p.y });
  }

  function handleMove(e: React.PointerEvent) {
    if (!dragging) return;
    const p = pointerToPercent(e);
    if (p) onChange({ ...value, x: p.x, y: p.y });
  }

  function handleUp() {
    setDragging(false);
  }

  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div
        ref={frameRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        style={{
          width: 380,
          height: 380,
          maxWidth: "100%",
          aspectRatio: "1 / 1",
          background: "#f4f5f3",
          outline: "1px solid #e5e7eb",
          borderRadius: 6,
          position: "relative",
          flexShrink: 0,
          cursor: "crosshair",
          overflow: "hidden",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Produkt"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#94a3b8", fontSize: 12 }}>
            Kein Bild
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: `${value.x}%`,
            top: `${value.y}%`,
            width: `${value.width}%`,
            aspectRatio: "1 / 1",
            transform: `translate(-50%, -50%) rotate(${value.rotation}deg)`,
            border: "1.5px dashed #004537",
            background: "rgba(0,69,55,.14)",
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            color: "#004537",
            fontWeight: 700,
            pointerEvents: "none",
          }}
        >
          LOGO
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 180 }}>
        <div>
          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 4 }}>
            Größe: {Math.round(value.width)}%
          </label>
          <input
            type="range"
            min={8}
            max={70}
            value={value.width}
            onChange={(e) => onChange({ ...value, width: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 4 }}>
            Drehung: {Math.round(value.rotation)}°
          </label>
          <input
            type="range"
            min={-180}
            max={180}
            value={value.rotation}
            onChange={(e) => onChange({ ...value, rotation: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
          Klicken oder ziehen Sie im Bild, um die Logo-Position zu setzen.
        </p>
      </div>
    </div>
  );
}
