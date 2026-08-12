import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const PROJECT_ROOT = import.meta.dirname;
const require = createRequire(import.meta.url);
const tesseractCoreRoot = path.dirname(require.resolve("tesseract.js-core/package.json"));
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : "/");

const ocrAssets: Record<string, string> = {
  "ocr/worker.min.js": path.join(PROJECT_ROOT, "node_modules/tesseract.js/dist/worker.min.js"),
  "ocr/tesseract-core-simd-lstm.wasm.js": path.join(tesseractCoreRoot, "tesseract-core-simd-lstm.wasm.js"),
  "ocr/tesseract-core-simd-lstm.wasm": path.join(tesseractCoreRoot, "tesseract-core-simd-lstm.wasm"),
  "tessdata/jpn.traineddata.gz": path.join(PROJECT_ROOT, "node_modules/@tesseract.js-data/jpn/4.0.0/jpn.traineddata.gz"),
  "tessdata/eng.traineddata.gz": path.join(PROJECT_ROOT, "node_modules/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz"),
};

function localOcrAssets(): Plugin {
  return {
    name: "local-ocr-assets",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split("?")[0]?.replace(/^\//, "") ?? "";
        const assetPath = ocrAssets[pathname];
        if (!assetPath) return next();
        if (!fs.existsSync(assetPath)) {
          response.statusCode = 404;
          response.end();
          return;
        }
        response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        response.setHeader("Content-Type", pathname.endsWith(".js") ? "application/javascript" : "application/octet-stream");
        fs.createReadStream(assetPath).pipe(response);
      });
    },
    generateBundle() {
      Object.entries(ocrAssets).forEach(([fileName, assetPath]) => {
        this.emitFile({ type: "asset", fileName, source: fs.readFileSync(assetPath) });
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    localOcrAssets(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "採血データ解析アシスタント",
        short_name: "採血解析",
        description: "端末内だけで動作する採血データ解析アシスタント",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#1e2a3a",
        theme_color: "#1e2a3a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{html,js,css,png,webmanifest,wasm,gz}"],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 40 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
    },
  },
  root: path.resolve(PROJECT_ROOT, "client"),
  publicDir: path.resolve(PROJECT_ROOT, "client", "public"),
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: { host: true, allowedHosts: [".manus.computer", ".manus-asia.computer", "localhost", "127.0.0.1"] },
});
