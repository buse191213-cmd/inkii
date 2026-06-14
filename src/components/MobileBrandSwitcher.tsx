"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Sadece ANA SAYFALARDA (/ ve /inkii-marketing) görünür.
 * Sol alt köşede sabit (fixed) — WhatsApp butonunun KARŞISINDA.
 * Karşı markaya geçiş linki — BEYAZ logo, çerçevesiz.
 */
export default function MobileBrandSwitcher({
  marketingLogo,
}: {
  marketingLogo?: string | null;
}) {
  const pathname = usePathname() || "/";
  // Sadece ana sayfalarda göster
  const isHomePage = pathname === "/" || pathname === "/inkii-marketing";
  if (!isHomePage) return null;

  const isMarketing = pathname === "/inkii-marketing";

  // Karşı markaya yönlendirme
  const targetHref = isMarketing ? "/" : "/inkii-marketing";
  const targetLabel = isMarketing ? "INKII WORKS" : "INKII MARKETING";

  return (
    <Link
      href={targetHref}
      className="home-brand-switcher"
      aria-label={targetLabel}
      title={targetLabel}
    >
      {isMarketing ? (
        <Image src="/inkii-logo.png" alt={targetLabel} width={160} height={48} className="mbs-img" />
      ) : marketingLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={marketingLogo} alt={targetLabel} className="mbs-img" />
      ) : (
        <Image src="/inkii-logo.png" alt={targetLabel} width={160} height={48} className="mbs-img" />
      )}
    </Link>
  );
}
