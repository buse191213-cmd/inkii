"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    group: "Übersicht",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="5"/><rect x="13" y="10" width="8" height="11"/><rect x="3" y="13" width="8" height="8"/></svg>',
  },
  {
    href: "/admin/bestellungen",
    label: "Bestellungen",
    group: "Shop",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1.5"/><circle cx="20" cy="21" r="1.5"/><path d="M3 3h2l3 13h12l3-9H6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    href: "/admin/kunden",
    label: "Kunden",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  },
  {
    href: "/admin/inquiries",
    label: "Anfragen",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  },
  {
    href: "/admin/products",
    label: "Produkte",
    group: "Katalog",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></svg>',
  },
  {
    href: "/admin/categories",
    label: "Kategorien",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  },
  {
    href: "/admin/homepage",
    label: "Startseite",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><path d="M9 21v-7h6v7"/></svg>',
  },
  {
    href: "/admin/team",
    label: "Team",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20c0-2.5 2-4.5 4.5-4.5"/></svg>',
  },
  {
    href: "/admin/navigation",
    label: "Navigation",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
  },
  {
    href: "/admin/settings",
    label: "Einstellungen",
    group: "System",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.1A1.6 1.6 0 007 19.4a1.6 1.6 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.6 1.6 0 00-1.1-2.7H2a2 2 0 110-4h.1A1.6 1.6 0 004.6 7a1.6 1.6 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0010 2.6V2a2 2 0 114 0v.1a1.6 1.6 0 002.7 1.1 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-1.1 2.7v.1H22a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/></svg>',
  },
];

export default function AdminNav({ inquiryCount }: { inquiryCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <button className="menu-btn" aria-label="Menü" onClick={() => setOpen((o) => !o)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <aside className={`side${open ? " open" : ""}`}>
        <div className="side-logo" translate="no">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Image src="/inkii-logo.png" alt="INKII WORKS" width={200} height={60} priority />
          <small>Admin</small>
        </div>
        <nav className="side-nav">
          {NAV.map((n) => (
            <div key={n.href}>
              {n.group && <span className="side-cap">{n.group}</span>}
              <Link
                href={n.href}
                className={`nav-item${isActive(n.href) ? " active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span dangerouslySetInnerHTML={{ __html: n.icon }} />
                {n.label}
                {n.href === "/admin/inquiries" && inquiryCount > 0 && (
                  <span className="badge">{inquiryCount}</span>
                )}
              </Link>
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <div className="av">A</div>
            <div>
              <b>Admin</b>
              <span>admin@inkii.de</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
