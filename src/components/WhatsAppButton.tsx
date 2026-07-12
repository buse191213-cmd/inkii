"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Schwebender WhatsApp-Button unten rechts.
 * Verschwindet auf Admin- und Login-Seiten.
 * Erscheint mit kleinem Fade-in nach 800ms — keine Scroll-Aufdringlichkeit.
 */
export default function WhatsAppButton({
  phone,
  message,
  label,
}: {
  phone: string;
  message: string;
  label: string;
}) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Auf Admin- und Login-Seiten nicht anzeigen
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
    return null;
  }

  const cleanPhone = phone.replace(/[^\d+]/g, "");
  const href = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`wa-fab ${mounted ? "wa-fab-in" : ""}`}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.001 3.2C8.937 3.2 3.2 8.937 3.2 16.001c0 2.27.591 4.488 1.715 6.439L3.2 28.8l6.49-1.704a12.798 12.798 0 006.31 1.629h.005c7.063 0 12.801-5.738 12.801-12.802 0-3.42-1.331-6.635-3.748-9.052A12.722 12.722 0 0016.001 3.2zm.005 23.4h-.004a10.6 10.6 0 01-5.402-1.479l-.388-.231-4.024 1.056 1.075-3.928-.252-.402a10.626 10.626 0 01-1.627-5.617c0-5.876 4.782-10.659 10.66-10.659 2.845 0 5.519 1.109 7.531 3.121a10.587 10.587 0 013.122 7.541c0 5.877-4.78 10.598-10.691 10.598zm5.85-7.939c-.32-.16-1.893-.934-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.825 1.04-1.012 1.253-.187.214-.373.24-.693.08-.32-.16-1.351-.498-2.573-1.587-.951-.848-1.594-1.895-1.781-2.215-.187-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.187.213-.32.32-.534.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.987-2.373-.259-.624-.523-.539-.72-.549-.187-.009-.4-.011-.613-.011-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.666 0 1.573 1.147 3.094 1.307 3.307.16.214 2.254 3.441 5.46 4.825.763.33 1.358.527 1.822.674.766.244 1.463.21 2.014.127.614-.092 1.893-.774 2.16-1.521.266-.747.266-1.387.187-1.521-.08-.133-.293-.213-.613-.373z"
        />
      </svg>
    </a>
  );
}
