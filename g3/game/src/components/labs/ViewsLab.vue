<script setup lang="ts">
/**
 * 观察物体 Lab：正方体摆成的物体 → 前面/右面/上面三视图
 * - 左侧等轴测 3D 积木（SVG）
 * - 右侧三个方向的投影图
 *
 * 本轮（第 4 轮）改动：
 * - 投影格数不再写死 2×2，而是由 `viewGrids` 按真实方块坐标算（L0：图与文字同一份数据）。
 * - 新增「一块一块放」：每点一次真的多放一块，三视图随之变大，新落到的格子高亮（L3）。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { VIEW_SHAPES, viewGrids, type Cube } from '@/lib/labs/views'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const shapeIdx = computed(() => Math.round(props.values.shape ?? 0))
const shape = computed(() => VIEW_SHAPES[shapeIdx.value % VIEW_SHAPES.length]!)
const cubes = computed<Cube[]>(() => shape.value.cubes)

/** 过程态：已经放上桌的块数（默认全部摆好，点一次从 1 块重新摆） */
const placed = ref(cubes.value.length)
const building = ref(false)
function placeOne() {
  if (!building.value) {
    building.value = true
    placed.value = 1
    return
  }
  placed.value = Math.min(placed.value + 1, cubes.value.length)
}
function placeAll() {
  building.value = false
  placed.value = cubes.value.length
}
const visible = computed(() => cubes.value.slice(0, placed.value))
const prevVisible = computed(() => cubes.value.slice(0, Math.max(placed.value - 1, 0)))

/* ---------- 等轴测投影 ---------- */
function proj(x: number, y: number, z: number): [number, number] {
  const u = 22
  return [170 + (x - z) * u, 150 + (x + z) * (u / 2) - y * u]
}
function ptStr(x: number, y: number, z: number): string {
  const [px, py] = proj(x, y, z)
  return `${px},${py}`
}
function polysOf(list: Cube[]): { top: string; right: string; left: string }[] {
  return list.map(([x, y, z]) => ({
    top: [ptStr(x, y + 1, z), ptStr(x + 1, y + 1, z), ptStr(x + 1, y + 1, z + 1), ptStr(x, y + 1, z + 1)].join(' '),
    right: [ptStr(x + 1, y + 1, z), ptStr(x + 1, y + 1, z + 1), ptStr(x + 1, y, z + 1), ptStr(x + 1, y, z)].join(' '),
    left: [ptStr(x, y + 1, z + 1), ptStr(x + 1, y + 1, z + 1), ptStr(x + 1, y, z + 1), ptStr(x, y, z + 1)].join(' '),
  }))
}
const facePolys = computed(() => polysOf(visible.value))
const freshPoly = computed(() => (building.value && visible.value.length ? polysOf([visible.value[visible.value.length - 1]!])[0] : null))

/* ---------- 三视图 ---------- */
const grids = computed(() => viewGrids(visible.value))
const prevGrids = computed(() => viewGrids(prevVisible.value))
const filledCount = (cells: boolean[]) => cells.filter(Boolean).length

const views = computed(() => {
  const mk = (
    name: string,
    rule: string,
    g: { cols: number; rows: number; cells: boolean[] },
    before: { cols: number; rows: number; cells: boolean[] },
  ) => ({
    name,
    rule,
    cols: g.cols,
    rows: g.rows,
    cells: g.cells.map((on, i) => ({ on, fresh: on && !before.cells[i], c: i % g.cols, r: Math.floor(i / g.cols) })),
    count: filledCount(g.cells),
  })
  return [
    mk('前面', '看宽和高', grids.value.front, prevGrids.value.front),
    mk('右面', '看深和高', grids.value.right, prevGrids.value.right),
    mk('上面', '看宽和深', grids.value.top, prevGrids.value.top),
  ]
})
const CELL = 26
function cellSize(g: { cols: number; rows: number }): number {
  return Math.min(CELL, Math.floor(96 / Math.max(g.cols, g.rows)))
}
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
      <g v-if="freshPoly" class="fresh-block">
        <polygon :points="freshPoly.top" class="face top fresh" />
        <polygon :points="freshPoly.right" class="face right fresh" />
        <polygon :points="freshPoly.left" class="face left fresh" />
      </g>
    </svg>

    <div class="view-controls">
      <span class="shape-name">{{ shape.name }}：已放 {{ placed }} / {{ cubes.length }} 块</span>
      <button type="button" class="vw-btn primary" data-test="place-one" @click="placeOne">再放一块，数一数三视图</button>
      <button type="button" class="vw-btn ghost" data-test="place-all" @click="placeAll">全部摆好</button>
    </div>

    <div class="proj-row">
      <div v-for="v in views" :key="v.name" class="proj-box">
        <p class="proj-name">{{ v.name }}</p>
        <svg viewBox="0 0 130 130" class="proj-svg">
          <rect
            v-for="(cell, i) in v.cells"
            :key="i"
            :x="cell.c * cellSize(v) + 9"
            :y="cell.r * cellSize(v) + 9"
            :width="cellSize(v) - 2"
            :height="cellSize(v) - 2"
            class="proj-cell"
            :class="{ on: cell.on, fresh: cell.fresh }"
          />
        </svg>
        <p class="proj-rule">{{ v.rule }}：{{ v.cols }} 列 × {{ v.rows }} 行</p>
        <p class="proj-count" data-test="proj-count">{{ v.count }} 个方格</p>
      </div>
    </div>

    <p class="tip">
      从不同方向看<b>同一个物体</b>，投影图固定记录这个方向看到的小正方形。点击「再放一块」，看每放一块三视图怎么变。
    </p>
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
.face.fresh {
  filter: brightness(1.08);
  stroke: var(--ui-error, #dc2626);
  stroke-width: 2;
  stroke-opacity: 1;
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
.view-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.shape-name {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.vw-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
}
.vw-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.vw-btn.ghost {
  color: var(--ui-text-muted);
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
.proj-rule,
.proj-count {
  margin-top: 0.1rem;
  text-align: center;
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.proj-count {
  color: var(--ui-primary);
  font-weight: 700;
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
.proj-cell.fresh {
  fill: color-mix(in srgb, var(--ui-error, #dc2626) 55%, white);
  stroke: var(--ui-error, #dc2626);
  stroke-width: 2;
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
</style>
