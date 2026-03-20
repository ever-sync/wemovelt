import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      manifest: false,
      injectRegister: null,
      registerType: "prompt",
      includeAssets: [
        "favicon.svg",
        "favicon.png",
        "logo-mark.svg",
        "logo-mark.png",
        "logo-mark-1024.png",
        "logo-lockup.svg",
        "icon-180.png",
        "icon-192.png",
        "icon-512.png",
        "og-image.png",
        "placeholder.svg",
        "125729.jpg",
        "manifest.json",
      ],
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-accordion",
            "@radix-ui/react-scroll-area",
          ],
          charts: ["recharts"],
          maps: ["leaflet", "@vis.gl/react-google-maps"],
          scanner: ["@yudiel/react-qr-scanner"],
          data: ["@supabase/supabase-js", "@tanstack/react-query", "date-fns"],
        },
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
}));
