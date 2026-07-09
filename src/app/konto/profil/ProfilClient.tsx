"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../profile-actions";
import { getDictionary } from "@/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

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
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const m = document.cookie.match(/inkii_locale=([^;]+)/);
    if (m && isLocale(m[1])) setLocale(m[1]);
  }, []);
  const dict = getDictionary(locale);
  const tp = dict.konto.profilPage;
  const tf = dict.checkout.form;
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
        setMsg({ type: "ok", text: tp.saved });
        router.refresh();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: "err", text: result.error ?? tp.error });
      }
    });
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 style={titleStyle}>{tp.title}</h2>
        <p style={sub}>{tp.sub}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 540 }}>
        {/* Email readonly */}
        <Field label={tf.email}>
          <input value={initial.email} readOnly style={{ ...input, color: "#999", cursor: "not-allowed" }} />
          <small style={{ fontSize: 10, color: "#999", marginTop: 4, display: "block", letterSpacing: "1px" }}>NICHT ÄNDERBAR</small>
        </Field>

        <div style={row}>
          <div style={{ minWidth: 100, maxWidth: 130 }}>
            <Field label={tf.salutation}>
              <select value={salutation} onChange={(e) => setSalutation(e.target.value)} style={input}>
                <option value="Herr">{tf.herr}</option>
                <option value="Frau">{tf.frau}</option>
                <option value="Divers">{tf.divers}</option>
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label={`${tf.firstName} *`}>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} required />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label={`${tf.lastName} *`}>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} required />
            </Field>
          </div>
        </div>

        <Field label={tf.phone}>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="+49 160 1234567" />
        </Field>

        <div style={row}>
          <div style={{ flex: 1 }}>
            <Field label={tf.company}>
              <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label={tf.ustId}>
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
          {isPending ? tp.saving : tp.save}
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
  fontSize: "1.3rem",
  fontWeight: 600,
  margin: 0,
  marginBottom: 6,
  color: "#0f1a16",
  letterSpacing: "-0.01em",
};
const sub: React.CSSProperties = { fontSize: 13, color: "#666", margin: 0 };
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  color: "#0f1a16",
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
  color: "#0f1a16",
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
