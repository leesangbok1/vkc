import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    include: ['tests/**/*.{test,spec}.{js,ts,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})