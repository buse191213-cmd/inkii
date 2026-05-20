// Sprach-Konfiguration. Reine Daten – auch im Client importierbar.

export const LOCALES = ["de", "en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_COOKIE = "inkii_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  tr: "TR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
