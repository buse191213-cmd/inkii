"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginCustomer } from "./auth-actions";

export default function LoginClient({ next }: { next: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginCustomer(email, password);
      if (result.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section style={{
      minHeight: "calc(100vh - 200px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background: "linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "#fff",
        boxShadow: "0 10px 40px rgba(0, 69, 55, 0.08)",
        overflow: "hidden",
        borderRadius: 4,
      }}>
        {/* Top - Brand Banner */}
        <div style={{
          padding: "32px 36px 24px",
          background: "linear-gradient(135deg, #004537 0%, #006b56 100%)",
          color: "#fff",
          textAlign: "center",
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
            Willkommen zurück
          </h1>
          <p style={{ fontSize: 13, opacity: 0.9, marginTop: 6, marginBottom: 0 }}>
            Melden Sie sich in Ihrem Konto an
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "32px 36px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={lbl}>E-Mail</label>
              <div style={inputWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.8} style={iconLeft}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputWithIcon}
                  placeholder="name@beispiel.de"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label style={lbl}>Passwort</label>
              <div style={inputWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.8} style={iconLeft}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputWithIcon, paddingRight: 44 }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: 4,
                  }}
                  aria-label={showPwd ? "Verbergen" : "Anzeigen"}
                >
                  {showPwd ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                color: "#991b1b",
                fontSize: 13,
                border: "1px solid #fecaca",
                borderRadius: 4,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                flexDirection: "column",
              }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
                {error.includes("bestätigen") && email && (
                  <Link
                    href={`/verifizieren?email=${encodeURIComponent(email)}`}
                    style={{ color: "#004537", fontWeight: 600, textDecoration: "underline", fontSize: 12 }}
                  >
                    → Jetzt Code eingeben
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                background: isPending ? "#94a3b8" : "linear-gradient(135deg, #004537 0%, #006b56 100%)",
                color: "#fff",
                padding: "13px 16px",
                fontWeight: 600,
                border: "none",
                cursor: isPending ? "default" : "pointer",
                fontSize: 14,
                marginTop: 4,
                borderRadius: 4,
                letterSpacing: "0.02em",
                boxShadow: isPending ? "none" : "0 4px 12px rgba(0, 69, 55, 0.25)",
                transition: "all 0.15s",
              }}
            >
              {isPending ? "Wird angemeldet…" : "Anmelden →"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
              <Link href="/registrieren" style={{ color: "#004537", textDecoration: "none", fontWeight: 600 }}>
                Account erstellen
              </Link>
              <Link href="/warenkorb" style={{ color: "#64748b", textDecoration: "none" }}>
                Als Gast bestellen →
              </Link>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div style={{
          padding: "16px 36px",
          background: "#f8fafc",
          borderTop: "1px solid #e5e7eb",
          fontSize: 11,
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 1.5,
        }}>
          🔒 Ihre Daten werden verschlüsselt übertragen<br />
          INKII Works · Made in Germany
        </div>
      </div>
    </section>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#1f2937",
  marginBottom: 6,
};
const inputWrap: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};
const iconLeft: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  pointerEvents: "none",
};
const inputWithIcon: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px 12px 42px",
  border: "1.5px solid #e5e7eb",
  fontSize: 14,
  background: "#fff",
  fontFamily: "inherit",
  borderRadius: 4,
  outline: "none",
  transition: "border-color 0.15s",
};
