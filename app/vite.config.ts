import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { VitePluginRadar } from 'vite-plugin-radar'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePluginRadar({
      analytics: { id: 'G-YX26F6ZZHN' },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws': {
        target: 'ws://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
        ws: true,
      },
    },
    allowedHosts: true,
  },
})
