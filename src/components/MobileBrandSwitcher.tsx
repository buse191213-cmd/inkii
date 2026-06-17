"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Hero video'nun SOL ALT köşesinde — site navbarındaki sol logo ile hizalı.
 * Yeni hazırlanmış trim edilmiş logo dosyaları kullanılır:
 *   /public/inkii-works-logo.png
 *   /public/inkii-marketing-logo.png
 * Bu dosyalar mevcut değilse fallback /inkii-logo.png kullanılır.
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
  // Önce yeni trim edilmiş statik dosyaları dener, sonra eski custom upload, son fallback genel logo
  const [switcherSrc, setSwitcherSrc] = useState(
    isMarketing ? "/inkii-works-logo.png" : "/inkii-marketing-logo.png"
  );
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [offsetPx, setOffsetPx] = useState(0);

  useEffect(() => {
    let cancelled = false;

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

      const swDisplayW = swImg.getBoundingClientRect().width;
      const navDisplayW = navLogoImg.getBoundingClientRect().width;
      const navLeftPx = navRatio * navDisplayW;
      const swLeftPx = swRatio * swDisplayW;
      const diff = Math.round(navLeftPx - swLeftPx);
      setOffsetPx(diff);
    }

    const t = setTimeout(align, 200);
    window.addEventListener("resize", align);
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("resize", align);
    };
  }, [switcherSrc]);

  // Yeni trim edilmiş dosya yoksa fallback'e geç
  function handleError() {
    if (!isMarketing && marketingLogo) {
      // Marketing logosu admin'den yüklenmiş custom URL
      setSwitcherSrc(marketingLogo);
    } else {
      setSwitcherSrc("/inkii-logo.png");
    }
  }

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
        onError={handleError}
      />
    </Link>
  );
}
