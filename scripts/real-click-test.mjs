#!/usr/bin/env node
/**
 * 真实浏览器点击验收（基于聚合构建产物 deploy/，模拟线上形态）
 *
 * 覆盖：门户 → 一年级（单元/例题答题/小游戏）→ 五年级（Lab 滑块/剪拼动画/训练游戏）
 *       → 顶栏跨年级切换 → 回门户；11 种一年级题型 + 11 个五年级 Lab + 移动端溢出检查。
 *
 * 用法：先 `npm run build:site:local`，再
 *   node scripts/real-click-test.mjs        # 自动起 deploy 静态服务（端口 4400）并运行
 *   node scripts/real-click-test.mjs --keep # 不自动起/停服务（复用已启动的 4400）
 *
 * 截图输出到 /tmp/math-shots/。优先使用根 workspace 的 playwright-core。
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gradeApps } from './app-registry.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4400
const BASE = `http://localhost:${PORT}`
const SHOT = '/tmp/math-shots'

const playwrightCandidates = [
  join(root, 'node_modules/playwright-core/index.mjs'),
  join(root, 'g5/game/node_modules/playwright-core/index.mjs'),
]
const playwrightCore = playwrightCandidates.find((candidate) => existsSync(candidate))
if (!playwrightCore) {
  console.error('未找到 playwright-core，请先在仓库根目录执行 npm install 或 npm ci')
  process.exit(1)
}
const { chromium } = await import(pathToFileURL(playwrightCore))

const deployDir = join(root, 'deploy')
if (!existsSync(join(deployDir, 'index.html'))) {
  console.error(`未找到 ${deployDir}/index.html，请先运行 npm run build:site:local`)
  process.exit(1)
}

const keepServer = process.argv.includes('--keep')
let server = null
let exitCode = 1

try {
  if (keepServer) {
    await waitForServer()
  } else {
    if (await isServerReady()) {
      throw new Error(`端口 ${PORT} 已有服务在运行；请停止它，或使用 --keep 明确复用`)
    }
    server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: deployDir, stdio: 'ignore' })
    await waitForServer(server)
  }
  exitCode = await run()
} catch (err) {
  console.error(err?.stack ?? err?.message ?? err)
  exitCode = 1
} finally {
  await stopServer(server)
}
process.exitCode = exitCode

async function isServerReady() {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(500) })
    return res.ok
  } catch {
    return false
  }
}

async function waitForServer(proc = null) {
  const deadline = Date.now() + 5000
  while (Date.now() < deadline) {
    if (proc && proc.exitCode !== null) {
      throw new Error(`静态服务启动失败，退出码 ${proc.exitCode}`)
    }
    if (await isServerReady()) return
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`静态服务 ${BASE} 未在 5 秒内就绪`)
}

async function stopServer(proc) {
  if (!proc || proc.exitCode !== null) return
  proc.kill()
  await new Promise((resolve) => proc.once('exit', resolve))
}

async function run() {
  mkdirSync(SHOT, { recursive: true })
  const results = []
  let pass = 0
  let fail = 0
  const ok = (name) => { results.push(`✅ ${name}`); pass++ }
  const bad = (name, err) => { results.push(`❌ ${name} —— ${err?.message?.slice(0, 140) ?? err}`); fail++ }
  const step = async (page, name, fn) => { try { await fn(); ok(name) } catch (e) { bad(name, e) } }

  /** 通用答题：.option-btn → 数字按钮 → 输入框 → .pos-item → 任意非导航按钮 */
  async function answerOne(page) {
    const opt = page.locator('.option-btn').first()
    if (await opt.isVisible().catch(() => false)) { await opt.click(); return 'option' }
    const numBtns = page.locator('button').filter({ hasText: /^\d+$/ }).first()
    if (await numBtns.isVisible().catch(() => false)) { await numBtns.click(); return 'num-btn' }
    const input = page.locator('input[type="number"]').first()
    if (await input.isVisible().catch(() => false)) {
      await input.fill('3')
      await page.getByRole('button', { name: '确定' }).first().click()
      return 'input'
    }
    const pos = page.locator('main .pos-item').first()
    if (await pos.isVisible().catch(() => false)) { await pos.click(); return 'pos-item' }
    const NAV = /上一题|下一题|确定|再玩|重来|复位|重新|开始/
    const anyBtn = page.locator('main button').filter({ hasNotText: NAV }).first()
    if (await anyBtn.isVisible().catch(() => false)) { await anyBtn.click(); return 'any-btn' }
    throw new Error('未找到可答题控件')
  }

  const browser = await chromium.launch()

  /* ---------- 1. 门户 → 一年级 → 五年级 → 门户 ---------- */
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const errors = []
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 80)))

    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.screenshot({ path: `${SHOT}/01-portal.png`, fullPage: true })
    await step(page, '门户：标题「小学数学互动学习平台」', async () => {
      await page.getByRole('heading', { name: '小学数学互动学习平台' }).waitFor()
    })
    await step(page, '门户：六个年级入口齐全', async () => {
      const selector = gradeApps.map((app) => `a[href="${app.base}"]`).join(', ')
      const n = await page.locator(selector).count()
      if (n < gradeApps.length) throw new Error(`年级入口仅 ${n} / ${gradeApps.length} 个`)
    })
    await step(page, '门户：点「进入一年级」→ /g1/', async () => {
      await page.locator('a[href="/g1/"]').first().click()
      await page.waitForURL(/\/g1\/$/)
      await page.getByRole('heading', { name: '一年级数学例题游戏' }).waitFor()
    })
    await page.screenshot({ path: `${SHOT}/02-g1-home.png`, fullPage: true })

    await step(page, '一年级：点单元 c1 → 单元页', async () => {
      await page.locator('a[href="/g1/units/c1"], a[href="/g1/units/c1/"]').first().click()
      await page.waitForURL(/\/g1\/units\/c1\/?$/)
    })
    await step(page, '一年级：单元页点第一道例题 → 答题页', async () => {
      await page.locator('a[href*="/g1/play/"]').first().click()
      await page.waitForURL(/\/g1\/play\//)
    })
    await step(page, '一年级：答题（点击后出现反馈）', async () => {
      const how = await answerOne(page)
      await page.waitForTimeout(600)
      const txt = (await page.locator('main').textContent().catch(() => '')) || ''
      if (!/(答对|答错|正确|错误|太棒|加油)/.test(txt)) throw new Error(`无反馈文本（答题方式: ${how}）`)
    })
    await page.screenshot({ path: `${SHOT}/05-g1-answered.png`, fullPage: true })
    await step(page, '一年级：「下一题」翻题', async () => {
      await page.getByRole('button', { name: '下一题' }).first().click()
      await page.waitForTimeout(400)
    })
    await step(page, '一年级：小游戏「记忆翻牌」打开并翻两张', async () => {
      await page.goto(BASE + '/g1/games/memory', { waitUntil: 'networkidle' })
      await page.waitForURL(/\/g1\/games\/memory/)
      await page.waitForTimeout(400)
      const cards = page.locator('[class*="card"], [class*="tile"]').first()
      if (await cards.isVisible().catch(() => false)) {
        await cards.click()
        await page.waitForTimeout(300)
        await page.locator('[class*="card"], [class*="tile"]').nth(1).click()
        await page.waitForTimeout(400)
      }
    })
    await step(page, '一年级：顶栏「五年级」→ /g5/', async () => {
      await page.locator('a[href="/g5/"]').first().click()
      await page.waitForURL(/\/g5\/$/)
      await page.getByRole('heading', { name: '五年级数学例题可视化' }).waitFor()
    })
    await page.screenshot({ path: `${SHOT}/07-g5-home.png`, fullPage: true })
    await step(page, '五年级：点单元 c3 → 单元页', async () => {
      await page.locator('a[href="/g5/units/c3"], a[href="/g5/units/c3/"]').first().click()
      await page.waitForURL(/\/g5\/units\/c3\/?$/)
    })
    await step(page, '五年级：进入平行四边形面积 Lab', async () => {
      await page.locator('a[href*="/g5/labs/g5-c3-area-parallelogram"]').first().click()
      await page.waitForURL(/\/g5\/labs\/g5-c3-area-parallelogram\/?$/)
    })
    await step(page, '五年级：拖动滑块 → 面积实时变化', async () => {
      const areaSel = '.area-value strong, [class*="area-value"] strong, .lab-result'
      const before = (await page.locator(areaSel).first().textContent().catch(() => '')) || ''
      const slider = page.locator('input[type="range"]').first()
      if (!(await slider.isVisible().catch(() => false))) throw new Error('无滑块')
      await slider.fill('8')
      await page.waitForTimeout(500)
      const after = (await page.locator(areaSel).first().textContent().catch(() => '')) || ''
      if (before && after && before === after) throw new Error(`面积未变化: ${before}`)
    })
    await page.screenshot({ path: `${SHOT}/09-g5-lab-slider.png`, fullPage: true })
    await step(page, '五年级：点「剪一剪/拼一拼」→ 动画完成', async () => {
      const cut = page.getByRole('button', { name: /剪一剪|拼一拼/ }).first()
      await cut.click()
      await page.waitForTimeout(600)
    })
    await page.screenshot({ path: `${SHOT}/10-g5-lab-cut.png`, fullPage: true })
    await step(page, '五年级：顶栏「训练游戏」→ 游戏列表', async () => {
      await page.getByRole('link', { name: '训练游戏' }).first().click()
      await page.waitForURL(/\/g5\/games\/?$/)
    })
    await step(page, '五年级：面积速算答题', async () => {
      await page.locator('a[href="/g5/games/area-race"], a[href="/g5/games/area-race/"]').first().click()
      await page.waitForURL(/\/g5\/games\/area-race/)
      await answerOne(page)
      await page.waitForTimeout(400)
    })
    await page.screenshot({ path: `${SHOT}/11-g5-game.png`, fullPage: true })
    await step(page, '五年级：顶栏「首页」→ 回门户', async () => {
      await page.locator('a[href="/"]').first().click()
      await page.waitForURL(BASE + '/')
      await page.getByRole('heading', { name: '小学数学互动学习平台' }).waitFor()
    })
    await step(page, '门户：点「进入五年级」→ /g5/', async () => {
      await page.locator('a[href="/g5/"]').first().click()
      await page.waitForURL(/\/g5\/$/)
    })
    await step(page, '五年级：three.js 三视图 Lab 渲染（无 JS 错误）', async () => {
      errors.length = 0
      await page.goto(BASE + '/g5/labs/g5-c8-views3d-blocks', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      if (errors.length) throw new Error(errors.join(' | '))
    })
    await page.screenshot({ path: `${SHOT}/13-g5-views3d.png`, fullPage: true })
    await page.close()
  }

  /* ---------- 2. 一年级题型矩阵 ---------- */
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 80)))
    for (const [name, url] of [
      ['数一数', '/g1/play/c1-count-01'],
      ['写一写', '/g1/play/c2-write-01'],
      ['加减法', '/g1/play/c2-addsub-01'],
      ['分与合', '/g1/play/c4-split-01'],
      ['比一比', '/g1/play/c1-compare-01'],
      ['第几个', '/g1/play/c2-ordinal-01'],
      ['位置', '/g1/play/c3-position-01'],
      ['立体图形', '/g1/play/c5-shape3d-01'],
      ['十几', '/g1/play/c8-numberline-01'],
      ['顺数', '/g1/play/c8-sequence-01'],
      ['抢10', '/g1/play/c6-ten-01'],
    ]) {
      await step(page, `一年级例题：${name} 可答题`, async () => {
        errors.length = 0
        await page.goto(BASE + url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(300)
        await answerOne(page)
        await page.waitForTimeout(400)
        if (errors.length) throw new Error(errors.join(' | '))
      })
    }
    await page.close()
  }

  /* ---------- 3. 五年级 Lab 矩阵 ---------- */
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 80)))
    for (const [name, url] of [
      ['平移', '/g5/labs/g5-c1-translate-fish'],
      ['统计图', '/g5/labs/g5-c2-stats-bar'],
      ['三角形面积', '/g5/labs/g5-c3-area-triangle'],
      ['公顷', '/g5/labs/g5-c3-hectare-field'],
      ['小数乘', '/g5/labs/g5-c4-dmul-pencil'],
      ['小数点移动·乘', '/g5/labs/g5-c4-dmul-paper'],
      ['小数点移动·除', '/g5/labs/g5-c4-ddiv-sugarcane'],
      ['转盘', '/g5/labs/g5-c5-spinner-rotate'],
      ['因数', '/g5/labs/g5-c6-factors-12'],
      ['质数筛', '/g5/labs/g5-c6-prime-sieve'],
      ['青蛙歌', '/g5/labs/g5-c7-frog-song'],
      ['速度路程', '/g5/labs/g5-c7-speed-car'],
    ]) {
      await step(page, `五年级 Lab：${name} 内容渲染无错误`, async () => {
        errors.length = 0
        await page.goto(BASE + url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(400)
        const txt = ((await page.locator('main').textContent().catch(() => '')) || '').trim()
        if (txt.length < 20) throw new Error('main 内容为空')
        if (errors.length) throw new Error(errors.join(' | '))
      })
    }
    await page.close()
  }

  /* ---------- 4. 移动端溢出检查 ---------- */
  {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 80)))
    for (const [name, url] of [
      ['门户', '/'],
      ['一年级首页', '/g1/'],
      ['五年级首页', '/g5/'],
      ['一年级答题', '/g1/play/c2-addsub-01'],
      ['五年级 Lab', '/g5/labs/g5-c3-area-parallelogram'],
    ]) {
      await step(page, `移动端(375px)：${name} 无横向溢出`, async () => {
        errors.length = 0
        await page.goto(BASE + url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(400)
        const over = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        if (over > 0) throw new Error(`横向溢出 ${over}px`)
        if (errors.length) throw new Error(errors.join(' | '))
      })
    }
    await page.close()
  }

  await browser.close()
  console.log('\n================ 真实点击测试结果 ================')
  for (const r of results) console.log(r)
  console.log(`\n通过 ${pass} / 失败 ${fail}，共 ${pass + fail} 项；截图: ${SHOT}`)
  return fail > 0 ? 1 : 0
}
