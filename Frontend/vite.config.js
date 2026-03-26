import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '3be76859-1f5a-44e1-a112-028b4d181df6-00-3jo9lmq5zzq36.sisko.replit.dev',
      '.replit.dev' // Allow all Replit dev domains
    ],
    host: '0.0.0.0',
    port: 5173,
    strictPort: false
  }
})
