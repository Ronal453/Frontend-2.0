import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: false,
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 48 * 60 * 60 // 48 horas
              }
            }
          },
          {
            urlPattern: /\/api\/(tareas|lotes|mermas|zonas)/i,
            handler: 'NetworkOnly',
            method: 'POST',
            options: {
              backgroundSync: {
                name: 'operaciones-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 horas
                }
              }
            }
          },
          {
            urlPattern: /\/api\/(tareas|lotes|mermas|zonas)/i,
            handler: 'NetworkOnly',
            method: 'PUT',
            options: {
              backgroundSync: {
                name: 'operaciones-queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          },
          {
            urlPattern: /\/api\/(tareas|lotes|mermas|zonas)/i,
            handler: 'NetworkOnly',
            method: 'PATCH',
            options: {
              backgroundSync: {
                name: 'operaciones-queue',
                options: {
                  maxRetentionTime: 24 * 60
                }
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})