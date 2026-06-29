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

export type DtfPriceData = {
  id: string;
  sizeLabel: string;
  widthCm: number;
  heightCm: number;
  priceCents: number;
  enabled: boolean;
};

export type ShippingData = {
  standardCostCents: number;
  freeShippingFromCents: number;
  carrier: string;
};

export type ShopConfigData = {
  paymentMethods: PaymentMethodData[];
  dtfPrices: DtfPriceData[];
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

const DEFAULT_DTF_SIZES = [
  { sizeLabel: "10x10", widthCm: 10, heightCm: 10, priceCents: 200 },
  { sizeLabel: "15x15", widthCm: 15, heightCm: 15, priceCents: 300 },
  { sizeLabel: "20x20", widthCm: 20, heightCm: 20, priceCents: 420 },
  { sizeLabel: "25x25", widthCm: 25, heightCm: 25, priceCents: 520 },
  { sizeLabel: "30x30", widthCm: 30, heightCm: 30, priceCents: 600 },
  { sizeLabel: "A3 (30x42)", widthCm: 30, heightCm: 42, priceCents: 800 },
];

const DEFAULT_SHIPPING: ShippingData = {
  standardCostCents: 599,
  freeShippingFromCents: 10000,
  carrier: "DHL",
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

  // 2) DTF prices — fehlende anlegen
  for (const d of DEFAULT_DTF_SIZES) {
    const existing = await db.dtfPrice.findUnique({ where: { sizeLabel: d.sizeLabel } });
    if (!existing) {
      await db.dtfPrice.create({ data: d });
    }
  }

  // 3) Shipping config — singleton
  let shipping = await db.shippingConfig.findFirst();
  if (!shipping) {
    shipping = await db.shippingConfig.create({ data: DEFAULT_SHIPPING });
  }

  const paymentMethods = await db.paymentMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const dtfPrices = await db.dtfPrice.findMany({
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
    dtfPrices: dtfPrices.map((p) => ({
      id: p.id,
      sizeLabel: p.sizeLabel,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      priceCents: p.priceCents,
      enabled: p.enabled,
    })),
    shipping: {
      standardCostCents: shipping.standardCostCents,
      freeShippingFromCents: shipping.freeShippingFromCents,
      carrier: shipping.carrier,
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
    // DTF prices
    for (const p of data.dtfPrices) {
      await db.dtfPrice.update({
        where: { id: p.id },
        data: { priceCents: p.priceCents, enabled: p.enabled },
      });
    }
    // Shipping
    const ship = await db.shippingConfig.findFirst();
    if (ship) {
      await db.shippingConfig.update({
        where: { id: ship.id },
        data: {
          standardCostCents: data.shipping.standardCostCents,
          freeShippingFromCents: data.shipping.freeShippingFromCents,
          carrier: data.shipping.carrier,
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
