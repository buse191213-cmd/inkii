import { getCurrentCustomer } from "@/lib/customer-auth";
import AdressenClient from "./AdressenClient";

export const metadata = { title: "Adressen | Mein Konto" };
export const dynamic = "force-dynamic";

export default async function AdressenPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  return (
    <AdressenClient
      initial={{
        billingStreet: customer.billingStreet,
        billingZip: customer.billingZip,
        billingCity: customer.billingCity,
        billingCountry: customer.billingCountry,
        shippingDiffers: customer.shippingDiffers,
        shippingStreet: customer.shippingStreet,
        shippingZip: customer.shippingZip,
        shippingCity: customer.shippingCity,
        shippingCountry: customer.shippingCountry,
      }}
    />
  );
}
