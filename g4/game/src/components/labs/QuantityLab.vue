<script setup lang="ts">
/**
 * 乘法数量关系 Lab：乘法意义 / 总价=单价×数量 / 路程=速度×时间 / 归一 / 旅游费用
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 乘法意义 ---------- */
const groups = computed(() => Math.round(props.values.groups ?? 3))
const per = computed(() => Math.round(props.values.per ?? 4))

/* ---------- 总价 ---------- */
const price = computed(() => props.values.price ?? 8)
const count = computed(() => Math.round(props.values.count ?? 3))
const total = computed(() => price.value * count.value)

/* ---------- 路程 ---------- */
const v = computed(() => props.values.v ?? 70)
const t = computed(() => Math.round(props.values.t ?? 4))
const dist = computed(() => v.value * t.value)

/* ---------- 归一 ---------- */
const unitPrice = computed(() => props.values.price ?? 6)
const buyCount = computed(() => Math.round(props.values.count ?? 5))

/* ---------- 旅游计划 ---------- */
const person = computed(() => Math.round(props.values.person ?? 3))
const transport = computed(() => props.values.transport ?? 400)
const ticket = computed(() => props.values.ticket ?? 150)
const hotel = computed(() => props.values.hotel ?? 300)
const days = computed(() => Math.round(props.values.days ?? 2))
const tCost = computed(() => transport.value * person.value)
const tiCost = computed(() => ticket.value * person.value)
const hCost = computed(() => hotel.value * days.value)
const food = computed(() => 80 * person.value * days.value)
const planTotal = computed(() => tCost.value + tiCost.value + hCost.value + food.value)
</script>

<template>
  <div class="qty-wrap">
    <!-- 乘法意义 -->
    <template v-if="kind === 'mul-meaning'">
      <div class="group-rows">
        <div v-for="g in groups" :key="g" class="group-row">
          <span v-for="i in per" :key="i" class="dot" />
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">{{ per }} + {{ per }} + … + {{ per }}（{{ groups }} 组）</span>
        <span class="chip op">{{ per }} × {{ groups }} = {{ per * groups }}</span>
      </div>
      <p class="note">求 {{ groups }} 个 {{ per }} 相加的和，用<b>乘法</b>计算比较简便</p>
    </template>

    <!-- 总价 -->
    <template v-else-if="kind === 'mul-total'">
      <div class="item-rows">
        <div v-for="i in Math.min(count, 12)" :key="i" class="item-box">
          <span class="item-icon">🖊️</span>
          <span class="item-price">{{ price }} 元</span>
        </div>
        <span v-if="count > 12" class="item-more">…共 {{ count }} 个</span>
      </div>
      <div class="formula-row">
        <span class="chip">单价 {{ price }} 元</span>
        <span class="chip">数量 {{ count }}</span>
        <span class="chip op">总价 = {{ price }} × {{ count }} = {{ total }} 元</span>
      </div>
    </template>

    <!-- 路程 -->
    <template v-else-if="kind === 'mul-distance'">
      <svg viewBox="0 0 380 220" class="w-full">
        <line x1="24" y1="150" x2="356" y2="150" class="road" />
        <line v-for="i in 12" :key="i" :x1="24 + i * 28" :y1="150" :x2="24 + i * 28" :y2="158" class="road-mark" />
        <g :style="{ transform: `translate(${Math.min(300, dist * 2.2)}px, 0)`, transition: 'transform .5s' }">
          <text x="0" y="126" font-size="36">🚶</text>
        </g>
        <text x="20" y="120" class="dim-label">0</text>
        <text :x="24 + Math.min(300, dist * 2.2)" :y="112" text-anchor="end" class="dist-label">
          {{ dist }} 米
        </text>
        <text x="20" y="186" class="dim-label">每分钟走 {{ v }} 米（{{ v }} 米/分）</text>
        <text x="20" y="206" class="dim-label">走了 {{ t }} 分钟</text>
      </svg>
      <div class="formula-row">
        <span class="chip op">路程 = 速度 × 时间 = {{ v }} × {{ t }} = {{ dist }} 米</span>
      </div>
    </template>

    <!-- 归一 -->
    <template v-else-if="kind === 'mul-solve'">
      <div class="notebook-row">
        <span class="nb-box">笔记本 × {{ buyCount }}</span>
        <span class="nb-price">单价 {{ unitPrice }} 元</span>
      </div>
      <div class="formula-row">
        <span class="chip">3 本 18 元 → 单价 {{ unitPrice }} 元/本</span>
        <span class="chip op">{{ unitPrice }} × {{ buyCount }} = {{ unitPrice * buyCount }} 元</span>
      </div>
      <p class="note">笔记本单价不变，先求单价，再求买 {{ buyCount }} 本的总价</p>
    </template>

    <!-- 旅游计划 -->
    <template v-else>
      <div class="plan-cards">
        <div class="plan-card">
          <p class="plan-icon">🚄</p>
          <p class="plan-label">交通</p>
          <p class="plan-num">{{ transport }} × {{ person }} = {{ tCost }} 元</p>
        </div>
        <div class="plan-card">
          <p class="plan-icon">🎫</p>
          <p class="plan-label">门票</p>
          <p class="plan-num">{{ ticket }} × {{ person }} = {{ tiCost }} 元</p>
        </div>
        <div class="plan-card">
          <p class="plan-icon">🏨</p>
          <p class="plan-label">住宿</p>
          <p class="plan-num">{{ hotel }} × {{ days }} = {{ hCost }} 元</p>
        </div>
        <div class="plan-card">
          <p class="plan-icon">🍚</p>
          <p class="plan-label">餐费(估)</p>
          <p class="plan-num">≈ {{ food }} 元</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip op">{{ person }} 人 × {{ days }} 天 ≈ 合计 {{ planTotal }} 元</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.qty-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.group-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.group-row {
  display: flex;
  gap: 0.45rem;
  justify-content: center;
}
.dot {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border: 1px solid var(--ui-primary);
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
}
.note b {
  color: var(--ui-primary);
}
.item-rows {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 588px;
}
.item-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg-muted);
  padding: 0.3rem 0.5rem;
}
.item-icon {
  font-size: 1.2rem;
}
.item-price {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.item-more {
  align-self: center;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.road {
  stroke: var(--ui-text-muted);
  stroke-width: 4;
}
.road-mark {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
}
.dim-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.dist-label {
  font-size: 14px;
  fill: var(--ui-primary);
  font-weight: 800;
}
.notebook-row {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}
.nb-box {
  border: 1px solid var(--ui-primary);
  border-radius: var(--ui-radius-md);
  padding: 0.35rem 0.8rem;
  font-weight: 700;
  color: var(--ui-primary);
}
.nb-price {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}
.plan-cards {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.plan-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 0.9rem;
  min-width: 86px;
}
.plan-icon {
  font-size: 1.4rem;
}
.plan-label {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.plan-num {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
</style>
