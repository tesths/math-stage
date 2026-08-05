<script setup lang="ts">
/**
 * 混合运算 Lab：分数四则混合运算 / 估算购物 / 分段计费
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 分数混合运算 · 中国结 ---------- */
const a = computed(() => Math.round(props.values.a ?? 2))
const b = computed(() => Math.round(props.values.b ?? 3))
const n = computed(() => Math.round(props.values.n ?? 18))
const fa = computed(() => (a.value / (a.value + b.value)) * n.value)
const fb = computed(() => (b.value / (a.value + b.value)) * n.value)

/* ---------- 估算购物 ---------- */
const budget = computed(() => props.values.budget ?? 100)
const minLeft = computed(() => budget.value - 20 - 31 * 2)
const maxLeft = computed(() => budget.value - 19 - 30 * 2)
const goods = [
  { name: '鸡蛋', price: 19.6, n: 1 },
  { name: '牛奶', price: 30.4, n: 2 },
  { name: '面粉', price: 16.8, n: 1 },
  { name: '大米', price: 21.6, n: 1 },
]

/* ---------- 分段计费 ---------- */
const km = computed(() => props.values.km ?? 5)
const within = computed(() => km.value <= 3)
const extra = computed(() => (within.value ? 0 : Math.ceil(km.value - 3)))
const fee = computed(() => (within.value ? 10 : 10 + extra.value * 2.2))
const MAX_KM = 20
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
          <span class="rope-val">{{ a }}/{{ a + b }} × {{ n }} = {{ toFixed2(fa) }} 米</span>
        </div>
        <div class="rope-row">
          <span class="rope-label">第二种（{{ b }}/{{ a + b }} 米/个）</span>
          <div class="rope-track">
            <div class="rope-fill alt" :style="{ width: `${(b / (a + b)) * 100}%` }" />
          </div>
          <span class="rope-val">{{ b }}/{{ a + b }} × {{ n }} = {{ toFixed2(fb) }} 米</span>
        </div>
      </div>
      <div class="methods">
        <p class="method">解法一：{{ a }}/{{ a + b }}×{{ n }} + {{ b }}/{{ a + b }}×{{ n }} = {{ toFixed2(fa) }} + {{ toFixed2(fb) }} = <b>{{ n }} 米</b></p>
        <p class="method alt">解法二：({{ a }}/{{ a + b }} + {{ b }}/{{ a + b }}) × {{ n }} = {{ toFixed2(a / (a + b) + b / (a + b)) }} × {{ n }} = <b>{{ n }} 米</b></p>
      </div>
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
            <p class="method-expr">{{ budget }} - 20 - 31×2 = {{ toFixed2(minLeft) }} 元</p>
            <p class="method-result">
              {{ minLeft > 16.8 ? '✅ 最少剩的钱比 16.8 多，够买面粉' : '⚠️ 可能不够买面粉' }}
            </p>
          </div>
          <div class="method-card alt">
            <p class="method-title">估小法（看最多剩多少）</p>
            <p class="method-expr">{{ budget }} - 19 - 30×2 = {{ toFixed2(maxLeft) }} 元</p>
            <p class="method-result">
              {{ maxLeft < 21.6 ? '✅ 最多剩的钱比 21.6 少，不够买大米' : '⚠️ 可能够买大米' }}
            </p>
          </div>
        </div>
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
            {{ within ? '≤ 3 千米' : `超出 ${toFixed2(km - 3)} 千米 → ${extra} 千米` }}
          </p>
          <p class="method-expr">车费 = 10 {{ within ? '' : `+ ${extra} × 2.2` }} = <b>{{ toFixed2(fee) }} 元</b></p>
        </div>
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
.rope-bars {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
  max-width: 400px;
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
  max-width: 400px;
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
  max-width: 420px;
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
  max-width: 440px;
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
</style>
