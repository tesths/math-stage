import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3100',
  },
  webServer: {
    // NITRO_PRESET 覆盖：本地 E2E 用 node-server 预设（部署仍是 cloudflare-pages）
    command: 'NITRO_PRESET=node-server npm run build && PORT=3100 node .output/server/index.mjs',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 180_000,
  },
})
