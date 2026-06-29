import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripeSession } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const orderId = url.searchParams.get("orderId");

  if (!sessionId || !orderId) {
    return NextResponse.redirect(new URL("/kasse?error=missing_params", req.url));
  }

  try {
    const session = await getStripeSession(sessionId);
    if (!session) {
      return NextResponse.redirect(new URL("/kasse?error=session_not_found", req.url));
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.redirect(new URL("/kasse?error=order_not_found", req.url));
    }

    if (session.payment_status === "paid" || session.status === "complete") {
      const pi = typeof session.payment_intent === "object" ? session.payment_intent : null;
      await db.order.update({
        where: { id: orderId },
        data: {
          stripeSessionId: session.id,
          stripePaymentIntentId: pi?.id || "",
          paymentRef: pi?.id || session.id,
          paymentStatus: "PAID",
          paidAt: new Date(),
          status: "BEZAHLT",
        },
      });
      return NextResponse.redirect(new URL(`/bestellung-erfolg?orderNumber=${order.orderNumber}`, req.url));
    } else {
      // Ödeme tamamlanmadı
      return NextResponse.redirect(new URL("/kasse?error=payment_not_completed", req.url));
    }
  } catch (e) {
    console.error("Stripe return error:", e);
    return NextResponse.redirect(new URL("/kasse?error=server_error", req.url));
  }
}
