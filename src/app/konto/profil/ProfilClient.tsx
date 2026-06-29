"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../profile-actions";

type Initial = {
  email: string;
  salutation: string;
  firstName: string;
  lastName: string;
  phone: string;
  firmname: string;
  ustId: string;
};

export default function ProfilClient({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [salutation, setSalutation] = useState(initial.salutation);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [firmname, setFirmname] = useState(initial.firmname);
  const [ustId, setUstId] = useState(initial.ustId);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const result = await updateProfile({
        salutation, firstName, lastName, phone, firmname, ustId,
      });
      if (result.ok) {
        setMsg({ type: "ok", text: "Profil erfolgreich gespeichert." });
        router.refresh();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: "err", text: result.error ?? "Fehler" });
      }
    });
  }

  return (
    <>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>Profil bearbeiten</h2>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
        Hier können Sie Ihre persönlichen Daten aktualisieren.
        Die E-Mail-Adresse kann nicht geändert werden. Für Adressänderungen → "Adressen".
      </p>

      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 20, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={field}>
          <label>E-Mail (nicht änderbar)</label>
          <input value={initial.email} readOnly style={{ ...input, background: "#f1f5f9", color: "#64748b" }} />
        </div>

        <div style={row}>
          <div style={{ ...field, maxWidth: 120 }}>
            <label>Anrede</label>
            <select value={salutation} onChange={(e) => setSalutation(e.target.value)} style={input}>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
              <option value="Divers">Divers</option>
            </select>
          </div>
          <div style={field}>
            <label>Vorname *</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} required />
          </div>
          <div style={field}>
            <label>Nachname *</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} required />
          </div>
        </div>

        <div style={field}>
          <label>Telefon</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="+49 160 1234567" />
        </div>

        <div style={row}>
          <div style={field}>
            <label>Firma (optional)</label>
            <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>USt-IdNr. (optional)</label>
            <input value={ustId} onChange={(e) => setUstId(e.target.value)} style={input} placeholder="DE123456789" />
          </div>
        </div>

        {msg && (
          <div style={{ padding: 10, background: msg.type === "ok" ? "#d1fae5" : "#fee2e2", color: msg.type === "ok" ? "#065f46" : "#991b1b", fontSize: 13 }}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "#94a3b8" : "#004537",
            color: "#fff",
            padding: "12px 20px",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "default" : "pointer",
            alignSelf: "flex-start",
          }}
        >
          {isPending ? "Wird gespeichert…" : "Speichern"}
        </button>
      </form>
    </>
  );
}

const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 180 };
const row: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  fontFamily: "inherit",
};
