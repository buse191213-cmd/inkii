import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Impressum | INKII Works",
  description: "Impressum und Anbieterkennzeichnung der INKII WORKS.",
  alternates: { canonical: "/impressum" },
  robots: { index: true, follow: true },
};

export default async function ImpressumPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.legal;

  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Home</Link> <span>/</span> {t.impressumTitle}
          </p>

          <h1 className="legal-h1">{t.impressumTitle}</h1>
          <p>{t.impressumIntro}</p>

          <h2>{t.impressumKontaktTitle}</h2>
          <p>
            <strong>INKII WORKS</strong>
            <br />Inhaber: Sener Kirli
            <br />Westuferstr. 25
            <br />45356 Essen
            <br />Deutschland
            <br />Tel: <a href="tel:+4916067670013">+49 160 6767001</a>
            <br />E-Mail: <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
          </p>

          <h2>{t.impressumUstTitle}</h2>
          <p>DE353055316</p>

          <h2>{t.impressumHaftungTitle}</h2>
          <p>{t.impressumHaftung}</p>

          <h2>{t.impressumUrheberTitle}</h2>
          <p>{t.impressumUrheber}</p>
        </div>
      </section>
    </SiteShell>
  );
}
