"use client";

import { useState, useRef, useTransition } from "react";
import { saveGalleryItems, updateGalleryTitle, deleteGalleryItem } from "@/app/admin/actions";

export type AdminGalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  sortOrder: number;
};

export default function GalleryManager({ items }: { items: AdminGalleryItem[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    startTransition(async () => {
      const res = await saveGalleryItems(fd);
      setUploading(false);
      if (!res.ok) setError(res.error ?? "Upload fehlgeschlagen.");
      if (fileInput.current) fileInput.current.value = "";
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Dieses Bild wirklich löschen?")) return;
    startTransition(async () => {
      const res = await deleteGalleryItem(id);
      if (!res.ok) setError(res.error ?? "Löschen fehlgeschlagen.");
    });
  }

  function handleTitleBlur(id: string, title: string) {
    startTransition(async () => {
      await updateGalleryTitle(id, title);
    });
  }

  return (
    <div className="adm">
      <div className="adm-head">
        <h2>Galerie — unsere Arbeiten</h2>
        <button
          className="btn-primary"
          onClick={() => fileInput.current?.click()}
          disabled={pending || uploading}
        >
          {uploading ? "Wird hochgeladen …" : "+ Bilder hinzufügen"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </div>

      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>
        Zeigen Sie Ihre eigenen Druck- und Designarbeiten. Diese Bilder
        erscheinen auf der öffentlichen Seite <strong>/galerie</strong>. Ein
        Titel ist optional.
      </p>

      {error && <div className="form-err">{error}</div>}

      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", background: "#f8fafc", borderRadius: 10 }}>
          Noch keine Bilder. Klicken Sie auf „+ Bilder hinzufügen".
        </div>
      ) : (
        <div className="gal-adm-grid">
          {items.map((item) => (
            <div key={item.id} className="gal-adm-card">
              <div className="gal-adm-imgwrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title || "Arbeit"} />
                <button
                  className="gal-adm-del"
                  onClick={() => handleDelete(item.id)}
                  disabled={pending}
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                defaultValue={item.title}
                placeholder="Titel (optional)"
                onBlur={(e) => handleTitleBlur(item.id, e.target.value)}
                className="gal-adm-title"
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .gal-adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-top:8px}
        .gal-adm-card{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;background:#fff}
        .gal-adm-imgwrap{position:relative;aspect-ratio:1/1;background:#f4f5f3}
        .gal-adm-imgwrap img{width:100%;height:100%;object-fit:cover;display:block}
        .gal-adm-del{position:absolute;top:8px;right:8px;width:28px;height:28px;border:none;
          background:rgba(220,38,38,.92);color:#fff;border-radius:6px;cursor:pointer;font-size:14px;
          display:grid;place-items:center}
        .gal-adm-del:hover{background:#dc2626}
        .gal-adm-title{width:100%;border:none;border-top:1px solid #f1f5f9;padding:8px 10px;font-size:13px;outline:none}
        .gal-adm-title:focus{background:#f0fdf4}
      `}</style>
    </div>
  );
}
