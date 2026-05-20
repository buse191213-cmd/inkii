import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Korrigiert die Workspace-Root-Erkennung (mehrere lockfiles).
  outputFileTracingRoot: __dirname,
  experimental: {
    // Produkt-/Startseiten-Bilder laufen über Server Actions.
    // Große Dateien (Hero-Video) gehen per direktem Blob-Upload (/api/upload),
    // daher reicht hier ein moderates Limit.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
