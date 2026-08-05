/**
 * 单 Cloudflare Pages 项目聚合构建
 *
 * 把五个年级 Nuxt 应用（一年级 game/、二年级 g2/game/、三年级 g3/game/、五年级 g5/game/、六年级 g6/game/）
 * 静态导出到子路径，与门户页 portal/ 合并为 deploy/ 一个构建产物：
 *
 *   deploy/
 *   ├── index.html       门户（portal/）
 *   ├── g1/              一年级（BASE_URL=/g1/ nuxi generate）
 *   ├── g2/              二年级（BASE_URL=/g2/ nuxi generate）
 *   ├── g3/              三年级（BASE_URL=/g3/ nuxi generate）
 *   ├── g5/              五年级（BASE_URL=/g5/ nuxi generate）
 *   ├── g6/              六年级（BASE_URL=/g6/ nuxi generate）
 *   └── _redirects       仅注释；真实页面全部预渲染
 *
 * 用法：node scripts/site-build.mjs [--skip-install]
 * 环境变量：SKIP_INSTALL=1 可跳过六个应用的 npm ci（仅本地加速）
 */
import { execSync } from 'node:child_process'
import { existsSync, rmSync, mkdirSync, cpSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// nuxi generate（Nuxt4 + cloudflare-pages preset）输出到 .output/public：
// 页面在根（index.html 即应用首页），资源链接带 BASE_URL 前缀（/g1/_nuxt/...）
const APPS = [
  { dir: 'game', base: '/g1/', dist: '.output/public' },
  { dir: 'g2/game', base: '/g2/', dist: '.output/public' },
  { dir: 'g3/game', base: '/g3/', dist: '.output/public' },
  { dir: 'g4/game', base: '/g4/', dist: '.output/public' },
  { dir: 'g5/game', base: '/g5/', dist: '.output/public' },
  { dir: 'g6/game', base: '/g6/', dist: '.output/public' },
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

function installDeps(dir) {
  if (SKIP_INSTALL) {
    console.log(`\n> [${dir}] --skip-install，跳过 npm ci`)
    return
  }
  run('npm ci --no-audit --no-fund', dir)
}

// 2. 五个年级应用：安装依赖 → 子路径静态导出
for (const app of APPS) {
  installDeps(app.dir)
  run('npm run generate:site', app.dir, { BASE_URL: app.base })
  console.log(`\n> 复制 ${app.dist} → deploy${app.base}`)
  cpSync(join(root, app.dir, app.dist), join(OUT, app.base.slice(1, -1)), { recursive: true })
}

// 3. 门户（Nuxt 应用，BASE_URL=/ 部署在根路径）
const portalDir = join(root, 'portal')
installDeps('portal')
run('npm run generate:site', 'portal', { BASE_URL: '/' })
console.log('\n> 复制 portal/.output/public → deploy/')
cpSync(join(portalDir, '.output/public'), OUT, { recursive: true })

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
console.log(`  二年级: deploy/g2/ (${htmlCount(join(OUT, 'g2'))} 页)`)
console.log(`  三年级: deploy/g3/ (${htmlCount(join(OUT, 'g3'))} 页)`)
console.log(`  四年级: deploy/g4/ (${htmlCount(join(OUT, 'g4'))} 页)`)
console.log(`  五年级: deploy/g5/ (${htmlCount(join(OUT, 'g5'))} 页)`)
console.log(`  六年级: deploy/g6/ (${htmlCount(join(OUT, 'g6'))} 页)`)
