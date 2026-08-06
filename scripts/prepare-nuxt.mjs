#!/usr/bin/env node
/**
 * Prepare Nuxt generated types for every app from the single root dependency tree.
 * Npm install may use proxy variables, but Nuxt/Undici rejects socks proxy values;
 * local prepare/build commands do not need network, so proxy variables are stripped.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gradeApps, portalApp } from './app-registry.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const nuxiBin = join(root, 'node_modules', '.bin', 'nuxi')
const apps = [...gradeApps, portalApp]
const concurrency = positiveInt(process.env.NUXT_PREPARE_CONCURRENCY, 2)
const proxyEnvKeys = ['http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']

if (!existsSync(nuxiBin)) {
  console.error('未找到 node_modules/.bin/nuxi，请先在仓库根目录执行 npm install 或 npm ci')
  process.exit(1)
}

function positiveInt(value, fallback) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function nuxtLocalEnv(extra = {}) {
  const env = { ...process.env, ...extra }
  for (const key of proxyEnvKeys) delete env[key]
  return env
}

function runPrepare(app) {
  const cwd = join(root, app.dir)
  console.log(`\n> [${app.dir}] nuxi prepare`)
  return new Promise((resolveRun, reject) => {
    const child = spawn(nuxiBin, ['prepare'], { cwd, stdio: 'inherit', env: nuxtLocalEnv() })
    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) resolveRun()
      else reject(new Error(`${app.dir} nuxi prepare failed with ${signal ?? `exit ${code}`}`))
    })
  })
}

async function runPool(items, limit, worker) {
  const running = new Set()
  for (const item of items) {
    const task = Promise.resolve().then(() => worker(item)).finally(() => running.delete(task))
    running.add(task)
    if (running.size >= limit) await Promise.race(running)
  }
  await Promise.all(running)
}

console.log(`=== Nuxt prepare（并发 ${concurrency}） ===`)
await runPool(apps, concurrency, runPrepare)
