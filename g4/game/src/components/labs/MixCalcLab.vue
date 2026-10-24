<script setup lang="ts">
/**
 * 混合运算 Lab：三步混合（先乘除后加减）/ 含括号
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 三步混合 ---------- */
const c = computed(() => Math.round(props.values.calligraphy ?? 18))
const t = computed(() => Math.round(props.values.times ?? 2))
const less = computed(() => Math.round(props.values.less ?? 6))
const paint = computed(() => c.value * t.value)
const sum = computed(() => c.value + paint.value)
const choir = computed(() => sum.value - less.value)

/* ---------- 括号 ---------- */
const money = computed(() => props.values.money ?? 600)
const plane = computed(() => props.values.plane ?? 126)
const pcount = computed(() => Math.round(props.values.pcount ?? 4))
const ship = computed(() => props.values.ship ?? 48)
const planeCost = computed(() => plane.value * pcount.value)
const rest = computed(() => money.value - planeCost.value)
const n = computed(() => Math.floor(rest.value / ship.value))

/**
 * 过程态：一步一步算（先乘除后加减；有括号先算括号）
 * 原来三条算式一次全写出来，学生没有可点的过程（L3）。
 */
const stepTexts = computed<string[]>(() =>
  kind.value === 'mix-three'
    ? [
        `先算乘法：绘画 = ${c.value} × ${t.value} = ${paint.value}（人）`,
        `再算加法：书法 + 绘画 = ${c.value} + ${paint.value} = ${sum.value}（人）`,
        `最后算减法：${sum.value} − ${less.value} = ${choir.value}（人）`,
      ]
    : [
        `先算小括号里的乘法：飞机模型 ${plane.value} × ${pcount.value} = ${planeCost.value}（元）`,
        `再算减法：剩下 ${money.value} − ${planeCost.value} = ${rest.value}（元）`,
        `最后算除法：${rest.value} ÷ ${ship.value} = ${n.value}（个）`,
      ],
)
const step = ref(0)
const maxStep = computed(() => stepTexts.value.length)
function nextStep() {
  step.value = Math.min(step.value + 1, maxStep.value)
}
function resetStep() {
  step.value = 0
}
</script>

<template>
  <div class="mix-wrap">
    <!-- 三步混合：合唱组 -->
    <template v-if="kind === 'mix-three'">
      <div class="bar-chart">
        <div class="bar-item">
          <div class="bar" :style="{ height: (c / Math.max(1, sum) * 120) + 'px' }" />
          <p class="bar-label">书法 {{ c }}</p>
        </div>
        <div class="bar-item">
          <div class="bar paint" :style="{ height: (paint / Math.max(1, sum) * 120) + 'px' }" />
          <p class="bar-label">绘画 {{ paint }}</p>
        </div>
        <div class="bar-item">
          <div class="bar choir" :style="{ height: (choir / Math.max(1, sum) * 120) + 'px' }" />
          <p class="bar-label">合唱 {{ choir }}</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">绘画 = {{ c }} × {{ t }} = {{ paint }}</span>
        <span class="chip">合唱 = {{ c }} + {{ paint }} − {{ less }}</span>
        <span class="chip op">{{ choir }} 人</span>
      </div>
      <p class="note">没有括号：先算<b>乘除法</b>，再算<b>加减法</b></p>
      <div class="step-bar">
        <button type="button" class="op-btn primary" data-test="mix-next" :disabled="step >= maxStep" @click="nextStep">
          试一试：一步一步算
        </button>
        <button type="button" class="op-btn ghost" data-test="mix-reset" @click="resetStep">重来</button>
        <span class="step-progress" data-test="mix-progress">第 {{ step }} / {{ maxStep }} 步</span>
      </div>
      <div v-if="step > 0" class="step-live" data-test="mix-live">
        <p v-for="(t2, i) in stepTexts.slice(0, step)" :key="i" class="live-line" :class="{ cur: i === step - 1 }">
          {{ t2 }}
        </p>
      </div>
    </template>

    <!-- 括号：买模型 -->
    <template v-else>
      <div class="money-flow">
        <div class="flow-box">
          <p class="flow-label">带的钱</p>
          <p class="flow-num">{{ money }} 元</p>
        </div>
        <span class="flow-op">−</span>
        <div class="flow-box">
          <p class="flow-label">飞机模型 {{ plane }} × {{ pcount }}</p>
          <p class="flow-num">{{ planeCost }} 元</p>
        </div>
        <span class="flow-op">=</span>
        <div class="flow-box">
          <p class="flow-label">剩下</p>
          <p class="flow-num">{{ rest }} 元</p>
        </div>
        <span class="flow-op">÷</span>
        <div class="flow-box result">
          <p class="flow-label">舰船 {{ ship }} 元/个</p>
          <p class="flow-num">{{ n }} 个</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip op">（{{ money }} − {{ plane }} × {{ pcount }}）÷ {{ ship }} = {{ n }}</span>
      </div>
      <p class="note">先算<b>小括号</b>里面的乘法，再算减法，最后算除法</p>
      <div class="step-bar">
        <button type="button" class="op-btn primary" data-test="mix-next" :disabled="step >= maxStep" @click="nextStep">
          试一试：一步一步算
        </button>
        <button type="button" class="op-btn ghost" data-test="mix-reset" @click="resetStep">重来</button>
        <span class="step-progress" data-test="mix-progress">第 {{ step }} / {{ maxStep }} 步</span>
      </div>
      <div v-if="step > 0" class="step-live" data-test="mix-live">
        <p v-for="(t2, i) in stepTexts.slice(0, step)" :key="i" class="live-line" :class="{ cur: i === step - 1 }">
          {{ t2 }}
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
  justify-content: center;
  min-height: 320px;
}
.step-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
.op-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.op-btn.ghost {
  color: var(--ui-text-muted);
}
.step-progress {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.step-live {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-width: 38rem;
}
.live-line {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.live-line.cur {
  color: var(--ui-primary);
  font-weight: 800;
}
.bar-chart {
  display: flex;
  gap: 1.4rem;
  align-items: flex-end;
  height: 150px;
}
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.bar {
  width: 2.4rem;
  border-radius: 6px 6px 0 0;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border: 1px solid var(--ui-primary);
  transition: height 0.4s;
}
.bar.paint {
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
}
.bar.choir {
  background: var(--ui-primary);
}
.bar-label {
  font-size: 0.8rem;
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
}
.note b {
  color: var(--ui-primary);
}
.money-flow {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.flow-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.9rem;
  min-width: 80px;
}
.flow-box.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
}
.flow-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.flow-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.flow-box.result .flow-num {
  color: var(--ui-primary);
}
.flow-op {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-text-muted);
}
</style>
