"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { colorLabel } from "@/lib/catalog-options";
import { createOrder } from "./order-actions";
import PayPalInlineButtons from "./PayPalInlineButtons";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// PLZ-Regeln pro Land (length + pattern + placeholder)
const PLZ_RULES: Record<string, { pattern: RegExp; placeholder: string; hint: string }> = {
  DE: { pattern: /^\d{5}$/, placeholder: "12345", hint: "5 Ziffern" },
  AT: { pattern: /^\d{4}$/, placeholder: "1234", hint: "4 Ziffern" },
  CH: { pattern: /^\d{4}$/, placeholder: "1234", hint: "4 Ziffern" },
  NL: { pattern: /^\d{4}\s?[A-Z]{2}$/i, placeholder: "1234 AB", hint: "4 Ziffern + 2 Buchstaben" },
  BE: { pattern: /^\d{4}$/, placeholder: "1234", hint: "4 Ziffern" },
  FR: { pattern: /^\d{5}$/, placeholder: "75001", hint: "5 Ziffern" },
  IT: { pattern: /^\d{5}$/, placeholder: "00100", hint: "5 Ziffern" },
  ES: { pattern: /^\d{5}$/, placeholder: "28001", hint: "5 Ziffern" },
  PL: { pattern: /^\d{2}-\d{3}$/, placeholder: "00-000", hint: "00-000 Format" },
  TR: { pattern: /^\d{5}$/, placeholder: "34000", hint: "5 Ziffern" },
};

function plzRule(country: string) {
  return PLZ_RULES[country] ?? PLZ_RULES.DE;
}

function isValidPlz(value: string, country: string): boolean {
  return plzRule(country).pattern.test(value.trim());
}

// Telefon: nur Ziffern (akıllı filtreleme - / ( ) gerekirse)
function cleanPhoneInput(s: string): string {
  // Sadece rakam, boşluk, /, -, ()
  return s.replace(/[^\d\s\-/()]/g, "");
}

function isValidPhone(s: string): boolean {
  // Boş geçerli (zorunlu değil), girilen değer rakam sayısı 6-15 olmalı
  if (!s.trim()) return true;
  const digits = s.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

// PLZ input filtering — NL hariç sadece rakam (PL için -)
function cleanPlzInput(s: string, country: string): string {
  if (country === "NL") {
    return s.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
  }
  if (country === "PL") {
    return s.replace(/[^\d-]/g, "");
  }
  return s.replace(/\D/g, ""); // Sadece rakam
}

// İsim/Şehir input — sayı kabul etme (harf + boşluk + tire + apostrof)
function cleanNameInput(s: string): string {
  return s.replace(/[^A-Za-zÄÖÜäöüßéèêàâçñşğüöıİĞÜŞÖÇ\s\-'.]/g, "");
}

const COUNTRIES = [
  { code: "DE", label: "Deutschland", phone: "+49" },
  { code: "AT", label: "Österreich", phone: "+43" },
  { code: "CH", label: "Schweiz", phone: "+41" },
  { code: "NL", label: "Niederlande", phone: "+31" },
  { code: "BE", label: "Belgien", phone: "+32" },
  { code: "FR", label: "Frankreich", phone: "+33" },
  { code: "IT", label: "Italien", phone: "+39" },
  { code: "ES", label: "Spanien", phone: "+34" },
  { code: "PL", label: "Polen", phone: "+48" },
  { code: "TR", label: "Türkei", phone: "+90" },
];

type PaymentMethod = {
  key: string;
  label: string;
  description: string;
};

type ShippingData = {
  standardCostCents: number;
  freeShippingFromCents: number;
  carrier: string;
};

type Prefill = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmname: string;
  ustId: string;
  billingStreet: string;
  billingZip: string;
  billingCity: string;
  billingCountry: string;
};

type Props = {
  paymentMethods: PaymentMethod[];
  shipping: ShippingData;
  prefill?: Prefill | null;
  isLoggedIn?: boolean;
  paypalClientId?: string;
  paypalMode?: "sandbox" | "live";
};

export default function KasseClient({ paymentMethods, shipping, prefill, isLoggedIn, paypalClientId, paypalMode }: Props) {
  const router = useRouter();
  const { items, subtotalCents, clearCart, isLoaded } = useCart();
  const [isPending, startTransition] = useTransition();
  const [generalError, setGeneralError] = useState<string>("");
  const [validationStarted, setValidationStarted] = useState(false);

  // Refs for scroll-to-error
  const refs = {
    firstName: useRef<HTMLInputElement>(null),
    lastName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    billingStreet: useRef<HTMLInputElement>(null),
    billingZip: useRef<HTMLInputElement>(null),
    billingCity: useRef<HTMLInputElement>(null),
    terms: useRef<HTMLDivElement>(null),
  };

  // Form state — prefill from logged-in customer
  const [salutation, setSalutation] = useState(prefill?.salutation || "Herr");
  const [firstName, setFirstName] = useState(prefill?.firstName || "");
  const [lastName, setLastName] = useState(prefill?.lastName || "");
  const [email, setEmail] = useState(prefill?.email || "");
  const [phoneCountry, setPhoneCountry] = useState("+49");
  const [phoneNumber, setPhoneNumber] = useState(prefill?.phone?.replace(/^\+\d+\s?/, "") || "");
  const [firmname, setFirmname] = useState(prefill?.firmname || "");
  const [ustId, setUstId] = useState(prefill?.ustId || "");
  // Billing
  const [billingStreet, setBillingStreet] = useState(prefill?.billingStreet || "");
  const [billingZip, setBillingZip] = useState(prefill?.billingZip || "");
  const [billingCity, setBillingCity] = useState(prefill?.billingCity || "");
  const [billingCountry, setBillingCountry] = useState(prefill?.billingCountry || "DE");
  // Shipping
  const [shippingDiffers, setShippingDiffers] = useState(false);
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCountry, setShippingCountry] = useState("DE");
  // Payment + notes
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.key ?? "");
  const [customerNote, setCustomerNote] = useState("");
  const [acceptsTerms, setAcceptsTerms] = useState(false);

  if (!isLoaded) {
    return (
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px" }}>
        <p>Laden…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>Kasse</h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>
          Ihr Warenkorb ist leer.
        </p>
        <Link
          href="/werbemittel"
          style={{
            display: "inline-block",
            background: "#004537",
            color: "#fff",
            padding: "12px 28px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Zum Katalog →
        </Link>
      </section>
    );
  }

  // Validations
  const errors = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    email: !email.trim() ? "required" : !isValidEmail(email) ? "format" : "",
    phone: !isValidPhone(phoneNumber) ? "format" : "",
    billingStreet: !billingStreet.trim(),
    billingZip: !billingZip.trim() ? "required" : !isValidPlz(billingZip, billingCountry) ? "format" : "",
    billingCity: !billingCity.trim(),
    shippingZip: shippingDiffers && shippingZip.trim() && !isValidPlz(shippingZip, shippingCountry) ? "format" : "",
  };
  const hasError = Boolean(
    errors.firstName || errors.lastName || errors.email || errors.phone || errors.billingStreet || errors.billingZip || errors.billingCity || errors.shippingZip
  );

  const shippingCents = subtotalCents >= shipping.freeShippingFromCents ? 0 : shipping.standardCostCents;
  const taxCents = Math.round((subtotalCents + shippingCents) * 0.19);
  const totalCents = subtotalCents + shippingCents + taxCents;

  // Form validate (returns true if valid, else handles scroll/error display)
  function validateForm(): boolean {
    setGeneralError("");
    setValidationStarted(true);

    if (errors.firstName) { refs.firstName.current?.focus(); refs.firstName.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.lastName) { refs.lastName.current?.focus(); refs.lastName.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.email) { refs.email.current?.focus(); refs.email.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.phone) { setGeneralError("Bitte gültige Telefonnummer eingeben."); return false; }
    if (errors.billingStreet) { refs.billingStreet.current?.focus(); refs.billingStreet.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.billingZip) { refs.billingZip.current?.focus(); refs.billingZip.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.billingCity) { refs.billingCity.current?.focus(); refs.billingCity.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.shippingZip) { setGeneralError("Bitte gültige Liefer-PLZ eingeben."); return false; }
    if (!paymentMethod) { setGeneralError("Bitte eine Zahlungsmethode wählen."); return false; }
    if (!acceptsTerms) {
      setGeneralError("Bitte AGB und Datenschutz akzeptieren.");
      refs.terms.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    return true;
  }

  function buildOrderInput() {
    const fullPhone = phoneNumber.trim() ? `${phoneCountry} ${phoneNumber.trim()}` : "";
    return {
      customer: {
        salutation, firstName, lastName, email, phone: fullPhone, firmname, ustId,
        billingStreet, billingZip, billingCity, billingCountry,
        shippingDiffers,
        shippingStreet: shippingDiffers ? shippingStreet : "",
        shippingZip: shippingDiffers ? shippingZip : "",
        shippingCity: shippingDiffers ? shippingCity : "",
        shippingCountry: shippingDiffers ? shippingCountry : "DE",
      },
      items: items.map((i) => ({
        productId: i.productId,
        productCode: i.productCode,
        productName: i.productName,
        productImage: i.productImage,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        hasDtf: i.hasDtf,
        dtfSize: i.dtfSize,
        dtfPriceCents: i.dtfPriceCents,
        dtfDesignUrl: i.dtfDesignUrl,
      })),
      paymentMethod,
      customerNote,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
    };
  }

  // PayPal Buttons için: validate + DB order create
  async function validateAndCreateOrderForPayPal(): Promise<{ ok: boolean; orderId?: string; orderNumber?: string; error?: string }> {
    if (!validateForm()) {
      return { ok: false, error: generalError || "Bitte Formular ausfüllen" };
    }
    return createOrder(buildOrderInput());
  }

  // Rechnung için manuel submit (PayPal kendi flow'unda)
  function handleSubmit() {
    if (!validateForm()) return;

    startTransition(async () => {
      const result = await createOrder(buildOrderInput());

      if (result.ok && result.orderId && result.orderNumber) {
        // Rechnung: direkt başarı sayfası
        clearCart();
        router.push(`/bestellung-erfolg?nr=${result.orderNumber}`);
      } else {
        setGeneralError(result.error ?? "Bestellung konnte nicht gespeichert werden.");
      }
    });
  }

  const showErr = validationStarted;

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>Kasse</h1>

      {!isLoggedIn && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 13,
        }}>
          <span>👤 Bereits Kunde? <a href="/login?next=/kasse" style={{ color: "#004537", fontWeight: 600, textDecoration: "underline" }}>Hier anmelden</a> für schnelleren Checkout.</span>
          <a href="/registrieren" style={{ color: "#004537", fontWeight: 600, textDecoration: "underline" }}>Oder neu registrieren →</a>
        </div>
      )}

      {isLoggedIn && (
        <div style={{
          background: "#dbeafe",
          border: "1px solid #93c5fd",
          padding: "10px 14px",
          marginBottom: 20,
          fontSize: 13,
          color: "#1e40af",
        }}>
          ✓ Sie sind als <strong>{firstName} {lastName}</strong> angemeldet. Ihre Daten sind vorausgefüllt.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }} className="kasse-layout">
        {/* Form */}
        <div>
          {/* Kontakt */}
          <div style={section}>
            <h3 style={sectionTitle}>1. Kontakt</h3>
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
                <label style={showErr && errors.firstName ? labelErr : undefined}>Vorname *</label>
                <input
                  ref={refs.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(cleanNameInput(e.target.value))}
                  style={showErr && errors.firstName ? inputErr : input}
                />
                {showErr && errors.firstName && <span style={errMsg}>Bitte ausfüllen</span>}
              </div>
              <div style={field}>
                <label style={showErr && errors.lastName ? labelErr : undefined}>Nachname *</label>
                <input
                  ref={refs.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(cleanNameInput(e.target.value))}
                  style={showErr && errors.lastName ? inputErr : input}
                />
                {showErr && errors.lastName && <span style={errMsg}>Bitte ausfüllen</span>}
              </div>
            </div>
            <div style={row}>
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
                <label style={showErr && errors.phone ? labelErr : undefined}>Telefon</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <select
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                    style={{ ...input, maxWidth: 110, flexShrink: 0 }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.phone}>
                        {c.phone} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(cleanPhoneInput(e.target.value))}
                    style={showErr && errors.phone ? inputErr : input}
                    placeholder="160 1234567"
                  />
                </div>
                {showErr && errors.phone === "format" && (
                  <span style={errMsg}>Bitte gültige Telefonnummer (6-15 Ziffern)</span>
                )}
              </div>
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
          </div>

          {/* Rechnungsadresse */}
          <div style={section}>
            <h3 style={sectionTitle}>2. Rechnungsadresse</h3>
            <div style={field}>
              <label style={showErr && errors.billingStreet ? labelErr : undefined}>Straße & Hausnummer *</label>
              <input
                ref={refs.billingStreet}
                value={billingStreet}
                onChange={(e) => setBillingStreet(e.target.value)}
                style={showErr && errors.billingStreet ? inputErr : input}
              />
              {showErr && errors.billingStreet && <span style={errMsg}>Bitte ausfüllen</span>}
            </div>
            <div style={{ ...row, marginTop: 12 }}>
              <div style={{ ...field, maxWidth: 180 }}>
                <label style={showErr && errors.billingZip ? labelErr : undefined}>
                  PLZ * <small style={{ color: "#94a3b8", fontWeight: 400 }}>({plzRule(billingCountry).hint})</small>
                </label>
                <input
                  ref={refs.billingZip}
                  value={billingZip}
                  onChange={(e) => setBillingZip(cleanPlzInput(e.target.value, billingCountry))}
                  style={showErr && errors.billingZip ? inputErr : input}
                  placeholder={plzRule(billingCountry).placeholder}
                  inputMode={billingCountry === "NL" ? "text" : "numeric"}
                />
                {showErr && errors.billingZip === "required" && <span style={errMsg}>Bitte ausfüllen</span>}
                {showErr && errors.billingZip === "format" && (
                  <span style={errMsg}>Format: {plzRule(billingCountry).placeholder}</span>
                )}
              </div>
              <div style={field}>
                <label style={showErr && errors.billingCity ? labelErr : undefined}>Stadt *</label>
                <input
                  ref={refs.billingCity}
                  value={billingCity}
                  onChange={(e) => setBillingCity(cleanNameInput(e.target.value))}
                  style={showErr && errors.billingCity ? inputErr : input}
                />
                {showErr && errors.billingCity && <span style={errMsg}>Bitte ausfüllen</span>}
              </div>
              <div style={{ ...field, maxWidth: 180 }}>
                <label>Land</label>
                <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} style={input}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={{ display: "flex", gap: 8, marginTop: 14, fontSize: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={shippingDiffers}
                onChange={(e) => setShippingDiffers(e.target.checked)}
              />
              Lieferadresse abweichend
            </label>
          </div>

          {/* Lieferadresse */}
          {shippingDiffers && (
            <div style={section}>
              <h3 style={sectionTitle}>3. Lieferadresse</h3>
              <div style={field}>
                <label>Straße & Hausnummer</label>
                <input value={shippingStreet} onChange={(e) => setShippingStreet(e.target.value)} style={input} />
              </div>
              <div style={{ ...row, marginTop: 12 }}>
                <div style={{ ...field, maxWidth: 180 }}>
                  <label style={showErr && errors.shippingZip ? labelErr : undefined}>
                    PLZ <small style={{ color: "#94a3b8", fontWeight: 400 }}>({plzRule(shippingCountry).hint})</small>
                  </label>
                  <input
                    value={shippingZip}
                    onChange={(e) => setShippingZip(cleanPlzInput(e.target.value, shippingCountry))}
                    style={showErr && errors.shippingZip ? inputErr : input}
                    placeholder={plzRule(shippingCountry).placeholder}
                    inputMode={shippingCountry === "NL" ? "text" : "numeric"}
                  />
                  {showErr && errors.shippingZip === "format" && (
                    <span style={errMsg}>Format: {plzRule(shippingCountry).placeholder}</span>
                  )}
                </div>
                <div style={field}>
                  <label>Stadt</label>
                  <input value={shippingCity} onChange={(e) => setShippingCity(cleanNameInput(e.target.value))} style={input} />
                </div>
                <div style={{ ...field, maxWidth: 180 }}>
                  <label>Land</label>
                  <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} style={input}>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Zahlungsmethode */}
          <div style={section}>
            <h3 style={sectionTitle}>{shippingDiffers ? "4." : "3."} Zahlungsmethode</h3>
            {paymentMethods.length === 0 ? (
              <p style={{ color: "#dc2626", fontSize: 14 }}>
                Aktuell sind keine Zahlungsmethoden verfügbar. Bitte kontaktieren Sie uns.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {paymentMethods.map((m) => {
                  const active = paymentMethod === m.key;
                  const subInfo = m.key === "paypal" ? "Mit Kreditkarte, Lastschrift oder PayPal-Konto" :
                                 m.key === "rechnung" ? "Per Banküberweisung — 14 Tage Zahlungsziel" :
                                 m.description;
                  return (
                    <label
                      key={m.key}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 14,
                        border: active ? "2px solid #004537" : "1px solid #e5e7eb",
                        background: active ? "#f0fdf4" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.key}
                        checked={active}
                        onChange={() => setPaymentMethod(m.key)}
                        style={{ marginTop: 3 }}
                      />
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, marginTop: 2, flexShrink: 0 }}>
                        {m.key === "paypal" ? (
                          // PayPal Logo (resmi marka renkleri)
                          <svg viewBox="0 0 100 26" width="56" height="18" xmlns="http://www.w3.org/2000/svg">
                            <text x="0" y="20" fontFamily="Arial Black, Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="22" fill="#003087">Pay</text>
                            <text x="42" y="20" fontFamily="Arial Black, Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="22" fill="#009cde">Pal</text>
                          </svg>
                        ) : (
                          <span style={{ fontSize: 22 }}>📧</span>
                        )}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: active ? "#004537" : "#1f2937" }}>
                          {m.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.4 }}>
                          {subInfo}
                        </div>
                        {m.key === "paypal" && active && (
                          <div style={{ fontSize: 11, color: "#0e7490", marginTop: 6, padding: 6, background: "#ecfeff", display: "inline-block" }}>
                            ℹ️ Kein PayPal-Konto nötig — direkt mit Karte bezahlen
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={section}>
            <h3 style={sectionTitle}>{shippingDiffers ? "5." : "4."} Anmerkungen (optional)</h3>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Z.B. Wunschtermin, besondere Hinweise…"
              style={{ ...input, minHeight: 80, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          {/* AGB */}
          <div
            ref={refs.terms}
            style={{
              marginTop: 24,
              padding: !acceptsTerms && generalError.includes("AGB") ? 12 : 0,
              background: !acceptsTerms && generalError.includes("AGB") ? "#fef2f2" : "transparent",
              border: !acceptsTerms && generalError.includes("AGB") ? "2px solid #dc2626" : "none",
              borderRadius: 4,
              transition: "all 0.2s",
            }}
          >
            <label style={{ display: "flex", gap: 10, fontSize: 13, cursor: "pointer", lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={acceptsTerms}
                onChange={(e) => {
                  setAcceptsTerms(e.target.checked);
                  if (e.target.checked && generalError.includes("AGB")) {
                    setGeneralError("");
                  }
                }}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span>
                Ich habe die <Link href="/kontakt" style={{ color: "#004537", textDecoration: "underline" }}>AGB</Link>,{" "}
                <Link href="/datenschutz" style={{ color: "#004537", textDecoration: "underline" }}>Datenschutzerklärung</Link> und{" "}
                <Link href="/widerrufsbelehrung" style={{ color: "#004537", textDecoration: "underline" }}>Widerrufsbelehrung</Link>{" "}
                gelesen und stimme zu. *
              </span>
            </label>
            {!acceptsTerms && generalError.includes("AGB") && (
              <p style={{ margin: "8px 0 0 26px", fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
                ⚠ Bitte bestätigen Sie die AGB, um fortzufahren.
              </p>
            )}
          </div>

          {generalError && (
            <div style={{ marginTop: 16, padding: 12, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
              {generalError}
            </div>
          )}

          {showErr && hasError && !generalError && (
            <div style={{ marginTop: 16, padding: 12, background: "#fef3c7", color: "#92400e", fontSize: 13 }}>
              ⚠️ Bitte fülle alle rot markierten Pflichtfelder aus.
            </div>
          )}
        </div>

        {/* Summary */}
        <aside
          style={{
            background: "#f8fafc",
            padding: 24,
            border: "1px solid #e5e7eb",
            position: "sticky",
            top: 100,
            alignSelf: "start",
          }}
        >
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Ihre Bestellung</h3>

          <div style={{ marginBottom: 16, maxHeight: 240, overflowY: "auto" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    background: "#f4f5f3",
                    flexShrink: 0,
                  }}
                >
                  {item.productImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.productName}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>
                    {item.color && colorLabel(item.color)}
                    {item.size && ` · ${item.size}`}
                    {" · "}{item.quantity} Stk
                  </div>
                  {item.hasDtf && (
                    <div style={{ color: "#0d9488", fontSize: 10, marginTop: 2 }}>
                      + DTF {item.dtfSize}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                  {euro((item.unitPriceCents + item.dtfPriceCents) * item.quantity)} €
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Zwischensumme</span>
              <span>{euro(subtotalCents)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Versand {shippingCents === 0 && <small style={{ color: "#0d9488" }}>(kostenlos)</small>}</span>
              <span>{euro(shippingCents)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
              <span>davon MwSt. 19%</span>
              <span>{euro(taxCents)} €</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid #cbd5e1",
                fontWeight: 700,
                fontSize: 17,
              }}
            >
              <span>Gesamt</span>
              <span>{euro(totalCents)} €</span>
            </div>
          </div>

          {/* Ödeme yöntemine göre buton */}
          {paymentMethod === "paypal" && paypalClientId ? (
            <div style={{ marginTop: 20 }}>
              <PayPalInlineButtons
                clientId={paypalClientId}
                amountCents={totalCents}
                validateAndCreateOrder={validateAndCreateOrderForPayPal}
                onSuccess={(orderNumber) => {
                  clearCart();
                  router.push(`/bestellung-erfolg?nr=${orderNumber}`);
                }}
                disabled={isPending}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || paymentMethods.length === 0}
              style={{
                display: "block",
                marginTop: 20,
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
              {isPending ? "Wird übermittelt…" : "Auf Rechnung bestellen →"}
            </button>
          )}
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          :global(.kasse-layout) {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

const section: React.CSSProperties = {
  marginBottom: 28,
  paddingBottom: 24,
  borderBottom: "1px solid #e5e7eb",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  marginBottom: 14,
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 12,
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
  minWidth: 180,
};

const input: React.CSSProperties = {
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  fontSize: 16, // 16px iOS auto-zoom önler
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
