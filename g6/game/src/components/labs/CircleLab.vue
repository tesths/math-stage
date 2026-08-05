<script setup lang="ts">
/**
 * 圆 Lab：认识圆 / 扇形 / 圆的周长 / 圆的面积 / 环形面积 / 组合图形
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const PI = 3.14

/* ---------- 认识圆 ---------- */
const cr = computed(() => Math.round(props.values.r ?? 4))
const crPx = computed(() => cr.value * 16)
const cd = computed(() => cr.value * 2)
const CX = 170
const CY = 120

/* ---------- 扇形 ---------- */
const angle = computed(() => Math.round(props.values.angle ?? 90))
const sr = 100
const arc = computed(() => {
  const start = -90
  const end = start + angle.value
  const sRad = (start * Math.PI) / 180
  const eRad = (end * Math.PI) / 180
  const x1 = CX + sr * Math.cos(sRad)
  const y1 = CY + sr * Math.sin(sRad)
  const x2 = CX + sr * Math.cos(eRad)
  const y2 = CY + sr * Math.sin(eRad)
  const large = angle.value > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${x1} ${y1} A ${sr} ${sr} 0 ${large} 1 ${x2} ${y2} Z`
})

/* ---------- 圆的周长 ---------- */
const cir = computed(() => Math.round(props.values.r ?? 14))
const cirPx = computed(() => Math.min(cir.value * 5, 150))
const C = computed(() => toFixed2(2 * PI * cir.value))

/* ---------- 圆的面积 ---------- */
const ar = computed(() => Math.round(props.values.r ?? 5))
const slices = computed(() => Math.round(props.values.slices ?? 8))
const A = computed(() => toFixed2(PI * ar.value * ar.value))
const pieR = 90
const pieSlices = computed(() => {
  const parts: { x1: number; y1: number; x2: number; y2: number; large: number }[] = []
  const n = slices.value
  for (let i = 0; i < n; i++) {
    const a1 = -90 + (360 / n) * i
    const a2 = -90 + (360 / n) * (i + 1)
    const r1 = (a1 * Math.PI) / 180
    const r2 = (a2 * Math.PI) / 180
    parts.push({
      x1: CX + pieR * Math.cos(r1),
      y1: CY + pieR * Math.sin(r1),
      x2: CX + pieR * Math.cos(r2),
      y2: CY + pieR * Math.sin(r2),
      large: 0,
    })
  }
  return parts
})

/* ---------- 环形面积 ---------- */
const R = computed(() => Math.round(props.values.R ?? 10))
const r = computed(() => Math.round(props.values.r ?? 6))
const Rpx = computed(() => R.value * 8)
const rpx = computed(() => r.value * 8)
const annulus = computed(() => toFixed2(PI * (R.value * R.value - r.value * r.value)))

/* ---------- 组合图形 · 窗户 ---------- */
const side = computed(() => Math.round(props.values.side ?? 2))
const sqPx = computed(() => side.value * 24)
const smRadius = computed(() => (side.value * 24) / 2)
const windowSq = computed(() => side.value * side.value)
const windowSemi = computed(() => (PI * (side.value / 2) ** 2) / 2)
const windowTotal = computed(() => toFixed2(windowSq.value + windowSemi.value))
</script>

<template>
  <div class="circle-wrap">
    <!-- 认识圆 -->
    <template v-if="kind === 'circle-feature'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY" :r="crPx" fill="none" stroke="var(--ui-primary)" stroke-width="2.5" />
          <line :x1="CX" :y1="CY" :x2="CX" :y2="CY - crPx" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr)" />
          <line :x1="CX - crPx" :y1="CY" :x2="CX + crPx" :y2="CY" stroke="#0ea5e9" stroke-width="2" />
          <circle :cx="CX" :cy="CY" r="4" fill="var(--ui-primary)" />
          <text :x="CX" :y="CY + 22" text-anchor="middle" class="t-lbl">圆心 O</text>
          <text :x="CX + 10" :y="CY - crPx / 2 - 6" class="t-lbl amber">半径 r = {{ cr }}</text>
          <text :x="CX + crPx / 2 + 6" :y="CY + 16" class="t-lbl sky">直径 d = {{ cd }}</text>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 8 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </div>
      <p class="res-line">d = 2 × r = 2 × {{ cr }} = <b>{{ cd }}</b></p>
    </template>

    <!-- 扇形 -->
    <template v-else-if="kind === 'sector'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY" :r="sr" fill="none" stroke="var(--ui-border-accented)" stroke-width="1.5" />
          <path :d="arc" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2" />
          <line :x1="CX" :y1="CY" :x2="CX" :y2="CY - sr" stroke="var(--ui-border-accented)" stroke-width="1" stroke-dasharray="4 4" />
        </svg>
      </div>
      <p class="res-line">圆心角 = {{ angle }}°，占整个圆的 {{ toFixed2(angle / 360) }}</p>
    </template>

    <!-- 圆的周长 -->
    <template v-else-if="kind === 'circumference'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY" :r="cirPx" fill="color-mix(in srgb, var(--ui-primary) 15%, transparent)" stroke="var(--ui-primary)" stroke-width="2.5" />
          <line :x1="CX - cirPx" :y1="CY" :x2="CX + cirPx" :y2="CY" stroke="#0ea5e9" stroke-width="2" />
          <text :x="CX" :y="CY + 22" text-anchor="middle" class="t-lbl">半径 r = {{ cir }}</text>
          <text :x="CX + cirPx / 2 + 6" :y="CY + 16" class="t-lbl sky">直径 d = {{ toFixed2(cir * 2) }}</text>
        </svg>
      </div>
      <p class="res-line">
        C = 2 × π × r = 2 × 3.14 × {{ cir }} = <b>{{ C }}</b>
      </p>
    </template>

    <!-- 圆的面积 · 剪拼 -->
    <template v-else-if="kind === 'circle-area'">
      <div class="area-grid">
        <div class="svg-box half">
          <svg :width="340" :height="240" viewBox="0 0 340 240">
            <path
              v-for="(p, i) in pieSlices"
              :key="i"
              :d="`M ${CX} ${CY} L ${p.x1} ${p.y1} A ${pieR} ${pieR} 0 0 1 ${p.x2} ${p.y2} Z`"
              :fill="i % 2 === 0 ? 'color-mix(in srgb, var(--ui-primary) 55%, white)' : 'color-mix(in srgb, var(--ui-primary) 25%, white)'"
              stroke="var(--ui-bg-default)"
              stroke-width="1.5"
            />
            <circle :cx="CX" :cy="CY" :r="pieR" fill="none" stroke="var(--ui-primary)" stroke-width="1.5" />
          </svg>
        </div>
        <div class="svg-box half">
          <svg :width="340" :height="240" viewBox="0 0 340 240">
            <rect x="20" y="90" width="157" height="50" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2" />
            <line x1="20" y1="90" x2="177" y2="90" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4" />
            <line x1="177" y1="90" x2="177" y2="140" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 4" />
            <text x="98" y="82" text-anchor="middle" class="t-lbl amber">长 ≈ πr = 3.14×{{ ar }} = {{ toFixed2(PI * ar) }}</text>
            <text x="188" y="120" class="t-lbl sky">宽 = r = {{ ar }}</text>
          </svg>
        </div>
      </div>
      <p class="res-line">
        S = π × r² = 3.14 × {{ ar }} × {{ ar }} = <b>{{ A }}</b>
      </p>
    </template>

    <!-- 环形面积 -->
    <template v-else-if="kind === 'annulus'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY" :r="Rpx" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2.5" />
          <circle :cx="CX" :cy="CY" :r="rpx" fill="var(--ui-bg-default)" stroke="#f59e0b" stroke-width="2" />
          <text :x="CX + Rpx / 2 + 8" :y="CY - 6" class="t-lbl">R = {{ R }}</text>
          <text :x="CX + rpx / 2 + 8" :y="CY + 6" class="t-lbl amber">r = {{ r }}</text>
        </svg>
      </div>
      <p class="res-line">
        S 环 = π×(R² − r²) = 3.14×({{ R }}² − {{ r }}²) = <b>{{ annulus }}</b>
      </p>
    </template>

    <!-- 组合图形 · 窗户 -->
    <template v-else>
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <g transform="translate(170 210)">
            <rect :x="-sqPx / 2" :y="-sqPx" :width="sqPx" :height="sqPx" fill="color-mix(in srgb, var(--ui-primary) 20%, transparent)" stroke="var(--ui-primary)" stroke-width="2.5" />
            <path :d="`M ${-smRadius} ${-sqPx} A ${smRadius} ${smRadius} 0 0 1 ${smRadius} ${-sqPx}`" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2.5" />
            <text :x="0" :y="-sqPx - 14" text-anchor="middle" class="t-lbl">半圆 r = {{ toFixed2(side / 2) }}</text>
            <text :x="sqPx / 2 + 10" :y="-sqPx / 2" class="t-lbl">边长 {{ side }}</text>
          </g>
        </svg>
      </div>
      <p class="res-line">
        S = {{ side }}² + π×{{ toFixed2(side / 2) }}²÷2 = {{ toFixed2(windowSq) }} + {{ toFixed2(windowSemi) }} = <b>{{ windowTotal }} 平方米</b>
      </p>
    </template>
  </div>
</template>

<style scoped>
.circle-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.svg-box {
  display: flex;
  justify-content: center;
}
.svg-box.half svg {
  max-width: 170px;
  height: auto;
}
.area-grid {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}
.t-lbl {
  font-size: 12px;
  fill: var(--ui-text-toned);
  font-weight: 700;
}
.t-lbl.amber {
  fill: #b45309;
}
.t-lbl.sky {
  fill: #0369a1;
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
</style>
