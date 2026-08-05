<script setup lang="ts">
/**
 * 人民币 Lab：认识人民币面额 / 购物付钱与找零
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

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
const change = computed(() => paid.value - price.value)
const enough = computed(() => change.value >= 0)
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
        <span v-for="n in list(denom.bills)" :key="n" class="bill">{{ denom.icon }}</span>
      </div>
      <p class="note">{{ denom.note }}</p>
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
        <p class="shop-result" :class="{ no: !enough }">
          {{ enough ? `应找回 ${change} 元` : `钱不够，还差 ${-change} 元` }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
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
  max-width: 24rem;
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
