"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { colorLabel } from "@/lib/catalog-options";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const FREE_FROM = 10000; // 100€
const SHIPPING_COST = 599; // 5.99€

export default function WarenkorbClient() {
  const { items, subtotalCents, updateQuantity, removeItem, clearCart, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px" }}>
        <p>Laden…</p>
      </section>
    );
  }

  const shippingCents = subtotalCents >= FREE_FROM ? 0 : SHIPPING_COST;
  // Fiyatlar KDV DAHİL — total = subtotal + shipping (KDV zaten içinde)
  const totalCents = subtotalCents + shippingCents;
  // KDV içerden hesaplanır (brutto / 1.19 * 0.19)
  const taxCents = Math.round(totalCents - totalCents / 1.19);

  if (items.length === 0) {
    return (
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>Warenkorb</h1>
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

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 24 }}>
        Warenkorb <span style={{ color: "#64748b", fontWeight: 400, fontSize: "1.2rem" }}>({items.length} {items.length === 1 ? "Artikel" : "Artikel"})</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }} className="cart-layout">
        {/* Items */}
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr auto",
                gap: 16,
                padding: "16px 0",
                borderBottom: "1px solid #e5e7eb",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  background: "#f4f5f3",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {item.productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ color: "#94a3b8" }}>—</span>
                )}
              </div>

              <div>
                <Link
                  href={`/werbemittel/${item.productId}`}
                  style={{ fontWeight: 600, fontSize: 15, color: "#1f2937", textDecoration: "none" }}
                >
                  {item.productName}
                </Link>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  Art-Nr.: {item.productCode}
                  {item.color && ` · ${colorLabel(item.color)}`}
                  {item.size && ` · ${item.size}`}
                </div>
                {item.hasDtf && (
                  <div style={{ fontSize: 12, color: "#0d9488", marginTop: 4 }}>
                    + DTF Druck ({item.dtfSize}) — {euro(item.dtfPriceCents)} € / Stk
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      width: 28,
                      height: 28,
                      border: "1px solid #d1d5db",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    aria-label="Menge verringern"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v) && v > 0) updateQuantity(item.id, v);
                    }}
                    style={{
                      width: 60,
                      height: 28,
                      textAlign: "center",
                      border: "1px solid #d1d5db",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      border: "1px solid #d1d5db",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                    aria-label="Menge erhöhen"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    style={{
                      marginLeft: 8,
                      background: "transparent",
                      border: "none",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontSize: 12,
                      textDecoration: "underline",
                    }}
                  >
                    Entfernen
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {euro((item.unitPriceCents + item.dtfPriceCents) * item.quantity)} €
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {euro(item.unitPriceCents + item.dtfPriceCents)} € / Stk
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={clearCart}
            style={{
              marginTop: 16,
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            Warenkorb leeren
          </button>
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
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Zusammenfassung</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
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
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid #cbd5e1",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              <span>Gesamt</span>
              <span>{euro(totalCents)} €</span>
            </div>
          </div>

          {subtotalCents < FREE_FROM && (
            <div
              style={{
                marginTop: 16,
                padding: 10,
                background: "#fef3c7",
                fontSize: 12,
                color: "#92400e",
              }}
            >
              Nur noch <strong>{euro(FREE_FROM - subtotalCents)} €</strong> bis zum kostenlosen Versand!
            </div>
          )}

          {/* B2B 2 ÇIKIŞ: Angebot anfragen + Direkt kaufen */}
          <div style={{ marginTop: 24, padding: 16, background: "#fff", border: "1px solid #e5e7eb" }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Wie möchten Sie fortfahren?</h4>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>
              Sie können ein individuelles Angebot anfragen oder direkt zur Kasse gehen.
            </p>

            {(() => {
              // "Preis auf Anfrage" = HEM ürün fiyatı HEM dtf fiyatı 0 olan
              const hasQuoteOnly = items.some((i) => (i.unitPriceCents + i.dtfPriceCents) === 0);

              return (
                <>
                  {hasQuoteOnly ? (
                    <div
                      style={{
                        display: "block",
                        background: "#e5e7eb",
                        color: "#94a3b8",
                        padding: "13px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: 14,
                        marginBottom: 8,
                        cursor: "not-allowed",
                      }}
                      title="Mindestens ein Artikel ist nur auf Anfrage"
                    >
                      🛒 Direkt zur Kasse (nicht möglich)
                    </div>
                  ) : (
                    <Link
                      href="/kasse"
                      style={{
                        display: "block",
                        background: "#004537",
                        color: "#fff",
                        padding: "13px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: 14,
                        marginBottom: 8,
                      }}
                    >
                      🛒 Direkt zur Kasse →
                    </Link>
                  )}

                  <Link
                    href="/warenkorb/anfrage"
                    style={{
                      display: "block",
                      background: "#fff",
                      color: "#004537",
                      border: "1px solid #004537",
                      padding: "13px 16px",
                      textAlign: "center",
                      fontWeight: 600,
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                  >
                    ✉️ Angebot anfragen
                  </Link>

                  {hasQuoteOnly && (
                    <p style={{ fontSize: 11, color: "#92400e", marginTop: 10, padding: 8, background: "#fef3c7", lineHeight: 1.4 }}>
                      ℹ️ Ihr Warenkorb enthält Artikel mit „Preis auf Anfrage". Bitte fragen Sie ein individuelles Angebot an.
                    </p>
                  )}
                </>
              );
            })()}

            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10, lineHeight: 1.4, textAlign: "center" }}>
              Bei Sonderwünschen, größeren Mengen oder Druckveredelung empfehlen wir „Angebot anfragen".
            </p>
          </div>

          <Link
            href="/werbemittel"
            style={{
              display: "block",
              marginTop: 10,
              padding: "10px 20px",
              textAlign: "center",
              color: "#64748b",
              textDecoration: "underline",
              fontSize: 13,
            }}
          >
            Weiter einkaufen
          </Link>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          :global(.cart-layout) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
