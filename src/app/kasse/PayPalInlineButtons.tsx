"use client";

import { useState, useRef } from "react";
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
  // Validation hatası vs gerçek PayPal hatası ayrımı için
  const skipPayPalError = useRef(false);

  return (
    <div style={{ marginTop: 12 }}>
      <PayPalScriptProvider
        options={{
          clientId,
          currency: "EUR",
          intent: "capture",
          locale: "de_DE",
          "enable-funding": "card",
          "disable-funding": "credit,paylater,venmo,sofort,giropay,bancontact,eps,ideal,mybank,p24,sepa,trustly,wechatpay,blik,mercadopago",
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
          createOrder={async () => {
            setError("");
            skipPayPalError.current = false;
            try {
              const result = await validateAndCreateOrder();
              if (!result.ok || !result.orderId || !result.orderNumber) {
                // Form validation hatası — parent göstersin, PayPal hata göstermesin
                skipPayPalError.current = true;
                throw new Error(result.error || "Validation failed");
              }
              setCurrentOrder({ orderId: result.orderId, orderNumber: result.orderNumber });

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
              if (!skipPayPalError.current) {
                setError(e instanceof Error ? e.message : "Fehler");
              }
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
            // Form validation hatasıysa PayPal hata mesajı verme
            if (skipPayPalError.current) {
              skipPayPalError.current = false;
              return;
            }
            console.error("PayPal error:", err);
            setError("PayPal-Fehler. Bitte versuchen Sie es erneut.");
            setProcessing(false);
          }}
          onCancel={() => {
            // Cancel bir hata değil, sessiz
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
