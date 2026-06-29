import SiteShell from "@/components/SiteShell";
import VerifyClient from "./VerifyClient";

export const metadata = { title: "E-Mail bestätigen | INKII Works" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <SiteShell>
      <VerifyClient email={email} />
    </SiteShell>
  );
}
