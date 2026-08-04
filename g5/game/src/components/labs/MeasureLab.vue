<script setup lang="ts">
/**
 * 测量与单位 Lab：公顷/平方千米换算 + 组合图形分割法求面积
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 公顷 ---------- */
const side = computed(() => props.values.side ?? 100)
const m2 = computed(() => side.value * side.value)
const ha = computed(() => m2.value / 10000)
const km2 = computed(() => m2.value / 1_000_000)
/** 缩放：边长 px（log-ish 映射，保证直观） */
const sidePx = computed(() => Math.min(200, 60 + side.value * 0.14))

/* ---------- 组合图形 ---------- */
const w = computed(() => props.values.w ?? 100)
const h1 = computed(() => props.values.h1 ?? 40)
const h2 = computed(() => props.values.h2 ?? 90)
const sRect = computed(() => w.value * h1.value)
const sTrap = computed(() => ((w.value + w.value / 2) * h2.value) / 2)
const total = computed(() => sRect.value + sTrap.value)
/** 组合图形顶点：矩形（左上）+ 梯形（右下） */
const pondPts = computed(() => {
  const W = 220
  const H1 = (h1.value / 140) * 120
  const H2 = (h2.value / 200) * 130
  return `60,40 ${60 + W},40 ${60 + W},${40 + H1} ${60 + W + W / 2},${40 + H1} ${60 + W + W / 2},${40 + H1 + H2} 60,${40 + H1 + H2}`
})
</script>

<template>
  <div class="measure-wrap">
    <!-- 公顷 -->
    <template v-if="kind === 'hectare'">
      <div class="ha-row">
        <div class="ha-square-box">
          <svg viewBox="0 0 260 260" class="w-full">
            <rect x="30" y="30" :width="sidePx" :height="sidePx" class="square-fill" rx="4" />
            <text :x="30 + sidePx / 2" :y="30 + sidePx + 22" text-anchor="middle" class="dim-label">
              边长 {{ side }} 米
            </text>
            <text :x="30 + sidePx / 2" :y="30 + sidePx / 2" text-anchor="middle" class="m2-label">
              {{ m2 }} m²
            </text>
          </svg>
        </div>
        <div class="ha-convert">
          <div class="convert-row">
            <span class="convert-unit">平方米</span>
            <strong>{{ toFixed2(m2) }}</strong>
          </div>
          <div class="convert-row">
            <span class="convert-unit">公顷</span>
            <strong>{{ toFixed2(ha) }}</strong>
          </div>
          <div class="convert-row">
            <span class="convert-unit">平方千米</span>
            <strong>{{ toFixed2(km2) }}</strong>
          </div>
        </div>
      </div>
      <div class="ref-squares">
        <div class="ref-item">
          <span class="ref-square" style="width: 46px; height: 46px" />
          <p>边长 100 米 = 1 公顷</p>
        </div>
        <div class="ref-item">
          <span class="ref-square" style="width: 84px; height: 84px" />
          <p>边长 1000 米 = 1 平方千米<br />= 100 公顷</p>
        </div>
      </div>
      <p class="note">1 公顷 = 10000 平方米；1 平方千米 = 1000000 平方米 = 100 公顷</p>
    </template>

    <!-- 组合图形 -->
    <template v-else>
      <svg viewBox="0 0 340 260" class="w-full">
        <!-- 分割线（虚线）：长方形 | 梯形 -->
        <line :x1="60 + 220" :y1="40" :x2="60 + 220" :y2="40 + 120" class="split-line" />
        <polygon :points="pondPts" class="pond-fill" />
        <text x="170" y="95" text-anchor="middle" class="dim-label">长方形</text>
        <text x="265" y="150" text-anchor="middle" class="dim-label">梯形</text>
        <text x="60" y="172" text-anchor="start" class="dim-label">长 {{ w }} m</text>
        <text x="295" y="60" class="dim-label">宽 {{ h1 }} m</text>
        <text x="308" y="180" class="dim-label">高 {{ h2 }} m</text>
      </svg>
      <div class="formula-row">
        <span class="formula-chip">S长方形 = {{ w }} × {{ h1 }} = {{ toFixed2(sRect) }} m²</span>
        <span class="formula-chip">S梯形 = ({{ w }} + {{ Math.round(w / 2) }}) × {{ h2 }} ÷ 2 = {{ toFixed2(sTrap) }} m²</span>
        <span class="formula-chip primary">S组合 = {{ toFixed2(total) }} m²</span>
      </div>
      <p class="note">分割成几个简单图形，分别求面积再相加 —— 分割法</p>
    </template>
  </div>
</template>

<style scoped>
.measure-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.ha-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.ha-square-box {
  width: 200px;
}
.square-fill {
  fill: color-mix(in srgb, var(--ui-primary) 40%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  transition: all 0.4s;
}
.m2-label {
  font-size: 0.95rem;
  font-weight: 800;
  fill: var(--ui-text-highlighted);
}
.dim-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.ha-convert {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.convert-row {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  border-bottom: 1px dashed var(--ui-border);
  padding-bottom: 0.25rem;
}
.convert-unit {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  width: 4.5rem;
}
.convert-row strong {
  font-size: 1.15rem;
  color: var(--ui-primary);
}
.ref-squares {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: center;
}
.ref-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.ref-square {
  display: block;
  border: 2px solid var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 25%, transparent);
  border-radius: 4px;
}
.ref-item p {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.pond-fill {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.split-line {
  stroke: var(--ui-primary);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.formula-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.formula-chip.primary {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
</style>
