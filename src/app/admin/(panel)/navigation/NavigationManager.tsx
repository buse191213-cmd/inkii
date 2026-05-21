"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleNavItem, moveNavItem } from "@/app/admin/actions";

type Item = {
  key: string;
  href: string;
  label: string;
  active: boolean;
  sortOrder: number;
};

export default function NavigationManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyKey, setBusyKey] = useState("");

  function onToggle(key: string, next: boolean) {
    setBusyKey(key);
    start(async () => {
      const res = await toggleNavItem(key, next);
      setBusyKey("");
      if (!res.ok) alert(res.error ?? "Speichern fehlgeschlagen.");
      router.refresh();
    });
  }

  function onMove(key: string, dir: "up" | "down") {
    setBusyKey(key);
    start(async () => {
      const res = await moveNavItem(key, dir);
      setBusyKey("");
      if (!res.ok) alert(res.error ?? "Verschieben fehlgeschlagen.");
      router.refresh();
    });
  }

  const activeCount = items.filter((i) => i.active).length;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="bc">
            Admin <span>/</span> Navigation
          </p>
          <h1>Header-Navigation</h1>
          <p className="form-note">
            Aktive Seiten ({activeCount} von {items.length}) erscheinen oben in der
            Hauptnavigation. Reihenfolge mit ▲/▼ ändern.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="prod-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Seite</th>
                <th style={{ width: 180 }}>Pfad</th>
                <th style={{ width: 110 }}>Sichtbar</th>
                <th style={{ width: 110 }}>Reihenfolge</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.key} className={!it.active ? "row-muted" : ""}>
                  <td style={{ color: "var(--muted)" }}>{idx + 1}</td>
                  <td>
                    <div className="t-name">{it.label}</div>
                    <div className="t-code">{it.key}</div>
                  </td>
                  <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: ".88rem" }}>
                    {it.href}
                  </td>
                  <td>
                    <label className="nav-toggle">
                      <input
                        type="checkbox"
                        checked={it.active}
                        disabled={pending && busyKey === it.key}
                        onChange={(e) => onToggle(it.key, e.target.checked)}
                      />
                      <span>{it.active ? "Aktiv" : "Passiv"}</span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="ic-btn"
                        title="Nach oben"
                        disabled={idx === 0 || pending}
                        onClick={() => onMove(it.key, "up")}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="ic-btn"
                        title="Nach unten"
                        disabled={idx === items.length - 1 || pending}
                        onClick={() => onMove(it.key, "down")}
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
