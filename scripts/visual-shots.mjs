#!/usr/bin/env node
/**
 * 可视化截图回归工具。
 *
 * 用法：
 *   node scripts/visual-shots.mjs --base http://localhost:3105 --grade g5 --out docs/visual-review-screenshots/g5 \
 *     g5-c3-area-parallelogram g5-c3-area-trapezoid
 *   或只给 --grade 与 --all-labs 截取该年级全部 Lab。
 *
 * 路由前缀：
 *   g2~g6 的页面是 /labs/<id>/；g1 是 /play/<id>/，用 --route play 指定。
 *   （g1 的题目 id 形如 c1-count-01，没有 g1- 前缀，所以 id 抽取按年级走不同正则。）
 *
 * 每个 Lab 截两张：初始态（`<id>.png`）与「操作一次」后的过程态（`<id>-act.png`，
 * 会依次点击页面里第一个「剪/拼/拼一拼/数一数/旋转/抛/抽」类按钮），用于验证过程态不是只有文字。
 * 页面控制台报错会写进 `<id>.notes.txt`，便于发现 SVG 属性报错这类真实渲染问题。
 *
 * 两处自检（都是为了「过程态证据可被机器证伪」）：
 *   - `⚠ 过程态与初始态相同：<id>` / 结尾「假过程态 N 个」：两张截图逐字节相同；
 *   - `⚠ 点击后无变化：<id>` / 结尾「点击后无变化 N 个」：点了以后 Lab 区域 DOM 指纹没变。
 * 点击前不等固定毫秒数，而是等「应用稳定」：`#__nuxt` 已挂上 vue app、且 body 文本连续两次
 * 采样（间隔 300ms）不变——Nuxt 客户端二次水合会把第一次点击丢掉，固定等待挡不住这个坑。
 */
import { chromium } from 'playwright'
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
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
/** 路由前缀：g2~g6 用 labs，g1 用 play */
const route = arg('route', grade === 'g1' ? 'play' : 'labs')
const ids = args.filter((a) => !a.startsWith('--') && !isArgValue(a))

function isArgValue(token) {
  const flags = ['--base', '--grade', '--out', '--route']
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
    // 只取例题/练习题 Lab，不要 meta.ts 里的单元 id：
    // g2~g6 的 id 带年级前缀（g2-c3-tangram）；g1 的题目 id 不带前缀（c1-count-01）。
    const re = grade === 'g1' ? /id:\s*'((?:c\d+)-[a-z0-9-]+)'/g : /id:\s*'(g\d-[^']+)'/g
    for (const m of text.matchAll(re)) found.push(m[1])
  }
  return found
}

const ACTION_TEXTS = [
  // 先放「真的改变图形/数据」的操作按钮，再放通用演示按钮；
  // 顺序有意义：命中第一个存在的就点它。
  '剪一剪',
  '拼一拼',
  '数一数',
  '数方格',
  '配对',
  '分一分',
  '圈一份',
  '装一辆',
  '付钱',
  '拨一拨',
  '比一位',
  '算一算',
  '减一减',
  '写一道',
  '再分一份',
  '再加 1',
  '数一张',
  '换一换',
  '转一转',
  '对折',
  '旋转',
  '转动',
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
  '摸',
  '下一步',
  '合一合',
  '摆一摆',
]

/** Lab 区域的 DOM 指纹（长度 + djb2 哈希）：用来判断「点击前后到底变没变」 */
async function fingerprint(page) {
  try {
    return await page.evaluate(() => {
      const el = document.querySelector('.lab-card') || document.querySelector('main') || document.body
      const html = el?.innerHTML ?? ''
      let h = 5381
      for (let i = 0; i < html.length; i++) h = ((h * 33) ^ html.charCodeAt(i)) >>> 0
      return `${html.length}:${h}`
    })
  } catch {
    return ''
  }
}

/**
 * 等页面「稳定」：vue app 已挂载 + body 文本连续 2 次采样（间隔 300ms）不变。
 *
 * 为什么不用固定毫秒：Nuxt 客户端会二次挂载（onMounted 打点 2 次），固定等待短了会把点击
 * 交给「将要被丢弃的第一个实例」，点击被吞，`-act.png` 与初始态一模一样
 * （agent C 在 g6-c4-ex-football-ratio 上定位到）。
 */
async function waitStable(page, timeout = 20000) {
  await page
    .waitForFunction(
      () => {
        const app = document.querySelector('#__nuxt')?.__vue_app__
        if (!app) return false
        const w = window
        const txt = document.body.innerText
        if (!w.__shotStable) w.__shotStable = { txt: null, hits: 0 }
        if (w.__shotStable.txt === txt) w.__shotStable.hits += 1
        else {
          w.__shotStable.txt = txt
          w.__shotStable.hits = 0
        }
        return w.__shotStable.hits >= 2
      },
      { timeout, polling: 300 },
    )
    .catch(() => {})
}

/** 找页面上的「操作」元素：先按 ACTION_TEXTS 命中，再兜底 [data-act] */
async function pickTarget(page) {
  for (const t of ACTION_TEXTS) {
    const btn = page.locator(`button:has-text("${t}")`).first()
    if ((await btn.count()) > 0) return { locator: btn, label: `「${t}」` }
  }
  const act = page.locator('[data-act]').first()
  if ((await act.count()) > 0) return { locator: act, label: '[data-act]' }
  return null
}

async function shoot(page, id, suffix, clickAction) {
  const url = `${base}/${route}/${id}/`
  const errors = []
  const onConsole = (msg) => {
    const text = msg.text()
    if (msg.type() === 'error') {
      errors.push(text)
      return
    }
    // 组件解析失败/渲染告警只走 warning，不会进 console.error：
    // 第 30 轮实测 <ParamControl> 因 Nuxt 目录前缀解析不到，整块参数控件静默消失。
    if (/Failed to resolve component|Failed to resolve directive|Cannot read propert|is not a function/i.test(text)) {
      errors.push(`[warn] ${text}`)
    }
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
  // ClientOnly + Nuxt 首次 hydrate 期间页面只有「加载可视化…」占位：
  // 必须等它消失，否则初态截图拍到的是一块空白（第 4 轮实测：直接拍会把「未挂载」当成「没内容」）。
  await page
    .waitForFunction(() => !/加载可视化/.test(document.body.innerText), { timeout: 25000 })
    .catch(() => {})
  // 水合哨兵（代替固定 waitForTimeout(600)）：见 waitStable 注释
  await waitStable(page, 20000)
  await page.waitForTimeout(150)
  if (clickAction) {
    let clicked = false
    // 点击前先拍一张 Lab 区域的 DOM 指纹，用来判断「这一下到底有没有生效」
    const pre = await fingerprint(page)
    let target = null
    let label = ''
    for (const t of ACTION_TEXTS) {
      const btn = page.locator(`button:has-text("${t}")`).first()
      if ((await btn.count()) > 0) {
        try {
          await btn.click({ timeout: 2500 })
          target = btn
          label = `「${t}」`
        } catch (err) {
          if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 点击「${t}」失败：${String(err).slice(0, 80)}`)
        }
        break
      }
    }
    // 有些题的「操作」不是带文字的按钮，而是「点数格子 / 搬动卡片」（一年级尤其多）：
    // 组件把主操作元素标成 data-act，这里兜底点它。
    if (!target) {
      const act = page.locator('[data-act]').first()
      if ((await act.count()) > 0) {
        try {
          await act.click({ timeout: 2500 })
          target = act
          label = '[data-act]'
        } catch (err) {
          if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 点 [data-act] 失败：${String(err).slice(0, 80)}`)
        }
      }
    }

    if (target) {
      clicked = true
      if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 点击${label}`)
      // 点击有效性自检：800ms 后 DOM 指纹必须和点击前不同。
      // 相同 = 这一下被吞了（典型原因就是二次水合把第一个实例连同它的状态一起丢弃），
      // 此时重点一次并多等 1200ms；两次都没变化才算「点击后无变化」。
      await page.waitForTimeout(800)
      let effective = (await fingerprint(page)) !== pre
      if (!effective) {
        await target.click({ timeout: 2500 }).catch(() => {})
        await page.waitForTimeout(1200)
        effective = (await fingerprint(page)) !== pre
        if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 第一次点击未生效，重点一次 → ${effective ? '生效' : '仍无变化'}`)
      }
      if (!effective) {
        noChange.push(id)
        console.log(`⚠ 点击后无变化：${id}`)
      }
      // 多步过程（个位 → 进位/退位 → 十位）：只点一次会停在「还没走到关键那一步」的画面，
      // 所以只要还留着「下一步」按钮就再走两步，让 -act 拍到真正体现算理的那一帧。
      for (let k = 0; k < 2; k++) {
        const next = page.locator('button:has-text("下一步")').first()
        if ((await next.count()) === 0) break
        if (await next.isDisabled().catch(() => true)) break
        await next.click({ timeout: 2500 }).catch(() => {})
        await page.waitForTimeout(900)
      }
      // 过程态动画约 1.6s（转盘/滚圆等），等它跑完再截
      await page.waitForTimeout(2000)
      // 截图前的「最终校验」：有些页面（g6 练习题 Lab 实测）会在点击**之后**才完成第二次挂载，
      // 把状态整体重置回初态。此时 800ms 处的指纹检查是「已生效」，但临到截图又退回初态，
      // 于是 -act.png 与初始态逐字节相同。这里重新等稳定再比一次指纹，退了就再点一次。
      await waitStable(page, 8000)
      if ((await fingerprint(page)) === pre) {
        const again = await pickTarget(page)
        if (again) {
          await again.locator.click({ timeout: 2500 }).catch(() => {})
          await waitStable(page, 8000)
          await page.waitForTimeout(2000)
          if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 截图前发现已回到初态，补点${again.label}`)
        }
        if ((await fingerprint(page)) === pre) {
          // 注意：指纹与点击前相同也可能是「循环步骤又转回第 1 步」（g6-c2-segment 实测，
          // 多步循环题被多点了两次就绕回来了）。所以这里只记日志，不计入「点击后无变化」；
          // 「-act 与初始态逐字节相同」这一条以结尾的 md5 比对为准，那才是硬证据。
          if (process.env.SHOT_DEBUG) console.log(`  [act] ${id} 补点后指纹仍与初态相同（可能是循环步骤绕回）`)
        }
      }
    } else if (process.env.SHOT_DEBUG) {
      console.log(`  [act] ${id} 未找到可点击的操作按钮（截图为初始态）`)
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
        await fetch(`${base}/${route}/${id}/`)
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

/** 新建一个截图页（渲染进程崩了要能重建，见主循环的 try/catch） */
async function newShotPage() {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 })
  // Nuxt devtools 的悬浮徽标会挡住画面右下角，截图前统一藏掉（只影响截图，不改应用）
  await p.addInitScript(() => {
    const css = '#nuxt-devtools-container, #nuxt-devtools-anchor, .nuxt-devtools-panel, nuxt-devtools-badge, [data-nuxt-devtools] { display: none !important; }'
    const inject = () => {
      const style = document.createElement('style')
      style.textContent = css
      document.head?.appendChild(style)
    }
    if (document.head) inject()
    else document.addEventListener('DOMContentLoaded', inject)
  })
  return p
}

let page = await newShotPage()
/** 两张截图的 md5（用于自检「过程态到底变没变」） */
async function md5Of(file) {
  try {
    return createHash('md5').update(await readFile(file)).digest('hex')
  } catch {
    return null
  }
}

let bad = 0
const badIds = []
/** 过程态与初始态逐字节相同的题（＝截图没抓到真过程） */
const fakeAct = []
/** 点了以后 Lab 区域 DOM 指纹没变的题（＝点击被吞，多半是二次水合丢了状态） */
const noChange = []
for (const id of list) {
  let a
  let act
  try {
    a = await shoot(page, id, '', false)
    act = await shoot(page, id, '-act', true)
  } catch (err) {
    // 渲染进程偶发崩溃（WebGL/内存）会让整个批次 abort，前面几十张白跑。
    // 这里降级为「这一题记问题、重建 page 继续」，不中断整批。
    console.log(`💥 ${id} 截图异常：${String(err).slice(0, 120)}`)
    bad++
    badIds.push(id)
    if (!page.isClosed()) await page.close().catch(() => {})
    page = await newShotPage()
    continue
  }
  const [h1, h2] = [await md5Of(a.file), await md5Of(act.file)]
  if (h1 && h2 && h1 === h2) {
    fakeAct.push(id)
    console.log(`⚠ 过程态与初始态相同：${id}`)
  }
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
// 「过程态证据」的可证伪自检：截图逐字节相同就说明按钮没找到 / 点了没变 / 等待太短。
// 这条口径是本轮补的：旧证据链里曾出现成片 -act.png 与初始态一模一样却没人发现。
console.log(`假过程态 ${fakeAct.length} 个${fakeAct.length ? `：${fakeAct.join(', ')}` : ''}`)
console.log(`点击后无变化 ${noChange.length} 个${noChange.length ? `：${noChange.join(', ')}` : ''}`)
if (badIds.length) {
  console.log(`问题页面：${badIds.join(', ')}`)
  process.exitCode = 1
}
