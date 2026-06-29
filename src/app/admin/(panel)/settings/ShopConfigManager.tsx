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
  const [dtfPrices, setDtfPrices] = useState(initial.dtfPrices);
  const [shipping, setShipping] = useState(initial.shipping);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  function handleSave() {
    startTransition(async () => {
      const result = await saveShopConfig({
        paymentMethods,
        dtfPrices,
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

  function updateDtfPrice(id: string, field: "priceCents" | "enabled", value: number | boolean) {
    setDtfPrices((cur) =>
      cur.map((p) => (p.id === id ? { ...p, [field]: value } : p))
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

        {/* === DTF FIYATLAR === */}
        <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 700 }}>
          DTF-Druckpreise
        </h4>
        <p className="form-note" style={{ marginTop: 0 }}>
          Preise pro Druckgröße. Werden bei Bestellungen mit DTF-Druck automatisch berechnet.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {dtfPrices.map((p) => (
            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 100px 80px",
                gap: 10,
                alignItems: "center",
                padding: "10px 14px",
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.sizeLabel}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                {p.widthCm} × {p.heightCm} cm
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  step="0.01"
                  value={(p.priceCents / 100).toFixed(2)}
                  onChange={(e) => updateDtfPrice(p.id, "priceCents", Math.round(parseFloat(e.target.value || "0") * 100))}
                  style={{ width: 70 }}
                />
                <span style={{ fontSize: 13, color: "#64748b" }}>€</span>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) => updateDtfPrice(p.id, "enabled", e.target.checked)}
                />
                Aktiv
              </label>
            </div>
          ))}
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
