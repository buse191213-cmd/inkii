"use client";

/**
 * Foto-Mockup Ansicht: echtes Produktfoto + realistische Logo-Überlagerung.
 * Logo lässt sich per Drag&Drop (Maus/Touch) auf dem Produkt verschieben.
 */

import { useRef, useState } from "react";

type Props = {
  photoUrl: string;
  logoUrl: string | null;
  logoScale: number;       // 0.05 – 0.35 (Anteil der Foto-Breite)
  colorOverlay: string;    // Stofffarbe als multiply-Layer
  applyColor: boolean;     // Farbüberlagerung an/aus
  posX: number;            // 0–100 (% horizontal)
  posY: number;            // 0–100 (% vertikal)
  onPositionChange?: (x: number, y: number) => void;
};

export default function PhotoMockup({
  photoUrl,
  logoUrl,
  logoScale,
  colorOverlay,
  applyColor,
  posX,
  posY,
  onPositionChange,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!onPositionChange) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    updatePosition(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    updatePosition(e.clientX, e.clientY);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  }

  function updatePosition(clientX: number, clientY: number) {
    if (!frameRef.current || !onPositionChange) return;
    const rect = frameRef.current.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    // 10–90 % aralığında tut (kenarlardan çıkmasın)
    x = Math.max(10, Math.min(90, x));
    y = Math.max(10, Math.min(90, y));
    onPositionChange(Math.round(x), Math.round(y));
  }

  return (
    <div className="pm-stage">
      <div className="pm-frame" ref={frameRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="Produkt" className="pm-product" draggable={false} />

        {/* Renk overlay artık görsel olarak uygulanmıyor —
            renk seçimi sadece Merkzettel'e bilgi olarak geçer */}

        {logoUrl && (
          <div
            className={`pm-logo ${dragging ? "dragging" : ""} ${onPositionChange ? "draggable" : ""}`}
            style={{
              top: `${posY}%`,
              left: `${posX}%`,
              width: `${Math.round(logoScale * 100)}%`,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" draggable={false} />
          </div>
        )}
      </div>
    </div>
  );
}
