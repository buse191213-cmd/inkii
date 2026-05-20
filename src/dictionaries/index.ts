import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "./types";
import de from "./de";
import en from "./en";
import tr from "./tr";

const dictionaries: Record<Locale, Dictionary> = { de, en, tr };

/** Liefert das Wörterbuch für eine Sprache. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
