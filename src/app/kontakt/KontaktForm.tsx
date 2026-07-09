"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { submitInquiry } from "./actions";
import type { Dictionary } from "@/dictionaries/types";

export default function KontaktForm({
  projectTypes,
  t,
}: {
  projectTypes?: string[];
  t?: Dictionary["kontaktForm"];
} = {}) {
  const searchParams = useSearchParams();
  const designNote = searchParams.get("note") || "";
  const designUrl = searchParams.get("design") || "";
  const [message, setMessage] = useState("");

  // URL'den gelen DTF designer notunu otomatik doldur
  useEffect(() => {
    if (designNote) setMessage(designNote);
  }, [designNote]);

  const PROJEKT_TYPEN = projectTypes && projectTypes.length > 0
    ? projectTypes
    : ["Textildruck & Veredelung", "Stickerei", "Werbemittel & Werbeartikel", "Druck (Flyer, Plakate, etc.)", "Werbetechnik", "Webdesign", "Marketing", "Komplettlösung", "Sonstiges"];

  const BUDGET_OPTIONEN = t?.budgetOptions ?? ["< 500 €", "500 – 1.500 €", "1.500 – 5.000 €", "5.000 – 15.000 €", "> 15.000 €", "Noch unklar"];

  // Fallback (Almanca)
  const tt = t ?? {
    thankYou: "Vielen Dank für Ihre Anfrage!", vorname: "Vorname", nachname: "Nachname",
    email: "E-Mail", phone: "Telefon", company: "Firma", companyPh: "Firma / Verein",
    projektTyp: "Projekttyp", choose: "Wählen …", budget: "Budget",
    projektFrist: "Projektfrist (TT.MM.JJJJ)", yourDesign: "Ihr Design",
    message: "Wobei können wir Ihnen helfen?", messagePh: "Lass uns wissen, was wir für dich tun können.",
    sending: "Wird gesendet …", submit: "Anfrage senden", sendFailed: "Senden fehlgeschlagen.",
    privacyNote1: "Mit dem Absenden akzeptieren Sie unsere", privacyLink: "Datenschutzerklärung",
    budgetOptions: BUDGET_OPTIONEN,
  } as Dictionary["kontaktForm"];

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
      setError(dbRes.error ?? tt.sendFailed);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="kontakt-form-card">
        <div className="form-ok">{tt.thankYou}</div>
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
          <label htmlFor="vorname">{tt.vorname}</label>
          <input id="vorname" name="vorname" type="text" placeholder={tt.vorname} required />
        </div>
        <div className="kf-field">
          <label htmlFor="nachname">{tt.nachname}</label>
          <input id="nachname" name="nachname" type="text" placeholder={tt.nachname} required />
        </div>
      </div>

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="email">{tt.email}</label>
          <input id="email" name="email" type="email" placeholder="name@firma.de" required />
        </div>
        <div className="kf-field">
          <label htmlFor="phone">{tt.phone}</label>
          <input id="phone" name="phone" type="tel" placeholder="+49 XXX XXXXXXX" />
        </div>
      </div>

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="company">{tt.company}</label>
          <input id="company" name="company" type="text" placeholder={tt.companyPh} />
        </div>
        <div className="kf-field">
          <label htmlFor="projektTyp">{tt.projektTyp}</label>
          <select id="projektTyp" name="projektTyp" defaultValue="">
            <option value="" disabled>{tt.choose}</option>
            {PROJEKT_TYPEN.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="kf-row">
        <div className="kf-field">
          <label htmlFor="budget">{tt.budget}</label>
          <select id="budget" name="budget" defaultValue="">
            <option value="" disabled>{tt.choose}</option>
            {BUDGET_OPTIONEN.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="kf-field">
          <label htmlFor="projektFrist">{tt.projektFrist}</label>
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

      {designUrl && (
        <div className="kf-design-preview">
          <div className="kf-design-thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={designUrl} alt={tt.yourDesign} />
          </div>
          <div className="kf-design-info">
            <strong>📨 Ihr optimiertes Design ist hinzugefügt</strong>
            <p>Die Datei wird automatisch mit Ihrer Anfrage mitgeschickt.</p>
          </div>
        </div>
      )}

      <div className="kf-field">
        <label htmlFor="message">{tt.message}</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={tt.messagePh}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button className="kf-submit" type="submit" disabled={pending}>
        {pending ? tt.sending : tt.submit}
      </button>

      <p className="kf-note">
        {tt.privacyNote1}{" "}
        <a href="/datenschutz">{tt.privacyLink}</a>.
      </p>
    </form>
  );
}
