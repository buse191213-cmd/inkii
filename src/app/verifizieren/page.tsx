import SiteShell from "@/components/SiteShell";
import VerifyClient from "./VerifyClient";

export const metadata = { title: "E-Mail bestätigen | INKII Works" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mailErr?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const mailErr = params.mailErr ?? "";

  return (
    <SiteShell>
      <VerifyClient email={email} mailErr={mailErr} />
    </SiteShell>
  );
}
