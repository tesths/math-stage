<script setup lang="ts">
/**
 * 多边形面积 Lab：平行四边形 / 三角形 / 梯形
 * - 平行四边形：沿高剪下三角形 → 平移拼成长方形（滑动动画）
 * - 三角形/梯形：两个全等图形镜像拼成平行四边形（滑入动画）
 * 动态格宽保证任何参数下图形都在 viewBox 内
 */
import { computed, ref } from 'vue'
import { animate } from 'animejs'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { areaOf, shapeFromCode, type AreaShape } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const CELL = 34
const X0 = 40
const Y0 = 250

/** 通过 values.shape（数据层 fixed 数值代码 0/1/2）判断形状 */
const activeShape = computed<AreaShape>(() => shapeFromCode(props.values.shape))

const a = computed(() => props.values.a ?? 0)
const b = computed(() => props.values.b ?? 0)
const h = computed(() => props.values.h ?? 0)

/** 参数单位是“米”时按米展示（不加网格），否则按格 */
const isGrid = computed(() => !props.lab.params.some((p) => p.unit === '米'))
const unit = computed(() => (isGrid.value ? '格' : '米'))

/** 动态格宽：保证垂直(2H/1H)与水平都在 viewBox 内 */
const cellEff = computed(() => {
  const vertLimit = activeShape.value === 'parallelogram' ? 150 : 78
  const vert = vertLimit / Math.max(1, h.value)
  const horiz =
    activeShape.value === 'trapezoid' ? 360 / Math.max(1, a.value + b.value) : 360 / Math.max(1, a.value)
  return Math.min(CELL, vert, horiz)
})
const px = (cells: number) => cells * cellEff.value

/** 剪拼动画偏移（px）：平行四边形为水平滑移 */
const cutOffset = ref(0)
const animating = ref(false)
/** 已拼合（三角形/梯形淡入显示，平行四边形已滑移） */
const placed = ref(false)

function runCut() {
  if (animating.value) return
  animating.value = true
  playClick()
  if (activeShape.value === 'parallelogram') {
    animate(cutOffset, {
      value: -cellEff.value,
      duration: 900,
      easing: 'easeInOutQuad',
      update: () => {
        cutOffset.value = Math.round(cutOffset.value * 10) / 10
      },
      complete: () => {
        animating.value = false
        placed.value = true
      },
    })
  } else {
    // 三角形/梯形：第二个图形淡入，拼成平行四边形/长方形
    const el = document.querySelector('.area-wrap .cut-solid')
    if (el) {
      animate(el, {
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad',
        complete: () => {
          animating.value = false
          placed.value = true
        },
      })
    } else {
      placed.value = true
      animating.value = false
    }
  }
}

function resetCut() {
  cutOffset.value = 0
  placed.value = false
}

const s = computed(() => cellEff.value * 0.5)

/* ---------- 几何坐标 ---------- */
const W = computed(() => px(a.value))
const H = computed(() => px(h.value))
const B = computed(() => px(b.value))

/** 平行四边形四点 */
const paraPts = computed(() => {
  const s2 = s.value
  return `${X0},${Y0} ${X0 + W.value},${Y0} ${X0 + W.value + s2},${Y0 - H.value} ${X0 + s2},${Y0 - H.value}`
})
const paraRect = computed(() => {
  return `${X0},${Y0} ${X0 + W.value},${Y0} ${X0 + W.value},${Y0 - H.value} ${X0},${Y0 - H.value}`
})
/** 剪下的直角三角形（右侧），向左移 s 后补到左侧 */
const cutTri = computed(() => {
  const s2 = s.value
  return `${X0 + W.value},${Y0 - H.value} ${X0 + W.value},${Y0} ${X0 + W.value + s2},${Y0 - H.value}`
})
const cutTriMoved = computed(() => {
  const s2 = s.value
  const off = cutOffset.value
  return `${X0 + W.value + off},${Y0 - H.value} ${X0 + W.value + off},${Y0} ${X0 + W.value + s2 + off},${Y0 - H.value}`
})

/** 三角形：左上三角（底 a、高 h） */
const triPts = computed(() => {
  return `${X0},${Y0} ${X0 + W.value},${Y0} ${X0},${Y0 - H.value}`
})
/** 第二个三角形（镜像，拼成长方形） */
const triPts2 = computed(() => {
  return `${X0 + W.value},${Y0} ${X0 + W.value},${Y0 - H.value} ${X0},${Y0 - H.value}`
})

/** 梯形（左上直角梯形：下底 b、上底 a，左对齐） */
const trapPts = computed(() => {
  return `${X0},${Y0} ${X0 + B.value},${Y0} ${X0 + W.value},${Y0 - H.value} ${X0},${Y0 - H.value}`
})
/** 第二个梯形（180° 旋转，拼成长方形：底 = 上底+下底） */
const trapPts2 = computed(() => {
  return `${X0 + B.value + W.value},${Y0 - H.value} ${X0 + W.value},${Y0 - H.value} ${X0 + B.value},${Y0} ${X0 + B.value + W.value},${Y0}`
})

const area = computed(() => areaOf(activeShape.value, { a: a.value, b: b.value, h: h.value }))

/** 网格范围：上下都留一格余量，覆盖图形实际范围 */
const gridTop = computed(() => Y0 - H.value - cellEff.value)
const gridBottom = computed(() => Y0 + (activeShape.value === 'parallelogram' ? cellEff.value : H.value + cellEff.value))
const gridCols = computed(() =>
  activeShape.value === 'trapezoid' ? Math.ceil((a.value + b.value) / 2) + 2 : Math.ceil(a.value / 2) + 2,
)
const gridRows = computed(() => Math.ceil((gridBottom.value - gridTop.value) / cellEff.value) + 1)
</script>

<template>
  <div class="area-wrap">
    <svg viewBox="0 0 420 430" class="w-full">
      <!-- 网格 -->
      <g v-if="isGrid" class="grid-lines">
        <line
          v-for="i in gridCols"
          :key="'v' + i"
          :x1="X0 + (i - 1) * cellEff"
          :y1="gridTop"
          :x2="X0 + (i - 1) * cellEff"
          :y2="gridBottom"
        />
        <line
          v-for="i in gridRows"
          :key="'h' + i"
          :x1="0"
          :y1="gridTop + (i - 1) * cellEff"
          :x2="410"
          :y2="gridTop + (i - 1) * cellEff"
        />
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
        <text :x="X0 + W / 2" :y="Y0 + 20" text-anchor="middle" class="dim-label">
          底 a = {{ a }} {{ unit }}
        </text>
        <text :x="X0 + 6" :y="Y0 - H / 2" class="dim-label">高 h = {{ h }} {{ unit }}</text>
      </template>

      <!-- ===== 三角形 ===== -->
      <template v-else-if="activeShape === 'triangle'">
        <polygon :points="triPts" class="shape-fill" />
        <polygon :points="triPts2" class="cut-solid" :style="{ opacity: placed ? 1 : 0 }" />
        <polygon
          v-if="placed"
          :points="`${X0},${Y0} ${X0 + W},${Y0} ${X0 + W},${Y0 - H} ${X0},${Y0 - H}`"
          class="rect-ghost"
        />
        <text :x="X0 + W / 2" :y="Y0 + 20" text-anchor="middle" class="dim-label">
          底 a = {{ a }} {{ unit }}
        </text>
        <text :x="X0 + W + 8" :y="Y0 - H / 2" class="dim-label">高 h = {{ h }} {{ unit }}</text>
        <text v-if="placed" :x="X0 + W / 2" :y="Y0 + 24" text-anchor="middle" class="ok-label">
          ✓ 两个完全一样的三角形拼成长方形
        </text>
      </template>

      <!-- ===== 梯形 ===== -->
      <template v-else>
        <polygon :points="trapPts" class="shape-fill" />
        <polygon :points="trapPts2" class="cut-solid" :style="{ opacity: placed ? 1 : 0 }" />
        <polygon
          v-if="placed"
          :points="`${X0},${Y0} ${X0 + B + W},${Y0} ${X0 + B + W},${Y0 - H} ${X0},${Y0 - H}`"
          class="rect-ghost"
        />
        <text :x="X0 + (B + W) / 2" :y="Y0 + 20" text-anchor="middle" class="dim-label">
          下底 b = {{ b }} {{ unit }}
        </text>
        <text :x="X0 + W + 8" :y="Y0 - H + 14" class="dim-label">上底 a = {{ a }} {{ unit }}</text>
        <text :x="X0 + B + W + 8" :y="Y0 - H / 2" class="dim-label">高 h = {{ h }} {{ unit }}</text>
        <text v-if="placed" :x="X0 + (B + W) / 2" :y="Y0 - H - 10" text-anchor="middle" class="ok-label">
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
      <UButton v-if="cutOffset !== 0 || placed" size="sm" variant="outline" color="neutral" @click="resetCut">
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
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  transition: opacity 0.4s;
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
