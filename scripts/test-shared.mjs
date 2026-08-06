#!/usr/bin/env node
/**
 * 运行共享层（shared/）测试。
 * workspace 化后优先使用根 node_modules；保留 g5/game/node_modules 兼容旧本地环境。
 */
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sharedDir = join(root, 'shared')
const withCoverage = process.argv.includes('--coverage')
const vitestBins = [
  join(root, 'node_modules', '.bin', 'vitest'),
  join(root, 'g5', 'game', 'node_modules', '.bin', 'vitest'),
]
const vitestBin = vitestBins.find((bin) => existsSync(bin))

if (!vitestBin) {
  console.error('未找到 vitest，请先在仓库根目录执行 npm install 或 npm ci')
  process.exit(1)
}

const args = ['run']
if (withCoverage) args.push('--coverage')
const r = spawnSync(vitestBin, args, { cwd: sharedDir, stdio: 'inherit' })
process.exit(r.status ?? 1)
