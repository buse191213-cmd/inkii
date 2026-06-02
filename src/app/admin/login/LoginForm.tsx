"use client";

import { useActionState } from "react";
import Image from "next/image";
import { loginAction, LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form className="login-card" action={formAction}>
      <div className="login-logo" translate="no">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image src="/inkii-logo.png" alt="INKII WORKS" width={200} height={60} priority />
      </div>
      <p className="sub">Admin-Panel</p>

      {state.error && <div className="form-err">{state.error}</div>}

      <label htmlFor="email">E-Mail</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="name@inkii.de"
        autoComplete="email"
        required
      />
      <label htmlFor="password">Passwort</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      <button className="login-btn" type="submit" disabled={pending}>
        {pending ? "Anmeldung läuft …" : "Anmelden"}
      </button>
    </form>
  );
}
