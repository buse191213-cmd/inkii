import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import AnfrageClient from "./AnfrageClient";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata = {
  title: "Angebot anfragen | INKII Works",
};

export const dynamic = "force-dynamic";

export default async function AnfragePage() {
  const customer = await getCurrentCustomer();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return (
    <SiteShell>
      <AnfrageClient
        t={dict.anfrageForm}
        tCart={dict.cart}
        prefill={customer ? {
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          phone: customer.phone || "",
          company: customer.firmname || "",
        } : null}
      />
    </SiteShell>
  );
}
