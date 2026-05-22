"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMerkliste } from "./MerklisteProvider";
import LangSwitcher from "./LangSwitcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";

type NavItem = { href: string; key: keyof Dictionary["nav"] };

const FALLBACK_NAV: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/veredelung", key: "veredelung" },
  { href: "/werbemittel", key: "werbemittel" },
  { href: "/leistungen", key: "leistungen" },
  { href: "/bereiche", key: "bereiche" },
  { href: "/nachhaltigkeit", key: "nachhaltigkeit" },
  { href: "/ueber-uns", key: "ueberUns" },
  { href: "/kontakt", key: "kontakt" },
];

export default function SiteHeader({
  locale,
  nav,
  t,
  navItems,
}: {
  locale: Locale;
  nav: Dictionary["nav"];
  t: Dictionary["header"];
  navItems?: NavItem[];
}) {
  const NAV = navItems && navItems.length > 0 ? navItems : FALLBACK_NAV;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useMerkliste();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="utility">
        <div className="utility-inner">
          <span className="u-left">
            <span className="u-star">★</span> Premium Werbemittel-Service
          </span>
          <span className="u-center">
            Kostenlose Designs &amp; unverbindliches Angebot in 24 Stunden
          </span>
          <div className="u-right">
            <Link href="/ueber-uns">Über Uns</Link>
            <Link href="/nachhaltigkeit">Nachhaltigkeit</Link>
            <Link href="/bereiche">Bereiche</Link>
            <Link href="/kontakt">Kontakt</Link>
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
              <img src="/inkii-logo.png" alt="INKII WORKS" />
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

          {/* SAĞ: İkonlar + kalp (flex: 1) */}
          <div
            className="head-actions"
            style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, minWidth: 0 }}
          >
            <div className="icon-btn" title={t.search}>⌕</div>
            <div className="icon-btn" title={t.account}>☻</div>
            <Link
              href="/merkzettel"
              className={`cart-pill${count > 0 ? " has-items" : ""}`}
              title={t.merkzettel}
            >
              <span aria-hidden>♥</span> {count}
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
