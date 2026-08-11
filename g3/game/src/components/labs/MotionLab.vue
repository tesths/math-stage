<script setup lang="ts">
/**
 * 平移、旋转、轴对称 Lab
 * 平移：原图淡影 + 对应点箭头 + 方向箭 → 结论"对应点距离相等、形状大小不变"
 * 旋转：固定中心 + 角度扇形 + 弧形箭头 + 前后叠影
 * 轴对称：形状居中于对称轴 + 对折重合动画（对称轴处压扁翻折脉冲）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

const dirs = ['右', '左', '上', '下']
const dir = computed(() => Math.round(props.values.dir ?? 0) % 4)
const steps = computed(() => Math.round(props.values.steps ?? 4))

const rotDir = computed(() => Math.round(props.values.dir ?? 0) % 2)
const angle = computed(() => Math.round(props.values.angle ?? 90))
const clockwise = computed(() => rotDir.value === 0)

const shapeIdx = computed(() => Math.round(props.values.shape ?? 0))

/* ---------- 平移 ---------- */
const CELL_X = 34
const CELL_Y = 30
const tx = computed(() => {
  if (dir.value === 0) return steps.value * CELL_X
  if (dir.value === 1) return -steps.value * CELL_X
  return 0
})
const ty = computed(() => {
  if (dir.value === 2) return -steps.value * CELL_Y
  if (dir.value === 3) return steps.value * CELL_Y
  return 0
})

const startTri = '80,128 124,128 102,88'
const movedTri = computed(() => {
  const pts: [number, number][] = [
    [0, 0],
    [44, 0],
    [22, -40],
  ]
  return pts.map(([px, py]) => `${80 + px + tx.value},${128 + py + ty.value}`).join(' ')
})

/** 方向主箭头：原图中心 → 新图中心 */
const arrow = computed(() => {
  const x1 = 102 + (tx.value * 2) / 5
  const y1 = 108 + (ty.value * 2) / 5
  const x2 = 102 + (tx.value * 3) / 5
  const y2 = 108 + (ty.value * 3) / 5
  return { x1, y1, x2, y2 }
})

/* 对应点：三角形三个顶点 */
const triPts = [
  { x: 80, y: 128 },
  { x: 124, y: 128 },
  { x: 102, y: 88 },
]

/* ---------- 旋转 ---------- */
const rotDeg = computed(() => (clockwise.value ? -angle.value : angle.value))

const SX = 170
const SY = 110
/** 旋转扇形（sweep=1 顺时针，sweep=0 逆时针） */
const sector = computed(() => {
  const r = 58
  const a0 = -90
  const a1 = a0 + (clockwise.value ? angle.value : -angle.value)
  if (angle.value >= 360) return { d: '', full: true }
  const p0 = { x: SX + r * Math.cos((a0 * Math.PI) / 180), y: SY + r * Math.sin((a0 * Math.PI) / 180) }
  const p1 = { x: SX + r * Math.cos((a1 * Math.PI) / 180), y: SY + r * Math.sin((a1 * Math.PI) / 180) }
  const large = angle.value > 180 ? 1 : 0
  const sweep = clockwise.value ? 1 : 0
  return { d: `M ${SX} ${SY} L ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} ${sweep} ${p1.x} ${p1.y} Z`, full: false }
})
/** 弧形箭头 */
const arcD = computed(() => {
  const r = 58
  const a0 = -90
  const a1 = a0 + (clockwise.value ? angle.value : -angle.value)
  if (angle.value >= 360) return `M ${SX} ${SY - r} A ${r} ${r} 0 1 1 ${SX - 0.01} ${SY - r}`
  const p0 = { x: SX + r * Math.cos((a0 * Math.PI) / 180), y: SY + r * Math.sin((a0 * Math.PI) / 180) }
  const p1 = { x: SX + r * Math.cos((a1 * Math.PI) / 180), y: SY + r * Math.sin((a1 * Math.PI) / 180) }
  const large = angle.value > 180 ? 1 : 0
  const sweep = clockwise.value ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} ${sweep} ${p1.x} ${p1.y}`
})
/** 角度标签位置：扇形中线 */
const angleMid = computed(() => {
  const d = (-90 + (clockwise.value ? angle.value / 2 : -angle.value / 2)) * (Math.PI / 180)
  return { x: SX + 40 * Math.cos(d), y: SY + 40 * Math.sin(d) }
})

/* ---------- 轴对称 ---------- */
const axisShapes = [
  { d: 'M 60,120 Q 60,70 95,50 Q 130,70 130,120 L 95,140 Z', name: '心形' },
  { d: 'M 95,30 L 110,55 L 95,55 L 80,55 L 95,30 Z M 60,120 L 95,55 L 130,120 L 95,105 Z', name: '纸飞机' },
  { d: 'M 95,30 L 110,75 L 130,75 L 112,95 L 125,130 L 95,110 L 65,130 L 78,95 L 60,75 L 80,75 Z', name: '松树' },
  { d: 'M 95,40 L 130,70 L 115,70 L 135,100 L 55,100 L 75,70 L 60,70 Z', name: '风筝' },
  { d: 'M 95,45 L 75,35 L 80,60 L 55,70 L 80,85 L 75,110 L 95,95 L 115,110 L 110,85 L 135,70 L 110,60 L 115,35 Z', name: '蝴蝶' },
]
const axisShape = computed(() => axisShapes[shapeIdx.value % axisShapes.length]!)
</script>

<template>
  <div class="motion-wrap">
    <!-- 平移 -->
    <svg v-if="kind === 'translate'" viewBox="0 0 340 200" class="motion-svg">
      <defs>
        <marker
          id="mtri-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ui-warning)" />
        </marker>
      </defs>
      <polygon class="shape ghost" :points="startTri" />
      <polygon class="shape" :points="movedTri" />
      <!-- 对应点连线 + 箭头 -->
      <g v-for="(p, i) in triPts" :key="i" class="corr">
        <circle :cx="p.x" :cy="p.y" r="4" class="corr-dot" />
        <circle :cx="p.x + tx" :cy="p.y + ty" r="4" class="corr-dot" />
        <line :x1="p.x" :y1="p.y" :x2="p.x + tx" :y2="p.y + ty" class="corr-line" marker-end="url(#mtri-arrow)" />
      </g>
      <!-- 方向主箭头 + 说明 -->
      <line :x1="arrow.x1" :y1="arrow.y1" :x2="arrow.x2" :y2="arrow.y2" class="motion-arrow" marker-end="url(#mtri-arrow)" />
      <text :x="102 + tx / 2" :y="82 + ty / 2" text-anchor="middle" class="dir-label">
        向{{ dirs[dir] }}平移 {{ steps }} 格，形状、大小不变
      </text>
    </svg>

    <!-- 旋转 -->
    <svg v-else-if="kind === 'rotate'" viewBox="0 0 340 200" class="motion-svg">
      <circle cx="170" cy="110" r="80" class="orbit" />
      <circle v-if="sector.full" cx="170" cy="110" r="58" class="sector" />
      <path v-else :d="sector.d" class="sector" />
      <path :d="arcD" class="arc" marker-end="url(#mtri-arrow)" />
      <text :x="angleMid.x" :y="angleMid.y + 5" text-anchor="middle" class="angle-label">{{ angle }}°</text>
      <g :transform="`rotate(${rotDeg} 170 110)`">
        <polygon class="shape" points="170,40 178,60 196,52 184,66 196,74 178,74 172,90 166,74 148,74 160,66 148,52 166,60" />
      </g>
      <g class="ghost-rot">
        <polygon class="shape ghost" points="170,40 178,60 196,52 184,66 196,74 178,74 172,90 166,74 148,74 160,66 148,52 166,60" />
      </g>
      <circle cx="170" cy="110" r="5" class="pivot" />
      <text x="170" y="140" text-anchor="middle" class="dir-label">
        绕 O 点{{ clockwise ? '顺时针' : '逆时针' }}旋转 {{ angle }}°，形状、大小不变
      </text>
    </svg>

    <!-- 轴对称 -->
    <svg v-else viewBox="0 0 340 200" class="motion-svg">
      <line x1="170" y1="20" x2="170" y2="170" class="axis-line" />
      <text x="170" y="12" text-anchor="middle" class="dir-label">对称轴</text>
      <!-- 形状居中于对称轴 -->
      <path :d="axisShape.d" transform="translate(75 0)" class="shape" />
      <!-- 对折动画：整图以对称轴压扁翻折-->
      <g class="fold-overlay">
        <path :d="axisShape.d" transform="translate(75 0)" class="fill-fold" />
      </g>
      <!-- 对应点到对称轴距离相等 -->
      <g class="equi">
        <line x1="102" y1="60" x2="238" y2="60" class="corr-line" />
        <circle cx="102" cy="60" r="3" class="corr-dot" />
        <circle cx="238" cy="60" r="3" class="corr-dot" />
        <line x1="118" y1="120" x2="222" y2="120" class="corr-line" />
        <circle cx="118" cy="120" r="3" class="corr-dot" />
        <circle cx="222" cy="120" r="3" class="corr-dot" />
      </g>
      <text x="170" y="192" text-anchor="middle" class="dir-label">
        {{ axisShape.name }}：沿对称轴对折，折痕两边完全重合（对应点到对称轴距离相等）
      </text>
    </svg>

    <p class="tip">
      <template v-if="kind === 'translate'">
        平移：物体整体沿一条直线移动，<b>形状、大小和方向都不变</b>。国旗升起、自动门开关都是平移。对应点之间的距离<b>都相等</b>（都是 {{ steps }} 格）。
      </template>
      <template v-else-if="kind === 'rotate'">
        旋转：物体绕一个固定点转动，<b>形状和大小不变，方向改变</b>。电风扇叶片转动、钟表指针转动都是旋转。
      </template>
      <template v-else>
        如果一个图形沿一条直线对折，两边<b>能完全重合</b>，这个图形就是<b>轴对称图形</b>，这条直线叫作对称轴。
      </template>
    </p>
  </div>
</template>

<style scoped>
.motion-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.motion-svg {
  width: 100%;
  max-width: 31rem;
}
.shape {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.shape.ghost {
  fill: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  stroke: var(--ui-border);
  stroke-dasharray: 4 3;
}
.ghost-rot {
  opacity: 0.5;
}
.motion-arrow {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2.5;
}
.corr-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}
.corr-dot {
  fill: var(--ui-warning, #f59e0b);
}
.orbit {
  fill: none;
  stroke: var(--ui-border);
  stroke-dasharray: 4 3;
}
.pivot {
  fill: var(--ui-primary);
  stroke: white;
  stroke-width: 2;
}
.axis-line {
  stroke: var(--ui-secondary, var(--ui-info));
  stroke-width: 2.5;
  stroke-dasharray: 6 4;
}
.sector {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 22%, transparent);
}
.arc {
  fill: none;
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2;
}
.angle-label {
  fill: var(--ui-warning, #f59e0b);
  font-size: 13px;
  font-weight: 700;
}
.dir-label {
  fill: var(--ui-text-muted);
  font-size: 12px;
}
/* 对折动画：以对称轴为折痕压扁 → 翻折重合 */
.fold-overlay {
  transform-box: fill-box;
  transform-origin: 170px 110px;
  animation: foldSquash 3.6s ease-in-out infinite;
}
.fill-fold {
  fill: color-mix(in srgb, var(--ui-secondary, #38bdf8) 38%, white);
  stroke: var(--ui-secondary, #38bdf8);
  stroke-width: 1.5;
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
    opacity: 0.8;
  }
  100% {
    transform: scaleX(-1);
    opacity: 0.8;
  }
}
.tip {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
.tip b {
  color: var(--ui-primary);
}
</style>