<script setup lang="ts">
/**
 * 比和比例 Lab：比的认识 / 比值与形状 / 化简比 / 按比例分配 / 比例性质 / 解比例 / 黄金比
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { gcd, simplifyRatio, toFixed2, toFixedN } from '@/lib/engine/math'
import { fractionDecimal, fractionText } from '@/lib/labs/fractions'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/**
 * 预设按钮改写参数后递增。
 * 真实页面传进来的是 reactive 对象，靠它自己就能触发重渲染；
 * 这里额外留一个版本号，保证父级若传入普通对象（测试/特殊用法）时预设结果也照样渲染出来。
 */
const paramRev = ref(0)

/** 读取参数值；依赖 paramRev，使预设按钮写入后必然重算并重渲染 */
function param(key: string, fallback: number): number {
  void paramRev.value
  const v = props.values[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/* ---------- 比的认识 · 橙汁饮料 ---------- */
const ra = computed(() => Math.round(param('a', 3)))
const rb = computed(() => Math.round(param('b', 2)))

/**
 * 水位基准：两杯共用一个「满杯」份数，取自本 Lab 参数声明的 max（a、b 中较大者）。
 * 这样杯高比 = 份数比，参数 max 改动后水位自动跟着改，不再写死除以 8。
 */
const cupCap = computed(() => {
  const caps = props.lab.params
    .filter((p) => p.key === 'a' || p.key === 'b')
    .map((p) => p.max)
    .filter((m) => typeof m === 'number' && Number.isFinite(m) && m > 0)
  return caps.length ? Math.max(...caps) : 8
})
/** 水位高度（百分比）：份数 ÷ 同一基准，保证两杯高度比 = 份数比 */
function fillPct(part: number): string {
  return `${(part / cupCap.value) * 100}%`
}
/**
 * 倍数文案：能除尽就给精确小数（3:2 → 1.5、1:8 → 0.125），
 * 除不尽给最简分数 + 三位小数近似（1:3 → 1/3 ≈ 0.333），不再把 1/3 写成 0.33。
 * 抽成 x÷y 的通用算法：前项÷后项与互换后的后项÷前项共用同一份算理。
 */
function multipleOf(x: number, y: number): string {
  if (!y) return '—'
  const g = gcd(x, y)
  const n = x / g
  const d = y / g
  let rest = d
  while (rest % 2 === 0) rest /= 2
  while (rest % 5 === 0) rest /= 5
  if (rest === 1) return String(Number((x / y).toFixed(6)))
  return `${n}/${d} ≈ ${toFixedN(x / y, 3)}`
}
const multipleText = computed(() => multipleOf(ra.value, rb.value))
/** 前项与后项互换后的比值：它与原比值互为倒数，但「谁与谁比」变了、意义也就变了 */
const swapText = computed(() => multipleOf(rb.value, ra.value))
const introSwapped = ref(false)
function toggleIntroSwap(): void {
  introSwapped.value = !introSwapped.value
}

/* ---------- 比值与形状 · 长方形名片 ---------- */
const w = computed(() => Math.round(param('w', 90)))
const h = computed(() => Math.round(param('h', 54)))
const ratioVal = computed(() => w.value / h.value)
/** 必须用 computed 保存化简结果：写成 `const [sn, sd] = computed(...).value` 会在 setup 期就取快照，拖动后不再更新 */
const simp = computed(() => simplifyRatio(w.value, h.value))

/** 课本例题预设：宽 54 不在 h 的滑块步进网格上（min 20 / step 5），用按钮一键取到课本数值 */
interface ValuePreset {
  label: string
  w: number
  h: number
}
const VALUE_PRESETS: ValuePreset[] = [
  { label: '90 : 54', w: 90, h: 54 },
  { label: '90 : 45', w: 90, h: 45 },
  { label: '80 : 40', w: 80, h: 40 },
]
/** 点击预设：直接写回响应式的 props.values（同时 bump 版本号，保证非 reactive 入参也会重渲染） */
function applyValuePreset(p: ValuePreset): void {
  props.values.w = p.w
  props.values.h = p.h
  paramRev.value++
}
/** 当前参数是否命中该预设（模板据此打高亮 + aria-pressed） */
function hitValuePreset(p: ValuePreset): boolean {
  return w.value === p.w && h.value === p.h
}

/* ---------- 等值比 → 形状相同（缩放对照） ---------- */
/**
 * 把最简比按 ×1 / ×2 / ×3 画成同一形状的三个大小：三张图共用一个格子边长，
 * 于是长宽比 = 化简后的比值；比值相等 ↔ 形状相同，只是大小不同。
 */
const SCALE_STEPS = [1, 2, 3]
const scaleK = ref(1)
function nextScale(): void {
  scaleK.value = scaleK.value >= SCALE_STEPS.length ? 1 : scaleK.value + 1
}
const shapeScales = computed(() => {
  const [sn, sd] = simp.value
  /** 共用的格子边长：最大的那一档（×3）也不超过 160px */
  const cell = Math.min(14, 160 / (Math.max(sn, sd) * SCALE_STEPS.length))
  return SCALE_STEPS.map((k) => {
    const sw = sn * k
    const sh = sd * k
    return { k, label: `${sw} : ${sh}`, width: sw * cell, height: sh * cell, value: sw / sh }
  })
})
/** 未选中的档位（按钮文案里提示下一档是多少） */
const scaleNext = computed(() => (scaleK.value >= SCALE_STEPS.length ? 1 : scaleK.value + 1))

/* ---------- 化简比 ---------- */
const SIMPLIFY_EXAMPLES = [
  { label: '12 : 18', expr: '同时除以 6（12 和 18 的最大公因数）', ans: '2 : 3', a: 12, b: 18, group: 6 },
  { label: '5/6 : 3/4', expr: '同时乘 12（6 和 4 的最小公倍数）', ans: '10 : 9' },
  { label: '1.8 : 0.09', expr: '同时乘 100 化成整数比，再化简', ans: '20 : 1' },
  { label: '0.32 : 0.8', expr: '同时乘 100 得 32 : 80，再除以 16', ans: '2 : 5' },
]
/** sel 的合法下标（对示例数取模，负值也归一到 0..n-1） */
const selIndex = computed(() => {
  const n = Math.round(param('sel', 0))
  const len = SIMPLIFY_EXAMPLES.length
  return ((n % len) + len) % len
})
const sim = computed(() => SIMPLIFY_EXAMPLES[selIndex.value]!)
/** 四个示例各一个预设按钮，切到哪个就高亮哪个（替代原文塞在参数 unit 里的一串说明） */
interface SelPreset {
  label: string
  sel: number
}
const SIMPLIFY_PRESETS: SelPreset[] = SIMPLIFY_EXAMPLES.map((e, i) => ({ label: e.label, sel: i }))
function applySelPreset(p: SelPreset): void {
  props.values.sel = p.sel
  paramRev.value++
}
function hitSelPreset(p: SelPreset): boolean {
  return selIndex.value === p.sel
}
const simFlow = computed(() => [sim.value.label, sim.value.expr, sim.value.ans])
/** 整数示例：可展示按公因数分组的量条 */
const simBars = computed(() => {
  const s = sim.value
  if (typeof s.a !== 'number' || typeof s.group !== 'number') return null
  const total = s.a + s.b
  return { cellsA: s.a / s.group, cellsB: s.b / s.group, group: s.group, total }
})

/* ---------- 同乘 / 同除的分步轨迹（比的基本性质） ---------- */
/** 把比写成数值（支持 '12'、'1.8'、'5/6'）：判断「每一步的比值都不变」用 */
function numberOf(text: string): number {
  const p = text.split('/')
  return Number(p[0]) / Number(p[1] ?? 1)
}
function ratioValueOf(label: string): number {
  const parts = label.split(':').map((s) => s.trim())
  return numberOf(parts[0]!) / numberOf(parts[1]!)
}
/**
 * 四个示例各自的分步改写：每一步都只是同时乘/除以同一个数，
 * 所以每一步的比值必须完全相同，最后一步一定是最简整数比。
 */
const SIMPLIFY_TRACES: { label: string; op: string }[][] = [
  [
    { label: '12 : 18', op: '原来的比' },
    { label: '6 : 9', op: '前项、后项同时除以 2' },
    { label: '2 : 3', op: '再同时除以 3 → 最简整数比' },
  ],
  [
    { label: '5/6 : 3/4', op: '原来的比' },
    { label: '10 : 9', op: '前后项同时乘 12（分母 6 和 4 的最小公倍数）→ 最简整数比' },
  ],
  [
    { label: '1.8 : 0.09', op: '原来的比' },
    { label: '180 : 9', op: '前后项同时乘 100 化成整数比' },
    { label: '20 : 1', op: '再同时除以 9 → 最简整数比' },
  ],
  [
    { label: '0.32 : 0.8', op: '原来的比' },
    { label: '32 : 80', op: '前后项同时乘 100 化成整数比' },
    { label: '2 : 5', op: '再同时除以 16 → 最简整数比' },
  ],
]
const simTrace = computed(() =>
  SIMPLIFY_TRACES[selIndex.value]!.map((s) => ({ ...s, value: ratioValueOf(s.label) })),
)
const simStep = ref(0)
/** 换示例后可能超出新轨迹的长度，夹取到合法下标 */
const traceStep = computed(() => Math.min(simStep.value, simTrace.value.length - 1))
function nextTraceStep(): void {
  simStep.value = (traceStep.value + 1) % simTrace.value.length
}

/* ---------- 按比例分配 · 青团皮 ---------- */
const da = computed(() => Math.round(props.values.a ?? 3))
const db = computed(() => Math.round(props.values.b ?? 2))
const total = computed(() => props.values.total ?? 500)
const totalParts = computed(() => da.value + db.value)
const per = computed(() => total.value / (da.value + db.value))
const partA = computed(() => per.value * da.value)
const partB = computed(() => per.value * db.value)
const distributeLedger = computed(() => [
  { label: '先求 1 份', value: `${toFixed2(per.value)} 克` },
  { label: `糯米粉 ${da.value} 份`, value: `${toFixed2(partA.value)} 克` },
  { label: `鼠曲草浆 ${db.value} 份`, value: `${toFixed2(partB.value)} 克` },
])
/**
 * 自检：显示出来的"每份 × 份数"必须等于显示出来的"部分"。
 * 早期实现里 166.67 × 2 会写成 333.33（各算各的四舍五入），屏幕上的算式不成立。
 */
const distributeCheck = computed(() => {
  const rp = Math.round(per.value * 100) / 100
  const ra = Math.round(partA.value * 100) / 100
  const rb = Math.round(partB.value * 100) / 100
  const exact = Math.abs(rp * da.value - ra) < 0.005 && Math.abs(rp * db.value - rb) < 0.005
  return {
    exact,
    text: exact
      ? `✓ ${rp} × ${da.value} = ${ra}，${rp} × ${db.value} = ${rb}，${ra} + ${rb} = ${total.value} 克`
      : `✓ 每份除不尽（${total.value} ÷ ${da.value + db.value}），所以用"总数 × 份数占的几分之几"算更准：${total.value} × ${da.value}/${da.value + db.value} = ${ra}，${total.value} × ${db.value}/${da.value + db.value} = ${rb}，合计 ${ra + rb} 克`,
  }
})

/* ---------- 显式三层步进：总份数 → 每份 → 各部分 ---------- */
const DIST_STEPS = ['总份数', '每份', '各部分']
/** 0 = 还没揭示（分步揭示：先不给结论），1/2/3 = 已揭示到第几层 */
const distStep = ref(0)
function nextDistStep(): void {
  distStep.value = distStep.value >= DIST_STEPS.length ? 0 : distStep.value + 1
}
const distNextLabel = computed(() => DIST_STEPS[distStep.value % DIST_STEPS.length]!)
/** 第三步的文案：除不尽时和自检一样改用「总数 × 几分之几」，避免屏幕上的算式不成立 */
const distPartText = computed(() =>
  distributeCheck.value.exact
    ? `糯米粉 = ${toFixed2(per.value)} × ${da.value} = ${toFixed2(partA.value)} 克；鼠曲草浆 = ${toFixed2(per.value)} × ${db.value} = ${toFixed2(partB.value)} 克`
    : `每份除不尽，改用「总数 × 几分之几」：糯米粉 = ${total.value} × ${da.value}/${totalParts.value} = ${toFixed2(partA.value)} 克；鼠曲草浆 = ${total.value} × ${db.value}/${totalParts.value} = ${toFixed2(partB.value)} 克`,
)

/* ---------- 比例的基本性质 ---------- */
const pa = computed(() => Math.round(props.values.a ?? 4))
const pb = computed(() => Math.round(props.values.b ?? 2))
const pk = computed(() => Math.round(props.values.k ?? 2))
const pc = computed(() => pa.value * pk.value)
const pd = computed(() => pb.value * pk.value)
const outerProd = computed(() => pa.value * pd.value)
const innerProd = computed(() => pb.value * pc.value)
/** 交叉相乘的连线高亮：0 = 外项积 a×d，1 = 内项积 b×c */
const crossFocus = ref(0)
function nextCrossFocus(): void {
  crossFocus.value = crossFocus.value === 0 ? 1 : 0
}

/* ---------- 解比例 · 糖水 ---------- */
const sa = computed(() => Math.round(props.values.a ?? 25))
const sb = computed(() => Math.round(props.values.b ?? 200))
const sc = computed(() => Math.round(props.values.c ?? 300))
const sx = computed(() => (sa.value * sc.value) / sb.value)
/**
 * 代入 → 交叉相乘 → 求解。
 * 能除尽写「=」、除不尽写「≈」并附最简分数——判据与 compute.ts 共用 fractions.ts 的实现，避免两处不一致。
 */
const SOLVE_STEPS = ['代入', '交叉相乘', '求解']
/** 0 = 还没揭示（先不给结论），1/2/3 = 已揭示到第几步 */
const solveStep = ref(0)
function nextSolveStep(): void {
  solveStep.value = solveStep.value >= SOLVE_STEPS.length ? 0 : solveStep.value + 1
}
const solveNextLabel = computed(() => SOLVE_STEPS[solveStep.value % SOLVE_STEPS.length]!)
const sxFrac = computed(() => fractionDecimal(sa.value * sc.value, sb.value, 2))
/** 除得尽用等号、除不尽用约等号 */
const sxEq = computed(() => (sxFrac.value.exact ? '=' : '≈'))
const sxFracText = computed(() => fractionText(sa.value * sc.value, sb.value))

/* ---------- 黄金比 ---------- */
const gw = computed(() => props.values.w ?? 200)
/**
 * 黄金比的近似值 0.618：只在这里定义一次（可被参数 `ratio` 覆盖），
 * 图形、文案、算式都引用它，避免"改一处、别处还对不上"。
 */
const GOLDEN_RATIO = computed(() => props.values.ratio ?? 0.618)
const GOLDEN_TEXT = computed(() => toFixedN(GOLDEN_RATIO.value, 3))
/** 长：可拖动的参数，学生自己调；默认 250 并不满足黄金比，等着被拖准或一键吸附 */
const gl = computed(() => param('l', 250))
/** 当前比值 = 宽 ÷ 长；越接近 0.618 越接近黄金长方形 */
const curRatio = computed(() => gw.value / gl.value)
/** 当前比值与黄金比的差（吸附后为 0，实时跟着参数变） */
const ratioDiff = computed(() => Math.abs(curRatio.value - GOLDEN_RATIO.value))
/** 差小于 0.005 时，显示到三位小数看不出区别 → 认为已经到达黄金比 */
const goldenHit = computed(() => ratioDiff.value < 0.005)
/** 黄金比对应的长 = 宽 ÷ 0.618：吸附按钮写回的就是它 */
const goldenLen = computed(() => gw.value / GOLDEN_RATIO.value)
const goldenTotal = computed(() => gw.value + goldenLen.value)
/** 线段图里谁长谁短按当前参数决定（长可能被拖得比宽还小） */
const longer = computed(() => Math.max(gw.value, gl.value))
const shorter = computed(() => Math.min(gw.value, gl.value))
/**
 * 画出的长方形：水平 = 长、垂直 = 宽，沿用 goldW/goldH 那套"封顶 320px + 同一比例尺"的算法。
 * 没吸附时画的就是"现在这个长方形"（能看出偏离）；吸附到黄金比后
 * goldH = goldW × 0.618，长宽比才真的是 1.618:1。
 */
const goldW = computed(() => Math.min(gl.value, 320))
const goldH = computed(() =>
  goldenHit.value ? goldW.value * GOLDEN_RATIO.value : goldW.value * (gw.value / gl.value),
)
/** 一键吸附：把「长」写成 宽 ÷ 0.618（保留两位小数，仍落在滑块网格上） */
function applyGoldenSnap(): void {
  props.values.l = Math.round(goldenLen.value * 100) / 100
  paramRev.value++
}
</script>

<template>
  <div class="ratio-wrap">
    <!-- 比的认识 -->
    <template v-if="kind === 'ratio-intro'">
      <div class="juice">
        <div class="cup-set">
          <div class="cup">
            <div class="cup-fill juice-a" :style="{ height: fillPct(ra) }" />
            <span class="cup-label">{{ ra }} 杯</span>
            <span class="cup-name">纯橙汁</span>
          </div>
          <div class="cup">
            <div class="cup-fill juice-b" :style="{ height: fillPct(rb) }" />
            <span class="cup-label">{{ rb }} 杯</span>
            <span class="cup-name">水</span>
          </div>
        </div>
        <p class="ratio-big">
          纯橙汁 : 水 = <b>{{ ra }} : {{ rb }}</b>
        </p>
        <p class="note">前项 {{ ra }}，后项 {{ rb }}；表示橙汁是水的 {{ multipleText }} 倍</p>
        <p class="note">两杯同高、同一水位基准（满杯 {{ cupCap }} 份），杯内高度比就是份数比 {{ ra }} : {{ rb }}</p>
        <div class="swap-box" aria-label="前项后项互换对照">
          <button
            type="button"
            class="step-btn"
            :class="{ on: introSwapped }"
            :aria-pressed="introSwapped"
            @click="toggleIntroSwap"
 data-act>
            {{ introSwapped ? '收起互换对照' : '互换前项与后项，看看意义变没变' }}
          </button>
          <template v-if="introSwapped">
            <p class="swap-line">
              原来：纯橙汁 : 水 = {{ ra }} : {{ rb }}，比值 = {{ ra }} ÷ {{ rb }} = {{ multipleText }}，表示橙汁是水的
              {{ multipleText }} 倍
            </p>
            <p class="swap-line">
              互换：水 : 纯橙汁 = {{ rb }} : {{ ra }}，比值 = {{ rb }} ÷ {{ ra }} = {{ swapText }}，表示水是橙汁的
              {{ swapText }} 倍
            </p>
            <p class="swap-line">
              互换后两个比值互为倒数（精确值相乘 = 1）；但比的前项、后项换了位置，「谁与谁比」变了，比的意义也就变了
            </p>
          </template>
        </div>
      </div>
    </template>

    <!-- 比值与形状 -->
    <template v-else-if="kind === 'ratio-value'">
      <div class="card-block">
        <div class="rect" :style="{ width: `${Math.min(w, 220)}px`, height: `${Math.min(h, 150)}px` }">
          <span class="rect-lb">{{ w }}</span>
          <span class="rect-ht">{{ h }}</span>
        </div>
        <p class="ratio-big">
          {{ w }} : {{ h }} = <b>{{ toFixed2(ratioVal) }}</b>（最简比 {{ simp[0] }}:{{ simp[1] }}）
        </p>
        <p class="note">长 ÷ 宽 = 比值；比值相等的长方形形状相同</p>
        <div class="preset-row" aria-label="课本例题预设">
          <button
            v-for="p in VALUE_PRESETS"
            :key="p.label"
            type="button"
            :data-act="hitValuePreset(p) ? null : ''"
            class="preset-btn"
            :class="{ active: hitValuePreset(p) }"
            :aria-pressed="hitValuePreset(p)"
            @click="applyValuePreset(p)"
          >
            {{ p.label }}<span v-if="hitValuePreset(p)" class="preset-hit">✓ 当前</span>
          </button>
        </div>
        <div class="shape-scale" aria-label="等值比与形状对照">
          <div
            v-for="s in shapeScales"
            :key="s.k"
            class="scale-box"
            :class="{ on: s.k === scaleK }"
            :aria-pressed="s.k === scaleK"
          >
            <div class="scale-rect" :style="{ width: `${s.width}px`, height: `${s.height}px` }" />
            <span class="scale-label">×{{ s.k }} → {{ s.label }}</span>
            <span class="scale-value">比值 {{ toFixed2(s.value) }}</span>
          </div>
          <button type="button" class="step-btn" @click="nextScale">
            换一档大小：×{{ scaleK }} → ×{{ scaleNext }}
          </button>
          <p class="scale-note">
            这三个比都是最简比 {{ simp[0] }}:{{ simp[1] }} 的整数倍，比值都是 {{ toFixed2(ratioVal) }} → 形状相同，只是大小不同
          </p>
        </div>
      </div>
    </template>

    <!-- 化简比 -->
    <template v-else-if="kind === 'ratio-simplify'">
      <div class="cmp-card">
        <p class="ratio-big">{{ sim.label }}</p>
        <div class="preset-row" aria-label="化简示例预设">
          <button
            v-for="p in SIMPLIFY_PRESETS"
            :key="p.label"
            type="button"
            class="preset-btn"
            :class="{ active: hitSelPreset(p) }"
            :aria-pressed="hitSelPreset(p)"
            @click="applySelPreset(p)"
          >
            {{ p.label }}<span v-if="hitSelPreset(p)" class="preset-hit">✓ 当前</span>
          </button>
        </div>
        <div class="sim-flow" aria-label="化简比同步处理流程">
          <span v-for="(step, i) in simFlow" :key="step" class="flow-chip" :class="{ ans: i === simFlow.length - 1 }">
            {{ i === 1 ? '两边同做：' : '' }}{{ step }}
          </span>
        </div>
        <!-- 整数比：按公因数分组量条 -->
        <div v-if="simBars" class="group-bars">
          <div class="gb-row">
            <span class="gb-name">前项 {{ sim.a }}</span>
            <div class="gb-track">
              <span v-for="i in simBars.cellsA" :key="'a' + i" class="gb-cell a">{{ simBars.group }}</span>
            </div>
          </div>
          <div class="gb-row">
            <span class="gb-name">后项 {{ sim.b }}</span>
            <div class="gb-track">
              <span v-for="i in simBars.cellsB" :key="'b' + i" class="gb-cell b">{{ simBars.group }}</span>
            </div>
          </div>
        <p class="gb-note">每 {{ simBars.group }} 个一组：{{ sim.a }} → {{ simBars.cellsA }} 组，{{ sim.b }} → {{ simBars.cellsB }} 组</p>
        </div>
        <p class="sim-step">{{ sim.expr }}</p>
        <p class="sim-ans">
          = <b>{{ sim.ans }}</b>
        </p>
        <div class="trace-box" aria-label="同乘同除的步进">
          <div class="trace-chips">
            <span
              v-for="(s, i) in simTrace"
              :key="s.label"
              class="trace-chip"
              :class="{ on: i === traceStep }"
            >
              {{ s.label }}
            </span>
          </div>
          <p class="trace-line">第 {{ traceStep + 1 }} 步：{{ simTrace[traceStep]!.op }}</p>
          <p class="trace-line">
            现在这个比是 {{ simTrace[traceStep]!.label }}，比值 = {{ toFixed2(simTrace[traceStep]!.value) }}；和原来的比一样（每一步比值都不变）
          </p>
          <button type="button" class="step-btn" @click="nextTraceStep">下一步：同乘 / 同除</button>
        </div>
        <p class="note">前项、后项同时乘或除以相同的数（0 除外），比值不变</p>
      </div>
    </template>

    <!-- 按比例分配 -->
    <template v-else-if="kind === 'ratio-distribute'">
      <div class="card-block">
        <div class="dist-track">
          <div class="dist-part a" :style="{ width: `${(da / totalParts) * 100}%` }">
            <span v-for="i in da" :key="'a' + i" class="dist-cell">{{ i === 1 ? '1 份' : '' }}</span>
          </div>
          <div class="dist-part b" :style="{ width: `${(db / totalParts) * 100}%` }">
            <span v-for="i in db" :key="'b' + i" class="dist-cell">{{ i === 1 ? '1 份' : '' }}</span>
          </div>
        </div>
        <div class="ledger-row" aria-label="按比例分配步骤">
          <span v-for="item in distributeLedger" :key="item.label" class="ledger-chip">
            <small>{{ item.label }}</small>
            <b>{{ item.value }}</b>
          </span>
        </div>
        <p class="sim-step">总份数 = {{ da }} + {{ db }} = {{ totalParts }}，每份 = {{ total }} ÷ {{ totalParts }} = {{ toFixed2(per) }} 克</p>
        <p class="sim-ans">
          糯米粉 = {{ toFixed2(per) }} × {{ da }} = <b>{{ toFixed2(partA) }} 克</b>
          <br />
          鼠曲草浆 = {{ toFixed2(per) }} × {{ db }} = <b>{{ toFixed2(partB) }} 克</b>
        </p>
        <p class="dist-check">{{ distributeCheck.text }}</p>
        <div class="dist-steps" aria-label="按比例分配的三层步进">
          <p v-if="distStep >= 1" class="dist-layer">第 1 步 · 总份数 = {{ da }} + {{ db }} = {{ totalParts }} 份</p>
          <p v-if="distStep >= 2" class="dist-layer">第 2 步 · 每份 = {{ total }} ÷ {{ totalParts }} = {{ toFixed2(per) }} 克</p>
          <p v-if="distStep >= 3" class="dist-layer">第 3 步 · {{ distPartText }}</p>
          <p v-if="distStep >= 3" class="dist-layer">
            合计数 = {{ toFixed2(partA + partB) }} 克 = 总数 {{ total }} 克 ✓（正好分完）
          </p>
          <button type="button" class="step-btn" @click="nextDistStep">下一步：{{ distNextLabel }}</button>
        </div>
      </div>
    </template>

    <!-- 比例的基本性质 -->
    <template v-else-if="kind === 'proportion-basic'">
      <div class="card-block">
        <p class="ratio-big">
          {{ pa }} : {{ pb }} = {{ pc }} : {{ pd }}
        </p>
        <div class="cross-wrap">
          <div class="cross-diagram">
            <div class="cross-term">
              <span class="cross-tag outer">外项</span>
              <span class="cross-num outer">{{ pa }}</span>
            </div>
            <span class="cross-sep">:</span>
            <div class="cross-term">
              <span class="cross-tag inner">内项</span>
              <span class="cross-num inner">{{ pb }}</span>
            </div>
            <span class="cross-sep">=</span>
            <div class="cross-term">
              <span class="cross-tag inner">内项</span>
              <span class="cross-num inner">{{ pc }}</span>
            </div>
            <span class="cross-sep">:</span>
            <div class="cross-term">
              <span class="cross-tag outer">外项</span>
              <span class="cross-num outer">{{ pd }}</span>
            </div>
          </div>
          <p class="cross-hint">交叉相乘：外项 {{ pa }} × {{ pd }}，内项 {{ pb }} × {{ pc }}</p>
        </div>
        <div class="cross-lines-box">
          <svg class="cross-svg" width="260" height="140" viewBox="0 0 260 140" aria-label="交叉相乘的连线">
            <line class="xl outer" :class="{ on: crossFocus === 0 }" x1="62" y1="40" x2="198" y2="104" />
            <line class="xl inner" :class="{ on: crossFocus === 1 }" x1="198" y1="40" x2="62" y2="104" />
            <text class="ctext outer" x="56" y="30" text-anchor="start">外项 {{ pa }}</text>
            <text class="ctext inner" x="204" y="30" text-anchor="end">内项 {{ pb }}</text>
            <text class="ctext inner" x="56" y="124" text-anchor="start">内项 {{ pc }}</text>
            <text class="ctext outer" x="204" y="124" text-anchor="end">外项 {{ pd }}</text>
          </svg>
        </div>
        <p class="cross-product" :class="{ on: crossFocus === 0 }">外项积：{{ pa }} × {{ pd }} = {{ outerProd }}</p>
        <p class="cross-product" :class="{ on: crossFocus === 1 }">内项积：{{ pb }} × {{ pc }} = {{ innerProd }}</p>
        <button type="button" class="step-btn" data-act @click="nextCrossFocus">高亮{{ crossFocus === 0 ? '内项积' : '外项积' }}</button>
        <p class="cross-note">
          两条对角线的积始终相等：{{ pa }} × {{ pd }} = {{ pb }} × {{ pc }} = {{ outerProd }}
        </p>
        <p class="sim-step">
          外项积：{{ pa }} × {{ pd }} = {{ outerProd }}
          <br />
          内项积：{{ pb }} × {{ pc }} = {{ innerProd }}
        </p>
        <p class="sim-ans">
          <b>外项积 = 内项积 = {{ outerProd }}</b>
        </p>
      </div>
    </template>

    <!-- 解比例 -->
    <template v-else-if="kind === 'solve-proportion'">
      <div class="card-block">
        <p class="ratio-big">
          {{ sa }} : {{ sb }} = x : {{ sc }}
        </p>
        <div class="solve-flow" aria-label="解比例步骤">
          <span>列比例</span>
          <span>外项积 = 内项积</span>
          <span>解出 x</span>
        </div>
        <p class="sim-step">
          {{ sb }}x = {{ sa }} × {{ sc }} = {{ sa * sc }}
        </p>
        <p class="sim-ans">
          x = {{ sa * sc }} ÷ {{ sb }} = <b>{{ toFixed2(sx) }} 克</b>
        </p>
        <p class="note">应加入 {{ toFixed2(sx) }} 克糖，糖水才和原来一样甜</p>
        <div class="solve-steps" aria-label="解比例的代入步进">
          <p v-if="solveStep >= 1" class="solve-layer">
            第 1 步 · 代入：设应加 x 克糖，列出比例 {{ sa }} : {{ sb }} = x : {{ sc }}
          </p>
          <p v-if="solveStep >= 2" class="solve-layer">
            第 2 步 · 交叉相乘（外项积 = 内项积）：{{ sb }} × x = {{ sa }} × {{ sc }}，即 {{ sb }}x = {{ sa * sc }}
          </p>
          <p v-if="solveStep >= 3" class="solve-layer">
            第 3 步 · 求解：x = {{ sa * sc }} ÷ {{ sb }} {{ sxEq }} <b>{{ toFixed2(sx) }}</b> 克{{
              sxFrac.exact ? '' : `（除不尽，精确值 ${sxFracText}，所以用约等号）`
            }}
          </p>
          <button type="button" class="step-btn" @click="nextSolveStep">下一步：{{ solveNextLabel }}</button>
        </div>
      </div>
    </template>

    <!-- 黄金比 -->
    <template v-else>
      <div class="card-block">
        <div class="gold-rect" :style="{ width: `${goldW}px`, height: `${goldH}px` }">
          <div class="gold-line" :style="{ left: `${GOLDEN_RATIO * 100}%` }" />
          <span class="gold-leb">{{ toFixed2(gl) }}</span>
        </div>
        <div class="gold-segment" aria-label="黄金比分割线段">
          <span class="gold-part long" :style="{ flexGrow: longer }">较长 {{ toFixed2(longer) }}</span>
          <span class="gold-part short" :style="{ flexGrow: shorter }">较短 {{ toFixed2(shorter) }}</span>
        </div>
        <p class="ratio-big">
          宽 : 长 = {{ toFixed2(gw) }} : {{ toFixed2(gl) }} ≈ <b>{{ toFixedN(curRatio, 3) }}</b>
        </p>
        <p class="gold-diff" :class="{ hit: goldenHit }" aria-label="当前比值与黄金比的差">
          当前比值 {{ toFixedN(curRatio, 3) }}，黄金比 {{ GOLDEN_TEXT }}，相差
          <b>{{ toFixedN(ratioDiff, 3) }}</b>
          <span v-if="goldenHit" class="gold-hit-tip">✓ 已到达黄金比</span>
        </p>
        <div class="preset-row" aria-label="黄金比预设">
          <button
            type="button"
            class="preset-btn"
            :class="{ active: goldenHit }"
            :aria-pressed="goldenHit"
            @click="applyGoldenSnap"
 data-act>
            一键吸附到黄金比<span v-if="goldenHit" class="preset-hit">✓ 当前</span>
          </button>
        </div>
        <p class="sim-step">
          黄金比的长 = 宽 ÷ {{ GOLDEN_TEXT }} = {{ toFixed2(gw) }} ÷ {{ GOLDEN_TEXT }} = {{ toFixed2(goldenLen) }}
        </p>
        <p class="sim-step">
          较短 : 较长 ≈ 较长 : 全长（黄金比的性质），即 {{ toFixed2(gw) }} : {{ toFixed2(goldenLen) }} ≈
          {{ toFixed2(goldenLen) }} : {{ toFixed2(goldenTotal) }}
        </p>
        <p class="note">宽与长的比越接近 {{ GOLDEN_TEXT }}，看起来越协调、越美</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ratio-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.juice,
.card-block {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  width: 100%;
  max-width: 588px;
}
.cup-set {
  display: flex;
  gap: 2.5rem;
  align-items: flex-end;
}
.cup {
  position: relative;
  width: 64px;
  height: 130px;
  border: 2px solid var(--ui-border-accented);
  border-top: none;
  border-radius: 0 0 1rem 1rem;
  background: var(--ui-bg-muted);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}
.cup-fill {
  width: 100%;
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  transition: height 0.3s;
}
.cup-fill.juice-b {
  background: color-mix(in srgb, #38bdf8 55%, white);
}
.cup-label {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.cup-name {
  position: absolute;
  bottom: -1.6rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.ratio-big {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.ratio-big b {
  color: var(--ui-primary);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.rect {
  border: 2px solid var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  position: relative;
  border-radius: var(--ui-radius-lg);
}
.rect-lb {
  position: absolute;
  left: 50%;
  bottom: -1.6rem;
  transform: translateX(-50%);
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.rect-ht {
  position: absolute;
  top: 50%;
  right: -1.9rem;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.cmp-card {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 1rem 1.4rem;
  text-align: center;
  min-width: 16rem;
  max-width: 31rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.sim-step {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.sim-ans {
  font-size: 1rem;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
  text-align: center;
  line-height: 1.7;
}
.sim-ans b {
  color: var(--ui-primary);
}
.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}
.preset-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  padding: 0.28rem 0.7rem;
  cursor: pointer;
}
.preset-btn:hover {
  border-color: var(--ui-primary);
}
.preset-btn.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
}
.preset-hit {
  margin-left: 0.25rem;
}
.sim-flow,
.solve-flow,
.dist-check {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  text-align: center;
}
.ledger-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
}
.flow-chip,
.solve-flow span,
.ledger-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  padding: 0.28rem 0.62rem;
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.flow-chip.ans {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.dist-track {
  display: flex;
  height: 2.6rem;
  border-radius: 0.6rem;
  overflow: hidden;
  width: 100%;
}
.dist-part {
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
  transition: width 0.3s;
}
.dist-cell {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(255, 255, 255, 0.55);
  font-size: 0.72rem;
  color: white;
  font-weight: 700;
  min-width: 1.1rem;
}
.dist-part.a {
  background: var(--ui-primary);
}
.dist-part.b {
  background: color-mix(in srgb, var(--ui-primary) 40%, white);
}
.dist-part.b .dist-cell {
  color: var(--ui-text-highlighted);
}
.ledger-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--ui-radius-lg);
  min-width: 7rem;
}
.ledger-chip small {
  color: var(--ui-text-muted);
  font-size: 0.68rem;
}
.ledger-chip b {
  color: var(--ui-primary);
  font-size: 0.9rem;
}
.group-bars {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}
.gb-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.gb-name {
  min-width: 3.2rem;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: right;
}
/* 每格宽度固定：两行格子一样宽，行长就真实反映化简后的比（2 组 : 3 组） */
.gb-track {
  display: flex;
  gap: 2px;
}
.gb-cell {
  width: 2.1rem;
  height: 1.4rem;
  border-radius: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}
.gb-cell.a {
  background: var(--ui-primary);
}
.gb-cell.b {
  background: #f59e0b;
}
.gb-note {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.cross-wrap {
  position: relative;
  width: 100%;
  max-width: 240px;
}
.cross-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.xl {
  fill: none;
  stroke-width: 2.5;
  stroke-dasharray: 6 4;
}
.xl.outer {
  stroke: #f59e0b;
}
.xl.inner {
  stroke: var(--ui-primary);
}
.cross-diagram {
  display: flex;
  align-items: flex-end;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: center;
}
.cross-term {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.cross-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--ui-text-muted);
}
.cross-tag.outer {
  color: #92400e;
}
.cross-sep {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-text-toned);
  padding-bottom: 0.35rem;
}
.cross-hint {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-weight: 700;
}
.cross-num {
  width: 3rem;
  height: 2.2rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--ui-primary) 20%, transparent);
  border: 1px solid var(--ui-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--ui-text-highlighted);
}
.cross-num.outer {
  background: color-mix(in srgb, #f59e0b 22%, transparent);
  border-color: #f59e0b;
  color: #92400e;
}
.cross-mid {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.gold-rect {
  position: relative;
  border: 2px solid var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border-radius: var(--ui-radius-lg);
}
.gold-line {
  position: absolute;
  top: 0;
  height: 100%;
  width: 2px;
  background: #f59e0b;
}
.gold-leb {
  position: absolute;
  right: -0.2rem;
  bottom: -1.6rem;
  transform: translateX(50%);
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.gold-segment {
  display: flex;
  width: min(100%, 26rem);
  height: 2.4rem;
  overflow: hidden;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
}
.gold-part {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.4rem;
  min-width: 5rem;
  font-size: 0.75rem;
  font-weight: 800;
}
.gold-part.long {
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  color: var(--ui-text-highlighted);
}
.gold-part.short {
  background: color-mix(in srgb, #f59e0b 55%, white);
  color: #78350f;
}
/* 当前比值与 0.618 的差：没到达时给出差多少，到了就打勾 */
.gold-diff {
  border-radius: 8px;
  background: var(--ui-bg-muted);
  border: 1px dashed var(--ui-border-accented);
  color: var(--ui-text-toned);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
}
.gold-diff b {
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
.gold-diff.hit {
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  border-color: var(--ui-success, #16a34a);
  color: var(--ui-success, #16a34a);
}
.gold-hit-tip {
  margin-left: 0.3rem;
}
/* ---------- 操作按钮（与预设按钮分开放，避免影响 .preset-btn.active 的计数断言） ---------- */
.step-btn {
  border: 1px solid var(--ui-primary);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-primary);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.28rem 0.8rem;
  cursor: pointer;
}
.step-btn:hover {
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.step-btn.on {
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
}
/* ---------- 比的认识：前项 / 后项互换对照 ---------- */
.swap-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
}
.swap-line {
  border-radius: 8px;
  background: var(--ui-bg-muted);
  border: 1px dashed var(--ui-border-accented);
  color: var(--ui-text-toned);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  font-family: ui-monospace, monospace;
}
/* ---------- 比值与形状：等值比 → 形状相同 ---------- */
.shape-scale {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 0.7rem;
  width: 100%;
}
.scale-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.45rem 0.6rem;
}
.scale-box.on {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.scale-rect {
  border: 2px solid var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border-radius: 0.3rem;
}
.scale-label {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.scale-value {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.scale-note {
  width: 100%;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  text-align: center;
}
/* ---------- 化简比：同乘 / 同除的分步轨迹 ---------- */
.trace-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
}
.trace-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
}
.trace-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  padding: 0.25rem 0.6rem;
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
  font-family: ui-monospace, monospace;
}
.trace-chip.on {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
}
.trace-line {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
/* ---------- 按比例分配 / 解比例：显式分层步进 ---------- */
.dist-steps,
.solve-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
}
.dist-layer,
.solve-layer {
  border-radius: 8px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  color: var(--ui-text-toned);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  font-family: ui-monospace, monospace;
}
.dist-layer b,
.solve-layer b {
  color: var(--ui-primary);
}
/* ---------- 比例的基本性质：交叉相乘的连线 ---------- */
.cross-lines-box {
  display: flex;
  justify-content: center;
  width: 100%;
}
.cross-svg {
  overflow: visible;
}
.cross-svg .xl {
  stroke-width: 2.5;
  stroke-dasharray: 6 4;
}
.cross-svg .xl.on {
  stroke-width: 5;
  stroke-dasharray: none;
}
.ctext {
  font-size: 0.8rem;
  font-weight: 800;
  font-family: ui-monospace, monospace;
  fill: var(--ui-text-highlighted);
}
.ctext.outer {
  fill: #92400e;
}
.ctext.inner {
  fill: var(--ui-primary);
}
.cross-product {
  border-radius: 8px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  color: var(--ui-text-toned);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.28rem 0.7rem;
  text-align: center;
  font-family: ui-monospace, monospace;
}
.cross-product.on {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  color: var(--ui-primary);
}
.cross-note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
}
@media (max-width: 520px) {
  .cup-set {
    gap: 1.5rem;
  }
  .ratio-big {
    font-size: 1.05rem;
  }
  .gold-part {
    min-width: 4rem;
    font-size: 0.68rem;
  }
}
</style>
