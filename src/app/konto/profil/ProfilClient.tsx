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
        setMsg({ type: "ok", text: "Profil gespeichert." });
        router.refresh();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: "err", text: result.error ?? "Fehler" });
      }
    });
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 style={titleStyle}>Profil bearbeiten</h2>
        <p style={sub}>Persönliche Daten und Firmeninformationen.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 540 }}>
        {/* Email readonly */}
        <Field label="E-Mail">
          <input value={initial.email} readOnly style={{ ...input, color: "#999", cursor: "not-allowed" }} />
          <small style={{ fontSize: 10, color: "#999", marginTop: 4, display: "block", letterSpacing: "1px" }}>NICHT ÄNDERBAR</small>
        </Field>

        <div style={row}>
          <div style={{ minWidth: 100, maxWidth: 130 }}>
            <Field label="Anrede">
              <select value={salutation} onChange={(e) => setSalutation(e.target.value)} style={input}>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
                <option value="Divers">Divers</option>
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Vorname *">
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} required />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Nachname *">
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} required />
            </Field>
          </div>
        </div>

        <Field label="Telefon">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="+49 160 1234567" />
        </Field>

        <div style={row}>
          <div style={{ flex: 1 }}>
            <Field label="Firma">
              <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="USt-IdNr.">
              <input value={ustId} onChange={(e) => setUstId(e.target.value)} style={input} placeholder="DE123456789" />
            </Field>
          </div>
        </div>

        {msg && (
          <div style={{
            padding: 12,
            marginTop: 8,
            marginBottom: 16,
            background: msg.type === "ok" ? "#000" : "#fff",
            color: msg.type === "ok" ? "#fff" : "#000",
            border: msg.type === "err" ? "1px solid #000" : "none",
            fontSize: 12,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={submitBtn(isPending)}
        >
          {isPending ? "Speichern…" : "Speichern"}
        </button>
      </form>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontSize: "1.4rem",
  fontWeight: 300,
  margin: 0,
  marginBottom: 6,
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  letterSpacing: "-0.01em",
};
const sub: React.CSSProperties = { fontSize: 13, color: "#666", margin: 0 };
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  color: "#000",
  marginBottom: 6,
  letterSpacing: "2px",
  textTransform: "uppercase",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 0 8px",
  border: "none",
  borderBottom: "1px solid #d0d0d0",
  fontSize: 14,
  background: "transparent",
  fontFamily: "inherit",
  borderRadius: 0,
  outline: "none",
  color: "#000",
};
const row: React.CSSProperties = { display: "flex", gap: 16, flexWrap: "wrap" };
const submitBtn = (pending: boolean): React.CSSProperties => ({
  background: pending ? "#666" : "#000",
  color: "#fff",
  padding: "13px 32px",
  fontWeight: 500,
  border: "none",
  cursor: pending ? "default" : "pointer",
  fontSize: 11,
  letterSpacing: "3px",
  textTransform: "uppercase",
  transition: "all 0.15s",
});
