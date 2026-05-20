"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkCredentials, sessionToken, SESSION_COOKIE } from "@/lib/auth";

export type LoginState = { error?: string };

/** Prüft die Zugangsdaten und legt bei Erfolg ein Sitzungs-Cookie an. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(email, password)) {
    return { error: "E-Mail oder Passwort ist nicht korrekt." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 Stunden
  });

  redirect("/admin");
}
