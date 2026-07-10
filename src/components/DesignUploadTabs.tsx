"use client";

import { useEffect, useState } from "react";

type DesignInfo = { imageDataUrl: string } | null;

/**
 * "Ihr Design hochladen" — ÜBERSICHT/DETAILS gibi sekme yapısı.
 * Üstte Vorderseite / Rückseite sekmeleri (underline stil).
 * Altında aktif tarafın paneli: görsel varsa önizleme + entfernen,
 * yoksa "Design hochladen" butonu.
 */
export default function DesignUploadTabs() {
  const [designs, setDesigns] = useState<{ front: DesignInfo; back: DesignInfo }>({ front: null, back: null });
  const [hasBack, setHasBack] = useState(false);
  const [active, setActive] = useState<"front" | "back">("front");

  useEffect(() => {
    function onDesigns(e: Event) {
      const ce = e as CustomEvent<{ front: DesignInfo; back: DesignInfo; hasBack: boolean }>;
      if (ce.detail) {
        setDesigns({ front: ce.detail.front, back: ce.detail.back });
        setHasBack(ce.detail.hasBack);
      }
    }
    window.addEventListener("designs-updated", onDesigns as EventListener);
    return () => window.removeEventListener("designs-updated", onDesigns as EventListener);
  }, []);

  // Galeri tarafı değişince sekmeyi senkronla
  useEffect(() => {
    function onSideChanged(e: Event) {
      const ce = e as CustomEvent<{ side: "front" | "back" }>;
      if (ce.detail?.side) setActive(ce.detail.side);
    }
    window.addEventListener("gallery-side-changed", onSideChanged as EventListener);
    return () => window.removeEventListener("gallery-side-changed", onSideChanged as EventListener);
  }, []);

  function requestUpload(side: "front" | "back") {
    if (side === "back" && !hasBack) return;
    window.dispatchEvent(new CustomEvent("design-upload-request", { detail: { side } }));
  }

  function switchSide(side: "front" | "back") {
    if (side === "back" && !hasBack) return;
    window.dispatchEvent(new CustomEvent("design-switch-side", { detail: { side } }));
  }

  // Sekmeye tıkla: aktif tarafı değiştir + galeriyi o tarafa çevir
  function handleTab(side: "front" | "back") {
    if (side === "back" && !hasBack) return;
    setActive(side);
    switchSide(side);
  }

  function removeDesign(side: "front" | "back") {
    window.dispatchEvent(new CustomEvent("design-remove-request", { detail: { side } }));
  }

  const activeDesign = active === "front" ? designs.front : designs.back;
  const totalCount = (designs.front ? 1 : 0) + (designs.back ? 1 : 0);

  return (
    <section className="dut-wrap">
      <header className="dut-head">
        <div className="dut-title-block">
          <span className="dut-title-hint">Personalisierung</span>
          <h3 className="dut-title">Ihr Design hochladen</h3>
        </div>
        {totalCount > 0 && (
          <span className="dut-badge">
            {totalCount} Design{totalCount > 1 ? "s" : ""} ✓
          </span>
        )}
      </header>

      {/* Sekme navigasyonu (ÜBERSICHT/DETAILS stili) */}
      <div className="dut-nav">
        <button
          type="button"
          className={`dut-navtab${active === "front" ? " active" : ""}`}
          onClick={() => handleTab("front")}
        >
          Vorderseite
          {designs.front && <span className="dut-navtab-dot" />}
        </button>
        <button
          type="button"
          className={`dut-navtab${active === "back" ? " active" : ""}${!hasBack ? " disabled" : ""}`}
          onClick={() => handleTab("back")}
          disabled={!hasBack}
        >
          Rückseite
          {designs.back && <span className="dut-navtab-dot" />}
          {!hasBack && <span className="dut-navtab-lock">🔒</span>}
        </button>
      </div>

      {/* Panel — aktif tarafın içeriği */}
      <div className="dut-panel">
        {active === "back" && !hasBack ? (
          <div className="dut-empty">
            <span className="dut-empty-text">Für dieses Produkt ist keine Rückseite verfügbar.</span>
          </div>
        ) : activeDesign ? (
          <div className="dut-loaded">
            <div className="dut-loaded-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeDesign.imageDataUrl} alt={`${active === "front" ? "Vorderseite" : "Rückseite"} Design`} />
            </div>
            <div className="dut-loaded-info">
              <span className="dut-loaded-label">
                {active === "front" ? "Vorderseite" : "Rückseite"}
              </span>
              <span className="dut-loaded-status">Hochgeladen ✓</span>
              <div className="dut-loaded-actions">
                <button
                  type="button"
                  className="dut-btn dut-btn-change"
                  onClick={() => requestUpload(active)}
                >
                  Ändern
                </button>
                <button
                  type="button"
                  className="dut-btn dut-btn-remove"
                  onClick={() => removeDesign(active)}
                >
                  Entfernen
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="dut-upload"
            onClick={() => requestUpload(active)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            </svg>
            <span className="dut-upload-title">
              Design für {active === "front" ? "Vorderseite" : "Rückseite"} hochladen
            </span>
            <span className="dut-upload-hint">PNG, JPG oder SVG</span>
          </button>
        )}
      </div>

      <style jsx>{`
        .dut-wrap {
          margin: 24px 0;
          padding: 20px;
          background: #fafbf9;
          border: 1px solid #e3e6df;
          border-radius: 6px;
        }
        .dut-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 14px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dut-title-block { display: flex; flex-direction: column; }
        .dut-title-hint {
          font-size: 0.68rem;
          font-weight: 700;
          color: #7a857f;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .dut-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0f1a16;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .dut-badge {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        /* Sekme navigasyonu — ÜBERSICHT/DETAILS stili */
        .dut-nav {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #e3e6df;
          margin-bottom: 16px;
        }
        .dut-navtab {
          background: none;
          border: 0;
          padding: 12px 4px;
          margin-right: 28px;
          cursor: pointer;
          position: relative;
          font-size: 0.9rem;
          font-weight: 600;
          color: #7a857f;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
        }
        .dut-navtab:hover:not(.disabled) { color: #0f1a16; }
        .dut-navtab.active { color: #0f1a16; }
        .dut-navtab.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: #0f1a16;
        }
        .dut-navtab.disabled {
          color: #c0c7c2;
          cursor: not-allowed;
        }
        .dut-navtab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #5e8470;
          display: inline-block;
        }
        .dut-navtab-lock { font-size: 0.8rem; }
        /* Panel */
        .dut-panel { min-height: 90px; }
        .dut-upload {
          width: 100%;
          background: #fff;
          border: 1.5px dashed #cbd2ca;
          border-radius: 6px;
          padding: 24px 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #5a6660;
          transition: all 0.15s;
          font-family: inherit;
        }
        .dut-upload:hover {
          border-color: #5e8470;
          background: #f0fdf4;
          color: #0f1a16;
        }
        .dut-upload-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f1a16;
        }
        .dut-upload-hint {
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .dut-loaded {
          display: flex;
          gap: 16px;
          align-items: center;
          background: #fff;
          border: 1px solid #e3e6df;
          border-radius: 6px;
          padding: 14px;
        }
        .dut-loaded-preview {
          width: 72px;
          height: 72px;
          background: #f4f5f1;
          border: 1px solid #e3e6df;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .dut-loaded-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 4px;
        }
        .dut-loaded-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }
        .dut-loaded-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f1a16;
        }
        .dut-loaded-status {
          font-size: 0.76rem;
          color: #065f46;
          font-weight: 600;
        }
        .dut-loaded-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .dut-btn {
          padding: 6px 14px;
          border-radius: 5px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #e3e6df;
          font-family: inherit;
          transition: all 0.15s;
        }
        .dut-btn-change {
          background: #fff;
          color: #0f1a16;
        }
        .dut-btn-change:hover {
          border-color: #0f1a16;
        }
        .dut-btn-remove {
          background: #fff;
          color: #dc2626;
          border-color: #fecaca;
        }
        .dut-btn-remove:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }
        .dut-empty {
          padding: 24px 16px;
          text-align: center;
        }
        .dut-empty-text {
          font-size: 0.85rem;
          color: #94a3b8;
        }
      `}</style>
    </section>
  );
}
