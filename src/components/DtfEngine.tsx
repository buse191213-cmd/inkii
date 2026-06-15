"use client";

import { useState, useRef, useCallback, useEffect } from "react";

const STEP_DEFS = [
  { key: "analyze",    label: "Datei analysieren" },
  { key: "background", label: "Hintergrund entfernen" },
  { key: "edge",       label: "Kanten reinigen" },
  { key: "upscale",    label: "Auflösung erhöhen" },
  { key: "color",      label: "Farben optimieren" },
  { key: "sharpen",    label: "Kanten schärfen" },
  { key: "vector",     label: "Vektorisierbarkeit prüfen" },
  { key: "quality",    label: "Druckqualität prüfen" },
];

const COLORS = [
  { hex: "#ffffff", isWhite: true,  label: "Weiß"     },
  { hex: "#1f2937", isWhite: false, label: "Schwarz"  },
  { hex: "#6b7280", isWhite: false, label: "Grau"     },
  { hex: "#1e3a5f", isWhite: false, label: "Navy"     },
  { hex: "#1e40af", isWhite: false, label: "Blau"     },
  { hex: "#3b82f6", isWhite: false, label: "Hellblau" },
  { hex: "#16a34a", isWhite: false, label: "Grün"     },
  { hex: "#f59e0b", isWhite: false, label: "Gelb"     },
  { hex: "#ef4444", isWhite: false, label: "Rot"      },
  { hex: "#a855f7", isWhite: false, label: "Lila"     },
];

const GARMENTS = [
  { name: "T-Shirt", w: "Breite: 25 cm",
    svg: <path d="M30 20 L20 28 L25 38 L30 35 L30 80 L70 80 L70 35 L75 38 L80 28 L70 20 L60 20 C55 28 45 28 40 20 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/> },
  { name: "Hoodie", w: "Breite: 25 cm",
    svg: <><path d="M32 22 L20 30 L25 42 L31 38 L31 82 L69 82 L69 38 L75 42 L80 30 L68 22 C60 18 50 24 50 24 C50 24 40 18 32 22 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/><path d="M42 22 C50 32 58 22 58 22" fill="none" stroke="#cbd5e1" strokeWidth="1.2"/></> },
  { name: "Cap", w: "Breite: 7 cm",
    svg: <><path d="M22 56 C22 32 50 32 50 32 C78 32 78 56 78 56 L75 58 C50 50 25 58 25 58 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/><path d="M75 56 L90 60 L88 64 L74 60 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/></> },
  { name: "Polo", w: "Breite: 8 cm",
    svg: <><path d="M32 22 L22 30 L27 40 L32 37 L32 80 L68 80 L68 37 L73 40 L78 30 L68 22 L58 22 L50 30 L42 22 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/><path d="M44 22 L50 32 L56 22" fill="none" stroke="#cbd5e1" strokeWidth="1.2"/></> },
  { name: "Tasche", w: "Breite: 30 cm",
    svg: <><rect x="30" y="35" width="40" height="50" rx="2" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/><path d="M38 35 C38 20 50 20 50 20 C62 20 62 35 62 35" fill="none" stroke="#cbd5e1" strokeWidth="1.5"/></> },
  { name: "Jacke", w: "Breite: 28 cm",
    svg: <><path d="M30 22 L20 30 L25 42 L30 39 L30 82 L70 82 L70 39 L75 42 L80 30 L70 22 L50 26 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5"/><line x1="50" y1="26" x2="50" y2="82" stroke="#cbd5e1" strokeWidth="1"/></> },
];

const PRICE_TIERS = [
  { range: "1–14 Stück",    price: "0,39 €", disc: "–"   },
  { range: "15–49 Stück",   price: "0,31 €", disc: "20%" },
  { range: "50–99 Stück",   price: "0,27 €", disc: "30%" },
  { range: "100–249 Stück", price: "0,23 €", disc: "40%" },
  { range: "250+ Stück",    price: "0,20 €", disc: "50%" },
];

type StepState = { key: string; label?: string; status?: string };
type Result = {
  id: string;
  resultBase64: string;
  vectorSvg: string | null;
  reportPdfBase64: string | null;
  width: number;
  height: number;
  printSizeCm: { width: number; height: number };
  vectorizable: boolean;
  bgRemoved: boolean;
  quality: { score: number; status: string; statusIcon?: string };
};

export default function DtfEngine({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState(COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    setError(null);
    setResult(null);
    setSteps({});
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  const process = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setSteps(Object.fromEntries(STEP_DEFS.map((s) => [s.key, { ...s, status: "pending" }])));

    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/dtf/process-stream", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
      if (!res.body) throw new Error("Stream desteklenmiyor");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() || "";

        for (const block of events) {
          const evtMatch = block.match(/^event: (.+)$/m);
          const dataMatch = block.match(/^data: (.+)$/m);
          if (!evtMatch || !dataMatch) continue;
          const evt = evtMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (evt === "step") {
            setSteps((prev) => ({ ...prev, [data.key]: { ...prev[data.key], ...data } }));
          } else if (evt === "done") {
            setResult(data);
          } else if (evt === "error") {
            setError(data.message);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSteps({});
    setError(null);
  };

  const b64ToBlobUrl = (b64: string, mime: string) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  };

  const resultUrl = result?.resultBase64 ? `data:image/png;base64,${result.resultBase64}` : null;
  const displayImg = resultUrl ?? preview;
  const frameBg = activeColor.isWhite ? "#f1f5f9" : activeColor.hex;
  const dimW = result ? `${result.printSizeCm.width.toString().replace(".", ",")} cm` : "9,45 cm";

  return (
    <div className="dtf-overlay" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="dtf-modal">
        <div className="dtf-head">
          <div className="dtf-head-left">
            <div className="dtf-logo">dtf</div>
            <div>
              <h3>DTF-Engine — Größen-Guide</h3>
              <p className="dtf-sub">Logo yükle · arka plan KI ile temizlensin · kalite en yükseğe çıksın</p>
            </div>
          </div>
          <button className="dtf-close" onClick={onClose} disabled={busy} aria-label="Schließen">✕</button>
        </div>

        <div className="dtf-body">
          {!file && (
            <div
              className={`dtf-dropzone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="dtf-dz-icon">↑</div>
              <p className="dtf-dz-title">Datei hier ablegen oder klicken</p>
              <p className="dtf-dz-sub">PNG · JPG · WebP · GIF</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
          )}

          {file && (
            <>
              <div className="dtf-colors">
                <span className="dtf-colors-lbl">Farbe:</span>
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    className={`dtf-swatch ${c.isWhite ? "white" : ""} ${activeColor.hex === c.hex ? "active" : ""}`}
                    style={{ background: c.hex }}
                    onClick={() => setActiveColor(c)}
                  />
                ))}
              </div>

              <div className="dtf-layout">
                <div className="dtf-products">
                  {GARMENTS.map((g) => (
                    <div key={g.name} className="dtf-product">
                      <div className="dtf-product-frame" style={{ background: frameBg }}>
                        <svg className="dtf-garment" viewBox="0 0 100 100">{g.svg}</svg>
                        {displayImg && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img className="dtf-overlay-img" src={displayImg} alt="" />
                        )}
                      </div>
                      <div className="dtf-product-name">{g.name}</div>
                      <div className="dtf-product-w">{g.w}</div>
                    </div>
                  ))}
                </div>

                <div className="dtf-right">
                  <div className="dtf-dim-w">{dimW}</div>
                  <div className="dtf-preview-box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {displayImg && <img src={displayImg} alt="Vorschau" />}
                  </div>
                  <div className="dtf-dim-cap">Maße in cm</div>

                  <div className="dtf-price-card">
                    <h4>Spare mehr: Mit mehr Transfers!</h4>
                    <table className="dtf-price-table">
                      <thead>
                        <tr><th>Menge</th><th>Preis</th><th>Rabatt</th></tr>
                      </thead>
                      <tbody>
                        {PRICE_TIERS.map((t, i) => (
                          <tr key={t.range} className={i === 0 ? "active" : ""}>
                            <td>{t.range}</td>
                            <td>{t.price}</td>
                            <td>{t.disc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="dtf-price-hint">
                      Füge 14 weitere Transfers hinzu und erhalte 20% Rabatt.
                    </div>
                  </div>

                  <div className="dtf-engine">
                    <div className="dtf-engine-head">
                      <b>DTF1</b> · DTF-Engine V2.2
                    </div>
                    <div className="dtf-engine-rows">
                      {STEP_DEFS.map((def) => {
                        const s = steps[def.key] || {};
                        let icon: React.ReactNode = "";
                        if (s.status === "done") icon = "✓";
                        else if (s.status === "running") icon = <span className="dtf-spin-inline" />;
                        else if (s.status === "skipped") icon = "–";
                        else if (s.status === "error") icon = "!";
                        return (
                          <div key={def.key} className={`dtf-erow ${s.status || "idle"}`}>
                            <span className="dtf-erow-dot">{icon}</span>
                            <span className="dtf-erow-lbl">{s.label || def.label}</span>
                            {def.key === "background" && s.status === "done" && (
                              <span className="dtf-erow-right">Original anzeigen</span>
                            )}
                          </div>
                        );
                      })}

                      {result?.vectorizable && resultUrl && (
                        <div className="dtf-erow done dtf-vector-row">
                          <div className="dtf-vector-thumbs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resultUrl} alt="" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resultUrl} alt="" />
                          </div>
                          <span className="dtf-erow-lbl">
                            ✨ Vektor-Version bereit{" "}
                            <small style={{ color: "#94a3b8" }}>(optional)</small>
                          </span>
                        </div>
                      )}

                      {result && (
                        <div className={`dtf-erow done dtf-quality-row dtf-q-${result.quality.status}`}>
                          <span className="dtf-erow-dot">{result.quality.statusIcon || "★"}</span>
                          <span className="dtf-erow-lbl">
                            Druckqualität: <b>{result.quality.score}/100</b>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {error && <div className="dtf-errbox">{error}</div>}

                  <div className="dtf-actions-row">
                    {!result && (
                      <button
                        type="button"
                        className="dtf-btn-action primary"
                        onClick={process}
                        disabled={busy}
                      >
                        {busy ? "Wird optimiert…" : "Design optimieren"}
                      </button>
                    )}
                    {result && resultUrl && (
                      <a
                        className="dtf-btn-action primary"
                        href={resultUrl}
                        download={`dtf-transfer-${result.id}.png`}
                      >
                        📥 PNG
                      </a>
                    )}
                    {result?.vectorSvg && (
                      <a
                        className="dtf-btn-action ghost"
                        href={b64ToBlobUrl(btoa(unescape(encodeURIComponent(result.vectorSvg))), "image/svg+xml")}
                        download={`dtf-vector-${result.id}.svg`}
                      >
                        📐 SVG
                      </a>
                    )}
                    {result?.reportPdfBase64 && (
                      <a
                        className="dtf-btn-action ghost"
                        href={b64ToBlobUrl(result.reportPdfBase64, "application/pdf")}
                        download={`dtf-report-${result.id}.pdf`}
                      >
                        📊 Bericht
                      </a>
                    )}
                    <button type="button" className="dtf-btn-action ghost" onClick={reset} disabled={busy}>
                      Neues Motiv
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
