<script setup lang="ts">
/**
 * 乘法 Lab：认识乘法（几个几）/ 乘法口诀
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { koujue } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 认识乘法：几个几 ---------- */
const each = computed(() => props.values.each ?? 2)
const groups = computed(() => props.values.groups ?? 2)
const rows = computed(() => Array.from({ length: groups.value }, (_, i) => i))
const cols = computed(() => Array.from({ length: each.value }, (_, i) => i))

/* ---------- 乘法口诀 ---------- */
const base = computed(() => props.values.base ?? 5)
const n = computed(() => props.values.n ?? 1)
const prod = computed(() => base.value * n.value)
const dotCols = computed(() => Array.from({ length: base.value }, (_, i) => i))
const dotRows = computed(() => Array.from({ length: n.value }, (_, i) => i))
</script>

<template>
  <div class="mult-wrap">
    <!-- 几个几：行×列的方块图 -->
    <template v-if="kind === 'groups'">
      <div class="group-box">
        <div v-for="r in rows" :key="r" class="group-row">
          <span v-for="c in cols" :key="c" class="group-cell" />
        </div>
      </div>
      <div class="formula-line">
        {{ groups }} 个 {{ each }} 相加 = {{ each }} × {{ groups }} = {{ each * groups }}
      </div>
    </template>

    <!-- 乘法口诀：base 列 × n 行 点阵 + 口诀 -->
    <template v-else>
      <div class="dot-grid">
        <div v-for="r in dotRows" :key="r" class="dot-row">
          <span v-for="c in dotCols" :key="c" class="dot-cell" />
        </div>
      </div>
      <div class="kj-card">
        <p class="kj-expr">{{ base }} × {{ n }} = {{ prod }}</p>
        <p class="kj-text">{{ koujue(base, n) }}</p>
        <p class="kj-note">{{ n }} 个 {{ base }} 相加</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mult-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.group-box {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 1rem;
  background: var(--ui-bg-muted);
}
.group-row {
  display: flex;
  gap: 0.45rem;
}
.group-cell {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.35rem;
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border: 1px solid var(--ui-primary);
}
.formula-line {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.dot-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dot-row {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.dot-cell {
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 9999px;
  background: var(--ui-primary);
  opacity: 0.9;
}
.kj-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 0.8rem 1.6rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
  min-width: 12rem;
}
.kj-expr {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
.kj-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.kj-note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
</style>
