import Link from "next/link";

/**
 * Markalar arası geçiş - sağ alt köşede SABİT (fixed),
 * WhatsApp butonunun ÜSTÜNDE beyaz kart şeklinde.
 * Scroll yapılınca da görünür kalır.
 */
export default function HeroBrandSwitcher({
  marketingLogo: _unused,
  isMarketing = false,
}: {
  marketingLogo?: string | null;
  isMarketing?: boolean;
}) {
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
