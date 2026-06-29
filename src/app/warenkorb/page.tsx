import SiteShell from "@/components/SiteShell";
import WarenkorbClient from "./WarenkorbClient";

export const metadata = {
  title: "Warenkorb | INKII Works",
};

export default function WarenkorbPage() {
  return (
    <SiteShell>
      <WarenkorbClient />
    </SiteShell>
  );
}
