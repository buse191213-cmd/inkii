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

        {/* ═══════════ LEFT: BRAND PANEL ═══════════ */}
        <div style={{
          background: "linear-gradient(135deg, #002218 0%, #004537 45%, #006b56 100%)",
          color: "#fff",
          padding: "60px 56px",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }} className="login-brand">

          {/* Decorative shapes */}
          <div style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Top: Logo / Brand */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <Link href="/" style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              textDecoration: "none",
              letterSpacing: "-0.5px",
              display: "inline-block",
            }}>
              INKII<span style={{ opacity: 0.6 }}> WORKS</span>
            </Link>
          </div>

          {/* Center: Big Statement */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
            <h1 style={{
              fontSize: "2.6rem",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              Premium-Qualität<br />
              <span style={{ opacity: 0.7 }}>für Ihre Marke.</span>
            </h1>

            <p style={{
              fontSize: 16,
              lineHeight: 1.6,
              marginTop: 22,
              opacity: 0.85,
              maxWidth: 380,
            }}>
              B2B Textilveredelung & Druck — von Stickerei über DTF-Druck bis zum kompletten Markenservice.
            </p>

            {/* Features */}
            <ul style={{
              listStyle: "none",
              padding: 0,
              marginTop: 32,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
              {[
                "DTF-Druck in höchster Auflösung",
                "Stickerei mit bis zu 12 Farben",
                "Bestellverfolgung & Wiederbestellung",
              ].map((feature) => (
                <li key={feature} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, opacity: 0.9 }}>
                  <span style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom: Testimonial */}
          <div style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 22 }}>
            <p style={{ fontSize: 13, fontStyle: "italic", opacity: 0.8, lineHeight: 1.5, margin: 0 }}>
              „Erstklassige Verarbeitung und schnelle Lieferung. INKII ist unser fester Partner für Teamkleidung."
            </p>
            <p style={{ fontSize: 12, marginTop: 8, opacity: 0.65 }}>
              — Geschäftskunde aus Essen
            </p>
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

            <h2 style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: 0,
              color: "#1f2937",
              letterSpacing: "-0.01em",
            }}>
              Willkommen zurück
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, marginBottom: 32 }}>
              Melden Sie sich in Ihrem Konto an.
            </p>

            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Email */}
              <div>
                <label style={lbl}>E-Mail-Adresse</label>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label style={lbl}>Passwort</label>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ ...input, paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: "absolute",
                      right: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                      padding: 8,
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showPwd ? "Verbergen" : "Anzeigen"}
                  >
                    {showPwd ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  background: isPending ? "#94a3b8" : "#004537",
                  color: "#fff",
                  padding: "14px 16px",
                  fontWeight: 600,
                  border: "none",
                  cursor: isPending ? "default" : "pointer",
                  fontSize: 14.5,
                  marginTop: 4,
                  borderRadius: 8,
                  letterSpacing: "0.01em",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => { if (!isPending) e.currentTarget.style.background = "#003428"; }}
                onMouseOut={(e) => { if (!isPending) e.currentTarget.style.background = "#004537"; }}
              >
                {isPending ? "Wird angemeldet…" : "Anmelden →"}
              </button>
            </form>

            {/* Bottom Links */}
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, textAlign: "center" }}>
                Noch kein Konto?{" "}
                <Link href="/registrieren" style={{ color: "#004537", fontWeight: 600, textDecoration: "none" }}>
                  Account erstellen
                </Link>
              </p>
              <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 14, textAlign: "center" }}>
                Oder{" "}
                <Link href="/warenkorb" style={{ color: "#475569", textDecoration: "underline" }}>
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
            padding: 36px 28px !important;
            min-height: 340px !important;
          }
          :global(.login-brand h1) {
            font-size: 2rem !important;
          }
          :global(.login-form-wrap) {
            padding: 36px 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#475569",
  marginBottom: 6,
  letterSpacing: "0.01em",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #e5e7eb",
  fontSize: 14.5,
  background: "#fff",
  fontFamily: "inherit",
  borderRadius: 8,
  outline: "none",
  color: "#1f2937",
  transition: "border-color 0.15s",
};
