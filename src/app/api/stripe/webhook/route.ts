import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe-server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("Webhook signature failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderRef = session.metadata?.orderReference;
      if (orderRef) {
        const order = await db.order.findFirst({ where: { orderNumber: orderRef } });
        if (order && order.paymentStatus !== "PAID") {
          await db.order.update({
            where: { id: order.id },
            data: {
              stripeSessionId: session.id,
              stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : "",
              paymentStatus: "PAID",
              paidAt: new Date(),
              status: "BEZAHLT",
            },
          });
        }
      }
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
  }

  return NextResponse.json({ received: true });
}
