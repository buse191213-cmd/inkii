"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart, cartItemTotalCents } from "./CartProvider";
import { colorLabel, colorHex } from "@/lib/catalog-options";
import { getDictionary } from "@/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const m = document.cookie.match(/inkii_locale=([^;]+)/);
    if (m && isLocale(m[1])) setLocale(m[1]);
  }, []);
  const t = getDictionary(locale).cart;

  // ESC kapatma + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          zIndex: 999,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
        }}
        role="dialog"
        aria-label={t.title}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {t.title} {items.length > 0 && <span style={{ color: "#64748b", fontWeight: 500 }}>({items.length})</span>}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.drawerClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: "#64748b",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 56, color: "#cbd5e1", marginBottom: 12 }}>🛒</div>
            <p style={{ color: "#64748b", marginBottom: 24 }}>{t.empty}</p>
            <Link
              href="/werbemittel"
              onClick={onClose}
              style={{
                background: "#004537",
                color: "#fff",
                padding: "10px 22px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Zum Katalog →
            </Link>
          </div>
        ) : (
          <>
            {/* Items scrollable */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px" }}>
              {items.map((item) => {
                const lineUnitCents = item.unitPriceCents + item.dtfPriceCents;
                const lineTotalCents = cartItemTotalCents(item);
                const colorHexCode = item.color ? colorHex(item.color) : "";
                return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: "#f4f5f3",
                      overflow: "hidden",
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

                  <div style={{ minWidth: 0 }}>
                    {/* Ürün adı + sil butonu */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#1f2937",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.productName}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={t.remove}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Varyant detay badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, alignItems: "center" }}>
                      {item.color && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            color: "#475569",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: 10,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: colorHexCode || "#e5e7eb",
                              border: "1px solid #cbd5e1",
                              flexShrink: 0,
                            }}
                          />
                          {colorLabel(item.color)}
                        </span>
                      )}
                      {item.size && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#475569",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: 10,
                          }}
                        >
                          Größe: {item.size}
                        </span>
                      )}
                      {item.hasDtf && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#0d9488",
                            background: "#ccfbf1",
                            padding: "3px 8px",
                            borderRadius: 10,
                          }}
                        >
                          + Transfer{item.dtfSize ? ` (${item.dtfSize})` : ""}
                        </span>
                      )}
                    </div>

                    {/* Design önizlemeleri (drawer) */}
                    {item.hasDtf && (() => {
                      let designs: { front?: string | null; back?: string | null } = {};
                      try {
                        if (item.dtfDesignUrl) designs = JSON.parse(item.dtfDesignUrl);
                      } catch { /* ignore */ }
                      const thumbs: Array<{ label: string; url: string }> = [];
                      if (designs.front) thumbs.push({ label: t.front, url: designs.front });
                      if (designs.back) thumbs.push({ label: t.back, url: designs.back });
                      if (thumbs.length === 0) return null;
                      return (
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                          {thumbs.map((t, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                              <div style={{
                                width: 38, height: 38,
                                border: "1px solid #d1fae5",
                                borderRadius: 5,
                                background: "#f0fdf4",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden",
                              }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={t.url} alt={t.label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", padding: 2 }} />
                              </div>
                              <div style={{ fontSize: 9, color: "#065f46", marginTop: 1, fontWeight: 600 }}>{t.label}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Adet + fiyat satırı */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 10 }}>
                      {/* Adet kontrol */}
                      <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #d1d5db" }}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: 26,
                            height: 26,
                            border: "none",
                            background: "#fff",
                            fontSize: 14,
                            cursor: "pointer",
                            padding: 0,
                            color: "#475569",
                          }}
                          aria-label="Weniger"
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
                            width: 40,
                            height: 26,
                            textAlign: "center",
                            border: "none",
                            borderLeft: "1px solid #d1d5db",
                            borderRight: "1px solid #d1d5db",
                            fontSize: 12,
                            padding: 0,
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: 26,
                            height: 26,
                            border: "none",
                            background: "#fff",
                            fontSize: 14,
                            cursor: "pointer",
                            padding: 0,
                            color: "#475569",
                          }}
                          aria-label="Mehr"
                        >
                          +
                        </button>
                      </div>

                      {/* Fiyat detayı */}
                      <div style={{ textAlign: "right" }}>
                        {lineUnitCents > 0 ? (
                          <>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
                              {euro(lineTotalCents)} €
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                              {euro(lineUnitCents)} € / Stk
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
                            Preis auf Anfrage
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "16px 20px",
                background: "#f8fafc",
                flexShrink: 0,
              }}
            >
              {subtotalCents > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 }}>
                  <span>{t.zwischensumme}</span>
                  <span style={{ fontWeight: 700 }}>{euro(subtotalCents)} €</span>
                </div>
              )}
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 14px", lineHeight: 1.4 }}>
                {t.drawerCheckoutHint}
              </p>

              <Link
                href="/warenkorb"
                onClick={onClose}
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
                  borderRadius: 8,
                }}
              >
                🛒 {t.drawerShow}
              </Link>

              <Link
                href="/warenkorb/anfrage"
                onClick={onClose}
                style={{
                  display: "block",
                  background: "#fff",
                  color: "#004537",
                  border: "1px solid #004537",
                  padding: "11px 12px",
                  textAlign: "center",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: 13,
                  borderRadius: 8,
                }}
              >
                ✉️ {t.requestQuote}
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
