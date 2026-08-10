<script setup lang="ts">
/**
 * 大数的运算 Lab：三位数乘两位数 / 计算器探索规律 / 1亿有多大
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { digitsOf, formatBig } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 三位数乘两位数 ---------- */
const num = computed(() => Math.round(props.values.num ?? 128))
const mult = computed(() => Math.round(props.values.mult ?? 16))
const o = computed(() => mult.value % 10)
const t = computed(() => Math.floor(mult.value / 10))
const oProd = computed(() => num.value * o.value)
const tProd = computed(() => num.value * t.value)
const total = computed(() => num.value * mult.value)
const digits = computed(() => digitsOf(num.value))

/* ---------- 计算器规律 ---------- */
const tens = computed(() => Math.round(props.values.tens ?? 3))
const n5 = computed(() => tens.value * 10 + 5)
const n5sq = computed(() => n5.value * n5.value)
const prefix = computed(() => tens.value * (tens.value + 1))

/* ---------- 1亿有多大 ---------- */
const sheets = computed(() => Math.round(props.values.sheets ?? 1000000))
const thick = computed(() => props.values.thick ?? 1)
const cm = computed(() => (sheets.value / 100) * thick.value)
const meters = computed(() => cm.value / 100)
const yiCm = computed(() => (100000000 / 100) * thick.value)
const yiMeters = computed(() => yiCm.value / 100)
</script>

<template>
  <div class="big-wrap">
    <!-- 三位数乘两位数 -->
    <template v-if="kind === 'big-mul'">
      <svg viewBox="0 0 340 220" class="mul-svg">
        <text
          v-for="(d, i) in digits"
          :key="'n' + i"
          :x="130 + i * 30"
          :y="40"
          text-anchor="middle"
          class="mul-d"
        >{{ d }}</text>
        <text
          v-for="(d, i) in digitsOf(mult)"
          :key="'m' + i"
          :x="130 + (digits.length - digitsOf(mult).length + i) * 30"
          :y="70"
          text-anchor="middle"
          class="mul-d"
        >{{ d }}</text>
        <line x1="96" y1="84" x2="250" y2="84" class="mul-line" />
        <!-- 个位积 -->
        <text
          v-for="(d, i) in digitsOf(oProd)"
          :key="'o' + i"
          :x="250 - (digitsOf(oProd).length - 1 - i) * 30"
          :y="110"
          text-anchor="middle"
          class="mul-r"
        >{{ d }}</text>
        <!-- 十位积 -->
        <text
          v-for="(d, i) in digitsOf(tProd)"
          :key="'t' + i"
          :x="220 - (digitsOf(tProd).length - 1 - i) * 30"
          :y="140"
          text-anchor="middle"
          class="mul-r"
        >{{ d }}</text>
        <text :x="230" :y="140" text-anchor="middle" class="mul-zero">0</text>
        <line x1="96" y1="150" x2="250" y2="150" class="mul-line" />
        <text
          v-for="(d, i) in digitsOf(total)"
          :key="'T' + i"
          :x="250 - (digitsOf(total).length - 1 - i) * 30"
          :y="180"
          text-anchor="middle"
          class="mul-total"
        >{{ d }}</text>
      </svg>
      <div class="formula-row">
        <span class="chip">{{ num }} × {{ mult }}</span>
        <span class="chip">{{ num }} × {{ o }} = {{ oProd }}</span>
        <span class="chip">{{ num }} × {{ t }} = {{ tProd }}0</span>
        <span class="chip op">= {{ formatBig(total) }}</span>
      </div>
    </template>

    <!-- 计算器规律 -->
    <template v-else-if="kind === 'big-calc'">
      <div class="calc-cards">
        <div class="calc-card">
          <p class="calc-expr">{{ n5 }} × {{ n5 }}</p>
          <p class="calc-result">{{ n5sq }}</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">末两位是 25</span>
        <span class="chip">前面 = {{ tens }} × {{ tens + 1 }} = {{ prefix }}</span>
        <span class="chip op">{{ prefix }} × 100 + 25 = {{ n5sq }}</span>
      </div>
      <p class="note">
        个位是 5 的数自乘：<b>{{ n5 }} × {{ n5 }} = {{ n5sq }}</b>，用计算器验证
      </p>
    </template>

    <!-- 1亿有多大 -->
    <template v-else>
      <div class="yi-box">
        <div class="yi-paper">
          <p class="yi-count">{{ formatBig(sheets) }} 张纸</p>
          <div class="paper-stack" :style="{ height: Math.min(140, meters / 20) + 'px' }" />
          <p class="yi-meters">{{ meters >= 100 ? formatBig(Math.round(meters)) + ' 米' : cm + ' 厘米' }}</p>
        </div>
        <div class="yi-everest">
          <p class="everest-top">🏔️ 珠穆朗玛峰 8848 米</p>
          <div class="everest-mountain" :style="{ height: Math.min(160, (8848 / 12000) * 160) + 'px' }" />
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">{{ formatBig(sheets) }} ÷ 100 × {{ thick }} 厘米</span>
        <span class="chip op">{{ meters >= 100 ? formatBig(Math.round(meters)) + ' 米' : cm + ' 厘米' }}</span>
      </div>
      <p class="note">
        1 亿张纸摞起来约 <b>{{ formatBig(Math.round(yiMeters)) }} 米</b>，
        {{ yiMeters > 8848 ? '比珠穆朗玛峰（8848 米）还高！' : '比珠穆朗玛峰矮。' }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.big-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.mul-svg {
  width: 100%;
  max-width: 476px;
}
.mul-d {
  font-size: 20px;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.mul-line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.mul-r {
  font-size: 17px;
  fill: var(--ui-text-toned);
}
.mul-zero {
  font-size: 17px;
  fill: var(--ui-primary);
}
.mul-total {
  font-size: 19px;
  font-weight: 800;
  fill: var(--ui-primary);
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
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 644px;
}
.note b {
  color: var(--ui-primary);
}
.calc-card {
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 1rem 1.6rem;
  background: var(--ui-bg-muted);
  text-align: center;
}
.calc-expr {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.calc-result {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.yi-box {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
}
.yi-paper,
.yi-everest {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.yi-count {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.paper-stack {
  width: 90px;
  background: linear-gradient(to top, var(--ui-primary), color-mix(in srgb, var(--ui-primary) 60%, white));
  border-radius: 6px 6px 0 0;
  transition: height 0.4s;
  min-height: 6px;
}
.yi-meters {
  font-size: 0.85rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.everest-top {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.everest-mountain {
  width: 60px;
  background: linear-gradient(to top, var(--ui-text-muted), var(--ui-text-toned));
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}
</style>
