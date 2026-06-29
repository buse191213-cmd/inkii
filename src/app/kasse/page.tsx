import { db } from "@/lib/db";
import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import KasseClient from "./KasseClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kasse | INKII Works",
};

export default async function KassePage() {
  const customer = await getCurrentCustomer();
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
        prefill={customer ? {
          salutation: customer.salutation || "Herr",
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
          firmname: customer.firmname || "",
          ustId: customer.ustId || "",
          billingStreet: customer.billingStreet,
          billingZip: customer.billingZip,
          billingCity: customer.billingCity,
          billingCountry: customer.billingCountry,
        } : null}
        isLoggedIn={Boolean(customer)}
      />
    </SiteShell>
  );
}
