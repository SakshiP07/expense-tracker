// vite.config.js
// Vite config — tells Vite to use React plugin
// and run the dev server on port 5173

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})