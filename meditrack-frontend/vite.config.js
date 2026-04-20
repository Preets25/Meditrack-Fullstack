import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for Capacitor: build output must be relative paths
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    // Allow access from phone on same WiFi network
    host: true,
    port: 5173,
  }
})
