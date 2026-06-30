"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginCustomer } from "./auth-actions";

type Props = {
  next: string;
  slideImages: string[];
};

export default function LoginClient({ next, slideImages }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Slideshow rotation
  useEffect(() => {
    if (slideImages.length <= 1) return;
    const id = setInterval(() => {
      setActiveSlide((s) => (s + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slideImages.length]);

  // Detect mobile (handles dynamic resize)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 880);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Body scroll lock SADECE desktop'ta — mobilde klavye için scroll lazım
  useEffect(() => {
    if (isMobile) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobile]);

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

  // Desktop: fixed fullscreen split
  // Mobile: normal flow, full-height, single column
  const containerStyle: React.CSSProperties = isMobile
    ? {
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        inset: 0,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#fff",
        zIndex: 100,
      };

  return (
    <div style={containerStyle}>

      {/* LEFT: SLIDESHOW — Desktop only */}
      {!isMobile && (
        <div style={{
          position: "relative",
          overflow: "hidden",
          background: "#000",
        }}>
          {slideImages.map((src, i) => (
            <div
              key={src + i}
              style={{
                position: "absolute",
                inset: 0,
                opacity: activeSlide === i ? 1 : 0,
                transition: "opacity 1.5s ease-in-out",
                background: `#000 url('${src}') center/cover no-repeat`,
              }}
            />
          ))}

          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }} />

          <div style={{
            position: "absolute",
            inset: 0,
            padding: "40px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#fff",
            zIndex: 2,
          }}>
            <div>
              <Link href="/" style={{ display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/inkii-works-logo.png"
                  alt="INKII Works"
                  style={{ height: 48, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.95 }}
                />
              </Link>
            </div>
            <div>
              <h1 style={{
                fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: 0,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}>
                Willkommen<br />
                zurück.
              </h1>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {slideImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveSlide(i)}
                  style={{
                    width: activeSlide === i ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: activeSlide === i ? "#fff" : "rgba(255,255,255,0.4)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.3s",
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT (Desktop) / MAIN (Mobile): FORM */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "32px 24px" : "40px 48px",
        background: "#fff",
        overflowY: isMobile ? "visible" : "auto",
        flex: isMobile ? 1 : "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 360 }}>

          {/* Mobile: small logo at top */}
          {isMobile && (
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <Link href="/" style={{ display: "inline-block" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/inkii-works-logo.png"
                  alt="INKII Works"
                  style={{ height: 36, width: "auto", filter: "brightness(0)" }}
                />
              </Link>
              <h1 style={{
                fontSize: "1.8rem",
                fontWeight: 300,
                margin: "20px 0 0",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                color: "#000",
              }}>
                Willkommen zurück.
              </h1>
            </div>
          )}

          <p style={{
            fontSize: 11,
            color: "#000",
            letterSpacing: "3px",
            textTransform: "uppercase",
            fontWeight: 600,
            margin: 0,
            marginBottom: 36,
            textAlign: isMobile ? "center" : "left",
          }}>
            Anmelden
          </p>

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <label style={{
                ...lbl,
                color: focusedField === "email" || email ? "#000" : "#999",
              }}>
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...input,
                  borderBottomColor: focusedField === "email" ? "#000" : "#d0d0d0",
                  borderBottomWidth: focusedField === "email" ? "2px" : "1px",
                }}
                placeholder="name@beispiel.de"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label style={{
                ...lbl,
                color: focusedField === "password" || password ? "#000" : "#999",
              }}>
                Passwort
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...input,
                    paddingRight: 36,
                    borderBottomColor: focusedField === "password" ? "#000" : "#d0d0d0",
                    borderBottomWidth: focusedField === "password" ? "2px" : "1px",
                  }}
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
                    color: "#666",
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
                padding: "10px 0 8px",
                color: "#000",
                fontSize: 12,
                borderTop: "1px solid #000",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                lineHeight: 1.5,
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
                padding: "15px 16px",
                fontWeight: 500,
                border: "none",
                cursor: isPending ? "default" : "pointer",
                fontSize: 12,
                marginTop: 8,
                letterSpacing: "3px",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {isPending ? "Wird angemeldet…" : "Anmelden"}
            </button>
          </form>

          <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid #e5e5e5" }}>
            <p style={{ fontSize: 12, color: "#666", margin: 0, textAlign: "center", letterSpacing: "0.3px" }}>
              Noch kein Konto?{" "}
              <Link href="/registrieren" style={{ color: "#000", fontWeight: 600, textDecoration: "underline" }}>
                Account erstellen
              </Link>
            </p>
            <p style={{ fontSize: 11, color: "#999", marginTop: 12, textAlign: "center" }}>
              Oder{" "}
              <Link href="/" style={{ color: "#666", textDecoration: "underline" }}>
                zur Startseite
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  marginBottom: 6,
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  transition: "color 0.2s",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 0 8px",
  border: "none",
  borderBottom: "1px solid #d0d0d0",
  fontSize: 16, // 16px iOS auto-zoom önler
  background: "transparent",
  fontFamily: "inherit",
  borderRadius: 0,
  outline: "none",
  color: "#000",
  transition: "border-color 0.2s, border-width 0.2s",
};
