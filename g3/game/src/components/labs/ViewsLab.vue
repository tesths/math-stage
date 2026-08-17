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
  { name: '前面', rule: '看宽和高', cells: renderGrid(projections.value.front, 2, 2) },
  { name: '右面', rule: '看深和高', cells: renderGrid(projections.value.right, 2, 2) },
  { name: '上面', rule: '看宽和深', cells: renderGrid(projections.value.top, 2, 2) },
])
</script>

<template>
  <div class="views-wrap">
    <svg viewBox="0 0 340 220" class="iso-svg">
      <defs>
        <marker id="view-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ui-warning, #f59e0b)" />
        </marker>
      </defs>
      <text x="170" y="22" text-anchor="middle" class="view-label top-label">上面观察</text>
      <line x1="170" y1="32" x2="170" y2="74" class="view-ray" marker-end="url(#view-arrow)" />
      <text x="306" y="98" text-anchor="middle" class="view-label right-label">右面观察</text>
      <line x1="294" y1="108" x2="244" y2="128" class="view-ray" marker-end="url(#view-arrow)" />
      <text x="170" y="210" text-anchor="middle" class="view-label front-label">前面观察</text>
      <line x1="170" y1="198" x2="170" y2="174" class="view-ray" marker-end="url(#view-arrow)" />
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
            :x="cell.c * 26 + 9"
            :y="cell.r * 26 + 9"
            width="24"
            height="24"
            class="proj-cell"
            :class="{ on: cell.on }"
          />
        </svg>
        <p class="proj-rule">{{ v.rule }}</p>
      </div>
    </div>

    <p class="tip">从不同方向看<b>同一个物体</b>，投影图固定记录这个方向看到的小正方形。观察时视线要与物体的面垂直。</p>
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
.view-ray {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2;
  stroke-dasharray: 4 3;
}
.view-label {
  fill: var(--ui-warning, #f59e0b);
  font-size: 12px;
  font-weight: 800;
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
.proj-rule {
  margin-top: 0.1rem;
  text-align: center;
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.proj-svg {
  width: 92px;
  height: 92px;
}
.proj-cell {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border);
  stroke-width: 1;
}
.proj-cell.on {
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
.tip b {
  color: var(--ui-primary);
}
@media (max-width: 520px) {
  .proj-row {
    gap: 0.5rem;
  }
  .proj-box {
    padding: 0.25rem 0.4rem;
  }
  .proj-svg {
    width: 82px;
    height: 82px;
  }
}
</style>
