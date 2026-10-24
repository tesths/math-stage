#!/usr/bin/env node
/**
 * 客观度量脚本（第 4 轮，跨年级）：静态度量 g1–g6 每个 Lab 的「可视化能力指标」。
 *
 * 用法：
 *   node scripts/visual-metrics.mjs                # 全六册
 *   node scripts/visual-metrics.mjs --grade g5     # 只跑一册
 *   node scripts/visual-metrics.mjs --out docs/audit/round4/metrics.json --md docs/round4-metrics.md
 *
 * 输出的指标（全部是**静态启发式统计**，不是教学效果证据）：
 *   hasAction        组件里存在「操作类」按钮（剪/拼/数一数/对折/转/抛/摸/滚…）且点击后会写响应式状态
 *   hasConceptPrompt 有默认收起、点击展开的概念追问（页面 ConceptTip + 数据层 tip 非空，或组件内可展开提示）
 *   hasSteps         有「分步」：组件渲染步骤列表，或有 step 索引 + 步进按钮
 *   hasUnits         数据层声明了真实单位（LabDef.units / GameQuestion.visual.unitLabel）
 *   hasDims          SVG 里画了尺寸线/单位方格/刻度（stroke-dasharray、<line>、<pattern>、grid/tick 类名）
 *   paramsCount      数据层可调参数个数
 *   testsCount       test/** 里提到该 id 或该 kind 的断言数（按 it() 块归属，expect() 计数）
 *   shotCount        docs/visual-review-screenshots/<grade>/ 里该 id 的截图数
 *
 * 纪律：本脚本**只读**，不写任何年级目录；不改 g1–g4 代码。
 */
import { registerHooks } from 'node:module'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// —— 让 Node 直接 import 年级数据层（TS，扩展名省略）——
registerHooks({
  resolve(spec, ctx, next) {
    try {
      return next(spec, ctx)
    } catch (err) {
      for (const suf of ['.ts', '/index.ts', '.js']) {
        try {
          return next(spec + suf, ctx)
        } catch {
          /* try next */
        }
      }
      throw err
    }
  },
})

const GRADES = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6']

/**
 * 「操作类」按钮文本词表。来自 rubric L3：
 * 剪一剪/拼一拼/数一数/分一分/对折/转/抛/放一块/摸。
 */
const ACTION_WORDS = [
  '剪',
  '拼',
  '数一数',
  '数方格',
  '数边',
  '分一分',
  '对折',
  '折',
  '旋转',
  '转动',
  '转一圈',
  '抛',
  '摸',
  '滚',
  '筛',
  '摆',
  '割',
  '铺',
  '放一块',
  '挪',
  '量一量',
  '画一画',
  '叠加',
  '揭示',
  '下一步',
  '换一种',
  '换一组',
  '换一个',
  '放大',
  '缩小',
  '代入',
  '铺满',
  '再排',
  '走一格',
  '算一位',
  '再多算',
  '量',
  '只看',
  '看全部',
  '筛选',
  '验算',
  '再量',
]

/** 概念追问的文本线索（默认收起 + 点击展开） */
const CONCEPT_WORDS = ['先想一想', '再看提示', '想一想', '点开对照', '展开提示', '看提示']

function readFileSafe(p) {
  try {
    return readFileSync(p, 'utf8')
  } catch {
    return ''
  }
}

/** 解析 kind → 组件文件（registry.ts 里 `import X from '@/components/...vue'` + `kind: X`） */
function parseRegistry(grade) {
  const rels = [
    `${grade}/game/src/lib/labs/registry.ts`,
    `${grade}/game/src/lib/engine/registry.ts`,
  ]
  const src = rels.map((r) => readFileSafe(path.join(ROOT, r))).find((s) => s.trim().length > 0)
  const out = { map: new Map(), file: rels.find((r) => readFileSafe(path.join(ROOT, r)).trim().length > 0) ?? null }
  if (!src) return out
  const imports = new Map()
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+'(@\/components\/[^']+\.vue)'/g)) {
    imports.set(m[1], m[2].replace('@/', `${grade}/game/src/`))
  }
  // 记录字面：'kind': Comp  或  kind: Comp
  for (const m of src.matchAll(/^\s*'?([\w-]+)'?\s*:\s*(\w+)\s*,/gm)) {
    const comp = imports.get(m[2])
    if (comp) out.map.set(m[1], comp)
  }
  return out
}

/** 从组件源码里统计操作 / 状态 / 步骤 / 尺寸标注 */
function analyseComponent(src) {
  // 按钮文本：既要看标签内的文本，也要看 label=/title= 属性（很多 UButton 是自闭合的）
  const actionLabels = []
  for (const m of src.matchAll(/<(?:UButton|button)\b([^>]*)>/g)) {
    const attrs = m[1]
    const labelAttr = /\b(?:label|title|text)="([^"]*)"/.exec(attrs)
    let inner = ''
    const after = src.slice(m.index + m[0].length)
    const close = after.indexOf('</')
    if (close >= 0 && !/\/>$/.test(m[0])) inner = after.slice(0, close).replace(/<[^>]+>/g, ' ')
    const text = `${labelAttr?.[1] ?? ''} ${inner}`.replace(/\{\{|\}\}/g, ' ').replace(/\s+/g, ' ').trim()
    if (ACTION_WORDS.some((w) => text.includes(w))) actionLabels.push(text.slice(0, 28))
  }
  const uniqActions = [...new Set(actionLabels)]

  // 点击后是否真的改状态：handler 体内写 .value，或内联表达式赋值
  const handlers = [...src.matchAll(/@click(?:\.\w+)*\s*=\s*"([^"]+)"/g)].map((m) => m[1])
  let stateWrites = 0
  for (const h of handlers) {
    if (/\.value\s*(=[^=]|\+\+|--)/.test(h)) {
      stateWrites++
      continue
    }
    const name = h.trim().replace(/\(\s*\)$/, '')
    if (!/^\w+$/.test(name)) {
      if (/(\+\+|--|\s=\s)/.test(h)) stateWrites++
      continue
    }
    const fnRe = new RegExp(`(?:function\\s+${name}\\s*\\(|const\\s+${name}\\s*=\\s*(?:async\\s*)?\\()`)
    const at = src.search(fnRe)
    if (at >= 0) {
      const body = src.slice(at, at + 1500)
      if (/\.value\s*(=[^=]|\+\+|--)/.test(body)) stateWrites++
    }
  }

  // 分步：① 步骤列表（v-for 渲染 steps/roundNotes）② 步进控件（step-bar/step-chip + 索引 ref）
  const hasStepList = /v-for="[^"]*\b(steps|stepList|roundNotes|stepNotes)\b/.test(src)
  const stepUi = /class="[^"]*\b(?:step|steps)[-\w]*|step-chip|step-bar|step-list|steps-inline|step-dot/.test(src)
  const stepIdxRef = [...src.matchAll(/\b(?:const|let)\s+(\w+)\s*=\s*ref\(/g)].some((m) =>
    /(step|stage|phase|round|cur|idx)/i.test(m[1]),
  )
  const hasStepIndex = stepUi && stepIdxRef && /@click/.test(src)

  const hasConceptBlock =
    CONCEPT_WORDS.some((w) => src.includes(w)) &&
    /v-if="[^"]*(?:show|open|expand|reveal|hint|tip)/i.test(src)

  const svgDims = {
    dasharray: (src.match(/stroke-dasharray/g) ?? []).length,
    line: (src.match(/<line\b/g) ?? []).length,
    pattern: (src.match(/<pattern\b/g) ?? []).length,
    grid: (src.match(/(?:class="[^"]*\b(?:grid|tick|scale-line|ruler|dim)\b)/g) ?? []).length,
    marker: (src.match(/marker-end|marker-start/g) ?? []).length,
  }
  const hasDims =
    svgDims.dasharray > 0 || svgDims.line > 0 || svgDims.pattern > 0 || svgDims.grid > 0

  return {
    actionLabels: uniqActions,
    stateWrites,
    hasAction: uniqActions.length > 0 && stateWrites > 0,
    hasStepList,
    hasStepIndex,
    hasConceptBlock,
    svgDims,
    hasDims,
  }
}

/** 统计 test/** 中提到 id 或 kind 的断言数（按 it()/test() 块归属） */
function countTests(grade, id, kinds, kindCount = 1) {
  const testDir = path.join(ROOT, grade, 'game', 'test')
  if (!existsSync(testDir)) return { testsCount: 0, files: [] }
  const files = []
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.(ts|js)$/.test(e.name)) files.push(p)
    }
  }
  walk(testDir)
  const kindTokens = kinds.flatMap((k) => [`'${k}'`, `"${k}"`, `kind: ${k}`, `.${k}`])
  let idTotal = 0
  let kindTotal = 0
  const hitFiles = []
  for (const f of files) {
    const src = readFileSync(f, 'utf8')
    const blocks = [...src.matchAll(/\b(?:it|test)(?:\.\w+)?\s*\(\s*(['"`])([\s\S]*?)\1\s*,/g)]
    let fileHits = 0
    for (let i = 0; i < blocks.length; i++) {
      const start = blocks[i].index ?? 0
      const end = i + 1 < blocks.length ? blocks[i + 1].index ?? src.length : src.length
      const body = src.slice(start, end)
      const n = (body.match(/expect\s*\(/g) ?? []).length
      if (body.includes(id)) {
        idTotal += n
        fileHits += n
      } else if (kindTokens.some((t) => body.includes(t))) {
        kindTotal += n
        fileHits += n
      }
    }
    if (fileHits > 0) hitFiles.push(path.relative(ROOT, f))
  }
  // 只按 kind 命中的断言块被同 kind 的多个 Lab 共享，按份数摊分，避免重复计数
  const testsCount = idTotal + (kindCount > 1 ? Math.round(kindTotal / kindCount) : kindTotal)
  return { testsCount, files: hitFiles, testsScope: idTotal > 0 ? 'id' : kindTotal > 0 ? 'kind(shared)' : 'none' }
}

/** 统计截图数：docs/visual-review-screenshots/<grade>/<id>*.png */
function countShots(grade, id) {
  const dir = path.join(ROOT, 'docs', 'visual-review-screenshots', grade)
  if (!existsSync(dir)) return 0
  return readdirSync(dir).filter((f) => {
    const base = f.replace(/\.png$/, '')
    if (base === id) return true
    if (!base.startsWith(`${id}-`)) return false
    return /^(act\d*|step\d*|mid|after|before)$/.test(base.slice(id.length + 1))
  }).length
}

/** 数据层：按年级加载 allLabs / allExamples */
async function loadLabs(grade) {
  const mod = await import(path.join(ROOT, grade, 'data', 'upper', 'index.ts'))
  if (Array.isArray(mod.allLabs)) {
    return mod.allLabs.map((l) => ({
      id: l.id,
      page: l.page,
      source: l.source,
      kind: l.kind,
      params: l.params ?? [],
      units: l.units ?? null,
      tip: (l.tip ?? '').trim(),
    }))
  }
  if (Array.isArray(mod.allExamples)) {
    return mod.allExamples.map((e) => ({
      id: e.id,
      page: e.page,
      source: e.source,
      kind: e.type,
      params: [],
      units: e.config?.visual?.unitLabel ? { unitLabel: e.config.visual.unitLabel } : null,
      tip: (e.tip ?? '').trim(),
    }))
  }
  return []
}

function pct(a, b) {
  return b === 0 ? 0 : Math.round((a / b) * 1000) / 10
}

async function main() {
  const argv = process.argv.slice(2)
  const only = argv.includes('--grade') ? argv[argv.indexOf('--grade') + 1] : null
  const outJson = path.resolve(ROOT, argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'docs/audit/round4/metrics.json')
  const outMd = path.resolve(ROOT, argv.includes('--md') ? argv[argv.indexOf('--md') + 1] : 'docs/round4-metrics.md')

  const grades = only ? [only] : GRADES
  const result = {
    generatedAt: new Date().toISOString(),
    disclaimer:
      '这是**启发式静态度量**（正则扫源码 + 数测试断言 + 数截图文件），只回答「代码里有没有这类能力」，' +
      '不构成教学效果证据；也不能判断「图形是否按真实比例」「结论是否循环论证」这类需要人看的 L0 问题。',
    method: {
      hasAction: '组件 <button>/<UButton> 文本命中操作类词表，且 @click 的处理函数体内写入 .value（状态真的变）',
      hasConceptPrompt: 'Lab 页渲染 ConceptTip 且数据层 tip 非空（默认收起、点击展开），或组件内有可展开提示块',
      hasSteps: 'hasSteps = 有步骤列表（页面渲染 compute 的 steps，或组件 v-for 渲染步骤）或 有步进控件（step-bar/step-chip 类 + 索引 ref）',
      hasStepControl: '「可步进」单列：组件里有 step/stage/round 索引 + 点击切换的步进按钮（L3 过程可分步的强指标）',
      hasUnits: '数据层 LabDef.units 非空（g1 用 GameQuestion.config.visual.unitLabel）',
      hasDims: '组件 SVG 出现 stroke-dasharray / <line> / <pattern> / grid|tick 类名',
      testsCount:
        'test/** 中 it()/test() 块内提到该 id 的 expect() 个数；只按 kind 命中的块按「同 kind 的 Lab 数」摊分（testsScope 标出归属方式）',
      shotCount: 'docs/visual-review-screenshots/<grade>/<id>*.png 文件数',
      sharedComponentsNote:
        '同一组件服务多个 Lab 时，hasAction/hasSteps/hasDims 是组件级结论，会在这些 Lab 上同时为真；metrics.json 的 componentScope 标出共享情况。',
    },
    grades: {},
  }

  for (const grade of grades) {
    const labs = await loadLabs(grade)
    if (labs.length === 0) {
      console.warn(`[skip] ${grade}: 数据层没有 labs`)
      continue
    }
    const registry = parseRegistry(grade)
    const pageSrc = readFileSafe(path.join(ROOT, grade, 'game', 'src', 'pages', 'labs', '[id].vue'))
    const pageUsesConceptTip = /ConceptTip/.test(pageSrc)
    const pageRendersSteps = /v-for="[^"]*result\.steps/.test(pageSrc)
    const compCache = new Map()
    const compUsage = new Map()
    for (const lab of labs) {
      const rel = registry.map.get(lab.kind)
      if (rel) compUsage.set(rel, (compUsage.get(rel) ?? 0) + 1)
    }

    const rows = []
    for (const lab of labs) {
      const rel = registry.map.get(lab.kind) ?? null
      let comp = rel ? compCache.get(rel) : null
      if (rel && !comp) {
        comp = analyseComponent(readFileSafe(path.join(ROOT, rel)))
        compCache.set(rel, comp)
      }
      const kindCount = labs.filter((l) => l.kind === lab.kind).length
      const t = countTests(grade, lab.id, [lab.kind], kindCount)
      rows.push({
        id: lab.id,
        page: lab.page,
        source: lab.source,
        kind: lab.kind,
        component: rel,
        componentScope: rel ? ((compUsage.get(rel) ?? 0) > 1 ? 'shared' : 'own') : 'none',
        hasAction: comp ? comp.hasAction : false,
        actionLabels: comp ? comp.actionLabels : [],
        stateWrites: comp ? comp.stateWrites : 0,
        hasConceptPrompt: Boolean((pageUsesConceptTip && lab.tip) || (comp && comp.hasConceptBlock)),
        hasTip: lab.tip.length > 0,
        hasSteps: Boolean((comp && (comp.hasStepList || comp.hasStepIndex)) || pageRendersSteps),
        pageRendersSteps,
        hasStepList: comp ? comp.hasStepList : false,
        hasStepIndex: comp ? comp.hasStepIndex : false,
        hasUnits: Boolean(lab.units),
        hasDims: comp ? comp.hasDims : false,
        svgDims: comp ? comp.svgDims : null,
        paramsCount: lab.params.length,
        testsCount: t.testsCount,
        testsScope: t.testsScope,
        testFiles: t.files,
        shotCount: countShots(grade, lab.id),
      })
    }

    const n = rows.length
    const coverage = {
      hasAction: `${rows.filter((r) => r.hasAction).length}/${n}`,
      hasConceptPrompt: `${rows.filter((r) => r.hasConceptPrompt).length}/${n}`,
      hasSteps: `${rows.filter((r) => r.hasSteps).length}/${n}`,
      hasStepControl: `${rows.filter((r) => r.hasStepIndex).length}/${n}`,
      hasUnits: `${rows.filter((r) => r.hasUnits).length}/${n}`,
      hasDims: `${rows.filter((r) => r.hasDims).length}/${n}`,
      pct: {
        hasAction: pct(rows.filter((r) => r.hasAction).length, n),
        hasConceptPrompt: pct(rows.filter((r) => r.hasConceptPrompt).length, n),
        hasSteps: pct(rows.filter((r) => r.hasSteps).length, n),
        hasStepControl: pct(rows.filter((r) => r.hasStepIndex).length, n),
        hasUnits: pct(rows.filter((r) => r.hasUnits).length, n),
        hasDims: pct(rows.filter((r) => r.hasDims).length, n),
      },
    }
    result.grades[grade] = {
      labCount: n,
      ownComponentLabs: rows.filter((r) => r.componentScope === 'own').length,
      sharedComponentLabs: rows.filter((r) => r.componentScope === 'shared').length,
      componentCount: new Set(rows.map((r) => r.component).filter(Boolean)).size,
      registry: registry.file,
      pageUsesConceptTip,
      pageRendersSteps,
      coverage,
      totals: {
        paramsCount: rows.reduce((a, r) => a + r.paramsCount, 0),
        testsCount: rows.reduce((a, r) => a + r.testsCount, 0),
        shotCount: rows.reduce((a, r) => a + r.shotCount, 0),
        tipCount: rows.filter((r) => r.hasTip).length,
      },
      labs: rows,
    }
    console.log(
      `${grade}: ${n} Labs / ${result.grades[grade].componentCount} 组件 | ` +
        `action ${coverage.hasAction} (${coverage.pct.hasAction}%) | ` +
        `concept ${coverage.hasConceptPrompt} (${coverage.pct.hasConceptPrompt}%) | ` +
        `steps ${coverage.hasSteps} (可步进 ${coverage.hasStepControl}) | units ${coverage.hasUnits} | dims ${coverage.hasDims} (${coverage.pct.hasDims}%)`,
    )
  }

  mkdirSync(path.dirname(outJson), { recursive: true })
  writeFileSync(outJson, `${JSON.stringify(result, null, 2)}\n`)
  writeFileSync(outMd, renderMarkdown(result))
  console.log(`\n写入 ${path.relative(ROOT, outJson)}`)
  console.log(`写入 ${path.relative(ROOT, outMd)}`)
}

function renderMarkdown(res) {
  const order = GRADES.filter((g) => res.grades[g])
  const lines = []
  lines.push('# 第 4 轮客观度量表（g1–g6）')
  lines.push('')
  lines.push(`> 生成时间：${res.generatedAt} · 生成脚本：\`node scripts/visual-metrics.mjs\``)
  lines.push('>')
  lines.push(`> **性质说明（必须一并读）**：${res.disclaimer}`)
  lines.push('>')
  lines.push('> 判定口径见文末「方法」一节；明细见 `docs/audit/round4/metrics.json`。')
  lines.push('')
  lines.push('## 1. 六册覆盖率对照')
  lines.push('')
  lines.push('| 年级 | Lab 数 | 组件数 | 有操作 `hasAction` | 有概念追问 `hasConceptPrompt` | 组件内步骤列表 | 可步进 `hasStepControl` | 声明真实单位 `hasUnits` | 有尺寸/方格 `hasDims` | 参数合计 | 断言合计 | 截图合计 |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const g of order) {
    const G = res.grades[g]
    const c = G.coverage
    lines.push(
      `| ${g} | ${G.labCount} | ${G.componentCount} | ${c.hasAction}（${c.pct.hasAction}%） | ${c.hasConceptPrompt}（${c.pct.hasConceptPrompt}%） | ${G.labs.filter((l) => l.hasStepList).length}/${G.labCount} | ${c.hasStepControl}（${c.pct.hasStepControl}%） | ${c.hasUnits} | ${c.hasDims}（${c.pct.hasDims}%） | ${G.totals.paramsCount} | ${G.totals.testsCount} | ${G.totals.shotCount} |`,
    )
  }
  const tot = order.reduce(
    (a, g) => {
      const G = res.grades[g]
      a.labs += G.labCount
      a.action += G.labs.filter((l) => l.hasAction).length
      a.concept += G.labs.filter((l) => l.hasConceptPrompt).length
      a.steps += G.labs.filter((l) => l.hasStepList).length
      a.stepCtl += G.labs.filter((l) => l.hasStepIndex).length
      a.units += G.labs.filter((l) => l.hasUnits).length
      a.dims += G.labs.filter((l) => l.hasDims).length
      a.params += G.totals.paramsCount
      a.tests += G.totals.testsCount
      a.shots += G.totals.shotCount
      return a
    },
    { labs: 0, action: 0, concept: 0, steps: 0, stepCtl: 0, units: 0, dims: 0, params: 0, tests: 0, shots: 0 },
  )
  lines.push(
    `| **合计** | ${tot.labs} | — | ${tot.action}（${pct(tot.action, tot.labs)}%） | ${tot.concept}（${pct(tot.concept, tot.labs)}%） | ${tot.steps} | ${tot.stepCtl}（${pct(tot.stepCtl, tot.labs)}%） | ${tot.units} | ${tot.dims}（${pct(tot.dims, tot.labs)}%） | ${tot.params} | ${tot.tests} | ${tot.shots} |`,
  )
  lines.push('')
  lines.push('读法提醒：')
  lines.push('')
  lines.push('- `hasAction` 是**组件级**结论：一个组件服务 N 个 Lab 时，这 N 行会同时为真（例如 g5 `MotionLab` 服务 5 个 Lab）。所以它不代表「每个 Lab 都有各自专属的操作」。')
  lines.push('- `hasConceptPrompt` 对 g2–g4 为 0，原因是**这三册的 Lab 页根本没有渲染 `ConceptTip`**（数据层有 `tip`，页面从不读），不是这些题没有概念。这是本轮量出来的结构性缺口。')
  lines.push('- `hasUnits` 对 g1–g4 很低/为 0，原因是这三册数据 schema **没有 `units` 字段**（只有 g5/g6 有）。同样不是「题里没有单位」，而是「单位写不进数据层」。')
  for (const g of order) {
    const G = res.grades[g]
    lines.push(
      `- ${g} 的组件共享情况：${G.sharedComponentLabs} 个 Lab 与其他 Lab 共用一个组件，${G.ownComponentLabs} 个 Lab 独占一个组件——共用组件时「有操作」是**同一批按钮**在服务多道题。`,
    )
  }
  lines.push('- 「组件内步骤列表」只统计**组件自己** v-for 渲染的步骤；g2–g6 的 Lab 页统一渲染 `compute` 返回的 `steps` 文字（人人都有），所以真正稀缺的是「步进控件」与「过程态图形变化」。')
  lines.push('- `testsCount` 只数断言条数，不判断断言质量；`shotCount` 只数文件个数，不判断截图上图形对不对。')
  lines.push('')
  lines.push('## 2. 逐 Lab 明细')
  lines.push('')
  lines.push('图例：✅ 有 / ❌ 无；`组件` 列的 `*` 表示该组件被多个 Lab 共享。')
  lines.push('')
  for (const g of order) {
    const G = res.grades[g]
    lines.push(`### ${g}（${G.labCount} 个 Lab，${G.componentCount} 个组件）`)
    lines.push('')
    lines.push('| id | 页 | kind | 组件 | 操作 | 概念追问 | 组件步骤列表 | 步进控件 | 单位 | 尺寸/方格 | 参数 | 断言 | 截图 |')
    lines.push('| --- | ---: | --- | --- | :-: | :-: | :-: | :-: | :-: | :-: | ---: | ---: | ---: |')
    for (const r of G.labs) {
      const comp = r.component ? `${path.basename(r.component)}${r.componentScope === 'shared' ? '*' : ''}` : '—'
      lines.push(
        `| \`${r.id}\` | ${r.page} | ${r.kind} | ${comp} | ${r.hasAction ? '✅' : '❌'} | ${r.hasConceptPrompt ? '✅' : '❌'} | ${r.hasStepList ? '✅' : '❌'} | ${r.hasStepIndex ? '✅' : '❌'} | ${r.hasUnits ? '✅' : '❌'} | ${r.hasDims ? '✅' : '❌'} | ${r.paramsCount} | ${r.testsCount} | ${r.shotCount} |`,
      )
    }
    lines.push('')
  }
  lines.push('## 3. 方法（可复现）')
  lines.push('')
  for (const [k, v] of Object.entries(res.method)) lines.push(`- **${k}**：${v}`)
  lines.push('')
  lines.push('复现：`node scripts/visual-metrics.mjs`（只读；全六册约 3 秒）。')
  lines.push('')
  return `${lines.join('\n')}\n`
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
