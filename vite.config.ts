import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project site: https://sners03.github.io/mordoku-progress-tracker/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/mordoku-progress-tracker/' : '/',
  plugins: [react(), tailwindcss()],
}))
