import Link from "next/link";
import type { Dictionary } from "@/dictionaries/types";

export default function SiteFooter({
  t,
}: {
  t: Dictionary["footer"];
}) {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="logo" translate="no">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/inkii-logo.png" alt="INKII WORKS" />
            </div>
            <p>{t.tagline}</p>
          </div>
          <div>
            <h4>{t.colLeistungen}</h4>
            <ul>
              <li><Link href="/veredelung">{t.lVeredelung}</Link></li>
              <li><Link href="/leistungen/sportartikel">{t.lTeamwear}</Link></li>
              <li><Link href="/werbemittel">{t.lWerbemittel}</Link></li>
              <li><Link href="/leistungen">{t.lOnlineshops}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t.colService}</h4>
            <ul>
              <li><Link href="/nachhaltigkeit">{t.lNachhaltigkeit}</Link></li>
              <li><Link href="/kontakt">{t.lFaq}</Link></li>
              <li><Link href="/kontakt">{t.lKontakt}</Link></li>
              <li><Link href="/ueber-uns">{t.lUeberUns}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t.colRecht}</h4>
            <ul>
              <li><Link href="/impressum">{t.lImpressum}</Link></li>
              <li><Link href="/datenschutz">{t.lDatenschutz}</Link></li>
              <li><Link href="/kontakt">{t.lAgb}</Link></li>
              <li><Link href="/kontakt">{t.lWiderruf}</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {new Date().getFullYear()} <span translate="no">INKII</span> — {t.copyright}
          </span>
        </div>
        <p className="foot-note">{t.note}</p>
      </div>
    </footer>
  );
}
