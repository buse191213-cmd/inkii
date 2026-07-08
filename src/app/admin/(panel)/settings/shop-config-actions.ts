"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";

export type PaymentMethodData = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
};

export type ShippingData = {
  standardCostCents: number;
  freeShippingFromCents: number;
  carrier: string;
  transferPriceCents: number;
};

export type ShopConfigData = {
  paymentMethods: PaymentMethodData[];
  shipping: ShippingData;
};

// Defaults — Ilk açılışta seed edilir
const DEFAULT_PAYMENT_METHODS: PaymentMethodData[] = [
  {
    key: "paypal",
    label: "PayPal",
    description: "Bezahlen Sie schnell und sicher mit PayPal.",
    enabled: true,
    sortOrder: 1,
  },
  {
    key: "klarna",
    label: "Klarna",
    description: "Sofort kaufen, später bezahlen (in 3 Raten oder nach 30 Tagen).",
    enabled: true,
    sortOrder: 2,
  },
  {
    key: "rechnung",
    label: "Auf Rechnung",
    description: "Rechnung per Banküberweisung — nach Lieferung 14 Tage Zahlungsziel.",
    enabled: true,
    sortOrder: 3,
  },
];

const DEFAULT_SHIPPING: ShippingData = {
  standardCostCents: 599,
  freeShippingFromCents: 10000,
  carrier: "DHL",
  transferPriceCents: 900,
};

export async function getShopConfig(): Promise<ShopConfigData> {
  // 1) Payment methods — fehlende anlegen
  for (const dm of DEFAULT_PAYMENT_METHODS) {
    await db.paymentMethod.upsert({
      where: { key: dm.key },
      update: {},
      create: dm,
    });
  }

  // 2) Shipping config — singleton
  let shipping = await db.shippingConfig.findFirst();
  if (!shipping) {
    shipping = await db.shippingConfig.create({ data: DEFAULT_SHIPPING });
  }

  const paymentMethods = await db.paymentMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return {
    paymentMethods: paymentMethods.map((m) => ({
      key: m.key,
      label: m.label,
      description: m.description,
      enabled: m.enabled,
      sortOrder: m.sortOrder,
    })),
    shipping: {
      standardCostCents: shipping.standardCostCents,
      freeShippingFromCents: shipping.freeShippingFromCents,
      carrier: shipping.carrier,
      transferPriceCents: shipping.transferPriceCents ?? 900,
    },
  };
}

export async function saveShopConfig(
  data: ShopConfigData
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await isAuthenticated())) {
      return { ok: false, error: "Nicht autorisiert" };
    }
    // Payment methods
    for (const m of data.paymentMethods) {
      await db.paymentMethod.update({
        where: { key: m.key },
        data: { enabled: m.enabled },
      });
    }
    // Shipping + Transfer
    const ship = await db.shippingConfig.findFirst();
    if (ship) {
      await db.shippingConfig.update({
        where: { id: ship.id },
        data: {
          standardCostCents: data.shipping.standardCostCents,
          freeShippingFromCents: data.shipping.freeShippingFromCents,
          carrier: data.shipping.carrier,
          transferPriceCents: data.shipping.transferPriceCents,
        },
      });
    }
    revalidatePath("/admin/settings");
    revalidatePath("/kasse"); // checkout sayfası
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unbekannter Fehler" };
  }
}
