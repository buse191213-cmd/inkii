"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deactivateAccount } from "../profile-actions";

export default function SicherheitClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
      setPwdMsg({ type: "err", text: "Passwörter stimmen nicht überein." });
      return;
    }
    startTransition(async () => {
      const result = await changePassword(currentPwd, newPwd);
      if (result.ok) {
        setPwdMsg({ type: "ok", text: "Passwort geändert." });
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
        <h2 style={titleStyle}>Sicherheit</h2>
        <p style={sub}>Passwort ändern oder Konto deaktivieren.</p>
      </div>

      {/* Passwort ändern */}
      <form onSubmit={handlePasswordChange} noValidate style={{ maxWidth: 480, marginBottom: 60 }}>
        <h3 style={sectionTitle}>Passwort ändern</h3>

        <Field label="Aktuelles Passwort">
          <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} style={input} required />
        </Field>

        <Field label="Neues Passwort (min. 6)">
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={input} required minLength={6} />
        </Field>

        <Field label="Neues Passwort wiederholen">
          <input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} style={input} required />
        </Field>

        {pwdMsg && (
          <div style={{
            padding: 12,
            marginTop: 8,
            marginBottom: 16,
            background: pwdMsg.type === "ok" ? "#000" : "#fff",
            color: pwdMsg.type === "ok" ? "#fff" : "#000",
            border: pwdMsg.type === "err" ? "1px solid #000" : "none",
            fontSize: 12,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}>
            {pwdMsg.text}
          </div>
        )}

        <button type="submit" disabled={isPending} style={submitBtn(isPending)}>
          {isPending ? "…" : "Passwort ändern"}
        </button>
      </form>

      {/* Konto deaktivieren */}
      <div style={{ maxWidth: 480, paddingTop: 40, borderTop: "2px solid #000" }}>
        <h3 style={{ ...sectionTitle, color: "#000" }}>Konto deaktivieren</h3>
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
              color: "#000",
              padding: "13px 32px",
              fontWeight: 600,
              border: "1px solid #000",
              fontSize: 11,
              letterSpacing: "3px",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Konto deaktivieren
          </button>
        ) : (
          <form onSubmit={handleDeactivate} noValidate>
            <Field label="Aktuelles Passwort">
              <input type="password" value={deactivatePwd} onChange={(e) => setDeactivatePwd(e.target.value)} style={input} required />
            </Field>

            <Field label='Bestätigung: „DEAKTIVIEREN" eingeben'>
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
                background: "#fff",
                color: "#000",
                border: "1px solid #000",
                fontSize: 12,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}>
                {deactivateMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={isPending} style={submitBtn(isPending)}>
                {isPending ? "…" : "Endgültig deaktivieren"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeactivate(false)}
                style={{
                  background: "transparent",
                  color: "#666",
                  padding: "13px 24px",
                  fontWeight: 500,
                  border: "1px solid #d0d0d0",
                  fontSize: 11,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
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
  fontSize: "1.4rem",
  fontWeight: 300,
  margin: 0,
  marginBottom: 6,
  fontFamily: "Georgia, serif",
  fontStyle: "italic",
  letterSpacing: "-0.01em",
};
const sub: React.CSSProperties = { fontSize: 13, color: "#666", margin: 0 };
const sectionTitle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#000",
  letterSpacing: "3px",
  textTransform: "uppercase",
  marginTop: 8,
  marginBottom: 20,
};
const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 600,
  color: "#000",
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
  color: "#000",
};
const submitBtn = (pending: boolean): React.CSSProperties => ({
  background: pending ? "#666" : "#000",
  color: "#fff",
  padding: "13px 32px",
  fontWeight: 500,
  border: "none",
  cursor: pending ? "default" : "pointer",
  fontSize: 11,
  letterSpacing: "3px",
  textTransform: "uppercase",
});
