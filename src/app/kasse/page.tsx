import { db } from "@/lib/db";
import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { isPayPalConfigured, getPayPalClientId, getPayPalMode } from "@/lib/paypal-server";
import { isStripeConfigured } from "@/lib/stripe-server";
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

  // Yapılandırılmamış payment provider'ları filtrele
  const paypalReady = isPayPalConfigured();
  const stripeReady = isStripeConfigured();
  const filteredMethods = methods.filter((m) => {
    if (m.key === "paypal" && !paypalReady) return false;
    if (m.key === "klarna" && !stripeReady) return false;
    return true;
  });

  return (
    <SiteShell>
      <KasseClient
        paymentMethods={filteredMethods.map((m) => ({
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
        paypalClientId={paypalReady ? getPayPalClientId() : ""}
        paypalMode={getPayPalMode()}
      />
    </SiteShell>
  );
}
