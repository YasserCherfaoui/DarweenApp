import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
  }
})
