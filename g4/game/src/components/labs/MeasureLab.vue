<script setup lang="ts">
/**
 * 度量衡 Lab：古今计量单位换算（尺/升/斤）
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const chi = computed(() => Math.round(props.values.chi ?? 5))
const sheng = computed(() => Math.round(props.values.sheng ?? 3))
const jin = computed(() => Math.round(props.values.jin ?? 4))

const chiCm = computed(() => chi.value * 23)
const shengMl = computed(() => sheng.value * 200)
const jinG = computed(() => jin.value * 250)

/**
 * 过程态：一件一件量。旧实现三张卡片一次全亮，学生没有可操作的过程（L3）。
 * 另外补了一条"尺子对比"：长度类换算必须能看见长短（1 尺 = 23 厘米，不到 1 米）。
 */
const step = ref(3)
function nextMeasure() {
  step.value = step.value >= 3 ? 1 : step.value + 1
}
function showAll() {
  step.value = 3
}
/** 1 厘米 = 3 像素：1 尺（23 厘米）与 1 米（100 厘米）按同一比例尺画 */
const PX_PER_CM = 3
const chiBarPx = computed(() => 23 * PX_PER_CM)
const meterBarPx = 100 * PX_PER_CM
</script>

<template>
  <div class="measure-wrap">
    <p class="motto">冰冻三尺，非一日之寒 · 才高八斗 · 半斤八两</p>

    <div class="measure-cards">
      <div class="measure-card" :class="{ dim: step < 1 }">
        <p class="m-icon">📏</p>
        <p class="m-name">度（长短）</p>
        <p class="m-from">{{ chi }} 尺</p>
        <p class="m-arrow">→</p>
        <p class="m-to">{{ chiCm }} 厘米</p>
        <p class="m-expr">{{ chi }} × 23 = {{ chiCm }}</p>
      </div>
      <div class="measure-card" :class="{ dim: step < 2 }">
        <p class="m-icon">🫙</p>
        <p class="m-name">量（容量）</p>
        <p class="m-from">{{ sheng }} 升</p>
        <p class="m-arrow">→</p>
        <p class="m-to">{{ shengMl }} 毫升</p>
        <p class="m-expr">{{ sheng }} × 200 = {{ shengMl }}</p>
      </div>
      <div class="measure-card" :class="{ dim: step < 3 }">
        <p class="m-icon">⚖️</p>
        <p class="m-name">衡（轻重）</p>
        <p class="m-from">{{ jin }} 斤</p>
        <p class="m-arrow">→</p>
        <p class="m-to">{{ jinG }} 克</p>
        <p class="m-expr">{{ jin }} × 250 = {{ jinG }}</p>
      </div>
    </div>

    <svg viewBox="0 0 340 90" class="chi-svg" aria-label="1 尺与 1 米的长短对比">
      <text x="8" y="22" class="chi-label">1 米</text>
      <rect x="60" y="12" :width="meterBarPx" height="12" class="meter-bar" />
      <text :x="60 + meterBarPx" y="22" class="chi-num">100 厘米</text>
      <text x="8" y="60" class="chi-label">1 尺</text>
      <rect x="60" y="50" :width="chiBarPx" height="12" class="chi-bar" />
      <text :x="60 + chiBarPx + 6" y="60" class="chi-num">23 厘米</text>
      <text x="60" y="82" class="chi-note">同一比例尺（1 厘米 = {{ PX_PER_CM }} 像素）：古代的 1 尺比现在的 1 米短得多</text>
    </svg>
    <div class="op-bar">
      <button type="button" class="op-btn primary" data-test="measure-next" @click="nextMeasure">
        试一试：一件一件量（已量 {{ step }} / 3 件）
      </button>
      <button type="button" class="op-btn ghost" data-test="measure-all" @click="showAll">全部量完</button>
    </div>

    <p class="note">
      秦始皇统一度量衡：<b>1 尺 ≈ 23 厘米</b>、<b>1 升 ≈ 200 毫升</b>、<b>1 斤 ≈ 250 克</b>，
      计量单位从"身体尺"等不统一走向统一，便于商品流通。
    </p>
  </div>
</template>

<style scoped>
.dim {
  opacity: 0.32;
}
.chi-svg {
  width: 100%;
  max-width: 30rem;
}
.chi-label {
  fill: var(--ui-text-highlighted);
  font-size: 10px;
  font-weight: 700;
}
.chi-num {
  fill: var(--ui-primary);
  font-size: 9px;
}
.chi-note {
  fill: var(--ui-text-muted);
  font-size: 8px;
}
.meter-bar {
  fill: color-mix(in srgb, var(--ui-text-muted) 35%, white);
  stroke: var(--ui-text-muted);
}
.chi-bar {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-primary);
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
.measure-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.motto {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}
.measure-cards {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
}
.measure-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.7rem 1rem;
  min-width: 110px;
}
.m-icon {
  font-size: 1.5rem;
}
.m-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.m-from {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.m-arrow {
  color: var(--ui-primary);
  font-weight: 800;
}
.m-to {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.m-expr {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 616px;
}
.note b {
  color: var(--ui-primary);
}
</style>
