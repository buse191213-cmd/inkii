"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Hero video'nun SOL ALT köşesinde — site navbarındaki sol logo ile hizalı.
 * Canvas pixel analizi: PNG'lerin sol transparant kenarlarını ölçer,
 * görsel olarak gerçek opak içeriği navbar logo'sunun başlangıcına eşitler.
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

  // WORKS sayfasında switcher MARKETING logosunu, MARKETING sayfasında WORKS logosunu gösterir
  const switcherSrc = isMarketing
    ? "/inkii-logo.png"
    : marketingLogo || "/inkii-logo.png";

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Canvas ile bir image'in sol transparant kenar oranını ölç (0-1)
    function measureLeftPadding(img: HTMLImageElement): Promise<number> {
      return new Promise((resolve) => {
        if (!img.complete || !img.naturalWidth) {
          img.addEventListener("load", () => measureLeftPadding(img).then(resolve), { once: true });
          return;
        }
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve(0);
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          // Sol kenardan tara, ilk opak piksel
          for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
              const i = (y * canvas.width + x) * 4;
              if (data[i + 3] > 30) return resolve(x / canvas.width);
            }
          }
        } catch { /* CORS, sessizce 0 dön */ }
        resolve(0);
      });
    }

    async function align() {
      const navLogoImg = document.querySelector<HTMLImageElement>(
        "header.site .logo img, header.site .logo > img"
      );
      const swImg = imgRef.current;
      if (!navLogoImg || !swImg) return;

      const [navRatio, swRatio] = await Promise.all([
        measureLeftPadding(navLogoImg),
        measureLeftPadding(swImg),
      ]);
      if (cancelled) return;

      // Switcher'ın render edilmiş genişliği (CSS ile zaten 118px civarı)
      const swDisplayW = swImg.getBoundingClientRect().width;
      const navDisplayW = navLogoImg.getBoundingClientRect().width;
      // Her birinin görsel başlangıç ofseti (pixel)
      const navLeftPx = navRatio * navDisplayW;
      const swLeftPx = swRatio * swDisplayW;
      // Switcher'a uygulanacak margin: nav logo'nun ofsetine eşitle
      const diff = Math.round(navLeftPx - swLeftPx);
      setOffsetPx(diff);
    }

    // Image yüklensin ve DOM oturssun diye bir tick bekle
    const t = setTimeout(align, 200);
    window.addEventListener("resize", align);
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("resize", align);
    };
  }, [switcherSrc]);

  return (
    <Link
      href={targetHref}
      className="home-brand-switcher"
      aria-label={targetLabel}
      title={targetLabel}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={switcherSrc}
        alt={targetLabel}
        crossOrigin="anonymous"
        className="mbs-img"
        style={{ marginLeft: `${offsetPx}px` }}
      />
    </Link>
  );
}
