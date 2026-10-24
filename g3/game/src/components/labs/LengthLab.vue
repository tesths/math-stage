<script setup lang="ts">
/**
 * 长度单位 Lab：毫米/厘米/分米/米/千米之间的换算
 *
 * 本轮（第 4 轮）改动：
 * - 单位阶梯的进率由 `rateBetween` 算出来：米→千米 是 ×1000，其余是 ×10
 *   （旧实现把每一格都写死成 ×10，与"1 千米 = 1000 米"直接矛盾，是 L0 真错误）。
 * - 千米路段按"1 小段 = 100 米"画，1 千米正好 10 段（旧实现是 `km*10/3` 的假比例尺）。
 * - 米与厘米那一屏用"每 10 分米排成一整米"的行，行数随数值真的增加（不再截在 20 格）。
 * - 综合换算加了「开始换算」：逐格点亮单位阶梯，过程态与结果同帧刷新（L3）。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { LENGTH_MM, LENGTH_UNITS } from '@/lib/engine/math'
import { conversionSteps, decompose, kmSegments, meterRows, rateLabel } from '@/lib/labs/length'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const hasCmMm = computed(() => props.values.cm !== undefined && props.values.mm !== undefined && props.values.m === undefined)
const hasMCm = computed(() => props.values.m !== undefined && props.values.cm !== undefined)
const hasKm = computed(() => props.values.to !== undefined && props.values.value !== undefined && props.values.from === undefined)
const hasMix = computed(() => props.values.from !== undefined)

/* ---------- 毫米与厘米 ---------- */
const cm = computed(() => Math.round(props.values.cm ?? 18))
const mm = computed(() => Math.round(props.values.mm ?? 6))
const totalMm = computed(() => cm.value * 10 + mm.value)
/** 换算目标：0 = 全部化成毫米，1 = 全部化成厘米（参数不再空转） */
const toMmUnit = computed(() => Math.round(props.values.to ?? 0) === 0)
const mixedResultText = computed(() =>
  toMmUnit.value ? `${totalMm.value} 毫米` : `${(totalMm.value / 10).toFixed(1).replace(/\.0$/, '')} 厘米`,
)
/** 尺子画 30 厘米长：每厘米 10 像素，正好每毫米 1 像素（真实比例） */
const RULER_CM = 30
const PX_PER_CM = 10
const mmTicks = computed(() => Array.from({ length: RULER_CM * 10 + 1 }, (_, i) => i))
const cmLabels = computed(() => Array.from({ length: RULER_CM + 1 }, (_, i) => i).filter((i) => i % 5 === 0 || i === cm.value))

/* ---------- 分米与米 ---------- */
const mVal = computed(() => Math.round(props.values.m ?? 1))
const cmVal = computed(() => Math.round(props.values.cm ?? 90))
const rows = computed(() => meterRows(mVal.value, cmVal.value))
const totalCm = computed(() => mVal.value * 100 + cmVal.value)
/** 换算目标：0 = 分米，1 = 厘米（参数不再空转） */
const toDm = computed(() => Math.round(props.values.to ?? 0) === 0)
const dmResultText = computed(() =>
  toDm.value
    ? `${rows.value.dm} 分米${rows.value.cmRest ? ` ${rows.value.cmRest} 厘米` : ''}`
    : `${totalCm.value} 厘米`,
)

/* ---------- 千米与米 ---------- */
const kmVal = computed(() => Math.round(props.values.value ?? 3))
const meters = computed(() => kmVal.value * 1000)
const segs = computed(() => kmSegments(kmVal.value))

/* ---------- 综合换算 ---------- */
const mixValue = computed(() => Math.round(props.values.value ?? 45))
const fromIdx = computed(() => Math.round(props.values.from ?? 0))
const toIdx = computed(() => Math.round(props.values.to ?? 1))
const fromUnit = computed(() => LENGTH_UNITS[fromIdx.value]!)
const toUnit = computed(() => LENGTH_UNITS[toIdx.value]!)
const mixResult = computed(() => (mixValue.value * LENGTH_MM[fromUnit.value]) / LENGTH_MM[toUnit.value])
const steps = computed(() => conversionSteps(fromIdx.value, toIdx.value))
/** 小数的显示：保留到能看清的有效位（3 米 = 0.003 千米 不能显示成 0） */
const formatLen = (value: number) => {
  if (Number.isInteger(value)) return String(value)
  const fixed = Number(value.toFixed(4))
  return String(fixed)
}
const ladder = computed(() =>
  LENGTH_UNITS.map((unit, index) => ({
    unit,
    index,
    active: index >= Math.min(fromIdx.value, toIdx.value) && index <= Math.max(fromIdx.value, toIdx.value),
    endpoint: index === fromIdx.value || index === toIdx.value,
    rate: index < LENGTH_UNITS.length - 1 ? rateLabel(unit, LENGTH_UNITS[index + 1]!) : '',
  })),
)
const mixPathText = computed(() => [fromUnit.value, ...steps.value.map((step) => step.to)].join(' → '))
const mixOperationText = computed(() => steps.value.map((step) => `${step.symbol}${step.factor}`).join('，'))
/** 单一进率时的复名数拆分（45 毫米 = 4 厘米 5 毫米） */
const mixDecomposition = computed(() => {
  if (Math.abs(toIdx.value - fromIdx.value) !== 1) return ''
  const factor = LENGTH_MM[toUnit.value] / LENGTH_MM[fromUnit.value]
  if (factor <= 1) return ''
  const { whole, rest } = decompose(mixValue.value, factor)
  if (!rest) return ''
  return `${mixValue.value} ${fromUnit.value} = ${whole} ${toUnit.value} ${rest} ${fromUnit.value}`
})

/* ---------- 过程态 ---------- */
const stepIdx = ref(-1)
function nextConvertStep() {
  stepIdx.value = Math.min(stepIdx.value + 1, Math.max(steps.value.length - 1, 0))
}
function resetConvert() {
  stepIdx.value = -1
}
const activeStep = computed(() => (stepIdx.value >= 0 ? steps.value[stepIdx.value] : undefined))
const stepRunning = computed(() => mixValue.value)
const partial = computed(() => {
  if (stepIdx.value < 0) return mixValue.value
  let v = mixValue.value
  for (let i = 0; i <= stepIdx.value && i < steps.value.length; i++) {
    const s = steps.value[i]!
    v = s.symbol === '÷' ? v / s.factor : v * s.factor
  }
  return v
})

/** 千米路段的"数 100 米"过程 */
const countedSeg = ref(0)
function countSegment() {
  countedSeg.value = countedSeg.value >= segs.value.length ? 0 : countedSeg.value + 1
}

/** 分米/毫米的"数一数"过程 */
const counted = ref(false)
function toggleCount() {
  counted.value = !counted.value
}

/**
 * 米/厘米 → 分米：一格一格地量（每格 10 厘米 = 1 分米）。
 * 原来这一支只有现成的格子，没有可点的过程，`-act.png` 与初始态一模一样。
 */
const dmProbe = ref(rows.value.dm)
const dmTotal = computed(() => rows.value.dm)
function nextDmCell() {
  dmProbe.value = dmProbe.value >= dmTotal.value ? 1 : dmProbe.value + 1
}
const dmCellIndex = (ri: number, i: number) => ri * 10 + i
</script>

<template>
  <div class="len-wrap">
    <!-- 毫米与厘米 -->
    <template v-if="hasCmMm">
      <svg viewBox="0 0 340 150" class="ruler-svg">
        <rect x="20" y="60" :width="RULER_CM * PX_PER_CM" height="30" rx="4" class="ruler-body" />
        <line
          v-for="t in mmTicks"
          :key="'t' + t"
          :x1="20 + t"
          :y1="60"
          :x2="20 + t"
          :y2="t % 10 === 0 ? 74 : t % 5 === 0 ? 69 : 65"
          :class="t % 10 === 0 ? 'tick-cm' : 'tick-mm'"
        />
        <text
          v-for="i in cmLabels"
          :key="'l' + i"
          :x="20 + i * PX_PER_CM"
          y="54"
          text-anchor="middle"
          class="ruler-label"
        >{{ i }}</text>
        <!-- 前 cm 厘米：整厘米段 -->
        <rect :x="20" y="58" :width="cm * PX_PER_CM" height="34" class="hl-cm" />
        <!-- 多出的 mm 毫米 -->
        <rect :x="20 + cm * PX_PER_CM" y="58" :width="mm" height="34" class="hl-mm" />
        <text :x="20 + (cm * PX_PER_CM) / 2" y="110" text-anchor="middle" class="dim-text">
          {{ cm }} 厘米 = {{ cm * 10 }} 毫米
        </text>
        <text :x="20 + cm * PX_PER_CM + Math.max(mm / 2, 10)" y="128" text-anchor="middle" class="dim-text mm">
          + {{ mm }} 毫米
        </text>
      </svg>
      <div class="formula-row">
        <span class="chip">{{ cm }} 厘米 = {{ cm * 10 }} 毫米</span>
        <span class="chip op">+</span>
        <span class="chip">{{ mm }} 毫米</span>
        <span class="chip result" data-test="mm-result">= {{ mixedResultText }}</span>
      </div>
      <button type="button" class="len-btn" data-test="len-count" @click="toggleCount">
        {{ counted ? '收起刻度' : '数一数 1 厘米里的毫米' }}
      </button>
      <p v-if="counted" class="tip" data-test="len-tick-note">
        两长刻度之间是 1 厘米，中间有 10 个小格 → 1 厘米 = 10 毫米；{{ cm }} 厘米 {{ mm }} 毫米 = {{ cm * 10 }} + {{ mm }} = <b>{{ totalMm }}</b> 毫米
      </p>
      <p class="tip">1 厘米 = 10 毫米。{{ cm }} 厘米 {{ mm }} 毫米 = {{ cm * 10 }} + {{ mm }} = <b>{{ totalMm }}</b> 毫米</p>
    </template>

    <!-- 米与厘米 → 分米 -->
    <template v-else-if="hasMCm">
      <div class="dm-rows">
        <div v-for="(row, ri) in rows.rows" :key="'row' + ri" class="dm-row">
          <span class="dm-row-label">{{ ri + 1 }} 米</span>
          <span
            v-for="i in 10"
            :key="i"
            class="dm-seg"
            :class="{ fill: i <= row.filled, counted: dmCellIndex(ri, i) <= dmProbe }"
          />
        </div>
        <p class="dm-label">
          {{ mVal }} 米 {{ cmVal }} 厘米 = {{ rows.dm }} 分米{{ rows.cmRest ? ` ${rows.cmRest} 厘米` : '' }}
          （每行 10 格 = 1 米 = 10 分米）
        </p>
      </div>
      <div class="len-buttons">
        <button type="button" class="len-btn primary" data-test="dm-next" @click="nextDmCell">
          试一试：10 厘米一格，一格一格地量（已量 {{ dmProbe }} / {{ dmTotal }} 格 = {{ dmProbe }} 分米）
        </button>
      </div>
      <div class="formula-row">
        <span class="chip">{{ mVal }} 米 = {{ mVal * 10 }} 分米</span>
        <span class="chip op">+</span>
        <span class="chip">{{ cmVal }} 厘米 = {{ Math.floor(cmVal / 10) }} 分米{{ rows.cmRest ? ` ${rows.cmRest} 厘米` : '' }}</span>
        <span class="chip result" data-test="dm-result">= {{ dmResultText }}</span>
      </div>
      <p class="tip">10 厘米是 1 分米，所以 {{ cmVal }} 厘米 = {{ Math.floor(cmVal / 10) }} 分米{{ rows.cmRest ? ` ${rows.cmRest} 厘米` : '' }}；{{ mVal }} 米 {{ cmVal }} 厘米 = <b>{{ rows.dm }} 分米</b>。</p>
    </template>

    <!-- 千米与米 -->
    <template v-else-if="hasKm">
      <div class="road-visual">
        <div class="road-bar">
          <span
            v-for="s in segs"
            :key="s.index"
            class="road-seg"
            :class="{ fill: s.index < countedSeg, edge: s.index % 10 === 0 }"
          />
        </div>
        <div class="road-labels">
          <span>0</span>
          <span>每小段 100 米</span>
          <span>{{ kmVal }} 千米 = {{ meters }} 米</span>
        </div>
      </div>
      <button type="button" class="len-btn" data-test="len-count-km" @click="countSegment">
        数一数 100 米：已数 {{ countedSeg }} 段（{{ countedSeg * 100 }} 米）
      </button>
      <div class="formula-row">
        <span class="chip">{{ kmVal }} 千米</span>
        <span class="chip op">= {{ kmVal }} × 1000</span>
        <span class="chip result">= {{ meters }} 米</span>
      </div>
      <p class="tip">
        1 千米 = 1000 米。图上每小段 100 米，10 小段就是 1000 米；{{ kmVal }} 千米一共 {{ kmVal * 10 }} 小段 = <b>{{ meters }}</b> 米。
      </p>
    </template>

    <!-- 综合换算 -->
    <template v-else>
      <div class="unit-ladder" aria-label="长度单位换算路径">
        <template v-for="item in ladder" :key="item.unit">
          <div
            class="unit-step"
            :class="{ active: item.active, endpoint: item.endpoint, stepping: activeStep && (activeStep.from === item.unit || activeStep.to === item.unit) }"
          >
            <span class="unit-dot" />
            <span>{{ item.unit }}</span>
          </div>
          <span v-if="item.rate" class="unit-rate" :class="{ hot: activeStep && item.unit === activeStep.from }">{{ item.rate }}</span>
        </template>
      </div>
      <div class="mix-visual">
        <div class="mix-cell">
          <p class="mix-big">{{ mixValue }}</p>
          <p class="mix-unit">{{ fromUnit }}</p>
        </div>
        <span class="convert-arrow">⇄</span>
        <div class="mix-cell" :class="{ live: stepIdx >= 0 }">
          <p class="mix-big" data-test="mix-value">{{ formatLen(partial) }}</p>
          <p class="mix-unit">{{ stepIdx >= 0 && activeStep ? activeStep.to : toUnit }}</p>
        </div>
      </div>
      <div class="path-card">
        <p class="path-title">换算路径：{{ mixPathText }}</p>
        <p class="path-detail">
          <template v-if="steps.length">
            从小单位到大单位用除法，从大单位到小单位用乘法：{{ mixOperationText }}。
          </template>
          <template v-else> 原单位和目标单位相同，数值保持不变。 </template>
        </p>
        <p v-if="mixDecomposition" class="path-detail strong">{{ mixDecomposition }}</p>
        <p v-if="activeStep" class="path-detail live" data-test="mix-step">
          第 {{ stepIdx + 1 }} 步：{{ formatLen(stepRunning) }} {{ activeStep.from }}
          {{ activeStep.symbol }} {{ activeStep.factor }} = {{ formatLen(partial) }} {{ activeStep.to }}
        </p>
      </div>
      <div class="len-buttons">
        <button type="button" class="len-btn primary" data-test="mix-next" @click="nextConvertStep">开始换算</button>
        <button type="button" class="len-btn ghost" data-test="mix-reset" @click="resetConvert">重来</button>
      </div>
      <div class="rate-chips">
        <span class="rate-chip">1 千米 = 1000 米</span>
        <span class="rate-chip">1 米 = 10 分米</span>
        <span class="rate-chip">1 分米 = 10 厘米</span>
        <span class="rate-chip">1 厘米 = 10 毫米</span>
      </div>
      <p class="tip">{{ mixValue }} {{ fromUnit }} = {{ formatLen(mixResult) }} {{ toUnit }}</p>
    </template>
  </div>
</template>

<style scoped>
.len-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.ruler-svg {
  width: 100%;
  max-width: 34rem;
}
.ruler-body {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.tick-mm {
  stroke: var(--ui-text-muted);
  stroke-width: 0.6;
}
.tick-cm {
  stroke: var(--ui-text-highlighted);
  stroke-width: 1.4;
}
.ruler-label {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.hl-cm {
  fill: color-mix(in srgb, var(--ui-primary) 32%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 1.2;
}
.hl-mm {
  fill: color-mix(in srgb, var(--ui-error, #dc2626) 55%, transparent);
  stroke: var(--ui-error, #dc2626);
  stroke-width: 1.2;
}
.dim-text {
  font-size: 11px;
  font-weight: 700;
  fill: var(--ui-primary);
}
.dim-text.mm {
  fill: var(--ui-error, #dc2626);
}
.dm-rows {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: flex-start;
}
.dm-row {
  display: flex;
  align-items: center;
  gap: 3px;
}
.dm-row-label {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
  width: 2.6rem;
}
.dm-seg.counted {
  opacity: 1;
  outline: 1px solid var(--ui-primary);
}
.dm-seg {
  width: 18px;
  height: 16px;
  border: 1px solid var(--ui-border-accented);
  border-radius: 2px;
  background: transparent;
}
.dm-seg.fill {
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border-color: var(--ui-primary);
}
.dm-label {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.road-visual {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  width: 100%;
}
.road-bar {
  display: flex;
  gap: 1px;
  width: 100%;
  max-width: 32rem;
}
.road-seg {
  flex: 1;
  height: 18px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--ui-primary) 18%, white);
}
.road-seg.edge {
  border-left: 2px solid var(--ui-primary);
}
.road-seg.fill {
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
}
.road-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 32rem;
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.88rem;
  color: var(--ui-text-toned);
}
.chip.op {
  border-color: var(--ui-warning, #f59e0b);
  color: var(--ui-warning, #f59e0b);
  font-weight: 700;
}
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.tip {
  font-size: 0.86rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
.tip b {
  color: var(--ui-primary);
}
.len-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.len-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.len-btn.ghost {
  color: var(--ui-text-muted);
}
.len-buttons {
  display: flex;
  gap: 0.4rem;
}
.unit-ladder {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex-wrap: wrap;
  justify-content: center;
}
.unit-step {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  padding: 0.15rem 0.55rem;
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  background: var(--ui-bg-muted);
}
.unit-step.active {
  border-color: color-mix(in srgb, var(--ui-primary) 55%, var(--ui-border));
  color: var(--ui-text-toned);
}
.unit-step.endpoint {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.unit-step.stepping {
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
}
.unit-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
}
.unit-rate {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.unit-rate.hot {
  color: var(--ui-primary);
  font-weight: 800;
}
.mix-visual {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.mix-cell {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 1rem;
  text-align: center;
  background: var(--ui-bg-muted);
  min-width: 6rem;
}
.mix-cell.live {
  border-color: var(--ui-primary);
}
.mix-big {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.mix-unit {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.convert-arrow {
  font-size: 1.2rem;
  color: var(--ui-text-muted);
}
.path-card {
  text-align: center;
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.path-title {
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.path-detail.strong {
  color: var(--ui-primary);
  font-weight: 700;
}
.path-detail.live {
  color: var(--ui-primary);
  font-weight: 700;
}
.rate-chips {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}
.rate-chip {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
  border: 1px dashed var(--ui-border);
  border-radius: 9999px;
  padding: 0.1rem 0.5rem;
}
</style>
