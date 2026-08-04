<script setup lang="ts">
/**
 * 多边形面积 Lab：平行四边形 / 三角形 / 梯形
 * SVG 网格 + 剪拼演示动画（animejs 驱动），理解"转化"思想
 */
import { computed, ref } from 'vue'
import { animate } from 'animejs'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { areaOf, type AreaShape } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const CELL = 32
const x0 = 40
const y0 = 250

/** 通过 values.shape（数据层 fixed 注入）判断形状 */
const activeShape = computed<AreaShape>(() => {
  const s = props.values.shape as AreaShape | undefined
  return s ?? 'parallelogram'
})

const a = computed(() => props.values.a ?? 0)
const b = computed(() => props.values.b ?? 0)
const h = computed(() => props.values.h ?? 0)

/** 参数单位是“米”时按米展示（不加网格），否则按格 */
const isGrid = computed(() => !props.lab.params.some((p) => p.unit === '米'))
const unit = computed(() => (isGrid.value ? '格' : '米'))

/** 剪拼动画偏移（px，向负方向移动剪下的部分） */
const cutOffset = ref(0)
const animating = ref(false)

function runCut() {
  if (animating.value) return
  animating.value = true
  playClick()
  animate(cutOffset, { value: -CELL, duration: 900, easing: 'easeInOutQuad', complete: () => { animating.value = false } })
}

function resetCut() {
  cutOffset.value = 0
}

const sx = computed(() => Math.min(CELL, CELL * 0.5))

/* ---------- 几何坐标（单元格 → px） ---------- */
const px = (cells: number) => cells * CELL

/** 平行四边形四点 */
const paraPts = computed(() => {
  const W = px(a.value)
  const H = px(h.value)
  const s = sx.value
  return `${x0},${y0} ${x0 + W},${y0} ${x0 + W + s},${y0 - H} ${x0 + s},${y0 - H}`
})
const paraRect = computed(() => {
  const W = px(a.value)
  const H = px(h.value)
  return `${x0},${y0} ${x0 + W},${y0} ${x0 + W},${y0 - H} ${x0},${y0 - H}`
})
/** 剪下的直角三角形（右侧），向左移 s 后补到左侧 */
const cutTri = computed(() => {
  const W = px(a.value)
  const H = px(h.value)
  const s = sx.value
  return `${x0 + W},${y0 - H} ${x0 + W},${y0} ${x0 + W + s},${y0 - H}`
})
const cutTriMoved = computed(() => {
  const W = px(a.value)
  const H = px(h.value)
  const s = sx.value
  const off = cutOffset.value
  return `${x0 + W + off},${y0 - H} ${x0 + W + off},${y0} ${x0 + W + s + off},${y0 - H}`
})

/** 三角形：底 a、高 h，两个全等三角形拼成平行四边形 */
const triPts = computed(() => {
  const W = px(a.value)
  const H = px(h.value)
  return `${x0},${y0} ${x0 + W},${y0} ${x0 + W / 2},${y0 - H}`
})
/** 第二个三角形（倒放，初始在下方，动画上移拼合） */
const triPts2 = computed(() => {
  const W = px(a.value)
  const H = px(h.value)
  const off = cutOffset.value
  return `${x0},${y0 + H + off} ${x0 + W},${y0 + H + off} ${x0 + W / 2},${y0 + off}`
})

/** 梯形：上底 a、下底 b、高 h */
const trapPts = computed(() => {
  const A = px(a.value)
  const B = px(b.value)
  const H = px(h.value)
  const shift = (B - A) / 2
  return `${x0},${y0} ${x0 + B},${y0} ${x0 + B - shift},${y0 - H} ${x0 + shift},${y0 - H}`
})
const trapPts2 = computed(() => {
  const A = px(a.value)
  const B = px(b.value)
  const H = px(h.value)
  const shift = (B - A) / 2
  const off = cutOffset.value
  return `${x0},${y0 + H + off} ${x0 + B},${y0 + H + off} ${x0 + B - shift},${y0 + off} ${x0 + shift},${y0 + off}`
})

const area = computed(() => areaOf(activeShape.value, { a: a.value, b: b.value, h: h.value }))

const gridCols = computed(() => Math.max(a.value, b.value) + 3)
const gridRows = computed(() => Math.ceil(h.value) + 3)
</script>

<template>
  <div class="area-wrap">
    <svg :viewBox="`0 0 420 300`" class="w-full">
      <!-- 网格 -->
      <g v-if="isGrid" class="grid-lines">
        <line v-for="i in gridCols" :key="'v' + i" :x1="x0 + i * CELL" :y1="40" :x2="x0 + i * CELL" :y2="280" />
        <line v-for="i in gridRows" :key="'h' + i" :x1="10" :y1="y0 - i * CELL" :x2="410" :y2="y0 - i * CELL" />
      </g>

      <!-- ===== 平行四边形 ===== -->
      <template v-if="activeShape === 'parallelogram'">
        <!-- 转化后的长方形（虚线） -->
        <polygon :points="paraRect" class="rect-ghost" />
        <!-- 原平行四边形 -->
        <polygon :points="paraPts" class="shape-fill" />
        <!-- 剪下的三角形：原位（淡）与移动后（实） -->
        <polygon :points="cutTri" class="cut-fade" />
        <polygon :points="cutTriMoved" class="cut-solid" />
        <text :x="x0 + px(a) / 2" :y="y0 + 18" text-anchor="middle" class="dim-label">底 a = {{ a }} {{ unit }}</text>
        <text :x="x0 + px(a) + sx + 4" :y="y0 - px(h) / 2" class="dim-label">高 h = {{ h }} {{ unit }}</text>
      </template>

      <!-- ===== 三角形 ===== -->
      <template v-else-if="activeShape === 'triangle'">
        <polygon :points="triPts" class="shape-fill" />
        <polygon :points="triPts2" class="cut-solid" :class="{ placed: cutOffset < -1 }" />
        <text :x="x0 + px(a) / 2" :y="y0 + 18" text-anchor="middle" class="dim-label">底 a = {{ a }} {{ unit }}</text>
        <text :x="x0 + px(a) + 8" :y="y0 - px(h) / 2" class="dim-label">高 h = {{ h }} {{ unit }}</text>
        <text v-if="cutOffset < -1" :x="x0 + px(a) / 2" :y="y0 + px(h) + 26" text-anchor="middle" class="ok-label">
          ✓ 两个完全一样的三角形拼成平行四边形
        </text>
      </template>

      <!-- ===== 梯形 ===== -->
      <template v-else>
        <polygon :points="trapPts" class="shape-fill" />
        <polygon :points="trapPts2" class="cut-solid" :class="{ placed: cutOffset < -1 }" />
        <text :x="x0 + px(b) / 2" :y="y0 + 18" text-anchor="middle" class="dim-label">下底 b = {{ b }} {{ unit }}</text>
        <text :x="x0 + (px(b) - px(a)) / 2 - 10" :y="y0 - px(h) - 8" class="dim-label">上底 a = {{ a }} {{ unit }}</text>
        <text :x="x0 + px(b) + 8" :y="y0 - px(h) / 2" class="dim-label">高 h = {{ h }} {{ unit }}</text>
        <text v-if="cutOffset < -1" :x="x0 + px(b) / 2" :y="y0 + px(h) + 26" text-anchor="middle" class="ok-label">
          ✓ 两个完全一样的梯形拼成平行四边形
        </text>
      </template>
    </svg>

    <div class="controls">
      <UButton
        size="sm"
        color="primary"
        variant="soft"
        icon="i-heroicons-cursor-arrow-rays"
        :disabled="animating"
        @click="runCut"
      >
        {{ activeShape === 'parallelogram' ? '剪一剪 · 拼成长方形' : activeShape === 'triangle' ? '拼一拼 · 两个三角形' : '拼一拼 · 两个梯形' }}
      </UButton>
      <UButton v-if="cutOffset !== 0" size="sm" variant="outline" color="neutral" @click="resetCut">
        复位
      </UButton>
      <span class="area-value">
        S = <strong>{{ area }}</strong>（{{ unit }}²）
      </span>
    </div>
  </div>
</template>

<style scoped>
.area-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
svg {
  max-width: 480px;
}
.grid-lines line {
  stroke: var(--ui-border);
  stroke-width: 1;
}
.shape-fill {
  fill: color-mix(in srgb, var(--ui-primary) 50%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.rect-ghost {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}
.cut-fade {
  fill: color-mix(in srgb, var(--ui-primary) 25%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.cut-solid {
  fill: color-mix(in srgb, var(--ui-secondary, var(--ui-primary)) 60%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  transition: opacity 0.3s;
}
.cut-solid.placed {
  opacity: 0.25;
}
.dim-label,
.ok-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.ok-label {
  fill: var(--ui-success, #16a34a);
}
.controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.area-value {
  font-size: 0.95rem;
  color: var(--ui-text-highlighted);
}
.area-value strong {
  color: var(--ui-primary);
  font-size: 1.15rem;
}
</style>
