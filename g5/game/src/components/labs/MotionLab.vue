<script setup lang="ts">
/**
 * 图形的运动 Lab（平移 / 旋转 / 轴对称）
 * 平移：原图淡影 + 对应点箭头 + 格数标尺
 * 旋转：固定中心 + 弧形箭头 + 角度扇形 + 前后叠影
 * 轴对称：对称轴 + 对应点垂线距离标记 + 对折重合动画
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const CELL = 36
const GRID = 10

/** 平移专用：动态格宽，保证最大格数（含上下移动）也落在 viewBox 内 */
const tCell = computed(() => {
  const g = Math.max(1, grid.value)
  return Math.min(CELL, 168 / g)
})
const gridCols = computed(() => {
  if (isRotate.value || isAxis.value) return GRID
  return Math.ceil(360 / tCell.value)
})

const boatPath =
  'M0,0 L0,1.6 L1.6,1.6 L2.2,0.6 L3.2,0.6 L3.8,1.6 L6,1.6 L6,0 L5.4,-0.9 L4.8,-1.8 L2.4,-1.8 L0.6,-0.9 Z'
const houseHalfPath = 'M0,0 L0,-2 L2.4,-3.6 L4.8,-2 L4.8,0 Z'

const dirs = ['right', 'down', 'left', 'up'] as const
const dir = computed(() => dirs[Math.round(props.values.dir ?? 0) % 4]!)
const grid = computed(() => Math.round(props.values.grid ?? 0))

/** 平移向量（格 → px） */
const dx = computed(() =>
  dir.value === 'right' ? grid.value * tCell.value : dir.value === 'left' ? -grid.value * tCell.value : 0,
)
const dy = computed(() =>
  dir.value === 'down' ? grid.value * tCell.value : dir.value === 'up' ? -grid.value * tCell.value : 0,
)

const angle = computed(() => Math.round(props.values.angle ?? 0))
const clockwise = computed(() => Math.round(props.values.dir ?? 0) === 0)
const rotateDeg = computed(() => (clockwise.value ? angle.value : -angle.value))

const sym = computed(() => Math.round(props.values.sym ?? 1))
const axisX = computed(() => 150 + sym.value * 30)

const isRotate = computed(() => props.lab.kind === 'rotate')
const isAxis = computed(() => props.lab.kind === 'axis')

/** 平移演示：小船上的对应点（船体局部坐标，船底位于 (2*tCell, 180)） */
const originPts = [
  { x: 30, y: 4 }, // 船头
  { x: 0, y: 4 }, // 船尾
  { x: 15, y: -9 }, // 桅杆顶
]

/** 旋转扇形 + 弧（从初始 +x 方向转到旋转后位置） */
const rotSector = computed(() => {
  const r = 78
  const start = { x: 180 + r, y: 180 }
  const rad = (rotateDeg.value * Math.PI) / 180
  const end = { x: 180 + r * Math.cos(rad), y: 180 - r * Math.sin(rad) }
  if (angle.value >= 360) {
    return { full: true as const, d: '', start, end }
  }
  const large = angle.value > 180 ? 1 : 0
  const sweep = clockwise.value ? 1 : 0
  return {
    full: false as const,
    d: `M 180 180 L ${start.x} ${start.y} A ${r} ${r} 0 ${large} ${sweep} ${end.x.toFixed(3)} ${end.y.toFixed(3)} Z`,
    start,
    end,
  }
})
const rotArc = computed(() => {
  const r = 52
  const rad = (rotateDeg.value * Math.PI) / 180
  const end = { x: 180 + r * Math.cos(rad), y: 180 - r * Math.sin(rad) }
  if (angle.value >= 360) return `M 180 128 A 52 52 0 1 1 179.99 128`
  const large = angle.value > 180 ? 1 : 0
  const sweep = clockwise.value ? 1 : 0
  return `M 232 180 A 52 52 0 ${large} ${sweep} ${end.x.toFixed(3)} ${end.y.toFixed(3)}`
})
/** 角度标签位置：旋转扇形中线 */
const angleMid = computed(() => {
  if (angle.value === 0) return { x: 232, y: 180 }
  const rad = ((rotateDeg.value / 2) * Math.PI) / 180
  return { x: 180 + 62 * Math.cos(rad), y: 180 - 62 * Math.sin(rad) }
})

/** 格数标尺：沿移动方向每格一条刻度线 */
const rulerTicks = computed(() => {
  const ticks: { x: number; y: number; major: boolean }[] = []
  for (let k = 1; k <= grid.value; k++) {
    const px = 2 * tCell.value + 15 + (dx.value * k) / Math.max(1, grid.value)
    const py = 180 + (dy.value * k) / Math.max(1, grid.value)
    ticks.push({ x: px, y: py, major: k % (Math.min(3, grid.value)) === 0 })
  }
  return ticks
})

const dirLabel = computed(() => {
  const m: Record<string, string> = { right: '右', down: '下', left: '左', up: '上' }
  return `向${m[dir.value]}平移 ${grid.value} 格`
})
</script>

<template>
  <div class="lab-wrap">
    <svg viewBox="0 0 360 360" class="w-full">
      <defs>
        <marker
          id="fmotion-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ui-warning)" />
        </marker>
      </defs>
      <!-- 网格 -->
      <g class="grid-lines">
        <line
          v-for="i in gridCols"
          :key="'v' + i"
          :x1="(i - 1) * (isRotate || isAxis ? CELL : tCell)"
          :y1="0"
          :x2="(i - 1) * (isRotate || isAxis ? CELL : tCell)"
          :y2="GRID * CELL"
        />
        <line
          v-for="i in GRID + 1"
          :key="'h' + i"
          :x1="0"
          :y1="(i - 1) * CELL"
          :x2="GRID * CELL"
          :y2="(i - 1) * CELL"
        />
      </g>

      <!-- 平移 -->
      <template v-if="lab.kind === 'translate'">
        <g class="shape-original">
          <path :d="boatPath" :transform="`translate(${2 * tCell}, 180) scale(5)`" class="fill-original" />
        </g>
        <!-- 平移后的形状 -->
        <g
          class="shape-target"
          :style="{
            transform: `translate(${dx}px, ${dy}px)`,
            transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          }"
        >
          <path :d="boatPath" :transform="`translate(${2 * tCell}, 180) scale(5)`" class="fill-target" />
        </g>
        <!-- 对应点箭头 -->
        <g v-if="grid > 0" class="corr-points">
          <g v-for="(p, i) in originPts" :key="i">
            <circle :cx="2 * tCell + p.x" :cy="180 + p.y" r="5" class="fill-original" />
            <circle :cx="2 * tCell + p.x + dx" :cy="180 + p.y + dy" r="5" class="fill-original" />
            <line
              :x1="2 * tCell + p.x"
              :y1="180 + p.y"
              :x2="2 * tCell + p.x + dx"
              :y2="180 + p.y + dy"
              class="corr-line"
              marker-end="url(#fmotion-arrow)"
            />
            <text
              v-if="i === 1"
              :x="2 * tCell + p.x + dx / 2"
              :y="180 + p.y + dy / 2 - 10"
              :class="{ 'hor-pos': dir === 'right' || dir === 'left' }"
              class="corr-label"
            >
              {{ grid }}格
            </text>
          </g>
        </g>
        <!-- 格数标尺 -->
        <g v-if="grid > 1" class="ruler">
          <line
            v-for="(t, k) in rulerTicks"
            :key="k"
            :x1="t.x"
            :y1="t.y - (dir === 'right' || dir === 'left' ? 46 : 40) - (t.major ? 4 : 0)"
            :x2="t.x"
            :y2="t.y - (dir === 'right' || dir === 'left' ? 46 : 40) + (t.major ? 4 : 0)"
            class="corr-line"
          />
          <text :x="2 * tCell + 15 + dx / 2" :y="166" text-anchor="middle" class="corr-label">
            {{ dirLabel }}（整体移动）
          </text>
        </g>
      </template>

      <!-- 旋转 -->
      <template v-else-if="lab.kind === 'rotate'">
        <circle cx="180" cy="180" r="4" class="pivot" />
        <text x="190" y="172" class="pivot-label">O</text>
        <g
          class="lever"
          :style="{
            transform: `rotate(${rotateDeg}deg)`,
            transformOrigin: '180px 180px',
            transition: 'transform 0.6s ease',
          }"
        >
          <rect x="180" y="178" width="150" height="4" rx="2" class="fill-original" />
          <rect x="325" y="165" width="12" height="30" rx="4" class="fill-target" />
          <circle cx="180" cy="180" r="6" class="fill-target" />
        </g>
        <g v-if="angle > 0" class="ghost-lever">
          <rect
            x="180"
            y="178"
            width="150"
            height="4"
            rx="2"
            :style="{ transform: `rotate(${-rotateDeg}deg)`, transformOrigin: '180px 180px' }"
            class="ghost"
          />
        </g>
        <!-- 角度扇形 + 弧形箭头 -->
        <template v-if="angle > 0">
          <circle v-if="rotSector.full" cx="180" cy="180" r="78" class="sector-disc" />
          <path v-else :d="rotSector.d" class="sector" />
          <path :d="rotArc" class="arc" marker-end="url(#fmotion-arrow)" />
        </template>
        <text v-if="angle > 0" :x="angleMid.x" :y="angleMid.y + 5" text-anchor="middle" class="angle-label">
          {{ angle }}°
        </text>
        <text x="180" y="350" text-anchor="middle" class="corr-label">
          绕 O 点{{ clockwise ? '顺时针' : '逆时针' }}旋转 {{ angle }}°，形状大小不变
        </text>
      </template>

      <!-- 轴对称 -->
      <template v-else>
        <line :x1="axisX" :y1="20" :x2="axisX" :y2="340" class="axis-line" />
        <text :x="axisX + 6" y="30" class="axis-label">对称轴</text>
        <!-- 左半：固定 -->
        <path :d="houseHalfPath" transform="translate(66, 200) scale(16)" class="fill-original" />
        <!-- 右半：以 axisX 为轴镜像（随滑块移动） -->
        <g
          class="mirror-group"
          :style="{
            transform: `translate(${axisX}px, 0) scale(-1, 1) translate(${-axisX}px, 0)`,
            transition: 'transform 0.5s ease',
          }"
        >
          <path :d="houseHalfPath" transform="translate(66, 200) scale(16)" class="fill-target" />
        </g>
        <!-- 对折动画：左半以对称轴为折痕翻折到右半，两边完全重合 -->
        <g class="fold-overlay" :style="{ '--fold-x': axisX + 'px' }">
          <path :d="houseHalfPath" transform="translate(66, 200) scale(16)" class="fill-fold" />
        </g>
        <!-- 对应点到对称轴距离 -->
        <g class="dist-marks">
          <line
            :x1="66 + 2.4 * 16"
            :y1="200 - 3.6 * 16"
            :x2="axisX"
            :y2="200 - 3.6 * 16"
            class="corr-line"
          />
          <line
            :x1="axisX"
            :y1="200 - 3.6 * 16"
            :x2="2 * axisX - 66 - 2.4 * 16"
            :y2="200 - 3.6 * 16"
            class="corr-line"
          />
          <text :x="axisX" :y="200 - 3.6 * 16 - 10" text-anchor="middle" class="corr-label">
            距离相等
          </text>
        </g>
      </template>
    </svg>

    <p class="lab-caption">{{ lab.prompt }}</p>
  </div>
</template>

<style scoped>
.lab-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
svg {
  max-width: 644px;
}
.grid-lines line {
  stroke: var(--ui-border);
  stroke-width: 1;
}
.fill-original {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
}
.fill-target {
  fill: color-mix(in srgb, var(--ui-primary) 30%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.fill-fold {
  fill: color-mix(in srgb, var(--ui-secondary, #38bdf8) 40%, white);
  stroke: var(--ui-secondary, #38bdf8);
  stroke-width: 1.5;
}
.corr-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}
.corr-label,
.angle-label,
.axis-label,
.pivot-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.corr-label.hor-pos {
  text-anchor: middle;
}
.pivot {
  fill: var(--ui-primary);
}
.arc {
  fill: none;
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2.5;
}
.angle-label {
  fill: var(--ui-warning, #f59e0b);
  font-weight: 700;
}
.sector {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 20%, transparent);
}
.sector-disc {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 20%, transparent);
}
.ghost {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-dasharray: 4 3;
  opacity: 0.7;
}
.axis-line {
  stroke: var(--ui-primary);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
/* 对折动画：左半以对称轴为折痕翻折到右半 */
.fold-overlay {
  transform-box: fill-box;
  transform-origin: var(--fold-x) 200px;
  animation: foldSquash 3.6s ease-in-out infinite;
}
@keyframes foldSquash {
  0%,
  25% {
    transform: scaleX(1);
    opacity: 0;
  }
  50%,
  85% {
    transform: scaleX(-1);
    opacity: 0.85;
  }
  100% {
    transform: scaleX(-1);
    opacity: 0.85;
  }
}
.lab-caption {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 59rem;
}
</style>