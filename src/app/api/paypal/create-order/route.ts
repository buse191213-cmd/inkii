import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "@/lib/paypal-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountCents, referenceId, description } = body;

    if (!amountCents || amountCents < 1) {
      return NextResponse.json({ error: "Ungültiger Betrag" }, { status: 400 });
    }
    if (!referenceId) {
      return NextResponse.json({ error: "Referenz fehlt" }, { status: 400 });
    }

    const order = await createPayPalOrder({
      amountCents,
      referenceId,
      description,
    });

    return NextResponse.json({ id: order.id, status: order.status });
  } catch (e) {
    console.error("PayPal create order error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
