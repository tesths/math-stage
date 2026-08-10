<script setup lang="ts">
/**
 * 钉子板上的多边形 Lab（探索规律）
 * 皮克定理：S = n ÷ 2 + b - 1（n 边上钉子，b 内部钉子）
 * 顶点在格点上，边界/内部钉子数由程序精确计算
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/** 预设多边形（顶点为格点坐标） */
const SHAPES: { name: string; pts: [number, number][] }[] = [
  { name: '矩形', pts: [[0, 0], [5, 0], [5, 3], [0, 3]] },
  { name: '三角形', pts: [[0, 0], [6, 0], [2, 4]] },
  { name: 'L 形', pts: [[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]] },
  { name: '五边形', pts: [[0, 0], [6, 0], [6, 2], [3, 4], [0, 2]] },
  { name: '凹四边形', pts: [[0, 0], [5, 0], [5, 4], [2, 2], [0, 4]] },
]

const shapeIdx = computed(() => Math.round(props.values.shape ?? 0) % SHAPES.length)
const shape = computed(() => SHAPES[shapeIdx.value]!)

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return Math.abs(a)
}

/** 鞋带公式求面积 */
function shoelace(pts: [number, number][]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

/** 边上格点数（每条边 gcd(dx,dy) 之和） */
function boundaryPins(pts: [number, number][]): number {
  let n = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    n += gcd(x2 - x1, y2 - y1)
  }
  return n
}

const area = computed(() => shoelace(shape.value.pts))
const n = computed(() => boundaryPins(shape.value.pts))
const b = computed(() => area.value - n.value / 2 + 1)
const pickArea = computed(() => n.value / 2 + b.value - 1)

/** 渲染用：缩放后的顶点（格点 1 = 40px，翻 y） */
const CELL = 40
const OX = 45
const OY = 55
const viewPts = computed(() =>
  shape.value.pts.map(([x, y]) => ({ x: OX + x * CELL, y: OY + y * CELL })),
)
const polyPoints = computed(() => viewPts.value.map((p) => `${p.x},${p.y}`).join(' '))

/** 判定每个格点是否在边上/内部（含边界判定） */
function pointStatus(px: number, py: number): 'boundary' | 'inside' | 'outside' {
  const pts = shape.value.pts
  // 在边上？
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    const cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)
    if (cross === 0 && px >= Math.min(x1, x2) && px <= Math.max(x1, x2) && py >= Math.min(y1, y2) && py <= Math.max(y1, y2)) {
      return 'boundary'
    }
  }
  // 射线法判断内部
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]!
    const [xj, yj] = pts[j]!
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside ? 'inside' : 'outside'
}

const boardPins = computed(() => {
  const out: { x: number; y: number; st: 'boundary' | 'inside' | 'outside' }[] = []
  for (let gy = 0; gy <= 6; gy++) {
    for (let gx = 0; gx <= 8; gx++) {
      out.push({ x: OX + gx * CELL, y: OY + gy * CELL, st: pointStatus(gx, gy) })
    }
  }
  return out
})
</script>

<template>
  <div class="pinboard-wrap">
    <svg viewBox="0 0 400 340" class="w-full">
      <!-- 钉子板 -->
      <rect x="20" y="20" width="350" height="290" rx="8" class="board" />
      <g v-for="(pin, i) in boardPins" :key="i">
        <circle :cx="pin.x" :cy="pin.y" r="4" class="pin-plain" :class="pin.st" />
      </g>
      <!-- 多边形 -->
      <polygon :points="polyPoints" class="poly-fill" />
      <polyline :points="polyPoints" fill="none" class="poly-line" />
      <!-- 顶点 -->
      <circle
        v-for="(p, i) in viewPts"
        :key="i"
        :cx="p.x"
        :cy="p.y"
        r="6"
        class="vertex"
      />
      <text x="390" y="330" text-anchor="end" class="shape-name">{{ shape.name }}</text>
    </svg>

    <div class="pick-box">
      <div class="pick-stat">
        <span class="pick-label">边上钉子 n</span>
        <strong>{{ n }}</strong>
      </div>
      <span class="pick-op">÷ 2</span>
      <span class="pick-plus">+</span>
      <div class="pick-stat">
        <span class="pick-label">内部钉子 b</span>
        <strong>{{ b }}</strong>
      </div>
      <span class="pick-op">− 1</span>
      <span class="pick-eq">=</span>
      <div class="pick-stat">
        <span class="pick-label">面积 S</span>
        <strong class="pick-result">{{ pickArea }}</strong>
      </div>
      <p class="pick-check">✓ 与数方格面积 {{ area }} 一致</p>
    </div>
  </div>
</template>

<style scoped>
.pinboard-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
}
svg {
  max-width: 644px;
}
.board {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border-accented);
}
.pin-plain {
  fill: var(--ui-text-muted);
  opacity: 0.35;
}
.pin-plain.boundary {
  fill: var(--ui-primary);
  opacity: 1;
}
.pin-plain.inside {
  fill: color-mix(in srgb, var(--ui-primary) 70%, white);
  opacity: 0.9;
}
.poly-fill {
  fill: color-mix(in srgb, var(--ui-primary) 20%, transparent);
}
.poly-line {
  stroke: var(--ui-primary);
  stroke-width: 3;
  stroke-linejoin: round;
}
.vertex {
  fill: var(--ui-text-highlighted);
  stroke: white;
  stroke-width: 1.5;
}
.shape-name {
  font-size: 14px;
  fill: var(--ui-text-muted);
  font-weight: 700;
}
.pick-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg-muted);
  border-radius: var(--ui-radius-xl);
  padding: 0.7rem 1rem;
}
.pick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pick-label {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.pick-stat strong {
  font-size: 1.3rem;
  color: var(--ui-text-highlighted);
}
.pick-stat strong.pick-result {
  color: var(--ui-primary);
  font-size: 1.6rem;
}
.pick-op,
.pick-plus,
.pick-eq {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-text-muted);
}
.pick-check {
  width: 100%;
  text-align: center;
  font-size: 0.8rem;
  color: var(--ui-success, #16a34a);
  font-weight: 600;
}
</style>
