"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deactivateAccount } from "../profile-actions";
import { getDictionary } from "@/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export default function SicherheitClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const m = document.cookie.match(/inkii_locale=([^;]+)/);
    if (m && isLocale(m[1])) setLocale(m[1]);
  }, []);
  const ts = getDictionary(locale).konto.sicherheitPage;

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivatePwd, setDeactivatePwd] = useState("");
  const [deactivateConfirm, setDeactivateConfirm] = useState("");
  const [deactivateMsg, setDeactivateMsg] = useState<string>("");

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== newPwd2) {
      setPwdMsg({ type: "err", text: ts.pwMismatch });
      return;
    }
    startTransition(async () => {
      const result = await changePassword(currentPwd, newPwd);
      if (result.ok) {
        setPwdMsg({ type: "ok", text: ts.pwChanged });
        setCurrentPwd(""); setNewPwd(""); setNewPwd2("");
      } else {
        setPwdMsg({ type: "err", text: result.error ?? "Fehler" });
      }
    });
  }

  function handleDeactivate(e: React.FormEvent) {
    e.preventDefault();
    setDeactivateMsg("");
    if (deactivateConfirm !== "DEAKTIVIEREN") {
      setDeactivateMsg('Bitte „DEAKTIVIEREN" exakt eingeben.');
      return;
    }
    startTransition(async () => {
      const result = await deactivateAccount(deactivatePwd);
      if (result.ok) {
        router.push("/konto/deaktiviert");
      } else {
        setDeactivateMsg(result.error ?? "Fehler");
      }
    });
  }

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 style={titleStyle}>{ts.title}</h2>
        <p style={sub}>{ts.sub}</p>
      </div>

      {/* Passwort ändern */}
      <form onSubmit={handlePasswordChange} noValidate style={{ maxWidth: 480, marginBottom: 60 }}>
        <h3 style={sectionTitle}>{ts.changePassword}</h3>

        <Field label={ts.currentPassword}>
          <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} style={input} required />
        </Field>

        <Field label={ts.newPassword}>
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={input} required minLength={6} />
        </Field>

        <Field label={ts.repeatPassword}>
          <input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} style={input} required />
        </Field>

        {pwdMsg && (
          <div style={{
            padding: 12,
            marginTop: 8,
            marginBottom: 16,
            background: pwdMsg.type === "ok" ? "#d1fae5" : "#fee2e2",
            color: pwdMsg.type === "ok" ? "#065f46" : "#991b1b",
            fontSize: 12,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: 700,
            borderRadius: 4,
          }}>
            {pwdMsg.text}
          </div>
        )}

        <button type="submit" disabled={isPending} style={submitBtn(isPending)}>
          {isPending ? "…" : ts.changeBtn}
        </button>
      </form>

      {/* ════ KIRMIZI: Konto deaktivieren ════ */}
      <div style={{
        maxWidth: 480,
        paddingTop: 32,
        marginTop: 8,
        borderTop: "2px solid #dc2626",
      }}>
        <h3 style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#dc2626",
          letterSpacing: "3px",
          textTransform: "uppercase",
          marginTop: 0,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
          </svg>
          Gefahrenzone
        </h3>

        <h4 style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#dc2626",
          margin: 0,
          marginBottom: 10,
        }}>
          Konto deaktivieren
        </h4>

        <p style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>
          Nach der Deaktivierung können Sie sich nicht mehr anmelden.
          Bestellungen und Rechnungen bleiben aus rechtlichen Gründen erhalten.
          Reaktivierung über unseren Support möglich.
        </p>

        {!showDeactivate ? (
          <button
            type="button"
            onClick={() => setShowDeactivate(true)}
            style={{
              background: "transparent",
              color: "#dc2626",
              padding: "11px 28px",
              fontWeight: 700,
              border: "1.5px solid #dc2626",
              fontSize: 11,
              letterSpacing: "3px",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: 4,
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#dc2626";
            }}
          >
            Konto deaktivieren
          </button>
        ) : (
          <form onSubmit={handleDeactivate} noValidate>
            <Field label={ts.currentPassword}>
              <input type="password" value={deactivatePwd} onChange={(e) => setDeactivatePwd(e.target.value)} style={input} required />
            </Field>

            <Field label={ts.confirmDeactivate}>
              <input
                type="text"
                value={deactivateConfirm}
                onChange={(e) => setDeactivateConfirm(e.target.value)}
                style={input}
                placeholder="DEAKTIVIEREN"
                required
              />
            </Field>

            {deactivateMsg && (
              <div style={{
                padding: 12,
                marginTop: 8,
                marginBottom: 16,
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: 12,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 700,
                borderRadius: 4,
              }}>
                {deactivateMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: isPending ? "#a8a29e" : "#dc2626",
                  color: "#fff",
                  padding: "13px 28px",
                  fontWeight: 700,
                  border: "none",
                  cursor: isPending ? "default" : "pointer",
                  fontSize: 11,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  borderRadius: 4,
                }}
              >
                {isPending ? "…" : ts.deactivateBtn}
              </button>
              <button
                type="button"
                onClick={() => setShowDeactivate(false)}
                style={{
                  background: "transparent",
                  color: "#666",
                  padding: "13px 24px",
                  fontWeight: 600,
                  border: "1px solid #d0d0d0",
                  fontSize: 11,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 600,
  margin: 0,
  marginBottom: 6,
  color: "#0f1a16",
  letterSpacing: "-0.01em",
};
const sub: React.CSSProperties = { fontSize: 13, color: "#666", margin: 0 };
const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#0f1a16",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginTop: 8,
  marginBottom: 20,
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  color: "#0f1a16",
  marginBottom: 6,
  letterSpacing: "2px",
  textTransform: "uppercase",
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 0 8px",
  border: "none",
  borderBottom: "1px solid #d0d0d0",
  fontSize: 14,
  background: "transparent",
  fontFamily: "inherit",
  borderRadius: 0,
  outline: "none",
  color: "#0f1a16",
};
const submitBtn = (pending: boolean): React.CSSProperties => ({
  background: pending ? "#666" : "#0f1a16",
  color: "#fff",
  padding: "13px 32px",
  fontWeight: 600,
  border: "none",
  cursor: pending ? "default" : "pointer",
  fontSize: 11,
  letterSpacing: "3px",
  textTransform: "uppercase",
  borderRadius: 4,
});
