<script setup lang="ts">
/**
 * 间隔排列 Lab：排成一行（两端相同/两端不同）、围成一圈
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const isCircle = computed(() => props.lab.id === 'g3-c9-interval-circle')

/** 第一种物体的个数（小兔/男生） */
const count = computed(() => Math.max(2, Math.round(props.values.count ?? props.values.value ?? 6)))
/** 两端物体：0=两端相同、1=两端不同、2=两端相同（第二种在两端） */
const end = computed(() => Math.round(props.values.end ?? 0))

/** 一行中的排列：交替两种物体 */
const lineItems = computed(() => {
  const n = count.value
  const same = end.value !== 1
  const items: { type: 0 | 1 }[] = []
  const total = same ? n * 2 - 1 : n * 2
  const startType = end.value === 2 ? 1 : 0
  for (let i = 0; i < total; i++) {
    items.push({ type: (i % 2 === 0 ? startType : 1 - startType) as 0 | 1 })
  }
  return items
})

const typeACount = computed(() => lineItems.value.filter((x) => x.type === 0).length)
const typeBCount = computed(() => lineItems.value.filter((x) => x.type === 1).length)

/** 环形：两种物体交替围成圈，数量相等 */
const ringItems = computed(() =>
  Array.from({ length: count.value }, (_, i) => {
    const theta = (i / count.value) * Math.PI * 2 - Math.PI / 2
    return { x: 170 + 110 * Math.cos(theta), y: 110 + 110 * Math.sin(theta), type: (i % 2) as 0 | 1 }
  }),
)

/** 相邻两个物体之间的"间隔"弧线（数间隔的过程要用到） */
const gapCount = computed(() => (isCircle.value ? ringItems.value.length : Math.max(0, lineItems.value.length - 1)))
function lineX(i: number): number {
  return 24 + i * (292 / Math.max(1, lineItems.value.length - 1))
}
const lineGaps = computed(() =>
  Array.from({ length: gapCount.value }, (_, i) => {
    const x1 = lineX(i)
    const x2 = lineX(i + 1)
    return { index: i + 1, x1, x2, mid: (x1 + x2) / 2 }
  }),
)
const ringGaps = computed(() =>
  Array.from({ length: gapCount.value }, (_, i) => {
    const a = (i / gapCount.value) * Math.PI * 2 - Math.PI / 2
    const b = ((i + 1) / gapCount.value) * Math.PI * 2 - Math.PI / 2
    const r = 88
    const am = (a + b) / 2
    return {
      index: i + 1,
      x: 170 + r * Math.cos(am),
      y: 110 + r * Math.sin(am),
    }
  }),
)

/**
 * 过程态：一个一个数间隔。间隔数与物体数的关系（两端相同差 1 / 两端不同相等 / 围成一圈相等）
 * 必须靠"数"出来，而不是直接给结论。
 */
const counted = ref(0)
function countGap() {
  counted.value = counted.value >= gapCount.value ? 0 : counted.value + 1
}
const relationText = computed(() => {
  if (isCircle.value) return `男生 ${count.value} 人 = 女生 ${count.value} 人`
  if (end.value === 1) return `两端不同：两种物体一样多`
  return `两端相同：一种比另一种多 1 个`
})
</script>

<template>
  <div class="interval-wrap">
    <!-- 排成一行 -->
    <svg v-if="!isCircle" viewBox="0 0 340 150" class="interval-svg">
      <line x1="24" y1="110" x2="316" y2="110" class="ground" />
      <g v-for="(item, i) in lineItems" :key="i">
        <text
          v-if="item.type === 0"
          :x="24 + i * (292 / Math.max(1, lineItems.length - 1))"
          :y="108"
          text-anchor="middle"
          class="rabbit"
        >🐰</text>
        <text
          v-else
          :x="24 + i * (292 / Math.max(1, lineItems.length - 1))"
          :y="108"
          text-anchor="middle"
          class="mushroom"
        >🍄</text>
      </g>
      <!-- 间隔弧线：数到第几个就画出几条 -->
      <g v-for="g in lineGaps" :key="'gap' + g.index">
        <path
          v-if="g.index <= counted"
          :d="`M ${g.x1} 112 Q ${g.mid} 132 ${g.x2} 112`"
          fill="none"
          class="gap-arc"
        />
        <text v-if="g.index <= counted" :x="g.mid" :y="144" text-anchor="middle" class="gap-num">{{ g.index }}</text>
      </g>
      <circle :cx="lineX(0)" cy="106" r="19" class="end-ring" />
      <circle :cx="lineX(lineItems.length - 1)" cy="106" r="19" class="end-ring" />
      <text x="170" y="30" text-anchor="middle" class="mode-label">{{ relationText }}</text>
      <text x="170" y="140" text-anchor="middle" class="count-label">
        小兔 {{ typeACount }} 只，蘑菇 {{ typeBCount }} 个
      </text>
    </svg>

    <!-- 围成一圈 -->
    <svg v-else viewBox="0 0 340 220" class="interval-svg">
      <circle cx="170" cy="110" r="110" class="ring" />
      <template v-for="(p, i) in ringItems" :key="i">
        <circle :cx="p.x" :cy="p.y" r="16" class="ring-dot" :class="p.type === 0 ? 'boy' : 'girl'" />
        <text :x="p.x" :y="p.y + 5" text-anchor="middle" class="ring-emoji">{{ p.type === 0 ? '👦' : '👧' }}</text>
      </template>
      <template v-for="g in ringGaps" :key="'rgap' + g.index">
        <text v-if="g.index <= counted" :x="g.x" :y="g.y + 4" text-anchor="middle" class="gap-num">{{ g.index }}</text>
      </template>
      <text x="170" y="205" text-anchor="middle" class="mode-label">围成一圈：男生人数 = 女生人数</text>
    </svg>

    <div class="gap-bar">
      <button type="button" class="gap-btn primary" data-test="gap-count" @click="countGap">
        试一试：数一数间隔（{{ counted }} / {{ gapCount }}）
      </button>
      <span class="gap-state" data-test="gap-state">
        已数 {{ counted }} 个间隔{{ counted === gapCount && gapCount > 0 ? '，间隔数数完了' : '' }}
      </span>
    </div>
    <p class="tip">
      <template v-if="isCircle">
        首尾相接围成一圈时，起点和终点连在一起，间隔排列的两种物体<b>数量相等</b>。
      </template>
      <template v-else-if="end === 1">
        两端物体不同时，两种物体<b>一样多</b>：{{ typeACount }} = {{ typeBCount }}。
      </template>
      <template v-else>
        两端物体相同时，其中一种<b>多 1 个</b>：小兔 {{ typeACount }} 只，蘑菇 {{ typeBCount }} 个，差 1。
      </template>
    </p>
  </div>
</template>

<style scoped>
.interval-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.interval-svg {
  width: 100%;
  max-width: 31rem;
}
.ground {
  stroke: var(--ui-border-accented);
  stroke-width: 3;
}
.rabbit {
  font-size: 1.6rem;
}
.mushroom {
  font-size: 1.3rem;
}
.ring {
  fill: none;
  stroke: var(--ui-border-accented);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.ring-dot {
  stroke-width: 2;
}
.ring-dot.boy {
  fill: color-mix(in srgb, var(--ui-primary) 40%, white);
  stroke: var(--ui-primary);
}
.ring-dot.girl {
  fill: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 40%, white);
  stroke: var(--ui-secondary, var(--ui-info));
}
.ring-emoji {
  font-size: 0.85rem;
}
.gap-arc {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.6;
  stroke-dasharray: 3 2;
}
.gap-num {
  fill: var(--ui-warning, #f59e0b);
  font-size: 10px;
  font-weight: 800;
}
.end-ring {
  fill: none;
  stroke: var(--ui-error, #dc2626);
  stroke-width: 1.5;
  stroke-dasharray: 3 2;
}
.gap-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.gap-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.gap-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.gap-state {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.mode-label {
  fill: var(--ui-text-toned);
  font-size: 12px;
  font-weight: 700;
}
.count-label {
  fill: var(--ui-text-muted);
  font-size: 11px;
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
