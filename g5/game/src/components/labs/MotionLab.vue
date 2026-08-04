<script setup lang="ts">
/**
 * 图形的运动 Lab（平移 / 旋转 / 轴对称）
 * 纯 SVG 网格 + CSS transform 过渡，参数变化时平滑移动
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const CELL = 36
const GRID = 10

const boatPath =
  'M0,0 L0,1.6 L1.6,1.6 L2.2,0.6 L3.2,0.6 L3.8,1.6 L6,1.6 L6,0 L5.4,-0.9 L4.8,-1.8 L2.4,-1.8 L0.6,-0.9 Z'
const houseHalfPath = 'M0,0 L0,-2 L2.4,-3.6 L4.8,-2 L4.8,0 Z'

const dirs = ['right', 'down', 'left', 'up'] as const
const dir = computed(() => dirs[Math.round(props.values.dir ?? 0) % 4]!)
const grid = computed(() => Math.round(props.values.grid ?? 0))

/** 平移向量（格 → px） */
const dx = computed(() =>
  dir.value === 'right' ? grid.value * CELL : dir.value === 'left' ? -grid.value * CELL : 0,
)
const dy = computed(() =>
  dir.value === 'down' ? grid.value * CELL : dir.value === 'up' ? -grid.value * CELL : 0,
)

const angle = computed(() => Math.round(props.values.angle ?? 0))
const clockwise = computed(() => Math.round(props.values.dir ?? 0) === 0)
const rotateDeg = computed(() => (clockwise.value ? angle.value : -angle.value))

const sym = computed(() => Math.round(props.values.sym ?? 1))
const axisX = computed(() => 150 + sym.value * 60)

const isRotate = computed(() => props.lab.kind === 'rotate')
const isAxis = computed(() => props.lab.kind === 'axis')

/** 平移演示：原形上的对应点（格坐标） */
const originPts = [
  { x: 0, y: 0 },
  { x: 2, y: -1.5 },
  { x: 4, y: -1.2 },
]

/** 旋转弧终点（模板用） */
const arcEnd = computed(() => {
  const a = (angle.value * Math.PI) / 180
  return { x: 180 + 24 * Math.cos(a), y: 180 - 24 * Math.sin(a) }
})
</script>

<template>
  <div class="lab-wrap">
    <svg viewBox="0 0 360 360" class="w-full">
      <!-- 网格 -->
      <g class="grid-lines">
        <line
          v-for="i in GRID + 1"
          :key="'v' + i"
          :x1="i * CELL"
          :y1="0"
          :x2="i * CELL"
          :y2="GRID * CELL"
        />
        <line
          v-for="i in GRID + 1"
          :key="'h' + i"
          :x1="0"
          :y1="i * CELL"
          :x2="GRID * CELL"
          :y2="i * CELL"
        />
      </g>

      <!-- 平移 -->
      <template v-if="lab.kind === 'translate'">
        <g class="shape-original">
          <path :d="boatPath" transform="translate(36, 90) scale(5)" class="fill-original" />
        </g>
        <!-- 平移后的形状 -->
        <g
          class="shape-target"
          :style="{
            transform: `translate(${dx}px, ${dy}px)`,
            transition: 'transform 0.5s cubic-bezier(.4,0,.2,1)',
          }"
        >
          <path :d="boatPath" transform="translate(36, 90) scale(5)" class="fill-target" />
        </g>
        <!-- 对应点 -->
        <g v-if="grid > 0" class="corr-points">
          <g v-for="(p, i) in originPts" :key="i">
            <circle
              :cx="(p.x + 2) * CELL"
              :cy="(5 - p.y) * CELL"
              r="5"
              class="fill-original"
            />
            <circle
              :cx="(p.x + 2) * CELL + dx"
              :cy="(5 - p.y) * CELL + dy"
              r="5"
              class="fill-target"
            />
            <line
              :x1="(p.x + 2) * CELL"
              :y1="(5 - p.y) * CELL"
              :x2="(p.x + 2) * CELL + dx"
              :y2="(5 - p.y) * CELL + dy"
              class="corr-line"
            />
            <text
              :x="((p.x + 2) * CELL + dx) / 2"
              :y="(5 - p.y) * CELL + dy / 2 - 8"
              class="corr-label"
            >
              {{ grid }}格
            </text>
          </g>
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
        <!-- 旋转弧 -->
        <path
          :d="`M 180 156 A 24 24 0 0 1 ${arcEnd.x.toFixed(3)} ${arcEnd.y.toFixed(3)}`"
          fill="none"
          class="arc"
          :class="{ flip: !clockwise }"
        />
        <text x="196" y="150" class="angle-label">{{ angle }}°</text>
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
  max-width: 460px;
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
.corr-line {
  stroke: var(--ui-primary);
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
.pivot {
  fill: var(--ui-primary);
}
.arc {
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.arc.flip {
  transform: scaleY(-1);
  transform-origin: 180px 180px;
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
.lab-caption {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 42rem;
}
</style>
