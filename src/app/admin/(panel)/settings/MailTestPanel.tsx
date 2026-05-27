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
    shopOk?: boolean;
    customerOk?: boolean;
    shopError?: string;
    customerError?: string;
    skipped?: boolean;
  } | null>(null);

  async function handleTest() {
    setBusy(true);
    setResult(null);
    try {
      const r = await sendTestMail(email);
      setResult(r);
    } catch (e: unknown) {
      setResult({
        shopOk: false,
        customerOk: false,
        shopError: e instanceof Error ? e.message : "Fehler",
      });
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
                Mail-Adresse <code>info@inkiiworks.de</code> eintragen → Access-Key erscheint
                sofort und wird zusätzlich an die Mailbox geschickt.
              </li>
              <li>
                <b>Bestätigungsmail in info@inkiiworks.de klicken</b> — sonst bleibt der Key inaktiv.
              </li>
              <li>
                In Vercel → Project „inkii" → Settings → Environment Variables:
                <br />
                <code>WEB3FORMS_ACCESS_KEY</code> = (der Key) — für Production, Preview und Development.
              </li>
              <li>
                <b>Redeploy nötig:</b> Deployments → letzter Eintrag → ⋯ → Redeploy.
              </li>
              <li>
                Im Web3Forms-Dashboard → Settings → „Allowed Domains" deine Domain ergänzen
                (z. B. <code>inkii.vercel.app</code>).
              </li>
            </ol>
          </div>
        )}

        <p className="mail-test-desc">
          Sendet zwei Test-Mails: eine an <code>info@inkiiworks.de</code> (Shop-Benachrichtigung)
          und eine Bestätigung an die unten angegebene Adresse (Kunden-Mail).
        </p>

        <div className="field">
          <label htmlFor="mail-test-email">Kunden-Test-Mail (Empfänger der Bestätigung)</label>
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
          {busy ? "Sende Test-Mails …" : "Test-Mails verschicken"}
        </button>

        {result && (
          <div className="mail-result">
            {result.skipped && (
              <div className="mail-result-row err">
                ✕ Übersprungen — WEB3FORMS_ACCESS_KEY nicht in Vercel gesetzt.
              </div>
            )}
            {!result.skipped && (
              <>
                <div className={`mail-result-row ${result.shopOk ? "ok" : "err"}`}>
                  {result.shopOk ? "✓" : "✕"} Shop-Benachrichtigung an{" "}
                  <b>info@inkiiworks.de</b>
                  {result.shopError && <div className="mail-result-err">{result.shopError}</div>}
                </div>
                <div className={`mail-result-row ${result.customerOk ? "ok" : "err"}`}>
                  {result.customerOk ? "✓" : "✕"} Kunden-Bestätigung an <b>{email}</b>
                  {result.customerError && <div className="mail-result-err">{result.customerError}</div>}
                </div>
                {(result.shopOk || result.customerOk) && (
                  <p className="mail-result-hint">
                    Mails werden meist innerhalb von 5–30 Sekunden zugestellt. Prüfen Sie auch
                    den Spam-Ordner.
                  </p>
                )}
                {!result.shopOk && !result.customerOk && !result.skipped && (
                  <p className="mail-result-hint">
                    Fehlerursache prüfen: 1) Access-Key in Vercel korrekt? 2) Domain im
                    Web3Forms-Dashboard freigegeben? 3) Bestätigungs-Mail bei der ersten
                    Registrierung geklickt? 4) Nach Env-Update redeployt?
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
