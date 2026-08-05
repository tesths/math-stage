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
      <div class="rate-chips">
        <span class="rate-chip">1 千米 = 1000 米</span>
        <span class="rate-chip">1 米 = 10 分米</span>
        <span class="rate-chip">1 分米 = 10 厘米</span>
        <span class="rate-chip">1 厘米 = 10 毫米</span>
      </div>
      <p class="tip">{{ mixValue }} {{ fromUnit }} = {{ mixResult }} {{ toUnit }}</p>
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
  max-width: 24rem;
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
  max-width: 26rem;
}
.tip b {
  color: var(--ui-primary);
}
.dm-visual,
.road-visual {
  width: 100%;
  max-width: 24rem;
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
.rate-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.25rem 0.6rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
}
</style>
