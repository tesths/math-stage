<script setup lang="ts">
/**
 * 混合运算 Lab：乘加/除加混合运算、小括号的作用
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { OP_SYMBOL, applyOp, toFixed2, type MixOp } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

const isDivAdd = computed(() => props.values.box !== undefined)
const isOrder = computed(() => props.values.a !== undefined && props.values.b !== undefined)

/* 乘加：笔记本 */
const price = computed(() => props.values.price ?? 0)
const count = computed(() => Math.round(props.values.count ?? 1))
const bag = computed(() => props.values.bag ?? 0)

/* 除加：钢笔 */
const box = computed(() => props.values.box ?? 0)
const each = computed(() => Math.round(props.values.each ?? 1))
const stapler = computed(() => props.values.stapler ?? 0)

/* 小括号-顺序对比 */
const a = computed(() => props.values.a ?? 0)
const b = computed(() => props.values.b ?? 0)
const c = computed(() => props.values.c ?? 0)

/* 小括号-购物 */
const money = computed(() => props.values.money ?? 0)
const bagP = computed(() => props.values.bag ?? 0)
const notebook = computed(() => props.values.notebook ?? 1)

const notebookCount = computed(() => Math.min(count.value, 9))
</script>

<template>
  <div class="mix-wrap">
    <!-- 乘加混合运算：豆豆买笔记本和书包 -->
    <template v-if="kind === 'mix-calc' && !isDivAdd">
      <div class="items-row">
        <span v-for="i in notebookCount" :key="'n' + i" class="item notebook">📓</span>
        <span class="item bag">🎒</span>
      </div>
      <div class="formula-row">
        <span class="chip">笔记本 {{ price }} 元 × {{ count }} 本 = {{ price * count }} 元</span>
        <span class="chip op">+</span>
        <span class="chip">书包 {{ bag }} 元</span>
      </div>
      <div class="step-line">
        <p>① 先算乘法：<b>{{ price }} × {{ count }} = {{ price * count }}</b>（买笔记本的钱）</p>
        <p>② 再算加法：<b>{{ price * count }} + {{ bag }} = {{ price * count + bag }}</b>（一共要付）</p>
      </div>
    </template>

    <!-- 除加混合运算：买钢笔和订书机 -->
    <template v-else-if="kind === 'mix-calc'">
      <div class="pen-row">
        <span class="item pen">🖊️</span>
        <span class="item pen">🖊️</span>
        <span class="item pen">🖊️</span>
        <span class="item pen">🖊️</span>
        <span class="item pen">🖊️</span>
        <span class="item stapler">📎</span>
      </div>
      <div class="formula-row">
        <span class="chip">{{ box }} 元 ÷ {{ each }} 支 = {{ box / each }} 元</span>
        <span class="chip op">+</span>
        <span class="chip">订书机 {{ stapler }} 元</span>
      </div>
      <div class="step-line">
        <p>① 先算除法：<b>{{ box }} ÷ {{ each }} = {{ box / each }}</b>（1 支钢笔的钱）</p>
        <p>② 再算加法：<b>{{ box / each }} + {{ stapler }} = {{ box / each + stapler }}</b>（应付的钱）</p>
      </div>
    </template>

    <!-- 小括号-顺序对比 -->
    <template v-else-if="kind === 'bracket' && isOrder">
      <div class="bracket-grid">
        <div class="calc-card">
          <p class="calc-title">不加小括号</p>
          <p class="calc-expr">{{ a }} + {{ b }} × {{ c }}</p>
          <p class="calc-result">= {{ a }} + {{ b * c }} = <b>{{ a + b * c }}</b></p>
          <p class="calc-note">先算乘法 {{ b }} × {{ c }}</p>
        </div>
        <div class="calc-card highlight">
          <p class="calc-title">加小括号</p>
          <p class="calc-expr">（{{ a }} + {{ b }}）× {{ c }}</p>
          <p class="calc-result">= {{ a + b }} × {{ c }} = <b>{{ (a + b) * c }}</b></p>
          <p class="calc-note">先算括号里的 {{ a }} + {{ b }}</p>
        </div>
      </div>
      <p class="diff-line">
        两个结果相差 <b class="diff-num">{{ Math.abs(a + b * c - (a + b) * c) }}</b> —— 小括号改变了运算顺序
      </p>
    </template>

    <!-- 小括号-购物 -->
    <template v-else>
      <div class="shopping-row">
        <span class="item bag-large">🎒</span>
        <span class="item money-large">💵 {{ money }} 元</span>
      </div>
      <div class="step-line">
        <p>① 买书包后剩：<b>{{ money }} − {{ bagP }} = {{ money - bagP }}</b> 元</p>
        <p>② 剩下的买笔记本：<b>{{ money - bagP }} ÷ {{ notebook }} = {{ Math.floor((money - bagP) / notebook) }}</b> 本</p>
        <p class="bracket-formula">综合算式：<b>（{{ money }} − {{ bagP }}）÷ {{ notebook }}</b></p>
      </div>
      <p class="warn-line">⚠️ 不加小括号会变成 {{ money }} − {{ bagP }} ÷ {{ notebook }} = {{ money - bagP / notebook }}，所以必须先加小括号</p>
    </template>
  </div>
</template>

<style scoped>
.mix-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  padding: 0.5rem;
}
.items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}
.pen-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  justify-content: center;
}
.item {
  font-size: 1.8rem;
  display: inline-flex;
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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
.step-line {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  max-width: 24rem;
}
.step-line b {
  color: var(--ui-primary);
}
.bracket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.8rem;
  width: 100%;
  max-width: 30rem;
}
.calc-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.8rem 1rem;
  text-align: center;
}
.calc-card.highlight {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}
.calc-title {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.calc-expr {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
  margin-top: 0.3rem;
}
.calc-result {
  font-size: 1rem;
  color: var(--ui-text-toned);
  margin-top: 0.3rem;
}
.calc-result b {
  color: var(--ui-primary);
  font-size: 1.2rem;
}
.calc-note {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
}
.diff-line {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.diff-num {
  color: var(--ui-primary);
  font-size: 1.2rem;
}
.shopping-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.item-large {
  font-size: 3rem;
}
.bracket-formula {
  margin-top: 0.3rem;
  font-size: 1.05rem;
}
.bracket-formula b {
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
.warn-line {
  font-size: 0.85rem;
  color: var(--ui-error, #dc2626);
  max-width: 26rem;
  text-align: center;
}
</style>
