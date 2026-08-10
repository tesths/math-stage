<script setup lang="ts">
/**
 * 观察物体 Lab：正方体摆成的物体 → 前面/右面/上面三视图
 * - 左侧等轴测 3D 积木（SVG）
 * - 右侧三个方向的投影图
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const shapeIdx = computed(() => Math.round(props.values.shape ?? 0))

/** 四种摆法的方块坐标 (x, y, z) */
const SHAPES: [number, number, number][][] = [
  // 长方体 2×3×1
  [
    [0, 0, 0], [1, 0, 0],
    [0, 0, 1], [1, 0, 1],
    [0, 0, 2], [1, 0, 2],
  ],
  // L 形
  [
    [0, 0, 0], [1, 0, 0], [2, 0, 0],
    [0, 1, 0], [0, 2, 0],
  ],
  // 阶梯形
  [
    [0, 0, 0], [1, 0, 0], [2, 0, 0],
    [0, 1, 0], [1, 1, 0],
  ],
  // 2×2 正方体（田字形）
  [
    [0, 0, 0], [1, 0, 0],
    [0, 1, 0], [1, 1, 0],
  ],
]

const cubes = computed(() => SHAPES[shapeIdx.value % SHAPES.length]!)

/** 等轴测投影 */
function proj(x: number, y: number, z: number): [number, number] {
  const u = 22
  return [170 + (x - z) * u, 150 + (x + z) * (u / 2) - y * u]
}
function ptStr(x: number, y: number, z: number): string {
  const [px, py] = proj(x, y, z)
  return `${px},${py}`
}

const facePolys = computed(() => {
  const out: { top: string; right: string; left: string }[] = []
  for (const [x, y, z] of cubes.value) {
    const top = [ptStr(x, y + 1, z), ptStr(x + 1, y + 1, z), ptStr(x + 1, y + 1, z + 1), ptStr(x, y + 1, z + 1)].join(' ')
    const right = [ptStr(x + 1, y + 1, z), ptStr(x + 1, y + 1, z + 1), ptStr(x + 1, y, z + 1), ptStr(x + 1, y, z)].join(' ')
    const left = [ptStr(x, y + 1, z + 1), ptStr(x + 1, y + 1, z + 1), ptStr(x + 1, y, z + 1), ptStr(x, y, z + 1)].join(' ')
    out.push({ top, right, left })
  }
  return out
})

const projections = computed(() => {
  const front = new Set<string>()
  const right = new Set<string>()
  const top = new Set<string>()
  let maxX = 0
  let maxY = 0
  let maxZ = 0
  for (const [x, y, z] of cubes.value) {
    front.add(`${x},${y}`)
    right.add(`${z},${y}`)
    top.add(`${x},${z}`)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    maxZ = Math.max(maxZ, z)
  }
  return { front, right, top, maxX, maxY, maxZ }
})

/** 渲染投影网格 */
function renderGrid(set: Set<string>, cols: number, rows: number): { on: boolean; c: number; r: number }[] {
  const cells: { on: boolean; c: number; r: number }[] = []
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      cells.push({ on: set.has(`${c},${r}`), c, r })
    }
  }
  return cells
}

const views = computed(() => [
  { name: '前面', cells: renderGrid(projections.value.front, projections.value.maxX, projections.value.maxY) },
  { name: '右面', cells: renderGrid(projections.value.right, projections.value.maxZ, projections.value.maxY) },
  { name: '上面', cells: renderGrid(projections.value.top, projections.value.maxX, projections.value.maxZ) },
])
</script>

<template>
  <div class="views-wrap">
    <svg viewBox="0 0 340 220" class="iso-svg">
      <g v-for="(f, i) in facePolys" :key="i">
        <polygon :points="f.top" class="face top" />
        <polygon :points="f.right" class="face right" />
        <polygon :points="f.left" class="face left" />
      </g>
    </svg>

    <div class="proj-row">
      <div v-for="v in views" :key="v.name" class="proj-box">
        <p class="proj-name">{{ v.name }}</p>
        <svg viewBox="0 0 130 130" class="proj-svg">
          <rect
            v-for="(cell, i) in v.cells"
            :key="i"
            v-show="cell.on"
            :x="cell.c * 26 + 9"
            :y="cell.r * 26 + 9"
            width="24"
            height="24"
            class="proj-cell"
          />
        </svg>
      </div>
    </div>

    <p class="tip">从不同方向看同一个物体，看到的图形可能不同。观察时视线要与物体的面垂直。</p>
  </div>
</template>

<style scoped>
.views-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  width: 100%;
  padding: 0.5rem;
}
.iso-svg {
  width: 100%;
  max-width: 28rem;
}
.face {
  stroke: #0f172a;
  stroke-width: 1;
  stroke-opacity: 0.55;
}
.face.top {
  fill: color-mix(in srgb, var(--ui-primary) 70%, white);
}
.face.right {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
}
.face.left {
  fill: color-mix(in srgb, var(--ui-primary) 25%, white);
}
.proj-row {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.proj-box {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.3rem 0.5rem;
}
.proj-name {
  text-align: center;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  font-weight: 700;
}
.proj-svg {
  width: 92px;
  height: 92px;
}
.proj-cell {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
}
.tip {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
</style>
