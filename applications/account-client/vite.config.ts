import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  envPrefix: "AS_",
  server: {
    proxy: {
      "/api": {
        target: "https://account.nextania.com",
        changeOrigin: true,      
      }
    }
  }
});
