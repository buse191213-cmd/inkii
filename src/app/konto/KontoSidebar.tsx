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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    href: "/konto/adressen",
    label: "Adressen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/konto/profil",
    label: "Profil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/konto/sicherheit",
    label: "Sicherheit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
      background: "#fff",
      border: "1px solid #e5e7eb",
      height: "fit-content",
      position: "sticky",
      top: 100,
      borderRadius: 4,
      overflow: "hidden",
    }}>
      {/* Header: Avatar + İsim */}
      <div style={{
        padding: "20px 18px",
        background: "linear-gradient(135deg, #004537 0%, #006b56 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(4px)",
          border: "2px solid rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 16,
          flexShrink: 0,
        }}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{customerName}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customerEmail}</div>
        </div>
      </div>

      <nav style={{ padding: "8px 0" }}>
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
                padding: "11px 18px",
                fontSize: 14,
                color: active ? "#004537" : "#475569",
                fontWeight: active ? 600 : 500,
                background: active ? "#f0fdf4" : "transparent",
                textDecoration: "none",
                borderLeft: active ? "3px solid #004537" : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{
                width: 18,
                height: 18,
                color: active ? "#004537" : "#94a3b8",
                flexShrink: 0,
                display: "inline-flex",
              }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 14, borderTop: "1px solid #e5e7eb", background: "#f8fafc" }}>
        <button
          type="button"
          onClick={() => startTransition(() => logoutCustomer())}
          disabled={isPending}
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid #cbd5e1",
            color: "#475569",
            padding: "10px",
            fontWeight: 600,
            fontSize: 13,
            cursor: isPending ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {isPending ? "…" : "Abmelden"}
        </button>
      </div>
    </aside>
  );
}
