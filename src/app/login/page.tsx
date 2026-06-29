import SiteShell from "@/components/SiteShell";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export const metadata = { title: "Anmelden | INKII Works" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const id = await getCurrentCustomerId();
  if (id) {
    const params = await searchParams;
    redirect(params.next || "/konto");
  }
  const params = await searchParams;
  return (
    <SiteShell>
      <LoginClient next={params.next ?? "/konto"} />
    </SiteShell>
  );
}
