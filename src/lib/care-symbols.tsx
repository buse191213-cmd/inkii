/**
 * Wäschepflege-Symbole — international standardisiert.
 * Jedes Symbol als kompakte SVG-Komponente.
 */

import type { ReactElement } from "react";

export type CareSymbol = {
  key: string;
  label: { de: string; en: string; tr: string };
  svg: ReactElement;
  imgUrl?: string; // Alternatif: dış kaynaktan görsel URL (varsa SVG yerine kullanılır)
};

// Kompakte inline-SVG'ler (24x24, currentColor)
const W = 24;
const baseProps = {
  viewBox: `0 0 ${W} ${W}`,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// ---- Yıkama (tub) ikonları ----
function Tub({ children }: { children?: React.ReactNode }) {
  return (
    <svg {...baseProps}>
      <path d="M3 8 C3 6, 4 5, 6 5 L18 5 C20 5, 21 6, 21 8 L21 14 C21 17, 18 19, 12 19 C6 19, 3 17, 3 14 Z" />
      {children}
    </svg>
  );
}
function Iron({ children }: { children?: React.ReactNode }) {
  return (
    <svg {...baseProps}>
      <path d="M3 18 L21 18 L19 11 C18 9, 16 8, 14 8 L9 8 L4 12 Z" />
      {children}
    </svg>
  );
}
function Triangle({ children }: { children?: React.ReactNode }) {
  return (
    <svg {...baseProps}>
      <path d="M12 3 L21 20 L3 20 Z" />
      {children}
    </svg>
  );
}
function Square({ children }: { children?: React.ReactNode }) {
  return (
    <svg {...baseProps}>
      <rect x="3" y="3" width="18" height="18" />
      {children}
    </svg>
  );
}
function Circle({ children }: { children?: React.ReactNode }) {
  return (
    <svg {...baseProps}>
      <circle cx="12" cy="12" r="9" />
      {children}
    </svg>
  );
}
function Cross() {
  return (
    <>
      <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
    </>
  );
}

export const CARE_SYMBOLS: CareSymbol[] = [
  {
    key: "wash-30",
    label: { de: "30°C waschen", en: "Wash at 30°C", tr: "30°C yıka" },
    svg: <Tub><text x="12" y="15" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="600">30</text></Tub>,
  },
  {
    key: "wash-40",
    label: { de: "40°C waschen", en: "Wash at 40°C", tr: "40°C yıka" },
    svg: <Tub><text x="12" y="15" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="600">40</text></Tub>,
  },
  {
    key: "wash-60",
    label: { de: "60°C waschen", en: "Wash at 60°C", tr: "60°C yıka" },
    svg: <Tub><text x="12" y="15" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="600">60</text></Tub>,
  },
  {
    key: "wash-90",
    label: { de: "90°C waschen", en: "Wash at 90°C", tr: "90°C yıka" },
    svg: <Tub><text x="12" y="15" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="600">90</text></Tub>,
  },
  {
    key: "wash-hand",
    label: { de: "Handwäsche", en: "Hand wash", tr: "Elde yıka" },
    svg: <Tub><path d="M7 14 C9 17, 15 17, 17 14" /></Tub>,
  },
  {
    key: "no-wash",
    label: { de: "Nicht waschen", en: "Do not wash", tr: "Yıkanamaz" },
    svg: <Tub>{Cross()}</Tub>,
  },
  {
    key: "no-bleach",
    label: { de: "Nicht bleichen", en: "Do not bleach", tr: "Çamaşır suyu kullanma" },
    svg: <Triangle>{Cross()}</Triangle>,
  },
  {
    key: "bleach",
    label: { de: "Bleichen erlaubt", en: "Bleach allowed", tr: "Çamaşır suyuna uygun" },
    svg: <Triangle />,
  },
  {
    key: "iron-low",
    label: { de: "Niedrig bügeln (110°C)", en: "Iron low", tr: "Düşük ısıda ütüle" },
    svg: <Iron><circle cx="12" cy="13" r="1" fill="currentColor" /></Iron>,
    imgUrl: "https://images.nawajo.de/frontend/instructions/bg1.png",
  },
  {
    key: "iron-medium",
    label: { de: "Mittel bügeln (150°C)", en: "Iron medium", tr: "Orta ısıda ütüle" },
    svg: <Iron><circle cx="10" cy="13" r="1" fill="currentColor" /><circle cx="14" cy="13" r="1" fill="currentColor" /></Iron>,
  },
  {
    key: "iron-high",
    label: { de: "Heiß bügeln (200°C)", en: "Iron hot", tr: "Yüksek ısıda ütüle" },
    svg: <Iron><circle cx="8" cy="13" r="1" fill="currentColor" /><circle cx="12" cy="13" r="1" fill="currentColor" /><circle cx="16" cy="13" r="1" fill="currentColor" /></Iron>,
  },
  {
    key: "no-iron",
    label: { de: "Nicht bügeln", en: "Do not iron", tr: "Ütülenmez" },
    svg: <Iron>{Cross()}</Iron>,
  },
  {
    key: "dry-clean",
    label: { de: "Chemisch reinigen", en: "Dry clean", tr: "Kuru temizleme" },
    svg: <Circle />,
  },
  {
    key: "no-dry-clean",
    label: { de: "Nicht chemisch reinigen", en: "No dry cleaning", tr: "Kuru temizleme yapılmaz" },
    svg: <Circle>{Cross()}</Circle>,
  },
  {
    key: "tumble-low",
    label: { de: "Trockner niedrig", en: "Tumble dry low", tr: "Düşük ısıda kurutucu" },
    svg: <Square><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.8" fill="currentColor" /></Square>,
  },
  {
    key: "tumble-high",
    label: { de: "Trockner heiß", en: "Tumble dry high", tr: "Yüksek ısıda kurutucu" },
    svg: <Square><circle cx="12" cy="12" r="4" /><circle cx="10" cy="12" r="0.8" fill="currentColor" /><circle cx="14" cy="12" r="0.8" fill="currentColor" /></Square>,
  },
  {
    key: "no-tumble",
    label: { de: "Nicht im Trockner", en: "Do not tumble dry", tr: "Kurutucuya konulmaz" },
    svg: <Square><circle cx="12" cy="12" r="4" />{Cross()}</Square>,
  },
];

export function careLabel(key: string, locale: "de" | "en" | "tr" = "de"): string {
  const sym = CARE_SYMBOLS.find((s) => s.key === key);
  return sym?.label[locale] ?? key;
}

export function careSvg(key: string): ReactElement | null {
  const sym = CARE_SYMBOLS.find((s) => s.key === key);
  return sym?.svg ?? null;
}


export function careImgUrl(key: string): string | undefined {
  const sym = CARE_SYMBOLS.find((s) => s.key === key);
  return sym?.imgUrl;
}
