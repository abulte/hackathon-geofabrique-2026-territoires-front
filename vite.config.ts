import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/hackathon-geofabrique-2026-territoires-front/',
  css: {
    lightningcss: { errorRecovery: true },
  },
})
