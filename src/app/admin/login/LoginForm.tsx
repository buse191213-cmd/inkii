"use client";

import { useActionState } from "react";
import { loginAction, LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form className="login-card" action={formAction}>
      <div className="login-logo" translate="no">
        <span className="logo-name">INKII</span>
        <span className="logo-tag">WORKS</span>
      </div>
      <p className="sub">Admin-Panel — bitte anmelden</p>

      {state.error && <div className="form-err">{state.error}</div>}

      <label htmlFor="email">E-Mail</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="admin@inkii.de"
        defaultValue="admin@inkii.de"
        required
      />
      <label htmlFor="password">Passwort</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
      <button className="login-btn" type="submit" disabled={pending}>
        {pending ? "Anmeldung läuft …" : "Anmelden →"}
      </button>
      <p className="login-hint">
        Demo-Zugang: admin@inkii.de / inkii2026
      </p>
    </form>
  );
}
