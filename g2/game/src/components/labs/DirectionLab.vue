<script setup lang="ts">
/**
 * 方向 Lab：东、南、西、北方向板（面向某个方向，观察前后左右）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { DIRECTIONS, leftOf, oppositeOf, rightOf } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const face = computed(() => Math.round(props.values.face ?? 0) % 4)
const front = computed(() => DIRECTIONS[face.value]!)
const back = computed(() => DIRECTIONS[oppositeOf(face.value)]!)
const left = computed(() => DIRECTIONS[leftOf(face.value)]!)
const right = computed(() => DIRECTIONS[rightOf(face.value)]!)

/** 方向 → 罗盘坐标（北在上） */
type Dir = (typeof DIRECTIONS)[number]
const POS: Record<Dir, { x: number; y: number }> = {
  北: { x: 100, y: 26 },
  东: { x: 174, y: 100 },
  南: { x: 100, y: 174 },
  西: { x: 26, y: 100 },
}
</script>

<template>
  <div class="dir-wrap">
    <svg viewBox="0 0 200 200" class="dir-svg" role="img">
      <circle cx="100" cy="100" r="88" class="dir-circle" />
      <line v-for="d in DIRECTIONS" :key="d" :x1="100" :y1="100" :x2="POS[d].x" :y2="POS[d].y" class="dir-line" />
      <circle
        v-for="d in DIRECTIONS"
        :key="`dot-${d}`"
        :cx="POS[d].x"
        :cy="POS[d].y"
        r="24"
        class="dir-dot"
        :class="{ active: d === front, muted: d === back }"
      />
      <text v-for="d in DIRECTIONS" :key="`t-${d}`" :x="POS[d].x" :y="POS[d].y + 5" class="dir-label">
        {{ d }}
      </text>
      <text :x="POS[front].x" :y="POS[front].y - 14" class="dir-mark">前</text>
      <text :x="POS[back].x" :y="POS[back].y - 14" class="dir-mark muted">后</text>
      <text :x="POS[left].x" :y="POS[back].y + 40" class="dir-mark">左</text>
      <text :x="POS[right].x" :y="POS[back].y + 40" class="dir-mark">右</text>
    </svg>
    <p class="dir-line-text">面向{{ front }} → 后{{ back }} · 左{{ left }} · 右{{ right }}</p>
  </div>
</template>

<style scoped>
.dir-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.dir-svg {
  width: 240px;
  height: 240px;
  max-width: 100%;
}
.dir-circle {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.dir-line {
  stroke: var(--ui-border-accented);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}
.dir-dot {
  fill: color-mix(in srgb, var(--ui-primary) 22%, transparent);
  stroke: var(--ui-border-accented);
  stroke-width: 1;
}
.dir-dot.active {
  fill: var(--ui-primary);
  stroke: var(--ui-primary);
}
.dir-dot.muted {
  opacity: 0.35;
}
.dir-label {
  font-size: 13px;
  font-weight: 800;
  fill: var(--ui-text-highlighted);
  text-anchor: middle;
  dominant-baseline: middle;
}
.dir-mark {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-primary);
  text-anchor: middle;
}
.dir-mark.muted {
  fill: var(--ui-text-muted);
}
.dir-line-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
</style>
