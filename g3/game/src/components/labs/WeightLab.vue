<script setup lang="ts">
/**
 * 曹冲称象 Lab：质量单位换算（克/千克/吨）、等量代换
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* weight */
const value = computed(() => props.values.value ?? 3)
const unitIdx = computed(() => Math.round(props.values.unit ?? 0))
const grams = computed(() => value.value * 1000)

/* equivalent */
const stones = computed(() => Math.round(props.values.stones ?? 5))
const each = computed(() => props.values.each ?? 40)
const total = computed(() => stones.value * each.value)
const stoneList = computed(() => Array.from({ length: Math.min(stones.value, 12) }, (_, i) => i + 1))
</script>

<template>
  <div class="weight-wrap">
    <!-- 质量单位换算 -->
    <template v-if="kind === 'weight'">
      <div class="scale-visual">
        <div class="scale-item" :class="{ active: unitIdx === 2 }">
          <span class="scale-icon">🚚</span>
          <p class="scale-name">吨（t）</p>
          <p class="scale-val">{{ (value / 1000) }} 吨</p>
        </div>
        <div class="scale-arrow">⇄</div>
        <div class="scale-item" :class="{ active: unitIdx === 1 }">
          <span class="scale-icon">🍎</span>
          <p class="scale-name">千克（kg）</p>
          <p class="scale-val">{{ value }} 千克</p>
        </div>
        <div class="scale-arrow">⇄</div>
        <div class="scale-item" :class="{ active: unitIdx === 0 }">
          <span class="scale-icon">⚖️</span>
          <p class="scale-name">克（g）</p>
          <p class="scale-val">{{ grams }} 克</p>
        </div>
      </div>
      <div class="rate-line">
        <span class="rate-chip">1 千克 = 1000 克</span>
        <span class="rate-chip">1 吨 = 1000 千克</span>
        <span class="rate-chip">1 吨 = 1000000 克</span>
      </div>
      <p class="unit-tip">
        称比较轻的物体用克，称多数物体用千克，称大宗重物用吨。<b>{{ value }} 千克 = {{ grams }} 克</b>
      </p>
    </template>

    <!-- 等量代换：曹冲称象 -->
    <template v-else>
      <div class="elephant-row">
        <div class="boat">
          <span class="water" />
          <span class="elephant">🐘</span>
          <span class="boat-line" />
        </div>
        <div class="equals">=</div>
        <div class="boat">
          <span class="water" />
          <div class="stones">
            <span v-for="i in stoneList" :key="i" class="stone">🪨</span>
          </div>
          <span class="boat-line" />
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">石头 {{ stones }} 块 × {{ each }} 千克</span>
        <span class="chip op">=</span>
        <span class="chip result">大象约 {{ total }} 千克</span>
      </div>
      <p class="unit-tip">
        小船下沉到相同位置，说明石头的总质量 = 大象的质量。每块 {{ each }} 千克 × {{ stones }} 块 = {{ total }} 千克
      </p>
    </template>
  </div>
</template>

<style scoped>
.weight-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.scale-visual {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.scale-item {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.8rem 1.2rem;
  text-align: center;
  min-width: 6.5rem;
}
.scale-item.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.scale-icon {
  font-size: 2rem;
  display: block;
}
.scale-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  margin-top: 0.3rem;
}
.scale-val {
  font-size: 0.95rem;
  color: var(--ui-primary);
  font-weight: 800;
  margin-top: 0.2rem;
}
.scale-arrow {
  font-size: 1.2rem;
  color: var(--ui-text-muted);
}
.rate-line {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.rate-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.25rem 0.7rem;
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.unit-tip {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  max-width: 24rem;
  text-align: center;
}
.unit-tip b {
  color: var(--ui-primary);
}
.elephant-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.boat {
  position: relative;
  width: 10rem;
  min-height: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.boat-line {
  width: 9rem;
  border-bottom: 4px solid var(--ui-text-highlighted);
  border-radius: 0 0 50% 50%;
  margin-bottom: 1rem;
}
.water {
  position: absolute;
  bottom: 0.7rem;
  left: 0;
  right: 0;
  height: 0.5rem;
  background: color-mix(in srgb, var(--ui-primary) 30%, transparent);
  border-radius: 9999px;
}
.elephant {
  font-size: 3rem;
  margin-bottom: 0.2rem;
}
.stones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  justify-content: center;
  margin-bottom: 0.2rem;
}
.stone {
  font-size: 1.5rem;
}
.equals {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ui-primary);
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
.chip.op {
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
  font-weight: 800;
}
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
</style>
