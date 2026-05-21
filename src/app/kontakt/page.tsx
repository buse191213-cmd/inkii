import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import KontaktForm from "./KontaktForm";
import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";

export const metadata: Metadata = {
  title: "Kontakt & Anfrage | INKII",
  description:
    "Sie haben ein Projekt? Kontaktieren Sie INKII für ein unverbindliches Angebot rund um Textilveredelung und Werbemittel.",
};

import { COMPANY } from "@/lib/company";

// Kontaktdaten aus zentralem Firmendaten-Modul (siehe src/lib/company.ts)
const PHONE = COMPANY.phone;
const EMAIL = COMPANY.email;
const ADDRESS = `${COMPANY.address.street}, ${COMPANY.address.postalCode} ${COMPANY.address.city}`;

export default async function KontaktPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const k = d.kontakt;

  const info = [
    { ic: "✆", t: k.infoPhone, v: PHONE },
    { ic: "✉", t: k.infoEmail, v: EMAIL },
    { ic: "⌖", t: k.infoAddress, v: ADDRESS },
    { ic: "◷", t: k.infoHours, v: k.hoursValue },
  ];

  return (
    <SiteShell>
      <JsonLd data={faqSchema(k.faqs)} />
      <div className="page-hero">
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">{d.nav.home}</Link> <span>/</span>{" "}
            <span>{d.nav.kontakt}</span>
          </div>
          <h1>{k.h1}</h1>
          <p>{k.intro}</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="contact-grid">
            <div>
              <KontaktForm t={k} common={d.common} />
            </div>
            <div>
              <div className="info-card">
                <h3>{k.infoTitle}</h3>
                {info.map((i) => (
                  <div key={i.t} className="info-row">
                    <div className="ir-ic">{i.ic}</div>
                    <div>
                      <b>{i.t}</b>
                      <span>{i.v}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="map-box">
                <div className="map-pin">⌖</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="alt-bg">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="kicker">{k.faqKicker}</span>
            <h2 className="big">{k.faqTitle}</h2>
          </div>
          <div className="faq">
            {k.faqs.map((f, i) => (
              <details key={i} className="faq-item" {...(i === 0 ? { open: true } : {})}>
                <summary className="faq-q">
                  {f.q} <span className="qx">+</span>
                </summary>
                <div className="faq-a">
                  <div>{f.a}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
