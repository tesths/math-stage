import { fileURLToPath } from 'node:url'

/**
 * 共享层独立测试工程：纯 TS/CSS/runtime adapters，node 环境，覆盖率阈值 95%。
 * 由根目录 `npm run test:shared` 调用（复用根 workspace 的 vitest 二进制）。
 * 注意：不要 import 'vitest/config'（本目录无 node_modules，解析会失败），
 * vitest 接受普通配置对象。
 */
export default {
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['grades/**/*.ts', 'runtime/**/*.ts', 'theme/**/*.ts', 'utils/**/*.ts'],
      exclude: ['**/*.d.ts'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
}
