import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ทุก request ที่ขึ้นต้นด้วย /api จะถูก forward ไป Express ที่ port 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // output สำหรับ production (server.js จะ serve จาก client/dist)
  },
})
