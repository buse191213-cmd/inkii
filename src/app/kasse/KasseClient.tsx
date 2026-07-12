"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useCart, cartItemTotalCents } from "@/components/CartProvider";
import CheckoutSteps from "@/components/CheckoutSteps";
import { colorLabel } from "@/lib/catalog-options";
import { createOrder } from "./order-actions";
import PayPalInlineButtons from "./PayPalInlineButtons";
import type { Dictionary } from "@/dictionaries/types";

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
  t: Dictionary["checkout"];
  tCart: Dictionary["cart"];
};

export default function KasseClient({ paymentMethods, shipping, prefill, isLoggedIn, paypalClientId, paypalMode, t, tCart }: Props) {
  const { items, subtotalCents, clearCart, isLoaded } = useCart();
  const [isPending, startTransition] = useTransition();
  const [generalError, setGeneralError] = useState<string>("");
  const [validationStarted, setValidationStarted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
        <p>{t.loading}</p>
      </section>
    );
  }

  if (isRedirecting) {
    return (
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "100px 28px", textAlign: "center" }}>
        <div style={{
          width: 44, height: 44, margin: "0 auto 20px",
          border: "3px solid #e5e7eb", borderTopColor: "#004537",
          borderRadius: "50%", animation: "kasse-spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#5a6660", fontSize: 15 }}>{t.processing}</p>
        <style>{`@keyframes kasse-spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>{t.title}</h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>
          {t.empty}
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
          {tCart.toCatalog}
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
  // Fiyatlar KDV DAHİL — total = subtotal + shipping, KDV içeriden
  const totalCents = subtotalCents + shippingCents;
  const taxCents = Math.round(totalCents - totalCents / 1.19);

  // Form validate (returns true if valid, else handles scroll/error display)
  function validateForm(): boolean {
    setGeneralError("");
    setValidationStarted(true);

    // Beden dağıtımı kontrolü — eksikse ödemeye izin verme
    const sizeIssue = items.find((i) => {
      if (!i.availableSizes || i.availableSizes.length === 0) return false;
      const breakdown = i.sizeBreakdown || {};
      const distributed = Object.values(breakdown).reduce((s, n) => s + (n || 0), 0);
      if (distributed === 0) return true;
      if (distributed !== i.quantity) return true;
      if (distributed < (i.minOrderQty || 1)) return true;
      return false;
    });
    if (sizeIssue) {
      setGeneralError(t.errors.distributeSizes);
      return false;
    }

    if (errors.firstName) { refs.firstName.current?.focus(); refs.firstName.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.lastName) { refs.lastName.current?.focus(); refs.lastName.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.email) { refs.email.current?.focus(); refs.email.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.phone) { setGeneralError(t.errors.invalidPhone); return false; }
    if (errors.billingStreet) { refs.billingStreet.current?.focus(); refs.billingStreet.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.billingZip) { refs.billingZip.current?.focus(); refs.billingZip.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.billingCity) { refs.billingCity.current?.focus(); refs.billingCity.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return false; }
    if (errors.shippingZip) { setGeneralError(t.errors.invalidZip); return false; }
    if (!paymentMethod) { setGeneralError(t.errors.selectPayment); return false; }
    if (!acceptsTerms) {
      setGeneralError(t.errors.acceptTerms);
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
      items: items.map((i) => {
        // Beden dağılımını okunabilir string yap: "S: 5, M: 10, L: 10"
        const sizeBreakdownStr = i.sizeBreakdown && Object.keys(i.sizeBreakdown).length > 0
          ? Object.entries(i.sizeBreakdown)
              .filter(([, n]) => (n || 0) > 0)
              .map(([s, n]) => `${s}: ${n}`)
              .join(", ")
          : "";
        // Bu kalemin GERÇEK toplam fiyatı (ratio + beden + transfer dahil)
        const lineTotalCents = cartItemTotalCents(i);
        // Ortalama birim fiyat (order kaydı için)
        const avgUnitCents = i.quantity > 0 ? Math.round(lineTotalCents / i.quantity) : i.unitPriceCents;
        // Order'a giden design: logo + boyut + mockup (mail ve admin için)
        // Mockup'lar 600px JPEG (küçük), payload'ı aşırı şişirmez.
        let orderDesignUrl = i.dtfDesignUrl;
        if (i.dtfDesignUrl) {
          try {
            const parsed = JSON.parse(i.dtfDesignUrl);
            orderDesignUrl = JSON.stringify({
              front: parsed.front || null,
              back: parsed.back || null,
              frontSize: parsed.frontSize || null,
              backSize: parsed.backSize || null,
              frontMockup: parsed.frontMockup || null,
              backMockup: parsed.backMockup || null,
            });
          } catch { /* ignore, orijinali kullan */ }
        }
        return {
          productId: i.productId,
          productCode: i.productCode,
          productName: i.productName,
          productImage: i.productImage,
          color: i.color,
          size: sizeBreakdownStr || i.size,
          quantity: i.quantity,
          unitPriceCents: avgUnitCents - (i.dtfPriceCents || 0), // dtf hariç birim (order mantığı için)
          hasDtf: i.hasDtf,
          dtfSize: i.dtfSize,
          dtfPriceCents: i.dtfPriceCents,
          dtfDesignUrl: orderDesignUrl,
        };
      }),
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
      return { ok: false, error: generalError || t.errors.fillForm };
    }
    return createOrder(buildOrderInput());
  }

  // Rechnung için manuel submit (PayPal kendi flow'unda)
  function handleSubmit() {
    if (!validateForm()) return;

    startTransition(async () => {
      const result = await createOrder(buildOrderInput());

      if (result.ok && result.orderId && result.orderNumber) {
        // Rechnung: direkt başarı sayfası — tam sayfa yükleme (SPA state sorunlarını önler)
        setIsRedirecting(true);
        clearCart();
        window.location.href = `/bestellung-erfolg?nr=${result.orderNumber}`;
      } else {
        setGeneralError(result.error ?? t.errors.orderFailed);
      }
    });
  }

  const showErr = validationStarted;

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px" }}>
      <CheckoutSteps current="anmelden" isLoggedIn={isLoggedIn} labels={t.steps} />
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 12 }}>{t.title}</h1>

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
          <span>👤 {t.alreadyCustomer} <a href="/login?next=/kasse" style={{ color: "#004537", fontWeight: 600, textDecoration: "underline" }}>{t.loginHere}</a> {t.fasterCheckout}</span>
          <a href="/registrieren" style={{ color: "#004537", fontWeight: 600, textDecoration: "underline" }}>{t.orRegister}</a>
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
          ✓ {t.loggedInAs} <strong>{firstName} {lastName}</strong>. {t.dataPrefilled}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }} className="kasse-layout">
        {/* Form */}
        <div>
          {/* Kontakt */}
          <div style={section}>
            <h3 style={sectionTitle}>1. {t.form.contact}</h3>
            <div style={row}>
              <div style={{ ...field, maxWidth: 120 }}>
                <label>{t.form.salutation}</label>
                <select value={salutation} onChange={(e) => setSalutation(e.target.value)} style={input}>
                  <option value="Herr">{t.form.herr}</option>
                  <option value="Frau">{t.form.frau}</option>
                  <option value="Divers">{t.form.divers}</option>
                </select>
              </div>
              <div style={field}>
                <label style={showErr && errors.firstName ? labelErr : undefined}>{t.form.firstName} *</label>
                <input
                  ref={refs.firstName}
                  value={firstName}
                  onChange={(e) => setFirstName(cleanNameInput(e.target.value))}
                  style={showErr && errors.firstName ? inputErr : input}
                />
                {showErr && errors.firstName && <span style={errMsg}>{t.form.required}</span>}
              </div>
              <div style={field}>
                <label style={showErr && errors.lastName ? labelErr : undefined}>{t.form.lastName} *</label>
                <input
                  ref={refs.lastName}
                  value={lastName}
                  onChange={(e) => setLastName(cleanNameInput(e.target.value))}
                  style={showErr && errors.lastName ? inputErr : input}
                />
                {showErr && errors.lastName && <span style={errMsg}>{t.form.required}</span>}
              </div>
            </div>
            <div style={row}>
              <div style={field}>
                <label style={showErr && errors.email ? labelErr : undefined}>{t.form.email} *</label>
                <input
                  ref={refs.email}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={showErr && errors.email ? inputErr : input}
                  placeholder="name@beispiel.de"
                />
                {showErr && errors.email === "required" && <span style={errMsg}>{t.form.required}</span>}
                {showErr && errors.email === "format" && <span style={errMsg}>{t.form.invalidEmail}</span>}
              </div>
              <div style={field}>
                <label style={showErr && errors.phone ? labelErr : undefined}>{t.form.phone}</label>
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
                  <span style={errMsg}>{t.form.invalidPhone}</span>
                )}
              </div>
            </div>
            <div style={row}>
              <div style={field}>
                <label>{t.form.companyOpt}</label>
                <input value={firmname} onChange={(e) => setFirmname(e.target.value)} style={input} />
              </div>
              <div style={field}>
                <label>{t.form.ustId}</label>
                <input value={ustId} onChange={(e) => setUstId(e.target.value)} style={input} placeholder="DE123456789" />
              </div>
            </div>
          </div>

          {/* Rechnungsadresse */}
          <div style={section}>
            <h3 style={sectionTitle}>2. {t.form.billingAddress}</h3>
            <div style={field}>
              <label style={showErr && errors.billingStreet ? labelErr : undefined}>{t.form.street} *</label>
              <input
                ref={refs.billingStreet}
                value={billingStreet}
                onChange={(e) => setBillingStreet(e.target.value)}
                style={showErr && errors.billingStreet ? inputErr : input}
              />
              {showErr && errors.billingStreet && <span style={errMsg}>{t.form.required}</span>}
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
                {showErr && errors.billingZip === "required" && <span style={errMsg}>{t.form.required}</span>}
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
                {showErr && errors.billingCity && <span style={errMsg}>{t.form.required}</span>}
              </div>
              <div style={{ ...field, maxWidth: 180 }}>
                <label>{t.form.country}</label>
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
              {t.form.shippingDiffers}
            </label>
          </div>

          {/* Lieferadresse */}
          {shippingDiffers && (
            <div style={section}>
              <h3 style={sectionTitle}>3. {t.form.shippingAddress}</h3>
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
                  <label>{t.form.city}</label>
                  <input value={shippingCity} onChange={(e) => setShippingCity(cleanNameInput(e.target.value))} style={input} />
                </div>
                <div style={{ ...field, maxWidth: 180 }}>
                  <label>{t.form.country}</label>
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
            <h3 style={sectionTitle}>{shippingDiffers ? "4." : "3."} {t.form.paymentMethod}</h3>
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
                            ℹ️ {t.form.noPaypalNeeded}
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
            <h3 style={sectionTitle}>{shippingDiffers ? "5." : "4."} {t.form.notesOpt}</h3>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={t.form.notesPlaceholder}
              style={{ ...input, minHeight: 80, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>

          {/* AGB */}
          <div
            ref={refs.terms}
            style={{
              marginTop: 24,
              padding: !acceptsTerms && validationStarted ? 12 : 0,
              background: !acceptsTerms && validationStarted ? "#fef2f2" : "transparent",
              border: !acceptsTerms && validationStarted ? "2px solid #dc2626" : "none",
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
                  if (e.target.checked && !acceptsTerms && validationStarted) {
                    setGeneralError("");
                  }
                }}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span>
                {t.form.acceptTerms1} <Link href="/kontakt" style={{ color: "#004537", textDecoration: "underline" }}>{t.form.agb}</Link>,{" "}
                <Link href="/datenschutz" style={{ color: "#004537", textDecoration: "underline" }}>{t.form.privacy}</Link>{" "}
                {t.form.acceptTerms2} *
              </span>
            </label>
            {!acceptsTerms && validationStarted && (
              <p style={{ margin: "8px 0 0 26px", fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
                ⚠ {t.form.confirmTerms}
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
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{t.form.yourOrder}</h3>

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
                      + Transfer{item.dtfSize ? ` (${item.dtfSize})` : ""}
                    </div>
                  )}
                  {item.hasDtf && (() => {
                    let designs: { front?: string | null; back?: string | null } = {};
                    try {
                      if (item.dtfDesignUrl) designs = JSON.parse(item.dtfDesignUrl);
                    } catch { /* ignore */ }
                    const thumbs: Array<{ label: string; url: string }> = [];
                    if (designs.front) thumbs.push({ label: "V", url: designs.front });
                    if (designs.back) thumbs.push({ label: "H", url: designs.back });
                    if (thumbs.length === 0) return null;
                    return (
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {thumbs.map((t, i) => (
                          <div key={i} style={{
                            width: 28, height: 28,
                            border: "1px solid #d1fae5", borderRadius: 4,
                            background: "#f0fdf4", overflow: "hidden",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            position: "relative",
                          }} title={t.label === "V" ? "Vorderseite" : "Rückseite"}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={t.url} alt={t.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 1 }} />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div style={{ fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                  {euro(cartItemTotalCents(item))} €
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{tCart.zwischensumme}</span>
              <span>{euro(subtotalCents)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{tCart.shipping} {shippingCents === 0 && <small style={{ color: "#0d9488" }}>({tCart.free})</small>}</span>
              <span>{euro(shippingCents)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
              <span>{tCart.davonMwst}</span>
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
              <span>{tCart.gesamt}</span>
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
                  setIsRedirecting(true);
                  clearCart();
                  window.location.href = `/bestellung-erfolg?nr=${orderNumber}`;
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
              {isPending ? t.form.processing2 : `${t.form.orderNow} →`}
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
