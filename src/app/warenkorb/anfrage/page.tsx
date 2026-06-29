import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import AnfrageClient from "./AnfrageClient";

export const metadata = {
  title: "Angebot anfragen | INKII Works",
};

export const dynamic = "force-dynamic";

export default async function AnfragePage() {
  const customer = await getCurrentCustomer();
  return (
    <SiteShell>
      <AnfrageClient
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
