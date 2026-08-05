<script setup lang="ts">
/**
 * 周长与面积 Lab：长方形/正方形周长与面积、面积单位量面积
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 长方形（周长/面积） ---------- */
const ra = computed(() => Math.round(props.values.a ?? 8))
const rb = computed(() => Math.round(props.values.b ?? 5))
const rectC = computed(() => (ra.value + rb.value) * 2)
const rectS = computed(() => ra.value * rb.value)

/* ---------- 正方形（周长/面积） ---------- */
const sa = computed(() => Math.round(props.values.a ?? 6))
const squareC = computed(() => sa.value * 4)
const squareS = computed(() => sa.value * sa.value)

/* ---------- 面积单位量面积（网格） ---------- */
const ga = computed(() => Math.round(props.values.a ?? 8))
const gb = computed(() => Math.round(props.values.b ?? 5))
const cell = 26
const gW = computed(() => ga.value * cell)
const gH = computed(() => gb.value * cell)

/* ---------- 图形绘制 ---------- */
const viewW = 360
const viewH = 280
const scale = computed(() => {
  const maxW = ra.value * 14
  const maxH = rb.value * 14
  return Math.min(1, (viewW - 60) / Math.max(maxW, 1), (viewH - 60) / Math.max(maxH, 1))
})
const dw = computed(() => ra.value * 14 * scale.value)
const dh = computed(() => rb.value * 14 * scale.value)
const dx = computed(() => (viewW - dw.value) / 2)
const dy = computed(() => (viewH - dh.value) / 2)

const sqScale = computed(() => {
  const max = sa.value * 14
  return Math.min(1, (viewW - 60) / Math.max(max, 1), (viewH - 60) / Math.max(max, 1))
})
const sqSize = computed(() => sa.value * 14 * sqScale.value)
const sqX = computed(() => (viewW - sqSize.value) / 2)
const sqY = computed(() => (viewH - sqSize.value) / 2)
</script>

<template>
  <div class="shape-wrap">
    <!-- 面积单位量面积 -->
    <template v-if="kind === 'area-grid'">
      <div
        class="grid-box"
        :style="{
          width: gW + 'px',
          height: gH + 'px',
          gridTemplateColumns: `repeat(${ga}, 1fr)`,
        }"
      >
        <span v-for="i in ga * gb" :key="i" class="grid-cell" />
      </div>
      <p class="note">
        每排 {{ ga }} 个 × {{ gb }} 排 = <b>{{ ga * gb }}</b> 个 1 平方厘米
      </p>
    </template>

    <!-- 长方形周长 -->
    <template v-else-if="kind === 'peri-rect'">
      <svg :viewBox="`0 0 ${viewW} ${viewH}`" class="w-full">
        <rect :x="dx" :y="dy" :width="dw" :height="dh" class="rect-fill" />
        <text :x="viewW / 2" :y="dy - 14" text-anchor="middle" class="dim-label">长 a = {{ ra }} 厘米</text>
        <text :x="dx + dw + 12" :y="viewH / 2 + 4" class="dim-label">宽 b = {{ rb }} 厘米</text>
        <text :x="dx - 12" :y="dy + dh / 2" text-anchor="end" class="dim-label">b</text>
        <text :x="dx + dw / 2" :y="dy + dh + 20" text-anchor="middle" class="dim-label">a</text>
      </svg>
      <div class="formula-row">
        <span class="chip">C = (a + b) × 2</span>
        <span class="chip op">({{ ra }} + {{ rb }}) × 2 = {{ rectC }} 厘米</span>
      </div>
    </template>

    <!-- 正方形周长 -->
    <template v-else-if="kind === 'peri-square'">
      <svg :viewBox="`0 0 ${viewW} ${viewH}`" class="w-full">
        <rect :x="sqX" :y="sqY" :width="sqSize" :height="sqSize" class="rect-fill" />
        <text :x="viewW / 2" :y="sqY - 14" text-anchor="middle" class="dim-label">边长 a = {{ sa }} 厘米</text>
        <text :x="sqX + sqSize + 12" :y="viewH / 2 + 4" class="dim-label">a</text>
        <text :x="viewW / 2" :y="viewH / 2" text-anchor="middle" class="center-label">a</text>
      </svg>
      <div class="formula-row">
        <span class="chip">C = a × 4</span>
        <span class="chip op">{{ sa }} × 4 = {{ squareC }} 厘米</span>
      </div>
    </template>

    <!-- 长方形面积 -->
    <template v-else-if="kind === 'area-rect'">
      <svg :viewBox="`0 0 ${viewW} ${viewH}`" class="w-full">
        <rect :x="dx" :y="dy" :width="dw" :height="dh" class="rect-fill" />
        <text :x="viewW / 2" :y="dy - 14" text-anchor="middle" class="dim-label">长 a = {{ ra }} 厘米</text>
        <text :x="viewW / 2" :y="viewH / 2" text-anchor="middle" class="center-label">
          S = a × b = {{ rectS }} 平方厘米
        </text>
      </svg>
      <div class="formula-row">
        <span class="chip">S = a × b</span>
        <span class="chip op">{{ ra }} × {{ rb }} = {{ rectS }} 平方厘米</span>
      </div>
    </template>

    <!-- 正方形面积 -->
    <template v-else>
      <svg :viewBox="`0 0 ${viewW} ${viewH}`" class="w-full">
        <rect :x="sqX" :y="sqY" :width="sqSize" :height="sqSize" class="rect-fill" />
        <text :x="viewW / 2" :y="viewH / 2" text-anchor="middle" class="center-label">
          S = a × a = {{ squareS }} 平方厘米
        </text>
      </svg>
      <div class="formula-row">
        <span class="chip">S = a × a</span>
        <span class="chip op">{{ sa }} × {{ sa }} = {{ squareS }} 平方厘米</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.shape-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.rect-fill {
  fill: color-mix(in srgb, var(--ui-primary) 40%, white);
  stroke: var(--ui-primary);
  stroke-width: 2.5;
  transition: all 0.35s;
}
.dim-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.center-label {
  font-size: 1.1rem;
  font-weight: 800;
  fill: var(--ui-primary);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
}
.chip.op {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
.grid-box {
  display: grid;
  gap: 1px;
  background: var(--ui-border);
  padding: 1px;
  border-radius: 4px;
}
.grid-cell {
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border-radius: 1px;
}
</style>
