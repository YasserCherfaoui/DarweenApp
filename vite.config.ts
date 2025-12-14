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
      include: [
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-icons',
        '@radix-ui/react-label',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-tooltip',
      ],
    },
    build: {
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split node_modules into separate chunks
            if (id.includes('node_modules')) {
              // React and React DOM - must be first to avoid initialization issues
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor'
              }
              // TanStack libraries
              if (id.includes('@tanstack')) {
                return 'tanstack'
              }
              // Radix UI components - keep together but after React
              // Group all Radix UI packages together to avoid circular dependency issues
              if (id.includes('@radix-ui')) {
                return 'radix-ui'
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
          // Suppress circular dependency warnings for Radix UI
          if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('@radix-ui')) {
            return
          }
          warn(warning)
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})
