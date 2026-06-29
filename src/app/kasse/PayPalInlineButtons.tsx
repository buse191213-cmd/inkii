"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { capturePayPalPayment } from "./paypal-actions";

type Props = {
  clientId: string;
  amountCents: number;
  validateAndCreateOrder: () => Promise<{ ok: boolean; orderId?: string; orderNumber?: string; error?: string }>;
  onSuccess: (orderNumber: string) => void;
  disabled?: boolean;
};

export default function PayPalInlineButtons({
  clientId,
  amountCents,
  validateAndCreateOrder,
  onSuccess,
  disabled,
}: Props) {
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{ orderId: string; orderNumber: string } | null>(null);

  return (
    <div style={{ marginTop: 12 }}>
      <PayPalScriptProvider
        options={{
          clientId,
          currency: "EUR",
          intent: "capture",
          locale: "de_DE",
          // Card butonu görünür hale gelir — PayPal hesabı zorunlu değil
          "enable-funding": "card",
          "disable-funding": "credit,paylater,venmo,sofort,giropay",
          components: "buttons",
        }}
      >
        <PayPalButtons
          disabled={disabled || processing}
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 48,
          }}
          // Form validate + DB'ye order yaz + PayPal'a order yarat
          createOrder={async () => {
            setError("");
            try {
              // 1) Form validate + DB Order create
              const result = await validateAndCreateOrder();
              if (!result.ok || !result.orderId || !result.orderNumber) {
                throw new Error(result.error || "Bestellung konnte nicht erstellt werden");
              }
              setCurrentOrder({ orderId: result.orderId, orderNumber: result.orderNumber });

              // 2) PayPal Order create
              const res = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  amountCents,
                  referenceId: result.orderNumber,
                  description: `INKII Works ${result.orderNumber}`,
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "PayPal Order konnte nicht erstellt werden");
              return data.id;
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Fehler";
              setError(msg);
              throw e;
            }
          }}
          onApprove={async (data) => {
            setProcessing(true);
            setError("");
            try {
              if (!currentOrder) {
                throw new Error("Bestellungsreferenz fehlt");
              }
              const result = await capturePayPalPayment(currentOrder.orderId, data.orderID);
              if (result.ok) {
                onSuccess(currentOrder.orderNumber);
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
            setProcessing(false);
          }}
          onCancel={() => {
            setError("Zahlung abgebrochen.");
            setProcessing(false);
          }}
        />
      </PayPalScriptProvider>

      {error && (
        <div style={{
          padding: 10,
          background: "#fef2f2",
          color: "#991b1b",
          marginTop: 10,
          fontSize: 13,
          borderRadius: 4,
        }}>
          {error}
        </div>
      )}

      {processing && (
        <div style={{
          padding: 12,
          background: "#dbeafe",
          color: "#1e40af",
          fontSize: 13,
          textAlign: "center",
          marginTop: 10,
          borderRadius: 4,
        }}>
          ⏳ Zahlung wird verarbeitet…
        </div>
      )}

      <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
        🔒 Sicher mit PayPal oder Kreditkarte<br />
        Kein PayPal-Konto erforderlich
      </p>
    </div>
  );
}
