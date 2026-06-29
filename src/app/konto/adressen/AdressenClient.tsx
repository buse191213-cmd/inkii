"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAddress } from "../profile-actions";

const COUNTRIES = [
  { code: "DE", label: "Deutschland" },
  { code: "AT", label: "Österreich" },
  { code: "CH", label: "Schweiz" },
  { code: "NL", label: "Niederlande" },
  { code: "BE", label: "Belgien" },
  { code: "FR", label: "Frankreich" },
  { code: "IT", label: "Italien" },
  { code: "ES", label: "Spanien" },
  { code: "PL", label: "Polen" },
  { code: "TR", label: "Türkei" },
];

type Initial = {
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
  shippingDiffers: boolean;
  shippingStreet: string;
  shippingZip: string;
  shippingCity: string;
  shippingCountry: string;
};

export default function AdressenClient({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [billingStreet, setBillingStreet] = useState(initial.billingStreet);
  const [billingZip, setBillingZip] = useState(initial.billingZip);
  const [billingCity, setBillingCity] = useState(initial.billingCity);
  const [billingCountry, setBillingCountry] = useState(initial.billingCountry);
  const [shippingDiffers, setShippingDiffers] = useState(initial.shippingDiffers);
  const [shippingStreet, setShippingStreet] = useState(initial.shippingStreet);
  const [shippingZip, setShippingZip] = useState(initial.shippingZip);
  const [shippingCity, setShippingCity] = useState(initial.shippingCity);
  const [shippingCountry, setShippingCountry] = useState(initial.shippingCountry);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const result = await updateAddress({
        billingStreet, billingZip, billingCity, billingCountry,
        shippingDiffers, shippingStreet, shippingZip, shippingCity, shippingCountry,
      });
      if (result.ok) {
        setMsg({ type: "ok", text: "Gespeichert." });
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
        <h2 style={titleStyle}>Adressen</h2>
        <p style={sub}>Rechnungs- und Lieferadresse verwalten.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 540 }}>

        <h3 style={sectionTitle}>Rechnungsadresse</h3>
        <Field label="Straße & Hausnummer *">
          <input value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} style={input} required />
        </Field>
        <div style={row}>
          <div style={{ minWidth: 90, maxWidth: 120 }}>
            <Field label="PLZ *">
              <input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} style={input} required />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Stadt *">
              <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} style={input} required />
            </Field>
          </div>
          <div style={{ minWidth: 150 }}>
            <Field label="Land">
              <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} style={input}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div style={{ paddingTop: 24, marginTop: 16, borderTop: "1px solid #e5e5e5" }}>
          <label style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: shippingDiffers ? 24 : 0,
          }}>
            <input
              type="checkbox"
              checked={shippingDiffers}
              onChange={(e) => setShippingDiffers(e.target.checked)}
              style={{ accentColor: "#000" }}
            />
            Abweichende Lieferadresse
          </label>

          {shippingDiffers && (
            <>
              <h3 style={sectionTitle}>Lieferadresse</h3>
              <Field label="Straße & Hausnummer">
                <input value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} style={input} />
              </Field>
              <div style={row}>
                <div style={{ minWidth: 90, maxWidth: 120 }}>
                  <Field label="PLZ">
                    <input value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} style={input} />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Stadt">
                    <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} style={input} />
                  </Field>
                </div>
                <div style={{ minWidth: 150 }}>
                  <Field label="Land">
                    <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} style={input}>
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </>
          )}
        </div>

        {msg && (
          <div style={{
            padding: 12,
            marginTop: 24,
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
          {isPending ? "Speichern…" : "Adressen speichern"}
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
const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#000",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginTop: 8,
  marginBottom: 16,
};
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
});
