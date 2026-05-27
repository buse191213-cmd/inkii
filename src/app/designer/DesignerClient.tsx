"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";

// Three.js komponenti SSR'siz yükle — sunucuda WebGL çalışmaz
const ShirtViewer = dynamic(() => import("./ShirtViewer"), {
  ssr: false,
  loading: () => (
    <div className="ds-loading">
      <div className="ds-spinner" />
      <p>3D-Modell wird geladen…</p>
    </div>
  ),
});

const COLORS: { hex: string; name: string }[] = [
  { hex: "#ffffff", name: "Weiß" },
  { hex: "#1c1c1c", name: "Schwarz" },
  { hex: "#7a7a7a", name: "Grau" },
  { hex: "#1c2e4a", name: "Navy" },
  { hex: "#2d5a8a", name: "Blau" },
  { hex: "#3d7045", name: "Grün" },
  { hex: "#b8463a", name: "Rot" },
  { hex: "#d9a878", name: "Beige" },
  { hex: "#e6b800", name: "Gelb" },
  { hex: "#6b3e8a", name: "Lila" },
];

export default function DesignerClient() {
  const { addOrUpdate } = useMerkliste();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string>("");
  const [color, setColor] = useState<string>("#ffffff");
  const [colorName, setColorName] = useState<string>("Weiß");
  const [logoScale, setLogoScale] = useState<number>(0.18);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleSelectColor(hex: string, name: string) {
    setColor(hex);
    setColorName(name);
    setAdded(false);
  }

  function handleAddToMerkliste() {
    const id = `designer-tshirt-${Date.now()}`;
    addOrUpdate({
      id,
      code: "DESIGN-TS",
      name: "Individuelles T-Shirt (Designer)",
      qty: 1,
      image: logoUrl ?? null,
      color,
      colorLabel: colorName,
      note: logoUrl ? `Mit eigenem Design (${logoName})` : "Ohne Design – nur Farbe",
    });
    setAdded(true);
  }

  return (
    <div className="ds-wrap">
      {/* Linke Spalte: 3D-Vorschau */}
      <div className="ds-stage">
        <div
          className="ds-stage-inner"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${color}22 0%, transparent 60%), linear-gradient(180deg, #f4f5f1 0%, #e8ebe6 100%)`,
          }}
        >
          <ShirtViewer
            modelUrl="/models/tshirt.glb"
            color={color}
            logoUrl={logoUrl}
            logoScale={logoScale}
            autoRotate={autoRotate}
          />
          <div className="ds-stage-hint">
            <span>🖱️ Ziehen zum Drehen · Scrollen für Zoom</span>
          </div>
          <button
            type="button"
            className={`ds-rotate-btn ${autoRotate ? "active" : ""}`}
            onClick={() => setAutoRotate((v) => !v)}
            title="Auto-Rotation"
          >
            {autoRotate ? "⏸ Stop" : "▶ Auto-Rotation"}
          </button>
        </div>
      </div>

      {/* Rechte Spalte: Kontroller */}
      <aside className="ds-panel">
        <div className="ds-panel-head">
          <p className="kicker">3D-Designer</p>
          <h1>Eigenes Design erstellen</h1>
          <p className="ds-lead">
            Laden Sie Ihr Logo hoch, wählen Sie Farbe und Größe — sehen Sie Ihr Design
            in 360° auf dem Produkt.
          </p>
        </div>

        {/* Logo-Upload */}
        <div className="ds-section">
          <div className="ds-section-head">
            <span className="ds-step">01</span>
            <h3>Logo hochladen</h3>
          </div>
          <div
            className={`ds-drop ${logoUrl ? "has-file" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            {logoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo Vorschau" className="ds-drop-preview" />
                <div className="ds-drop-info">
                  <strong>{logoName}</strong>
                  <span>Klicken zum Ändern</span>
                </div>
              </>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <strong>Datei hier ablegen</strong>
                <span>oder klicken zum Auswählen</span>
                <small>PNG, JPG, SVG · transparent empfohlen</small>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>
        </div>

        {/* Farbe */}
        <div className="ds-section">
          <div className="ds-section-head">
            <span className="ds-step">02</span>
            <h3>Farbe wählen</h3>
            <span className="ds-section-sub">{colorName}</span>
          </div>
          <div className="ds-colors">
            {COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`ds-color ${color === c.hex ? "active" : ""}`}
                style={{ background: c.hex }}
                onClick={() => handleSelectColor(c.hex, c.name)}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        {/* Logo-Größe */}
        {logoUrl && (
          <div className="ds-section">
            <div className="ds-section-head">
              <span className="ds-step">03</span>
              <h3>Logo-Größe</h3>
              <span className="ds-section-sub">{Math.round(logoScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.35}
              step={0.01}
              value={logoScale}
              onChange={(e) => setLogoScale(Number(e.target.value))}
              className="ds-slider"
            />
            <div className="ds-slider-labels">
              <small>Klein</small>
              <small>Groß</small>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="ds-section ds-section-cta">
          {added ? (
            <div className="ds-success">
              <strong>✓ Zum Merkzettel hinzugefügt!</strong>
              <p>Ihr individuelles Design ist gespeichert.</p>
              <Link href="/merkzettel" className="btn-primary">
                Anfrage abschicken →
              </Link>
              <button type="button" className="btn-ghost" onClick={() => setAdded(false)}>
                Weiteres Design
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-primary ds-cta"
                onClick={handleAddToMerkliste}
              >
                Auf Merkzettel hinzufügen
              </button>
              <p className="ds-cta-note">
                Wir erstellen ein unverbindliches Angebot mit Ihrem Design — Antwort innerhalb von 24 Stunden.
              </p>
            </>
          )}
        </div>

        <div className="ds-trust">
          <div><strong>✓</strong> Kostenlose Designvorschläge</div>
          <div><strong>✓</strong> Angebot in 24 Stunden</div>
          <div><strong>✓</strong> Persönliche Beratung</div>
        </div>
      </aside>
    </div>
  );
}
