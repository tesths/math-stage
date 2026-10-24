<script setup lang="ts">
/**
 * 周长与面积的变化 Lab：面积一定时拼长方形，观察周长变化
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const paramRows = computed(() => Math.round(props.values.rows ?? 4))
const total = 36

/**
 * 过程态：换一种拼法。面积一直是 36 平方厘米，但周长会变：
 * 点按钮在"所有拼法"里换一种，方格真的重新排（L3），学生自己发现"越细长周长越长"。
 */
const comboIdx = ref(0)
const allCombosRaw = computed(() => {
  const out: { r: number; c: number; peri: number }[] = []
  for (let r = 1; r <= total; r++) {
    if (total % r !== 0) continue
    const c = total / r
    if (r > c) continue
    out.push({ r: Math.min(r, c), c: Math.max(r, c), peri: (r + c) * 2 })
  }
  return out.sort((x, y) => x.peri - y.peri)
})
/** 参数选中的拼法作为起始，之后可以继续换 */
const activeCombo = computed(() => {
  const list = allCombosRaw.value
  const idx = comboIdx.value % Math.max(1, list.length)
  return list[idx] ?? { r: paramRows.value, c: total / paramRows.value, peri: 0 }
})
function nextCombo() {
  comboIdx.value = (comboIdx.value + 1) % Math.max(1, allCombosRaw.value.length)
}
const rows = computed(() => activeCombo.value.r)
const cols = computed(() => activeCombo.value.c)
const perimeter = computed(() => (rows.value + cols.value) * 2)
const cell = computed(() => {
  const maxSide = Math.max(rows.value, cols.value)
  return Math.min(28, 340 / maxSide)
})
const gridW = computed(() => cols.value * cell.value)
const gridH = computed(() => rows.value * cell.value)

/** 全部可能的拼法（用于对比展示，与上面的列表同一份数据） */
const allCombos = computed(() => allCombosRaw.value)
/** 参数选中的长方形作为起点 */
watch(
  paramRows,
  (r) => {
    const idx = allCombosRaw.value.findIndex((c) => c.c === Math.max(r, total / r) && total % r === 0)
    comboIdx.value = idx >= 0 ? idx : 0
  },
  { immediate: true },
)
const minPerimeter = computed(() => Math.min(...allCombos.value.map((c) => c.peri)))
const maxPerimeter = computed(() => Math.max(...allCombos.value.map((c) => c.peri)))
function miniRectStyle(c: { r: number; c: number }) {
  const scale = 46 / Math.max(c.r, c.c)
  return { width: `${Math.max(8, c.c * scale)}px`, height: `${Math.max(8, c.r * scale)}px` }
}
function perimeterWidth(p: number): number {
  return Math.round((p / maxPerimeter.value) * 100)
}
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

    <div class="op-bar">
      <button type="button" class="op-btn primary" data-test="combo-next" @click="nextCombo">
        试一试：换一种拼法（第 {{ (comboIdx % allCombos.length) + 1 }} / {{ allCombos.length }} 种）
      </button>
      <span class="combo-state">同样 36 平方厘米，周长是 {{ perimeter }} 厘米</span>
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
        <span class="combo-shape">
          <span class="mini-rect" :style="miniRectStyle(c)" />
          {{ c.c }} × {{ c.r }}
        </span>
        <span class="same-area">{{ c.c * c.r }} 平方厘米</span>
        <span class="peri-visual">
          <span>{{ c.peri }} 厘米</span>
          <span class="peri-bar"><span class="peri-bar-fill" :style="{ width: perimeterWidth(c.peri) + '%' }" /></span>
        </span>
      </div>
    </div>

    <p class="note">
      面积都是 {{ total }} 平方厘米，周长却不同；长和宽越接近，周长越<b>短</b>，
      拼成正方形（{{ Math.sqrt(total) }} × {{ Math.sqrt(total) }}）时周长最短（{{ minPerimeter }} 厘米），细长拼法最长（{{ maxPerimeter }} 厘米）。
    </p>
  </div>
</template>

<style scoped>
.op-bar {
  display: flex;
  gap: 0.4rem;
  align-items: center;
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
.combo-state {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
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
.combo-shape,
.peri-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}
.mini-rect {
  display: inline-block;
  border: 2px solid var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 20%, transparent);
}
.same-area {
  color: var(--ui-text-toned);
}
.peri-visual {
  flex-direction: column;
  gap: 0.2rem;
}
.peri-bar {
  display: block;
  width: 4.8rem;
  height: 0.42rem;
  overflow: hidden;
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
}
.peri-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
@media (max-width: 520px) {
  .combo-head,
  .combo-row {
    grid-template-columns: 1.1fr 0.9fr 1fr;
    gap: 0.2rem;
    padding: 0.32rem 0.45rem;
    font-size: 0.75rem;
  }
  .peri-bar {
    width: 3.4rem;
  }
}
</style>
