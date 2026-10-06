#!/usr/bin/env node
/**
 * 可视化截图回归工具。
 *
 * 用法：
 *   node scripts/visual-shots.mjs --base http://localhost:3105 --grade g5 --out docs/visual-review-screenshots/g5 \
 *     g5-c3-area-parallelogram g5-c3-area-trapezoid
 *   或只给 --grade 与 --all-labs 截取该年级全部 Lab。
 *
 * 每个 Lab 截两张：初始态（`<id>.png`）与「操作一次」后的过程态（`<id>-act.png`，
 * 会依次点击页面里第一个「剪/拼/拼一拼/数一数/旋转/抛/抽」类按钮），用于验证过程态不是只有文字。
 * 页面控制台报错会写进 `<id>.notes.txt`，便于发现 SVG 属性报错这类真实渲染问题。
 */
import { chromium } from 'playwright'
import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
function arg(name, fallback = undefined) {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : fallback
}
const base = (arg('base') ?? 'http://localhost:3105').replace(/\/$/, '')
const grade = arg('grade') ?? 'g5'
const outDir = path.resolve(arg('out', `docs/visual-review-screenshots/${grade}`))
const allLabs = args.includes('--all-labs')
const ids = args.filter((a) => !a.startsWith('--') && !isArgValue(a))

function isArgValue(token) {
  const flags = ['--base', '--grade', '--out']
  const idx = args.indexOf(token)
  return idx > 0 && flags.includes(args[idx - 1])
}

/** 从年级数据文件里读出全部 Lab id（避免依赖应用运行时） */
async function labIdsFromData() {
  const chaptersDir = path.resolve(`${grade}/data/upper/chapters`)
  const files = (await readdir(chaptersDir)).filter((f) => f.endsWith('.ts'))
  const found = []
  for (const f of files) {
    const text = await import('node:fs').then((fs) => fs.readFileSync(path.join(chaptersDir, f), 'utf8'))
    // 只取例题/练习题 Lab（g1-xxx…g6-xxx），不要 meta.ts 里的单元 id
    for (const m of text.matchAll(/id:\s*'(g\d-[^']+)'/g)) found.push(m[1])
  }
  return found
}

const ACTION_TEXTS = [
  '剪一剪',
  '拼一拼',
  '数一数',
  '数方格',
  '对折',
  '旋转',
  '抛',
  '抽',
  '摇',
  '试一试',
  '开始',
  '演示',
  '走近',
  '分割',
  '滚动',
  '滚',
  '展开',
  '补全',
  '转动',
  '摸',
]

async function shoot(page, id, suffix, clickAction) {
  const url = `${base}/labs/${id}/`
  const errors = []
  const onConsole = (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  const onPageError = (err) => errors.push(String(err))
  page.on('console', onConsole)
  page.on('pageerror', onPageError)
  // 不用 networkidle：Nuxt dev 会保持 HMR 连接，networkidle 常常等不到，
  // 一旦超时每个页面白等 30 秒（第 6 轮实测：commit 仅 20ms，button 却等了 30005ms）。
  // 改为等「页面已经渲染出内容」——Lab 卡片或任意按钮出现即可。
  const response = await page.goto(url, { waitUntil: 'commit' }).catch(() => null)
  const status = response?.status() ?? 0
  // 注意用 state: 'attached'：默认的 'visible' 会一直等「第一个 button 可见」，
  // 而 Nuxt UI 在 DOM 里前置了一些不可见的 button（配色切换等），
  // 于是每个页面白等满 15~30 秒（第 6/7 轮实测 ready 从 30s 降到 60~110ms）。
  await page.waitForSelector('.lab-card, button', { state: 'attached', timeout: 15000 }).catch(() => {})
  await page.waitForFunction(() => document.body.innerText.trim().length > 40, { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(400)
  if (clickAction) {
    let clicked = false
    for (const t of ACTION_TEXTS) {
      const btn = page.locator(`button:has-text("${t}")`).first()
      if ((await btn.count()) > 0) {
        try {
          await btn.click({ timeout: 2500 })
          // 过程态动画约 1.6s（转盘/滚圆等），等它跑完再截
          await page.waitForTimeout(2000)
          clicked = true
          if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 点击「${t}」`)
        } catch (err) {
          if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 点击「${t}」失败：${String(err).slice(0, 80)}`)
        }
        break
      }
    }
    // 没找到操作按钮时明确提示，避免"过程态截图其实还是初始态"这种静默失败
    if (!clicked && process.env.SHOT_DEBUG) console.log(`  [act] ${id} 未找到可点击的操作按钮（截图为初始态）`)
  }
  const file = path.join(outDir, `${id}${suffix}.png`)
  await page.screenshot({ path: file, fullPage: true })

  // 页面自身是否渲染成功：HTTP 状态、是否出现错误页、main 是否为空。
  // 只统计 console/pageerror 是不够的——客户端 hydration 抛错时 Nuxt 会换成
  // 「500 Internal Server Error」错误页且不打印 console 错误（第 28 轮实测到）。
  let shell = { status, hasMain: false, mainLen: 0, text: '' }
  try {
    shell = await page.evaluate(() => {
      const main = document.querySelector('main')
      const body = (document.body.innerText || '').trim()
      return {
        hasMain: !!main,
        mainLen: main ? (main.textContent || '').trim().length : 0,
        text: body.slice(0, 120).replace(/\s+/g, ' '),
      }
    })
    shell.status = status
  } catch {
    /* 页面已崩（例如 about:blank），保持默认值 */
  }

  page.off('console', onConsole)
  page.off('pageerror', onPageError)

  const problems = []
  if (status >= 400) problems.push(`HTTP ${status}`)
  if (/internal server error|invalid array length|500/i.test(shell.text) && !shell.hasMain) {
    problems.push(`错误页：${shell.text.slice(0, 60)}`)
  }
  if (!shell.hasMain || shell.mainLen < 20) problems.push(`main 内容为空（${shell.mainLen} 字符）`)
  // WebGL 性能提示不算错误
  const real = errors.filter((e) => !/GL Driver Message|GPU stall/.test(e))
  problems.push(...real)

  if (problems.length) {
    await writeFile(
      path.join(outDir, `${id}${suffix}.notes.txt`),
      `URL: ${url}\n${problems.join('\n')}\n`,
      'utf8',
    )
  }
  return { file, errors: real, problems }
}

const list = allLabs ? await labIdsFromData() : ids
if (!existsSync(outDir)) await mkdir(outDir, { recursive: true })

/**
 * 预热所有路由。
 *
 * Nuxt/Vite 的 dev server 是「按路由现场编译」的：冷启动后第一次访问某个 Lab，
 * 光编译就要 30~150 秒，全量 47 个 Lab 会跑到半小时以上（第 5 轮实测）。
 * 这里先用并发 HTTP 请求把所有路由的编译触发一遍（并发让 Vite 并行转译），
 * 之后再截图，单页加载就回落到几百毫秒。
 */
async function prewarm(ids, concurrency = 6) {
  let cursor = 0
  let done = 0
  const t0 = Date.now()
  const worker = async () => {
    while (cursor < ids.length) {
      const id = ids[cursor++]
      try {
        await fetch(`${base}/labs/${id}/`)
      } catch {
        /* 预热失败不影响后续截图（截图时会再报错） */
      }
      done++
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker))
  if (process.env.SHOT_DEBUG) {
    console.log(`[prewarm] ${done} 个路由，用时 ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  }
}

await prewarm(list)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })
let bad = 0
const badIds = []
for (const id of list) {
  const a = await shoot(page, id, '', false)
  const act = await shoot(page, id, '-act', true)
  const failed = [...a.problems, ...act.problems]
  if (failed.length) {
    bad++
    badIds.push(id)
    console.log(`❌ ${id} → ${failed.slice(0, 2).join(' | ')}`)
  } else {
    console.log(`${id} → ${path.relative(process.cwd(), a.file)}`)
  }
}
await browser.close()
console.log(`\n共 ${list.length} 个 Lab，${bad} 个页面有问题（控制台报错 / 错误页 / main 为空）`)
if (badIds.length) {
  console.log(`问题页面：${badIds.join(', ')}`)
  process.exitCode = 1
}
