#!/usr/bin/env node
/**
 * 全站链接审计：本地构建产物 deploy/ 与（可选）线上站点。
 *
 * 用法：
 *   node scripts/link-audit.mjs            # 审计 deploy/ 全部内部链接（含资源）
 *   node scripts/link-audit.mjs --live     # 产物审计 + 浏览器级爬取线上站点逐页核对
 *
 * --live 依赖 playwright-core（与 real-click-test.mjs 相同），线上请求间隔 200ms 防限流。
 * 退出码：0 = 全部通过；1 = 存在断链。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gradeApps, portalApp } from './app-registry.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const deployDir = join(root, 'deploy')
const LIVE = process.argv.includes('--live')
const LIVE_BASE = process.env.MATH_LIVE_BASE ?? 'https://math-stage.pages.dev'
const HOP_MS = 200

const EXTERNAL = /^(?:https?:)?\/\//i
const SKIP_SCHEME = /^(?:mailto:|tel:|javascript:|data:)/i

const all = { ok: 0, hop: 0, miss: [], missLive: [], error: [] }

function htmlFiles(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const stat = existsSync(full) ? statSync(full) : null
    if (stat?.isDirectory()) out.push(...htmlFiles(full))
    else if (name.endsWith('.html')) out.push(full)
  }
  return out
}

/** 解析 href → 相对 deploy 根的目标文件路径（带 slash 视作目录） */
function resolveTarget(href, fromFile) {
  if (EXTERNAL.test(href) || SKIP_SCHEME.test(href)) return null
  const clean = href.split(/[?#]/)[0]
  if (!clean) return null
  let path = clean
  if (path.startsWith('/')) {
    path = path.slice(1)
  } else {
    const from = dirname(fromFile.replace(deployDir, '')).replace(/^\/+/, '')
    const base = []
    for (const seg of from.split('/')) {
      if (!seg || seg === '.') continue
      if (seg === '..') base.pop()
      else base.push(seg)
    }
    const parts = []
    for (const seg of path.split('/')) {
      if (!seg || seg === '.') continue
      if (seg === '..') base.pop()
      else parts.push(seg)
    }
    path = [...base, ...parts].join('/')
  }
  return path
}

function targetExists(path) {
  const file = join(deployDir, path)
  if (existsSync(file)) return file
  if (path.endsWith('/')) {
    const idx = join(deployDir, path, 'index.html')
    if (existsSync(idx)) return idx
  } else {
    const idx = join(deployDir, path, 'index.html')
    if (existsSync(idx)) return idx
  }
  return null
}

function auditLocal() {
  const pages = htmlFiles(deployDir)
  for (const file of pages) {
    const html = readFileSync(file, 'utf8')
    const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((m) => m[1])
    const srcs = [...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1])
    for (const href of [...new Set([...hrefs, ...srcs])]) {
      const target = resolveTarget(href, file)
      if (!target) continue
      const hit = targetExists(target)
      if (hit) {
        all.ok++
        continue
      }
      if (!hit && !target.endsWith('/')) {
        const asDir = targetExists(target + '/')
        if (asDir) {
          all.hop++
          continue
        }
      }
      all.miss.push({ from: file.replace(deployDir + '/', ''), href })
    }
  }
  return pages.length
}

function localPageList() {
  return htmlFiles(deployDir)
    .map((f) => f.replace(deployDir, '').replace(/^\/+/, ''))
    .filter((p) => !/\/200\.html$/.test(p))
}

async function auditLive() {
  const playwrightCandidates = [
    join(root, 'node_modules/playwright-core/index.mjs'),
    join(root, 'g5/game/node_modules/playwright-core/index.mjs'),
  ]
  const pw = playwrightCandidates.find((c) => existsSync(c))
  if (!pw) throw new Error('未找到 playwright-core，请先 npm install')
  const { chromium } = await import(pathToFileURL(pw))
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const seen = new Set()
  const pages = localPageList()
  const seeds = [portalApp.base, ...gradeApps.map((g) => g.base)]
  for (const seed of seeds) {
    const url = LIVE_BASE + seed
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => null)
    if (!res || res.status() >= 400) all.missLive.push({ url, status: res?.status() ?? 'ERR' })
    else all.ok++
    const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.href))
    for (const l of [...new Set(links)]) {
      if (!l.startsWith(LIVE_BASE) || /_nuxt|\.(js|css|png|jpe?g|svg|woff2?|ico)(\?|$)/.test(l)) continue
      const path = '/' + l.replace(LIVE_BASE, '').replace(/^\/+/, '')
      seen.add(path)
    }
    await sleep(HOP_MS)
  }
  for (const rel of [...seen, ...pages.map((p) => '/' + p)]) {
    const url = LIVE_BASE + rel
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => null)
    if (!res || res.status() >= 400) all.missLive.push({ url, status: res?.status() ?? 'ERR' })
    else all.ok++
    await sleep(HOP_MS)
  }
  await browser.close()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

if (!existsSync(join(deployDir, 'index.html'))) {
  console.error(`未找到 ${deployDir}/index.html，请先运行 npm run build:site:local`)
  process.exit(1)
}

const pageCount = auditLocal()
if (LIVE) {
  console.log(`本地页面: ${pageCount}（含 404.html/200.html 等）`)
  console.log(`线上站点: ${LIVE_BASE}（请求间隔 ${HOP_MS}ms）`)
  await auditLive()
}

console.log('\n================ 链接审计结果 =================')
const fail = all.miss.length + all.missLive.length
const uniqueMiss = [...new Set(all.miss.map((m) => `${m.from} -> ${m.href}`))]
const uniqueLive = [...new Set(all.missLive.map((m) => `${m.status} ${m.url}`))]
if (uniqueMiss.length) {
  console.log(`\n❌ 本地断链 ${uniqueMiss.length} 项:`)
  for (const m of uniqueMiss) console.log(`   ${m}`)
}
if (uniqueLive.length) {
  console.log(`\n❌ 线上校验失败 ${uniqueLive.length} 项:`)
  for (const m of uniqueLive) console.log(`   ${m}`)
}
if (fail === 0) console.log('\n✅ 无断链')
console.log(`\n验证链接总数: ${all.ok + all.hop}（其中需一次尾斜杠跳转 ${all.hop} 条；以 / 结尾的目录链接按 index.html 校验）`)
if (uniqueMiss.length) console.log('提示: 检查上方“miss”条目对应页面中的 href（可能指向不存在页面或资源）')
process.exitCode = fail > 0 ? 1 : 0