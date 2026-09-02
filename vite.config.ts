import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import widget from '@widget-js/vite-plugin-widget'
import { defineConfig } from 'vite'

export default defineConfig((config) => {
  const offline = config.mode == 'offline'
  const base = offline ? './' : '/stock'
  return {
    base,
    plugins: [
      tailwindcss(),
      react(),
      widget({
        zipName: 'stock',
        generateZip: offline,
      }) as any,
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
