import path from "node:path";
import type { PrismaConfig } from "prisma";

// Konfiguration für Prisma 6+/7 — ersetzt den deprecated `prisma`-Key in
// package.json. Aktuell verwenden wir sie nur, um den Seed-Befehl zu definieren.
export default {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;
