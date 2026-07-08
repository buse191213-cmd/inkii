import SiteShell from "@/components/SiteShell";
import WarenkorbClient from "./WarenkorbClient";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata = {
  title: "Warenkorb | INKII Works",
};

export default async function WarenkorbPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <SiteShell>
      <WarenkorbClient t={dict.cart} tSteps={dict.checkout.steps} />
    </SiteShell>
  );
}
