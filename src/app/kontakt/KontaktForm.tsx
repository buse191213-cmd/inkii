"use client";

import { useState } from "react";
import { submitInquiry } from "./actions";
import { sendInquiryFromBrowser } from "@/lib/mail-client";

const PROJEKT_TYPEN = [
  "Textildruck & Veredelung",
  "Stickerei",
  "Werbemittel & Werbeartikel",
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    // 1) Server-Action: in DB speichern
    const dbRes = await submitInquiry({ ok: false }, fd);
    if (!dbRes.ok) {
      setPending(false);
      setError(dbRes.error ?? "Senden fehlgeschlagen.");
      return;
    }

    // 2) Mail vom Browser an Web3Forms (umgeht Cloudflare-Bot-Block)
    const vorname = String(fd.get("vorname") ?? "");
    const nachname = String(fd.get("nachname") ?? "");
    const email = String(fd.get("email") ?? "");
    const telefon = String(fd.get("telefon") ?? "");
    const firma = String(fd.get("firma") ?? "");
    const projektTyp = String(fd.get("projektTyp") ?? "");
    const budget = String(fd.get("budget") ?? "");
    const wunschtermin = String(fd.get("wunschtermin") ?? "");
    const nachricht = String(fd.get("nachricht") ?? "");

    const fullName = `${vorname} ${nachname}`.trim();
    const subject = `Kontaktanfrage${projektTyp ? `: ${projektTyp}` : ""}`;
    const lines: string[] = [];
    if (projektTyp) lines.push(`Projekttyp: ${projektTyp}`);
    if (budget) lines.push(`Budget: ${budget}`);
    if (wunschtermin) lines.push(`Wunschtermin: ${wunschtermin}`);
    if (lines.length > 0) lines.push("");
    lines.push(nachricht);
    const fullMessage = lines.join("\n");

    const mailRes = await sendInquiryFromBrowser({
      name: fullName,
      email,
      phone: telefon,
      company: firma,
      subject,
      message: fullMessage,
    });
    if (!mailRes.ok && !mailRes.skipped) {
      console.warn("[kontakt] mail failed:", mailRes.error);
    }

    setPending(false);
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
