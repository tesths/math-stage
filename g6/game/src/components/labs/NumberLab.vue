<script setup lang="ts">
/**
 * 数与运算 Lab：数位与计数单位 / 数的大小比较 / 运算意义一致性 / 二进制的秘密
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toBinary, toFixed2 } from '@/lib/engine/math'
import {
  CARRY_DEMO,
  binaryBits,
  binaryDivisionSteps,
  binaryReading,
  carryBoundary,
  comparePair,
  greaterThan,
  opExample,
  parseValue,
  placeExample,
  placeRows,
} from '@/lib/labs/numberSys'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 数位与计数单位（与 compute 共用同一份数据） ---------- */
const place = computed(() => placeExample(props.values.sel ?? 0))
const beads = (n: number) => Array.from({ length: Math.min(n, 12) }, (_, i) => i)

/* ---------- 满十进一的现场（同一单元的核心：相邻计数单位进率 10） ---------- */
/**
 * 参与演示的进位链（低 → 高）。「千」的上一级「万」不在数位表里，
 * 所以「千」不作为被加的那一位；表里每个数都至少有一位落在链上。
 */
const CARRY_CHAIN: { low: string; high: string }[] = [
  { low: '一', high: '十' },
  { low: '十', high: '百' },
  { low: '百', high: '千' },
  { low: '十分之一', high: '一' },
  { low: '百分之一', high: '十分之一' },
]

const PLACE_NAMES: Record<string, string> = {
  一: '个位',
  十分之一: '十分位',
  百分之一: '百分位',
  千分之一: '千分位',
}
function placeName(unit: string): string {
  return PLACE_NAMES[unit] ?? `${unit}位`
}
/** 展示用的数值文本：去掉浮点尾巴（0.040000000000001 → 0.04） */
function cleanText(v: number): string {
  return String(Number(v.toFixed(6)))
}
/** 拆成「整数串 + 小数串」，进位全程用整数运算，避免 3.36 + 0.04 这类浮点噪声 */
function decimalParts(v: number): { int: string; frac: string } {
  const s = String(Math.abs(v))
  const dot = s.indexOf('.')
  return dot < 0 ? { int: s, frac: '' } : { int: s.slice(0, dot), frac: s.slice(dot + 1) }
}

const carryOn = ref(false)
function toggleCarry(): void {
  carryOn.value = !carryOn.value
}

/**
 * 挑一位「最接近满十」的计数单位（并列时取较低位），把这一位加到 10 个，
 * 于是这一位写 0、向前一位进 1（如 231 的十位 3 个十 ＋ 7 个十 = 10 个十 = 1 个百 → 301）。
 */
const carryDemo = computed(() => {
  const rows = place.value.rows.filter((r) => CARRY_CHAIN.some((c) => c.low === r.unit))
  let pick = rows[rows.length - 1]!
  for (const r of rows) if (r.val > pick.val) pick = r
  const chain = CARRY_CHAIN.find((c) => c.low === pick.unit)!
  const need = 10 - pick.val
  const { int, frac } = decimalParts(place.value.v)
  const scale = frac.length ? 10 ** frac.length : 1
  const perUnit = Math.round(pick.pow * scale)
  /** 进位前的数、要加上的量、进位后的数（都用整数算，单位是 scale 分之一） */
  const toInt = Number(int + frac) + need * perUnit
  const toNum = toInt / scale
  const idx = CARRY_DEMO.findIndex((d) => d.low === pick.unit && d.high === chain.high)
  const start = Math.max(0, Math.min(idx - 1, CARRY_DEMO.length - 4))
  return {
    low: pick.unit,
    high: chain.high,
    have: pick.val,
    need,
    add: (need * perUnit) / scale,
    from: place.value.v,
    to: toNum,
    toRows: placeRows(toNum),
    /** 进率条滑到包含当前这一对（低 → 高）的 4 个 chip，做到与现场同步 */
    strip: CARRY_DEMO.slice(start, start + 4),
  }
})
const carryStrip = computed(() => carryDemo.value.strip)

/* ---------- 数的大小比较 ---------- */
const pair = computed(() => comparePair(props.values.sel ?? 0))

/* ---------- 运算意义一致性 ---------- */
const op = computed(() => opExample(props.values.sel ?? 0))

/* ---------- 二进制的秘密 ---------- */
const dec = computed(() => Math.round(props.values.dec ?? 5))
const bin = computed(() => toBinary(dec.value))
/** 位权按实际位数算（原来写死 5 位，位数一多就会标错权重） */
const bits = computed(() => binaryBits(dec.value))
const binarySteps = computed(() => binaryDivisionSteps(dec.value))
const reading = computed(() => binaryReading(bin.value))
const boundary = computed(() => carryBoundary(dec.value))

/* ==================== 大小比较：统一计数单位 ==================== */
/**
 * 化成相同的计数单位再比较：把两个数都表示成同一个计数单位的个数。
 * 分数用精确比值（`parseValue`：2/3 → 2 与 3），**不能**写成 Number('2/3')（那是 NaN）。
 * 计数单位取 1/lcm(分母)：小数 → 0.01 这类十进制单位，分数 → 1/15 这类分数单位。
 */
const cmpOn = ref(false)
function toggleCmp(): void {
  cmpOn.value = !cmpOn.value
}
function gcdInt(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) [x, y] = [y, x % y]
  return x
}
function lcmInt(a: number, b: number): number {
  return (a / gcdInt(a, b)) * b
}
/** 计数单位的文字写法：1 → 1；10/100/1000 → 0.1/0.01/0.001；其他 → 1/15 */
function unitTextOf(L: number): string {
  if (L === 1) return '1'
  return /^10+$/.test(String(L)) ? `0.${'0'.repeat(String(L).length - 2)}1` : `1/${L}`
}
const cmpUnified = computed(() => {
  const p = pair.value
  const a = parseValue(p.a)
  const b = parseValue(p.b)
  const L = lcmInt(a.d, b.d)
  const ca = Math.round((a.n * L) / a.d)
  const cb = Math.round((b.n * L) / b.d)
  return {
    L,
    unitText: unitTextOf(L),
    ca,
    cb,
    /** 符号由 numberSys 的精确比较给出（与 compute 同一份判定） */
    gt: greaterThan(p.a, p.b),
    barA: Math.round((ca / Math.max(ca, cb)) * 100),
    barB: Math.round((cb / Math.max(ca, cb)) * 100),
  }
})
watch(pair, () => {
  cmpOn.value = false
})

/* ==================== 运算一致性：换一个计数单位看同一个运算 ==================== */
/** 同一个结果、不同的计数单位说法（个数 × 单位值 = 结果，结果恒等） */
const opViews = computed(() => {
  const e = op.value
  const out: { unit: string; unitVal: number; count: number }[] = []
  const push = (unitVal: number, unit: string): void => {
    const q = e.value / unitVal
    const rounded = Math.round(q)
    // 只保留「个数是整数且不为 0」的计数单位（如 4.65 = 465 个 0.01、= 4650 个 0.001）
    if (rounded !== 0 && Math.abs(q - rounded) < 1e-9) out.push({ unit, unitVal, count: rounded })
  }
  if (/^1\/\d+$/.test(e.unit)) {
    // 分数：把分数单位继续平均分（1/5 → 1/10 → 1/20 …）
    const d = Number(e.unit.split('/')[1])
    for (const mult of [1, 2, 4, 5, 10]) push(1 / (d * mult), `1/${d * mult}`)
  } else {
    for (const [unitVal, unit] of [
      [100, '100'],
      [10, '10'],
      [1, '1'],
      [0.1, '0.1'],
      [0.01, '0.01'],
      [0.001, '0.001'],
      [0.0001, '0.0001'],
    ] as const) {
      push(unitVal, unit)
    }
  }
  return out
})
const opViewIdx = ref(0)
const opView = computed(() => opViews.value[Math.min(opViewIdx.value, opViews.value.length - 1)]!)
function cycleOpUnit(): void {
  opViewIdx.value = (opViewIdx.value + 1) % opViews.value.length
}
/** 展示用的单位叫法：1 → 一、10 → 十、100 → 百；小数与分数单位照写 */
const OP_UNIT_LABELS: Record<string, string> = { '1': '一', '10': '十', '100': '百', '1000': '千' }
function opUnitLabel(unit: string): string {
  return OP_UNIT_LABELS[unit] ?? unit
}
watch(op, () => {
  opViewIdx.value = 0
})

/* ==================== 二进制：逐位改写（÷2 取余，余数倒序） ==================== */
const binStep = ref(0)
const binRewriteSteps = computed(() => {
  const out: { expr: string; quotient: number; remainder: number }[] = []
  let v = Math.max(0, dec.value)
  if (v === 0) return [{ expr: '0 ÷ 2', quotient: 0, remainder: 0 }]
  while (v > 0) {
    out.push({ expr: `${v} ÷ 2`, quotient: Math.floor(v / 2), remainder: v % 2 })
    v = Math.floor(v / 2)
  }
  return out
})
const binShownSteps = computed(() => binRewriteSteps.value.slice(0, binStep.value))
const binStepDone = computed(() => binStep.value >= binRewriteSteps.value.length)
/** 余数**倒序**拼接 = 二进制（末位余数写在最左边） */
const binFromRemainders = computed(() => binRewriteSteps.value.map((s) => s.remainder).reverse().join(''))
function nextBinStep(): void {
  if (binStepDone.value) return
  binStep.value += 1
}
function resetBinStep(): void {
  binStep.value = 0
}
watch(dec, () => {
  binStep.value = 0
})
</script>

<template>
  <div class="num-wrap">
    <!-- 数位与计数单位 -->
    <template v-if="kind === 'place-value'">
      <p class="pv-num">{{ place.label }}</p>
      <div class="pv-table">
        <div v-for="r in place.rows" :key="r.unit" class="pv-row">
          <span class="pv-unit">{{ r.unit }}</span>
          <div class="pv-beads">
            <span v-for="i in beads(r.val)" :key="i" class="pv-bead" />
          </div>
          <span class="pv-pow">{{ r.val }} × {{ toFixed2(r.pow) }}</span>
        </div>
      </div>
      <p class="note">{{ place.powText }}</p>
      <div class="carry-strip" aria-label="相邻计数单位的进率">
        <span
          v-for="d in carryStrip"
          :key="d.low"
          class="carry-chip"
          :class="{ hot: carryOn && d.low === carryDemo.low }"
        >
          {{ d.lowCount }} 个{{ d.low }} = 1 个{{ d.high }}
        </span>
      </div>
      <button
        type="button"
        class="carry-btn"
        :class="{ active: carryOn }"
        :aria-pressed="carryOn"
        @click="toggleCarry"
 data-act>
        {{ carryOn ? '收起满十进一的现场' : '满十进一：把最接近满十的那一位加到 10' }}
      </button>
      <div v-if="carryOn" class="carry-live" aria-label="满十进一的现场">
        <span class="carry-live-title">满十进一的现场</span>
        <span class="carry-live-row">
          {{ carryDemo.have }} 个{{ carryDemo.low }}
          <b>＋{{ carryDemo.need }} 个{{ carryDemo.low }}</b>
          ＝ 10 个{{ carryDemo.low }} ＝ 1 个{{ carryDemo.high }}
          <em>这一位写 0，向前一位进 1</em>
        </span>
        <span class="carry-live-row carry-sum">
          {{ cleanText(carryDemo.from) }} ＋ {{ cleanText(carryDemo.add) }} = {{ cleanText(carryDemo.to) }}
        </span>
        <span class="carry-live-row carry-digits">
          进位后数位：
          {{ carryDemo.toRows.map((r) => `${placeName(r.unit)} ${r.val}`).join('、') }}
          （共 {{ cleanText(carryDemo.to) }}）
        </span>
      </div>
      <p class="verify-line">
        ✓ {{ place.text }}；最高位是{{ place.rows[0]!.unit }}，最低位是{{ place.rows[place.rows.length - 1]!.unit }}，相邻计数单位的进率都是 10
      </p>
    </template>

    <!-- 数的大小比较 -->
    <template v-else-if="kind === 'compare-unit'">
      <div class="cmp-card">
        <p class="cmp-big">
          {{ pair.a }} <span class="cmp-sym">{{ pair.gt ? '>' : '<' }}</span> {{ pair.b }}
        </p>
        <p class="cmp-how">{{ pair.how }}</p>
        <button
          type="button"
          class="cmp-step-btn"
          :class="{ active: cmpOn }"
          :aria-pressed="cmpOn"
          data-test="cmp-step"
          @click="toggleCmp"
 data-act>
          {{ cmpOn ? '收起统一计数单位' : '统一计数单位再比较' }}
        </button>
        <!-- 统一计数单位：都化成同一个计数单位的个数 -->
        <div
          v-if="cmpOn"
          class="cmp-unified"
          aria-label="统一计数单位"
          data-test="cmp-unified"
          :data-unit="cmpUnified.unitText"
          :data-count-a="cmpUnified.ca"
          :data-count-b="cmpUnified.cb"
          :data-symbol="cmpUnified.gt ? '>' : '<'"
        >
          <p class="cmp-unit-line">统一计数单位：<b>{{ cmpUnified.unitText }}</b>（两个数都化成这个单位的个数）</p>
          <div class="cmp-count-row">
            <span class="cmp-count-num">{{ pair.a }}</span>
            <span class="cmp-bar"><i :style="{ width: cmpUnified.barA + '%' }" /></span>
            <span class="cmp-count-text">{{ cmpUnified.ca }} 个 {{ cmpUnified.unitText }}</span>
          </div>
          <div class="cmp-count-row">
            <span class="cmp-count-num">{{ pair.b }}</span>
            <span class="cmp-bar"><i :style="{ width: cmpUnified.barB + '%' }" /></span>
            <span class="cmp-count-text">{{ cmpUnified.cb }} 个 {{ cmpUnified.unitText }}</span>
          </div>
          <p class="cmp-count-conclude" data-test="cmp-conclude">
            计数单位相同（都是 {{ cmpUnified.unitText }}），比个数：{{ cmpUnified.ca }}
            {{ cmpUnified.gt ? '>' : '<' }} {{ cmpUnified.cb }} → {{ pair.a }} {{ cmpUnified.gt ? '>' : '<' }} {{ pair.b }}
          </p>
        </div>
        <p class="note">比较数的大小 = 比较相同计数单位的个数</p>
      </div>
    </template>

    <!-- 运算意义一致性 -->
    <template v-else-if="kind === 'op-consistency'">
      <div class="cmp-card">
        <p class="cmp-big">{{ op.expr }} = {{ op.ans }}</p>
        <p class="cmp-how">{{ op.how }}</p>
        <!-- 换一个计数单位看同一个运算：结果恒等 -->
        <div
          class="op-unit-panel"
          aria-label="换一个计数单位"
          data-test="op-unit-panel"
          :data-view="opViewIdx"
          :data-views="opViews.length"
        >
          <button type="button" class="cmp-step-btn" data-test="op-unit-cycle" @click="cycleOpUnit" data-act>
            换一个计数单位（第 {{ opViewIdx + 1 }}/{{ opViews.length }} 种说法）
          </button>
          <p
            class="op-unit-line"
            data-test="op-unit-line"
            :data-unit="opView.unit"
            :data-count="opView.count"
            :data-value="op.value"
          >
            {{ op.ans }} = <b>{{ opView.count }}</b> 个 {{ opUnitLabel(opView.unit) }}
          </p>
          <p class="op-unit-check" data-test="op-unit-check">
            {{ opView.count }} × {{ opView.unit }} = {{ op.ans }}（单位个数 × 单位值 = 结果，换单位结果不变）
          </p>
          <div class="unit-pills">
            <span v-for="i in Math.min(opView.count, 12)" :key="i" class="unit-pill">{{ opUnitLabel(opView.unit) }}</span>
            <span v-if="opView.count > 12" class="unit-pill">…共 {{ opView.count }} 个</span>
          </div>
        </div>
        <p class="note">四则运算都是把相同计数单位的个数进行计算</p>
      </div>
    </template>

    <!-- 二进制的秘密 -->
    <template v-else>
      <p class="pv-num">十进制 {{ dec }} = 二进制（{{ bin }}）₂</p>
      <div class="bin-counter">
        <div v-for="bt in bits" :key="bt.weight" class="bin-bit">
          <span class="bin-weight">{{ bt.weight }}</span>
          <div class="bin-beads">
            <span v-for="i in bt.count" :key="i" class="bin-bead" />
          </div>
          <span class="bin-digit">{{ bt.bit }}</span>
        </div>
      </div>
      <div class="carry-demo">
        <div class="cd-group">
          <span class="cd-label">1 位权</span>
          <div class="cd-beads">
            <span class="cd-bead" />
            <span class="cd-bead" />
          </div>
          <span class="cd-expr">1 + 1 = 2</span>
        </div>
        <span class="cd-arrow">满二进一 →</span>
        <div class="cd-group">
          <span class="cd-label">2 位权</span>
          <div class="cd-beads">
            <span class="cd-bead big" />
          </div>
          <span class="cd-expr">2 个 1 = 1 个 2</span>
        </div>
      </div>
      <div class="bin-steps">
        <p v-for="(s, i) in binarySteps" :key="i" class="bin-step">
          {{ s.expr }} → {{ s.result }}
        </p>
      </div>
      <!-- 逐位改写：÷2 取余，一步一位，最后把余数倒序拼出来 -->
      <div class="bin-rewrite" aria-label="逐位改写">
        <div class="bin-rewrite-bar">
          <button type="button" class="cmp-step-btn" :disabled="binStepDone" data-act data-test="bin-step" @click="nextBinStep">
            {{
              binStep === 0
                ? '逐位改写：÷2 取余（第 1 步）'
                : binStepDone
                  ? '改写完成'
                  : `再改写一位（第 ${binStep + 1} 步）`
            }}
          </button>
          <button v-if="binStep > 0" type="button" class="cmp-step-btn" data-test="bin-reset" @click="resetBinStep">
            复位
          </button>
          <span class="bin-rewrite-count">已改写 {{ binStep }}/{{ binRewriteSteps.length }} 步</span>
        </div>
        <ol v-if="binStep > 0" class="bin-rewrite-steps">
          <li
            v-for="(s, i) in binShownSteps"
            :key="i"
            class="bin-rewrite-step"
            data-test="bin-step-item"
            :data-quotient="s.quotient"
            :data-remainder="s.remainder"
          >
            {{ s.expr }} → 商 {{ s.quotient }} 余 {{ s.remainder }}<em>记下余数 {{ s.remainder }}</em>
          </li>
        </ol>
        <p
          v-if="binStepDone"
          class="bin-rewrite-result"
          data-test="bin-rewrite-result"
          :data-binary="bin"
          :data-from-remainders="binFromRemainders"
        >
          余数倒着拼：{{ binFromRemainders.split('').join(' ') }} → （{{ binFromRemainders }}）₂，正好是 {{ dec }} 的二进制（{{ bin }}）₂
        </p>
      </div>
      <div class="carry-live" aria-label="满二进一的现场">
        <span class="carry-live-title">满二进一的现场（当前数附近）</span>
        <span class="carry-live-row">
          {{ boundary.from }} = （{{ boundary.fromBin }}）₂
          <b>＋1</b>
          {{ boundary.to }} = （{{ boundary.toBin }}）₂
          <em>位不够就向前进一位</em>
        </span>
      </div>
      <p class="verify-line">
        ✓ 十进制 {{ dec }} = 二进制（{{ bin }}）₂，读作"{{ reading }}"（二进制要逐位读，不能读成几十几）
      </p>
      <p class="note">二进制的位权从右往左是 1、2、4、8…，每一位上的数只能是 0 或 1，满 2 就向前进一位</p>
    </template>
  </div>
</template>

<style scoped>
.num-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.carry-strip,
.carry-live {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  align-items: center;
}
.carry-live {
  flex-direction: column;
  gap: 0.2rem;
}
.carry-live-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ui-text-muted);
}
.carry-live-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: ui-monospace, monospace;
  font-size: 0.95rem;
  color: var(--ui-text-highlighted);
}
.carry-live-row b {
  color: var(--ui-warning, #f59e0b);
}
.carry-live-row em {
  font-style: normal;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.carry-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.2rem 0.6rem;
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
/* 正在演示的那一对计数单位（低 → 高）在进率条上高亮 */
.carry-chip.hot {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  color: var(--ui-primary);
}
.carry-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.28rem 0.8rem;
  cursor: pointer;
}
.carry-btn:hover {
  border-color: var(--ui-primary);
}
.carry-btn.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
}
.carry-live-row.carry-sum {
  font-size: 1.02rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.carry-live-row.carry-digits {
  font-size: 0.84rem;
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  max-width: 44rem;
}
.pv-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.pv-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.pv-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.pv-unit {
  width: 4rem;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: right;
}
.pv-beads {
  display: flex;
  gap: 2px;
  min-width: 8.5rem;
}
.pv-bead {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border: 1px solid var(--ui-primary);
}
.pv-pow {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
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
  gap: 0.6rem;
  align-items: center;
}
.cmp-big {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-sym {
  color: var(--ui-primary);
}
.cmp-how {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.cmp-step-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.28rem 0.8rem;
  cursor: pointer;
}
.cmp-step-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
}
.cmp-step-btn.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
}
.cmp-step-btn:disabled {
  opacity: 0.55;
  cursor: default;
}
.cmp-unified {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: stretch;
  width: 100%;
  border-top: 1px dashed var(--ui-border-accented);
  padding-top: 0.5rem;
}
.cmp-unit-line {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.cmp-unit-line b {
  color: var(--ui-primary);
  font-size: 1rem;
}
.cmp-count-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cmp-count-num {
  width: 3.2rem;
  text-align: right;
  font-family: ui-monospace, monospace;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.cmp-bar {
  flex: 1;
  height: 0.75rem;
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  overflow: hidden;
}
.cmp-bar i {
  display: block;
  height: 100%;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.cmp-count-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  min-width: 7rem;
  text-align: left;
}
.cmp-count-conclude {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
.op-unit-panel {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  width: 100%;
  border-top: 1px dashed var(--ui-border-accented);
  padding-top: 0.5rem;
}
.op-unit-line {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.op-unit-line b {
  color: var(--ui-primary);
  font-size: 1.1rem;
}
.op-unit-check {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
.bin-rewrite {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  align-items: center;
  width: 100%;
}
.bin-rewrite-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.bin-rewrite-count {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-weight: 700;
}
.bin-rewrite-steps {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: ui-monospace, monospace;
  font-size: 0.88rem;
  color: var(--ui-text-highlighted);
}
.bin-rewrite-step em {
  font-style: normal;
  margin-left: 0.4rem;
  font-size: 0.75rem;
  color: var(--ui-warning, #f59e0b);
  font-weight: 700;
}
.bin-rewrite-result {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  font-family: ui-monospace, monospace;
}
.unit-pills {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.unit-pill {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border: 1px solid var(--ui-primary);
  color: var(--ui-primary);
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
}
.bin-counter {
  display: flex;
  gap: 0.8rem;
}
.bin-bit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.6rem;
  background: var(--ui-bg-muted);
}
.bin-weight {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.bin-beads {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 6rem;
  justify-content: flex-start;
}
.bin-bead {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.bin-digit {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.carry-demo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 1rem;
}
.cd-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.cd-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-muted);
}
.cd-beads {
  display: flex;
  gap: 3px;
}
.cd-bead {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.cd-bead.big {
  width: 1.3rem;
  height: 1.3rem;
  background: var(--ui-warning, #f59e0b);
}
.cd-expr {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.cd-arrow {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.bin-steps {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
</style>
