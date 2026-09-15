import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue(), ui()],
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: {
    fs: {
      allow: [fileURLToPath(new URL('../../shared', import.meta.url))],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': fileURLToPath(new URL('../data/upper', import.meta.url)),
      '@shared': fileURLToPath(new URL('../../shared', import.meta.url)),
      '#components': fileURLToPath(new URL('../../shared/test/stubs/components.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['test/unit/**/*.test.ts', 'test/component/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/**/*.{ts,vue}',
        '../data/upper/**/*.ts',
        '!src/pages/**',
        '!src/app.vue',
        '!src/error.vue',
        '!src/assets/**',
        '!src/types/**',
        '!**/*.d.ts',
        // 纯类型模块（无运行时代码，v8 会报 0%）
        '!src/lib/labs/types.ts',
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
})
