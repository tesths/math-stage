<script setup lang="ts">
/**
 * 线段图 Lab：三步数量关系（梨/橘子/苹果）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const pear = computed(() => Math.round(props.values.pear ?? 20))
const less = computed(() => Math.round(props.values.less ?? 12))
const times = computed(() => Math.round(props.values.times ?? 3))
const orange = computed(() => pear.value - less.value)
const sum = computed(() => pear.value + orange.value)
const apple = computed(() => sum.value * times.value)

/** 线段图比例：以苹果为最长，总宽度 460 */
const width = 460
const scale = computed(() => {
  const max = apple.value || 1
  return Math.min(340 / max, 14)
})
const pearW = computed(() => pear.value * scale.value)
const orangeW = computed(() => orange.value * scale.value)
const appleW = computed(() => apple.value * scale.value)
</script>

<template>
  <div class="seg-wrap">
    <svg viewBox="0 0 480 300" class="w-full">
      <!-- 梨 -->
      <text x="8" y="46" class="row-label">梨</text>
      <rect x="56" y="28" :width="Math.min(pearW, 380)" height="18" class="seg-pear" />
      <text :x="56 + Math.min(pearW, 380) / 2" :y="58" text-anchor="middle" class="seg-num">{{ pear }} 箱</text>

      <!-- 橘子 -->
      <text x="8" y="106" class="row-label">橘子</text>
      <rect x="56" y="88" :width="Math.min(orangeW, 380)" height="18" class="seg-orange" />
      <text :x="56 + Math.min(orangeW, 380) / 2" :y="118" text-anchor="middle" class="seg-num">{{ orange }} 箱</text>
      <text :x="58 + Math.min(orangeW, 380)" :y="118" text-anchor="middle" class="seg-less">（比梨少 {{ less }}）</text>

      <!-- 苹果 -->
      <text x="8" y="176" class="row-label">苹果</text>
      <rect x="56" y="158" :width="Math.min(appleW, 380)" height="18" class="seg-apple" />
      <text :x="56 + Math.min(appleW, 380) / 2" :y="188" text-anchor="middle" class="seg-num">{{ apple }} 箱</text>
      <text :x="58 + Math.min(appleW, 380)" :y="188" text-anchor="middle" class="seg-times">（= {{ sum }} × {{ times }}）</text>

      <!-- 公式 -->
      <text x="56" y="240" class="seg-formula">橘子 = 梨 − 少 = {{ pear }} − {{ less }} = {{ orange }} 箱</text>
      <text x="56" y="266" class="seg-formula">苹果 = (梨 + 橘子) × {{ times }} = {{ sum }} × {{ times }} = {{ apple }} 箱</text>
    </svg>

    <div class="formula-row">
      <span class="chip">先求橘子</span>
      <span class="chip">再求总和</span>
      <span class="chip op">最后乘倍数 → {{ apple }} 箱</span>
    </div>
  </div>
</template>

<style scoped>
.seg-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.row-label {
  font-size: 14px;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.seg-pear {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
}
.seg-orange {
  fill: color-mix(in srgb, var(--ui-primary) 65%, white);
  stroke: var(--ui-primary);
}
.seg-apple {
  fill: var(--ui-primary);
  stroke: var(--ui-primary);
}
.seg-num {
  font-size: 13px;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.seg-less,
.seg-times {
  font-size: 11px;
  fill: var(--ui-text-muted);
}
.seg-formula {
  font-size: 13px;
  font-weight: 600;
  fill: var(--ui-text-toned);
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
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
}
.chip.op {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
</style>
