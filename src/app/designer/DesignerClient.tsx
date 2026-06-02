"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useMerkliste } from "@/components/MerklisteProvider";
import type { Dictionary } from "@/dictionaries/types";

// 3D ProductViewer kaldırıldı — sadece admin'den yüklenen ürün foto'ları kullanılıyor

import PhotoMockup from "./PhotoMockup";

type ProductPhotos = {
  tshirt: string | null;
  hoodie: string | null;
  cap: string | null;
  tote: string | null;
};

type DD = Dictionary["designer"];
type ProductKey = "tshirt" | "hoodie" | "cap" | "tote";

const PRODUCT_KEYS: ProductKey[] = ["tshirt", "hoodie", "cap", "tote"];
const PRODUCT_ICONS: Record<ProductKey, string> = { tshirt: "👕", hoodie: "🧥", cap: "🧢", tote: "🛍️" };
const PRODUCT_CODES: Record<ProductKey, string> = { tshirt: "DESIGN-TS", hoodie: "DESIGN-HD", cap: "DESIGN-CAP", tote: "DESIGN-TOTE" };

const POSITION_KEYS_PER_PRODUCT: Record<ProductKey, string[]> = {
  tshirt: ["brust-links", "brust-mitte", "brust-rechts", "bauch"],
  hoodie: ["brust-links", "brust-mitte", "brust-rechts", "kapuze"],
  cap:    ["vorne"],
  tote:   ["mitte", "oben"],
};

const DEFAULT_POS: Record<ProductKey, string> = {
  tshirt: "brust-mitte", hoodie: "brust-mitte", cap: "vorne", tote: "mitte",
};

const POSITION_ICONS: Record<string, string> = {
  "brust-mitte": "●", "brust-links": "↖", "brust-rechts": "↗",
  "bauch": "↓", "kapuze": "⌒", "vorne": "●", "mitte": "●", "oben": "↑",
};

const COLOR_KEYS = ["weiss", "schwarz", "grau", "navy", "blau", "gruen", "rot", "beige", "gelb", "lila"] as const;
const COLOR_HEX: Record<typeof COLOR_KEYS[number], string> = {
  weiss: "#ffffff", schwarz: "#1c1c1c", grau: "#7a7a7a", navy: "#1c2e4a", blau: "#2d5a8a",
  gruen: "#3d7045", rot: "#b8463a", beige: "#d9a878", gelb: "#e6b800", lila: "#6b3e8a",
};

type ProcessStep = "load" | "remove-bg" | "upscale";

export default function DesignerClient({ productPhotos, d }: { productPhotos: ProductPhotos; d: DD }) {
  const { addOrUpdate } = useMerkliste();
  const [product, setProduct] = useState<ProductKey>("tshirt");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [logoName, setLogoName] = useState<string>("");
  const [color, setColor] = useState<string>("#ffffff");
  const [colorName, setColorName] = useState<string>("Weiß");
  const [added, setAdded] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<ProcessStep | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [logoPos, setLogoPos] = useState<string>("brust-mitte");
  // Her ürün için ayrı pozisyon + boyut (foto-mockup modunda)
  type ProdPos = { x: number; y: number; scale: number };
  const [positions, setPositions] = useState<Record<ProductKey, ProdPos>>({
    tshirt: { x: 50, y: 40, scale: 0.20 },
    hoodie: { x: 50, y: 38, scale: 0.20 },
    cap:    { x: 50, y: 45, scale: 0.30 },
    tote:   { x: 50, y: 50, scale: 0.30 },
  });
  const curPos = positions[product];
  const logoX = curPos.x;
  const logoY = curPos.y;
  const logoScale = curPos.scale;
  function updatePos(patch: Partial<ProdPos>) {
    setPositions((prev) => ({ ...prev, [product]: { ...prev[product], ...patch } }));
  }
  // Druckvorschau-Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeLogoUrl = showOriginal ? originalUrl : processedUrl;
  const positionKeys = POSITION_KEYS_PER_PRODUCT[product];
  const productInfo = { code: PRODUCT_CODES[product], label: d.products[product].label };

  // Bu ürün için admin foto yüklediyse → foto-mockup, yoksa → 3D model
  const productPhoto = productPhotos[product];
  const useMockup = !!productPhoto;
  // Beyaz dışı renk seçilince renk katmanı uygula (foto-mockup'ta)
  const colorNeedsOverlay = color.toLowerCase() !== "#ffffff";

  function switchProduct(key: ProductKey) {
    setProduct(key);
    setLogoPos(DEFAULT_POS[key]);
    setAdded(false);
  }

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
      console.log("[designer] ✓ Logo processed");
      setOriginalUrl(original);
      setProcessedUrl(processed);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("[designer] Fehler:", e);
      setProcessError(`KI-Optimierung nicht verfügbar: ${errMsg}. Logo wird ohne Optimierung verwendet.`);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          setOriginalUrl(url);
          setProcessedUrl(url);
        };
        reader.readAsDataURL(file);
      } catch { /* ignore */ }
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
    setColor(hex); setColorName(name); setAdded(false);
  }

  // Foto-Mockup als ein Bild zusammenfügen (Produkt + Farbe + Logo)
  async function captureMockup(): Promise<string | null> {
    if (!useMockup || !productPhoto) return activeLogoUrl;
    try {
      const loadImg = (src: string): Promise<HTMLImageElement> =>
        new Promise((res, rej) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = src;
        });
      const product = await loadImg(productPhoto);
      const canvas = document.createElement("canvas");
      // Mobil için tavan: 1600px
      const MAX = 1600;
      const srcW = product.naturalWidth || 1000;
      const srcH = product.naturalHeight || 1200;
      const scale = Math.min(1, MAX / Math.max(srcW, srcH));
      canvas.width = Math.round(srcW * scale);
      canvas.height = Math.round(srcH * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return activeLogoUrl;

      // 1) Ürün fotoğrafı
      ctx.drawImage(product, 0, 0, canvas.width, canvas.height);

      // 2) Renk katmanı (multiply)
      if (colorNeedsOverlay) {
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
      }

      // 3) Logo (doğru pozisyon + boyut, multiply blend)
      if (activeLogoUrl) {
        const logo = await loadImg(activeLogoUrl);
        const lw = canvas.width * logoScale;
        const lh = lw * (logo.naturalHeight / Math.max(1, logo.naturalWidth));
        const cx = (canvas.width * logoX) / 100;
        const cy = (canvas.height * logoY) / 100;
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(logo, cx - lw / 2, cy - lh / 2, lw, lh);
        ctx.globalCompositeOperation = "source-over";
      }

      return canvas.toDataURL("image/png");
    } catch (e) {
      console.error("[designer] Mockup-Aufnahme fehlgeschlagen:", e);
      return activeLogoUrl; // Fallback: nur Logo
    }
  }

  async function openPreview() {
    setPreviewLoading(true);
    try {
      const img = await captureMockup();
      setPreviewImage(img ?? activeLogoUrl);
    } catch {
      setPreviewImage(activeLogoUrl);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleAddToMerkliste() {
    const id = `designer-${product}-${Date.now()}`;
    // 3D modunda pozisyon anahtarı (örn "brust-mitte") → dict key (brustMitte)
    const posDictKey = logoPos.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof DD["positions"];
    const posLabel = useMockup
      ? `X:${logoX}% Y:${logoY}%`
      : (d.positions[posDictKey] || logoPos);
    const noteParts: string[] = [];
    if (activeLogoUrl) noteParts.push(`${d.note.logo}: ${logoName}`);
    noteParts.push(`${d.note.position}: ${posLabel}`);
    noteParts.push(`${d.note.size}: ${Math.round(logoScale * 100)}%`);

    // Tam tasarım görüntüsünü yakala
    const designImage = await captureMockup();

    addOrUpdate({
      id,
      code: productInfo.code,
      name: `${d.productName} ${productInfo.label} (Designer)`,
      qty: 1,
      image: designImage ?? activeLogoUrl ?? null,
      color,
      colorLabel: colorName,
      note: noteParts.join(" · "),
    });
    setAdded(true);
  }

  return (
    <div className="ds-wrap">
      <div className="ds-stage">
        <div className="ds-stage-inner">
          {/* 2x2 grid: 4 ürün hepsi mockup olarak yan yana */}
          <div className="ds-mockup-grid">
            {PRODUCT_KEYS.map((key) => {
              const photo = productPhotos[key];
              const productLabel = d.products[key].label;
              const isActive = product === key;
              const pos = positions[key];
              return (
                <div
                  key={key}
                  className={`ds-mockup-cell ${isActive ? "active" : ""}`}
                  onClick={() => switchProduct(key)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="ds-mockup-label">{productLabel}</div>
                  {photo ? (
                    <div className="ds-mockup-frame">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={productLabel} className="ds-mockup-photo" draggable={false} />
                      {activeLogoUrl && (
                        <div
                          className="ds-mockup-logo"
                          style={{
                            top: `${pos.y}%`,
                            left: `${pos.x}%`,
                            width: `${Math.round(pos.scale * 100)}%`,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activeLogoUrl} alt="" draggable={false} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="ds-mockup-frame empty">
                      <span className="ds-mockup-icon">{PRODUCT_ICONS[key]}</span>
                      <small>Admin&apos;den foto yükle</small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {activeLogoUrl && (
            <button type="button" className="ds-preview-btn"
              onClick={() => void openPreview()} disabled={previewLoading}>
              {previewLoading ? "…" : d.preview.btn}
            </button>
          )}
        </div>
      </div>

      <aside className="ds-panel">
        <div className="ds-panel-head">
          <p className="kicker">{d.kicker}</p>
          <h1>{d.title}</h1>
          <p className="ds-lead">{d.lead}</p>
        </div>

        {/* Produkt-Auswahl — gerçek foto'larla kart */}
        <div className="ds-section">
          <div className="ds-section-head">
            <span className="ds-step">01</span>
            <h3>{d.steps.product}</h3>
          </div>
          <div className="ds-products-grid">
            {PRODUCT_KEYS.map((key) => {
              const p = d.products[key];
              const photo = productPhotos[key];
              const isActive = product === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`ds-prod-card ${isActive ? "active" : ""}`}
                  onClick={() => switchProduct(key)}
                  title={p.label}
                >
                  <div className="ds-prod-card-photo">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={p.label} draggable={false} />
                    ) : (
                      <span className="ds-prod-card-icon">{PRODUCT_ICONS[key]}</span>
                    )}
                  </div>
                  <div className="ds-prod-card-name">{p.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logo Upload */}
        <div className="ds-section">
          <div className="ds-section-head">
            <span className="ds-step">02</span>
            <h3>{d.steps.upload}</h3>
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
                <strong>{d.processing.title}</strong>
                <span>{d.processing.sub}</span>
                <ul className="ds-steps">
                  {(["load", "remove-bg", "upscale"] as ProcessStep[]).map((s) => {
                    const isDone = processStep && (
                      (processStep === "remove-bg" && s === "load") ||
                      (processStep === "upscale" && (s === "load" || s === "remove-bg"))
                    );
                    const isActive = processStep === s;
                    const label = s === "load" ? d.processSteps.load
                      : s === "remove-bg" ? d.processSteps.removeBg
                      : d.processSteps.upscale;
                    return (
                      <li key={s} className={isDone ? "done" : isActive ? "active" : ""}>
                        {isDone ? "✓" : isActive ? "⏳" : "○"} {label}
                      </li>
                    );
                  })}
                </ul>
                <small>{d.processing.modelNote}</small>
              </div>
            ) : activeLogoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeLogoUrl} alt="Logo" className="ds-drop-preview" />
                <div className="ds-drop-info">
                  <strong>{logoName}</strong>
                  <span>{d.upload.change}</span>
                  {processedUrl && processedUrl !== originalUrl && (
                    <div className="ds-ai-badges">
                      <span className="ds-badge-ok">✓ {d.badges.bgRemoved}</span>
                      <span className="ds-badge-ok">✓ {d.badges.upscaled}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <strong>{d.upload.drop}</strong>
                <span>{d.upload.or}</span>
                <small>{d.upload.hint}</small>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          {processError && <div className="ds-warn">{d.warn}</div>}

          {processedUrl && originalUrl && processedUrl !== originalUrl && (
            <div className="ds-compare">
              <div className="ds-compare-title">{d.compare.title}</div>
              <div className="ds-compare-grid">
                <div className="ds-compare-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt={d.compare.before} />
                  <span>{d.compare.before}</span>
                </div>
                <div className="ds-compare-arrow">→</div>
                <div className="ds-compare-item highlighted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={processedUrl} alt={d.compare.after} />
                  <span>✨ {d.compare.after}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Farbe */}
        <div className="ds-section">
          <div className="ds-section-head">
            <span className="ds-step">03</span>
            <h3>{d.steps.color}</h3>
            <span className="ds-section-sub">{colorName}</span>
          </div>
          <div className="ds-colors">
            {COLOR_KEYS.map((k) => {
              const hex = COLOR_HEX[k];
              const name = d.colors[k];
              return (
                <button key={hex} type="button" style={{ background: hex }}
                  className={`ds-color ${color === hex ? "active" : ""}`}
                  onClick={() => handleSelectColor(hex, name)} title={name} aria-label={name} />
              );
            })}
          </div>
        </div>

        {/* Logo Größe */}
        {activeLogoUrl && (
          <div className="ds-section">
            <div className="ds-section-head">
              <span className="ds-step">04</span>
              <h3>{d.steps.size}</h3>
              <span className="ds-section-sub">{Math.round(logoScale * 100)}%</span>
            </div>
            <input type="range" min={0.05} max={0.35} step={0.01}
              value={logoScale} onChange={(e) => updatePos({ scale: Number(e.target.value) })}
              className="ds-slider" />
            <div className="ds-slider-labels">
              <small>{d.sizeLabel.small}</small><small>{d.sizeLabel.big}</small>
            </div>
          </div>
        )}

        {/* Position — Foto-Modus: freie X/Y-Slider, 3D-Modus: Presets */}
        {activeLogoUrl && useMockup && (
          <div className="ds-section">
            <div className="ds-section-head">
              <span className="ds-step">05</span>
              <h3>{d.steps.position}</h3>
              <span className="ds-section-sub">{d.position.freePlace}</span>
            </div>
            <label className="ds-pos-slider-label">
              <span>{d.position.horizontal}</span>
              <input type="range" min={10} max={90} step={1} value={logoX}
                onChange={(e) => updatePos({ x: Number(e.target.value) })} className="ds-slider" />
            </label>
            <label className="ds-pos-slider-label">
              <span>{d.position.vertical}</span>
              <input type="range" min={10} max={90} step={1} value={logoY}
                onChange={(e) => updatePos({ y: Number(e.target.value) })} className="ds-slider" />
            </label>
            <p className="ds-pos-hint">{d.position.hintFree}</p>
          </div>
        )}

        {activeLogoUrl && !useMockup && positionKeys.length > 1 && (
          <div className="ds-section">
            <div className="ds-section-head">
              <span className="ds-step">05</span>
              <h3>{d.steps.position}</h3>
              <span className="ds-section-sub">{d.position.whereLogo}</span>
            </div>
            <div className="ds-positions">
              {positionKeys.map((key) => {
                const dictKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) as keyof DD["positions"];
                const label = d.positions[dictKey] || key;
                const icon = POSITION_ICONS[key] || "●";
                return (
                  <button key={key} type="button"
                    className={`ds-pos-btn ${logoPos === key ? "active" : ""}`}
                    onClick={() => setLogoPos(key)}>
                    <span className="ds-pos-icon">{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
            <p className="ds-pos-hint">{d.position.hint3d}</p>
          </div>
        )}

        {/* Tüm ürünler galerisi — logo varsa, müşteri farklı ürünleri görsün */}
        {activeLogoUrl && (
          <div className="ds-section">
            <div className="ds-section-head">
              <h3>{d.allProducts.title}</h3>
              <span className="ds-section-sub">{d.allProducts.sub}</span>
            </div>
            <div className="ds-all-products">
              {PRODUCT_KEYS.map((key) => {
                const photo = productPhotos[key];
                const productLabel = d.products[key].label;
                const isActive = product === key;
                const pos = positions[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`ds-mini-card ${isActive ? "active" : ""}`}
                    onClick={() => switchProduct(key)}
                    title={productLabel}
                  >
                    {photo ? (
                      <div className="ds-mini-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt={productLabel} className="ds-mini-product" draggable={false} />
                        {/* Renk overlay artık yok — temiz foto */}
                        <div
                          className="ds-mini-logo"
                          style={{
                            top: `${pos.y}%`,
                            left: `${pos.x}%`,
                            width: `${Math.round(pos.scale * 100)}%`,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activeLogoUrl} alt="" draggable={false} />
                        </div>
                      </div>
                    ) : (
                      <div className="ds-mini-frame ds-mini-3d">
                        <span className="ds-mini-icon">{PRODUCT_ICONS[key]}</span>
                        <div
                          className="ds-mini-logo-3d"
                          style={{ width: `${Math.round(pos.scale * 250)}%` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activeLogoUrl} alt="" draggable={false} />
                        </div>
                      </div>
                    )}
                    <span className="ds-mini-label">{productLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="ds-section ds-section-cta">
          {added ? (
            <div className="ds-success">
              <strong>{d.success.title}</strong>
              <p>{d.success.sub}</p>
              <Link href="/merkzettel" className="btn-primary">{d.success.sendInquiry}</Link>
              <button type="button" className="btn-ghost" onClick={() => setAdded(false)}>
                {d.success.more}
              </button>
            </div>
          ) : (
            <>
              <button type="button" className="btn-primary ds-cta"
                onClick={() => void handleAddToMerkliste()} disabled={processing}>
                {d.cta}
              </button>
              <p className="ds-cta-note">{d.ctaNote}</p>
            </>
          )}
        </div>

        <div className="ds-trust">
          <div><strong>✓</strong> {d.trust.ai}</div>
          <div><strong>✓</strong> {d.trust.day24}</div>
          <div><strong>✓</strong> {d.trust.personal}</div>
        </div>
      </aside>

      {/* Druckvorschau-Modal */}
      {previewImage && (
        <div className="ds-preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="ds-preview-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ds-preview-close"
              onClick={() => setPreviewImage(null)} aria-label="X">✕</button>
            <div className="ds-preview-head">
              <strong>{d.preview.title}</strong>
              <span>{d.preview.sub}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt={d.preview.title} className="ds-preview-img" />
            <div className="ds-preview-actions">
              <button type="button" className="btn-primary"
                onClick={() => { setPreviewImage(null); void handleAddToMerkliste(); }}>
                {d.preview.addToList}
              </button>
              <button type="button" className="btn-ghost" onClick={() => setPreviewImage(null)}>
                {d.preview.edit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
