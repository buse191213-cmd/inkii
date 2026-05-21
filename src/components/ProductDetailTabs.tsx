"use client";

import { useState } from "react";

export type DetailTab = {
  key: string;
  label: string;
  /** HTML-Inhalt (z. B. Beschreibung) – wird sicher mit dangerouslySetInnerHTML
   *  eingesetzt, daher muss der Aufrufer schon sanitizen. */
  html?: string;
  /** Alternativ: Klartext, der direkt gerendert wird. */
  text?: string;
  /** Oder beliebige Liste von Key/Value-Zeilen (für Details/Specs). */
  rows?: Array<{ k: string; v: string }>;
};

export default function ProductDetailTabs({ tabs }: { tabs: DetailTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key ?? "");
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  if (!current) return null;

  return (
    <div className="mm-tabs">
      <div className="mm-tabs-nav">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`mm-tab${t.key === active ? " active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mm-tab-panel">
        {current.html && (
          <div
            className="mm-tab-prose"
            dangerouslySetInnerHTML={{ __html: current.html }}
          />
        )}
        {current.text && <div className="mm-tab-prose">{current.text}</div>}
        {current.rows && (
          <dl className="mm-tab-rows">
            {current.rows.map((r, i) => (
              <div key={i} className="mm-tab-row">
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
