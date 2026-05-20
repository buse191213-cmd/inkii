"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./i18n";

/** Speichert die gewählte Sprache als Cookie. */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
