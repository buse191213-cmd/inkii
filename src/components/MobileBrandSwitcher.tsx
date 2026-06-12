"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

/**
 * Sadece mobilde görünür, sağ altta WhatsApp butonunun üzerinde sabit (fixed).
 * Bulunulan markaya göre KARŞI markaya geçiş linkini gösterir:
 * - INKII WORKS sayfalarındaysak  → INKII MARKETING logosu
 * - INKII MARKETING sayfalarındaysak → INKII WORKS logosu
 */
export default function MobileBrandSwitcher({
  marketingLogo,
}: {
  marketingLogo?: string | null;
}) {
  const pathname = usePathname() || "/";
  const isMarketing =
    pathname.startsWith("/inkii-marketing") ||
    pathname === "/webdesign" ||
    pathname === "/marketing";

  // Karşı markaya yönlendirme
  const targetHref = isMarketing ? "/" : "/inkii-marketing";
  const targetLabel = isMarketing ? "INKII WORKS" : "INKII MARKETING";

  return (
    <Link
      href={targetHref}
      className="mobile-brand-switcher"
      aria-label={targetLabel}
      title={targetLabel}
    >
      {isMarketing ? (
        <Image src="/inkii-logo.png" alt={targetLabel} width={120} height={36} className="mbs-img" />
      ) : marketingLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={marketingLogo} alt={targetLabel} className="mbs-img" />
      ) : (
        <Image src="/inkii-logo.png" alt={targetLabel} width={120} height={36} className="mbs-img" />
      )}
    </Link>
  );
}
