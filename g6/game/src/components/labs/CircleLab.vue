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
const extraRadii = computed(() => {
  return [30, -45].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return { x: CX + crPx.value * Math.cos(rad), y: CY + crPx.value * Math.sin(rad) }
  })
})

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
/** 圆心角弧（小半径弧线 + 角度标签） */
const angleArc = computed(() => {
  const end = -90 + angle.value
  const eRad = (end * Math.PI) / 180
  const e1x = CX + 46 * Math.cos(((-90) * Math.PI) / 180)
  const e1y = CY + 46 * Math.sin(((-90) * Math.PI) / 180)
  const e2x = CX + 46 * Math.cos(eRad)
  const e2y = CY + 46 * Math.sin(eRad)
  const large = angle.value > 180 ? 1 : 0
  return `M ${e1x} ${e1y} A 46 46 0 ${large} 1 ${e2x} ${e2y}`
})
const angleMid = computed(() => {
  const mid = (-90 + angle.value / 2) * Math.PI / 180
  return { x: CX + 62 * Math.cos(mid), y: CY + 62 * Math.sin(mid) }
})
const sectorArcLabel = computed(() => {
  const mid = (-90 + angle.value / 2) * Math.PI / 180
  return { x: CX + (sr + 16) * Math.cos(mid), y: CY + (sr + 16) * Math.sin(mid) }
})

/* ---------- 圆的周长 ---------- */
const cir = computed(() => Math.round(props.values.r ?? 14))
const cirPx = computed(() => Math.min(cir.value * 5, 150))
const C = computed(() => toFixed2(2 * PI * cir.value))
const cdValue = computed(() => cir.value * 2)
const unfoldPx = computed(() => Math.min(2 * PI * cirPx.value, 260))

/* ---------- 圆的面积 ---------- */
const ar = computed(() => Math.round(props.values.r ?? 5))
const slices = computed(() => Math.round(props.values.slices ?? 8))
const A = computed(() => toFixed2(PI * ar.value * ar.value))
const pieR = 82
const pieCX = 88
const pieCY = 116
const pieSlices = computed(() => {
  const parts: { x1: number; y1: number; x2: number; y2: number; large: number }[] = []
  const n = slices.value
  for (let i = 0; i < n; i++) {
    const a1 = -90 + (360 / n) * i
    const a2 = -90 + (360 / n) * (i + 1)
    const r1 = (a1 * Math.PI) / 180
    const r2 = (a2 * Math.PI) / 180
    parts.push({
      x1: pieCX + pieR * Math.cos(r1),
      y1: pieCY + pieR * Math.sin(r1),
      x2: pieCX + pieR * Math.cos(r2),
      y2: pieCY + pieR * Math.sin(r2),
      large: 0,
    })
  }
  return parts
})
/** 近似长方形：交错条，份数越多边缘锯齿越细 */
const stripW = computed(() => 280 / slices.value)
const strips = computed(() => {
  return Array.from({ length: slices.value }, (_, i) => ({
    x: 20 + i * stripW.value,
    top: i % 2 === 0 ? 92 : 98,
    alt: i % 2 === 0,
  }))
})
const interlaceAmp = computed(() => (slices.value <= 8 ? 6 : slices.value <= 16 ? 3 : 1.5))

/* ---------- 环形面积 ---------- */
const R = computed(() => Math.round(props.values.R ?? 10))
const r = computed(() => Math.round(props.values.r ?? 6))
const Rpx = computed(() => R.value * 8)
const rpx = computed(() => r.value * 8)
const invalidRing = computed(() => r.value >= R.value)
const aOuter = computed(() => toFixed2(PI * R.value * R.value))
const aInner = computed(() => toFixed2(PI * r.value * r.value))
const annulus = computed(() => toFixed2(PI * (R.value * R.value - r.value * r.value)))

/* ---------- 组合图形 · 窗户 ---------- */
const side = computed(() => Math.round(props.values.side ?? 2))
const sqPx = computed(() => side.value * 24)
const smRadius = computed(() => (side.value * 24) / 2)
const windowSq = computed(() => side.value * side.value)
const windowSemi = computed(() => (PI * (side.value / 2) ** 2) / 2)
const windowTotal = computed(() => toFixed2(windowSq.value + windowSemi.value))

/* ---------- 共享计算：弧端坐标 / 环形挖洞路径 ---------- */
const arcEnd = computed(() => {
  const end = -90 + angle.value
  const rad = (end * Math.PI) / 180
  return { x: CX + sr * Math.cos(rad), y: CY + sr * Math.sin(rad) }
})

/** 环形挖洞路径：外圆顺时 + 内圆逆时挖空 */
const ringPath = computed(() => {
  const oR = Math.min(Rpx.value, 60)
  const iR = Math.min(rpx.value, 58)
  return `M 65 ${65 - oR} A ${oR} ${oR} 0 1 1 ${65 - oR + 0.01} ${65 - oR} Z M 65 ${65 - iR} A ${iR} ${iR} 0 1 0 ${65 - iR + 0.01} ${65 - iR} Z`
})
</script>

<template>
  <div class="circle-wrap">
    <!-- 认识圆 -->
    <template v-if="kind === 'circle-feature'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY" :r="crPx" fill="none" stroke="var(--ui-primary)" stroke-width="2.5" />
          <circle v-for="(p, i) in extraRadii" :key="i" :cx="p.x" :cy="p.y" r="3" class="dot amber" />
          <line
            v-for="(p, i) in extraRadii"
            :key="'l' + i"
            :x1="CX" :y1="CY" :x2="p.x" :y2="p.y"
            stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4"
          />
          <line :x1="CX" :y1="CY" :x2="CX" :y2="CY - crPx" stroke="#f59e0b" stroke-width="2" marker-end="url(#arr)" />
          <line :x1="CX - crPx" :y1="CY" :x2="CX + crPx" :y2="CY" stroke="#0ea5e9" stroke-width="2" />
          <circle :cx="CX" :cy="CY" r="4" fill="var(--ui-primary)" />
          <text :x="CX" :y="CY + 22" text-anchor="middle" class="t-lbl">圆心 O</text>
          <text :x="CX + 10" :y="CY - crPx / 2 - 6" class="t-lbl amber">半径 r = {{ cr }}</text>
          <text :x="CX + crPx / 2 + 6" :y="CY + 16" class="t-lbl sky">直径 d = {{ cd }}</text>
          <text :x="CX + 16" :y="CY - 6" class="t-lbl amber">r</text>
          <text :x="CX + crPx * 0.9 + 8" :y="CY - crPx * 0.5 - 4" class="t-lbl amber">r</text>
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 8 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </div>
      <p class="res-line">同一个圆里所有半径都相等：d = 2 × r = 2 × {{ cr }} = <b>{{ cd }}</b></p>
    </template>

    <!-- 扇形 -->
    <template v-else-if="kind === 'sector'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY" :r="sr" fill="none" stroke="var(--ui-border-accented)" stroke-width="1.5" />
          <path :d="arc" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2" />
          <line :x1="CX" :y1="CY" :x2="CX" :y2="CY - sr" stroke="#f59e0b" stroke-width="1.5" />
          <line :x1="CX" :y1="CY" :x2="arcEnd.x" :y2="arcEnd.y" stroke="#f59e0b" stroke-width="1.5" />
          <path :d="angleArc" fill="none" stroke="var(--ui-warning, #f59e0b)" stroke-width="2" marker-end="url(#arr2)" />
          <text :x="CX" :y="CY - sr - 8" text-anchor="middle" class="t-lbl sky">A</text>
          <text :x="arcEnd.x + 12" :y="arcEnd.y + 4" class="t-lbl sky">B</text>
          <text :x="angleMid.x" :y="angleMid.y + 4" text-anchor="middle" class="t-lbl amber">{{ angle }}°</text>
          <text :x="sectorArcLabel.x" :y="sectorArcLabel.y" text-anchor="middle" class="t-lbl sky">弧 AB</text>
          <text :x="CX" :y="CY + 22" text-anchor="middle" class="t-lbl">圆心 O</text>
          <text :x="CX + 14" :y="CY - 8" class="t-lbl amber">r</text>
          <text :x="arcEnd.x + 14" :y="arcEnd.y - 6" class="t-lbl amber">r</text>
          <defs>
            <marker id="arr2" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 8 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>
      </div>
      <div class="sector-parts" aria-label="扇形组成部分">
        <span class="part-chip">半径 OA</span>
        <span class="part-chip">半径 OB</span>
        <span class="part-chip">弧 AB</span>
        <span class="part-chip primary">圆心角 ∠AOB = {{ angle }}°</span>
      </div>
      <p class="res-line">两条半径 + 一段弧围成的图形是扇形，圆心角 = {{ angle }}°，面积占全圆的 {{ toFixed2(angle / 360) }}</p>
    </template>

    <!-- 圆的周长 -->
    <template v-else-if="kind === 'circumference'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <circle :cx="CX" :cy="CY - 40" :r="cirPx" fill="color-mix(in srgb, var(--ui-primary) 15%, transparent)" stroke="var(--ui-primary)" stroke-width="2.5" />
          <line :x1="CX - cirPx" :y1="CY - 40" :x2="CX + cirPx" :y2="CY - 40" stroke="#0ea5e9" stroke-width="2" />
          <text :x="CX" :y="CY - 18" text-anchor="middle" class="t-lbl">半径 r = {{ cir }}，直径 d = {{ cdValue }}</text>
          <text :x="CX" :y="205" text-anchor="middle" class="t-lbl sky">展开周长 C = 2πr ≈ {{ unfoldPx }}px</text>
          <line :x1="20" :y1="215" :x2="20 + unfoldPx" :y2="215" stroke="#f59e0b" stroke-width="3" />
          <line :x1="20" :y1="215" :x2="20 + unfoldPx" :y2="215" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 4" />
          <text :x="20 + unfoldPx / 2" :y="208" text-anchor="middle" class="t-lbl amber">C = {{ C }} 米</text>
        </svg>
      </div>
      <p class="res-line">C = 2 × π × r = 2 × 3.14 × {{ cir }} = <b>{{ C }}</b>，且 C ÷ d ≈ <b>π = 3.14</b></p>
    </template>

    <!-- 圆的面积 · 剪拼 -->
    <template v-else-if="kind === 'circle-area'">
      <div class="area-grid">
        <div class="svg-box half">
          <svg :width="340" :height="240" viewBox="0 0 340 240">
            <path
              v-for="(p, i) in pieSlices"
              :key="i"
              :d="`M ${pieCX} ${pieCY} L ${p.x1} ${p.y1} A ${pieR} ${pieR} 0 0 1 ${p.x2} ${p.y2} Z`"
              :fill="i % 2 === 0 ? 'color-mix(in srgb, var(--ui-primary) 55%, white)' : 'color-mix(in srgb, var(--ui-primary) 25%, white)'"
              stroke="var(--ui-bg-default)"
              stroke-width="1.5"
            />
            <circle :cx="pieCX" :cy="pieCY" :r="pieR" fill="none" stroke="var(--ui-primary)" stroke-width="1.5" />
            <text :x="85" :y="228" text-anchor="middle" class="t-lbl">把圆平均分成 {{ slices }} 份</text>
          </svg>
        </div>
        <div class="svg-box half">
          <svg :width="340" :height="240" viewBox="0 0 340 240">
            <line x1="20" y1="92" x2="300" y2="92" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4" />
            <line x1="300" y1="92" x2="300" y2="140" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 4" />
            <rect
              v-for="(s, i) in strips"
              :key="i"
              :x="s.x"
              :y="s.top"
              :width="stripW + 0.6"
              height="44"
              :fill="s.alt ? 'color-mix(in srgb, var(--ui-primary) 45%, white)' : 'color-mix(in srgb, var(--ui-primary) 25%, white)'"
              stroke="var(--ui-bg-default)"
              stroke-width="0.8"
            />
            <path
              v-for="(s, i) in strips"
              :key="'j' + i"
              :d="s.alt
                ? `M ${s.x} ${92} l ${stripW / 2} ${-interlaceAmp} l ${stripW / 2} ${interlaceAmp}`
                : `M ${s.x} ${140} l ${stripW / 2} ${interlaceAmp} l ${stripW / 2} ${-interlaceAmp}`"
              stroke="color-mix(in srgb, var(--ui-primary) 75%, white)"
              stroke-width="1.2"
              fill="none"
            />
            <text x="160" y="84" text-anchor="middle" class="t-lbl amber">长 ≈ πr = 3.14×{{ ar }} = {{ toFixed2(PI * ar) }}</text>
            <text x="310" y="118" class="t-lbl sky">宽 = r = {{ ar }}</text>
            <text x="160" y="168" text-anchor="middle" class="t-lbl2">{{ slices <= 12 ? `边缘还有 ${interlaceAmp}px 的锯齿` : '份数多，边缘接近直线' }}</text>
          </svg>
        </div>
      </div>
      <p class="res-line">
        S = 长 × 宽 = πr × r = 3.14 × {{ ar }} × {{ ar }} = <b>{{ A }}</b> 平方米（份数越多越接近长方形）
      </p>
    </template>

    <!-- 环形面积 -->
    <template v-else-if="kind === 'annulus'">
      <p v-if="invalidRing" class="warn-line">注意：内圆半径 {{ r }} 应小于外圆半径 {{ R }}，请调大外圆或调小内圆</p>
      <div v-else class="ring-stage">
        <div class="ring-card">
          <svg :width="130" :height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" :r="Math.min(Rpx, 60)" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2" />
          </svg>
          <p class="ring-tag">外圆面积 S大 = πR² = {{ aOuter }}</p>
        </div>
        <p class="op">－</p>
        <div class="ring-card">
          <svg :width="130" :height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" :r="Math.min(Rpx, 60)" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2" />
            <circle cx="65" cy="65" :r="Math.min(rpx, 58)" fill="var(--ui-bg)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" />
          </svg>
          <p class="ring-tag">挖去内圆 S小 = πr² = {{ aInner }}</p>
        </div>
        <p class="op">＝</p>
        <div class="ring-card">
          <svg :width="130" :height="130" viewBox="0 0 130 130">
            <path :d="ringPath" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2" />
            <circle cx="65" cy="65" :r="Math.min(rpx, 58)" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" />
          </svg>
          <p class="ring-tag ring-result">环形面积 S环 = {{ annulus }} 平方厘米</p>
        </div>
      </div>
      <p class="res-line">S 环 = π×R² − π×r² = {{ aOuter }} − {{ aInner }} = <b>{{ annulus }}</b> 平方厘米</p>
    </template>

    <!-- 组合图形 · 窗户 -->
    <template v-else>
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <g transform="translate(170 210)">
            <rect :x="-sqPx / 2" :y="-sqPx" :width="sqPx" :height="sqPx" fill="color-mix(in srgb, var(--ui-primary) 20%, transparent)" stroke="var(--ui-primary)" stroke-width="2.5" />
            <path :d="`M ${-smRadius} ${-sqPx} A ${smRadius} ${smRadius} 0 0 1 ${smRadius} ${-sqPx}`" fill="color-mix(in srgb, var(--ui-primary) 45%, white)" stroke="var(--ui-primary)" stroke-width="2.5" />
            <line :x1="-sqPx / 2" :y1="-sqPx" :x2="sqPx / 2" :y2="-sqPx" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 4" />
            <text :x="0" :y="-sqPx - 14" text-anchor="middle" class="t-lbl">S半圆 = πr²÷2（r = {{ toFixed2(side / 2) }}）</text>
            <text :x="sqPx / 2 + 10" :y="-sqPx / 2" class="t-lbl">S方 = 边长² = {{ side }}² = {{ windowSq }}</text>
            <text :x="-sqPx / 2" :y="-sqPx + 16" class="t-lbl sky">半圆</text>
            <text :x="sqPx / 4" :y="-sqPx / 2 - 4" class="t-lbl">正方形</text>
          </g>
        </svg>
      </div>
      <p class="res-line">
        S = {{ side }}² + π×{{ toFixed2(side / 2) }}²÷2
        = {{ toFixed2(windowSq) }} + {{ toFixed2(windowSemi) }} = <b>{{ windowTotal }} 平方米</b>
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
  max-width: 240px;
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
.t-lbl2 {
  font-size: 11px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.dot {
  fill: #b45309;
}
.sector-parts {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.part-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
  font-weight: 800;
}
.part-chip.primary {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}
.ring-stage {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
}
.ring-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.6rem;
}
.ring-card svg {
  width: 130px;
  height: 130px;
}
.ring-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  text-align: center;
  margin: 0;
}
.ring-tag.ring-result {
  color: var(--ui-primary);
}
.op {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.warn-line {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-warning, #f59e0b);
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
