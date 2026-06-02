import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Datenschutz | INKII Works",
  description: "Datenschutzerklärung der INKII WORKS.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: true, follow: true },
};

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.legal;

  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Home</Link> <span>/</span> {t.datenschutzTitle}
          </p>

          <h1 className="legal-h1">{t.datenschutzTitle}</h1>
          <p>{t.datenschutzIntro}</p>

          <h2>{t.datenschutz1Title}</h2>
          <p>{t.datenschutz1}</p>

          <h2>{t.datenschutz2Title}</h2>
          <p>{t.datenschutz2}</p>

          <h2>{t.datenschutz3Title}</h2>
          <p>{t.datenschutz3}</p>

          <h2>{t.datenschutz4Title}</h2>
          <p>{t.datenschutz4}</p>
        </div>
      </section>
    </SiteShell>
  );
}
