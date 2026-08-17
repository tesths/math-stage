<script setup lang="ts">
/**
 * 长度单位 Lab：毫米/厘米/分米/米/千米之间的换算
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { LENGTH_MM, LENGTH_UNITS } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const hasCmMm = computed(() => props.values.cm !== undefined && props.values.mm !== undefined && props.values.m === undefined)
const hasMCm = computed(() => props.values.m !== undefined && props.values.cm !== undefined)
const hasKm = computed(() => props.values.to !== undefined && props.values.value !== undefined && props.values.from === undefined)
const hasMix = computed(() => props.values.from !== undefined)

/* mm-cm */
const cm = computed(() => props.values.cm ?? 18)
const mm = computed(() => props.values.mm ?? 6)
const totalMm = computed(() => cm.value * 10 + mm.value)
const cmMarks = computed(() => Array.from({ length: Math.max(cm.value + 1, 20) }, (_, i) => i))

/* m-cm → dm */
const mVal = computed(() => props.values.m ?? 1)
const cmVal = computed(() => props.values.cm ?? 90)
const totalCm = computed(() => mVal.value * 100 + cmVal.value)

/* km-m */
const kmVal = computed(() => props.values.value ?? 3)
const meters = computed(() => kmVal.value * 1000)

/* mix */
const mixValue = computed(() => props.values.value ?? 45)
const fromIdx = computed(() => Math.round(props.values.from ?? 0))
const toIdx = computed(() => Math.round(props.values.to ?? 1))
const fromUnit = computed(() => LENGTH_UNITS[fromIdx.value]!)
const toUnit = computed(() => LENGTH_UNITS[toIdx.value]!)
const mixResult = computed(() => (mixValue.value * LENGTH_MM[fromUnit.value]) / LENGTH_MM[toUnit.value])
const formatLen = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
const unitLadder = computed(() => {
  const low = Math.min(fromIdx.value, toIdx.value)
  const high = Math.max(fromIdx.value, toIdx.value)
  return LENGTH_UNITS.map((unit, index) => ({
    unit,
    index,
    active: index >= low && index <= high,
    endpoint: index === fromIdx.value || index === toIdx.value,
  }))
})
const conversionSteps = computed(() => {
  if (fromIdx.value === toIdx.value) return []
  const dir = fromIdx.value < toIdx.value ? 1 : -1
  const steps: Array<{ from: string; to: string; op: '×' | '÷'; factor: number }> = []
  for (let i = fromIdx.value; i !== toIdx.value; i += dir) {
    const from = LENGTH_UNITS[i]!
    const to = LENGTH_UNITS[i + dir]!
    const factor = dir > 0 ? LENGTH_MM[to] / LENGTH_MM[from] : LENGTH_MM[from] / LENGTH_MM[to]
    steps.push({ from, to, op: dir > 0 ? '÷' : '×', factor })
  }
  return steps
})
const mixPathText = computed(() => [fromUnit.value, ...conversionSteps.value.map((step) => step.to)].join(' → '))
const mixOperationText = computed(() => conversionSteps.value.map((step) => `${step.op}${step.factor}`).join('，'))
const mixDecomposition = computed(() => {
  if (toIdx.value - fromIdx.value !== 1) return ''
  const factor = LENGTH_MM[toUnit.value] / LENGTH_MM[fromUnit.value]
  const whole = Math.floor(mixValue.value / factor)
  const rest = mixValue.value % factor
  if (!rest) return ''
  return `${mixValue.value} ${fromUnit.value} = ${whole} ${toUnit.value} ${rest} ${fromUnit.value}`
})
</script>

<template>
  <div class="len-wrap">
    <!-- 毫米与厘米 -->
    <template v-if="hasCmMm">
      <svg viewBox="0 0 340 120" class="ruler-svg">
        <rect x="20" y="50" width="300" height="30" rx="4" class="ruler-body" />
        <line
          v-for="i in cmMarks"
          :key="i"
          :x1="20 + (i * 300) / Math.max(cm + 1, 20)"
          :y1="50"
          :x2="20 + (i * 300) / Math.max(cm + 1, 20)"
          :y2="i % 10 === 0 ? 64 : 58"
          class="ruler-mark"
        />
        <text
          v-for="i in cmMarks"
          :key="'t' + i"
          :x="20 + (i * 300) / Math.max(cm + 1, 20)"
          :y="44"
          text-anchor="middle"
          class="ruler-label"
        >{{ i }}</text>
        <rect
          :x="20 + ((cm) * 300) / Math.max(cm + 1, 20)"
          :y="48"
          :width="(mm * 300) / (Math.max(cm + 1, 20) * 10)"
          height="36"
          class="ruler-highlight"
        />
      </svg>
      <div class="formula-row">
        <span class="chip">{{ cm }} 厘米 = {{ cm * 10 }} 毫米</span>
        <span class="chip op">+</span>
        <span class="chip">{{ mm }} 毫米</span>
        <span class="chip result">= {{ totalMm }} 毫米</span>
      </div>
      <p class="tip">1 厘米 = 10 毫米。{{ cm }} 厘米 {{ mm }} 毫米 = {{ cm * 10 }} + {{ mm }} = <b>{{ totalMm }}</b> 毫米</p>
    </template>

    <!-- 米与厘米 → 分米 -->
    <template v-else-if="hasMCm">
      <div class="dm-visual">
        <div class="dm-meter">
          <span v-for="i in 20" :key="i" class="dm-seg" :class="{ fill: i <= Math.round(totalCm / 10) }" />
        </div>
        <p class="dm-label">1 米 = 10 分米 = 100 厘米</p>
      </div>
      <div class="formula-row">
        <span class="chip">{{ mVal }} 米 = {{ mVal * 10 }} 分米</span>
        <span class="chip op">+</span>
        <span class="chip">{{ cmVal }} 厘米 = {{ Math.round(cmVal / 10) }} 分米</span>
        <span class="chip result">= {{ Math.round(totalCm / 10) }} 分米</span>
      </div>
      <p class="tip">10 厘米是 1 分米。{{ mVal }} 米 {{ cmVal }} 厘米 = {{ Math.round(totalCm / 10) }} 分米</p>
    </template>

    <!-- 千米与米 -->
    <template v-else-if="hasKm">
      <div class="road-visual">
        <div class="road-bar">
          <span v-for="i in 10" :key="i" class="road-seg" :class="{ fill: i <= (kmVal * 10) / 3 }" />
        </div>
        <div class="road-labels">
          <span>0</span>
          <span>{{ kmVal }} 千米</span>
          <span>{{ meters }} 米</span>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip result">{{ kmVal }} 千米 = {{ kmVal }} × 1000 = {{ meters }} 米</span>
      </div>
      <p class="tip">1 千米 = 1000 米。10 个 100 米是 1000 米，1000 米就是 1 千米。</p>
    </template>

    <!-- 综合换算 -->
    <template v-else>
      <div class="unit-ladder" aria-label="长度单位换算路径">
        <template v-for="(item, index) in unitLadder" :key="item.unit">
          <div class="unit-step" :class="{ active: item.active, endpoint: item.endpoint }">
            <span class="unit-dot" />
            <span>{{ item.unit }}</span>
          </div>
          <span v-if="index < unitLadder.length - 1" class="unit-rate">×10</span>
        </template>
      </div>
      <div class="mix-visual">
        <div class="mix-cell">
          <p class="mix-big">{{ mixValue }}</p>
          <p class="mix-unit">{{ fromUnit }}</p>
        </div>
        <span class="convert-arrow">⇄</span>
        <div class="mix-cell">
          <p class="mix-big">{{ mixResult }}</p>
          <p class="mix-unit">{{ toUnit }}</p>
        </div>
      </div>
      <div class="path-card">
        <p class="path-title">换算路径：{{ mixPathText }}</p>
        <p class="path-detail">
          <template v-if="conversionSteps.length">
            从小单位到大单位用除法，从大单位到小单位用乘法：{{ mixOperationText }}。
          </template>
          <template v-else>
            原单位和目标单位相同，数值保持不变。
          </template>
        </p>
        <p v-if="mixDecomposition" class="path-detail strong">{{ mixDecomposition }}</p>
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
.ruler-mark {
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
.ruler-label {
  fill: var(--ui-text-muted);
  font-size: 10px;
}
.ruler-highlight {
  fill: color-mix(in srgb, var(--ui-primary) 45%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
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
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
  font-weight: 800;
}
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.tip {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
.tip b {
  color: var(--ui-primary);
}
.dm-visual,
.road-visual {
  width: 100%;
  max-width: 34rem;
}
.dm-meter {
  display: flex;
  gap: 2px;
}
.dm-seg {
  flex: 1;
  height: 1.4rem;
  border-radius: 2px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
}
.dm-seg.fill {
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border-color: var(--ui-primary);
}
.dm-label {
  font-size: 0.82rem;
  color: var(--ui-text-muted);
  text-align: center;
  margin-top: 0.4rem;
}
.road-bar {
  display: flex;
  gap: 2px;
}
.road-seg {
  flex: 1;
  height: 1.2rem;
  border-radius: 2px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
}
.road-seg.fill {
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border-color: var(--ui-primary);
}
.road-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
}
.mix-visual {
  display: flex;
  gap: 1.2rem;
  align-items: center;
}
.unit-ladder {
  display: grid;
  grid-template-columns: repeat(9, auto);
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
}
.unit-step {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.32rem 0.7rem;
  font-size: 0.82rem;
  color: var(--ui-text-muted);
}
.unit-step.active {
  border-color: color-mix(in srgb, var(--ui-primary) 45%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
  color: var(--ui-text-toned);
}
.unit-step.endpoint {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.unit-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: currentColor;
}
.unit-rate {
  color: var(--ui-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
}
.mix-cell {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.7rem 1.3rem;
  text-align: center;
  min-width: 6rem;
}
.mix-big {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.mix-unit {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.convert-arrow {
  font-size: 1.4rem;
  color: var(--ui-text-muted);
}
.rate-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.path-card {
  width: min(100%, 34rem);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: color-mix(in srgb, var(--ui-bg-muted) 75%, transparent);
  padding: 0.65rem 0.9rem;
  text-align: center;
}
.path-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.path-detail {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.path-detail.strong {
  color: var(--ui-primary);
  font-weight: 800;
}
.rate-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.25rem 0.6rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
}
@media (max-width: 520px) {
  .unit-ladder {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .unit-step {
    justify-content: center;
  }
  .unit-rate {
    display: none;
  }
  .mix-visual {
    gap: 0.6rem;
  }
  .mix-cell {
    min-width: 5rem;
    padding: 0.55rem 0.8rem;
  }
}
</style>
