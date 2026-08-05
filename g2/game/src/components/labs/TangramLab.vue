<script setup lang="ts">
/**
 * 七巧板 Lab：展示七巧板的组成，切换图案并高亮所用板块
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const sel = computed(() => Math.round(props.values.sel ?? 0))

/** 经典 4×4 正方形七巧板布局（坐标已校验，7 块拼成正方形） */
const PIECES = [
  { no: 1, points: '0,0 4,0 2,2' },
  { no: 2, points: '0,0 0,4 2,2' },
  { no: 3, points: '4,0 4,2 2,2' },
  { no: 4, points: '3,1 4,2 3,3 2,2' },
  { no: 5, points: '0,4 2,4 1,3' },
  { no: 6, points: '2,4 4,4 3,3' },
  { no: 7, points: '1,3 2,2 3,3 2,4' },
]

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316']

/** 各图案所用板块（1~7 号） */
const PATTERNS: { no: number; name: string; pieces: number[] }[] = [
  { no: 0, name: '正方形', pieces: [1, 2, 3, 4, 5, 6, 7] },
  { no: 1, name: '长方形', pieces: [3, 4, 5] },
  { no: 2, name: '平行四边形', pieces: [3, 4, 5] },
  { no: 3, name: '三角形', pieces: [1, 3, 5, 7] },
]
const pattern = computed(() => PATTERNS[sel.value]!)
const active = (no: number) => pattern.value.pieces.includes(no)
</script>

<template>
  <div class="tangram-wrap">
    <div class="stage">
      <svg viewBox="-0.6 -0.6 5.2 5.2" class="tg-svg" role="img">
        <polygon
          v-for="pc in PIECES"
          :key="pc.no"
          :points="pc.points"
          class="tg-piece"
          :class="{ on: active(pc.no) }"
          :style="{ fill: COLORS[pc.no - 1] }"
        >
          <title>第{{ pc.no }}号板</title>
        </polygon>
        <text
          v-for="pc in PIECES"
          :key="`t-${pc.no}`"
          :x="pieceCenter(pc.points)[0]"
          :y="pieceCenter(pc.points)[1]"
          class="tg-label"
        >{{ pc.no }}</text>
      </svg>
    </div>
    <p class="tg-name">
      拼成<strong> {{ pattern.name }}</strong>：{{ pattern.pieces.map((n) => `${n}号板`).join('、') }}
    </p>
  </div>
</template>

<script lang="ts">
function pieceCenter(points: string): [number, number] {
  const xs = points.split(' ').map((p) => Number(p.split(',')[0]))
  const ys = points.split(' ').map((p) => Number(p.split(',')[1]))
  return [xs.reduce((a, b) => a + b, 0) / xs.length, ys.reduce((a, b) => a + b, 0) / ys.length]
}
</script>

<style scoped>
.tangram-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
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
  width: 240px;
  height: 240px;
  max-width: 100%;
}
.tg-piece {
  stroke: white;
  stroke-width: 0.12;
  opacity: 0.28;
  transition: opacity 0.25s;
}
.tg-piece.on {
  opacity: 1;
}
.tg-label {
  font-size: 0.45px;
  fill: white;
  font-weight: 800;
  text-anchor: middle;
  dominant-baseline: middle;
}
.tg-name {
  font-size: 1rem;
  color: var(--ui-text-toned);
}
.tg-name strong {
  color: var(--ui-primary);
  font-size: 1.15rem;
}
</style>
