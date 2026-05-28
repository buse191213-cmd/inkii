"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";

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

type ProcessStep = "load" | "remove-bg" | "upscale";
const STEP_LABELS: Record<ProcessStep, string> = {
  load: "Datei analysieren",
  "remove-bg": "Hintergrund entfernen (KI)",
  upscale: "Auflösung verbessern (2×)",
};

export default function DesignerClient() {
  const { addOrUpdate } = useMerkliste();
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [logoName, setLogoName] = useState<string>("");
  const [color, setColor] = useState<string>("#ffffff");
  const [colorName, setColorName] = useState<string>("Weiß");
  const [logoScale, setLogoScale] = useState<number>(0.18);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<ProcessStep | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  // Logo Position: %-Werte vom Canvas
  const [logoPos, setLogoPos] = useState<{ top: number; left: number; key: string }>({
    top: 48, left: 50, key: "brust-mitte",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  // Aktiv genutzte Logo-URL (Original oder optimiert)
  const activeLogoUrl = showOriginal ? originalUrl : processedUrl;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setLogoName(file.name);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setProcessError(null);
    setProcessing(true);
    setAdded(false);
    try {
      const { processLogo } = await import("@/lib/logo-process");
      const { original, processed } = await processLogo(file, (step) => {
        setProcessStep(step);
        console.log(`[designer] step: ${step}`);
      });
      console.log("[designer] ✓ Logo processed successfully");
      setOriginalUrl(original);
      setProcessedUrl(processed);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("[designer] Logo-Optimierung fehlgeschlagen:", e);
      console.error("[designer] Error message:", errMsg);
      setProcessError(
        `KI-Hintergrund-Entfernung nicht verfügbar: ${errMsg}. Logo wird ohne Optimierung verwendet.`
      );
      // Fallback: Sadece original'i göster, upscale dahi olmasın
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          setOriginalUrl(url);
          setProcessedUrl(url);
        };
        reader.readAsDataURL(file);
      } catch {
        /* ignore */
      }
    } finally {
      setProcessing(false);
      setProcessStep(null);
    }
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
    const posLabel = {
      "brust-links": "Brust links",
      "brust-mitte": "Brust Mitte",
      "brust-rechts": "Brust rechts",
      "bauch": "Bauch",
    }[logoPos.key] || "Brust Mitte";
    const noteParts: string[] = [];
    if (activeLogoUrl) noteParts.push(`Logo: ${logoName}`);
    noteParts.push(`Position: ${posLabel}`);
    noteParts.push(`Größe: ${Math.round(logoScale * 100)}%`);
    addOrUpdate({
      id,
      code: "DESIGN-TS",
      name: "Individuelles T-Shirt (Designer)",
      qty: 1,
      image: activeLogoUrl ?? null,
      color,
      colorLabel: colorName,
      note: noteParts.join(" · "),
    });
    setAdded(true);
  }

  return (
    <div className="ds-wrap">
      {/* 3D Vorschau */}
      <div className="ds-stage">
        <div
          className="ds-stage-inner"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${color}22 0%, transparent 60%), linear-gradient(180deg, #f4f5f1 0%, #e8ebe6 100%)`,
          }}
        >
          <ShirtViewer color={color} autoRotate={autoRotate} />

          {activeLogoUrl && !processing && (
            <div
              className="ds-logo-overlay"
              style={{
                width: `${Math.round(logoScale * 600)}px`,
                maxWidth: "30%",
                top: `${logoPos.top}%`,
                left: `${logoPos.left}%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeLogoUrl} alt="Ihr Logo" />
            </div>
          )}

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

      {/* Panel */}
      <aside className="ds-panel">
        <div className="ds-panel-head">
          <p className="kicker">3D-Designer</p>
          <h1>Eigenes Design erstellen</h1>
          <p className="ds-lead">
            Laden Sie Ihr Logo hoch — unsere KI entfernt automatisch den Hintergrund
            und verbessert die Auflösung. In 360° auf dem Produkt sichtbar.
          </p>
        </div>

        {/* Logo Upload */}
        <div className="ds-section">
          <div className="ds-section-head">
            <span className="ds-step">01</span>
            <h3>Logo hochladen</h3>
          </div>
          <div
            className={`ds-drop ${processedUrl || originalUrl ? "has-file" : ""} ${processing ? "is-processing" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !processing && fileRef.current?.click()}
          >
            {processing ? (
              <div className="ds-process">
                <div className="ds-spinner" />
                <strong>Dein Design wird optimiert</strong>
                <span>Unsere KI analysiert dein Design für den Druck.</span>
                <ul className="ds-steps">
                  {(Object.keys(STEP_LABELS) as ProcessStep[]).map((s) => {
                    const isDone = processStep && (
                      (processStep === "remove-bg" && s === "load") ||
                      (processStep === "upscale" && (s === "load" || s === "remove-bg"))
                    );
                    const isActive = processStep === s;
                    return (
                      <li key={s} className={isDone ? "done" : isActive ? "active" : ""}>
                        {isDone ? "✓" : isActive ? "⏳" : "○"} {STEP_LABELS[s]}
                      </li>
                    );
                  })}
                </ul>
                <small>Erste KI-Optimierung lädt das Modell (~25 MB, einmalig).</small>
              </div>
            ) : activeLogoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeLogoUrl} alt="Logo Vorschau" className="ds-drop-preview" />
                <div className="ds-drop-info">
                  <strong>{logoName}</strong>
                  <span>Klicken zum Ändern</span>
                  {processedUrl && processedUrl !== originalUrl && (
                    <div className="ds-ai-badges">
                      <span className="ds-badge-ok">✓ Hintergrund entfernt</span>
                      <span className="ds-badge-ok">✓ Auflösung 2×</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <strong>Datei hier ablegen</strong>
                <span>oder klicken zum Auswählen</span>
                <small>PNG, JPG, SVG · KI entfernt den Hintergrund automatisch</small>
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

          {processError && (
            <div className="ds-warn">{processError}</div>
          )}

          {processedUrl && originalUrl && processedUrl !== originalUrl && (
            <button
              type="button"
              className="ds-toggle-orig"
              onClick={() => setShowOriginal((v) => !v)}
            >
              {showOriginal ? "← Optimierte Version" : "Original anzeigen →"}
            </button>
          )}
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

        {/* Logo Größe */}
        {activeLogoUrl && (
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

        {/* Logo Position */}
        {activeLogoUrl && (
          <div className="ds-section">
            <div className="ds-section-head">
              <span className="ds-step">04</span>
              <h3>Position</h3>
              <span className="ds-section-sub">Wo möchten Sie das Logo?</span>
            </div>
            <div className="ds-positions">
              {[
                { key: "brust-links", label: "Brust links", icon: "↖", top: 38, left: 38 },
                { key: "brust-mitte", label: "Brust Mitte", icon: "●", top: 48, left: 50 },
                { key: "brust-rechts", label: "Brust rechts", icon: "↗", top: 38, left: 62 },
                { key: "bauch", label: "Bauch", icon: "↓", top: 62, left: 50 },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`ds-pos-btn ${logoPos.key === p.key ? "active" : ""}`}
                  onClick={() => setLogoPos({ top: p.top, left: p.left, key: p.key })}
                >
                  <span className="ds-pos-icon">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
            <p className="ds-pos-hint">
              💡 Tipp: Modell drehen für Rückseite — Logo bleibt zur besseren Sichtbarkeit auf der Vorderseite.
            </p>
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
                disabled={processing}
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
          <div><strong>✓</strong> KI-gestützte Designoptimierung</div>
          <div><strong>✓</strong> Angebot in 24 Stunden</div>
          <div><strong>✓</strong> Persönliche Beratung</div>
        </div>
      </aside>
    </div>
  );
}
