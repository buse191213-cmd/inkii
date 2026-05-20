"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/app/admin/actions";

export type AdminCat = { id: string; name: string; slug: string; count: number };

export default function CategoryForm({ categories }: { categories: AdminCat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Bitte einen Namen eingeben.");
      return;
    }
    setBusy(true);
    setError("");
    setOk(false);
    try {
      const fd = new FormData();
      fd.set("name", name.trim());
      const res = await createCategory(fd);
      if (res.ok) {
        setName("");
        setOk(true);
        router.refresh();
      } else {
        setError(res.error ?? "Kategorie konnte nicht angelegt werden.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unerwarteter Fehler beim Anlegen."
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: AdminCat) {
    if (c.count > 0) {
      alert("Diese Kategorie enthält noch Produkte und kann nicht gelöscht werden.");
      return;
    }
    if (!confirm(`Kategorie „${c.name}" löschen?`)) return;
    const res = await deleteCategory(c.id);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Löschen fehlgeschlagen.");
  }

  return (
    <>
      <p className="crumb">
        Admin <b>/ Kategorien</b>
      </p>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Neue Kategorie</h3>
        </div>
        <div className="panel-body">
          {error && <div className="form-err">{error}</div>}
          {ok && <div className="form-ok">✓ Kategorie wurde angelegt.</div>}
          <form onSubmit={add} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              className="status-select"
              style={{ flex: 1, minWidth: 220, padding: "11px 13px" }}
              placeholder="Name der Kategorie"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setOk(false);
              }}
            />
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? "Anlegen …" : "Kategorie anlegen"}
            </button>
          </form>
        </div>
      </div>

      <div className="cat-list">
        {categories.map((c) => (
          <div key={c.id} className="cat-tile">
            <div>
              <h4>{c.name}</h4>
              <span>
                {c.count} {c.count === 1 ? "Produkt" : "Produkte"} · /{c.slug}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="cnt">{c.count}</span>
              <button
                className="icon-act del"
                title="Löschen"
                onClick={() => remove(c)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
