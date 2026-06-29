"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePassword, deactivateAccount } from "../profile-actions";

export default function SicherheitClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Deactivation
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivatePwd, setDeactivatePwd] = useState("");
  const [deactivateConfirm, setDeactivateConfirm] = useState("");
  const [deactivateMsg, setDeactivateMsg] = useState<string>("");

  function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== newPwd2) {
      setPwdMsg({ type: "err", text: "Neue Passwörter stimmen nicht überein." });
      return;
    }
    startTransition(async () => {
      const result = await changePassword(currentPwd, newPwd);
      if (result.ok) {
        setPwdMsg({ type: "ok", text: "Passwort erfolgreich geändert." });
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
      setDeactivateMsg("Bitte geben Sie genau „DEAKTIVIEREN" zur Bestätigung ein.");
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
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: 16 }}>Sicherheit</h2>

      {/* Passwort ändern */}
      <form
        onSubmit={handlePasswordChange}
        style={{ background: "#fff", padding: 20, border: "1px solid #e5e7eb", marginBottom: 20 }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Passwort ändern</h3>
        <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
          Wählen Sie ein sicheres Passwort mit mindestens 6 Zeichen.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={field}>
            <label>Aktuelles Passwort</label>
            <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} style={input} required />
          </div>
          <div style={field}>
            <label>Neues Passwort (min. 6 Zeichen)</label>
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={input} required minLength={6} />
          </div>
          <div style={field}>
            <label>Neues Passwort wiederholen</label>
            <input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} style={input} required />
          </div>

          {pwdMsg && (
            <div style={{ padding: 10, background: pwdMsg.type === "ok" ? "#d1fae5" : "#fee2e2", color: pwdMsg.type === "ok" ? "#065f46" : "#991b1b", fontSize: 13 }}>
              {pwdMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              background: isPending ? "#94a3b8" : "#004537",
              color: "#fff",
              padding: "10px 22px",
              fontWeight: 600,
              border: "none",
              cursor: isPending ? "default" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {isPending ? "…" : "Passwort ändern"}
          </button>
        </div>
      </form>

      {/* Konto deaktivieren */}
      <div style={{ background: "#fff", padding: 20, border: "1px solid #fca5a5" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "#991b1b" }}>Konto deaktivieren</h3>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>
          Wenn Sie Ihr Konto deaktivieren, können Sie sich nicht mehr anmelden.
          Ihre Bestellungen und Rechnungen bleiben aus rechtlichen Gründen erhalten.
          <br />
          <strong>Sie können Ihr Konto über unseren Support jederzeit wieder aktivieren.</strong>
        </p>

        {!showDeactivate ? (
          <button
            type="button"
            onClick={() => setShowDeactivate(true)}
            style={{
              background: "transparent",
              color: "#991b1b",
              padding: "10px 22px",
              fontWeight: 600,
              border: "1px solid #991b1b",
              cursor: "pointer",
            }}
          >
            Konto deaktivieren
          </button>
        ) : (
          <form onSubmit={handleDeactivate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={field}>
              <label style={{ color: "#991b1b" }}>Aktuelles Passwort zur Bestätigung</label>
              <input type="password" value={deactivatePwd} onChange={(e) => setDeactivatePwd(e.target.value)} style={input} required />
            </div>
            <div style={field}>
              <label style={{ color: "#991b1b" }}>
                Geben Sie zur Bestätigung „<strong>DEAKTIVIEREN</strong>" ein
              </label>
              <input
                type="text"
                value={deactivateConfirm}
                onChange={(e) => setDeactivateConfirm(e.target.value)}
                style={input}
                placeholder="DEAKTIVIEREN"
                required
              />
            </div>

            {deactivateMsg && (
              <div style={{ padding: 10, background: "#fee2e2", color: "#991b1b", fontSize: 13 }}>
                {deactivateMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  background: isPending ? "#94a3b8" : "#dc2626",
                  color: "#fff",
                  padding: "10px 22px",
                  fontWeight: 600,
                  border: "none",
                  cursor: isPending ? "default" : "pointer",
                }}
              >
                {isPending ? "…" : "Konto endgültig deaktivieren"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeactivate(false)}
                style={{
                  background: "transparent",
                  color: "#475569",
                  padding: "10px 22px",
                  fontWeight: 600,
                  border: "1px solid #d1d5db",
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

const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };
const input: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  fontFamily: "inherit",
};
