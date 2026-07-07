"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Marka geçişi footer'da — logonun altında, minimal ve premium.
 * INKII Works sayfasındaysak → INKII Marketing'e yönlendirir.
 * INKII Marketing sayfasındaysak → INKII Works'e yönlendirir.
 */
export default function FooterBrandSwitch() {
  const pathname = usePathname();
  const isMarketing = pathname?.startsWith("/inkii-marketing") ||
                     pathname?.startsWith("/webdesign") ||
                     pathname?.startsWith("/marketing");

  const href = isMarketing ? "/" : "/inkii-marketing";
  const hint = isMarketing ? "Auch für Textilveredelung" : "Auch als digitale Agentur";
  const brand = isMarketing ? "Works" : "Marketing";

  return (
    <Link href={href} className="foot-brand-switch">
      <span className="fbs-line" aria-hidden></span>
      <span className="fbs-labels">
        <span className="fbs-hint">{hint}</span>
        <span className="fbs-name">
          INKII <em>{brand}</em>
          <span className="fbs-arrow" aria-hidden>→</span>
        </span>
      </span>
    </Link>
  );
}
