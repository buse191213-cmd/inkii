import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung | INKII Works",
  description: "Widerrufsbelehrung und Widerrufsrecht für Verbraucher bei INKII WORKS.",
  alternates: { canonical: "/widerrufsbelehrung" },
  robots: { index: true, follow: true },
};

export default async function WiderrufsbelehrungPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const t = d.legal;

  return (
    <SiteShell>
      <section>
        <div className="wrap legal-prose">
          <p className="legal-crumb">
            <Link href="/">Home</Link> <span>/</span> {t.widerrufTitle}
          </p>

          <h1 className="legal-h1">{t.widerrufTitle}</h1>

          <h2>{t.widerruf1Title}</h2>
          <p>{t.widerruf1a}</p>
          <p>{t.widerruf1b}</p>
          <p>{t.widerruf1c}</p>
          <p>
            <strong>INKII WORKS</strong>
            <br />Inhaber: Sener Kirli
            <br />Westuferstr. 25
            <br />45356 Essen
            <br />Deutschland
            <br />E-Mail: <a href="mailto:info@inkiiworks.de">info@inkiiworks.de</a>
          </p>
          <p>{t.widerruf1d}</p>
          <p>{t.widerruf1e}</p>

          <h2>{t.widerruf2Title}</h2>
          <p>{t.widerruf2a}</p>
          <p>{t.widerruf2b}</p>
          <p>{t.widerruf2c}</p>
          <p>{t.widerruf2d}</p>
          <p>{t.widerruf2e}</p>

          <h2>{t.widerruf3Title}</h2>
          <p>{t.widerruf3a}</p>
          <ul>
            <li>{t.widerruf3b1}</li>
            <li>{t.widerruf3b2}</li>
          </ul>
          <p>{t.widerruf3c}</p>
          <p>{t.widerruf3d}</p>
        </div>
      </section>
    </SiteShell>
  );
}
