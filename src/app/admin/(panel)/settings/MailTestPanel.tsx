"use client";

import { useState } from "react";
import { sendTestMail } from "./mail-test-action";

export default function MailTestPanel({
  configured,
  defaultEmail,
}: {
  configured: boolean;
  defaultEmail: string;
}) {
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
      const r = await sendTestMail(email);
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
            <strong>WEB3FORMS_ACCESS_KEY fehlt in Vercel.</strong>
            <ol>
              <li>
                Auf <a href="https://web3forms.com" target="_blank" rel="noreferrer">web3forms.com</a> die
                Mail-Adresse <code>info@inkiiworks.de</code> eintragen → Access-Key wird
                sofort an diese Mailbox geschickt.
              </li>
              <li>
                <b>Bestätigungs-Link in der Mail von Web3Forms KLICKEN</b> — sonst bleibt
                der Key inaktiv und nichts wird versendet.
              </li>
              <li>
                In Vercel → Project „inkii" → Settings → Environment Variables:
                <br />
                <code>WEB3FORMS_ACCESS_KEY</code> = (der Key) — Production, Preview UND
                Development aktivieren.
              </li>
              <li>
                <b>Redeploy nötig:</b> Vercel → Deployments → letzter Eintrag → ⋯ →
                Redeploy.
              </li>
            </ol>
          </div>
        )}

        <p className="mail-test-desc">
          Sendet eine Test-Anfrage über Web3Forms.
          <br />→ Shop-Mail geht an <code>info@inkiiworks.de</code>
          <br />→ Kunden-Bestätigung (Autoresponse) an die unten angegebene Adresse
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
          disabled={busy || !configured}
        >
          {busy ? "Sende Test-Mail …" : "Test-Mail verschicken"}
        </button>

        {result && (
          <div className="mail-result">
            {result.skipped && (
              <div className="mail-result-row err">
                ✕ Übersprungen — Access-Key fehlt in Vercel.
              </div>
            )}
            {!result.skipped && result.ok && (
              <>
                <div className="mail-result-row ok">
                  ✓ Erfolg! Mails wurden an Web3Forms übergeben.
                </div>
                <p className="mail-result-hint">
                  Web3Forms verarbeitet die Submission jetzt. Prüfen Sie in 5–60 Sekunden:
                  <br />
                  • <b>info@inkiiworks.de</b> → Shop-Benachrichtigung
                  <br />
                  • <b>{email}</b> → Autoresponse-Bestätigung
                  <br />
                  Auch Spam-/Junk-Ordner checken!
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
                  <br />
                  1. Web3Forms-Bestätigungs-Link nicht geklickt (Key inaktiv)
                  <br />
                  2. Access-Key in Vercel falsch kopiert (Leerzeichen?)
                  <br />
                  3. Nach Env-Update keine Redeployment durchgeführt
                  <br />
                  4. Web3Forms-Kontingent erreicht (250/Monat im Free-Plan)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
