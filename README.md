# INKII — Next.js + TypeScript + Prisma

Professionelle Web-Plattform für Textilveredelung & Werbemittel mit
öffentlichem Produktkatalog und passwortgeschütztem Admin-Panel.

## Tech-Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **React 19**
- **TypeScript 5**
- **Prisma 6** mit **SQLite** (kein DB-Server nötig — sofort lauffähig)

## Schnellstart

Voraussetzung: **Node.js 18.18+** installiert.

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Datenbank anlegen + mit Beispieldaten füllen
npm run setup

# 3. Entwicklungsserver starten
npm run dev
```

Danach:

- Öffentliche Seite: http://localhost:3000
- Admin-Panel:       http://localhost:3000/admin

## Admin-Zugang (Demo)

In `.env` hinterlegt:

- E-Mail:    `admin@vestra.de`
- Passwort:  `vestra2026`

> In Produktion bitte `.env` anpassen und ein echtes Auth-System
> (z. B. NextAuth/Auth.js) einsetzen.

## Was kann das Admin-Panel?

- **Produkte** — anlegen, bearbeiten, löschen; Bild-Upload (bis zu 5 Bilder
  pro Produkt), das Vitrinen-/Hauptbild ist frei wählbar; alles in der Datenbank
- **Produktdetailseite** — jeder Katalogartikel hat eine eigene Seite mit
  Bildergalerie, Daten und Anfrage-Button
- **Anfragen** — Kontaktanfragen einsehen und Status setzen
- **Kategorien** — Kategorien verwalten
- **Dashboard** — Kennzahlen auf einen Blick

Alle Produkte werden in der Datenbank gespeichert und erscheinen
automatisch im öffentlichen Werbemittel-Katalog. Es gibt (bewusst)
noch keinen Verkauf/Checkout — die Produkte werden nur präsentiert.

## Projektstruktur

```
prisma/
  schema.prisma      Datenbankmodell (Category, Product, Inquiry)
  seed.ts            Beispieldaten
src/
  app/
    page.tsx         Startseite
    werbemittel/     Produktkatalog (liest aus der DB)
    veredelung/ leistungen/ nachhaltigkeit/ ueber-uns/ kontakt/
    admin/
      login/         Anmeldung
      (panel)/       Dashboard, Produkte, Anfragen, Kategorien, Einstellungen
    admin/actions.ts Server Actions (CRUD)
  components/        Header, Footer, Katalog-Client
  lib/               DB-Client, Auth, Icons, Formatierung
  middleware.ts      Schützt /admin
```

## Auf PostgreSQL umstellen (Produktion)

1. In `prisma/schema.prisma` `provider = "sqlite"` → `"postgresql"`.
2. In `.env` `DATABASE_URL` auf die Postgres-Verbindung setzen.
3. `npx prisma migrate dev` ausführen.
