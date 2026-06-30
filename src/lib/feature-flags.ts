/** Feature-Flags: einfache An/Aus-Schalter für sichtbare Funktionen.
 *  Diese hier zentral pflegen — Komponenten lesen die Konstanten und
 *  rendern dann konditional. So lassen sich Preise später wieder
 *  einschalten, indem man `false` auf `true` setzt. */

export const SHOW_PRICES = true;
/** Mengenstaffel auf der Detailseite zeigen (Staffel-Preise pro Menge). */
export const SHOW_TIERS = true;
