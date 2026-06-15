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

type StepState = { key: string; label?: string; status?: string; info?: unknown };
type Quality = { score: number; status: string; statusIcon?: string };
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
  quality: Quality;
  report?: { summary?: string; recommendations?: string[] };
};

export default function DtfEngine({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, StepState>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC to close
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
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

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

  // Base64 → blob URL for download
  const b64ToBlobUrl = (b64: string, mime: string) => {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  };

  const resultUrl = result?.resultBase64 ? `data:image/png;base64,${result.resultBase64}` : null;

  return (
    <div className="dtf-overlay" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="dtf-modal">
        <div className="dtf-head">
          <div>
            <h3>DTF-Engine V2.2</h3>
            <p className="dtf-sub">Datei optimieren für DTF-Druck</p>
          </div>
          <button className="dtf-close" onClick={onClose} disabled={busy} aria-label="Schließen">✕</button>
        </div>

        <div className="dtf-body">
          {/* Dropzone */}
          {!file && (
            <div
              className={`dtf-dropzone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <div className="dtf-dz-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>
              <p className="dtf-dz-title">Hier klicken oder Datei per Drag &amp; Drop ablegen</p>
              <p className="dtf-dz-sub">PNG, JPG, WebP — max. 25 MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </div>
          )}

          {/* İşleme alanı */}
          {file && (
            <div className="dtf-work">
              <div className="dtf-preview-col">
                <div className="dtf-preview checker">
                  <img src={resultUrl ?? preview ?? ""} alt="Vorschau" />
                </div>
                {result && (
                  <p className="dtf-size">
                    {result.printSizeCm.width} × {result.printSizeCm.height} cm <span>· {result.width} × {result.height} px</span>
                  </p>
                )}
              </div>

              <div className="dtf-steps-col">
                <ul className="dtf-steps">
                  {STEP_DEFS.map((def) => {
                    const s = steps[def.key] || {};
                    return (
                      <li key={def.key} className={`dtf-step ${s.status || ""}`}>
                        <span className="dtf-dot" />
                        <span className="dtf-step-label">{s.label || def.label}</span>
                        <span className="dtf-step-status">
                          {s.status === "running" && <span className="dtf-spin" />}
                          {s.status === "done" && "✓"}
                          {s.status === "skipped" && "—"}
                          {s.status === "error" && "✗"}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {result && (
                  <div className="dtf-badges">
                    <span className={`dtf-badge dtf-q-${result.quality.status}`}>
                      {result.quality.statusIcon || "•"} Qualität: {result.quality.score}/100
                    </span>
                    {result.vectorizable && <span className="dtf-badge dtf-vec">✨ Vektor</span>}
                    {result.bgRemoved && <span className="dtf-badge">🎯 BG entfernt</span>}
                  </div>
                )}

                {error && <p className="dtf-error">{error}</p>}

                {result?.report?.recommendations && result.report.recommendations.length > 0 && (
                  <div className="dtf-recommendations">
                    <strong>Empfehlungen:</strong>
                    <ul>
                      {result.report.recommendations.slice(0, 3).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="dtf-actions">
                  {!result && !busy && (
                    <button className="dtf-btn dtf-btn-primary" onClick={process}>
                      Design optimieren
                    </button>
                  )}
                  {busy && (
                    <button className="dtf-btn dtf-btn-primary" disabled>
                      Wird optimiert…
                    </button>
                  )}
                  {result && resultUrl && (
                    <a
                      className="dtf-btn dtf-btn-primary"
                      href={resultUrl}
                      download={`dtf-${result.id}.png`}
                    >
                      📥 PNG herunterladen
                    </a>
                  )}
                  {result?.vectorSvg && (
                    <a
                      className="dtf-btn dtf-btn-ghost"
                      href={b64ToBlobUrl(btoa(unescape(encodeURIComponent(result.vectorSvg))), "image/svg+xml")}
                      download={`dtf-${result.id}.svg`}
                    >
                      📐 SVG (Vektor)
                    </a>
                  )}
                  {result?.reportPdfBase64 && (
                    <a
                      className="dtf-btn dtf-btn-ghost"
                      href={b64ToBlobUrl(result.reportPdfBase64, "application/pdf")}
                      download={`dtf-report-${result.id}.pdf`}
                    >
                      📊 Bericht (PDF)
                    </a>
                  )}
                  <button className="dtf-btn dtf-btn-ghost" onClick={reset} disabled={busy}>
                    Neues Motiv
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
