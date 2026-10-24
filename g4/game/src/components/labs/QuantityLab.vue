<script setup lang="ts">
/**
 * 乘法数量关系 Lab：乘法意义 / 总价=单价×数量 / 路程=速度×时间 / 归一 / 旅游费用
 *
 * 本轮（第 4 轮）改动：
 * - 路程题不再用 `min(300, 米×2.2)` 的封顶比例尺（一超过 136 米就"走不动了"，
 *   图与数值脱钩）。现在**每分钟画一段**，每段长度相同、段数就是分钟数，
 *   点"试一试：走 1 分钟"就真的多走一段（L0 比例 + L3 过程）。
 * - 归一题原来把"3 本 18 元"写死在文字里，改单价参数后文字就和算式矛盾；
 *   现在由单价算出，图和数始终一致。
 * - 四块都补了过程按钮：一组一组数 / 一个一个买 / 一项一项算。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 乘法意义 ---------- */
const groups = computed(() => Math.round(props.values.groups ?? 3))
const per = computed(() => Math.round(props.values.per ?? 4))
const shownGroups = ref(groups.value)
function nextGroup() {
  shownGroups.value = shownGroups.value >= groups.value ? 1 : shownGroups.value + 1
}

/* ---------- 总价 ---------- */
const price = computed(() => props.values.price ?? 8)
const count = computed(() => Math.round(props.values.count ?? 3))
const total = computed(() => price.value * count.value)
const shownCount = ref(count.value)
function nextItem() {
  shownCount.value = shownCount.value >= count.value ? 1 : shownCount.value + 1
}
const itemPx = computed(() => (count.value > 10 ? 34 : 46))

/* ---------- 路程 ---------- */
const v = computed(() => props.values.v ?? 70)
const t = computed(() => Math.round(props.values.t ?? 4))
const dist = computed(() => v.value * t.value)
/** 过程态：已经走了几分钟（每一分钟 = 一段路） */
const walked = ref(t.value)
function walkOneMinute() {
  walked.value = walked.value >= t.value ? 1 : walked.value + 1
}
/** 每段的像素长度：固定画布内按"分钟数"均分，段长恒定，段数 = 分钟数 */
const ROAD_X0 = 30
const ROAD_W = 320
const segPx = computed(() => ROAD_W / Math.max(t.value, 1))
const roadTicks = computed(() => Array.from({ length: t.value + 1 }, (_, i) => i))

/* ---------- 归一 ---------- */
const unitPrice = computed(() => props.values.price ?? 6)
const buyCount = computed(() => Math.round(props.values.count ?? 5))
/** 题里的已知条件：3 本一共多少钱（由单价算，不能写死） */
const packCount = 3
const packTotal = computed(() => packCount * unitPrice.value)
/** 过程态：先求单价，再求总价（原来这一题只有文字，没有任何可点的过程） */
const solveStep = ref(2)
function nextSolve() {
  solveStep.value = solveStep.value >= 2 ? 1 : solveStep.value + 1
}

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
const planItems = computed(() => [
  { icon: '🚄', label: '交通', expr: `${transport.value} × ${person.value} = ${tCost.value} 元` },
  { icon: '🎫', label: '门票', expr: `${ticket.value} × ${person.value} = ${tiCost.value} 元` },
  { icon: '🏨', label: '住宿', expr: `${hotel.value} × ${days.value} = ${hCost.value} 元` },
  { icon: '🍚', label: '餐费(估)', expr: `80 × ${person.value} × ${days.value} ≈ ${food.value} 元` },
])
const planStep = ref(4)
function nextPlan() {
  planStep.value = planStep.value >= 4 ? 0 : planStep.value + 1
}
function showPlan() {
  planStep.value = 4
}
const planSum = computed(() => planItems.value.slice(0, planStep.value).reduce((acc, _, i) => acc + [tCost.value, tiCost.value, hCost.value, food.value][i]!, 0))
</script>

<template>
  <div class="qty-wrap">
    <!-- 乘法意义 -->
    <template v-if="kind === 'mul-meaning'">
      <div class="group-rows">
        <div v-for="g in groups" :key="g" class="group-row" :class="{ dim: g > shownGroups }">
          <span v-for="i in per" :key="i" class="dot" />
          <span class="group-count">{{ per }}</span>
        </div>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="qty-next" @click="nextGroup">
          试一试：一组一组地数（已数 {{ shownGroups }} / {{ groups }} 组）
        </button>
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
        <div
          v-for="i in count"
          :key="i"
          class="item-box"
          :class="{ dim: i > shownCount }"
          :style="{ width: itemPx + 'px' }"
        >
          <span class="item-icon">🖊️</span>
          <span class="item-price">{{ price }}</span>
        </div>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="qty-next" @click="nextItem">
          试一试：一个一个地买（已买 {{ shownCount }} / {{ count }} 支）
        </button>
      </div>
      <div class="formula-row">
        <span class="chip">单价 {{ price }} 元</span>
        <span class="chip">数量 {{ count }} 支</span>
        <span class="chip op" data-test="qty-total">总价 = {{ price }} × {{ count }} = {{ total }} 元</span>
      </div>
    </template>

    <!-- 路程 -->
    <template v-else-if="kind === 'mul-distance'">
      <svg viewBox="0 0 380 220" class="road-svg">
        <line :x1="ROAD_X0" y1="150" :x2="ROAD_X0 + ROAD_W" y2="150" class="road" />
        <!-- 每分钟一个刻度，段长恒定 -->
        <g v-for="k in roadTicks" :key="'t' + k">
          <line
            :x1="ROAD_X0 + k * segPx"
            :y1="144"
            :x2="ROAD_X0 + k * segPx"
            :y2="158"
            :class="k <= walked ? 'road-mark on' : 'road-mark'"
          />
          <text :x="ROAD_X0 + k * segPx" y="176" text-anchor="middle" class="tick-num">{{ k }}</text>
        </g>
        <!-- 已经走的部分 -->
        <line :x1="ROAD_X0" y1="150" :x2="ROAD_X0 + walked * segPx" y2="150" class="road-passed" />
        <g :style="{ transform: `translate(${ROAD_X0 + walked * segPx - 14}px, 0)`, transition: 'transform .35s' }">
          <text x="0" y="126" font-size="30">🚶</text>
        </g>
        <text :x="ROAD_X0 + walked * segPx" :y="112" text-anchor="middle" class="dist-label">
          已走 {{ walked }} 分钟 = {{ walked * v }} 米
        </text>
        <text x="20" y="200" class="dim-label">每分钟走 {{ v }} 米（一段 = 1 分钟 = {{ v }} 米），共 {{ t }} 段</text>
      </svg>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="walk-next" @click="walkOneMinute">
          试一试：走 1 分钟（{{ walked }} / {{ t }} 分钟）
        </button>
      </div>
      <div class="formula-row">
        <span class="chip">每段 {{ v }} 米 × {{ t }} 段</span>
        <span class="chip op" data-test="dist-total">路程 = 速度 × 时间 = {{ v }} × {{ t }} = {{ dist }} 米</span>
      </div>
    </template>

    <!-- 归一 -->
    <template v-else-if="kind === 'mul-solve'">
      <div class="notebook-row">
        <span class="nb-box">笔记本 × {{ packCount }}</span>
        <span class="nb-price">一共 {{ packTotal }} 元</span>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="solve-next" @click="nextSolve">
          试一试：先求单价，再求总价（第 {{ solveStep }} / 2 步）
        </button>
        <button type="button" class="op-btn ghost" data-test="solve-reset" @click="solveStep = 2">重来</button>
      </div>
      <div class="formula-row">
        <span class="chip" :class="{ dim: solveStep < 1 }">
          ① 单价 = {{ packTotal }} ÷ {{ packCount }} = {{ unitPrice }} 元/本
        </span>
        <span class="chip op" :class="{ dim: solveStep < 2 }" data-test="solve-total">
          ② {{ unitPrice }} × {{ buyCount }} = {{ unitPrice * buyCount }} 元
        </span>
      </div>
      <p class="note">
        单价不变：先求单价 {{ packTotal }} ÷ {{ packCount }} = {{ unitPrice }}（元），再求买 {{ buyCount }} 本的总价
        {{ unitPrice }} × {{ buyCount }} = <b>{{ unitPrice * buyCount }}</b> 元
      </p>
    </template>

    <!-- 旅游计划 -->
    <template v-else>
      <div class="plan-cards">
        <div
          v-for="(item, i) in planItems"
          :key="item.label"
          class="plan-card"
          :class="{ dim: i >= planStep }"
        >
          <p class="plan-icon">{{ item.icon }}</p>
          <p class="plan-label">{{ item.label }}</p>
          <p class="plan-num">{{ item.expr }}</p>
        </div>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="plan-next" @click="nextPlan">
          试一试：一项一项算（已算 {{ planStep }} / 4 项，合计 {{ planSum }} 元）
        </button>
        <button type="button" class="op-btn ghost" data-test="plan-all" @click="showPlan">全部算完</button>
      </div>
      <div class="formula-row">
        <span class="chip op" data-test="plan-total">{{ person }} 人 {{ days }} 天 合计 {{ planTotal }} 元</span>
      </div>
      <p class="note">交通、门票按人数算；住宿、餐费按天数算；最后把四项加起来。</p>
    </template>
  </div>
</template>

<style scoped>
.qty-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.group-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.group-row {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
}
.dim {
  opacity: 0.3;
}
.group-count {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.dot {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border: 1px solid var(--ui-primary);
}
.item-rows {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 40rem;
}
.item-box {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.3rem;
  text-align: center;
}
.item-icon {
  font-size: 1rem;
  display: block;
}
.item-price {
  font-size: 0.68rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.road-svg {
  width: 100%;
  max-width: 32rem;
}
.road {
  stroke: var(--ui-border-accented);
  stroke-width: 3;
}
.road-passed {
  stroke: var(--ui-primary);
  stroke-width: 4;
  stroke-linecap: round;
}
.road-mark {
  stroke: var(--ui-text-muted);
  stroke-width: 1;
}
.road-mark.on {
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.tick-num {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.dist-label,
.dim-label {
  fill: var(--ui-text-toned);
  font-size: 10px;
  font-weight: 700;
}
.op-bar {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.op-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.op-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.op-btn.ghost {
  color: var(--ui-text-muted);
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
  max-width: 38rem;
}
.note b {
  color: var(--ui-primary);
}
.notebook-row {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}
.nb-box {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.4rem 0.9rem;
  font-weight: 700;
}
.nb-price {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.plan-cards {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.plan-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.8rem;
  text-align: center;
  min-width: 7rem;
}
.plan-icon {
  font-size: 1.2rem;
}
.plan-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.plan-num {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-primary);
}
</style>
