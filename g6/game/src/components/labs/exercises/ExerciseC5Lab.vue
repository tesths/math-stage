<script setup lang="ts">
/**
 * 练习题 Lab · 五 圆
 * ex-c5-wheel-roll     车轮滚动的路程（滚动车轮 + 摆线轨迹 + 分段路程线）
 * ex-c5-circle-packing 长方形纸剪圆片（整齐排列 + 边角料去尾）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const PI = 3.14

/** 数值文案：最多保留 3 位小数并去掉末尾 0（整数不带小数点），保住 2.198 这类三位小数 */
function fmt3(v: number): string {
  return String(Number(v.toFixed(3)))
}

/* ================= 车轮滚动的路程 ================= */
/** 画布基准：地面 y、摆线起点/宽度、路程线段起点/宽度/高度 */
const GROUND_Y = 150
const CYC_X0 = 100
const CYC_W = 210
const ROAD_X0 = 40
const ROAD_W = 300
const ROAD_Y = 212

const d = computed(() => props.values.d ?? 70)
const n = computed(() => Math.round(props.values.n ?? 100))
const t = computed(() => Math.round(props.values.t ?? 10))

const circCm = computed(() => PI * d.value)
const circM = computed(() => circCm.value / 100)
const perMin = computed(() => circM.value * n.value)
const total = computed(() => circM.value * n.value * t.value)
const circCmText = computed(() => fmt3(circCm.value))
const circMText = computed(() => fmt3(circM.value))
const perMinText = computed(() => fmt3(perMin.value))
const totalText = computed(() => fmt3(Math.round(total.value * 100) / 100))
const kmText = computed(() => fmt3(Math.round((total.value / 1000) * 10) / 10))
const totalTurns = computed(() => n.value * t.value)

/** 车轮半径按直径缩放并封顶 60px，保证最大直径也不越出 viewBox */
const rPx = computed(() => Math.min(d.value * 0.75, 60))
const wheel = computed(() => ({ cx: CYC_X0, cy: GROUND_Y - rPx.value }))
/** 12 根辐条，其中正下方那根（i === 3）用橙色标记 */
const spokes = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180
    return {
      x1: wheel.value.cx,
      y1: wheel.value.cy,
      x2: wheel.value.cx + rPx.value * Math.cos(a),
      y2: wheel.value.cy + rPx.value * Math.sin(a),
      mark: i === 3,
    }
  }),
)
/** 圈数越多转得越快（CSS 旋转周期随之变小） */
const spinDuration = computed(() => Math.round((200 / n.value) * 100) / 100)
/** 橙色点的摆线轨迹：x = r(θ−sinθ)、y = r(1−cosθ)，横向归一到底宽 CYC_W */
const cycloidPath = computed(() => {
  const steps = 48
  let path = ''
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * 2 * Math.PI
    const x = CYC_X0 + ((th - Math.sin(th)) / (2 * Math.PI)) * CYC_W
    const y = GROUND_Y - ((1 - Math.cos(th)) / 2) * 2 * rPx.value
    path += `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
  }
  return path.trim()
})
const roadSegs = computed(() =>
  Array.from({ length: t.value }, (_, i) => {
    const seg = ROAD_W / t.value
    const x1 = ROAD_X0 + seg * i
    return { x1, x2: x1 + seg, mid: x1 + seg / 2 }
  }),
)
/** 段宽太小时（t ≥ 15）不再逐段标数字，避免标签重叠 */
const showSegLabel = computed(() => ROAD_W / t.value >= 30)

/* ================= 长方形纸剪圆片 ================= */
const PX_PER_CM = 16
const PACK_X0 = 30
const PACK_Y0 = 30

const paperL = computed(() => props.values.L ?? 15)
const paperW = computed(() => props.values.W ?? 8)
const discD = computed(() => props.values.d ?? 2)
const cols = computed(() => Math.max(0, Math.floor(paperL.value / discD.value)))
const rows = computed(() => Math.max(0, Math.floor(paperW.value / discD.value)))
const discCount = computed(() => cols.value * rows.value)
const remL = computed(() => Math.max(0, paperL.value - cols.value * discD.value))
const remW = computed(() => Math.max(0, paperW.value - rows.value * discD.value))
const discPx = computed(() => discD.value * PX_PER_CM)
const discR = computed(() => discPx.value / 2)
const paperPxW = computed(() => paperL.value * PX_PER_CM)
const paperPxH = computed(() => paperW.value * PX_PER_CM)
const paperMidY = computed(() => PACK_Y0 + paperPxH.value / 2)
const discs = computed(() => {
  const out: { cx: number; cy: number; light: boolean }[] = []
  for (let j = 0; j < rows.value; j++) {
    for (let i = 0; i < cols.value; i++) {
      out.push({
        cx: PACK_X0 + (i + 0.5) * discPx.value,
        cy: PACK_Y0 + (j + 0.5) * discPx.value,
        light: (i + j) % 2 === 1,
      })
    }
  }
  return out
})
const rightStrip = computed(() => ({
  x: PACK_X0 + paperPxW.value,
  y: PACK_Y0,
  w: remL.value * PX_PER_CM,
  h: paperPxH.value,
}))
const bottomStrip = computed(() => ({
  x: PACK_X0,
  y: PACK_Y0 + paperPxH.value,
  w: paperPxW.value,
  h: remW.value * PX_PER_CM,
}))
const rightMid = computed(() => ({
  x: rightStrip.value.x + rightStrip.value.w / 2,
  y: rightStrip.value.y + rightStrip.value.h / 2,
}))
const bottomMid = computed(() => ({
  x: bottomStrip.value.x + bottomStrip.value.w / 2,
  y: bottomStrip.value.y + bottomStrip.value.h / 2,
}))
const paperArea = computed(() => paperL.value * paperW.value)
const circleArea = computed(() => PI * (discD.value / 2) ** 2)
/** 错误做法对照：按面积相除 */
const byArea = computed(() => Math.floor(paperArea.value / circleArea.value))
/** 是否真有余料 / 面积法是否真的偏大（决定文案与 ✗） */
const hasRemainder = computed(() => remL.value > 0 || remW.value > 0)
const areaMore = computed(() => byArea.value > discCount.value)
</script>

<template>
  <div class="ex-c5-wrap">
    <!-- 车轮滚动的路程 -->
    <template v-if="kind === 'ex-c5-wheel-roll'">
      <div class="wheel-stage">
        <span class="wheel-badge">共转 {{ n }} × {{ t }} = {{ totalTurns }} 圈</span>
        <svg class="wheel-svg" width="360" height="260" viewBox="0 0 360 260">
          <line class="wheel-ground" x1="16" :y1="GROUND_Y" x2="344" :y2="GROUND_Y" />
          <path class="wheel-cycloid" :d="cycloidPath" />
          <text
            class="wheel-cylbl"
            :x="CYC_X0 + CYC_W / 2"
            :y="GROUND_Y - 2 * rPx - 8"
            text-anchor="middle"
          >橙色点的轨迹（摆线）</text>
          <g
            class="wheel-spokes"
            :style="{
              transformBox: 'view-box',
              transformOrigin: `${wheel.cx}px ${wheel.cy}px`,
              animationDuration: spinDuration + 's',
            }"
          >
            <circle class="wheel-rim" :cx="wheel.cx" :cy="wheel.cy" :r="rPx" />
            <line
              v-for="(s, i) in spokes"
              :key="i"
              class="wheel-spoke"
              :class="{ 'wheel-spoke-mark': s.mark }"
              :x1="s.x1"
              :y1="s.y1"
              :x2="s.x2"
              :y2="s.y2"
            />
            <circle class="wheel-mark" :cx="wheel.cx" :cy="wheel.cy + rPx" r="5" />
          </g>
          <circle class="wheel-hub" :cx="wheel.cx" :cy="wheel.cy" r="3" />
          <text class="wheel-dlbl" :x="wheel.cx + rPx + 8" :y="wheel.cy + 4">直径 {{ d }} 厘米</text>
          <g class="wheel-road">
            <line class="road-axis" :x1="ROAD_X0" :y1="ROAD_Y" :x2="ROAD_X0 + ROAD_W" :y2="ROAD_Y" />
            <g v-for="(seg, i) in roadSegs" :key="i" class="road-seg">
              <line class="road-tick" :x1="seg.x1" :y1="ROAD_Y - 7" :x2="seg.x1" :y2="ROAD_Y + 7" />
              <text v-if="showSegLabel" class="road-seg-lbl" :x="seg.mid" :y="ROAD_Y - 12" text-anchor="middle">{{ perMinText }}</text>
            </g>
            <line class="road-tick" :x1="ROAD_X0 + ROAD_W" :y1="ROAD_Y - 7" :x2="ROAD_X0 + ROAD_W" :y2="ROAD_Y + 7" />
          </g>
          <text class="road-caption" :x="ROAD_X0" :y="ROAD_Y + 26">每段 = 每分钟 {{ perMinText }} 米</text>
          <text class="road-total" :x="ROAD_X0 + ROAD_W" :y="ROAD_Y + 26" text-anchor="end">≈ {{ totalText }} 米（约 {{ kmText }} 千米）</text>
        </svg>
      </div>
      <p class="wheel-sum">
        周长 = 3.14 × {{ d }} = {{ circCmText }} 厘米 = {{ circMText }} 米；{{ t }} 分钟共转 {{ n }} × {{ t }} = {{ totalTurns }} 圈，路程 ≈ <b>{{ totalText }} 米</b>
      </p>
    </template>

    <!-- 长方形纸剪圆片 -->
    <template v-else-if="kind === 'ex-c5-circle-packing'">
      <div class="pack-stage">
        <span class="pack-badge">每行 {{ cols }} 个 × {{ rows }} 行 = {{ discCount }} 个</span>
        <svg class="pack-svg" width="440" height="320" viewBox="0 0 440 320">
          <defs>
            <pattern
              id="ex-c5-hatch"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line class="pack-hatch-line" x1="0" y1="0" x2="0" y2="8" />
            </pattern>
          </defs>
          <rect class="pack-paper" :x="PACK_X0" :y="PACK_Y0" :width="paperPxW" :height="paperPxH" />
          <circle
            v-for="(disc, i) in discs"
            :key="i"
            class="pack-disc"
            :class="{ primary: !disc.light, light: disc.light }"
            :cx="disc.cx"
            :cy="disc.cy"
            :r="discR"
          />
          <rect
            v-if="remL > 0"
            class="pack-leftover pack-leftover-v"
            :x="rightStrip.x"
            :y="rightStrip.y"
            :width="rightStrip.w"
            :height="rightStrip.h"
          />
          <text
            v-if="remL > 0"
            class="pack-leftover-txt"
            :x="rightMid.x"
            :y="rightMid.y"
            :transform="`rotate(-90 ${rightMid.x} ${rightMid.y})`"
            text-anchor="middle"
          >不够再剪一个</text>
          <rect
            v-if="remW > 0"
            class="pack-leftover pack-leftover-h"
            :x="bottomStrip.x"
            :y="bottomStrip.y"
            :width="bottomStrip.w"
            :height="bottomStrip.h"
          />
          <text
            v-if="remW > 0"
            class="pack-leftover-txt"
            :x="bottomMid.x"
            :y="bottomMid.y"
            text-anchor="middle"
          >不够再剪一个</text>
          <text class="pack-axis-lbl" :x="PACK_X0 + paperPxW / 2" :y="PACK_Y0 - 8" text-anchor="middle">长 {{ toFixed2(paperL) }} 厘米</text>
          <text
            class="pack-axis-lbl"
            :x="PACK_X0 - 10"
            :y="paperMidY"
            :transform="`rotate(-90 ${PACK_X0 - 10} ${paperMidY})`"
            text-anchor="middle"
          >宽 {{ toFixed2(paperW) }} 厘米</text>
        </svg>
        <p class="pack-compare">按面积 ≈ {{ byArea }} 个 {{ areaMore ? '✗' : '' }}（{{ hasRemainder ? '有边角料，拼不出整圆' : '两个方向正好排满' }}）</p>
      </div>
      <p class="pack-sum">
        每行 ⌊{{ toFixed2(paperL) }} ÷ {{ toFixed2(discD) }}⌋ = {{ cols }} 个，共 ⌊{{ toFixed2(paperW) }} ÷ {{ toFixed2(discD) }}⌋ = {{ rows }} 行，最多剪 <b>{{ discCount }} 个</b>
      </p>
    </template>
  </div>
</template>

<style scoped>
.ex-c5-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 320px;
}

/* ---------- 车轮滚动的路程 ---------- */
.wheel-stage,
.pack-stage {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  width: 100%;
}
.wheel-badge,
.pack-badge {
  align-self: flex-start;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
  padding: 0.2rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 800;
}
.wheel-svg,
.pack-svg {
  max-width: 100%;
  height: auto;
}
.wheel-ground {
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.wheel-cycloid {
  fill: none;
  stroke: #b45309;
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}
.wheel-spokes {
  animation-name: ex-c5-spin;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes ex-c5-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.wheel-rim {
  fill: color-mix(in srgb, var(--ui-primary) 10%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 2.5;
}
.wheel-spoke {
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
.wheel-spoke-mark {
  stroke: #b45309;
  stroke-width: 2.4;
}
.wheel-hub {
  fill: var(--ui-primary);
}
.wheel-mark {
  fill: #b45309;
}
.wheel-dlbl,
.wheel-cylbl {
  font-size: 11px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.wheel-cylbl {
  fill: #b45309;
}
.road-axis {
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.road-tick {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.road-seg-lbl {
  font-family: ui-monospace, monospace;
  font-size: 9px;
  fill: var(--ui-text-muted);
}
.road-caption {
  font-size: 11px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.road-total {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-primary);
}
.wheel-sum,
.pack-sum {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.wheel-sum b,
.pack-sum b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}

/* ---------- 长方形纸剪圆片 ---------- */
.pack-paper {
  fill: color-mix(in srgb, var(--ui-primary) 8%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.pack-disc {
  stroke: var(--ui-bg-default);
  stroke-width: 1;
}
.pack-disc.primary {
  fill: var(--ui-primary);
}
.pack-disc.light {
  fill: color-mix(in srgb, var(--ui-primary) 30%, white);
}
.pack-hatch-line {
  stroke: #b45309;
  stroke-width: 2;
  opacity: 0.5;
}
.pack-leftover {
  fill: url(#ex-c5-hatch);
  stroke: var(--ui-border-accented);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}
.pack-leftover-txt {
  font-size: 9px;
  font-weight: 700;
  fill: #b45309;
}
.pack-axis-lbl {
  font-size: 10px;
  fill: var(--ui-text-muted);
}
.pack-compare {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
</style>
