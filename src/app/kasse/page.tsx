import { db } from "@/lib/db";
import SiteShell from "@/components/SiteShell";
import KasseClient from "./KasseClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kasse | INKII Works",
};

export default async function KassePage() {
  // Sadece aktif ödeme yöntemleri
  const methods = await db.paymentMethod.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });
  const shipping = await db.shippingConfig.findFirst();

  return (
    <SiteShell>
      <KasseClient
        paymentMethods={methods.map((m) => ({
          key: m.key,
          label: m.label,
          description: m.description,
        }))}
        shipping={{
          standardCostCents: shipping?.standardCostCents ?? 599,
          freeShippingFromCents: shipping?.freeShippingFromCents ?? 10000,
          carrier: shipping?.carrier ?? "DHL",
        }}
      />
    </SiteShell>
  );
}
