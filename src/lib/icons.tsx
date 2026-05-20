// Einfache, eigene SVG-Produktillustrationen (Platzhalter).
// Später durch echte Produktfotos ersetzbar.

export const ICONS: Record<string, string> = {
  box: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M60 18 26 36v48l34 18 34-18V36z"/><path d="M26 36l34 18 34-18M60 54v48"/></svg>',
  power: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><rect x="32" y="26" width="56" height="68"/><path d="M50 44h20M50 56h20"/><circle cx="60" cy="78" r="6"/></svg>',
  charger: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><rect x="28" y="30" width="64" height="44"/><circle cx="60" cy="52" r="13"/><path d="M48 86h24M54 74v12M66 74v12"/></svg>',
  usb: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><rect x="40" y="44" width="40" height="56"/><rect x="48" y="24" width="24" height="20"/><path d="M52 60h16M52 72h16"/></svg>',
  bottle: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M50 14h20v10l6 10v60q0 8-8 8H52q-8 0-8-8V34l6-10z"/><path d="M44 50h32"/><path d="M52 14v-6h16v6"/></svg>',
  mug: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M34 36h44l-5 58H39z"/><path d="M78 46q22 0 22 18t-22 16"/></svg>',
  pen: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M30 96l-6-18 56-56 18 6-56 56z"/><path d="M76 28l12 12"/></svg>',
  note: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><rect x="28" y="20" width="58" height="80"/><path d="M40 20v80"/><path d="M52 42h22M52 56h22"/></svg>',
  bag: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M30 44h60l8 56H22z"/><path d="M44 44q0-22 16-22t16 22"/></svg>',
  umbrella: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M14 58q4-40 46-40t46 40q-14-12-23 0-9-12-23 0-14-12-23 0-9-12-23 0z"/><path d="M60 58v40q0 10-12 10"/></svg>',
  key: '<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><circle cx="44" cy="48" r="20"/><path d="M58 62l34 34M80 84l10-10"/></svg>',
};

export const ICON_NAMES = Object.keys(ICONS);

export function ProductIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={className}
      style={{ display: "inline-flex", color: "#2f7a47" }}
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? ICONS.box }}
    />
  );
}

/** Generisches Inline-SVG aus einem Markup-String (für Dekor-Icons). */
export function RawIcon({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
