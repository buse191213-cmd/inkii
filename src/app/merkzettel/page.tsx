import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import MerklisteView from "./MerklisteView";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Merkzettel & Anfrage | INKII",
  description:
    "Ihre gemerkten Artikel auf einen Blick – stellen Sie mit einem Formular eine gebündelte Anfrage an INKII.",
  alternates: { canonical: "/merkzettel" },
  robots: { index: false, follow: true },
};

export default async function MerkzettelPage() {
  const d = getDictionary(await getLocale());

  return (
    <SiteShell>
      <MerklisteView t={d.merkzettel} common={d.common} />
    </SiteShell>
  );
}
