<script setup lang="ts">
/**
 * 用字母表示数量关系 Lab：青蛙歌 / 正方形 / 路程
 * 参数代入字母式，直观展示数量关系
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* 青蛙歌 */
const n = computed(() => Math.round(props.values.n ?? 0))
const frogs = computed(() => Array.from({ length: Math.min(n.value, 20) }, (_, i) => i + 1))

/* 正方形 */
const a = computed(() => props.values.a ?? 0)
const perimeter = computed(() => 4 * a.value)
const squareArea = computed(() => a.value * a.value)
const gridSize = 320
const cell = computed(() => gridSize / Math.max(a.value, 1))
const drawSize = computed(() => Math.min(a.value * cell.value, gridSize))

/* 路程 */
const v = computed(() => props.values.v ?? 0)
const t = computed(() => props.values.t ?? 0)
const s = computed(() => v.value * t.value)
const speedUnit = computed(() => props.lab.params.find((p) => p.key === 'v')?.unit ?? '米/分')
</script>

<template>
  <div class="formula-wrap">
    <!-- 青蛙歌 -->
    <template v-if="kind === 'frog'">
      <div class="frog-area">
        <span v-for="i in frogs" :key="i" class="frog">🐸</span>
        <span v-if="n > 20" class="frog-more">…共 {{ n }} 只</span>
      </div>
      <div class="frog-counts">
        <div class="count-box">
          <p class="count-num">{{ n }}</p>
          <p class="count-label">张嘴</p>
        </div>
        <div class="count-box">
          <p class="count-num">{{ 2 * n }}</p>
          <p class="count-label">只眼睛（2n）</p>
        </div>
        <div class="count-box">
          <p class="count-num">{{ 4 * n }}</p>
          <p class="count-label">条腿（4n）</p>
        </div>
      </div>
      <p class="formula-line">n 只青蛙 → n 张嘴，<b>2n</b> 只眼睛，<b>4n</b> 条腿</p>
    </template>

    <!-- 正方形 -->
    <template v-else-if="kind === 'square'">
      <svg viewBox="0 0 340 300" class="w-full">
        <rect :x="(340 - drawSize) / 2" :y="(300 - drawSize) / 2" :width="drawSize" :height="drawSize" class="square-fill" rx="3" />
        <text
          :x="340 / 2"
          :y="(300 - drawSize) / 2 - 12"
          text-anchor="middle"
          class="dim-label"
        >
          边长 a = {{ a }} 厘米
        </text>
        <text :x="(340 + drawSize) / 2 + 10" :y="300 / 2 + 4" class="dim-label">a</text>
        <text :x="340 / 2" :y="300 / 2" text-anchor="middle" class="area-label">
          S = a × a = {{ squareArea }}
        </text>
      </svg>
      <div class="formula-row">
        <span class="formula-chip">C = 4a = {{ perimeter }} 厘米</span>
        <span class="formula-chip">S = a² = {{ squareArea }} 平方厘米</span>
      </div>
    </template>

    <!-- 路程 -->
    <template v-else>
      <svg viewBox="0 0 360 240" class="w-full">
        <line x1="20" y1="150" x2="340" y2="150" class="road" />
        <line v-for="i in 13" :key="i" :x1="20 + i * 25" :y1="150" :x2="20 + i * 25" :y2="158" class="road-mark" />
        <circle v-for="i in 13" :key="'c' + i" :cx="20 + i * 25" :cy="140" r="2.5" class="dist-dot" />
        <text x="0" y="132" class="road-label">0</text>
        <text x="300" y="132" class="road-label">s = {{ s }} {{ speedUnit }}</text>
        <g :style="{ transform: `translate(${Math.min(320, s) * 2.6}px, 0)`, transition: 'transform .5s' }">
          <text x="0" y="120" font-size="34">🚗</text>
        </g>
      </svg>
      <div class="formula-row">
        <span class="formula-chip">速度 v = {{ v }} {{ speedUnit }}</span>
        <span class="formula-chip">时间 t = {{ t }} 分</span>
        <span class="formula-chip primary">路程 s = v × t = {{ s }} {{ speedUnit }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.formula-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.frog-area {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-width: 420px;
  justify-content: center;
}
.frog {
  font-size: 1.7rem;
}
.frog-more {
  font-size: 1.2rem;
  color: var(--ui-text-muted);
  align-self: center;
}
.frog-counts {
  display: flex;
  gap: 1rem;
}
.count-box {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 1rem;
  text-align: center;
}
.count-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.count-label {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.formula-line {
  font-size: 1.05rem;
  color: var(--ui-text-highlighted);
}
.formula-line b {
  color: var(--ui-primary);
}
.square-fill {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  transition: all 0.4s;
}
.area-label {
  font-size: 1.1rem;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.dim-label,
.road-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
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
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.formula-chip.primary {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
.road {
  stroke: var(--ui-text-muted);
  stroke-width: 4;
}
.road-mark {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
}
.dist-dot {
  fill: var(--ui-primary);
}
</style>
