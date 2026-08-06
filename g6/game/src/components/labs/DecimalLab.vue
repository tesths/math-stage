<script setup lang="ts">
/**
 * 小数乘法和除法 Lab：一个数乘小数（方格模型）/ 积与因数比较 /
 * 积的近似值 / 一个数除以小数 / 商的近似值 / 进一去尾
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 一个数乘小数：10×10 方格模型 ---------- */
const a = computed(() => props.values.a ?? 0.6)
const b = computed(() => props.values.b ?? 0.4)
const cols = computed(() => Math.round(a.value * 10))
const rows = computed(() => Math.round(b.value * 10))
const gridCells = computed(() => Array.from({ length: 100 }, (_, i) => i))
const inRect = (i: number) => i % 10 < cols.value && Math.floor(i / 10) < rows.value

/* ---------- 积与因数比较 ---------- */
const mulBase = computed(() => props.values.base ?? 4.9)
const mulFactor = computed(() => props.values.factor ?? 1.01)
const mulProd = computed(() => mulBase.value * mulFactor.value)
const mulCmp = computed(() => (mulFactor.value > 1 ? '>' : mulFactor.value < 1 ? '<' : '='))

/* ---------- 一个数除以小数 ---------- */
const divExamples = [
  { d: 0.6, v: 0.3, i1: 6, i2: 3, q: 2, name: '红彩带剪小段' },
  { d: 1.2, v: 0.24, i1: 120, i2: 24, q: 5, name: '绿彩带剪小段' },
  { d: 0.34, v: 0.017, i1: 340, i2: 17, q: 20, name: '微型例题' },
]
const divSel = computed(() => divExamples[Math.round(props.values.sel ?? 0) % 3]!)

/* ---------- 积的近似值 ---------- */
const approxPrice = computed(() => props.values.price ?? 16.8)
const approxCount = computed(() => props.values.count ?? 2.4)
const approxDigits = computed(() => Math.round(props.values.digits ?? 1))

/* ---------- 商的近似值 ---------- */
const divSpeed = computed(() => props.values.speed ?? 30)

/* ---------- 进一去尾 ---------- */
const roundMethod = computed(() => Math.round(props.values.method ?? 0))
const roundTotal = computed(() => props.values.total ?? 300)
const roundQ = computed(() => roundTotal.value / 3.5)
const roundResult = computed(() =>
  roundMethod.value === 0 ? Math.floor(roundQ.value) : Math.ceil(roundQ.value),
)
</script>

<template>
  <div class="decimal-wrap">
    <!-- 一个数乘小数：方格模型 -->
    <template v-if="kind === 'mul-decimal'">
      <div class="grid-model">
        <div class="grid-100">
          <span
            v-for="(cell, i) in gridCells"
            :key="cell"
            class="grid-cell"
            :class="{ filled: inRect(i) }"
          />
        </div>
        <div class="grid-label">
          阴影部分 = {{ a }} × {{ b }} = {{ toFixed2(a * b) }}（{{ cols }} 列 × {{ rows }} 行 = 24 个小格，即 24/100）
        </div>
      </div>
      <p class="note">0.6 × 0.4 = 6/10 × 4/10 = (6×4)/100 = 0.24</p>
    </template>

    <!-- 积与因数比较 -->
    <template v-else-if="kind === 'mul-compare'">
      <div class="compare-card">
        <p class="big-expr">{{ toFixed2(mulBase) }} × {{ toFixed2(mulFactor) }} = {{ toFixed2(mulProd) }}</p>
        <p class="cmp-line">
          {{ toFixed2(mulBase) }} <span class="cmp-op">{{ mulCmp }}</span> {{ toFixed2(mulProd) }}
        </p>
        <p class="note">
          {{ mulFactor > 1 ? '另一个乘数大于 1，积大于第一个乘数' : mulFactor < 1 ? '另一个乘数小于 1，积小于第一个乘数' : '另一个乘数等于 1，积等于第一个乘数' }}
        </p>
      </div>
    </template>

    <!-- 积的近似值 -->
    <template v-else-if="kind === 'mul-approx'">
      <div class="approx-card">
        <p class="big-expr">
          {{ toFixed2(approxPrice) }} × {{ toFixed2(approxCount) }} = {{ toFixed2(approxPrice * approxCount) }}
        </p>
        <p class="approx-result">
          保留 {{ approxDigits }} 位小数 → {{ (approxPrice * approxCount).toFixed(approxDigits) }}
        </p>
        <div class="money-line">
          <span>💵 苹果单价 {{ toFixed2(approxPrice) }} 元/千克</span>
          <span>购买 {{ toFixed2(approxCount) }} 千克</span>
        </div>
      </div>
    </template>

    <!-- 一个数除以小数 -->
    <template v-else-if="kind === 'div-decimal'">
      <div class="div-card">
        <p class="div-title">{{ divSel.name }}</p>
        <p class="big-expr">
          {{ toFixed2(divSel.d) }} ÷ {{ toFixed2(divSel.v) }} = {{ divSel.q }}
        </p>
        <div class="transform-arrow">
          <span class="from">{{ toFixed2(divSel.d) }} ÷ {{ toFixed2(divSel.v) }}</span>
          <span class="arrow">小数点同时右移 →</span>
          <span class="to">{{ divSel.i1 }} ÷ {{ divSel.i2 }}</span>
        </div>
        <p class="note">被除数和除数的小数点同时向右移动相同的位数，转化成整数除法</p>
      </div>
    </template>

    <!-- 商的近似值 -->
    <template v-else-if="kind === 'div-approx'">
      <div class="approx-card">
        <p class="div-title">海狮游速 {{ divSpeed }} 千米/时</p>
        <p class="big-expr">{{ divSpeed }} × 1000 ÷ 60 ≈ {{ ((divSpeed * 1000) / 60).toFixed(2) }} 米/分</p>
        <p class="note">得数保留两位小数：先除到小数点后第三位，再四舍五入</p>
      </div>
    </template>

    <!-- 进一去尾 -->
    <template v-else-if="kind === 'round-life'">
      <div class="approx-card">
        <p class="div-title">每支自动铅笔 3.5 元，{{ roundTotal }} 元最多买多少支？</p>
        <p class="big-expr">{{ roundTotal }} ÷ 3.5 ≈ {{ toFixed2(roundQ) }}</p>
        <p class="approx-result">
          {{ roundMethod === 0 ? '去尾法（最多买）' : '进一法（至少需要）' }} → <b>{{ roundResult }}</b> 个
        </p>
        <p class="note">
          {{ roundMethod === 0 ? '不够买 86 支，300 元最多只能买 85 支（去尾）' : '装油壶时多一点也要 1 个壶（进一）' }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.decimal-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.grid-model {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.grid-100 {
  display: grid;
  grid-template-columns: repeat(10, 22px);
  gap: 2px;
}
.grid-cell {
  width: 22px;
  height: 22px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 2px;
}
.grid-cell.filled {
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border-color: var(--ui-primary);
}
.grid-label {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.compare-card,
.approx-card,
.div-card {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 1rem 1.4rem;
  text-align: center;
  min-width: 16rem;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.big-expr {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-line {
  font-size: 1.2rem;
  font-weight: 700;
}
.cmp-op {
  color: var(--ui-primary);
  font-size: 1.5rem;
}
.div-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.approx-result {
  font-size: 1.05rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.transform-arrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.from,
.to {
  border-radius: 9999px;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border-accented);
  padding: 0.3rem 0.7rem;
  font-weight: 700;
}
.arrow {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.money-line {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
</style>
