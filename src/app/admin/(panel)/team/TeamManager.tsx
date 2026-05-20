"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveTeamMember, deleteTeamMember, removeTeamPhoto } from "@/app/admin/actions";

export type AdminTeamMember = {
  id: string;
  department: string;
  name: string;
  role: string;
  email: string;
  photoUrl: string;
  sortOrder: number;
};

const EMPTY: AdminTeamMember = {
  id: "",
  department: "",
  name: "",
  role: "",
  email: "",
  photoUrl: "",
  sortOrder: 0,
};

export default function TeamManager({ members }: { members: AdminTeamMember[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<AdminTeamMember | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function openNew() {
    const nextOrder = members.length
      ? Math.max(...members.map((m) => m.sortOrder)) + 10
      : 10;
    setModal({ ...EMPTY, sortOrder: nextOrder });
    setPhotoPreview("");
    setError("");
  }

  function openEdit(m: AdminTeamMember) {
    setModal(m);
    setPhotoPreview(m.photoUrl);
    setError("");
  }

  function close() {
    setModal(null);
    setPhotoPreview("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!modal) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const res = await saveTeamMember(fd);
      if (res.ok) {
        close();
        router.refresh();
      } else {
        setError(res.error ?? "Speichern fehlgeschlagen.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Dieses Team-Mitglied wirklich löschen?")) return;
    setBusy(true);
    try {
      const res = await deleteTeamMember(id);
      if (res.ok) router.refresh();
      else alert(res.error ?? "Löschen fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemovePhoto(id: string) {
    if (!confirm("Foto entfernen?")) return;
    setBusy(true);
    try {
      const res = await removeTeamPhoto(id);
      if (res.ok) {
        setPhotoPreview("");
        router.refresh();
      } else {
        alert(res.error ?? "Entfernen fehlgeschlagen.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <p className="bc">
            Admin <span>/</span> Team
          </p>
          <h1>Team-Mitglieder</h1>
        </div>
        <button type="button" className="btn-primary" onClick={openNew}>
          + Neues Mitglied
        </button>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          {members.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
              Noch keine Team-Mitglieder. Mit „+ Neues Mitglied" hinzufügen.
            </div>
          ) : (
            <table className="prod-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Foto</th>
                  <th>Abteilung / Person</th>
                  <th style={{ width: 230 }}>E-Mail</th>
                  <th style={{ width: 90 }}>Reihenfolge</th>
                  <th style={{ width: 110 }}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="team-thumb">
                        {m.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.photoUrl} alt="" />
                        ) : (
                          <span className="team-thumb-fb">○</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="t-name">{m.department}</div>
                      <div className="t-code">
                        {m.name ? m.name : <em style={{ color: "var(--muted)" }}>(kein Name)</em>}
                        {m.role ? " · " + m.role : ""}
                      </div>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{m.email || "—"}</td>
                    <td>{m.sortOrder}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="ic-btn"
                          title="Bearbeiten"
                          onClick={() => openEdit(m)}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="ic-btn"
                          title="Löschen"
                          onClick={() => onDelete(m.id)}
                          disabled={busy}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="modal-head">
              <h2>{modal.id ? "Team-Mitglied bearbeiten" : "Neues Team-Mitglied"}</h2>
              <button type="button" className="ic-btn" onClick={close}>
                ✕
              </button>
            </div>
            <form onSubmit={submit} className="modal-body">
              {error && <div className="form-err">{error}</div>}
              <input type="hidden" name="id" value={modal.id} />

              <div className="field">
                <label>Foto</label>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="team-thumb team-thumb-lg">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="" />
                    ) : (
                      <span className="team-thumb-fb">○</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      ref={fileRef}
                      type="file"
                      name="photo"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={onPhotoChange}
                    />
                    <p className="form-note" style={{ marginTop: 6 }}>
                      JPG, PNG oder WebP · max. 4 MB · idealerweise Porträt
                      (quadratisch zugeschnitten).
                    </p>
                    {modal.id && modal.photoUrl && (
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        style={{ marginTop: 6 }}
                        onClick={() => onRemovePhoto(modal.id)}
                      >
                        Vorhandenes Foto entfernen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Abteilung *</label>
                <input
                  name="department"
                  defaultValue={modal.department}
                  required
                  placeholder="z. B. Projektleitung"
                />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Name (Person)</label>
                  <input
                    name="name"
                    defaultValue={modal.name}
                    placeholder="z. B. Buse Yoldaş"
                  />
                </div>
                <div className="field">
                  <label>Rolle / Untertitel</label>
                  <input
                    name="role"
                    defaultValue={modal.role}
                    placeholder="z. B. Beratung & Angebote"
                  />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>E-Mail</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={modal.email}
                    placeholder="z. B. buse@inkii.de"
                  />
                </div>
                <div className="field">
                  <label>Reihenfolge</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={modal.sortOrder}
                  />
                  <p className="form-note" style={{ marginTop: 4 }}>
                    Kleinere Zahlen erscheinen zuerst.
                  </p>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-ghost" onClick={close} disabled={busy}>
                  Abbrechen
                </button>
                <button type="submit" className="btn-primary" disabled={busy}>
                  {busy ? "Speichert …" : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
