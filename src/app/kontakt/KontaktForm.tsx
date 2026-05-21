"use client";

import { useActionState } from "react";
import { submitInquiry, InquiryState } from "./actions";

const initial: InquiryState = { ok: false };

const PROJEKT_TYPEN = [
  "Textildruck & Veredelung",
  "Stickerei",
  "Werbemittel & Merch",
  "Druck (Flyer, Plakate, etc.)",
  "Werbetechnik",
  "Webdesign",
  "Marketing",
  "Komplettlösung",
  "Sonstiges",
];

const BUDGET_OPTIONEN = [
  "Unter 500 €",
  "500 – 2.000 €",
  "2.000 – 5.000 €",
  "5.000 – 10.000 €",
  "10.000 – 25.000 €",
  "Über 25.000 €",
  "Noch unklar",
];

export default function KontaktForm() {
  const [state, formAction, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
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
    <form className="kontakt-form-card" action={formAction}>
      {state.error && <div className="form-err">{state.error}</div>}

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
          <label htmlFor="email">Arbeits-E-Mail</label>
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
          <label htmlFor="projektFrist">Projektfrist</label>
          <input id="projektFrist" name="projektFrist" type="date" />
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
