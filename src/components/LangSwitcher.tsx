"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_SHORT, type Locale } from "@/lib/i18n";
import { setLocale } from "@/lib/locale-action";

/** DE / EN / TR Umschalter. Speichert die Wahl als Cookie. */
export default function LangSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(loc: Locale) {
    if (loc === current || pending) return;
    startTransition(async () => {
      await setLocale(loc);
      router.refresh();
    });
  }

  return (
    <div className="lang-switch" translate="no">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          className={loc === current ? "active" : ""}
          aria-current={loc === current ? "true" : undefined}
          onClick={() => change(loc)}
          disabled={pending}
        >
          {LOCALE_SHORT[loc]}
        </button>
      ))}
    </div>
  );
}
