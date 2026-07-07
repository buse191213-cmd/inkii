"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Global marka geçişi — WhatsApp butonunun üstünde SABİT sağ altta.
 * Tüm sayfalarda görünür. Pathname'e göre WORKS ↔ MARKETING geçişi.
 */
export default function GlobalBrandSwitcher() {
  const pathname = usePathname();

  // Marketing tarafında mıyız?
  const isMarketing = pathname?.startsWith("/inkii-marketing") ||
                     pathname?.startsWith("/webdesign") ||
                     pathname?.startsWith("/marketing");

  // Admin panel'de veya login/register akışında gösterme
  const isHidden = pathname?.startsWith("/admin") ||
                   pathname?.startsWith("/login") ||
                   pathname?.startsWith("/registrieren") ||
                   pathname?.startsWith("/verifizieren") ||
                   pathname?.startsWith("/kasse") ||
                   pathname?.startsWith("/konto");

  if (isHidden) return null;

  const targetHref = isMarketing ? "/" : "/inkii-marketing";
  const targetLabel = isMarketing ? "INKII WORKS" : "INKII MARKETING";

  // WORKS sayfasında MARKETING logosunu, MARKETING'de WORKS logosunu göster
  const switcherSrc = isMarketing
    ? "/inkii-works-logo.png"
    : "/inkii-marketing-logo.png";

  return (
    <Link
      href={targetHref}
      className="home-brand-switcher"
      aria-label={targetLabel}
      title={targetLabel}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={switcherSrc}
        alt={targetLabel}
        className="mbs-img"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/inkii-logo.png"; }}
      />
    </Link>
  );
}
