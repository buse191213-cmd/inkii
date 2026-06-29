"use server";

import { db } from "@/lib/db";
import { createStripeCheckout, isStripeConfigured } from "@/lib/stripe-server";
import { headers } from "next/headers";

async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || "www.inkiiworks.de";
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function startStripeCheckout(orderId: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    if (!isStripeConfigured()) {
      return { ok: false, error: "Stripe ist nicht konfiguriert. Bitte Admin kontaktieren." };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) return { ok: false, error: "Bestellung nicht gefunden" };
    if (order.paymentStatus === "PAID") return { ok: false, error: "Bereits bezahlt" };

    const origin = await getOrigin();

    const session = await createStripeCheckout({
      amountCents: order.totalCents,
      referenceId: order.orderNumber,
      customerEmail: order.customer.email,
      description: `Bestellung ${order.orderNumber}`,
      successUrl: `${origin}/api/stripe/return?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancelUrl: `${origin}/kasse?canceled=1`,
      paymentMethodTypes: ["klarna", "card"],
    });

    // Session ID kaydet (webhook için)
    await db.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    return { ok: true, url: session.url };
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return { ok: false, error: e instanceof Error ? e.message : "Fehler" };
  }
}
