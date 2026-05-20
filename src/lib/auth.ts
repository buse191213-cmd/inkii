import { cookies } from "next/headers";

export const SESSION_COOKIE = "inkii_session";

/** Der erwartete Cookie-Wert für eine gültige Admin-Sitzung. */
export function sessionToken(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "inkii-dev-secret";
}

/** Prüft serverseitig, ob eine gültige Admin-Sitzung besteht. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === sessionToken();
}

/** Prüft die eingegebenen Zugangsdaten gegen die .env-Werte. */
export function checkCredentials(email: string, password: string): boolean {
  const okEmail = (process.env.ADMIN_EMAIL ?? "admin@inkii.de").toLowerCase();
  const okPass = process.env.ADMIN_PASSWORD ?? "inkii2026";
  return email.trim().toLowerCase() === okEmail && password === okPass;
}
