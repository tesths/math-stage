<script setup lang="ts">
/**
 * 线段图 Lab：总量减运走、多几少几、每行人数变换、倍数两步计算
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const id = computed(() => props.lab.id)

/* segment-total */
const total = computed(() => Math.round(props.values.total ?? 300))
const part1 = computed(() => Math.round(props.values.part1 ?? 120))
const part2 = computed(() => Math.round(props.values.part2 ?? 160))
const left = computed(() => Math.max(0, total.value - part1.value - part2.value))

/* segment-more */
const base = computed(() => Math.round(props.values.base ?? 25))
const more1 = computed(() => Math.round(props.values.more1 ?? 15))
const more2 = computed(() => Math.round(props.values.more2 ?? 20))
const volleyball = computed(() => base.value + more1.value)
const football = computed(() => volleyball.value + more2.value)

/* rows */
const rowTotal = computed(() => Math.round(props.values.total ?? 144))
const per = computed(() => Math.round(props.values.per ?? 6))
const perMore = computed(() => Math.round(props.values.more ?? 2))
const perNew = computed(() => per.value + perMore.value)
const rowsNew = computed(() => Math.round(rowTotal.value / perNew.value))

/* times-word */
const base3 = computed(() => Math.round(props.values.base ?? 39))
const times = computed(() => Math.round(props.values.times ?? 2))
const less = computed(() => Math.round(props.values.less ?? 13))
const grade4 = computed(() => base3.value * times.value)
const grade5 = computed(() => grade4.value - less.value)

/** 把数量映射为条长 */
function barLen(v: number, max: number): number {
  return Math.round((v / max) * 260)
}
const isTotal = computed(() => id.value === 'g3-c10-segment-total')
const isMore = computed(() => id.value === 'g3-c10-segment-more')
const isRows = computed(() => id.value === 'g3-c10-rows')
const isTimes = computed(() => id.value === 'g3-c10-times-word')

const segTotal = computed(() => [
  { label: `上午运走 ${part1.value} 箱`, len: barLen(part1.value, total.value), color: 'primary' },
  { label: `下午运走 ${part2.value} 箱`, len: barLen(part2.value, total.value), color: 'secondary' },
  { label: `还剩 ${left.value} 箱`, len: barLen(left.value, total.value), color: 'success' },
])

const moreMax = computed(() => Math.max(football.value, 40))
</script>

<template>
  <div class="segment-wrap">
    <!-- 总量 − 运走 = 剩余 -->
    <template v-if="isTotal">
      <svg viewBox="0 0 340 150" class="seg-svg">
        <text x="170" y="24" text-anchor="middle" class="bar-title">一共 {{ total }} 箱水果</text>
        <g transform="translate(30, 60)">
          <rect v-for="(s, i) in segTotal" :key="i" :x="0" :width="s.len" height="22" rx="3" class="bar" :class="s.color" />
        </g>
        <g transform="translate(30, 0)">
          <text
            v-for="(s, i) in segTotal"
            :key="i"
            :x="(s.len / 2) + (segTotal.slice(0, i).reduce((a, x) => a + x.len, 0))"
            :y="56"
            text-anchor="middle"
            class="bar-tag"
          >{{ s.label }}</text>
        </g>
      </svg>
      <div class="formula-row">
        <span class="chip">{{ total }} − {{ part1 }} − {{ part2 }}</span>
        <span class="chip result">= {{ left }} 箱</span>
      </div>
      <p class="tip">
        先算一共运走：{{ part1 }} + {{ part2 }} = {{ part1 + part2 }}（箱），还剩 {{ total }} − {{ part1 + part2 }} = <b>{{ left }}</b> 箱
      </p>
    </template>

    <!-- 多几少几 -->
    <template v-else-if="isMore">
      <svg viewBox="0 0 340 190" class="seg-svg">
        <g v-for="(bar, bi) in [
          { name: '篮球', len: barLen(base, moreMax), val: `${base} 个` },
          { name: '排球', len: barLen(volleyball, moreMax), val: `${volleyball} 个` },
          { name: '足球', len: barLen(football, moreMax), val: `${football} 个` },
        ]" :key="bi">
          <text x="30" :y="28 + bi * 56" class="bar-name">{{ bar.name }}</text>
          <rect x="30" y="36 + bi * 56" width="30" height="14" rx="3" class="bar ghost" />
          <rect x="30" y="36 + bi * 56" :width="bar.len" height="14" rx="3" class="bar" :class="bi % 2 === 0 ? 'primary' : 'secondary'" />
          <text :x="34 + bar.len" :y="48 + bi * 56" text-anchor="middle" class="bar-val">{{ bar.val }}</text>
          <line v-if="bi > 0" :x1="30 + barLen(base, moreMax)" :y1="50 + bi * 56" :x2="30 + bar.len" :y2="50 + bi * 56" class="diff-line" />
          <text :x="30 + (barLen(base, moreMax) + bar.len) / 2" :y="68 + bi * 56" text-anchor="middle" class="diff-tag">{{ bi === 1 ? `多 ${more1}` : `多 ${more2}` }}</text>
        </g>
      </svg>
      <p class="tip">
        排球 = {{ base }} + {{ more1 }} = <b>{{ volleyball }}</b>；足球 = {{ volleyball }} + {{ more2 }} = <b>{{ football }}</b>
      </p>
    </template>

    <!-- 变换队形 -->
    <template v-else-if="isRows">
      <svg viewBox="0 0 340 160" class="seg-svg">
        <text x="170" y="24" text-anchor="middle" class="bar-title">{{ rowTotal }} 人表演，原来每行 {{ per }} 人</text>
        <g transform="translate(30, 44)">
          <rect v-for="i in perNew" :key="i" :x="i * 6" :y="i % 2 === 0 ? -6 : 0" width="5" height="18" rx="1" class="people" />
        </g>
        <text x="170" y="92" text-anchor="middle" class="bar-tag">后来每行 {{ perNew }} 人</text>
        <g transform="translate(30, 100)">
          <rect v-for="i in Math.min(perNew, 20)" :key="i" :x="i * 6" y="0" width="5" height="18" rx="1" class="people2" />
        </g>
        <text x="170" y="148" text-anchor="middle" class="bar-tag">共排 {{ rowsNew }} 行</text>
      </svg>
      <div class="formula-row">
        <span class="chip">{{ rowTotal }} ÷ ({{ per }} + {{ perMore }})</span>
        <span class="chip result">= {{ rowsNew }} 行</span>
      </div>
      <p class="tip">后来每行 {{ per }} + {{ perMore }} = {{ perNew }} 人，{{ rowTotal }} ÷ {{ perNew }} = <b>{{ rowsNew }}</b> 行</p>
    </template>

    <!-- 倍 + 少 -->
    <template v-else>
      <svg viewBox="0 0 340 190" class="seg-svg">
        <g v-for="(bar, bi) in [
          { name: '三年级', len: barLen(base3, grade4), val: `${base3} 幅` },
          { name: '四年级', len: barLen(grade4, grade4), val: `${grade4} 幅` },
          { name: '五年级', len: barLen(grade5, grade4), val: `${grade5} 幅` },
        ]" :key="bi">
          <text x="30" :y="28 + bi * 56" class="bar-name">{{ bar.name }}</text>
          <rect x="30" y="36 + bi * 56" width="30" height="14" rx="3" class="bar ghost" />
          <rect x="30" y="36 + bi * 56" :width="bar.len" height="14" rx="3" class="bar" :class="bi % 2 === 0 ? 'primary' : 'secondary'" />
          <text :x="34 + bar.len" :y="48 + bi * 56" text-anchor="middle" class="bar-val">{{ bar.val }}</text>
          <line v-if="bi === 2" :x1="30 + bar.len" :y1="50 + bi * 56" :x2="30 + grade4 / 3" :y2="50 + bi * 56" class="diff-line" />
          <text v-if="bi === 2" x="145" y="68 + bi * 56" text-anchor="middle" class="diff-tag">少 {{ less }}</text>
        </g>
      </svg>
      <p class="tip">
        四年级 = {{ base3 }} × {{ times }} = <b>{{ grade4 }}</b>；五年级 = {{ grade4 }} − {{ less }} = <b>{{ grade5 }}</b>
      </p>
    </template>
  </div>
</template>

<style scoped>
.segment-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.seg-svg {
  width: 100%;
  max-width: 34rem;
}
.bar-title {
  fill: var(--ui-text-highlighted);
  font-size: 13px;
  font-weight: 700;
}
.bar-name {
  fill: var(--ui-text-toned);
  font-size: 12px;
  font-weight: 700;
}
.bar {
  stroke-width: 0;
}
.bar.primary {
  fill: color-mix(in srgb, var(--ui-primary) 65%, white);
}
.bar.secondary {
  fill: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 55%, white);
}
.bar.success {
  fill: color-mix(in srgb, var(--ui-success, #22c55e) 55%, white);
}
.bar.ghost {
  fill: color-mix(in srgb, var(--ui-text-muted) 18%, transparent);
}
.bar-tag {
  fill: var(--ui-text-toned);
  font-size: 11px;
}
.bar-val {
  fill: var(--ui-text-highlighted);
  font-size: 11px;
  font-weight: 700;
}
.diff-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
}
.diff-tag {
  fill: var(--ui-warning, #f59e0b);
  font-size: 10px;
  font-weight: 700;
}
.people {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
}
.people2 {
  fill: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 55%, white);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
}
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
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
