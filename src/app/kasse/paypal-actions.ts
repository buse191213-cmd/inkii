"use server";

import { db } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/paypal-server";
import { sendOrderConfirmationEmail } from "./confirmation-mail";

export async function capturePayPalPayment(
  orderId: string,
  paypalOrderId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) return { ok: false, error: "Bestellung nicht gefunden" };
    if (order.paymentStatus === "PAID") return { ok: true };

    const capture = await capturePayPalOrder(paypalOrderId);
    if (!capture.ok) {
      await db.order.update({
        where: { id: orderId },
        data: {
          paypalOrderId,
          paymentStatus: "FAILED",
        },
      });
      return { ok: false, error: capture.error || "PayPal Zahlung fehlgeschlagen" };
    }

    // Erfolg
    await db.order.update({
      where: { id: orderId },
      data: {
        paypalOrderId,
        paypalCaptureId: capture.captureId || "",
        paymentRef: capture.captureId || paypalOrderId,
        paymentStatus: "PAID",
        paidAt: new Date(),
        status: "BEZAHLT",
      },
    });

    // E-Mail (PDF Rechnung mit dabei)
    try {
      await sendOrderConfirmationEmail(orderId);
    } catch (mailErr) {
      console.error("PayPal confirmation mail failed:", mailErr);
      // Ödeme yine de başarılı
    }

    return { ok: true };
  } catch (e) {
    console.error("PayPal capture error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
