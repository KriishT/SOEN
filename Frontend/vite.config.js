import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    proxy: {
      "/cdn": {
        target: "http://unpkg.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, ""),
      },
    },
    fs: {
      strict: false, // Ensure Vite can access local files
    },
  },
  optimizeDeps: {
    exclude: ["@webcontainer/api"], // Prevent Vite from optimizing it incorrectly
  },
});
