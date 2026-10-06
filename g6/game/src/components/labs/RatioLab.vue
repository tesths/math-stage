<script setup lang="ts">
/**
 * 比和比例 Lab：比的认识 / 比值与形状 / 化简比 / 按比例分配 / 比例性质 / 解比例 / 黄金比
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { gcd, simplifyRatio, toFixed2, toFixedN } from '@/lib/engine/math'

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
 */
const multipleText = computed(() => {
  const a = ra.value
  const b = rb.value
  if (!b) return '—'
  const g = gcd(a, b)
  const n = a / g
  const d = b / g
  let rest = d
  while (rest % 2 === 0) rest /= 2
  while (rest % 5 === 0) rest /= 5
  if (rest === 1) return String(Number((a / b).toFixed(6)))
  return `${n}/${d} ≈ ${toFixedN(a / b, 3)}`
})

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

/* ---------- 比例的基本性质 ---------- */
const pa = computed(() => Math.round(props.values.a ?? 4))
const pb = computed(() => Math.round(props.values.b ?? 2))
const pk = computed(() => Math.round(props.values.k ?? 2))
const pc = computed(() => pa.value * pk.value)
const pd = computed(() => pb.value * pk.value)
const outerProd = computed(() => pa.value * pd.value)
const innerProd = computed(() => pb.value * pc.value)

/* ---------- 解比例 · 糖水 ---------- */
const sa = computed(() => Math.round(props.values.a ?? 25))
const sb = computed(() => Math.round(props.values.b ?? 200))
const sc = computed(() => Math.round(props.values.c ?? 300))
const sx = computed(() => (sa.value * sc.value) / sb.value)

/* ---------- 黄金比 ---------- */
const gw = computed(() => props.values.w ?? 200)
/**
 * 黄金比的近似值 0.618：只在这里定义一次（可被参数 `ratio` 覆盖），
 * 图形、文案、算式都引用它，避免"改一处、别处还对不上"。
 */
const GOLDEN_RATIO = computed(() => props.values.ratio ?? 0.618)
const GOLDEN_TEXT = computed(() => toFixedN(GOLDEN_RATIO.value, 3))
const gl = computed(() => gw.value / GOLDEN_RATIO.value)
const gtotal = computed(() => gw.value + gl.value)
/** 画出的黄金长方形：高度 = 宽度 × 0.618，宽度受限时高度同步受限，比例始终是 1.618:1 */
const goldW = computed(() => Math.min(gl.value, 320))
const goldH = computed(() => goldW.value * GOLDEN_RATIO.value)
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
            class="preset-btn"
            :class="{ active: hitValuePreset(p) }"
            :aria-pressed="hitValuePreset(p)"
            @click="applyValuePreset(p)"
          >
            {{ p.label }}<span v-if="hitValuePreset(p)" class="preset-hit">✓ 当前</span>
          </button>
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
          <span class="gold-part long" :style="{ flexGrow: gl }">较长 {{ toFixed2(gl) }}</span>
          <span class="gold-part short" :style="{ flexGrow: gw }">较短 {{ toFixed2(gw) }}</span>
        </div>
        <p class="ratio-big">
          {{ toFixed2(gw) }} : {{ toFixed2(gl) }} ≈ <b>{{ toFixed2(gw / gl) }}</b>
        </p>
        <p class="sim-step">长 = 宽 ÷ {{ GOLDEN_TEXT }} = {{ toFixed2(gw) }} ÷ {{ GOLDEN_TEXT }} = {{ toFixed2(gl) }}</p>
        <p class="sim-step">较短 : 较长 ≈ 较长 : 全长，即 {{ toFixed2(gw) }} : {{ toFixed2(gl) }} ≈ {{ toFixed2(gl) }} : {{ toFixed2(gtotal) }}</p>
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
