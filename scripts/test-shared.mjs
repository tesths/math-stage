#!/usr/bin/env node
/**
 * 运行共享层（shared/）测试：复用 g5/game 的 vitest 依赖。
 * 共享层无独立 node_modules —— 运行时临时软链 g5/game/node_modules，
 * 跑完清理（避免提交 symlink 到仓库）。
 */
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sharedDir = join(root, 'shared')
const linkDir = join(sharedDir, 'node_modules')
const target = join(root, 'g5', 'game', 'node_modules')
const withCoverage = process.argv.includes('--coverage')

if (!existsSync(target)) {
  console.error(`未找到 ${target}，请先在 g5/game 执行 npm install`)
  process.exit(1)
}

// 临时软链（已存在则复用，结束后无论成功失败都清理）
const created = !existsSync(linkDir)
if (created) {
  mkdirSync(sharedDir, { recursive: true })
  symlinkSync(target, linkDir, 'dir')
}

let code = 1
try {
  const vitestBin = join(target, '.bin', 'vitest')
  const args = ['run']
  if (withCoverage) args.push('--coverage')
  const r = spawnSync(vitestBin, args, { cwd: sharedDir, stdio: 'inherit' })
  code = r.status ?? 1
} finally {
  rmSync(linkDir, { recursive: true, force: true })
}
process.exit(code)
