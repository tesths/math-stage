<script setup lang="ts">
/**
 * 小数乘法和除法 Lab：一个数乘小数（方格模型）/ 积与因数比较 /
 * 积的近似值 / 一个数除以小数 / 商的近似值 / 进一去尾
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { roundTo, fixedN, toFixed2 } from '@/lib/engine/math'
import { roundLife } from '@/lib/labs/quantity'

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
/**
 * 书写顺序是「第一个乘数 ? 积」，所以符号方向要与乘数与 1 的大小关系相反：
 * 乘数 > 1 → 积变大 → 第一个乘数 < 积；乘数 < 1 → 积变小 → 第一个乘数 > 积。
 * 比较用十进制安全四舍五入后的值，避免 4.9×1.01 的显示值（4.95）与精确值（4.949）不一致。
 */
const mulBaseR = computed(() => roundTo(mulBase.value, 4))
const mulFactorR = computed(() => roundTo(mulFactor.value, 4))
const mulProdR = computed(() => roundTo(mulBaseR.value * mulFactorR.value, 4))
const mulCmp = computed(() => (mulFactorR.value > 1 ? '<' : mulFactorR.value < 1 ? '>' : '='))
const mulReason = computed(() =>
  mulFactorR.value > 1
    ? `另一个乘数 ${toFixed2(mulFactorR.value)} 大于 1，积比第一个乘数大`
    : mulFactorR.value < 1
      ? `另一个乘数 ${toFixed2(mulFactorR.value)} 小于 1，积比第一个乘数小`
      : '另一个乘数等于 1，积与第一个乘数相等',
)

/* ---------- 一个数除以小数 ---------- */
const divExamples = [
  { d: 0.6, v: 0.3, i1: 6, i2: 3, q: 2, name: '红彩带剪小段' },
  { d: 1.2, v: 0.24, i1: 120, i2: 24, q: 5, name: '绿彩带剪小段' },
  { d: 0.34, v: 0.017, i1: 340, i2: 17, q: 20, name: '微型例题' },
]
const divSel = computed(() => divExamples[Math.round(props.values.sel ?? 0) % 3]!)

/** 除以小数：转化动画用的位权数字（统一放大到整数后） */
const divMove = computed(() => {
  const d = divSel.value
  // 除数的小数位数即需要右移的位数
  const shift = String(d.v).includes('.') ? String(d.v).split('.')[1]!.length : 0
  return { shift, scale: 10 ** shift, d1: d.i1, d2: d.i2, q: d.q }
})

/* ---------- 积的近似值 ---------- */
const approxPrice = computed(() => props.values.price ?? 16.8)
const approxCount = computed(() => props.values.count ?? 2.4)
const approxDigits = computed(() => Math.round(props.values.digits ?? 1))
/** 精确积（十进制安全）与保留位结果：toFixed 会在 0.35 这类半值处出错，统一走 fixedN */
const approxExact = computed(() => roundTo(approxPrice.value * approxCount.value, 6))
const approxShown = computed(() => fixedN(approxExact.value, approxDigits.value))
const approxNext = computed(() => fixedN(approxExact.value, approxDigits.value + 1).slice(-1))

/* ---------- 商的近似值 ---------- */
const divSpeed = computed(() => props.values.speed ?? 30)
const divApproxRaw = computed(() => (divSpeed.value * 1000) / 60)
const divApproxDecimals = computed(() => (String(divApproxRaw.value).split('.')[1] ?? '').padEnd(3, '0'))
const divApproxKeep = computed(() => divApproxDecimals.value.slice(0, 2))
const divApproxJudge = computed(() => divApproxDecimals.value.slice(2, 3))
const divApproxDecision = computed(() => (Number(divApproxJudge.value) >= 5 ? '第三位 ≥ 5，第二位进 1' : '第三位 < 5，直接舍去'))

/* ---------- 进一去尾 ---------- */
const roundMethod = computed(() => Math.round(props.values.method ?? 0))
const roundTotal = computed(() => props.values.total ?? 300)
/** 去尾法用「元/支」、进一法用「千克/个」，两种情境各用各的除数 */
const roundLifeResult = computed(() => roundLife(roundTotal.value, roundMethod.value))
const roundResult = computed(() => roundLifeResult.value.result)
const roundExact = computed(() => roundLifeResult.value.quotient)
const roundExplain = computed(() => {
  const q = roundExact.value
  const r = roundLifeResult.value
  if (roundMethod.value === 0) {
    return `${roundTotal.value} ÷ 3.5 = ${toFixed2(q)}，买到的支数必须是整数，用去尾法只能买 ${r.result} 支：${r.result} 支要 ${toFixed2(r.usedValue)} 元，再买 1 支要 ${toFixed2(r.nextValue)} 元，钱不够。`
  }
  return `${roundTotal.value} ÷ 2.5 = ${toFixed2(q)}，油要全部装下，用进一法至少需要 ${r.result} 个油壶：${r.result - 1} 个只能装 ${toFixed2(r.usedValue)} 千克，不够；${r.result} 个能装 ${toFixed2(r.nextValue)} 千克。`
})
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
          阴影部分 = {{ toFixed2(a) }} × {{ toFixed2(b) }} = {{ fixedN(a * b, 2) }}（{{ cols }} 列 × {{ rows }} 行 =
          {{ cols * rows }} 个小格，即 {{ cols * rows }}/100）
        </div>
      </div>
      <p class="note">
        {{ toFixed2(a) }} × {{ toFixed2(b) }} = {{ cols }}/10 × {{ rows }}/10 = ({{ cols }}×{{ rows }})/100 =
        {{ fixedN(a * b, 2) }}
      </p>
    </template>

    <!-- 积与因数比较 -->
    <template v-else-if="kind === 'mul-compare'">
      <div class="compare-card">
        <p class="big-expr">{{ toFixed2(mulBase) }} × {{ toFixed2(mulFactor) }} = {{ toFixed2(mulProd) }}</p>
        <p class="cmp-line">
          {{ toFixed2(mulBase) }} <span class="cmp-op">{{ mulCmp }}</span> {{ toFixed2(mulProd) }}
        </p>
        <p class="note">{{ mulReason }}</p>
      </div>
    </template>

    <!-- 积的近似值 -->
    <template v-else-if="kind === 'mul-approx'">
      <div class="approx-card">
        <p class="big-expr">
          {{ toFixed2(approxPrice) }} × {{ toFixed2(approxCount) }} = {{ toFixed2(approxPrice * approxCount) }}
        </p>
        <p class="approx-result">
          保留 {{ approxDigits }} 位小数 → {{ approxShown }}
          <span class="note">（精确积 {{ fixedN(approxExact, 6) }}，看第 {{ approxDigits + 1 }} 位小数「{{ approxNext }}」）</span>
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
        <p class="big-expr">{{ toFixed2(divSel.d) }} ÷ {{ toFixed2(divSel.v) }} = {{ divSel.q }}</p>
        <div class="decimal-rule" aria-label="除以小数转化目标">
          <span>目标：把除数 {{ toFixed2(divSel.v) }} 变成整数 {{ divSel.i2 }}</span>
          <span>两数同乘 {{ divMove.scale }}，商不变</span>
        </div>
        <div class="dp-track">
          <div class="dp-row">
            <span class="dp-tag">被除数</span>
            <span class="dp-chips">
              <span
                v-for="(c, i) in String(toFixed2(divSel.d)).split('')"
                :key="'a' + i"
                class="dp-chip"
                :class="{ dot: c === '.' }"
              >{{ c }}</span>
            </span>
            <span class="dp-arrow">右移 {{ divMove.shift }} 位 →</span>
            <span class="dp-chips">
              <span v-for="(c, i) in String(divSel.i1).split('')" :key="'a1' + i" class="dp-chip int">{{ c }}</span>
            </span>
          </div>
          <div class="dp-row">
            <span class="dp-tag">除数</span>
            <span class="dp-chips">
              <span
                v-for="(c, i) in String(toFixed2(divSel.v)).split('')"
                :key="'b' + i"
                class="dp-chip"
                :class="{ dot: c === '.' }"
              >{{ c }}</span>
            </span>
            <span class="dp-arrow">右移 {{ divMove.shift }} 位 →</span>
            <span class="dp-chips">
              <span v-for="(c, i) in String(divSel.i2).split('')" :key="'b1' + i" class="dp-chip int">{{ c }}</span>
            </span>
          </div>
        </div>
        <div class="align-note">
          <span>小数点同时右移 <b>{{ divMove.shift }}</b> 位</span>
          <span class="eq-sym">=</span>
          <span>{{ divSel.i1 }} ÷ {{ divSel.i2 }} = {{ divSel.q }}</span>
        </div>
        <p class="note">把除数变成整数：被除数和除数的小数点<b>同时</b>向右移动相同位数，商不变</p>
      </div>
    </template>

    <!-- 商的近似值 -->
    <template v-else-if="kind === 'div-approx'">
      <div class="approx-card">
        <p class="div-title">海狮游速 {{ divSpeed }} 千米/时 = {{ divSpeed * 1000 }} 米/时</p>
        <p class="long-div">{{ divSpeed * 1000 }} ÷ 60</p>
        <div class="round-flow" aria-label="商的近似值判定流程">
          <span>精确商 {{ Math.floor(divApproxRaw) }}.{{ divApproxKeep }}{{ divApproxJudge }}</span>
          <span>保留两位</span>
          <span>判定位 {{ divApproxJudge }}</span>
          <span>{{ divApproxDecision }}</span>
        </div>
        <div class="long-box">
          <span class="lb-quot">{{ Math.floor(divApproxRaw) }}.<span class="lb-extra">{{ divApproxKeep }}</span><span class="lb-cut">{{ divApproxJudge }}</span></span>
          <span class="lb-note">先除到小数点后第三位（<span class="lb-cut">淡色</span>），再四舍五入</span>
        </div>
        <p class="approx-result">保留两位小数 → <b>{{ fixedN(divApproxRaw, 2) }}</b> 米/分</p>
        <p class="note">看小数点后第三位：≥5 进 1，&lt;5 舍去</p>
      </div>
    </template>

    <!-- 进一去尾 -->
    <template v-else-if="kind === 'round-life'">
      <div class="approx-card">
        <p class="div-title">
          {{ roundMethod === 0 ? `每支自动铅笔 3.5 元，${roundTotal} 元最多买多少支？` : `每个油壶最多装 2.5 千克油，${roundTotal} 千克油至少需要几个油壶？` }}
        </p>
        <p class="big-expr">
          {{ roundTotal }} ÷ {{ roundMethod === 0 ? '3.5' : '2.5' }} = {{ toFixed2(roundExact) }}
        </p>
        <div class="approx-bars">
          <div class="approx-row">
            <span class="approx-row-text">
              {{ roundMethod === 0
                ? `${roundResult} 支用 ${toFixed2(roundLifeResult.usedValue)} 元（还剩 ${toFixed2(roundLifeResult.remainder)} 元）`
                : `每个油壶装 2.5 千克，${roundResult - 1} 个只装 ${toFixed2(roundLifeResult.usedValue)} 千克` }}
            </span>
            <div class="approx-track">
              <div class="approx-fill used" :style="{ width: `${Math.min(100, (roundLifeResult.usedValue / Math.max(roundTotal, 1)) * 100)}%` }" />
            </div>
          </div>
          <div class="approx-row">
            <span class="approx-row-text">
              {{ roundMethod === 0 ? `一共带了 ${roundTotal} 元` : `要装的油一共 ${roundTotal} 千克（${roundResult} 个能装 ${toFixed2(roundLifeResult.nextValue)} 千克）` }}
            </span>
            <div class="approx-track">
              <div class="approx-fill total" :style="{ width: `${Math.min(100, (roundTotal / Math.max(roundTotal, roundLifeResult.nextValue)) * 100)}%` }" />
            </div>
          </div>
        </div>
        <p class="approx-result">
          {{ roundMethod === 0 ? '去尾法（最多买）' : '进一法（至少需要）' }} → <b>{{ roundResult }}</b> {{ roundMethod === 0 ? '支' : '个' }}
        </p>
        <p class="note">{{ roundExplain }}</p>
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
.approx-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.approx-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: left;
}
.approx-row-text {
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.approx-track {
  height: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  overflow: hidden;
  background: var(--ui-bg-elevated, white);
}
.approx-fill {
  height: 100%;
}
.approx-fill.used {
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.approx-fill.total {
  background: color-mix(in srgb, var(--ui-info, #38bdf8) 45%, white);
}
.approx-card,
.div-card {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 1rem 1.4rem;
  text-align: center;
  min-width: 22rem;
  max-width: 34rem;
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
.decimal-rule,
.round-flow {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
}
.decimal-rule span,
.round-flow span {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.decimal-rule span:first-child,
.round-flow span:last-child {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
/* 除以小数：小数点同步移动 */
.dp-track {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}
.dp-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.dp-tag {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-text-muted);
  min-width: 2.5rem;
  text-align: right;
}
.dp-chips {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}
.dp-chip {
  font-family: ui-monospace, monospace;
  font-size: 1.05rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  border: 1px solid var(--ui-border-accented);
  border-radius: 0.3rem;
  min-width: 1.4rem;
  text-align: center;
  padding: 0.1rem 0.15rem;
  color: var(--ui-text-highlighted);
}
.dp-chip.dot {
  background: transparent;
  border: none;
  color: var(--ui-primary);
  font-size: 1.3rem;
  min-width: 0.5rem;
}
.dp-chip.int {
  color: var(--ui-primary);
  border-color: var(--ui-primary);
}
.dp-arrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-warning, #f59e0b);
}
.align-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.align-note b {
  color: var(--ui-primary);
}
.eq-sym {
  color: var(--ui-text-muted);
}
/* 商的近似值：竖式多算一位 */
.long-div {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.long-box {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.4rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg);
}
.lb-quot {
  font-family: ui-monospace, monospace;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.lb-extra {
  color: var(--ui-primary);
}
.lb-cut {
  color: var(--ui-text-muted);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 22%, transparent);
  border-radius: 0.2rem;
  padding: 0 0.1rem;
}
.lb-note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
@media (max-width: 520px) {
  .compare-card,
  .approx-card,
  .div-card {
    padding: 0.85rem 0.75rem;
  }
  .big-expr {
    font-size: 1.15rem;
  }
}
</style>
