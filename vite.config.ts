import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'render-blocking-entry',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          // Vite regenerates the entry tag during build. Preserve the opt-in
          // so Chromium can capture the first populated React view.
          return html.replace(
            '<script type="module" crossorigin src=',
            '<script type="module" blocking="render" crossorigin src=',
          )
        },
      },
    },
  ],
})

