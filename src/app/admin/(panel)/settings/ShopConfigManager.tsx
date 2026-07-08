"use client";

import { useState, useTransition } from "react";
import {
  saveShopConfig,
  type ShopConfigData,
} from "./shop-config-actions";

type Props = {
  initial: ShopConfigData;
};

export default function ShopConfigManager({ initial }: Props) {
  const [paymentMethods, setPaymentMethods] = useState(initial.paymentMethods);
  const [shipping, setShipping] = useState(initial.shipping);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  function handleSave() {
    startTransition(async () => {
      const result = await saveShopConfig({
        paymentMethods,
        shipping,
      });
      if (result.ok) {
        setMessage("✓ Gespeichert");
        setTimeout(() => setMessage(""), 2500);
      } else {
        setMessage("✗ Fehler: " + (result.error ?? "unbekannt"));
      }
    });
  }

  function togglePayment(key: string) {
    setPaymentMethods((cur) =>
      cur.map((m) => (m.key === key ? { ...m, enabled: !m.enabled } : m))
    );
  }

  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <div className="panel-head">
        <h3>Shop / E-Commerce</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {message && (
            <span style={{ fontSize: 13, color: message.startsWith("✓") ? "#0d9488" : "#dc2626" }}>
              {message}
            </span>
          )}
          <button type="button" className="btn-primary" onClick={handleSave} disabled={isPending}>
            {isPending ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </div>
      <div className="panel-body">
        {/* === ZAHLUNGSMETHODEN === */}
        <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700 }}>
          Zahlungsmethoden
        </h4>
        <p className="form-note" style={{ marginTop: 0 }}>
          Aktivieren oder deaktivieren Sie die Zahlungsmethoden im Checkout.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {paymentMethods.map((m) => (
            <label
              key={m.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                border: "1px solid #e5e7eb",
                background: m.enabled ? "#f0fdf4" : "#fff",
                cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{m.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: m.enabled ? "#0d9488" : "#94a3b8" }}>
                  {m.enabled ? "AKTIV" : "DEAKTIVIERT"}
                </span>
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={() => togglePayment(m.key)}
                  style={{ width: 20, height: 20, cursor: "pointer" }}
                />
              </div>
            </label>
          ))}
        </div>

        {/* === DTF TRANSFER FİYATI === */}
        <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700 }}>
          DTF-Transfer Preis
        </h4>
        <p className="form-note" style={{ marginTop: 0 }}>
          Fester Preis pro bedruckter Seite (Vorderseite / Rückseite). Wird im Produkt-Customizer automatisch berechnet: Vorne + Hinten = 2 × Preis.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              border: "1.5px solid #004537",
              background: "#f0fdf4",
              borderRadius: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f1a16" }}>
                Transfer (DTF-Druck)
              </div>
              <div style={{ fontSize: 12, color: "#5a6660", marginTop: 3 }}>
                Preis pro Seite — Kunde zahlt dies für Vorder- und/oder Rückseite
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(shipping.transferPriceCents / 100).toFixed(2)}
                onChange={(e) =>
                  setShipping({
                    ...shipping,
                    transferPriceCents: Math.round(parseFloat(e.target.value || "0") * 100),
                  })
                }
                style={{ width: 90, fontSize: 16, fontWeight: 700, textAlign: "right" }}
              />
              <span style={{ fontSize: 12, color: "#5a6660" }}>/ Seite</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#5a6660", padding: "0 4px", display: "flex", gap: 16 }}>
            <span>💡 Nur Vorne: <b>{(shipping.transferPriceCents / 100).toFixed(2)} €</b></span>
            <span>Vorne + Hinten: <b>{((shipping.transferPriceCents * 2) / 100).toFixed(2)} €</b></span>
          </div>
        </div>

        {/* === VERSAND === */}
        <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700 }}>
          Versand
        </h4>
        <p className="form-note" style={{ marginTop: 0 }}>
          Versandkosten und Schwellwert für kostenfreien Versand.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Versandkosten (€)</label>
            <input
              type="number"
              step="0.01"
              value={(shipping.standardCostCents / 100).toFixed(2)}
              onChange={(e) =>
                setShipping({
                  ...shipping,
                  standardCostCents: Math.round(parseFloat(e.target.value || "0") * 100),
                })
              }
            />
          </div>
          <div className="field">
            <label>Kostenlos ab (€)</label>
            <input
              type="number"
              step="1"
              value={(shipping.freeShippingFromCents / 100).toFixed(0)}
              onChange={(e) =>
                setShipping({
                  ...shipping,
                  freeShippingFromCents: Math.round(parseFloat(e.target.value || "0") * 100),
                })
              }
            />
          </div>
          <div className="field">
            <label>Standard-Carrier</label>
            <select
              value={shipping.carrier}
              onChange={(e) => setShipping({ ...shipping, carrier: e.target.value })}
            >
              <option value="DHL">DHL</option>
              <option value="DPD">DPD</option>
              <option value="Hermes">Hermes</option>
              <option value="GLS">GLS</option>
              <option value="UPS">UPS</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
