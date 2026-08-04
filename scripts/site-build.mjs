/**
 * 单 Cloudflare Pages 项目聚合构建
 *
 * 把两个独立 Nuxt 应用（一年级 game/、五年级 g5/game/）静态导出到子路径，
 * 与门户页 portal/ 合并为 deploy/ 一个构建产物：
 *
 *   deploy/
 *   ├── index.html       门户（portal/）
 *   ├── style.css
 *   ├── g1/              一年级（BASE_URL=/g1/ nuxi generate）
 *   ├── g5/              五年级（BASE_URL=/g5/ nuxi generate）
 *   └── _redirects       SPA 兜底 + 子路径重写
 *
 * 用法：node scripts/site-build.mjs [--skip-install]
 * 环境变量：NODE_ENV、SKIP_INSTALL=1 可跳过两个子应用的 npm install（本地加速）
 */
import { execSync } from 'node:child_process'
import { existsSync, rmSync, mkdirSync, cpSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const APPS = [
  { dir: 'game', base: '/g1/', dist: 'dist/g1' },
  { dir: 'g5/game', base: '/g5/', dist: 'dist/g5' },
]
const OUT = join(root, 'deploy')
const SKIP_INSTALL = process.argv.includes('--skip-install') || process.env.SKIP_INSTALL === '1'

function run(cmd, cwd, env = {}) {
  console.log(`\n> [${cwd}] ${cmd}`)
  execSync(cmd, { cwd: join(root, cwd), stdio: 'inherit', env: { ...process.env, ...env } })
}

// 1. 清空输出目录
console.log(`\n=== 清空 ${OUT} ===`)
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

// 2. 两个应用：安装依赖（本地已装则跳过）→ 子路径静态导出
for (const app of APPS) {
  const appDir = join(root, app.dir)
  if (!SKIP_INSTALL && !existsSync(join(appDir, 'node_modules'))) {
    run('npm ci --no-audit --no-fund', app.dir)
  } else {
    console.log(`\n> [${app.dir}] 已存在 node_modules，跳过 npm install`)
  }
  run('npm run generate:site', app.dir, { BASE_URL: app.base })
  console.log(`\n> 复制 ${app.dist} → deploy${app.base}`)
  cpSync(join(root, app.dir, app.dist), join(OUT, app.base.slice(1, -1)), { recursive: true })
}

// 3. 门户页
console.log('\n=== 复制 portal/ → deploy/ ===')
cpSync(join(root, 'portal'), OUT, { recursive: true })

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
console.log(`  一年级: deploy/g1/ (${htmlCount(join(OUT, 'g1'))} 页)`)
console.log(`  五年级: deploy/g5/ (${htmlCount(join(OUT, 'g5'))} 页)`)
