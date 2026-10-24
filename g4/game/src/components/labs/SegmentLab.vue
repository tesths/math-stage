<script setup lang="ts">
/**
 * 线段图 Lab：三步数量关系（梨 / 橘子 / 苹果）
 *
 * 本轮（第 4 轮）改动：
 * - 橘子比梨少，如果"少"比梨还多，旧实现会画出**负数长度的线段**（图上直接消失、算式还是负数）。
 *   现在先把"少"限制在梨的箱数以内，并如实提示（L0）。
 * - 苹果那一条按"几倍"画成 times 段，每段正好等于"梨 + 橘子"，学生一眼看出倍数关系
 *   （旧实现只有一条整条，倍数只写在文字里）。
 * - 三条线段按**同一比例尺**画，并加了「先画梨 → 再画橘子 → 最后画苹果」的三步过程（L2 + L3）。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { segModel } from '@/lib/labs/segment'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/** 数量关系全部走纯函数：负数线段、倍数关系都能单测 */
const model = computed(() => segModel(props.values.pear ?? 20, props.values.less ?? 12, props.values.times ?? 3))
const pear = computed(() => model.value.pear)
const less = computed(() => model.value.less)
const lessClamped = computed(() => model.value.clamped)
const times = computed(() => model.value.times)
const orange = computed(() => model.value.orange)
const sum = computed(() => model.value.sum)
const apple = computed(() => model.value.apple)

/** 同一比例尺：最长的"苹果"占满 400px */
const BAR_X = 64
const BAR_MAX = 400
const maxValue = computed(() => Math.max(apple.value, pear.value, orange.value, 1))
const scale = computed(() => BAR_MAX / maxValue.value)
const pearW = computed(() => pear.value * scale.value)
const orangeW = computed(() => orange.value * scale.value)
const sumW = computed(() => sum.value * scale.value)

/** 过程态：0 = 空白，1 = 画好梨，2 = 画好橘子，3 = 画好苹果并写出算式 */
const step = ref(3)
function nextDraw() {
  step.value = step.value >= 3 ? 1 : step.value + 1
}
function drawAll() {
  step.value = 3
}
const appleSegs = computed(() =>
  Array.from({ length: times.value }, (_, i) => ({ index: i, x: BAR_X + i * sumW.value })),
)
</script>

<template>
  <div class="seg-wrap">
    <svg viewBox="0 0 480 320" class="seg-svg" aria-label="梨、橘子、苹果的线段图">
      <!-- 梨 -->
      <g v-if="step >= 1">
        <text x="12" y="42" class="row-label">梨</text>
        <rect :x="BAR_X" y="26" :width="pearW" height="20" class="seg-pear" />
        <text :x="BAR_X + pearW / 2" y="41" text-anchor="middle" class="seg-num">{{ pear }} 箱</text>
        <line :x1="BAR_X" y1="52" :x2="BAR_X + pearW" y2="52" class="dim-line" />
        <text :x="BAR_X" y="66" class="dim-text">0</text>
        <text :x="BAR_X + pearW" y="66" text-anchor="end" class="dim-text">{{ pear }}</text>
      </g>

      <!-- 橘子：比梨短一段 -->
      <g v-if="step >= 2">
        <text x="12" y="102" class="row-label">橘子</text>
        <rect :x="BAR_X" y="86" :width="orangeW" height="20" class="seg-orange" />
        <text :x="BAR_X + orangeW / 2" y="101" text-anchor="middle" class="seg-num">{{ orange }} 箱</text>
        <!-- 少的那一段用虚线框出来 -->
        <rect :x="BAR_X + orangeW" y="86" :width="pearW - orangeW" height="20" class="seg-gap" />
        <text :x="BAR_X + orangeW + (pearW - orangeW) / 2" y="101" text-anchor="middle" class="seg-less">
          少 {{ less }}
        </text>
        <text :x="BAR_X + orangeW + (pearW - orangeW) / 2" y="122" text-anchor="middle" class="seg-less-note">
          和梨比少 {{ less }} 箱
        </text>
      </g>

      <!-- 苹果：times 段，每段 = 梨 + 橘子 -->
      <g v-if="step >= 3">
        <text x="12" y="162" class="row-label">苹果</text>
        <template v-for="seg in appleSegs" :key="seg.index">
          <rect :x="seg.x" y="146" :width="sumW" height="20" class="seg-apple" />
          <line :x1="seg.x" y1="142" :x2="seg.x" y2="170" class="seg-split" />
          <text :x="seg.x + sumW / 2" y="161" text-anchor="middle" class="seg-seg-label">{{ sum }}</text>
        </template>
        <text :x="BAR_X + (times * sumW) / 2" y="186" text-anchor="middle" class="seg-num">
          {{ apple }} 箱（{{ times }} 段，每段 = 梨 + 橘子 = {{ sum }}）
        </text>
      </g>

      <!-- 算式 -->
      <g v-if="step >= 2">
        <text x="16" y="228" class="seg-formula">橘子 = 梨 − 少 = {{ pear }} − {{ less }} = {{ orange }} 箱</text>
      </g>
      <g v-if="step >= 3">
        <text x="16" y="254" class="seg-formula">梨 + 橘子 = {{ pear }} + {{ orange }} = {{ sum }} 箱</text>
        <text x="16" y="280" class="seg-formula strong">
          苹果 =（梨 + 橘子）× {{ times }} = {{ sum }} × {{ times }} = {{ apple }} 箱
        </text>
      </g>

      <!-- 比例尺说明 -->
      <text x="16" y="308" class="scale-note">
        同一比例尺：1 箱 = {{ Math.round(scale * 10) / 10 }} px（三条线段长度可以互相比）
      </text>
    </svg>

    <div class="op-bar">
      <button type="button" class="op-btn primary" data-test="seg-next" @click="nextDraw">
        试一试：先画梨，再画橘子，最后画苹果（第 {{ step }} / 3 步）
      </button>
      <button type="button" class="op-btn ghost" data-test="seg-all" @click="drawAll">全部画好</button>
    </div>

    <div class="formula-row">
      <span class="chip" :class="{ dim: step < 2 }">① 橘子 = {{ pear }} − {{ less }} = {{ orange }}</span>
      <span class="chip" :class="{ dim: step < 3 }">② 梨 + 橘子 = {{ sum }}</span>
      <span class="chip op" data-test="seg-answer">③ 苹果 = {{ sum }} × {{ times }} = {{ apple }} 箱</span>
    </div>
    <p v-if="lessClamped" class="warn" data-test="seg-warn">
      ⚠️ 橘子的箱数不能是负数：梨只有 {{ pear }} 箱，所以"橘子比梨少"最多按 {{ less }} 箱计算。
    </p>
    <p class="note">
      苹果是"梨和橘子总箱数"的 {{ times }} 倍，所以苹果那一条正好能分成 {{ times }} 段，每段都和"梨 + 橘子"一样长。
    </p>
  </div>
</template>

<style scoped>
.seg-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
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
.row-label {
  fill: var(--ui-text-highlighted);
  font-size: 12px;
  font-weight: 800;
}
.seg-pear {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-primary);
}
.seg-orange {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 50%, white);
  stroke: var(--ui-warning, #f59e0b);
}
.seg-gap {
  fill: none;
  stroke: var(--ui-error, #dc2626);
  stroke-dasharray: 4 3;
}
.seg-apple {
  fill: color-mix(in srgb, var(--ui-success, #16a34a) 40%, white);
  stroke: var(--ui-success, #16a34a);
}
.seg-split {
  stroke: var(--ui-success, #16a34a);
  stroke-width: 1.5;
}
.seg-seg-label {
  fill: var(--ui-text-toned);
  font-size: 9px;
}
.seg-num {
  fill: var(--ui-text-highlighted);
  font-size: 11px;
  font-weight: 700;
}
.seg-less {
  fill: var(--ui-error, #dc2626);
  font-size: 10px;
  font-weight: 700;
}
.seg-less-note {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.dim-line {
  stroke: var(--ui-text-muted);
  stroke-width: 0.8;
}
.dim-text {
  fill: var(--ui-text-muted);
  font-size: 8px;
}
.seg-formula {
  fill: var(--ui-text-toned);
  font-size: 11px;
}
.seg-formula.strong {
  fill: var(--ui-primary);
  font-weight: 800;
}
.scale-note {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.op-bar {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.op-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.op-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.op-btn.ghost {
  color: var(--ui-text-muted);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.28rem 0.75rem;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.chip.dim {
  opacity: 0.4;
}
.chip.op {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.warn {
  font-size: 0.8rem;
  color: var(--ui-error, #dc2626);
  text-align: center;
  max-width: 38rem;
}
.note {
  font-size: 0.84rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 38rem;
}
</style>
