import SiteShell from "@/components/SiteShell";
import WarenkorbClient from "./WarenkorbClient";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { db } from "@/lib/db";

export const metadata = {
  title: "Warenkorb | INKII Works",
};
export const dynamic = "force-dynamic";

export default async function WarenkorbPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  // Versandkosten aus Admin-Einstellungen (gleiche Quelle wie Kasse —
  // sonst zeigt der Warenkorb andere Versandkosten als die Kasse)
  const shipping = await db.shippingConfig.findFirst();

  return (
    <SiteShell>
      <WarenkorbClient
        t={dict.cart}
        tSteps={dict.checkout.steps}
        shipping={{
          standardCostCents: shipping?.standardCostCents ?? 599,
          freeShippingFromCents: shipping?.freeShippingFromCents ?? 10000,
        }}
      />
    </SiteShell>
  );
}
