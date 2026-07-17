import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/dictionaries/types";
import CookieSettingsLink from "@/components/CookieSettingsLink";
import FooterDesignLink from "@/components/FooterDesignLink";

export default function SiteFooter({
  t,
  cookieLabel = "Cookie-Einstellungen",
}: {
  t: Dictionary["footer"];
  cookieLabel?: string;
}) {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="logo" translate="no">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src="/inkii-logo.png" alt="INKII WORKS" width={200} height={60} priority />
            </div>
            <p>{t.tagline}</p>

            {/* Design Upload — Minimal, tıklayınca modal açar */}
            <FooterDesignLink />
          </div>
          <div>
            <h4>{t.colLeistungen}</h4>
            <ul>
              <li><Link href="/bereiche/textilveredelung">{t.lVeredelung}</Link></li>
              <li><Link href="/bereiche/firmenkleidung">{t.lBerufsbekleidung}</Link></li>
              <li><Link href="/leistungen/sportartikel">{t.lTeamwear}</Link></li>
              <li><Link href="/bereiche/premium-werbemittel">{t.lWerbemittel}</Link></li>
              <li><Link href="/werbemittel">{t.lShop}</Link></li>
              <li><Link href="/webdesign">{t.lWebdesign}</Link></li>
              <li><Link href="/bereiche/onlineshops">{t.lOnlineshops}</Link></li>
              <li><Link href="/marketing">{t.lMarketing}</Link></li>
            </ul>
          </div>
          <div>
            <h4>{t.colService}</h4>
            <ul>
              {/* 3D-Designer linki kaldırıldı (canlı sürüm) */}
              <li><Link href="/nachhaltigkeit">{t.lNachhaltigkeit}</Link></li>
              <li><Link href="/galerie">Galerie</Link></li>
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
              <li><Link href="/agb">{t.lAgb}</Link></li>
              <li><Link href="/widerrufsbelehrung">{t.lWiderruf}</Link></li>
              <li><CookieSettingsLink label={cookieLabel} /></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            © {new Date().getFullYear()} <span translate="no">INKII WORKS</span> — {t.copyright}
          </span>
        </div>
        <p className="foot-note">{t.note}</p>
      </div>
    </footer>
  );
}
