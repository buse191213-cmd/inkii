"use client";

import { useActionState } from "react";
import { submitInquiry, InquiryState } from "./actions";
import type { Dictionary } from "@/dictionaries/types";

const initial: InquiryState = { ok: false };

export default function KontaktForm({
  t,
  common,
}: {
  t: Dictionary["kontakt"];
  common: Dictionary["common"];
}) {
  const [state, formAction, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
    return (
      <div className="form-card">
        <div className="form-ok">{t.formOk}</div>
        <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>
          {t.formOkNote}
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" action={formAction}>
      {state.error && <div className="form-err">{state.error}</div>}
      <div className="field-row">
        <div className="field">
          <label htmlFor="name">{t.fName}</label>
          <input id="name" name="name" type="text" placeholder={t.phName} required />
        </div>
        <div className="field">
          <label htmlFor="company">{t.fCompany}</label>
          <input id="company" name="company" type="text" placeholder={common.optional} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="email">{t.fEmail}</label>
          <input id="email" name="email" type="email" placeholder={t.phEmail} required />
        </div>
        <div className="field">
          <label htmlFor="phone">{t.fPhone}</label>
          <input id="phone" name="phone" type="tel" placeholder={common.optional} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="subject">{t.fSubject}</label>
        <input id="subject" name="subject" type="text" placeholder={t.phSubject} required />
      </div>
      <div className="field">
        <label htmlFor="message">{t.fMessage}</label>
        <textarea id="message" name="message" placeholder={t.phMessage} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? common.sending : t.submit}
      </button>
      <p className="form-note">{common.formNote}</p>
    </form>
  );
}
