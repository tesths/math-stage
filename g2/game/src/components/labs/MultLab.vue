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
const groupProduct = computed(() => each.value * groups.value)
const repeatedTerms = computed(() => Array.from({ length: groups.value }, () => each.value))
const repeatedAddition = computed(() => repeatedTerms.value.join(' + '))

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
      <div class="groups-model">
        <p class="groups-title">每组同样多，先圈出 {{ groups }} 组</p>
        <div class="group-box">
          <div v-for="r in rows" :key="r" class="group-row">
            <span class="group-label">第 {{ r + 1 }} 组</span>
            <span v-for="c in cols" :key="c" class="group-cell" />
            <span class="row-sum">{{ each }} 个</span>
          </div>
        </div>
        <div class="addition-strip" aria-label="相同加数连加">
          <template v-for="(term, i) in repeatedTerms" :key="i">
            <span class="add-term">{{ term }}</span>
            <span v-if="i < repeatedTerms.length - 1" class="add-op">+</span>
          </template>
          <span class="add-op">=</span>
          <span class="add-result">{{ groupProduct }}</span>
        </div>
        <div class="factor-map">
          <span><b>{{ each }}</b> 是每组几个</span>
          <span><b>{{ groups }}</b> 是有几组</span>
          <span><b>{{ groupProduct }}</b> 是一共有几个</span>
        </div>
      </div>
      <div class="formula-line">
        {{ groups }} 个 {{ each }} 相加：{{ repeatedAddition }} = {{ each }} × {{ groups }} = {{ groupProduct }}
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
  gap: 0.55rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 1rem;
  background: var(--ui-bg-muted);
}
.groups-model {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.groups-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ui-text-toned);
}
.group-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.group-label,
.row-sum {
  min-width: 3.2rem;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ui-text-muted);
}
.row-sum {
  color: var(--ui-primary);
}
.group-cell {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.35rem;
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border: 1px solid var(--ui-primary);
}
.addition-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.add-term,
.add-result {
  display: inline-flex;
  min-width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  font-weight: 900;
}
.add-result {
  color: white;
  background: var(--ui-primary);
  border-color: var(--ui-primary);
}
.add-op {
  color: var(--ui-primary);
  font-weight: 900;
}
.factor-map {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}
.factor-map span {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.65rem;
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 800;
}
.factor-map b {
  color: var(--ui-primary);
}
.formula-line {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
  text-align: center;
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

@media (max-width: 480px) {
  .group-box {
    width: 100%;
    padding: 0.8rem;
  }
  .group-row {
    gap: 0.3rem;
  }
  .group-label,
  .row-sum {
    min-width: 2.75rem;
    font-size: 0.72rem;
  }
  .group-cell {
    width: 1.25rem;
    height: 1.25rem;
  }
  .formula-line {
    font-size: 0.95rem;
  }
}
</style>
