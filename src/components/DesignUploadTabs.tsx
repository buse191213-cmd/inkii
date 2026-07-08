"use client";

import { useEffect, useState } from "react";

type DesignInfo = { imageDataUrl: string } | null;

/**
 * Fiyat ile Übersicht sekmeleri arasında görünen bir bölüm.
 * "Ihr Design hochladen" başlığı altında 2 sekme: Vorderseite / Rückseite.
 * Tıklanınca ProductGallery'ye event yollar (upload açar).
 */
export default function DesignUploadTabs() {
  const [designs, setDesigns] = useState<{ front: DesignInfo; back: DesignInfo }>({ front: null, back: null });
  const [hasBack, setHasBack] = useState(false);

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

  function requestUpload(side: "front" | "back") {
    if (side === "back" && !hasBack) return;
    window.dispatchEvent(new CustomEvent("design-upload-request", { detail: { side } }));
    // Galeriye smooth scroll
    const gallery = document.querySelector(".gallery");
    if (gallery) gallery.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const anyDesign = designs.front || designs.back;

  return (
    <section className="dut-wrap">
      <header className="dut-head">
        <div className="dut-title-block">
          <span className="dut-title-hint">Personalisierung</span>
          <h3 className="dut-title">Ihr Design hochladen</h3>
        </div>
        {anyDesign && (
          <span className="dut-badge">
            {(designs.front ? 1 : 0) + (designs.back ? 1 : 0)} Design{(designs.front ? 1 : 0) + (designs.back ? 1 : 0) > 1 ? "s" : ""} ✓
          </span>
        )}
      </header>

      <div className="dut-tabs">
        <button
          type="button"
          className={`dut-tab${designs.front ? " active" : ""}`}
          onClick={() => requestUpload("front")}
          title="Design für Vorderseite hochladen"
        >
          <div className="dut-tab-preview">
            {designs.front ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={designs.front.imageDataUrl} alt="Vorderseite Design" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              </svg>
            )}
          </div>
          <div className="dut-tab-text">
            <span className="dut-tab-side">Vorderseite</span>
            <span className="dut-tab-status">
              {designs.front ? "Bearbeiten →" : "Design hochladen →"}
            </span>
          </div>
        </button>

        <button
          type="button"
          className={`dut-tab${designs.back ? " active" : ""}${!hasBack ? " disabled" : ""}`}
          onClick={() => requestUpload("back")}
          disabled={!hasBack}
          title={!hasBack ? "Kein Rückseiten-Bild verfügbar" : "Design für Rückseite hochladen"}
        >
          <div className="dut-tab-preview">
            {designs.back ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={designs.back.imageDataUrl} alt="Rückseite Design" />
            ) : hasBack ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              </svg>
            ) : (
              <span style={{ fontSize: 16 }}>🔒</span>
            )}
          </div>
          <div className="dut-tab-text">
            <span className="dut-tab-side">Rückseite</span>
            <span className="dut-tab-status">
              {designs.back ? "Bearbeiten →" : hasBack ? "Design hochladen →" : "Nicht verfügbar"}
            </span>
          </div>
        </button>
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
        .dut-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .dut-tab {
          background: #fff;
          border: 1px solid #e3e6df;
          padding: 12px;
          cursor: pointer;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.15s;
          text-align: left;
          font-family: inherit;
        }
        .dut-tab:hover:not(.disabled) {
          border-color: #0f1a16;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }
        .dut-tab.active {
          border-color: #5e8470;
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
        }
        .dut-tab.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f8f8f6;
        }
        .dut-tab-preview {
          width: 44px;
          height: 44px;
          background: #f4f5f1;
          border: 1px solid #e3e6df;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          color: #94a3b8;
        }
        .dut-tab-preview img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          padding: 3px;
        }
        .dut-tab.active .dut-tab-preview {
          background: #fff;
          border-color: #5e8470;
        }
        .dut-tab-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .dut-tab-side {
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f1a16;
          letter-spacing: 0.2px;
        }
        .dut-tab-status {
          font-size: 0.72rem;
          color: #5a6660;
          font-weight: 500;
        }
        .dut-tab.active .dut-tab-status { color: #065f46; }
        .dut-tab.disabled .dut-tab-status { color: #9ca3af; }
        @media (max-width: 640px) {
          .dut-tabs { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
