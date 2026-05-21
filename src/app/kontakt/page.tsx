import SiteShell from "@/components/SiteShell";
import type { Metadata } from "next";
import KontaktForm from "./KontaktForm";
import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/schema";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/dictionaries";
import { COMPANY } from "@/lib/company";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Kontakt & Anfrage | INKII",
  description:
    "Sie haben ein Projekt? Kontaktieren Sie INKII für ein unverbindliches Angebot rund um Textilveredelung und Werbemittel.",
};

export default async function KontaktPage() {
  const locale = await getLocale();
  const d = getDictionary(locale);
  const k = d.kontakt;
  const phone = COMPANY.phone;
  const email = COMPANY.email;
  const street = COMPANY.address.street;
  const cityLine = `${COMPANY.address.postalCode} ${COMPANY.address.city}`;

  // Bis zu 3 Team-Fotos für die Avatar-Reihe (links oben).
  type Tm = { id: string; photoUrl: string; name: string; department: string };
  const team = (await db.teamMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: 5,
  })) as Tm[];
  const avatars = team.filter((t) => t.photoUrl).slice(0, 3);

  return (
    <SiteShell>
      <JsonLd data={faqSchema(k.faqs)} />

      {/* ===== Hauptbereich: links Titel, rechts Formular ===== */}
      <section className="kontakt-page">
        <div className="kontakt-grid">

          {/* Linke Spalte */}
          <div className="kontakt-left">

            {avatars.length > 0 && (
              <div className="kontakt-avatars">
                {avatars.map((t, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={t.id}
                    src={t.photoUrl}
                    alt={t.name || t.department}
                    style={{ zIndex: avatars.length - i }}
                  />
                ))}
                <div className="kontakt-avatars-info">
                  <div className="kontakt-badge">
                    <span className="kb-check">✓</span> Merch-Expert:innen
                  </div>
                  <div className="kontakt-status">
                    <span className="kb-dot" /> Verfügbar für neue Projekte
                  </div>
                </div>
              </div>
            )}

            {avatars.length === 0 && (
              <div className="kontakt-badge" style={{ marginBottom: 24 }}>
                <span className="kb-dot" /> Verfügbar für neue Projekte
              </div>
            )}

            <h1 className="kontakt-h1">
              Nimm Kontakt mit unserem Team auf.
            </h1>

            <p className="kontakt-intro">
              Wir helfen Unternehmen, ihre Marke sichtbar zu machen — von
              Textilveredelung über Werbemittel bis hin zu Druck &amp; Webdesign.
            </p>

            <ul className="kontakt-checks">
              <li><span className="kc-check">✓</span> Komplettservice für Merch &amp; Werbemittel</li>
              <li><span className="kc-check">✓</span> Engagierte Beratung &amp; Designvorschlag</li>
              <li><span className="kc-check">✓</span> Kostenloses, unverbindliches Angebot in 24 Stunden</li>
            </ul>

            <p className="kontakt-paragraph">
              Wir würden gerne mehr über Ihr Unternehmen erfahren und darüber, wie
              wir Ihnen behilflich sein können. Füllen Sie dieses Formular aus und
              wir werden uns in Kürze bei Ihnen melden.
            </p>

            <div className="kontakt-info">
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="ki-row">
                <span className="ki-ic">✆</span>
                <div>
                  <b>Telefon</b>
                  <span>{phone}</span>
                </div>
              </a>
              <a href={`mailto:${email}`} className="ki-row">
                <span className="ki-ic">✉</span>
                <div>
                  <b>E-Mail</b>
                  <span>{email}</span>
                </div>
              </a>
              <div className="ki-row">
                <span className="ki-ic">⌖</span>
                <div>
                  <b>Adresse</b>
                  <span>{street}, {cityLine}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rechte Spalte: Formular */}
          <div className="kontakt-right">
            <KontaktForm />
          </div>

        </div>
      </section>

      {/* ===== FAQ ===== */}
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
