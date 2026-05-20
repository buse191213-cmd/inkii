"use client";

import { useEffect, useRef } from "react";
import { ICONS } from "@/lib/icons";

/** Schwebende Produktsymbole im Hintergrund. */
const FLOATIES: { icon: string; style: React.CSSProperties }[] = [
  { icon: "bottle",   style: { top: "12%", left: "56%", width: 56, height: 56, animationDuration: "19s", animationDelay: "-2s" } },
  { icon: "umbrella", style: { top: "24%", left: "67%", width: 50, height: 50, animationDuration: "27s", animationDelay: "-11s" } },
  { icon: "pen",      style: { top: "33%", left: "74%", width: 46, height: 46, animationDuration: "23s", animationDelay: "-9s" } },
  { icon: "bag",      style: { top: "9%",  left: "86%", width: 52, height: 52, animationDuration: "17s", animationDelay: "-5s" } },
  { icon: "mug",      style: { top: "55%", left: "61%", width: 44, height: 44, animationDuration: "21s", animationDelay: "-13s" } },
  { icon: "box",      style: { top: "61%", left: "82%", width: 58, height: 58, animationDuration: "26s", animationDelay: "-7s" } },
  { icon: "charger",  style: { top: "41%", left: "92%", width: 46, height: 46, animationDuration: "20s", animationDelay: "-15s" } },
  { icon: "key",      style: { top: "73%", left: "71%", width: 40, height: 40, animationDuration: "24s", animationDelay: "-3s" } },
];

/**
 * Animierter Hero-Hintergrund.
 * Läuft sofort beim Laden der Seite. Wird durch ein echtes Video ersetzt,
 * sobald im Admin-Panel (Einstellungen) ein Hero-Video hochgeladen wurde.
 */
export default function HeroMedia({ videoSrc }: { videoSrc?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // für Autoplay erforderlich
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, [videoSrc]);

  return (
    <div className="hero-media" aria-hidden="true">
      {/* Weiche, driftende Farbverläufe */}
      <div className="hero-aurora">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>

      {/* Schwebende Produktsymbole */}
      <div className="hero-floaties">
        {FLOATIES.map((f, i) => (
          <span
            key={i}
            className="floatie"
            style={f.style}
            dangerouslySetInnerHTML={{ __html: ICONS[f.icon] ?? ICONS.box }}
          />
        ))}
      </div>

      {/* Hochgeladenes Hero-Video (über Admin → Einstellungen) */}
      {videoSrc && (
        <video
          ref={videoRef}
          className="hero-video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}

      {/* Aufheller, damit der Text immer gut lesbar bleibt */}
      <div className="hero-scrim" />
    </div>
  );
}
