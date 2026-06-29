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
    <section style={{ minHeight: "calc(100vh - 200px)", background: "#fff" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "calc(100vh - 200px)",
      }} className="login-split">

        {/* ═══════════ LEFT: BLACK PANEL — MINIMAL ═══════════ */}
        <div style={{
          background: "#000",
          color: "#fff",
          padding: "60px 56px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 600,
        }} className="login-brand">

          {/* Top: Brand */}
          <div>
            <Link href="/" style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "4px",
              textTransform: "uppercase",
              display: "inline-block",
              opacity: 0.6,
            }}>
              INKII Works
            </Link>
          </div>

          {/* Center: Just the Headline */}
          <div>
            <h1 style={{
              fontSize: "clamp(3rem, 6vw, 5rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              margin: 0,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
            }}>
              Willkommen<br />
              zurück.
            </h1>
          </div>

          {/* Bottom: small decorative line */}
          <div>
            <div style={{
              width: 60,
              height: 1,
              background: "rgba(255,255,255,0.3)",
            }} />
          </div>
        </div>

        {/* ═══════════ RIGHT: LOGIN FORM ═══════════ */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          background: "#fff",
        }} className="login-form-wrap">
          <div style={{ width: "100%", maxWidth: 380 }}>

            <p style={{
              fontSize: 12,
              color: "#000",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontWeight: 600,
              margin: 0,
              marginBottom: 40,
            }}>
              Anmelden
            </p>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {/* Email */}
              <div>
                <label style={lbl}>E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={input}
                  placeholder="name@beispiel.de"
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label style={lbl}>Passwort</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...input, paddingRight: 40 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#000",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showPwd ? "Verbergen" : "Anzeigen"}
                  >
                    {showPwd ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: "10px 0",
                  color: "#000",
                  fontSize: 12,
                  borderTop: "1px solid #000",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <div>⚠ {error}</div>
                  {error.includes("bestätigen") && email && (
                    <Link
                      href={`/verifizieren?email=${encodeURIComponent(email)}`}
                      style={{ color: "#000", fontWeight: 600, textDecoration: "underline", fontSize: 12 }}
                    >
                      → Code eingeben
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: isPending ? "#666" : "#000",
                  color: "#fff",
                  padding: "16px 16px",
                  fontWeight: 500,
                  border: "none",
                  cursor: isPending ? "default" : "pointer",
                  fontSize: 13,
                  marginTop: 8,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => { if (!isPending) e.currentTarget.style.background = "#333"; }}
                onMouseOut={(e) => { if (!isPending) e.currentTarget.style.background = "#000"; }}
              >
                {isPending ? "Wird angemeldet…" : "Anmelden"}
              </button>
            </form>

            {/* Bottom Links */}
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #e5e5e5" }}>
              <p style={{ fontSize: 12, color: "#666", margin: 0, textAlign: "center", letterSpacing: "0.3px" }}>
                Noch kein Konto?{" "}
                <Link href="/registrieren" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>
                  Account erstellen
                </Link>
              </p>
              <p style={{ fontSize: 11, color: "#999", marginTop: 12, textAlign: "center" }}>
                Oder{" "}
                <Link href="/warenkorb" style={{ color: "#666", textDecoration: "underline" }}>
                  als Gast bestellen
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style jsx>{`
        @media (max-width: 880px) {
          :global(.login-split) {
            grid-template-columns: 1fr !important;
          }
          :global(.login-brand) {
            padding: 50px 28px !important;
            min-height: 320px !important;
          }
          :global(.login-form-wrap) {
            padding: 40px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 600,
  color: "#000",
  marginBottom: 8,
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  border: "none",
  borderBottom: "1px solid #000",
  fontSize: 14,
  background: "transparent",
  fontFamily: "inherit",
  borderRadius: 0,
  outline: "none",
  color: "#000",
  transition: "border-color 0.15s",
};
