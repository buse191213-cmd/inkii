"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutCustomer } from "../login/auth-actions";

const NAV = [
  {
    href: "/konto",
    label: "Übersicht",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/konto/bestellungen",
    label: "Bestellungen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 11-8 0" />
      </svg>
    ),
  },
  {
    href: "/konto/anfragen",
    label: "Anfragen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/konto/adressen",
    label: "Adressen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/konto/profil",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/konto/sicherheit",
    label: "Sicherheit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];

export default function KontoSidebar({ customerName, customerEmail }: { customerName: string; customerEmail: string }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const initials = customerName.split(" ").map(s => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  return (
    <aside style={{
      position: "sticky",
      top: 100,
      height: "fit-content",
    }}>
      {/* Avatar Block */}
      <div style={{
        paddingBottom: 28,
        borderBottom: "1px solid #e5e5e5",
        marginBottom: 28,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "1px",
          marginBottom: 14,
        }}>{initials}</div>

        <div style={{
          fontSize: 11,
          color: "#999",
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 4,
        }}>
          Konto
        </div>
        <div style={{
          fontWeight: 500,
          fontSize: 15,
          color: "#000",
          marginBottom: 2,
          fontFamily: "Georgia, serif",
        }}>{customerName}</div>
        <div style={{
          fontSize: 12,
          color: "#666",
          wordBreak: "break-all",
        }}>{customerEmail}</div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = item.href === "/konto"
            ? pathname === "/konto"
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                fontSize: 13,
                color: active ? "#fff" : "#000",
                fontWeight: 500,
                background: active ? "#000" : "transparent",
                textDecoration: "none",
                letterSpacing: "0.3px",
                transition: "all 0.15s",
              }}
              onMouseOver={(e) => {
                if (!active) e.currentTarget.style.background = "#f5f5f5";
              }}
              onMouseOut={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{
                width: 18,
                height: 18,
                color: active ? "#fff" : "#666",
                flexShrink: 0,
                display: "inline-flex",
              }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #e5e5e5" }}>
        <button
          type="button"
          onClick={() => startTransition(() => logoutCustomer())}
          disabled={isPending}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid #000",
            color: "#000",
            padding: "11px",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            cursor: isPending ? "default" : "pointer",
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            if (!isPending) {
              e.currentTarget.style.background = "#000";
              e.currentTarget.style.color = "#fff";
            }
          }}
          onMouseOut={(e) => {
            if (!isPending) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#000";
            }
          }}
        >
          {isPending ? "…" : "Abmelden"}
        </button>
      </div>
    </aside>
  );
}
