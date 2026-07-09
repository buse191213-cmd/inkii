"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer } from "../login/auth-actions";
import { getDictionary } from "@/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

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

export default function RegisterClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const m = document.cookie.match(/inkii_locale=([^;]+)/);
    if (m && isLocale(m[1])) setLocale(m[1]);
  }, []);
  const dict = getDictionary(locale);
  const tr = dict.register;
  const tf = dict.checkout.form;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [salutation, setSalutation] = useState("Herr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [firmname, setFirmname] = useState("");
  const [ustId, setUstId] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState("DE");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError(tr.pwMismatch);
      return;
    }
    startTransition(async () => {
      const result = await registerCustomer({
        email, password, salutation, firstName, lastName, phone,
        firmname, ustId, billingStreet, billingZip, billingCity, billingCountry,
      });
      if (result.ok) {
        const query = result.mailSent
          ? `?email=${encodeURIComponent(email)}`
          : `?email=${encodeURIComponent(email)}&mailErr=${encodeURIComponent(result.mailError ?? "unbekannt")}`;
        router.push(`/verifizieren${query}`);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "60px 28px" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 8 }}>{tr.title}</h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>
        Registrieren Sie sich, um Ihre Bestellungen zu verfolgen, Wiederbestellungen schnell zu erstellen und Rechnungen einzusehen.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Login Daten */}
        <h3 style={sectionH}>{tr.accessData}</h3>
        <div style={field}>
          <label>{tf.email} *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} required />
        </div>
        <div style={row}>
          <div style={field}>
            <label>{locale === "tr" ? "Şifre" : locale === "en" ? "Password" : "Passwort"} * <small style={{ color: "#94a3b8" }}>{tr.passwordHint}</small></label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} required minLength={6} />
          </div>
          <div style={field}>
            <label>{tr.passwordRepeat} *</label>
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} style={input} required />
          </div>
        </div>

        {/* Persönliche Daten */}
        <h3 style={{ ...sectionH, marginTop: 16 }}>{tr.personalData}</h3>
        <div style={row}>
          <div style={{ ...field, maxWidth: 120 }}>
            <label>{tf.salutation}</label>
            <select value={salutation} onChange={(e) => setSalutation(e.target.value)} style={input}>
              <option value="Herr">{tf.herr}</option>
              <option value="Frau">{tf.frau}</option>
              <option value="Divers">{tf.divers}</option>
            </select>
          </div>
          <div style={field}>
            <label>{tf.firstName} *</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} required />
          </div>
          <div style={field}>
            <label>{tf.lastName} *</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} required />
          </div>
        </div>
        <div style={row}>
          <div style={field}>
            <label>{tf.phone}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />
          </div>
          <div style={field}>
            <label>{tf.companyOpt}</label>
            <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
          </div>
        </div>
        <div style={field}>
          <label>{tf.ustId}</label>
          <input value={ustId} onChange={(e) => setUstId(e.target.value)} style={input} placeholder="DE123456789" />
        </div>

        {/* Adresse */}
        <h3 style={{ ...sectionH, marginTop: 16 }}>{tr.address}</h3>
        <div style={field}>
          <label>{tf.street} *</label>
          <input value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} style={input} required />
        </div>
        <div style={row}>
          <div style={{ ...field, maxWidth: 140 }}>
            <label>{tf.zip} *</label>
            <input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} style={input} required />
          </div>
          <div style={field}>
            <label>{tf.city} *</label>
            <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} style={input} required />
          </div>
          <div style={{ ...field, maxWidth: 180 }}>
            <label>{tf.country}</label>
            <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} style={input}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ padding: 10, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            background: isPending ? "#94a3b8" : "#004537",
            color: "#fff",
            padding: "13px 16px",
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "default" : "pointer",
            fontSize: 14,
            marginTop: 12,
          }}
        >
          {isPending ? tr.creating : tr.createBtn}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, marginTop: 4 }}>
          {tr.alreadyAccount}{" "}
          <Link href="/login" style={{ color: "#004537", textDecoration: "underline" }}>
            {tr.loginHere}
          </Link>
        </div>
      </form>
    </section>
  );
}

const sectionH: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "#1f2937", marginBottom: 4 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 180 };
const row: React.CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap" };
const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  fontFamily: "inherit",
};
