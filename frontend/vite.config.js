import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/ChattyApp/" : "/",
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/ws/v1': {
        target: 'ws://localhost:3300',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
