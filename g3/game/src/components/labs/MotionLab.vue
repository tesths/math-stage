<script setup lang="ts">
/**
 * 平移、旋转、轴对称 Lab
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

const dirs = ['右', '左', '上', '下']
const dir = computed(() => Math.round(props.values.dir ?? 0))
const steps = computed(() => Math.round(props.values.steps ?? 4))

const rotDir = computed(() => Math.round(props.values.dir ?? 0))
const angle = computed(() => Math.round(props.values.angle ?? 90))
const clockwise = computed(() => rotDir.value === 0)

const shapeIdx = computed(() => Math.round(props.values.shape ?? 0))

const tx = computed(() => (dir.value === 0 ? steps.value * 34 : dir.value === 1 ? -steps.value * 34 : 0))
const ty = computed(() => (dir.value === 2 ? -steps.value * 30 : dir.value === 3 ? steps.value * 30 : 0))

const startTri = '80,128 124,128 102,88'
const movedTri = computed(() => {
  const pts: [number, number][] = [[0, 0], [44, 0], [22, -40]]
  return pts.map(([px, py]) => `${80 + px + tx.value},${128 + py + ty.value}`).join(' ')
})

const arrowD = computed(() => {
  const x1 = 170
  const y1 = 90
  const dx = dir.value === 0 ? steps.value * 34 : dir.value === 1 ? -steps.value * 34 : 0
  const dy = dir.value === 2 ? -steps.value * 30 : dir.value === 3 ? steps.value * 30 : 0
  return `M ${x1} ${y1} L ${x1 + dx} ${y1 + dy}`
})

/** 旋转角度符号（SVG 旋转单位用度，方向取反以匹配 y 向下） */
const rotDeg = computed(() => {
  const base = angle.value === 360 ? 360 : angle.value
  return clockwise.value ? -base : base
})

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
      <line x1="170" y1="30" x2="170" y2="180" class="grid-v" />
      <line x1="30" y1="105" x2="310" y2="105" class="grid-h" />
      <polygon class="shape ghost" :points="startTri" />
      <polygon class="shape" :points="movedTri" />
      <line :d="arrowD" class="motion-arrow" />
      <text :x="170 + tx / 2" :y="86 + ty / 2" text-anchor="middle" class="dir-label">向{{
        dirs[dir] }}平移 {{ steps }} 格</text>
    </svg>

    <!-- 旋转 -->
    <svg v-else-if="kind === 'rotate'" viewBox="0 0 340 200" class="motion-svg">
      <circle cx="170" cy="110" r="80" class="orbit" />
      <g :transform="`rotate(${rotDeg} 170 110)`">
        <polygon class="shape" points="170,40 178,60 196,52 184,66 196,74 178,74 172,90 166,74 148,74 160,66 148,52 166,60" />
      </g>
      <g class="ghost-rot" :transform="`rotate(${clockwise ? rotDeg : -rotDeg} 170 110)`">
        <polygon class="shape ghost" points="170,40 178,60 196,52 184,66 196,74 178,74 172,90 166,74 148,74 160,66 148,52 166,60" />
      </g>
      <circle cx="170" cy="110" r="5" class="pivot" />
      <text x="170" y="140" text-anchor="middle" class="dir-label">绕 O 点{{ clockwise ? '顺时针' : '逆时针' }}旋转 {{ angle }}°</text>
    </svg>

    <!-- 轴对称 -->
    <svg v-else viewBox="0 0 340 200" class="motion-svg">
      <line x1="170" y1="20" x2="170" y2="170" class="axis-line" />
      <path :d="axisShape.d" class="shape" />
      <text x="170" y="192" text-anchor="middle" class="dir-label">{{ axisShape.name }}：沿对称轴对折两边完全重合</text>
    </svg>

    <p class="tip">
      <template v-if="kind === 'translate'">
        平移：物体整体沿一条直线移动，<b>形状、大小和方向都不变</b>。国旗升起、自动门开关都是平移。
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
  fill: none;
}
.grid-v,
.grid-h {
  stroke: var(--ui-border);
  stroke-width: 1;
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
.dir-label {
  fill: var(--ui-text-muted);
  font-size: 12px;
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
