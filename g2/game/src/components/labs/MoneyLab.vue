<script setup lang="ts">
/**
 * 人民币 Lab：认识人民币面额 / 购物付钱与找零
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { changeOf, exchangeYuan } from '@/lib/labs/process'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()
const emit = defineEmits<{ acted: [] }>()

const kind = computed(() => props.lab.kind)
const list = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------- 认识人民币 ---------- */
const DENOMS = [
  { name: '1 元', note: '1 元 = 10 角', icon: '💴', bills: 10, coin: '角' },
  { name: '1 角', note: '1 角 = 10 分', icon: '🪙', bills: 10, coin: '分' },
  { name: '5 元', note: '5 元 = 5 个 1 元', icon: '💵', bills: 5, coin: '元' },
  { name: '10 元', note: '10 元 = 10 个 1 元', icon: '💵', bills: 10, coin: '元' },
  { name: '100 元', note: '100 元 = 10 个 10 元', icon: '💯', bills: 10, coin: '元' },
  { name: '50 元', note: '50 元 = 5 个 10 元', icon: '💵', bills: 5, coin: '元' },
]
const sel = computed(() => Math.round(props.values.sel ?? 0) % DENOMS.length)
const denom = computed(() => DENOMS[sel.value]!)

/* ---------- 购物找零 ---------- */
const price = computed(() => props.values.price ?? 6)
const paid = computed(() => props.values.paid ?? 10)
const changeInfo = computed(() => changeOf(price.value, paid.value))
const change = computed(() => changeInfo.value.change)
const enough = computed(() => changeInfo.value.enough)

/* ---------- 过程态 ---------- */
/** 认识人民币：数到第几张（0 = 全部摆好） */
const counted = ref(0)
const doingCount = computed(() => counted.value > 0)
const curCount = computed(() => (doingCount.value ? counted.value : denom.value.bills))
/** 换钱：把 k 张 1 元换成 10k 个 1 角 */
const exchanged = ref(0)
const ex = computed(() => exchangeYuan(denom.value.bills, exchanged.value))
/** 购物：付钱 3 步 */
const step = ref(0)
const doingShop = computed(() => step.value > 0)
const shopSay = computed(() => {
  if (step.value === 1) return `先看价格：这件商品 ${price.value} 元`
  if (step.value === 2) return `再数付出的钱：付了 ${paid.value} 元`
  if (step.value === 3)
    return enough.value
      ? `最后找零：${paid.value} − ${price.value} = ${change.value} 元`
      : `钱不够：还差 ${changeInfo.value.short} 元`
  return ''
})
function nextStep() {
  step.value = step.value >= 3 ? 0 : step.value + 1
  if (step.value > 0) emit('acted')
}
function nextCount() {
  counted.value = counted.value >= denom.value.bills ? 0 : counted.value + 1
  if (counted.value > 0) emit('acted')
}
function doExchange() {
  exchanged.value = exchanged.value >= denom.value.bills ? 0 : exchanged.value + 1
  if (exchanged.value > 0) emit('acted')
}
watch([sel, price, paid, kind], () => {
  counted.value = 0
  exchanged.value = 0
  step.value = 0
})
</script>

<template>
  <div class="money-wrap">
    <!-- 认识人民币 -->
    <template v-if="kind === 'money'">
      <div class="denom-grid">
        <button
          v-for="(d, i) in DENOMS"
          :key="d.name"
          class="denom-btn"
          :class="{ on: i === sel }"
          type="button"
        >
          {{ d.icon }} {{ d.name }}
        </button>
      </div>
      <div class="bill-line">
        <span
          v-for="n in list(denom.bills)"
          :key="n"
          class="bill"
          :class="{ dim: doingCount && n > curCount }"
          :data-lit="!doingCount || n <= curCount"
        >{{ denom.icon }}</span>
      </div>
      <p class="note">{{ denom.note }}</p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="money-next" @click="nextCount">数一张</button>
        <span class="step-say" data-test="money-say">
          {{
            doingCount
              ? `数到第 ${curCount} 张：${curCount} 个 ${denom.name}`
              : `点「数一张」，一张一张数出 ${denom.bills} 个 ${denom.name}`
          }}
        </span>
      </div>
      <div v-if="sel === 0" class="step-bar">
        <button type="button" class="step-btn" data-test="money-exchange" @click="doExchange">换一换</button>
        <span class="step-say" data-test="money-exchange-say">
          {{ exchanged > 0 ? ex.say + `（手上还有 ${ex.kept} 张 1 元）` : '点「换一换」：把 1 元换成 10 个 1 角' }}
        </span>
      </div>
    </template>

    <!-- 购物找零 -->
    <template v-else>
      <div class="shop">
        <div class="shop-item">
          <span class="shop-emoji">🧸</span>
          <p class="shop-price">{{ price }} 元</p>
        </div>
        <div class="pay-line">
          <p>付出</p>
          <div class="bill-line">
            <span v-for="n in list(paid)" :key="n" class="bill">💵</span>
          </div>
        </div>
        <p class="shop-result" :class="{ no: !enough, dim: doingShop && step < 3 }">
          {{ enough ? `应找回 ${change} 元` : `钱不够，还差 ${changeInfo.short} 元` }}
        </p>
      </div>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="money-next" @click="nextStep">付钱</button>
        <span class="step-say" data-test="money-say">
          {{ doingShop ? shopSay : '点「付钱」，先看价格、再数付出的钱、最后算找零' }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dim {
  opacity: 0.22;
}
.step-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step-btn {
  border: 1px solid var(--ui-primary);
  background: var(--ui-bg);
  color: var(--ui-primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.22rem 0.9rem;
  cursor: pointer;
}
.step-say {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  max-width: 24rem;
  line-height: 1.4;
}
.money-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.denom-grid {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.denom-btn {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
  padding: 0.35rem 0.7rem;
  font-size: 0.9rem;
  cursor: pointer;
}
.denom-btn.on {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.bill-line {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.8rem;
  background: var(--ui-bg-muted);
  max-width: 34rem;
}
.bill {
  font-size: 1.25rem;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
}
.note {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-primary);
}
.shop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}
.shop-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 0.6rem 1.2rem;
}
.shop-emoji {
  font-size: 2rem;
}
.shop-price {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.pay-line {
  text-align: center;
  font-size: 0.9rem;
  color: var(--ui-text-muted);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
}
.shop-result {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.shop-result.no {
  color: var(--ui-error, #dc2626);
}
</style>
