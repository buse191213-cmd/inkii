import { RawIcon } from "@/lib/icons";
import { getHomeImages } from "@/lib/home-images";
import type { Dictionary } from "@/dictionaries/types";

// Reihenfolge: Druck, Werbetechnik, Webdesign, Marketing
export const AREA_ICONS = [
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><path d="M6 17H4a2 2 0 01-2-2v-3a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 01-2 2h-2"/><rect x="6" y="13" width="12" height="8"/><path d="M16.5 12h.01"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="11" rx="1"/><path d="M7 9h10M7 12h6M12 15v6M8 21h8"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01"/></svg>',
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 001 1h2.5l5 4V6l-5 4H4a1 1 0 00-1 1z"/><path d="M16 9.5a4 4 0 010 5M19 7a8 8 0 010 10"/></svg>',
];

/** Die vier Geschäftsbereiche von INKII. Auf Startseite & Leistungen genutzt. */
export default async function AreasSection({ t }: { t: Dictionary["areas"] }) {
  const images = await getHomeImages();
  return (
    <section className="alt-bg">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">{t.kicker}</span>
          <h2 className="big">{t.title}</h2>
          <p>{t.text}</p>
        </div>
        <div className="areas-grid">
          {t.items.map((it, i) => {
            const img = images[`area-${i + 1}`];
            return (
              <a key={i} href="/bereiche" className="area-card reveal">
                <div
                  className="area-media"
                  style={img ? { backgroundImage: `url(${img})` } : undefined}
                >
                  {!img && (
                    <span className="area-ic">
                      <RawIcon svg={AREA_ICONS[i]} />
                    </span>
                  )}
                </div>
                <div className="area-body">
                  <h3>{it.name}</h3>
                  <p>{it.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
