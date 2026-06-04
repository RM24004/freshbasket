import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // ← permite acceso desde cualquier dispositivo en la red
    port: 5173,        // ← puerto por defecto de Vite
    strictPort: true,  // ← asegura que siempre use este puerto
    proxy: {
      "/api": {
        target: "http://192.168.1.60:8080", // ← tu backend
        changeOrigin: true,
        secure: false
      }
    }
  }
});
