import { getCurrentCustomer } from "@/lib/customer-auth";
import ProfilClient from "./ProfilClient";

export const metadata = { title: "Profil | Mein Konto" };
export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  return (
    <ProfilClient
      initial={{
        email: customer.email,
        salutation: customer.salutation || "Herr",
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || "",
        firmname: customer.firmname || "",
        ustId: customer.ustId || "",
      }}
    />
  );
}
