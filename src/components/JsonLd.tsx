/**
 * Gibt strukturierte Daten (Schema.org) als JSON-LD-Script aus.
 * Suchmaschinen und KI-Assistenten lesen diesen Block, Besucher sehen ihn nicht.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // < wird escaped, damit kein </script> aus den Daten den Block beendet
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
