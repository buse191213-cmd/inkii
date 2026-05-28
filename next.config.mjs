import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  // onnxruntime-web ist ein reines Browser-Paket (WASM/WebGPU).
  // Webpack soll es serverseitig NICHT bundeln — sonst Build-Fehler.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("onnxruntime-web", "@imgly/background-removal");
    }
    return config;
  },
};

export default nextConfig;
