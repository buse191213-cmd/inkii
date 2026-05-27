"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/app/admin/actions";

export type AdminCat = { id: string; name: string; slug: string; count: number };

type SortKey = "name" | "slug" | "count";
type SortDir = "asc" | "desc";

export default function CategoryForm({ categories }: { categories: AdminCat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = categories.filter(
      (c) =>
        !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
    arr = [...arr].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "slug") cmp = a.slug.localeCompare(b.slug);
      else cmp = a.count - b.count;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [categories, query, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

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
        setTimeout(() => setOk(false), 2500);
      } else {
        setError(res.error ?? "Kategorie konnte nicht angelegt werden.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unerwarteter Fehler.");
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
    setRemovingId(c.id);
    const res = await deleteCategory(c.id);
    setRemovingId(null);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Löschen fehlgeschlagen.");
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) {
      return (
        <svg className="cat-sort-ic dim" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3 5l3-3 3 3M3 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg className="cat-sort-ic" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8">
        {sortDir === "asc" ? (
          <path d="M3 7.5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    );
  }

  return (
    <>
      <p className="crumb">
        Admin <b>/ Kategorien</b>
      </p>

      {/* Kompakte Anlege-Zeile */}
      <div className="cat-add-bar">
        <form onSubmit={add} className="cat-add-inline">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" className="cat-add-icon">
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          <input
            className="cat-input-inline"
            placeholder="Neue Kategorie hinzufügen — z. B. Kleidung, Taschen, Werbeartikel"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setOk(false);
              setError("");
            }}
          />
          <button className="cat-add-btn" type="submit" disabled={busy || !name.trim()}>
            {busy ? "…" : "Anlegen"}
          </button>
        </form>
        {error && <div className="form-err" style={{ marginTop: 10 }}>{error}</div>}
        {ok && <div className="form-ok" style={{ marginTop: 10 }}>✓ Kategorie wurde angelegt.</div>}
      </div>

      {/* Liste / Tabelle */}
      <div className="cat-table-wrap">
        <div className="cat-table-head">
          <div>
            <h3 className="cat-table-title">Alle Kategorien</h3>
            <p className="cat-table-sub">
              {categories.length} {categories.length === 1 ? "Eintrag" : "Einträge"} insgesamt
            </p>
          </div>
          <div className="cat-search">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3 3" strokeLinecap="round" />
            </svg>
            <input
              placeholder="Suchen …"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="cat-empty">
            <div className="cat-empty-icon">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <p>{query ? "Keine Treffer für deine Suche." : "Noch keine Kategorien angelegt."}</p>
          </div>
        ) : (
          <table className="cat-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort("name")} className="sortable">
                  Name <SortIcon k="name" />
                </th>
                <th onClick={() => toggleSort("slug")} className="sortable">
                  Slug <SortIcon k="slug" />
                </th>
                <th onClick={() => toggleSort("count")} className="sortable num">
                  Produkte <SortIcon k="count" />
                </th>
                <th className="actions"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const empty = c.count === 0;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="cat-row-name">
                        <div className="cat-row-dot" />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td>
                      <code className="cat-slug">/{c.slug}</code>
                    </td>
                    <td className="num">
                      <span className={`cat-count-pill${empty ? " empty" : ""}`}>
                        {c.count}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="cat-del"
                        title={empty ? "Kategorie löschen" : "Kann nicht gelöscht werden — enthält Produkte"}
                        onClick={() => remove(c)}
                        disabled={!empty || removingId === c.id}
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                            strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
