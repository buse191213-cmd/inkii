"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { colorLabel } from "@/lib/catalog-options";

function euro(c: number): string {
  return (c / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotalCents, updateQuantity, removeItem } = useCart();

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
        aria-label="Warenkorb"
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
            Warenkorb {items.length > 0 && <span style={{ color: "#64748b", fontWeight: 500 }}>({items.length})</span>}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
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
            <p style={{ color: "#64748b", marginBottom: 24 }}>Ihr Warenkorb ist leer.</p>
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
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr auto",
                    gap: 12,
                    padding: "14px 0",
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
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
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#1f2937",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.productName}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {item.color && colorLabel(item.color)}
                      {item.size && ` · ${item.size}`}
                    </div>
                    {item.hasDtf && (
                      <div style={{ fontSize: 10, color: "#0d9488", marginTop: 2 }}>
                        + DTF {item.dtfSize}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 22,
                          height: 22,
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        −
                      </button>
                      <span style={{ fontSize: 12, minWidth: 22, textAlign: "center" }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 22,
                          height: 22,
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          fontSize: 12,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{
                          marginLeft: 4,
                          background: "transparent",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: 11,
                          textDecoration: "underline",
                          padding: 0,
                        }}
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: "right", fontSize: 12, fontWeight: 600 }}>
                    {item.unitPriceCents > 0 || item.dtfPriceCents > 0
                      ? `${euro((item.unitPriceCents + item.dtfPriceCents) * item.quantity)} €`
                      : <span style={{ color: "#64748b", fontWeight: 400, fontSize: 11 }}>auf Anfrage</span>
                    }
                  </div>
                </div>
              ))}
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
                  <span>Zwischensumme</span>
                  <span style={{ fontWeight: 700 }}>{euro(subtotalCents)} €</span>
                </div>
              )}
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 14px", lineHeight: 1.4 }}>
                Versand & MwSt. werden im Checkout berechnet.
              </p>

              <Link
                href="/warenkorb"
                onClick={onClose}
                style={{
                  display: "block",
                  background: "#004537",
                  color: "#fff",
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                Warenkorb ansehen →
              </Link>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link
                  href="/kasse"
                  onClick={onClose}
                  style={{
                    background: "#fff",
                    color: "#004537",
                    border: "1px solid #004537",
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: 12,
                  }}
                >
                  🛒 Zur Kasse
                </Link>
                <Link
                  href="/warenkorb/anfrage"
                  onClick={onClose}
                  style={{
                    background: "#fff",
                    color: "#004537",
                    border: "1px solid #004537",
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontSize: 12,
                  }}
                >
                  ✉️ Anfragen
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
