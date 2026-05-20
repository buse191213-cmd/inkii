"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useMerkliste } from "./MerklisteProvider";
import LangSwitcher from "./LangSwitcher";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries/types";

const NAV: { href: string; key: keyof Dictionary["nav"] }[] = [
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
}: {
  locale: Locale;
  nav: Dictionary["nav"];
  t: Dictionary["header"];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useMerkliste();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>
            {t.hotline} <a href="tel:+490000000000">0000 – 000 00 00</a> · {t.hours}
          </span>
          <div className="u-right">
            <Link href="/kontakt">{t.login}</Link>
            <Link href="/merkzettel">{t.merkzettel}</Link>
            <Link href="/kontakt">{t.rueckruf}</Link>
            <LangSwitcher current={locale} />
          </div>
        </div>
      </div>

      <header className="site">
        <div className="wrap head-row">
          <Link href="/" className="logo" translate="no" aria-label="INKII WORKS – Startseite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/inkii-logo.png" alt="INKII WORKS" />
          </Link>
          <nav className="main">
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
          <div className="head-actions">
            <div className="icon-btn" title={t.search}>⌕</div>
            <div className="icon-btn" title={t.account}>☻</div>
            <Link
              href="/merkzettel"
              className={`cart-pill${count > 0 ? " has-items" : ""}`}
              title={t.merkzettel}
            >
              <span>⛒</span> {count}
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
