"use client";

import { useState } from "react";
import DtfEngine from "./DtfEngine";

export default function DesignerLauncher({
  productName,
  productCode,
}: {
  productName: string;
  productCode?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="dtf-launcher-btn"
        onClick={() => setOpen(true)}
        aria-label={`Datei für ${productName} optimieren`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <path d="M17 8l-5-5-5 5"/>
          <path d="M12 3v12"/>
        </svg>
        <span>Eigenes Design hochladen</span>
      </button>

      {open && (
        <DtfEngine
          onClose={() => setOpen(false)}
          productName={productName}
          productCode={productCode}
        />
      )}
    </>
  );
}
