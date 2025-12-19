import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [
      react(),
      // Replace all hardcoded localhost:8000 with API_URL at build time
      {
        name: 'replace-api-url',
        transform(code, id) {
          if (id.includes('node_modules')) return null
          if (!id.endsWith('.jsx') && !id.endsWith('.js') && !id.endsWith('.ts') && !id.endsWith('.tsx')) return null

          // Replace all occurrences of hardcoded localhost URL
          let replaced = code
          // Handle simple strings
          replaced = replaced.replace(/'http:\/\/localhost:8000([^']*)'/g, `'${apiUrl}$1'`)
          replaced = replaced.replace(/"http:\/\/localhost:8000([^"]*)"/g, `"${apiUrl}$1"`)
          // Handle template literals (both with and without interpolation)
          replaced = replaced.replace(/`http:\/\/localhost:8000/g, `\`${apiUrl}`)

          if (replaced !== code) {
            return { code: replaced, map: null }
          }
          return null
        }
      }
    ],
    define: {
      __API_URL__: JSON.stringify(apiUrl)
    },
    build: {
      chunkSizeWarningLimit: 1000, // Increase warning limit slightly
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'],
            utils: ['date-fns', 'react-helmet-async', 'react-markdown']
          }
        }
      }
    }
  }
})
