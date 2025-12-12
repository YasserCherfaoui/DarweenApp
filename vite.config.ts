import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { federation } from '@module-federation/vite'
import { fileURLToPath, URL } from 'node:url'
import federationConfig from './module-federation.config'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
  ]

  // Only enable module federation in production or if explicitly needed
  // This helps avoid the virtual import issues in development
  if (mode === 'production' || process.env.ENABLE_MF === 'true') {
    plugins.push(federation(federationConfig))
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['@module-federation/vite'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split node_modules into separate chunks
            if (id.includes('node_modules')) {
              // TanStack libraries
              if (id.includes('@tanstack')) {
                return 'tanstack'
              }
              // Radix UI components
              if (id.includes('@radix-ui')) {
                return 'radix-ui'
              }
              // React and React DOM
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              // Other large vendor libraries
              if (id.includes('recharts')) {
                return 'recharts'
              }
              if (id.includes('@tiptap')) {
                return 'tiptap'
              }
              // Module federation
              if (id.includes('@module-federation')) {
                return 'module-federation'
              }
              // All other node_modules
              return 'vendor'
            }
          },
        },
        onwarn(warning, warn) {
          // Suppress eval warnings from module-federation
          if (warning.code === 'EVAL' && warning.id?.includes('@module-federation')) {
            return
          }
          warn(warning)
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
