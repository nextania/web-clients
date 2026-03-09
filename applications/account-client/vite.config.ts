import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    proxy: {
      "/api": {
        target: "https://account.nextania.com",
        changeOrigin: true,      
      }
    }
  }
});
