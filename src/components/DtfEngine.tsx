"use client";

import { useEffect } from "react";

/**
 * DTF-Engine Modal — Orijinal HTML/CSS/JS UI'ı iframe ile gösterir.
 * Backend API: /api/dtf/process-stream
 */
export default function DtfEngine({ onClose }: { onClose: () => void }) {
  // ESC ile kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    // Body scroll kilitle
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="dtf-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dtf-modal">
        <button
          className="dtf-close"
          onClick={onClose}
          aria-label="Schließen"
          title="Schließen (ESC)"
        >
          ✕
        </button>
        <iframe
          src="/dtf-engine/index.html"
          title="DTF-Engine"
          className="dtf-iframe"
        />
      </div>
    </div>
  );
}
