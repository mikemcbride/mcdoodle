import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    cloudflare(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      external: (id) => {
        // Don't bundle node:crypto - it's available in Cloudflare Workers
        if (id === 'node:crypto') return true;
        return false;
      },
    },
    commonjsOptions: {
      include: [/db/, /node_modules/],
    },
  },
})
