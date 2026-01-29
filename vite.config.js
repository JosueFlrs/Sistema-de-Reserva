import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression' // <--- IMPORTAR

export default defineConfig({
  plugins: [
    react(),
    compression({ // <--- AGREGAR PLUGIN
      algorithm: 'brotliCompress', // O 'gzip' si prefieres
      ext: '.br',
      threshold: 10240 // Solo comprimir archivos mayores a 10kb
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'ui-map': ['maplibre-gl']
        }
      }
    }
  }
})