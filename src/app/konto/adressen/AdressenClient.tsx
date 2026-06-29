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
        setMsg({ type: "ok", text: "Adressen gespeichert." });
        router.refresh();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ type: "err", text: result.error ?? "Fehler" });
      }
    });
  }

  return (
    <>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>Adressen</h2>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
        Verwalten Sie Ihre Rechnungs- und Lieferadresse.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ background: "#fff", padding: 20, border: "1px solid #e5e7eb", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Rechnungsadresse</h3>
          <div style={field}>
            <label>Straße & Hausnummer *</label>
            <input value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} style={input} required />
          </div>
          <div style={{ ...row, marginTop: 12 }}>
            <div style={{ ...field, maxWidth: 140 }}>
              <label>PLZ *</label>
              <input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} style={input} required />
            </div>
            <div style={field}>
              <label>Stadt *</label>
              <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} style={input} required />
            </div>
            <div style={{ ...field, maxWidth: 180 }}>
              <label>Land</label>
              <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} style={input}>
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 20, border: "1px solid #e5e7eb", marginBottom: 16 }}>
          <label style={{ display: "flex", gap: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}>
            <input type="checkbox" checked={shippingDiffers} onChange={(e) => setShippingDiffers(e.target.checked)} />
            Abweichende Lieferadresse
          </label>

          {shippingDiffers && (
            <>
              <div style={field}>
                <label>Straße & Hausnummer</label>
                <input value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} style={input} />
              </div>
              <div style={{ ...row, marginTop: 12 }}>
                <div style={{ ...field, maxWidth: 140 }}>
                  <label>PLZ</label>
                  <input value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} style={input} />
                </div>
                <div style={field}>
                  <label>Stadt</label>
                  <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} style={input} />
                </div>
                <div style={{ ...field, maxWidth: 180 }}>
                  <label>Land</label>
                  <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} style={input}>
                    {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {msg && (
          <div style={{ padding: 10, background: msg.type === "ok" ? "#d1fae5" : "#fee2e2", color: msg.type === "ok" ? "#065f46" : "#991b1b", fontSize: 13, marginBottom: 12 }}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "#94a3b8" : "#004537",
            color: "#fff",
            padding: "12px 24px",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "default" : "pointer",
          }}
        >
          {isPending ? "Wird gespeichert…" : "Adressen speichern"}
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
