"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_SHORT, type Locale } from "@/lib/i18n";
import { setLocale } from "@/lib/locale-action";

const FLAGS: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  tr: "🇹🇷",
};

const LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

/** Sprachwechsler als Dropdown mit Flaggen. */
export default function LangSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function change(loc: Locale) {
    setOpen(false);
    if (loc === current || pending) return;
    startTransition(async () => {
      await setLocale(loc);
      router.refresh();
    });
  }

  return (
    <div className="lang-dd" translate="no" ref={ref}>
      <button
        type="button"
        className="lang-dd-trigger"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-dd-flag">{FLAGS[current]}</span>
        <span className="lang-dd-code">{LOCALE_SHORT[current]}</span>
        <svg className={`lang-dd-arrow ${open ? "open" : ""}`} width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="lang-dd-menu" role="listbox">
          {LOCALES.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                role="option"
                aria-selected={loc === current}
                className={`lang-dd-item ${loc === current ? "active" : ""}`}
                onClick={() => change(loc)}
              >
                <span className="lang-dd-flag">{FLAGS[loc]}</span>
                <span className="lang-dd-label">{LABELS[loc]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
