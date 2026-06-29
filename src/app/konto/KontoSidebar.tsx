"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logoutCustomer } from "../login/auth-actions";

const NAV = [
  { href: "/konto", label: "Übersicht", icon: "📊" },
  { href: "/konto/bestellungen", label: "Bestellungen", icon: "🛒" },
  { href: "/konto/anfragen", label: "Anfragen / Angebote", icon: "✉️" },
  { href: "/konto/adressen", label: "Adressen", icon: "📍" },
  { href: "/konto/profil", label: "Profil bearbeiten", icon: "👤" },
  { href: "/konto/sicherheit", label: "Sicherheit", icon: "🔒" },
];

export default function KontoSidebar({ customerName, customerEmail }: { customerName: string; customerEmail: string }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <aside style={{ background: "#fff", border: "1px solid #e5e7eb", height: "fit-content", position: "sticky", top: 100 }}>
      <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{customerName}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, wordBreak: "break-all" }}>{customerEmail}</div>
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
                gap: 10,
                padding: "10px 16px",
                fontSize: 14,
                color: active ? "#004537" : "#475569",
                fontWeight: active ? 600 : 500,
                background: active ? "#f0fdf4" : "transparent",
                textDecoration: "none",
                borderLeft: active ? "3px solid #004537" : "3px solid transparent",
              }}
            >
              <span style={{ width: 20, fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={() => startTransition(() => logoutCustomer())}
          disabled={isPending}
          style={{
            width: "100%",
            background: "transparent",
            border: "1px solid #d1d5db",
            color: "#475569",
            padding: "10px",
            fontWeight: 600,
            fontSize: 13,
            cursor: isPending ? "default" : "pointer",
          }}
        >
          {isPending ? "…" : "🚪 Abmelden"}
        </button>
      </div>
    </aside>
  );
}
