<script setup lang="ts">
/**
 * 周长与面积的变化 Lab：面积一定时拼长方形，观察周长变化
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const rows = computed(() => Math.round(props.values.rows ?? 4))
const total = 36
const cols = computed(() => total / rows.value)
const perimeter = computed(() => (rows.value + cols.value) * 2)
const cell = computed(() => {
  const maxSide = Math.max(rows.value, cols.value)
  return Math.min(28, 340 / maxSide)
})
const gridW = computed(() => cols.value * cell.value)
const gridH = computed(() => rows.value * cell.value)

/** 全部可能的拼法（用于对比展示） */
const allCombos = computed(() => {
  const out: { r: number; c: number; peri: number }[] = []
  for (let r = 1; r <= total; r++) {
    if (total % r !== 0) continue
    const c = total / r
    out.push({ r: Math.min(r, c), c: Math.max(r, c), peri: (r + c) * 2 })
  }
  return out.sort((x, y) => x.peri - y.peri)
})
</script>

<template>
  <div class="puzzle-wrap">
    <div
      class="grid-box"
      :style="{
        width: gridW + 'px',
        height: gridH + 'px',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }"
    >
      <span v-for="i in total" :key="i" class="grid-cell" />
    </div>

    <div class="formula-row">
      <span class="chip">面积 = {{ cols }} × {{ rows }} = {{ total }} 平方厘米</span>
      <span class="chip op">周长 = ({{ cols }} + {{ rows }}) × 2 = {{ perimeter }} 厘米</span>
    </div>

    <!-- 全部拼法对比 -->
    <div class="combo-table">
      <div class="combo-head">
        <span>拼法（长×宽）</span>
        <span>面积</span>
        <span>周长</span>
      </div>
      <div
        v-for="(c, i) in allCombos"
        :key="i"
        class="combo-row"
        :class="{ active: c.r === Math.min(rows, cols) }"
      >
        <span>{{ c.c }} × {{ c.r }}</span>
        <span>{{ c.c * c.r }} 平方厘米</span>
        <span>{{ c.peri }} 厘米</span>
      </div>
    </div>

    <p class="note">
      面积都是 {{ total }} 平方厘米，周长却不同；长和宽越接近，周长越<b>短</b>，
      拼成正方形（{{ Math.sqrt(total) }} × {{ Math.sqrt(total) }}）时周长最短（{{ Math.sqrt(total) * 4 }} 厘米）。
    </p>
  </div>
</template>

<style scoped>
.puzzle-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.grid-box {
  display: grid;
  gap: 1px;
  background: var(--ui-border);
  padding: 1px;
  border-radius: 4px;
  transition: all 0.35s;
}
.grid-cell {
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border-radius: 1px;
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
.combo-table {
  width: 100%;
  max-width: 588px;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  overflow: hidden;
}
.combo-head,
.combo-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.4rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  text-align: center;
}
.combo-head {
  background: var(--ui-bg-muted);
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.combo-row {
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-toned);
}
.combo-row.active {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  color: var(--ui-primary);
  font-weight: 800;
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
