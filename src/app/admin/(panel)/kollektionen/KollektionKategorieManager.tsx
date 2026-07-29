"use client";

import { useState, useRef, useTransition } from "react";
import { saveKollektionKategorie, deleteKollektionKategorie } from "@/app/admin/actions";

export type AdminKollektionKategorie = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
};

const EMPTY: AdminKollektionKategorie = { id: "", slug: "", name: "", imageUrl: "", sortOrder: 0 };

export default function KollektionKategorieManager({ categories }: { categories: AdminKollektionKategorie[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [modal, setModal] = useState<AdminKollektionKategorie | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function openNew() {
    setModal({ ...EMPTY });
    setPreview("");
    setError("");
  }
  function openEdit(c: AdminKollektionKategorie) {
    setModal({ ...c });
    setPreview(c.imageUrl);
    setError("");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      const res = await saveKollektionKategorie(fd);
      if (res.ok) {
        setModal(null);
      } else {
        setError(res.error ?? "Fehler");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Diese Kategorie wirklich löschen?")) return;
    startTransition(async () => {
      const res = await deleteKollektionKategorie(id);
      if (!res.ok) setError(res.error ?? "Fehler");
    });
  }

  return (
    <div className="adm">
      <p className="crumb">Admin <b>/ Kollektion-Kategorien</b></p>

      <div className="toolbar">
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
          Kategorien für die Kollektionen (z.B. Sommer, Winter). Jede mit eigenem Titelbild fürs Menü.
        </p>
        <button className="btn-primary" onClick={openNew}>+ Neue Kategorie</button>
      </div>

      {error && !modal && <div className="form-err">{error}</div>}

      {categories.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 10 }}>
          Noch keine Kategorien. Legen Sie eine an.
        </div>
      ) : (
        <div className="kk-grid">
          {categories.map((c) => (
            <div key={c.id} className="kk-card">
              <div className="kk-card-img">
                {c.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={c.imageUrl} alt={c.name} />
                ) : (
                  <div className="kk-card-noimg">Kein Bild</div>
                )}
              </div>
              <div className="kk-card-body">
                <strong>{c.name}</strong>
                <span className="kk-slug">/{c.slug}</span>
              </div>
              <div className="kk-card-actions">
                <button onClick={() => openEdit(c)}>Bearbeiten</button>
                <button className="kk-del" onClick={() => handleDelete(c.id)}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="modal">
            <form ref={formRef} onSubmit={handleSave}>
              <div className="modal-head">
                <h3>{modal.id ? "Kategorie bearbeiten" : "Neue Kategorie"}</h3>
                <button type="button" className="x" onClick={() => setModal(null)}>✕</button>
              </div>
              <div className="modal-body">
                {error && <div className="form-err">{error}</div>}
                <input type="hidden" name="id" defaultValue={modal.id} />
                <input type="hidden" name="existingImageUrl" defaultValue={modal.imageUrl} />
                <div className="field">
                  <label>Name</label>
                  <input name="name" defaultValue={modal.name} placeholder="z.B. Sommer-Kollektion" required />
                </div>
                <div className="field">
                  <label>Slug (URL-Kürzel, klein, ohne Leerzeichen)</label>
                  <input name="slug" defaultValue={modal.slug} placeholder="z.B. sommer" required />
                </div>
                <div className="field">
                  <label>Reihenfolge (höher = weiter vorne)</label>
                  <input type="number" name="sortOrder" defaultValue={modal.sortOrder} />
                </div>
                <div className="field">
                  <label>Titelbild</label>
                  {preview && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={preview} alt="" style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8, display: "block" }} />
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPreview(URL.createObjectURL(f));
                    }}
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Abbrechen</button>
                <button type="submit" className="btn-primary" disabled={pending}>
                  {pending ? "Speichern…" : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .kk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:8px}
        .kk-card{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#fff}
        .kk-card-img{aspect-ratio:16/10;background:#f4f5f3}
        .kk-card-img img{width:100%;height:100%;object-fit:cover;display:block}
        .kk-card-noimg{display:grid;place-items:center;height:100%;color:#94a3b8;font-size:13px}
        .kk-card-body{padding:10px 12px;display:flex;flex-direction:column;gap:2px}
        .kk-card-body strong{font-size:14px}
        .kk-slug{font-size:12px;color:#94a3b8}
        .kk-card-actions{display:flex;border-top:1px solid #f1f5f9}
        .kk-card-actions button{flex:1;padding:9px;border:none;background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#10b981}
        .kk-card-actions button:hover{background:#ecfdf5}
        .kk-card-actions .kk-del{color:#dc2626;border-left:1px solid #f1f5f9}
        .kk-card-actions .kk-del:hover{background:#fef2f2}
      `}</style>
    </div>
  );
}
