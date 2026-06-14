import Link from "next/link";
import Image from "next/image";

/**
 * Hero video'nun SOL ALT köşesinde absolute konumda.
 * Scroll yapıldığında video ile birlikte yukarı çıkar (kaybolur).
 * INKII WORKS sayfası → MARKETING linki, INKII MARKETING → WORKS linki.
 */
export default function HeroBrandSwitcher({
  marketingLogo,
  isMarketing = false,
}: {
  marketingLogo?: string | null;
  isMarketing?: boolean;
}) {
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
