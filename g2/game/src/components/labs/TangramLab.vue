<script setup lang="ts">
/**
 * 七巧板 Lab（课本 p34-36）
 *
 * 本轮重写要点（原实现是 P0/P1）：
 * - 原实现「拼成长方形/平行四边形/三角形」只是把 7 块板**留在原正方形位置里高亮**，
 *   板子从没移动过；而且「长方形」和「平行四边形」都写的是 3、4、5 号板 —— 同一组板
 *   不可能既是长方形又是平行四边形。
 * - 现在每种图案都用 lib/labs/tangram.ts 里由课本原图实测出的真实坐标做**平移 + 旋转拼合**：
 *   点「拼一拼」，参与的板按刚性变换一路移动到目标位置并拼成目标轮廓，
 *   单测断言「板面积之和 = 目标面积」「拼合后顶点集合 = 目标轮廓顶点集合」「不重叠也不留空」。
 */
import { computed, onUnmounted, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import {
  ASSEMBLIES,
  PIECES,
  centroid,
  piecesAt,
  polygonArea,
  toSvgPoints,
  type Pt,
} from '@/lib/labs/tangram'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()
const emit = defineEmits<{ acted: []; done: [] }>()

const COLORS = ['#ef4444', '#f59e0b', '#06b6d4', '#22c55e', '#ec4899', '#8b5cf6', '#eab308']

const sel = computed(() =>
  Math.min(ASSEMBLIES.length - 1, Math.max(0, Math.round(props.values.sel ?? 0))),
)
const target = computed(() => ASSEMBLIES[sel.value]!)

/** 0 = 板子都在原正方形里；1 = 已经拼合到目标位置 */
const progress = ref(0)
const acted = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function settle() {
  if (timer) clearTimeout(timer)
  timer = undefined
  progress.value = 1
  acted.value = true
}

/** 一步一步地把板子搬过去（每 24ms 前进一格，共 24 格 ≈ 0.6s） */
function assemble() {
  if (timer) clearTimeout(timer)
  const from = progress.value
  let k = 0
  const total = 24
  const tick = () => {
    k += 1
    progress.value = from + (1 - from) * (k / total)
    if (k >= total) {
      settle()
      emit('done')
      return
    }
    timer = setTimeout(tick, 24)
  }
  acted.value = true
  emit('acted')
  timer = setTimeout(tick, 24)
}

function reset() {
  if (timer) clearTimeout(timer)
  timer = undefined
  progress.value = 0
  acted.value = false
}

watch(sel, () => {
  // 换图案后不自动拼：结论要先想再看
  reset()
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

/** 当前每一块板的顶点：参与的板按进度移动，没参与的板留在原正方形位置 */
const renderPieces = computed(() => {
  const moved = new Map(piecesAt(target.value, progress.value).map((p) => [p.no, p.points]))
  return PIECES.map((p) => {
    const used = target.value.pieces.includes(p.no)
    const points: Pt[] = used ? (moved.get(p.no) ?? p.points) : p.points
    return {
      no: p.no,
      shape: p.shape,
      used,
      color: COLORS[p.no - 1]!,
      svg: toSvgPoints(points),
      label: centroid(points),
    }
  })
})

const r3 = (v: number) => Math.round(v * 1000) / 1000
const pieceArea = (no: number) => r3(polygonArea(PIECES.find((p) => p.no === no)!.points))
/** 参与拼的板面积之和 */
const areaSum = computed(() => r3(target.value.pieces.reduce((s, no) => s + pieceArea(no), 0)))
/** 目标轮廓面积（独立算，用于对照） */
const outlineArea = computed(() => r3(polygonArea(target.value.outline)))

const viewBox = computed(() => {
  const pts = target.value.outline
  const minX = Math.min(0, ...pts.map((p) => p[0])) - 0.6
  const minY = Math.min(0, ...pts.map((p) => p[1])) - 0.6
  const maxX = Math.max(8, ...pts.map((p) => p[0])) + 0.6
  const maxY = Math.max(8, ...pts.map((p) => p[1])) + 0.6
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
})

defineExpose({ settle })
</script>

<template>
  <div class="tangram-wrap">
    <div class="stage">
      <svg :viewBox="viewBox" class="tg-svg" role="img">
        <polygon
          v-for="pc in renderPieces"
          :key="pc.no"
          :points="pc.svg"
          class="tg-piece"
          :class="{ on: pc.used, moving: pc.used && progress > 0 && progress < 1 }"
          :style="{ fill: pc.color }"
        >
          <title>第{{ pc.no }}号板（{{ pc.shape }}）</title>
        </polygon>
        <text
          v-for="pc in renderPieces"
          :key="`t-${pc.no}`"
          :x="pc.label[0]"
          :y="pc.label[1]"
          class="tg-label"
          :class="{ dim: !pc.used }"
        >
          {{ pc.no }}
        </text>
      </svg>
    </div>

    <div class="tg-controls">
      <button type="button" class="tg-btn primary" data-test="tg-assemble" @click="assemble">
        拼一拼
      </button>
      <button type="button" class="tg-btn" data-test="tg-reset" @click="reset">放回原处</button>
      <span class="tg-progress" data-test="tg-progress">
        已移动 {{ Math.round(progress * 100) }}%
      </span>
    </div>

    <p class="tg-name">
      目标：<strong>{{ target.name }}</strong>
      <span class="tg-used">（用 {{ target.pieces.map((n) => `${n}号板`).join('、') }}）</span>
    </p>

    <p v-if="acted && progress >= 1" class="tg-check" data-test="tg-check">
      ✓ 用的板面积 {{ target.pieces.map((n) => pieceArea(n)).join(' + ') }} = {{ areaSum }}；{{
        target.name
      }}的面积也是 {{ outlineArea }}，两块一样大 → {{ target.note }}
    </p>
    <p v-else class="tg-hint">
      先看清每块板的形状和大小，点「拼一拼」把板子真的搬过去，再对照右边看面积对不对。
    </p>
  </div>
</template>

<style scoped>
.tangram-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.stage {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem;
}
.tg-svg {
  width: 260px;
  height: 260px;
  max-width: 100%;
}
.tg-piece {
  stroke: white;
  stroke-width: 0.12;
  opacity: 0.2;
  transition: opacity 0.25s;
}
.tg-piece.on {
  opacity: 1;
}
.tg-piece.moving {
  stroke-dasharray: 0.3 0.2;
}
.tg-label {
  font-size: 0.5px;
  fill: white;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: middle;
}
.tg-label.dim {
  fill: var(--ui-text-muted);
}
.tg-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.tg-btn {
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.2rem 0.8rem;
  cursor: pointer;
}
.tg-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.tg-progress {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.tg-name {
  font-size: 1rem;
  color: var(--ui-text-toned);
}
.tg-name strong {
  color: var(--ui-primary);
  font-size: 1.1rem;
}
.tg-used {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.tg-check {
  font-size: 0.85rem;
  color: var(--ui-primary);
  text-align: center;
  max-width: 34rem;
  line-height: 1.5;
}
.tg-hint {
  font-size: 0.82rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 32rem;
}
</style>
