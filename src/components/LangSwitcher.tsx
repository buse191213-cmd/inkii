"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_SHORT, type Locale } from "@/lib/i18n";
import { setLocale } from "@/lib/locale-action";

const FLAGS: Record<Locale, React.ReactElement> = {
  de: (
    <svg viewBox="0 0 5 3" className="lang-dd-flag" aria-hidden="true">
      <rect width="5" height="1" y="0" fill="#000"/>
      <rect width="5" height="1" y="1" fill="#DD0000"/>
      <rect width="5" height="1" y="2" fill="#FFCE00"/>
    </svg>
  ),
  en: (
    <svg viewBox="0 0 60 30" className="lang-dd-flag" aria-hidden="true">
      <clipPath id="t"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath>
      <path d="M0,0v30h60v-30z" fill="#012169"/>
      <path d="M0,0 60,30M60,0 0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 60,30M60,0 0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0v30M0,15h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0v30M0,15h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  ),
  tr: (
    <svg viewBox="0 0 30 20" className="lang-dd-flag" aria-hidden="true">
      <rect width="30" height="20" fill="#E30A17"/>
      <circle cx="11" cy="10" r="4" fill="#fff"/>
      <circle cx="12" cy="10" r="3.2" fill="#E30A17"/>
      <polygon fill="#fff" points="16.5,10 14.3,10.715 14.3,8.285"/>
      <polygon fill="#fff" points="14.732,12.16 14.732,9.84 16.95,10.555 15.582,12.44"/>
      <polygon fill="#fff" points="14.732,7.84 14.732,10.16 16.95,9.445 15.582,7.56"/>
      <polygon fill="#fff" points="14.3,10.715 16.5,10 16.5,11.6 15.04,12.45"/>
      <polygon fill="#fff" points="14.3,9.285 16.5,10 16.5,8.4 15.04,7.55"/>
    </svg>
  ),
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
        {FLAGS[current]}
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
                {FLAGS[loc]}
                <span className="lang-dd-label">{LABELS[loc]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
