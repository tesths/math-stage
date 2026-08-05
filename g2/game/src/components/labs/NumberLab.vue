<script setup lang="ts">
/**
 * 数 Lab：三位数的组成（计数器）/ 三位数比大小 / 算盘拨珠
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { splitDigits } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const list = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------- 三位数的组成 ---------- */
const h = computed(() => props.values.h ?? 1)
const t = computed(() => props.values.t ?? 2)
const o = computed(() => props.values.o ?? 4)
const placeRows = computed(() => [
  { unit: '百', val: h.value },
  { unit: '十', val: t.value },
  { unit: '个', val: o.value },
])

/* ---------- 三位数比大小 ---------- */
const a = computed(() => props.values.a ?? 402)
const b = computed(() => props.values.b ?? 385)
const sign = computed(() => (a.value > b.value ? '>' : a.value < b.value ? '<' : '='))
const aDigits = computed(() => splitDigits(a.value))
const bDigits = computed(() => splitDigits(b.value))

/* ---------- 算盘 ---------- */
const ABACUS_NUMS = [
  { num: 5, how: '个位上珠表示 5' },
  { num: 105, how: '百位 1、个位 5' },
  { num: 234, how: '二百三十四' },
  { num: 360, how: '三百六十' },
  { num: 999, how: '九百九十九' },
]
const abacusSel = computed(() => Math.round(props.values.sel ?? 0) % ABACUS_NUMS.length)
const abacusNum = computed(() => ABACUS_NUMS[abacusSel.value]!.num)
const abacusRows = computed(() => {
  const [hh, tt, oo] = splitDigits(abacusNum.value)
  return [hh, tt, oo].map((v) => ({ upper: v >= 5 ? 1 : 0, lower: v % 5 }))
})
const UPPER = [1]
const LOWER = [1, 2, 3, 4]
</script>

<template>
  <div class="num-wrap">
    <!-- 三位数的组成：计数器 -->
    <template v-if="kind === 'place-value'">
      <div class="counter">
        <div v-for="row in placeRows" :key="row.unit" class="counter-col">
          <span class="counter-unit">{{ row.unit }}</span>
          <div class="counter-beads">
            <span v-for="i in list(row.val)" :key="i" class="counter-bead" />
          </div>
        </div>
      </div>
      <p class="pv-num">{{ h * 100 + t * 10 + o }}</p>
    </template>

    <!-- 三位数比大小 -->
    <template v-else-if="kind === 'compare'">
      <div class="cmp-row">
        <div class="cmp-card">
          <p class="cmp-big">{{ a }}</p>
          <div class="cmp-dlg">
            <span>百 {{ aDigits[0] }}</span><span>十 {{ aDigits[1] }}</span><span>个 {{ aDigits[2] }}</span>
          </div>
        </div>
        <p class="cmp-sym">{{ sign }}</p>
        <div class="cmp-card">
          <p class="cmp-big">{{ b }}</p>
          <div class="cmp-dlg">
            <span>百 {{ bDigits[0] }}</span><span>十 {{ bDigits[1] }}</span><span>个 {{ bDigits[2] }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 算盘 -->
    <template v-else>
      <p class="pv-num">{{ abacusNum }}</p>
      <svg viewBox="0 0 300 150" class="abacus-svg" role="img">
        <rect x="10" y="6" width="280" height="138" rx="8" class="aba-frame" />
        <line x1="10" y1="62" x2="290" y2="62" class="aba-beam" />
        <g v-for="(row, i) in abacusRows" :key="i">
          <line :x1="30 + i * 80" :y1="10" :x2="30 + i * 80" :y2="140" class="aba-rod" />
          <line :x1="46 + i * 80" :y1="10" :x2="46 + i * 80" :y2="140" class="aba-rod" />
          <circle v-for="u in UPPER" :key="`u${i}`" :cx="30 + i * 80" :cy="u * 34" r="13" class="aba-bead upper" :class="{ on: row.upper >= u }" />
          <circle v-for="l in LOWER" :key="`l${i}`" :cx="46 + i * 80" :cy="l * 20 + 86" r="13" class="aba-bead" :class="{ on: row.lower >= l }" />
          <text :x="30 + i * 80" y="75" class="aba-unit">{{ ['百', '十', '个'][i] }}</text>
        </g>
      </svg>
      <p class="note">{{ ABACUS_NUMS[abacusSel]!.how }}</p>
    </template>
  </div>
</template>

<style scoped>
.num-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.counter {
  display: flex;
  gap: 1rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.8rem 1.2rem;
  background: var(--ui-bg-muted);
}
.counter-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.counter-unit {
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.counter-beads {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 8rem;
}
.counter-bead {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.pv-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.cmp-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 0.7rem 1.1rem;
  text-align: center;
}
.cmp-big {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-dlg {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.cmp-sym {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.abacus-svg {
  width: 280px;
  max-width: 100%;
}
.aba-frame {
  fill: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.aba-beam {
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.aba-rod {
  stroke: var(--ui-border-accented);
  stroke-width: 1;
}
.aba-bead {
  fill: var(--ui-bg);
  stroke: var(--ui-border-accented);
  stroke-width: 1.2;
}
.aba-bead.on {
  fill: var(--ui-primary);
  stroke: var(--ui-primary);
}
.aba-bead.upper {
  opacity: 0.9;
}
.aba-unit {
  fill: var(--ui-text-muted);
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
}
.note {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}
</style>
