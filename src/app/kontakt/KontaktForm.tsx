"use client";

import { useState } from "react";
import { submitInquiry } from "./actions";

export default function KontaktForm({
  projectTypes,
}: {
  projectTypes?: string[];
} = {}) {
  const PROJEKT_TYPEN = projectTypes && projectTypes.length > 0
    ? projectTypes
    : ["Textildruck & Veredelung", "Stickerei", "Werbemittel & Werbeartikel", "Druck (Flyer, Plakate, etc.)", "Werbetechnik", "Webdesign", "Marketing", "Komplettlösung", "Sonstiges"];

  const BUDGET_OPTIONEN = ["< 500 €", "500 – 1.500 €", "1.500 – 5.000 €", "5.000 – 15.000 €", "> 15.000 €", "Noch unklar"];

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    // Server-Action: in DB speichern + Mails verschicken
    const dbRes = await submitInquiry({ ok: false }, fd);
    setPending(false);
    if (!dbRes.ok) {
      setError(dbRes.error ?? "Senden fehlgeschlagen.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="kontakt-form-card">
        <div className="form-ok">Vielen Dank für Ihre Anfrage!</div>
        <p style={{ color: "var(--muted)", fontSize: ".95rem", marginTop: 10 }}>
          Wir melden uns innerhalb von 24 Stunden bei Ihnen.
        </p>
      </div>
    );
  }

  return (
    <form className="kontakt-form-card" onSubmit={handleSubmit}>
      {error && <div className="form-err">{error}</div>}

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="vorname">Vorname</label>
          <input id="vorname" name="vorname" type="text" placeholder="Vorname" required />
        </div>
        <div className="kf-field">
          <label htmlFor="nachname">Nachname</label>
          <input id="nachname" name="nachname" type="text" placeholder="Nachname" required />
        </div>
      </div>

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="email">E-Mail</label>
          <input id="email" name="email" type="email" placeholder="name@firma.de" required />
        </div>
        <div className="kf-field">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" type="tel" placeholder="+49 XXX XXXXXXX" />
        </div>
      </div>

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="company">Firma</label>
          <input id="company" name="company" type="text" placeholder="Firma / Verein" />
        </div>
        <div className="kf-field">
          <label htmlFor="projektTyp">Projekttyp</label>
          <select id="projektTyp" name="projektTyp" defaultValue="">
            <option value="" disabled>Wählen …</option>
            {PROJEKT_TYPEN.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="budget">Budget</label>
          <select id="budget" name="budget" defaultValue="">
            <option value="" disabled>Wählen …</option>
            {BUDGET_OPTIONEN.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="kf-field">
          <label htmlFor="projektFrist">Projektfrist (TT.MM.JJJJ)</label>
          <input
            id="projektFrist"
            name="projektFrist"
            type="text"
            inputMode="numeric"
            placeholder="TT.MM.JJJJ"
            maxLength={10}
            pattern="\d{2}\.\d{2}\.\d{4}"
            autoComplete="off"
            onInput={(e) => {
              /* Automatisches Setzen der Punkte: TTMMJJJJ → TT.MM.JJJJ */
              const el = e.currentTarget;
              const raw = el.value.replace(/\D/g, "").slice(0, 8);
              let formatted = raw;
              if (raw.length > 4) {
                formatted = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4)}`;
              } else if (raw.length > 2) {
                formatted = `${raw.slice(0, 2)}.${raw.slice(2)}`;
              }
              el.value = formatted;
            }}
          />
        </div>
      </div>

      <div className="kf-field">
        <label htmlFor="message">Wobei können wir Ihnen helfen?</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Lass uns wissen, was wir für dich tun können."
        />
      </div>

      <button className="kf-submit" type="submit" disabled={pending}>
        {pending ? "Wird gesendet …" : "Anfrage senden"}
      </button>

      <p className="kf-note">
        Mit dem Absenden willigen Sie ein, dass wir Ihre Angaben zur Bearbeitung
        verwenden. Weitere Informationen in der{" "}
        <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>
    </form>
  );
}
