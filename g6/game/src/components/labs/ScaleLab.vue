<script setup lang="ts">
/**
 * 放大与缩小 Lab：图形的放大与缩小 / 比例尺
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 图形的放大与缩小 ---------- */
const n = computed(() => Math.round(props.values.n ?? 2))
const d = computed(() => Math.round(props.values.d ?? 1))
const shape = computed(() => Math.round(props.values.shape ?? 0))
const f = computed(() => n.value / d.value)
const cell = 16
const isBigger = computed(() => n.value > d.value)

const SHAPES = [
  {
    name: '长方形',
    orig: 'M 0 32 L 64 32 L 64 0 L 0 0 Z',
    scale: (k: number) => `M 0 ${32 * k} L ${64 * k} ${32 * k} L ${64 * k} 0 L 0 0 Z`,
  },
  {
    name: '直角三角形',
    orig: 'M 0 48 L 64 48 L 0 0 Z',
    scale: (k: number) => `M 0 ${48 * k} L ${64 * k} ${48 * k} L 0 0 Z`,
  },
  {
    name: '梯形',
    orig: 'M 16 0 L 48 0 L 64 32 L 0 32 Z',
    scale: (k: number) => `M ${16 * k} 0 L ${48 * k} 0 L ${64 * k} ${32 * k} L 0 ${32 * k} Z`,
  },
]
const current = computed(() => SHAPES[shape.value % SHAPES.length]!)
const gridCols = 14

/* ---------- 对应边标注：底边（红）与高（蓝） ---------- */
const baseLen = computed(() => (shape.value % SHAPES.length === 2 ? 64 : 64))
const heightLen = computed(() => (shape.value % SHAPES.length === 0 ? 32 : shape.value % SHAPES.length === 1 ? 48 : 32))
const baseEdge = computed(() => `M 0 ${heightLen.value} L ${baseLen.value} ${heightLen.value}`)
const baseEdgeS = computed(() => `M 0 ${heightLen.value * f.value} L ${baseLen.value * f.value} ${heightLen.value * f.value}`)
const heightEdge = computed(() => `M 0 ${heightLen.value} L 0 0`)
const heightEdgeS = computed(() => `M 0 ${heightLen.value * f.value} L 0 0`)
const baseLabel = computed(() => `${baseLen.value} → ${Math.round(baseLen.value * f.value)}（×${toFixed2(f.value)}）`)
const heightLabel = computed(() => `${heightLen.value} → ${Math.round(heightLen.value * f.value)}（×${toFixed2(f.value)}）`)
/** 放大图动态网格尺寸，避免大比例时图形超出画布 */
const sW = computed(() => Math.ceil((baseLen.value * f.value + 12) / 16))
const sH = computed(() => Math.ceil((heightLen.value * f.value + 12) / 16))

/* ---------- 比例尺 ---------- */
const scaleDen = computed(() => Math.round(props.values.scaleDen ?? 1000))
const cm = computed(() => props.values.cm ?? 5)
const actualM = computed(() => (cm.value * scaleDen.value) / 100)
const perM = computed(() => scaleDen.value / 100)
const barPx = computed(() => Math.min(cm.value * 34, 320))
</script>

<template>
  <div class="scale-wrap">
    <!-- 图形的放大与缩小 -->
    <template v-if="kind === 'scale-shape'">
      <p class="scale-title">
        {{ current.name }} 按 <b>{{ n }}:{{ d }}</b> 的比{{ isBigger ? '放大' : '缩小' }}（每边 ×{{ toFixed2(f) }}）
      </p>
      <div class="ratio-strip" aria-label="对应边比例说明">
        <span>原图 1 格</span>
        <b>× {{ toFixed2(f) }}</b>
        <span>后图 {{ toFixed2(f) }} 格</span>
      </div>
      <div class="shape-row">
        <div class="shape-col">
          <span class="shape-tag">原图</span>
          <svg :width="gridCols * cell" :height="4 * cell" viewBox="0 0 224 64">
            <template v-for="x in gridCols" :key="'o' + x">
              <line :x1="x * cell" :y1="0" :x2="x * cell" :y2="64" stroke="var(--ui-border-accented)" stroke-width="0.5" />
            </template>
            <template v-for="y in 4" :key="'oy' + y">
              <line :x1="0" :y1="y * cell" :x2="224" :y2="y * cell" stroke="var(--ui-border-accented)" stroke-width="0.5" />
            </template>
            <path :d="current.orig" fill="color-mix(in srgb, var(--ui-primary) 30%, white)" stroke="var(--ui-primary)" stroke-width="2" />
            <path :d="baseEdge" class="edge-base" />
            <path :d="heightEdge" class="edge-height" />
            <text :x="baseLen / 2" :y="heightLen + 12" text-anchor="middle" class="edge-label base">{{ baseLabel }}</text>
            <text :x="12" :y="heightLen / 2" text-anchor="middle" class="edge-label height">{{ heightLabel }}</text>
          </svg>
        </div>
        <span class="arrow">→</span>
        <div class="shape-col">
          <span class="shape-tag">后</span>
          <svg :width="sW * cell" :height="sH * cell" :viewBox="`0 0 ${sW * cell} ${sH * cell}`">
            <template v-for="x in sW" :key="'s' + x">
              <line :x1="x * cell" :y1="0" :x2="x * cell" :y2="sH * cell" stroke="var(--ui-border-accented)" stroke-width="0.5" />
            </template>
            <template v-for="y in sH" :key="'sy' + y">
              <line :x1="0" :y1="y * cell" :x2="sW * cell" :y2="y * cell" stroke="var(--ui-border-accented)" stroke-width="0.5" />
            </template>
            <path :d="current.scale(f)" fill="color-mix(in srgb, var(--ui-primary) 50%, white)" stroke="var(--ui-primary)" stroke-width="2" />
            <path :d="baseEdgeS" class="edge-base" />
            <path :d="heightEdgeS" class="edge-height" />
            <text :x="(baseLen * f) / 2" :y="heightLen * f + 12" text-anchor="middle" class="edge-label base">{{ baseLabel }}</text>
            <text :x="12" :y="(heightLen * f) / 2" text-anchor="middle" class="edge-label height">{{ heightLabel }}</text>
          </svg>
        </div>
      </div>
      <div class="edge-legend">
        <span class="legend-chip base">底边对应</span>
        <span class="legend-chip height">高对应</span>
        <span class="legend-text">对应边按同一比放大/缩小，形状不变</span>
      </div>
      <p class="note">放大或缩小前后，图形的大小变了，形状不变（对应角相等，对应边的比都是 {{ n }}:{{ d }}）</p>
    </template>

    <!-- 比例尺 -->
    <template v-else>
      <div class="map-block">
        <p class="scale-title">
          比例尺 <b>1:{{ scaleDen }}</b>，图上距离 {{ toFixed2(cm) }} 厘米
        </p>
        <div class="ruler">
          <div class="ruler-bar" :style="{ width: `${barPx}px` }">
            <span class="ruler-val">{{ toFixed2(cm) }} 厘米</span>
          </div>
        </div>
        <div class="legend">
          <span class="legend-unit">图上 1 厘米</span>
          <span class="legend-eq">＝</span>
          <span class="legend-unit">实际 {{ perM }} 米</span>
        </div>
        <div class="unit-flow" aria-label="比例尺单位换算流程">
          <span>图上 {{ toFixed2(cm) }} 厘米</span>
          <b>× {{ scaleDen }}</b>
          <span>{{ toFixed2(cm * scaleDen) }} 厘米</span>
          <b>÷ 100</b>
          <span>{{ toFixed2(actualM) }} 米</span>
        </div>
        <p class="res-line">
          实际距离 = {{ toFixed2(cm) }} × {{ scaleDen }} = {{ toFixed2(cm * scaleDen) }} 厘米 = <b>{{ toFixed2(actualM) }} 米</b>
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scale-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.scale-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  text-align: center;
}
.scale-title b {
  color: var(--ui-primary);
}
.shape-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
}
.shape-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  max-width: 100%;
}
.shape-col svg {
  max-width: 100%;
  height: auto;
}
.shape-tag {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.arrow {
  font-size: 1.6rem;
  color: var(--ui-primary);
  font-weight: 800;
}
.edge-base,
.edge-height {
  fill: none;
  stroke-width: 3;
}
.edge-base {
  stroke: #ef4444;
}
.edge-height {
  stroke: #2563eb;
}
.edge-label {
  font-size: 10px;
  font-weight: 800;
  fill: var(--ui-text-highlighted);
}
.edge-label.base {
  fill: #b91c1c;
}
.edge-label.height {
  fill: #1d4ed8;
}
.edge-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.8rem;
}
.legend-chip {
  border-radius: 9999px;
  padding: 0.15rem 0.6rem;
  font-weight: 700;
  color: white;
}
.legend-chip.base {
  background: #ef4444;
}
.legend-chip.height {
  background: #2563eb;
}
.legend-text {
  color: var(--ui-text-muted);
}
.ratio-strip,
.unit-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-width: 100%;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.ratio-strip b,
.unit-flow b {
  color: var(--ui-primary);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 36rem;
}
.map-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 644px;
}
.ruler {
  width: 100%;
  display: flex;
  justify-content: center;
}
.ruler-bar {
  height: 2.2rem;
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border: 2px solid var(--ui-primary);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s;
}
.ruler-val {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  white-space: nowrap;
}
.legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.legend-unit {
  color: var(--ui-text-toned);
  font-weight: 700;
}
.legend-eq {
  color: var(--ui-primary);
  font-weight: 800;
}
.res-line {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.res-line b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
@media (max-width: 520px) {
  .arrow {
    width: 100%;
    text-align: center;
    transform: rotate(90deg);
  }
  .unit-flow {
    border-radius: var(--ui-radius-lg);
  }
}
</style>
