// PayPal REST API Helper (Server-Side)
// Docs: https://developer.paypal.com/docs/api/orders/v2/

const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"; // sandbox | live
const PAYPAL_BASE = PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal Auth fehlgeschlagen: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
  return data.access_token;
}

export type PayPalOrderParams = {
  amountCents: number;
  currency?: string; // EUR default
  referenceId: string; // Order Nummer (örn INKI-2026-12345)
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
};

export async function createPayPalOrder(params: PayPalOrderParams): Promise<{ id: string; status: string }> {
  if (!isPayPalConfigured()) {
    throw new Error("PayPal nicht konfiguriert (PAYPAL_CLIENT_ID/SECRET fehlt)");
  }
  const token = await getAccessToken();
  const amountStr = (params.amountCents / 100).toFixed(2);
  const currency = params.currency || "EUR";

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.referenceId,
          description: params.description || `Bestellung ${params.referenceId}`,
          amount: {
            currency_code: currency,
            value: amountStr,
          },
        },
      ],
      application_context: {
        brand_name: "INKII Works",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal Order Create fehlgeschlagen: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id: string; status: string };
  return data;
}

export type PayPalCaptureResult = {
  ok: boolean;
  status?: string;
  captureId?: string;
  payerEmail?: string;
  amount?: string;
  currency?: string;
  error?: string;
};

export async function capturePayPalOrder(paypalOrderId: string): Promise<PayPalCaptureResult> {
  if (!isPayPalConfigured()) {
    return { ok: false, error: "PayPal nicht konfiguriert" };
  }
  try {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.message || data.details?.[0]?.description || `HTTP ${res.status}` };
    }

    const status = data.status;
    const captureUnit = data.purchase_units?.[0]?.payments?.captures?.[0];
    return {
      ok: status === "COMPLETED",
      status,
      captureId: captureUnit?.id,
      payerEmail: data.payer?.email_address,
      amount: captureUnit?.amount?.value,
      currency: captureUnit?.amount?.currency_code,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler" };
  }
}

export function getPayPalClientId(): string {
  return process.env.PAYPAL_CLIENT_ID || "";
}

export function getPayPalMode(): "sandbox" | "live" {
  return PAYPAL_MODE as "sandbox" | "live";
}
