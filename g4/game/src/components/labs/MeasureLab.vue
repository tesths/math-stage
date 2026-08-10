<script setup lang="ts">
/**
 * 度量衡 Lab：古今计量单位换算（尺/升/斤）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const chi = computed(() => Math.round(props.values.chi ?? 5))
const sheng = computed(() => Math.round(props.values.sheng ?? 3))
const jin = computed(() => Math.round(props.values.jin ?? 4))

const chiCm = computed(() => chi.value * 23)
const shengMl = computed(() => sheng.value * 200)
const jinG = computed(() => jin.value * 250)
</script>

<template>
  <div class="measure-wrap">
    <p class="motto">冰冻三尺，非一日之寒 · 才高八斗 · 半斤八两</p>

    <div class="measure-cards">
      <div class="measure-card">
        <p class="m-icon">📏</p>
        <p class="m-name">度（长短）</p>
        <p class="m-from">{{ chi }} 尺</p>
        <p class="m-arrow">→</p>
        <p class="m-to">{{ chiCm }} 厘米</p>
        <p class="m-expr">{{ chi }} × 23 = {{ chiCm }}</p>
      </div>
      <div class="measure-card">
        <p class="m-icon">🫙</p>
        <p class="m-name">量（容量）</p>
        <p class="m-from">{{ sheng }} 升</p>
        <p class="m-arrow">→</p>
        <p class="m-to">{{ shengMl }} 毫升</p>
        <p class="m-expr">{{ sheng }} × 200 = {{ shengMl }}</p>
      </div>
      <div class="measure-card">
        <p class="m-icon">⚖️</p>
        <p class="m-name">衡（轻重）</p>
        <p class="m-from">{{ jin }} 斤</p>
        <p class="m-arrow">→</p>
        <p class="m-to">{{ jinG }} 克</p>
        <p class="m-expr">{{ jin }} × 250 = {{ jinG }}</p>
      </div>
    </div>

    <p class="note">
      秦始皇统一度量衡：<b>1 尺 ≈ 23 厘米</b>、<b>1 升 ≈ 200 毫升</b>、<b>1 斤 ≈ 250 克</b>，
      计量单位从"身体尺"等不统一走向统一，便于商品流通。
    </p>
  </div>
</template>

<style scoped>
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
