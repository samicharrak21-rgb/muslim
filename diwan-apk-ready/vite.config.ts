import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-accordion",
            "@radix-ui/react-tabs",
          ],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: { overlay: false },
  },
});
