import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:3100',
  },
  webServer: {
    command: 'PORT=3100 node .output/server/index.mjs',
    port: 3100,
    reuseExistingServer: true,
  },
})
