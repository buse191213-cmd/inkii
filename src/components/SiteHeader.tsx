"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMerkliste } from "./MerklisteProvider";
import LangSwitcher from "./LangSwitcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";

type NavItem = { href: string; key: keyof Dictionary["nav"] };

const FALLBACK_NAV: NavItem[] = [
  { href: "/bereiche/textilveredelung", key: "kleidung" },
  { href: "/werbemittel?cat=taschen", key: "taschen" },
  { href: "/bereiche/werbeartikel", key: "werbemittel" },
  { href: "/webdesign", key: "webdesign" },
  { href: "/marketing", key: "marketing" },
];

type HeaderProps = {
  locale: Locale;
  nav: Dictionary["nav"];
  t: Dictionary["header"];
  utility: Dictionary["utility"];
  navItems?: NavItem[];
};

export default function SiteHeader(props: HeaderProps) {
  return (
    <Suspense fallback={null}>
      <SiteHeaderInner {...props} />
    </Suspense>
  );
}

function SiteHeaderInner({
  locale,
  nav,
  t,
  utility,
  navItems,
}: HeaderProps) {
  const pathname = usePathname();
  // INKII MARKETING sayfasında farklı nav linkleri göster
  const isMarketing = pathname?.startsWith("/inkii-marketing") ||
    pathname === "/webdesign" || pathname === "/marketing";
  const MARKETING_NAV: NavItem[] = [
    { href: "/webdesign", key: "webdesign" },
    { href: "/marketing", key: "marketing" },
  ];
  const NAV = isMarketing
    ? MARKETING_NAV
    : (navItems && navItems.length > 0 ? navItems : FALLBACK_NAV);
  const [open, setOpen] = useState(false);
  const { count } = useMerkliste();
  const searchParams = useSearchParams();
  const currentCat = searchParams.get("cat");

  /** Erkenne aktive Navbar-Items — auch wenn die href einen ?cat=…-Parameter trägt. */
  const isActive = (href: string): boolean => {
    if (href === "/") return pathname === "/";
    const [linkPath, linkQuery] = href.split("?");
    if (!pathname.startsWith(linkPath)) return false;
    const linkCat = linkQuery
      ? new URLSearchParams(linkQuery).get("cat")
      : null;
    // Link mit cat=… → URL muss exakt diesen cat haben.
    if (linkCat) return currentCat === linkCat;
    // Link ohne cat (z. B. /werbemittel) → URL darf KEIN cat haben,
    // sonst wäre ein spezifischeres Item gerade aktiv.
    if (linkPath === "/werbemittel") return !currentCat;
    return true;
  };

  return (
    <>
      <div className="utility">
        <div className="utility-inner">
          <div className="u-right">
            <Link href="/ueber-uns">{nav.ueberUns}</Link>
            <Link href="/nachhaltigkeit">{nav.nachhaltigkeit}</Link>
            <Link href="/bereiche">{nav.bereiche}</Link>
            <Link href="/kontakt">{nav.kontakt}</Link>
            <Link href="/merkzettel" className={`u-heart${count > 0 ? " has-items" : ""}`} title={t.merkzettel} aria-label={t.merkzettel}>
              <span aria-hidden>♥</span>{count > 0 && <span className="u-heart-count">{count}</span>}
            </Link>
            <LangSwitcher current={locale} />
          </div>
        </div>
      </div>

      <header className="site">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 28px",
            height: 64,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* SOL: Logo (flex: 1) */}
          <div style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
            <Link
              href="/"
              className="logo"
              translate="no"
              aria-label="INKII WORKS – Startseite"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src="/inkii-logo.png" alt="INKII WORKS" width={200} height={60} priority />
            </Link>
          </div>

          {/* ORTA: Nav linkler (flex: 0, kendi genişliğinde) */}
          <nav className="main" style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={isActive(n.href) ? "active" : ""}
              >
                {nav[n.key]}
              </Link>
            ))}
          </nav>

          {/* SAĞ: INKII MARKETING + burger (flex: 1) */}
          <div
            className="head-actions"
            style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, minWidth: 0 }}
          >
            <Link href="/inkii-marketing" className="brand-marketing" aria-label="INKII MARKETING">
              <Image src="/inkii-logo.png" alt="" width={70} height={22} />
              <span className="brand-sep" aria-hidden>|</span>
              <span className="brand-label">MARKETING</span>
            </Link>
            <button
              className="burger"
              aria-label={t.search}
              onClick={() => setOpen(true)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer${open ? " open" : ""}`}>
        <button className="close" aria-label="×" onClick={() => setOpen(false)}>
          ✕
        </button>
        <Link href="/inkii-marketing" onClick={() => setOpen(false)} style={{ fontWeight: 700, color: "#3f9c5c" }}>
          ★ INKII MARKETING
        </Link>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
            {nav[n.key]}
          </Link>
        ))}
        <Link href="/merkzettel" onClick={() => setOpen(false)}>
          {t.merkzettel}
          {count > 0 ? ` (${count})` : ""}
        </Link>
        <div className="drawer-lang">
          <span>{t.language}</span>
          <LangSwitcher current={locale} />
        </div>
      </div>
    </>
  );
}
