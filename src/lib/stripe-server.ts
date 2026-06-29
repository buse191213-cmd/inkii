import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let cachedStripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cachedStripe) {
    cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return cachedStripe;
}

export type StripeCheckoutParams = {
  amountCents: number;
  currency?: string;
  referenceId: string;
  customerEmail: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  paymentMethodTypes?: ("klarna" | "card" | "sepa_debit" | "sofort" | "giropay")[];
};

export async function createStripeCheckout(params: StripeCheckoutParams): Promise<{ id: string; url: string }> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe nicht konfiguriert (STRIPE_SECRET_KEY fehlt)");
  }
  const stripe = getStripe();
  const currency = params.currency || "eur";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: params.paymentMethodTypes || ["klarna", "card"],
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: params.description || `Bestellung ${params.referenceId}`,
          },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      orderReference: params.referenceId,
    },
    payment_intent_data: {
      metadata: {
        orderReference: params.referenceId,
      },
    },
  });

  return {
    id: session.id,
    url: session.url!,
  };
}

export async function getStripeSession(sessionId: string) {
  if (!isStripeConfigured()) return null;
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}
