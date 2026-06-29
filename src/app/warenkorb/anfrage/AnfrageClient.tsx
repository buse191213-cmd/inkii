"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { colorLabel } from "@/lib/catalog-options";
import { sendQuoteRequest } from "./quote-actions";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function isValidPhone(s: string): boolean {
  if (!s.trim()) return true; // opsiyonel
  const digits = s.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

function cleanPhone(s: string): string {
  return s.replace(/[^\d\s\-/()]/g, "");
}

function cleanName(s: string): string {
  return s.replace(/[^A-Za-zÄÖÜäöüßéèêàâçñşğüöıİĞÜŞÖÇ\s\-'.]/g, "");
}

const COUNTRIES = [
  { code: "DE", phone: "+49", label: "DE" },
  { code: "AT", phone: "+43", label: "AT" },
  { code: "CH", phone: "+41", label: "CH" },
  { code: "NL", phone: "+31", label: "NL" },
  { code: "BE", phone: "+32", label: "BE" },
  { code: "FR", phone: "+33", label: "FR" },
  { code: "IT", phone: "+39", label: "IT" },
  { code: "ES", phone: "+34", label: "ES" },
  { code: "PL", phone: "+48", label: "PL" },
  { code: "TR", phone: "+90", label: "TR" },
];

export default function AnfrageClient() {
  const router = useRouter();
  const { items, subtotalCents, clearCart, isLoaded } = useCart();
  const [isPending, startTransition] = useTransition();
  const [validationStarted, setValidationStarted] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const refs = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+49");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firmname, setFirmname] = useState("");
  const [message, setMessage] = useState("");
  const [accepts, setAccepts] = useState(false);

  if (!isLoaded) {
    return (
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 28px" }}>
        <p>Laden…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>Angebot anfragen</h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>
          Ihr Warenkorb ist leer. Bitte fügen Sie zuerst Artikel hinzu.
        </p>
        <Link href="/werbemittel" style={{ display: "inline-block", background: "#004537", color: "#fff", padding: "12px 28px", fontWeight: 600, textDecoration: "none" }}>
          Zum Katalog →
        </Link>
      </section>
    );
  }

  // Validations
  const errors = {
    firstName: !firstName.trim() ? "required" : firstName.trim().length < 2 ? "format" : "",
    lastName: !lastName.trim() ? "required" : lastName.trim().length < 2 ? "format" : "",
    email: !email.trim() ? "required" : !isValidEmail(email) ? "format" : "",
    phone: !isValidPhone(phoneNumber) ? "format" : "",
  };
  const hasError = Boolean(errors.firstName || errors.lastName || errors.email || errors.phone);

  function handleSubmit() {
    setGeneralError("");
    setValidationStarted(true);

    if (errors.firstName) { refs.firstName.current?.focus(); refs.firstName.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.lastName) { refs.lastName.current?.focus(); refs.lastName.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.email) { refs.email.current?.focus(); refs.email.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.phone) {
      setGeneralError("Telefon ungültig (6-15 Ziffern).");
      return;
    }
    if (!accepts) {
      setGeneralError("Bitte Datenschutz akzeptieren.");
      return;
    }

    const fullPhone = phoneNumber.trim() ? `${phoneCountry} ${phoneNumber.trim()}` : "";

    startTransition(async () => {
      const result = await sendQuoteRequest({
        customer: { firstName, lastName, email, phone: fullPhone, firmname },
        items: items.map((i) => ({
          productName: i.productName,
          productCode: i.productCode,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          hasDtf: i.hasDtf,
          dtfSize: i.dtfSize,
        })),
        message,
        subtotalCents,
      });
      if (result.ok) {
        clearCart();
        router.push("/warenkorb/anfrage/erfolg");
      } else {
        setGeneralError(result.error ?? "Anfrage konnte nicht gesendet werden.");
      }
    });
  }

  const showErr = validationStarted;

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 28px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Angebot anfragen</h1>
      <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14 }}>
        Wir erstellen Ihnen ein individuelles Angebot für die Artikel in Ihrem Warenkorb.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }} className="anfrage-layout">
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Ihre Kontaktdaten</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={field}>
              <label style={showErr && errors.firstName ? labelErr : undefined}>Vorname *</label>
              <input
                ref={refs.firstName}
                value={firstName}
                onChange={(e) => setFirstName(cleanName(e.target.value))}
                style={showErr && errors.firstName ? inputErr : input}
              />
              {showErr && errors.firstName === "required" && <span style={errMsg}>Bitte ausfüllen</span>}
              {showErr && errors.firstName === "format" && <span style={errMsg}>Mindestens 2 Zeichen</span>}
            </div>
            <div style={field}>
              <label style={showErr && errors.lastName ? labelErr : undefined}>Nachname *</label>
              <input
                ref={refs.lastName}
                value={lastName}
                onChange={(e) => setLastName(cleanName(e.target.value))}
                style={showErr && errors.lastName ? inputErr : input}
              />
              {showErr && errors.lastName === "required" && <span style={errMsg}>Bitte ausfüllen</span>}
              {showErr && errors.lastName === "format" && <span style={errMsg}>Mindestens 2 Zeichen</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={field}>
              <label style={showErr && errors.email ? labelErr : undefined}>E-Mail *</label>
              <input
                ref={refs.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={showErr && errors.email ? inputErr : input}
                placeholder="name@beispiel.de"
              />
              {showErr && errors.email === "required" && <span style={errMsg}>Bitte ausfüllen</span>}
              {showErr && errors.email === "format" && <span style={errMsg}>Bitte gültige E-Mail-Adresse</span>}
            </div>
            <div style={field}>
              <label>Telefon</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={phoneCountry}
                  onChange={(e) => setPhoneCountry(e.target.value)}
                  style={{ ...input, maxWidth: 100, flexShrink: 0 }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.phone}>{c.phone} {c.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(cleanPhone(e.target.value))}
                  style={showErr && errors.phone ? inputErr : input}
                  placeholder="160 1234567"
                />
              </div>
              {showErr && errors.phone === "format" && <span style={errMsg}>6-15 Ziffern</span>}
            </div>
          </div>

          <div style={{ ...field, marginBottom: 12 }}>
            <label>Firma (optional)</label>
            <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
          </div>

          <div style={{ ...field, marginBottom: 16 }}>
            <label>Ihre Nachricht (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Z.B. Wunschmenge, Lieferzeitraum, Druckspezifikationen…"
              style={{ ...input, minHeight: 100, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          <label style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5, cursor: "pointer", marginBottom: 16 }}>
            <input type="checkbox" checked={accepts} onChange={(e) => setAccepts(e.target.checked)} style={{ marginTop: 3, flexShrink: 0 }} />
            <span>
              Ich habe die <Link href="/datenschutz" style={{ color: "#004537", textDecoration: "underline" }}>Datenschutzerklärung</Link> gelesen und stimme der Verarbeitung meiner Daten zu.
            </span>
          </label>

          {generalError && (
            <div style={{ marginTop: 12, padding: 12, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
              {generalError}
            </div>
          )}

          {showErr && hasError && !generalError && (
            <div style={{ marginTop: 12, padding: 12, background: "#fef3c7", color: "#92400e", fontSize: 13 }}>
              ⚠️ Bitte fülle alle rot markierten Pflichtfelder aus.
            </div>
          )}
        </div>

        <aside style={{ background: "#f8fafc", padding: 24, border: "1px solid #e5e7eb", position: "sticky", top: 100, alignSelf: "start" }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Ihre Anfrage</h3>

          <div style={{ marginBottom: 16, maxHeight: 280, overflowY: "auto" }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #e5e7eb", fontSize: 12 }}>
                <div style={{ width: 50, height: 50, background: "#f4f5f3", flexShrink: 0 }}>
                  {item.productImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.productImage} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>
                    {item.productCode}
                    {item.color && ` · ${colorLabel(item.color)}`}
                    {item.size && ` · ${item.size}`}
                    {" · "}{item.quantity} Stk
                  </div>
                  {item.hasDtf && <div style={{ color: "#0d9488", fontSize: 11, marginTop: 2 }}>+ DTF {item.dtfSize}</div>}
                </div>
              </div>
            ))}
          </div>

          {subtotalCents > 0 && (
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, padding: 8, background: "#fff" }}>
              Vorläufige Summe: <strong>{euro(subtotalCents)} €</strong><br />
              <small>(Finale Preise im Angebot)</small>
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              display: "block",
              width: "100%",
              background: isPending ? "#94a3b8" : "#004537",
              color: "#fff",
              padding: "14px 20px",
              textAlign: "center",
              fontWeight: 600,
              border: "none",
              cursor: isPending ? "default" : "pointer",
              fontSize: 15,
            }}
          >
            {isPending ? "Wird gesendet…" : "Anfrage senden →"}
          </button>

          <Link href="/warenkorb" style={{ display: "block", marginTop: 10, textAlign: "center", color: "#64748b", fontSize: 13, textDecoration: "underline" }}>
            ← Zurück zum Warenkorb
          </Link>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          :global(.anfrage-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  width: "100%",
  fontFamily: "inherit",
};

const inputErr: React.CSSProperties = {
  ...input,
  border: "1px solid #dc2626",
  background: "#fef2f2",
};

const labelErr: React.CSSProperties = {
  color: "#dc2626",
};

const errMsg: React.CSSProperties = {
  fontSize: 11,
  color: "#dc2626",
  marginTop: 2,
};
