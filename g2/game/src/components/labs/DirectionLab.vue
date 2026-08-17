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
const relationCards = computed(() => [
  { key: 'front', label: '前面', value: front.value },
  { key: 'back', label: '后面', value: back.value },
  { key: 'left', label: '左边', value: left.value },
  { key: 'right', label: '右边', value: right.value },
])

/** 方向 → 罗盘坐标（北在上） */
type Dir = (typeof DIRECTIONS)[number]
const POS: Record<Dir, { x: number; y: number }> = {
  北: { x: 100, y: 26 },
  东: { x: 174, y: 100 },
  南: { x: 100, y: 174 },
  西: { x: 26, y: 100 },
}

/** 面向箭头头部（在朝向方向的圆点边缘） */
function arrowHead(d: Dir): string {
  const p = POS[d]
  const len = 10
  const dx = (p.x - 100) / 74
  const dy = (p.y - 100) / 74
  const bx = p.x - 20 * dx
  const by = p.y - 20 * dy
  const px = -dy
  const py = dx
  return `${bx + px * len},${by + py * len} ${p.x + px * 8},${p.y + py * 8} ${p.x + dx * 22},${p.y + dy * 22} ${p.x - px * 8},${p.y - py * 8} ${bx - px * len},${by - py * len}`
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
      <!-- 面向箭头：从中心指向面向方向 -->
      <line :x1="100" :y1="100" :x2="POS[front].x" :y2="POS[front].y" class="dir-face" />
      <polygon :points="arrowHead(front)" class="dir-face-head" />
      <!-- 前后左右标注 -->
      <text :x="POS[front].x" :y="POS[front].y - 16" class="dir-mark">前</text>
      <text :x="POS[back].x" :y="POS[back].y - 16" class="dir-mark muted">后</text>
      <text :x="POS[left].x" :y="POS[left].y + 34" class="dir-mark">左</text>
      <text :x="POS[right].x" :y="POS[right].y + 34" class="dir-mark">右</text>
      <text x="100" y="104" class="person">人</text>
    </svg>
    <div class="relation-grid" aria-label="前后左右对应方向">
      <span
        v-for="card in relationCards"
        :key="card.key"
        class="relation-card"
        :class="card.key"
      >
        <b>{{ card.label }}</b>
        <strong>{{ card.value }}</strong>
      </span>
    </div>
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
.person {
  fill: var(--ui-text-highlighted);
  font-size: 13px;
  font-weight: 900;
  text-anchor: middle;
  dominant-baseline: middle;
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
.dir-face {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 3;
  stroke-dasharray: 5 3;
}
.dir-face-head {
  fill: var(--ui-warning, #f59e0b);
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
  margin: 0;
}
.relation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(4.5rem, 1fr));
  grid-template-areas:
    '. front .'
    'left back right';
  gap: 0.45rem;
  width: min(100%, 18rem);
}
.relation-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.82rem;
  font-weight: 800;
}
.relation-card.front {
  grid-area: front;
  border-color: var(--ui-primary);
}
.relation-card.back {
  grid-area: back;
  opacity: 0.75;
}
.relation-card.left {
  grid-area: left;
}
.relation-card.right {
  grid-area: right;
}
.relation-card strong {
  color: var(--ui-primary);
  font-size: 1.15rem;
}

@media (max-width: 480px) {
  .dir-svg {
    width: 220px;
    height: 220px;
  }
}
</style>
