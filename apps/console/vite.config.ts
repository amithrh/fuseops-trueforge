import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    strictPort: true,
    proxy: {
      "/trueforge": {
        target: process.env.TRUEFORGE_BASE_URL ?? "http://localhost:8790",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trueforge/, ""),
      },
    },
  },
});
