import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { clinicDatabasePlugin } from './server/dbPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), clinicDatabasePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
})
