"use client";

import { useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { capturePayPalPayment } from "./paypal-actions";

type Props = {
  orderId: string;
  amountCents: number;
  orderNumber: string;
  clientId: string;
  mode: "sandbox" | "live";
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
};

export default function PayPalCheckoutModal({
  orderId,
  amountCents,
  orderNumber,
  clientId,
  onClose,
  onSuccess,
}: Props) {
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !processing) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, processing]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "100%",
          maxWidth: 460,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
          borderRadius: 6,
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "transparent",
            border: "none",
            fontSize: 22,
            color: "#94a3b8",
            cursor: processing ? "default" : "pointer",
          }}
          aria-label="Schließen"
        >×</button>

        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 8, color: "#004537" }}>
          Mit PayPal bezahlen
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
          Sicher und schnell über Ihren PayPal-Account.
        </p>

        <div style={{ background: "#f8fafc", padding: 14, marginBottom: 20, borderRadius: 4 }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>Zu zahlen</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1f2937" }}>
            {(amountCents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
          </div>
        </div>

        {error && (
          <div style={{ padding: 12, background: "#fef2f2", color: "#991b1b", marginBottom: 14, fontSize: 13, borderRadius: 4 }}>
            {error}
          </div>
        )}

        <PayPalScriptProvider
          options={{
            clientId,
            currency: "EUR",
            intent: "capture",
            locale: "de_DE",
          }}
        >
          <PayPalButtons
            disabled={processing}
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
            createOrder={async () => {
              setError("");
              try {
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    amountCents,
                    referenceId: orderNumber,
                    description: `INKII Works ${orderNumber}`,
                  }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "PayPal Order konnte nicht erstellt werden");
                return data.id;
              } catch (e) {
                setError(e instanceof Error ? e.message : "Fehler");
                throw e;
              }
            }}
            onApprove={async (data) => {
              setProcessing(true);
              setError("");
              try {
                const result = await capturePayPalPayment(orderId, data.orderID);
                if (result.ok) {
                  onSuccess(orderNumber);
                } else {
                  setError(result.error ?? "Zahlung fehlgeschlagen");
                  setProcessing(false);
                }
              } catch (e) {
                setError(e instanceof Error ? e.message : "Fehler bei der Verarbeitung");
                setProcessing(false);
              }
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setError("PayPal-Fehler. Bitte versuchen Sie es erneut.");
            }}
            onCancel={() => {
              setError("Zahlung abgebrochen.");
            }}
          />
        </PayPalScriptProvider>

        {processing && (
          <div style={{ marginTop: 16, padding: 12, background: "#dbeafe", color: "#1e40af", fontSize: 13, textAlign: "center", borderRadius: 4 }}>
            ⏳ Zahlung wird verarbeitet…
          </div>
        )}

        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          🔒 Verschlüsselte Übertragung über PayPal<br />
          Sie werden zur Bestätigungsseite weitergeleitet.
        </p>
      </div>
    </div>
  );
}
