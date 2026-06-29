import SiteShell from "@/components/SiteShell";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import RegisterClient from "./RegisterClient";

export const metadata = { title: "Registrieren | INKII Works" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const id = await getCurrentCustomerId();
  if (id) redirect("/konto");
  return (
    <SiteShell>
      <RegisterClient />
    </SiteShell>
  );
}
