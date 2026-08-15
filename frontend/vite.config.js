import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When running via `docker-compose up`, the frontend and backend are separate
// containers, so "localhost" from inside the frontend container would point
// to itself, not the backend service. Set VITE_BACKEND_URL=http://backend:8000
// in that environment (see docker-compose.yml); it defaults to localhost for
// plain `npm run dev` on the host machine.
const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
