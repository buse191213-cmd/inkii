import SiteShell from "@/components/SiteShell";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import RegisterClient from "./RegisterClient";

export const metadata = { title: "Registrieren | INKII Works" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // DB-Check statt nur Cookie-ID — verhindert Redirect-Loop bei gelöschtem Kunden
  const customer = await getCurrentCustomer();
  if (customer) redirect("/konto");
  return (
    <SiteShell>
      <RegisterClient />
    </SiteShell>
  );
}
