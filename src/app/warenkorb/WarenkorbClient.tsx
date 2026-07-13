"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, cartItemTotalCents } from "@/components/CartProvider";
import CartSizeDistributor from "@/components/CartSizeDistributor";
import CheckoutSteps from "@/components/CheckoutSteps";
import { colorLabel } from "@/lib/catalog-options";
import type { Dictionary } from "@/dictionaries/types";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Props = {
  t: Dictionary["cart"];
  tSteps: Dictionary["checkout"]["steps"];
  shipping: {
    standardCostCents: number;
    freeShippingFromCents: number;
  };
};

export default function WarenkorbClient({ t, tSteps, shipping }: Props) {
  const { items, subtotalCents, updateQuantity, removeItem, clearCart, isLoaded } = useCart();
  const [lightbox, setLightbox] = useState<{ url: string; label: string } | null>(null);

  if (!isLoaded) {
    return (
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px" }}>
        <p>Laden…</p>
      </section>
    );
  }

  // Versandkosten aus Admin-Einstellungen (identisch zur Kasse)
  const FREE_FROM = shipping.freeShippingFromCents;
  const shippingCents = subtotalCents >= FREE_FROM ? 0 : shipping.standardCostCents;
  // Fiyatlar KDV DAHİL — total = subtotal + shipping (KDV zaten içinde)
  const totalCents = subtotalCents + shippingCents;
  // KDV içerden hesaplanır (brutto / 1.19 * 0.19)
  const taxCents = Math.round(totalCents - totalCents / 1.19);

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
          {t.toCatalog}
        </Link>
      </section>
    );
  }

  return (
    <>
    <section className="cart-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 28px" }}>
      <CheckoutSteps current="warenkorb" labels={tSteps} />
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 24 }}>
        {t.title} <span style={{ color: "#64748b", fontWeight: 400, fontSize: "1.2rem" }}>({items.length})</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }} className="cart-layout">
        {/* Items */}
        <div>
          {items.map((item) => (
            <div
              key={item.id}
              className="cart-item-row"
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr auto",
                gap: 20,
                padding: "20px 0",
                borderBottom: "1px solid #e5e7eb",
                alignItems: "start",
              }}
            >
              <div
                className="cart-item-img"
                style={{
                  width: 160,
                  height: 160,
                  background: "#f4f5f3",
                  borderRadius: 0,
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flexShrink: 0,
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
                  {t.artNr}: {item.productCode}
                  {item.color && ` · ${colorLabel(item.color)}`}
                  {item.size && ` · ${item.size}`}
                </div>
                {item.hasDtf && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 600 }}>
                      + {t.transfer} (DTF) {item.dtfSize && `· ${item.dtfSize}`} — {euro(item.dtfPriceCents)} € {t.perStk}
                    </div>
                    {(() => {
                      // dtfDesignUrl = JSON {front, back, frontSize, backSize, frontMockup, backMockup}
                      let designs: {
                        front?: string | null; back?: string | null;
                        frontSize?: { widthCm: number; heightCm: number } | null;
                        backSize?: { widthCm: number; heightCm: number } | null;
                        frontMockup?: string | null; backMockup?: string | null;
                      } = {};
                      try {
                        if (item.dtfDesignUrl) designs = JSON.parse(item.dtfDesignUrl);
                      } catch { /* ignore */ }
                      const thumbs: Array<{ label: string; url: string; size?: { widthCm: number; heightCm: number } | null }> = [];
                      // Mockup varsa onu göster (logo ürün üzerinde), yoksa logo
                      if (designs.front) thumbs.push({ label: t.front, url: designs.frontMockup || designs.front, size: designs.frontSize });
                      if (designs.back) thumbs.push({ label: t.back, url: designs.backMockup || designs.back, size: designs.backSize });
                      if (thumbs.length === 0) return null;
                      return (
                        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                          {thumbs.map((t, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                              <div
                                onClick={() => setLightbox({ url: t.url, label: t.label })}
                                style={{
                                width: 96, height: 96,
                                border: "1px solid #e3e6df",
                                borderRadius: 0,
                                background: "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden",
                                cursor: "zoom-in",
                                position: "relative",
                              }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={t.url} alt={t.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                <span style={{
                                  position: "absolute", bottom: 3, right: 3,
                                  background: "rgba(15,26,22,0.75)", color: "#fff",
                                  borderRadius: 3, padding: "1px 4px", fontSize: 9,
                                  display: "flex", alignItems: "center", gap: 2,
                                }}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>
                                  </svg>
                                </span>
                              </div>
                              <div style={{ fontSize: 11, color: "#065f46", marginTop: 3, fontWeight: 700 }}>{t.label}</div>
                              {t.size && (
                                <div style={{ fontSize: 10, color: "#5a6660", marginTop: 1 }}>
                                  {t.size.widthCm.toLocaleString("de-DE")} × {t.size.heightCm.toLocaleString("de-DE")} cm
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
                {/* Beden varsa: dağıtım kutuları, yoksa: normal +/- adet */}
                {item.availableSizes && item.availableSizes.length > 0 ? (
                  <>
                    <CartSizeDistributor
                      itemId={item.id}
                      availableSizes={item.availableSizes}
                      sizeBreakdown={item.sizeBreakdown || {}}
                      quantity={item.quantity}
                      minOrderQty={item.minOrderQty || 1}
                      sizePrices={item.sizePrices}
                      basePriceCents={item.unitPriceCents}
                      priceTiers={item.priceTiers}
                      t={{
                        distributeSizes: t.distributeSizes,
                        noch: t.noch,
                        tooMany: t.tooMany,
                        distributeHint: t.distributeHint,
                        distributeRemainder: t.distributeRemainder,
                        minQtyWarn: t.minQtyWarn,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        marginTop: 8,
                        background: "transparent",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 12,
                        textDecoration: "underline",
                      }}
                    >
                      {t.remove}
                    </button>
                  </>
                ) : (
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
                      {t.remove}
                    </button>
                  </div>
                )}
              </div>

              <div className="cart-item-price" style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {euro(cartItemTotalCents(item))} €
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {item.quantity > 0
                    ? `Ø ${euro(Math.round(cartItemTotalCents(item) / item.quantity))} € ${t.perStk}`
                    : "—"}
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
              <span>{t.zwischensumme}</span>
              <span>{euro(subtotalCents)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t.shipping} {shippingCents === 0 && <small style={{ color: "#0d9488" }}>({t.free})</small>}</span>
              <span>{euro(shippingCents)} €</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
              <span>{t.davonMwst}</span>
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
              <span>{t.gesamt}</span>
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
              {t.freeShippingHint.replace("{amount}", euro(FREE_FROM - subtotalCents))}
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

              // Beden dağıtımı eksik/hatalı olan ürün var mı?
              const sizeIssue = items.find((i) => {
                if (!i.availableSizes || i.availableSizes.length === 0) return false;
                const breakdown = i.sizeBreakdown || {};
                const distributed = Object.values(breakdown).reduce((s, n) => s + (n || 0), 0);
                // Dağıtım toplamı adetle eşleşmeli VE minimum karşılanmalı
                if (distributed === 0) return true; // hiç dağıtılmamış
                if (distributed !== i.quantity) return true; // eksik/fazla
                if (distributed < (i.minOrderQty || 1)) return true; // min altı
                return false;
              });
              const blocked = hasQuoteOnly || Boolean(sizeIssue);

              return (
                <>
                  {sizeIssue && (
                    <div style={{
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 0,
                      padding: "10px 14px",
                      marginBottom: 10,
                      fontSize: 13,
                      color: "#92400e",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                    }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                      <span>
                        {t.minQtyWarn.replace("{n}", String(sizeIssue.minOrderQty || sizeIssue.quantity))}
                      </span>
                    </div>
                  )}

                  {blocked ? (
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
                        borderRadius: 0,
                      }}
                    >
                      🛒 {hasQuoteOnly ? t.checkoutQuoteOnly : t.checkoutSizesMissing}
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
                        borderRadius: 0,
                      }}
                    >
                      🛒 {t.toCheckout}
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
                    ✉️ {t.requestQuote}
                  </Link>

                  {hasQuoteOnly && (
                    <p style={{
                      fontSize: 11,
                      color: "#6b7671",
                      marginTop: 10,
                      padding: "10px 12px",
                      background: "#fafbf9",
                      borderLeft: "2px solid #004537",
                      borderRadius: 7,
                      lineHeight: 1.5,
                    }}>
                      {t.quoteOnlyInfo}
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
        @media (max-width: 600px) {
          :global(.cart-section) {
            padding: 24px 14px !important;
          }
          :global(.cart-item-row) {
            grid-template-columns: 100px 1fr !important;
            gap: 14px !important;
            padding: 16px 0 !important;
          }
          :global(.cart-item-img) {
            width: 100px !important;
            height: 100px !important;
          }
          :global(.cart-item-price) {
            grid-column: 1 / -1 !important;
            text-align: left !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: baseline !important;
            padding-top: 8px !important;
            border-top: 1px dashed #e5e7eb;
            margin-top: 4px;
          }
        }
      `}</style>
    </section>

    {/* Mockup büyütme popup (lightbox) */}
    {lightbox && (
      <div
        onClick={() => setLightbox(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,26,22,0.82)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, cursor: "zoom-out",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 8, padding: 16,
            maxWidth: "90vw", maxHeight: "90vh",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            position: "relative", cursor: "default",
          }}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Schließen"
            style={{
              position: "absolute", top: -14, right: -14,
              width: 36, height: 36, borderRadius: "50%",
              background: "#0f1a16", color: "#fff", border: "2px solid #fff",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)", fontSize: 18,
            }}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.label}
            style={{ maxWidth: "82vw", maxHeight: "78vh", objectFit: "contain" }}
          />
          <div style={{ fontSize: 14, fontWeight: 700, color: "#065f46" }}>{lightbox.label}</div>
        </div>
      </div>
    )}
    </>
  );
}
