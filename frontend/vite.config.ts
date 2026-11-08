/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}'],
      thresholds: { lines: 75, branches: 75, functions: 75, statements: 75 },
    },
  },
})
