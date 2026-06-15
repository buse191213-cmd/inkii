"use client";

import { useEffect } from "react";

/**
 * DTF-Engine Modal — Orijinal HTML iframe ile.
 * Sadece ✕ butonu ile kapanır (overlay tıklama + ESC devre dışı).
 */
export default function DtfEngine({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    // Body scroll kilitle
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="dtf-overlay">
      <div className="dtf-modal">
        <button
          className="dtf-close"
          onClick={onClose}
          aria-label="Schließen"
          title="Schließen"
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
