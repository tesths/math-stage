/**
 * 单 Cloudflare Pages 项目聚合构建
 *
 * 把六个年级 Nuxt 应用（一年级 g1/game/、二至六年级 g2/game/ ... g6/game/）
 * 静态导出到子路径，与门户页 portal/ 合并为 deploy/ 一个构建产物：
 *
 *   deploy/
 *   ├── index.html       门户（portal/）
 *   ├── g1/              一年级（BASE_URL=/g1/ nuxi generate）
 *   ├── g2/              二年级（BASE_URL=/g2/ nuxi generate）
 *   ├── g3/              三年级（BASE_URL=/g3/ nuxi generate）
 *   ├── g4/              四年级（BASE_URL=/g4/ nuxi generate）
 *   ├── g5/              五年级（BASE_URL=/g5/ nuxi generate）
 *   ├── g6/              六年级（BASE_URL=/g6/ nuxi generate）
 *   └── _redirects       仅注释；真实页面全部预渲染
 *
 * 用法：node scripts/site-build.mjs [--skip-install]
 * 环境变量：SKIP_INSTALL=1 可跳过根 workspace npm ci（仅本地加速）
 *          SITE_BUILD_CONCURRENCY=2 可调整年级应用并发构建数
 */
import { spawn } from 'node:child_process'
import { existsSync, rmSync, mkdirSync, cpSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gradeApps, portalApp } from './app-registry.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// nuxi generate（Nuxt4 + cloudflare-pages preset）输出到 .output/public：
// 页面在根（index.html 即应用首页），资源链接带 BASE_URL 前缀（/g1/_nuxt/...）
const OUT = join(root, 'deploy')
const SKIP_INSTALL = process.argv.includes('--skip-install') || process.env.SKIP_INSTALL === '1'
const SITE_BUILD_CONCURRENCY = positiveInt(process.env.SITE_BUILD_CONCURRENCY, 2)
const proxyEnvKeys = ['http_proxy', 'HTTP_PROXY', 'https_proxy', 'HTTPS_PROXY', 'all_proxy', 'ALL_PROXY']

function positiveInt(value, fallback) {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

function mergedEnv(extra = {}) {
  return { ...process.env, ...extra }
}

function nuxtLocalEnv(extra = {}) {
  const env = mergedEnv(extra)
  for (const key of proxyEnvKeys) delete env[key]
  return env
}

function run(cmd, args, cwd = root, env = process.env) {
  console.log(`\n> [${cwd === root ? '.' : cwd.replace(`${root}/`, '')}] ${[cmd, ...args].join(' ')}`)
  return new Promise((resolveRun, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      env,
    })
    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) resolveRun()
      else reject(new Error(`${cmd} ${args.join(' ')} failed with ${signal ?? `exit ${code}`}`))
    })
  })
}

function runWorkspace(app, script, env = {}) {
  return run('npm', ['--workspace', app.workspace, 'run', script], root, nuxtLocalEnv(env))
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

// 1. 清空输出目录
console.log(`\n=== 清空 ${OUT} ===`)
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

async function installDeps() {
  if (SKIP_INSTALL) {
    console.log('\n> [.] --skip-install，跳过根 workspace npm ci')
    return
  }
  await run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'])
}

// 2. 根层安装依赖 → 六个年级应用并发子路径静态导出
// 注意：必须显式 NITRO_PRESET=static —— Cloudflare Pages 构建环境设 CF_PAGES=1 时，
// nitro 会自动改用 cloudflare-pages-static 预设（输出到 dist/<baseURL>/），
// 与本地 static 预设（输出 .output/public）不一致，会导致复制 ENOENT（部署事故记录）。
await installDeps()

async function buildGrade(app) {
  await runWorkspace(app, 'generate:site', { BASE_URL: app.base, NITRO_PRESET: 'static' })
  const target = join(OUT, app.base.slice(1, -1))
  console.log(`\n> 复制 ${app.dir}/${app.dist} → deploy${app.base}`)
  cpSync(join(root, app.dir, app.dist), target, { recursive: true })
}

console.log(`\n=== 构建年级应用（并发 ${SITE_BUILD_CONCURRENCY}） ===`)
await runPool(gradeApps, SITE_BUILD_CONCURRENCY, buildGrade)

// 3. 门户（Nuxt 应用，BASE_URL=/ 部署在根路径）
const portalDir = join(root, portalApp.dir)
await runWorkspace(portalApp, 'generate:site', { BASE_URL: '/', NITRO_PRESET: 'static' })
console.log('\n> 复制 portal/.output/public → deploy/')
cpSync(join(portalDir, portalApp.dist), OUT, { recursive: true })

// 4. 根级路由文件（所有真实页面均已预渲染，无需 SPA 200 重写 ——
//    历史教训：/g1/* → /g1/200.html 200 会抢在静态文件前命中目录请求，
//    被 Cloudflare clean URL 解析成 /g1/200 造成 308 循环）
console.log('\n=== 生成 _redirects / _headers ===')
writeFileSync(
  join(OUT, '_redirects'),
  [
    '# 子应用静态站：全部真实页面已预渲染，直接命中静态文件。',
    '# 未预渲染路径由各子应用自带的 404.html 兜底。',
    '',
  ].join('\n'),
)
writeFileSync(
  join(OUT, '_headers'),
  [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '',
  ].join('\n'),
)

// 5. 汇总
const htmlCount = (d) => {
  let n = 0
  const walk = (p) => {
    for (const e of existsSync(p) ? readdirSync(p, { withFileTypes: true }) : []) {
      if (e.isDirectory()) walk(join(p, e.name))
      else if (e.name.endsWith('.html')) n++
    }
  }
  walk(d)
  return n
}
console.log('\n=== 聚合完成 ===')
console.log(`deploy/ 共 ${htmlCount(OUT)} 个 HTML 页面`)
console.log(`  门户: deploy/index.html`)
for (const app of gradeApps) {
  const dir = app.base.slice(1, -1)
  console.log(`  ${app.label}: deploy/${dir}/ (${htmlCount(join(OUT, dir))} 页)`)
}
