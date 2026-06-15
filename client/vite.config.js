import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/** Must match QuickAI Express PORT (default 5001). Override with VITE_DEV_API_ORIGIN=http://127.0.0.1:PORT */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin =
    env.VITE_DEV_API_ORIGIN?.replace(/\/$/, "") || "http://127.0.0.1:5001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
        },
        "/uploads": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
