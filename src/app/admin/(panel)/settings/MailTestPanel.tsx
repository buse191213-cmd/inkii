"use client";

import { useEffect, useState } from "react";
import { sendTestMail, getSmtpStatus } from "./mail-test-action";

type Status = Awaited<ReturnType<typeof getSmtpStatus>>;

export default function MailTestPanel({ defaultEmail }: { defaultEmail: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    adminOk?: boolean;
    customerOk?: boolean;
    adminError?: string;
    customerError?: string;
    skipped?: boolean;
  } | null>(null);

  useEffect(() => {
    getSmtpStatus().then(setStatus);
  }, []);

  async function handleTest() {
    setBusy(true);
    setResult(null);
    try {
      const r = await sendTestMail(email);
      setResult(r);
    } catch (e: unknown) {
      setResult({ adminError: e instanceof Error ? e.message : "Fehler" });
    } finally {
      setBusy(false);
    }
  }

  const configured = status?.configured ?? false;
  const verifyOk = status?.verifyOk ?? false;
  const statusColor = !configured ? "warn" : verifyOk ? "ok" : "err";
  const statusText = !configured
    ? "Nicht konfiguriert"
    : verifyOk
    ? "Verbunden"
    : "Verbindungsfehler";

  return (
    <div className="panel mail-test-panel">
      <div className="panel-head">
        <h3>
          <span>Mail-Versand (IONOS SMTP)</span>
          <span className={`mail-status ${statusColor}`}>● {statusText}</span>
        </h3>
      </div>
      <div className="panel-body">
        {!configured && (
          <div className="mail-warn-box">
            <strong>SMTP-Variablen fehlen in Vercel.</strong>
            <ol>
              <li>In <a href="https://my.ionos.de" target="_blank" rel="noreferrer">IONOS Kundencenter</a> → E-Mail → Postfächer → <code>info@inkiiworks.de</code> auswählen → Zugriff & Geräte → SMTP-Zugangsdaten einsehen.</li>
              <li>In Vercel → Project „inkii" → Settings → Environment Variables (alle Production + Preview + Development aktivieren):
                <pre style={{ marginTop: 8, background: "#1c2722", color: "#eef5e8", padding: 14, borderRadius: 6, fontSize: ".82rem", lineHeight: 1.6, overflow: "auto" }}>
{`SMTP_HOST=smtp.ionos.de
SMTP_PORT=465
SMTP_USER=info@inkiiworks.de
SMTP_PASS=(Postfach-Passwort)
SMTP_FROM=INKII Works <info@inkiiworks.de>
MAIL_ADMIN=info@inkiiworks.de`}
                </pre>
              </li>
              <li><b>Redeploy</b> nicht vergessen (Deployments → ⋯ → Redeploy).</li>
            </ol>
          </div>
        )}

        {configured && !verifyOk && (
          <div className="mail-warn-box" style={{ background: "#fef2f0", borderColor: "#f5d5d0", borderLeftColor: "#b8463a" }}>
            <strong style={{ color: "#7a3530" }}>SMTP-Verbindung fehlgeschlagen</strong>
            <p style={{ margin: "8px 0", fontSize: ".86rem", color: "#7a3530" }}>{status?.verifyError}</p>
            <small>
              Häufige Ursachen: Passwort falsch, Port nicht erlaubt (probieren Sie 587 statt 465),
              Host falsch (probieren Sie <code>smtp.ionos.com</code> oder <code>smtp.1und1.de</code>).
            </small>
          </div>
        )}

        {configured && (
          <div className="smtp-config-display">
            <div><span>Host:</span> <code>{status?.host}:{status?.port}</code></div>
            <div><span>User:</span> <code>{status?.user}</code></div>
            <div><span>From:</span> <code>{status?.from}</code></div>
            <div><span>Admin:</span> <code>{status?.admin}</code></div>
          </div>
        )}

        <p className="mail-test-desc" style={{ marginTop: 16 }}>
          Test sendet zwei Mails:
          <br />→ Shop-Mail an <code>{status?.admin || "info@inkiiworks.de"}</code>
          <br />→ Kunden-Bestätigung an die unten angegebene Adresse
        </p>

        <div className="field">
          <label htmlFor="mail-test-email">Test-Kundenadresse</label>
          <input
            id="mail-test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihre@email.de"
          />
        </div>

        <button type="button" className="btn-primary" onClick={handleTest} disabled={busy}>
          {busy ? "Sende Test-Mails …" : "Test-Mails verschicken"}
        </button>

        {result && (
          <div className="mail-result">
            {result.skipped ? (
              <div className="mail-result-row err">✕ Übersprungen — SMTP nicht konfiguriert.</div>
            ) : (
              <>
                <div className={`mail-result-row ${result.adminOk ? "ok" : "err"}`}>
                  {result.adminOk ? "✓" : "✕"} Admin-Mail an <b>{status?.admin || "info@inkiiworks.de"}</b>
                  {result.adminError && <div className="mail-result-err">{result.adminError}</div>}
                </div>
                <div className={`mail-result-row ${result.customerOk ? "ok" : "err"}`}>
                  {result.customerOk ? "✓" : "✕"} Kunden-Bestätigung an <b>{email}</b>
                  {result.customerError && <div className="mail-result-err">{result.customerError}</div>}
                </div>
                {(result.adminOk || result.customerOk) && (
                  <p className="mail-result-hint">Mails sollten in wenigen Sekunden ankommen.</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
