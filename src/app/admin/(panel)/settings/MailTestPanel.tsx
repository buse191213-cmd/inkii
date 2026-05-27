"use client";

import { useState } from "react";
import { sendInquiryFromBrowser } from "@/lib/mail-client";

export default function MailTestPanel({ defaultEmail }: { defaultEmail: string }) {
  const rawKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "";
  const configured = rawKey.length > 0;
  const keyHint = configured
    ? `${rawKey.slice(0, 8)}…${rawKey.slice(-4)} (${rawKey.length} Zeichen)`
    : "—";
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    ok?: boolean;
    error?: string;
    skipped?: boolean;
  } | null>(null);

  async function handleTest() {
    setBusy(true);
    setResult(null);
    try {
      const r = await sendInquiryFromBrowser({
        name: "Mail-Test (Admin-Panel)",
        email,
        phone: "+49 160 6767001",
        company: "INKII Works",
        subject: "Mail-Test vom Admin-Panel",
        message:
          "Dies ist eine Test-Nachricht aus dem INKII-Admin-Panel.\n\n" +
          "Wenn der Versand funktioniert, erhalten Sie ZWEI Mails:\n" +
          "1) Shop-Benachrichtigung an info@inkiiworks.de\n" +
          `2) Auto-Reply-Bestätigung an ${email}`,
      });
      setResult(r);
    } catch (e: unknown) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Fehler" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel mail-test-panel">
      <div className="panel-head">
        <h3>
          <span>Mail-Versand testen</span>
          <span className={`mail-status ${configured ? "ok" : "warn"}`}>
            {configured ? "● Konfiguriert" : "● Nicht konfiguriert"}
          </span>
        </h3>
      </div>
      <div className="panel-body">
        {!configured && (
          <div className="mail-warn-box">
            <strong>NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY fehlt in Vercel.</strong>
            <ol>
              <li>
                Auf <a href="https://web3forms.com" target="_blank" rel="noreferrer">web3forms.com</a> Mail
                <code>info@inkiiworks.de</code> eingeben → Access-Key kommt sofort.
              </li>
              <li>
                <b>Bestätigungs-Link in der ersten Web3Forms-Mail KLICKEN</b> — sonst
                bleibt der Key inaktiv.
              </li>
              <li>
                In Vercel → Settings → Environment Variables:
                <br />
                <code>NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY</code> = (der Key) — für alle
                3 Umgebungen aktivieren.
              </li>
              <li>
                <b>Redeploy nötig</b> (Deployments → ⋯ → Redeploy).
              </li>
            </ol>
          </div>
        )}

        <p className="mail-test-desc">
          Sendet eine Test-Anfrage direkt aus dem Browser an Web3Forms.
          <br />→ Shop-Mail an <code>info@inkiiworks.de</code>
          <br />→ Auto-Reply an die unten angegebene Adresse
          <br />
          <small style={{ color: "#9ea7a2", fontFamily: "monospace" }}>
            Key im Browser: <b>{keyHint}</b>
          </small>
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

        <button
          type="button"
          className="btn-primary"
          onClick={handleTest}
          disabled={busy}
        >
          {busy ? "Sende Test-Mail …" : "Test-Mail verschicken"}
        </button>

        {result && (
          <div className="mail-result">
            {result.skipped && (
              <div className="mail-result-row err">
                ✕ Übersprungen — Access-Key fehlt.
              </div>
            )}
            {!result.skipped && result.ok && (
              <>
                <div className="mail-result-row ok">
                  ✓ Erfolg! Web3Forms hat die Submission akzeptiert.
                </div>
                <p className="mail-result-hint">
                  Mails kommen meist in 5–60 Sekunden an. Auch Spam-Ordner prüfen!
                  <br />• <b>info@inkiiworks.de</b> → Shop-Benachrichtigung
                  <br />• <b>{email}</b> → Auto-Reply-Bestätigung
                </p>
              </>
            )}
            {!result.skipped && !result.ok && (
              <>
                <div className="mail-result-row err">
                  ✕ Fehlgeschlagen
                  {result.error && <div className="mail-result-err">{result.error}</div>}
                </div>
                <p className="mail-result-hint">
                  Mögliche Ursachen:
                  <br />1. Bestätigungs-Link von Web3Forms nicht geklickt (Key inaktiv)
                  <br />2. Access-Key in Vercel falsch (Leerzeichen?)
                  <br />3. Nach Env-Update kein Redeploy
                  <br />4. Im Web3Forms-Dashboard „Allowed Domains" zu strikt (leer
                  lassen oder inkii.vercel.app eintragen)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
