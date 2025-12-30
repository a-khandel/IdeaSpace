import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import webSpatial from "@webspatial/vite-plugin";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/stream': {
        target: process.env.AGENT_API_ORIGIN || 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path, // keep /stream as-is
      },
      '^/webspatial/avp/stream': {
        target: process.env.AGENT_API_ORIGIN || 'http://localhost:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webspatial\/avp/, ''), // remove base path
      },
    },
  },
  plugins: [
    react(),
    webSpatial(),
    createHtmlPlugin({
      inject: {
        data: {
          XR_ENV: process.env.XR_ENV,
        },
      },
    }),
  ],
});
