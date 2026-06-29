"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { colorLabel } from "@/lib/catalog-options";
import { createOrder } from "./order-actions";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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

type Props = {
  paymentMethods: PaymentMethod[];
  shipping: ShippingData;
};

export default function KasseClient({ paymentMethods, shipping }: Props) {
  const router = useRouter();
  const { items, subtotalCents, clearCart, isLoaded } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");

  // Form state
  const [salutation, setSalutation] = useState("Herr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firmname, setFirmname] = useState("");
  const [ustId, setUstId] = useState("");
  // Billing
  const [billingStreet, setBillingStreet] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCountry, setBillingCountry] = useState("DE");
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

  const shippingCents = subtotalCents >= shipping.freeShippingFromCents ? 0 : shipping.standardCostCents;
  const taxCents = Math.round((subtotalCents + shippingCents) * 0.19);
  const totalCents = subtotalCents + shippingCents + taxCents;

  function handleSubmit() {
    setError("");
    if (!firstName || !lastName || !email || !billingStreet || !billingZip || !billingCity) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }
    if (!paymentMethod) {
      setError("Bitte eine Zahlungsmethode wählen.");
      return;
    }
    if (!acceptsTerms) {
      setError("Bitte AGB und Datenschutz akzeptieren.");
      return;
    }

    startTransition(async () => {
      const result = await createOrder({
        customer: {
          salutation,
          firstName,
          lastName,
          email,
          phone,
          firmname,
          ustId,
          billingStreet,
          billingZip,
          billingCity,
          billingCountry,
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
      });

      if (result.ok && result.orderNumber) {
        clearCart();
        router.push(`/bestellung-erfolg?nr=${result.orderNumber}`);
      } else {
        setError(result.error ?? "Bestellung konnte nicht gespeichert werden.");
      }
    });
  }

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 24 }}>Kasse</h1>

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
                <label>Vorname *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} required />
              </div>
              <div style={field}>
                <label>Nachname *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} required />
              </div>
            </div>
            <div style={row}>
              <div style={field}>
                <label>E-Mail *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} required />
              </div>
              <div style={field}>
                <label>Telefon</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={input} />
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
              <label>Straße & Hausnummer *</label>
              <input value={billingStreet} onChange={(e) => setBillingStreet(e.target.value)} style={input} required />
            </div>
            <div style={row}>
              <div style={{ ...field, maxWidth: 140 }}>
                <label>PLZ *</label>
                <input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} style={input} required />
              </div>
              <div style={field}>
                <label>Stadt *</label>
                <input value={billingCity} onChange={(e) => setBillingCity(e.target.value)} style={input} required />
              </div>
              <div style={{ ...field, maxWidth: 140 }}>
                <label>Land</label>
                <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)} style={input}>
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="NL">Niederlande</option>
                  <option value="BE">Belgien</option>
                  <option value="FR">Frankreich</option>
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
              <div style={row}>
                <div style={{ ...field, maxWidth: 140 }}>
                  <label>PLZ</label>
                  <input value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} style={input} />
                </div>
                <div style={field}>
                  <label>Stadt</label>
                  <input value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} style={input} />
                </div>
                <div style={{ ...field, maxWidth: 140 }}>
                  <label>Land</label>
                  <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} style={input}>
                    <option value="DE">Deutschland</option>
                    <option value="AT">Österreich</option>
                    <option value="CH">Schweiz</option>
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
                {paymentMethods.map((m) => (
                  <label
                    key={m.key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 14,
                      border: paymentMethod === m.key ? "2px solid #004537" : "1px solid #e5e7eb",
                      background: paymentMethod === m.key ? "#f0fdf4" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.key}
                      checked={paymentMethod === m.key}
                      onChange={() => setPaymentMethod(m.key)}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{m.description}</div>
                    </div>
                  </label>
                ))}
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
          <div style={{ marginTop: 24 }}>
            <label style={{ display: "flex", gap: 10, fontSize: 13, cursor: "pointer", lineHeight: 1.5 }}>
              <input
                type="checkbox"
                checked={acceptsTerms}
                onChange={(e) => setAcceptsTerms(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span>
                Ich habe die <Link href="/kontakt" style={{ color: "#004537", textDecoration: "underline" }}>AGB</Link>,{" "}
                <Link href="/datenschutz" style={{ color: "#004537", textDecoration: "underline" }}>Datenschutzerklärung</Link> und{" "}
                <Link href="/widerrufsbelehrung" style={{ color: "#004537", textDecoration: "underline" }}>Widerrufsbelehrung</Link>{" "}
                gelesen und stimme zu. *
              </span>
            </label>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: 12, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
              {error}
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
            {isPending ? "Wird übermittelt…" : "Jetzt kaufen →"}
          </button>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          :global(.kasse-layout) {
            grid-template-columns: 1fr !important;
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
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  width: "100%",
  fontFamily: "inherit",
};
