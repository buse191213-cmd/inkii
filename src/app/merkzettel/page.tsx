import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import MerklisteView from "./MerklisteView";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { getCurrentCustomer } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Merkzettel & Anfrage | INKII",
  description:
    "Ihre gemerkten Artikel auf einen Blick – stellen Sie mit einem Formular eine gebündelte Anfrage an INKII.",
  alternates: { canonical: "/merkzettel" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function MerkzettelPage() {
  const d = getDictionary(await getLocale());
  const customer = await getCurrentCustomer();

  return (
    <SiteShell>
      <MerklisteView
        t={d.merkzettel}
        common={d.common}
        prefill={customer ? {
          name: `${customer.firstName} ${customer.lastName}`.trim(),
          email: customer.email,
          phone: customer.phone || "",
          company: customer.firmname || "",
        } : null}
      />
    </SiteShell>
  );
}
