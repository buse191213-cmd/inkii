"use client";

import { useState, type ReactNode } from "react";

export type DetailTab = {
  key: string;
  label: string;
  html?: string;
  text?: string;
  rows?: Array<{ k: string; v: string }>;
  /** Pflegesymbole (SVG-Icons veya Bild-URL) am Ende des Tabs. */
  careIcons?: Array<{ key: string; label: string; svg: ReactNode; imgUrl?: string }>;
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
        {current.careIcons && current.careIcons.length > 0 && (
          <div className="mm-care-block">
            <div className="mm-care-icons">
              {current.careIcons.map((c) => (
                <span key={c.key} className="mm-care-icon" title={c.label}>
                  {c.imgUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={c.imgUrl} alt={c.label} />
                  ) : (
                    c.svg
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
