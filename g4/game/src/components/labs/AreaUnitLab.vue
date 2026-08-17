<script setup lang="ts">
/**
 * 面积单位换算 Lab：平方厘米 ↔ 平方分米 ↔ 平方米
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const v = computed(() => Math.round(props.values.v ?? 300))
const dir = computed(() => Math.round(props.values.dir ?? 0))

const isSmallToBig = computed(() => dir.value === 0)
const fromUnit = computed(() => (isSmallToBig.value ? '平方厘米' : '平方分米'))
const toUnit = computed(() => (isSmallToBig.value ? '平方分米' : '平方厘米'))
const result = computed(() => (isSmallToBig.value ? v.value / 100 : v.value * 100))
const actionText = computed(() =>
  isSmallToBig.value
    ? '每 100 个 1 平方厘米合成 1 平方分米，所以除以 100'
    : '1 平方分米拆成 10 × 10 个 1 平方厘米，所以乘 100',
)
</script>

<template>
  <div class="unit-wrap">
    <!-- 进率示意图：1 平方分米 = 100 平方厘米 -->
    <div class="ratio-diagram">
      <div
        class="small-grid"
        :style="{ gridTemplateColumns: 'repeat(10, 6px)' }"
      >
        <span v-for="i in 100" :key="i" class="mini-cell" />
      </div>
      <div class="arrow">
        <span class="arrow-text">10 × 10 = 100</span>
        <span class="arrow-sym">{{ isSmallToBig ? '→ 合成' : '← 拆开' }}</span>
      </div>
      <div class="big-square" :style="{ width: '80px', height: '80px' }">
        <span class="big-label">1 平方分米</span>
      </div>
    </div>

    <div class="formula-row">
      <span class="chip">{{ v }} {{ fromUnit }}</span>
      <span class="chip op">= {{ result }} {{ toUnit }}</span>
    </div>

    <div class="steps-inline">
      <div class="step-pair">
        <span class="big-box">{{ v }} {{ fromUnit }}</span>
        <span class="op-sym">{{ isSmallToBig ? '÷ 100' : '× 100' }}</span>
        <span class="small-box">{{ result }} {{ toUnit }}</span>
      </div>
      <p class="note">
        {{ actionText }}。相邻面积单位之间的进率是 <b>100</b>，因为面积是二维铺满，不是只看一条边。
      </p>
    </div>
  </div>
</template>

<style scoped>
.unit-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.ratio-diagram {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.big-square {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 25%, white);
  border-radius: 6px;
}
.big-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ui-primary);
  text-align: center;
  padding: 0.2rem;
}
.arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--ui-text-muted);
}
.arrow-text {
  font-size: 0.85rem;
  font-weight: 700;
}
.arrow-sym {
  font-size: 1.3rem;
}
.small-grid {
  display: grid;
  gap: 1px;
  background: var(--ui-border);
  padding: 1px;
  border-radius: 3px;
}
.mini-cell {
  width: 6px;
  height: 6px;
  background: color-mix(in srgb, var(--ui-primary) 50%, white);
  border-radius: 0.5px;
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
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.chip.op {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.steps-inline {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
}
.step-pair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 800;
}
.big-box,
.small-box {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg-muted);
  padding: 0.3rem 0.7rem;
  color: var(--ui-text-highlighted);
}
.op-sym {
  color: var(--ui-primary);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
</style>
