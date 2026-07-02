"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useMerkliste } from "./MerklisteProvider";
import { useCart } from "./CartProvider";
import CartDrawer from "./CartDrawer";
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
  marketingLogo?: string | null;
  navItems?: NavItem[];
  customer?: { firstName: string; lastName: string } | null;
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
  marketingLogo,
  navItems,
  customer,
}: HeaderProps) {
  const pathname = usePathname();
  // INKII MARKETING sayfasında farklı nav linkleri göster
  const isMarketing = pathname?.startsWith("/inkii-marketing") ||
    pathname === "/webdesign" || pathname === "/marketing";
  // Sadece ana sayfalarda (her iki marka) iki logo göster
  const isHomePage = pathname === "/" || pathname === "/inkii-marketing";
  const MARKETING_NAV: NavItem[] = [
    { href: "/webdesign", key: "webdesign" },
    { href: "/marketing", key: "marketing" },
  ];
  const NAV = isMarketing
    ? MARKETING_NAV
    : (navItems && navItems.length > 0 ? navItems : FALLBACK_NAV);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useMerkliste();
  const { itemCount: cartCount } = useCart();
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
            {customer ? (
              <Link href="/konto" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} title="Mein Konto">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="8" r="3.5"/>
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
                </svg>
                {customer.firstName}
              </Link>
            ) : (
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="8" r="3.5"/>
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
                </svg>
                Anmelden
              </Link>
            )}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className={`u-heart${cartCount > 0 ? " has-items" : ""}`}
              title="Warenkorb"
              aria-label="Warenkorb öffnen"
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cartCount > 0 && <span className="u-heart-count">{cartCount}</span>}
            </button>
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
          {/* SOL: Logo — hangi markadaysak onun logosu */}
          <div style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
            <Link
              href={isMarketing ? "/inkii-marketing" : "/"}
              className="logo"
              translate="no"
              aria-label={isMarketing ? "INKII MARKETING – Startseite" : "INKII WORKS – Startseite"}
            >
              {isMarketing && marketingLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={marketingLogo} alt="INKII MARKETING" />
              ) : (
                <Image src="/inkii-logo.png" alt={isMarketing ? "INKII MARKETING" : "INKII WORKS"} width={200} height={60} priority />
              )}
            </Link>
          </div>

          {/* ORTA: Nav linkler */}
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

          {/* SAĞ: Sadece burger (mobil); diğer marka logosu sol-alt köşede home-brand-switcher */}
          <div
            className="head-actions"
            style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, minWidth: 0 }}
          >
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
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
            {nav[n.key]}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => { setOpen(false); setCartOpen(true); }}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            font: "inherit",
            color: "inherit",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          🛒 Warenkorb
          {cartCount > 0 ? ` (${cartCount})` : ""}
        </button>

        {/* Login / Account in mobile drawer */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
          {customer ? (
            <Link
              href="/konto"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit", textDecoration: "none" }}
            >
              👤 {customer.firstName} — Mein Konto
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, color: "inherit", textDecoration: "none", fontWeight: 600 }}
            >
              🔑 Anmelden
            </Link>
          )}
        </div>

        <div className="drawer-lang">
          <span>{t.language}</span>
          <LangSwitcher current={locale} />
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
