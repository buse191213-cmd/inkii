"use client";

import { useState, useEffect } from "react";

type CropValues = { zoom: number; x: number; y: number };

/**
 * Vitrin görseli için interaktif kırpma editörü.
 * Zoom (1x-3x) + X/Y offset (-100% to 100%) slider'larıyla preview gösterir.
 * Form submit'e hidden input "cardCrop" JSON olarak gönderir.
 */
export default function CropEditor({
  firstImage,
  initial,
}: {
  firstImage?: string;
  initial: CropValues;
}) {
  const [zoom, setZoom] = useState(initial.zoom || 1);
  const [x, setX] = useState(initial.x || 0);
  const [y, setY] = useState(initial.y || 0);

  // Initial değişirse (ürün değişimi) state'i yenile
  useEffect(() => {
    setZoom(initial.zoom || 1);
    setX(initial.x || 0);
    setY(initial.y || 0);
  }, [initial.zoom, initial.x, initial.y]);

  const cropJson = JSON.stringify({ zoom, x, y });
  const transform = `scale(${zoom}) translate(${x}%, ${y}%)`;

  return (
    <div>
      <input type="hidden" name="cardCrop" value={cropJson} readOnly />

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Preview (kare 240px) */}
        <div
          style={{
            width: 240,
            height: 240,
            background: "#f4f5f3",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {firstImage ? (() => {
            const hasCrop = zoom !== 1 || x !== 0 || y !== 0;
            if (!hasCrop) {
              return (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={firstImage}
                  alt="Vitrin-Vorschau"
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }}
                />
              );
            }
            const posX = 50 + x;
            const posY = 50 - y;
            const sizePercent = 100 * zoom;
            return (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url("${firstImage}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: `${sizePercent}% auto`,
                  backgroundPosition: `${posX}% ${posY}%`,
                  transition: "background-position 0.1s ease, background-size 0.1s ease",
                }}
              />
            );
          })() : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>
              Erst ein Produktbild oben hochladen, dann hier zuschneiden.
            </div>
          )}
          {/* Crop frame outline */}
          <div style={{
            position: "absolute", inset: 0, border: "2px dashed rgba(20, 184, 166, 0.5)", pointerEvents: "none"
          }} />
        </div>

        {/* Slider'lar */}
        <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 4px", lineHeight: 1.4 }}>
            💡 Hızlı seçim için butonlara basın. İnce ayar için slider'ları kullanın.
          </p>

          {/* Hızlı yön butonları */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 4px" }}
              onClick={() => { setX(0); setY(35); }}>↑ Üst (Kapuze)</button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 4px" }}
              onClick={() => { setX(0); setY(0); setZoom(1); }}>⊙ Mitte</button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 4px" }}
              onClick={() => { setX(0); setY(-35); }}>↓ Unten</button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 4px" }}
              onClick={() => { setX(-35); setY(0); }}>← Links</button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 4px" }}
              onClick={() => { setZoom(Math.min(3, zoom + 0.2)); }}>🔍+ Zoom</button>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 4px" }}
              onClick={() => { setX(35); setY(0); }}>Rechts →</button>
          </div>

          <SliderField
            label="Zoom"
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={setZoom}
            unit="x"
            format={(v) => v.toFixed(2)}
          />
          <SliderField
            label="Horizontal (← Links | Rechts →)"
            value={x}
            min={-50}
            max={50}
            step={1}
            onChange={setX}
            unit="%"
            format={(v) => v > 0 ? `+${v} (rechts)` : v < 0 ? `${v} (links)` : "Mitte"}
          />
          <SliderField
            label="Vertikal (↑ Oben | Unten ↓)"
            value={y}
            min={-50}
            max={50}
            step={1}
            onChange={setY}
            unit="%"
            format={(v) => v > 0 ? `+${v} (oben/Kapuze)` : v < 0 ? `${v} (unten)` : "Mitte"}
          />
          <button
            type="button"
            onClick={() => { setZoom(1); setX(0); setY(0); }}
            className="btn btn-ghost"
            style={{ alignSelf: "flex-start", fontSize: 12 }}
          >
            ↺ Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label, value, min, max, step, onChange, unit, format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit: string;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, fontWeight: 600, color: "#1c2722" }}>
        <span>{label}</span>
        <span style={{ color: "#64748b", fontWeight: 500 }}>{format(value)}{unit}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}
