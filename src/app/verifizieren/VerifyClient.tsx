"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyEmailCode, resendVerificationCode } from "../login/auth-actions";

export default function VerifyClient({ email, mailErr }: { email: string; mailErr?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState(mailErr ? `E-Mail-Versand fehlgeschlagen: ${mailErr}. Versuchen Sie "Neuen Code senden" oder kontaktieren Sie uns.` : "");
  const [resendMsg, setResendMsg] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function handleDigitChange(idx: number, val: string) {
    const cleaned = val.replace(/\D/g, "").slice(0, 1);
    const newDigits = [...digits];
    newDigits[idx] = cleaned;
    setDigits(newDigits);
    setError("");
    if (cleaned && idx < 5) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = pasted.split("").concat(Array(6 - pasted.length).fill(""));
      setDigits(newDigits);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Bitte 6-stelligen Code eingeben.");
      return;
    }
    startTransition(async () => {
      const result = await verifyEmailCode(email, code);
      if (result.ok) {
        router.push("/konto");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleResend() {
    setResendMsg("");
    setError("");
    startTransition(async () => {
      const result = await resendVerificationCode(email);
      if (result.ok) {
        setResendMsg("Neuer Code wurde an Ihre E-Mail gesendet.");
        setTimeout(() => setResendMsg(""), 5000);
      } else {
        setError(result.error);
      }
    });
  }

  // Auto-submit when 6 digits filled
  useEffect(() => {
    if (digits.every((d) => d.length === 1)) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

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
        maxWidth: 480,
        background: "#fff",
        boxShadow: "0 10px 40px rgba(0, 69, 55, 0.08)",
        borderRadius: 4,
        overflow: "hidden",
      }}>
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
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
            E-Mail bestätigen
          </h1>
          <p style={{ fontSize: 13, opacity: 0.9, marginTop: 6, marginBottom: 0 }}>
            Wir haben einen 6-stelligen Code gesendet an
          </p>
          <p style={{ fontSize: 14, marginTop: 4, marginBottom: 0, fontWeight: 600 }}>
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "32px 36px" }}>
          {/* 6 Digit Inputs */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18 }}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                style={{
                  width: 48,
                  height: 56,
                  fontSize: 24,
                  fontWeight: 700,
                  textAlign: "center",
                  border: error ? "2px solid #dc2626" : d ? "2px solid #004537" : "2px solid #e5e7eb",
                  borderRadius: 6,
                  outline: "none",
                  color: "#004537",
                  background: d ? "#f0fdf4" : "#fff",
                  transition: "all 0.15s",
                  fontFamily: "'Courier New', monospace",
                }}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "#fef2f2",
              color: "#991b1b",
              fontSize: 13,
              borderRadius: 4,
              marginBottom: 14,
              textAlign: "center",
            }}>
              {error}
            </div>
          )}

          {resendMsg && (
            <div style={{
              padding: "10px 14px",
              background: "#d1fae5",
              color: "#065f46",
              fontSize: 13,
              borderRadius: 4,
              marginBottom: 14,
              textAlign: "center",
            }}>
              ✓ {resendMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              background: isPending ? "#94a3b8" : "linear-gradient(135deg, #004537 0%, #006b56 100%)",
              color: "#fff",
              padding: "13px 16px",
              fontWeight: 600,
              border: "none",
              cursor: isPending ? "default" : "pointer",
              fontSize: 14,
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            {isPending ? "Wird geprüft…" : "Bestätigen"}
          </button>

          <div style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
            Keine E-Mail erhalten?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "none",
                color: "#004537",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
                font: "inherit",
              }}
            >
              Neuen Code senden
            </button>
          </div>

          <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16, lineHeight: 1.5 }}>
            Der Code ist 30 Minuten gültig.<br />
            Bitte prüfen Sie auch Ihren Spam-Ordner.
          </div>
        </form>
      </div>
    </section>
  );
}
