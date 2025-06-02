import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Handle large geographic data files separately
          if (id.includes('DivisoesAdministrativasSP.json')) {
            return 'geographic-data'
          }
          if (id.includes('parcerias.json')) {
            return 'partnerships-data'
          }
          
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('leaflet')) {
              return 'leaflet'
            }
            if (id.includes('@turf')) {
              return 'turf'
            }
            return 'vendor'
          }
          
          // Map components
          if (id.includes('map-components')) {
            return 'map-components'
          }
        },
        // Separate large assets into their own chunks
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    // Set higher chunk size warning for geographic data (15MB to accommodate the 12MB GeoJSON)
    chunkSizeWarningLimit: 15000,
    // Optimize asset handling - smaller inline limit to reduce initial bundle
    assetsInlineLimit: 2048, // Inline assets smaller than 2KB
    // Enable compression
    minify: 'esbuild',
    target: 'esnext'
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['leaflet', 'vue']
  }
})
