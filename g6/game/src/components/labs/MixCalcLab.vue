<script setup lang="ts">
/**
 * 混合运算 Lab：分数四则混合运算 / 估算购物 / 分段计费
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'
import {
  FLOUR_PRICE,
  RICE_PRICE,
  SHOP_GOODS,
  VERDICT_TEXT,
  affordableVerdict,
  estimateShop,
  fracMix,
  piecewiseFee,
  type Verdict,
} from '@/lib/labs/quantity'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 分数混合运算 · 中国结 ---------- */
const a = computed(() => Math.round(props.values.a ?? 2))
const b = computed(() => Math.round(props.values.b ?? 3))
const n = computed(() => Math.round(props.values.n ?? 18))
const mix = computed(() => fracMix(a.value, b.value, n.value))

/**
 * 「1 米彩绳从哪来」：把两条分率条拼成整根 1 米。
 * 关键概念：a/(a+b) + b/(a+b) = 1，所以「先合再乘」与「分别算再相加」结果相同
 * （乘法分配律对分数同样适用）。
 */
const fracJoinOpen = ref(false)
const fracJoinWidths = computed(() => {
  const den = a.value + b.value
  return { first: (a.value / den) * 100, second: (b.value / den) * 100 }
})
const fracJoinExpr = computed(
  () => `(${mix.value.fraction1} + ${mix.value.fraction2}) × ${n.value} = 1 × ${n.value} = ${n.value} 米`,
)

/* ---------- 估算购物 ---------- */
const budget = computed(() => props.values.budget ?? 100)
const est = computed(() => estimateShop(budget.value, SHOP_GOODS))
const goods = SHOP_GOODS
const verdicts = computed<{ name: string; price: number; verdict: Verdict }[]>(() => [
  { name: '面粉', price: FLOUR_PRICE, verdict: affordableVerdict(est.value, FLOUR_PRICE) },
  { name: '大米', price: RICE_PRICE, verdict: affordableVerdict(est.value, RICE_PRICE) },
])
/** 花钱条：已花（估大/估小）与剩余 */
const barPct = (v: number) => `${Math.max(0, Math.min(100, (v / budget.value) * 100))}%`
/**
 * 临界值：最少剩余刚好 ≥ 价钱的最小预算。预算再少 1 元，结论就翻到「无法确定」。
 * 用它把「三值结论由最少剩 / 最多剩决定」变成可以亲手推一推的操作。
 */
const criticalBudget = (price: number) => Math.ceil(est.value.spendHigh + price)
const criticalButtons = computed(() => {
  const flour = criticalBudget(FLOUR_PRICE)
  const rice = criticalBudget(RICE_PRICE)
  return [
    { key: 'flour-def', label: `面粉临界值 ${flour} 元 → 一定够`, target: flour },
    { key: 'flour-maybe', label: `再少 1 元（${flour - 1} 元）→ 无法确定`, target: flour - 1 },
    { key: 'rice-def', label: `大米临界值 ${rice} 元 → 一定够`, target: rice },
    { key: 'rice-maybe', label: `再少 1 元（${rice - 1} 元）→ 无法确定`, target: rice - 1 },
  ]
})
function pushBudgetTo(target: number) {
  props.values.budget = target
}

/* ---------- 分段计费 ---------- */
const km = computed(() => props.values.km ?? 5)
const pw = computed(() => piecewiseFee(km.value))
const within = computed(() => pw.value.withinBase)
const fee = computed(() => pw.value.fee)
const MAX_KM = 20
/** 费用条：起步价部分与超出部分各占多少（按元数比例） */
const baseFeePct = computed(() => `${(pw.value.baseFee / Math.max(1, pw.value.fee)) * 100}%`)

/**
 * 逐段计费步进：第 1 步只给起步价段，第 2 步给超出段，第 3 步给
 * 「不足 1 千米按 1 千米」的进位提示与总额。
 * 关键概念：分段计费要按区间分段算，再相加；进位只发生在超出段。
 */
const PW_MAX_STEP = 3
const pwStep = ref(1)
const pieceSteps = computed(() => {
  const r = pw.value
  const rawExtra = km.value - r.baseKm
  const title3 = r.roundedUp ? '第 3 步 · 不足 1 千米按 1 千米，算总额' : '第 3 步 · 两段相加得总额'
  return [
    {
      title: '第 1 步 · 起步价段',
      detail: `不超过 ${r.baseKm} 千米都收起步价 ${toFixed2(r.baseFee)} 元${within.value ? `；${toFixed2(km.value)} 千米在起步段内，车费就是起步价` : ''}`,
    },
    {
      title: '第 2 步 · 超出段',
      detail: within.value
        ? `${toFixed2(km.value)} 千米没有超出 ${r.baseKm} 千米，这一段是 0 元`
        : `超出 ${toFixed2(rawExtra)} 千米 → 按 ${r.extraKm} 千米计费：${r.extraKm} × 2.2 = ${toFixed2(r.extraFee)} 元`,
    },
    {
      title: title3,
      detail: `${r.roundedUp ? `超出 ${toFixed2(rawExtra)} 千米不足 1 千米，按 ${r.extraKm} 千米计算；` : ''}车费 = ${toFixed2(r.baseFee)} ${within.value ? '' : `+ ${toFixed2(r.extraFee)}`} = ${toFixed2(fee.value)} 元`,
    },
  ]
})
const pwVisibleSteps = computed(() => pieceSteps.value.slice(0, pwStep.value))
</script>

<template>
  <div class="mix-wrap">
    <!-- 分数四则混合运算 -->
    <template v-if="kind === 'frac-mix'">
      <div class="rope-bars">
        <div class="rope-row">
          <span class="rope-label">第一种（{{ a }}/{{ a + b }} 米/个）</span>
          <div class="rope-track">
            <div class="rope-fill" :style="{ width: `${(a / (a + b)) * 100}%` }" />
          </div>
          <span class="rope-val">{{ mix.fraction1 }} × {{ n }} = {{ toFixed2(mix.each[0]) }} 米</span>
        </div>
        <div class="rope-row">
          <span class="rope-label">第二种（{{ b }}/{{ a + b }} 米/个）</span>
          <div class="rope-track">
            <div class="rope-fill alt" :style="{ width: `${(b / (a + b)) * 100}%` }" />
          </div>
          <span class="rope-val">{{ mix.fraction2 }} × {{ n }} = {{ toFixed2(mix.each[1]) }} 米</span>
        </div>
      </div>
      <div class="methods">
        <p class="method">解法一（分别算）：{{ mix.method1 }} 米</p>
        <p class="method alt">解法二（先合再乘）：{{ mix.method2 }} 米</p>
      </div>
      <div class="rope-join">
        <UButton
          size="xs"
          color="primary"
          variant="soft"
          class="rope-join-toggle"
          @click="fracJoinOpen = !fracJoinOpen" data-act>
          {{ fracJoinOpen ? '收起「1 米彩绳从哪来」' : '「1 米彩绳从哪来」：把两条分率拼成整根 1 米' }}
        </UButton>
        <template v-if="fracJoinOpen">
          <div class="rope-track join" aria-label="两条分率拼成整根 1 米">
            <div class="rope-fill seg-first" :style="{ width: `${fracJoinWidths.first}%` }">
              {{ mix.fraction1 }} 米
            </div>
            <div class="rope-fill alt seg-second" :style="{ width: `${fracJoinWidths.second}%` }">
              {{ mix.fraction2 }} 米
            </div>
          </div>
          <p class="join-note">
            把整根彩绳看作 1 米：{{ mix.fraction1 }} + {{ mix.fraction2 }} = 1，
            所以 {{ fracJoinExpr }}
          </p>
        </template>
      </div>
      <p class="verify-line">
        ✓ 两种解法结果相同，都是 <b>{{ toFixed2(mix.total) }} 米</b>：{{ mix.fraction1 }} + {{ mix.fraction2 }} = 1（各做一个共用 1 米），
        所以 ({{ mix.fraction1 }} + {{ mix.fraction2 }}) × {{ n }} = 1 × {{ n }}；乘法分配律对分数同样适用
      </p>
    </template>

    <!-- 估算购物 -->
    <template v-else-if="kind === 'estimate-shop'">
      <div class="shop">
        <p class="shop-title">妈妈带 {{ budget }} 元</p>
        <div class="goods-list">
          <span v-for="g in goods" :key="g.name" class="good-chip">
            {{ g.name }} {{ g.price }} 元{{ g.n > 1 ? ` ×${g.n}` : '' }}
          </span>
        </div>
        <div class="method-cards">
          <div class="method-card">
            <p class="method-title">估大法（看最少剩多少）</p>
            <p class="method-expr">{{ budget }} - 20 - 31×2 = {{ toFixed2(est.leftHigh) }} 元</p>
            <div class="money-bar">
              <span class="money-spent" :style="{ width: barPct(est.spendHigh) }">已花 {{ est.spendHigh }} 元</span>
              <span class="money-left" :style="{ width: barPct(est.leftHigh) }">剩 {{ toFixed2(est.leftHigh) }}</span>
            </div>
          </div>
          <div class="method-card alt">
            <p class="method-title">估小法（看最多剩多少）</p>
            <p class="method-expr">{{ budget }} - 19 - 30×2 = {{ toFixed2(est.leftLow) }} 元</p>
            <div class="money-bar">
              <span class="money-spent" :style="{ width: barPct(est.spendLow) }">已花 {{ est.spendLow }} 元</span>
              <span class="money-left" :style="{ width: barPct(est.leftLow) }">剩 {{ toFixed2(est.leftLow) }}</span>
            </div>
          </div>
        </div>
        <div class="verdict-cards">
          <div v-for="v in verdicts" :key="v.name" class="verdict-card" :class="v.verdict">
            <p class="verdict-name">{{ v.name }} {{ v.price }} 元</p>
            <p class="verdict-text">{{ VERDICT_TEXT[v.verdict] }}</p>
            <p class="verdict-why">
              {{ v.verdict === 'definitely' ? `最少剩 ${toFixed2(est.leftHigh)} ≥ ${v.price}` : v.verdict === 'never' ? `最多剩 ${toFixed2(est.leftLow)} < ${v.price}` : `${toFixed2(est.leftHigh)} ~ ${toFixed2(est.leftLow)} 之间` }}
            </p>
          </div>
        </div>
        <div class="crit-box">
          <p class="crit-title">推到临界值看结论翻转（最少剩 = 价钱 的那一元钱）</p>
          <div class="crit-actions">
            <UButton
              v-for="c in criticalButtons"
              :key="c.key"
              size="xs"
              variant="soft"
              :class="`crit-btn ${c.key}`"
              :data-act="c.key === 'flour-def' ? '' : null"
              @click="pushBudgetTo(c.target)"
            >
              {{ c.label }}
            </UButton>
          </div>
          <p class="crit-note">
            当前预算 {{ budget }} 元：最少剩 {{ toFixed2(est.leftHigh) }} 元、最多剩 {{ toFixed2(est.leftLow) }} 元
          </p>
        </div>
        <p class="verify-line">
          ✓ 估大法得到<b>最少</b>剩 {{ toFixed2(est.leftHigh) }} 元 → 与面粉 {{ FLOUR_PRICE }} 元相比：{{ VERDICT_TEXT[verdicts[0]!.verdict] }}；
          估小法得到<b>最多</b>剩 {{ toFixed2(est.leftLow) }} 元 → 与大米 {{ RICE_PRICE }} 元相比：{{ VERDICT_TEXT[verdicts[1]!.verdict] }}
        </p>
      </div>
    </template>

    <!-- 分段计费 -->
    <template v-else>
      <div class="taxi">
        <p class="shop-title">出租车：3 千米内 10 元，超出每千米 2.2 元</p>
        <div class="km-track">
          <div class="km-line">
            <div class="km-zone base" :style="{ width: `${(3 / MAX_KM) * 100}%` }">起步 3km</div>
            <div class="km-zone extra" :style="{ width: `${Math.min(km, MAX_KM) > 3 ? ((Math.min(km, MAX_KM) - 3) / MAX_KM) * 100 : 0}%` }">超出</div>
          </div>
          <div class="km-marker" :style="{ left: `${(Math.min(km, MAX_KM) / MAX_KM) * 100}%` }">📍{{ toFixed2(km) }}km</div>
        </div>
        <div class="fee-box">
          <p class="method-expr">
            {{ within ? `不超过 ${pw.baseKm} 千米，只收起步价` : `超出 ${toFixed2(km - pw.baseKm)} 千米 → 按 ${pw.extraKm} 千米计费` }}
          </p>
          <div class="fee-bar" aria-label="车费构成">
            <div class="fee-part base" :style="{ width: baseFeePct }">起步价 10 元</div>
            <div v-if="!within" class="fee-part extra" :style="{ width: `calc(100% - ${baseFeePct})` }">
              超出 {{ pw.extraKm }}×2.2 = {{ toFixed2(pw.extraFee) }} 元
            </div>
          </div>
          <p class="method-expr">车费 = 10 {{ within ? '' : `+ ${pw.extraKm} × 2.2` }} = <b>{{ toFixed2(fee) }} 元</b></p>
        </div>
        <div class="pw-steps" aria-label="逐段计费步进">
          <div class="pw-step-head">
            <span class="pw-step-count">逐段计费：第 {{ pwStep }} / {{ PW_MAX_STEP }} 步</span>
            <UButton size="xs" variant="soft" :disabled="pwStep <= 1" @click="pwStep -= 1">上一步</UButton>
            <UButton size="xs" color="primary" variant="soft" :disabled="pwStep >= PW_MAX_STEP" @click="pwStep += 1">下一步</UButton>
          </div>
          <ol class="pw-step-list">
            <li
              v-for="(s, i) in pwVisibleSteps"
              :key="s.title"
              class="pw-step"
              :class="{ current: i === pwStep - 1 }"
            >
              <span class="pw-step-title">{{ s.title }}</span>
              <span class="pw-step-detail">{{ s.detail }}</span>
            </li>
          </ol>
        </div>
        <p class="verify-line">
          ✓ {{ toFixed2(km) }} 千米：{{ within ? `${pw.baseKm} 千米内收起步价 10 元` : `起步价 10 元 + ${pw.extraKm} 千米 × 2.2 元 = ${toFixed2(fee)} 元` }}<template v-if="pw.roundedUp">（{{ toFixed2(km - pw.baseKm) }} 千米不足 1 千米，按 {{ pw.extraKm }} 千米计算）</template>
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mix-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.money-bar,
.fee-bar {
  display: flex;
  width: 100%;
  height: 1.5rem;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid var(--ui-border);
}
.money-spent,
.fee-part.base {
  background: color-mix(in srgb, var(--ui-primary) 40%, white);
  color: var(--ui-text-highlighted);
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
}
.money-left {
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 35%, white);
  color: #92400e;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.fee-part.extra {
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 40%, white);
  color: #92400e;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
}
.verdict-cards {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.verdict-card {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.35rem 0.7rem;
  min-width: 9rem;
  text-align: center;
}
.verdict-card.definitely {
  border-color: #16a34a;
  background: color-mix(in srgb, #16a34a 10%, transparent);
}
.verdict-card.never {
  border-color: #dc2626;
  background: color-mix(in srgb, #dc2626 10%, transparent);
}
.verdict-card.maybe {
  border-color: var(--ui-warning, #f59e0b);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 12%, transparent);
}
.verdict-name {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.verdict-text {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.verdict-why {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  max-width: 44rem;
}
.rope-bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
  max-width: 560px;
}
.rope-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.rope-label {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.rope-track {
  height: 1.1rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  overflow: hidden;
}
.rope-fill {
  height: 100%;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border-radius: 9999px;
}
.rope-fill.alt {
  background: color-mix(in srgb, var(--ui-primary) 25%, white);
}
.rope-val {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.methods {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  max-width: 560px;
}
.method {
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  text-align: center;
  font-family: ui-monospace, monospace;
}
.method.alt {
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.method b {
  color: var(--ui-primary);
}
.shop {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  width: 100%;
  max-width: 588px;
}
.shop-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.goods-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.good-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  padding: 0.25rem 0.7rem;
  font-size: 0.85rem;
}
.method-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  width: 100%;
}
.method-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 0.8rem;
  text-align: center;
}
.method-card.alt {
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.method-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.method-expr {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  margin-top: 0.25rem;
}
.method-expr b {
  color: var(--ui-primary);
}
.method-result {
  font-size: 0.85rem;
  margin-top: 0.3rem;
  font-weight: 700;
}
.taxi {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 616px;
}
.km-track {
  position: relative;
  width: 100%;
}
.km-line {
  display: flex;
  height: 2.2rem;
  border-radius: 0.6rem;
  overflow: hidden;
}
.km-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: white;
  font-weight: 700;
}
.km-zone.base {
  background: var(--ui-primary);
  flex-shrink: 0;
}
.km-zone.extra {
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  color: var(--ui-text-highlighted);
}
.km-marker {
  position: absolute;
  top: 2.5rem;
  transform: translateX(-50%);
  font-size: 0.85rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.fee-box {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.7rem 1.2rem;
  text-align: center;
}
/* 逐段计费步进 */
.pw-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.pw-step-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.pw-step-count {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.pw-step-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.pw-step {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.4rem 0.7rem;
}
.pw-step.current {
  border-color: var(--ui-warning, #f59e0b);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 10%, var(--ui-bg));
}
.pw-step-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.pw-step-detail {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
/* 「1 米彩绳从哪来」：两条分率拼成整根 */
.rope-join {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
  max-width: 560px;
}
.rope-track.join {
  display: flex;
  height: 1.6rem;
}
.rope-track.join .rope-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  border-radius: 0;
  white-space: nowrap;
  overflow: hidden;
}
.rope-track.join .rope-fill.seg-first {
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}
.rope-track.join .rope-fill.seg-second {
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}
.join-note {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  text-align: center;
  font-family: ui-monospace, monospace;
}
/* 估算购物：推到临界值 */
.crit-box {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  align-items: center;
  width: 100%;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 0.8rem;
}
.crit-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.crit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}
.crit-note {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
</style>
