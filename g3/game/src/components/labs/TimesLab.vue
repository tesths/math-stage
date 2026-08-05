<script setup lang="ts">
/**
 * 倍的认识 Lab：几个几、求一个数的几倍、求一个数是另一个数的几倍
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const id = computed(() => props.lab.id)

const isConcept = computed(() => id.value === 'g3-c12-times-concept')
const isMul = computed(() => id.value === 'g3-c12-times-mul')
const isDiv = computed(() => id.value === 'g3-c12-times-div')

/* 概念：几个几 */
const each = computed(() => Math.round(props.values.each ?? 2))
const groups = computed(() => Math.round(props.values.groups ?? 3))
const conceptTotal = computed(() => each.value * groups.value)

/* 求一个数的几倍 */
const base = computed(() => Math.round(props.values.base ?? 4))
const times = computed(() => Math.round(props.values.times ?? 2))
const mulTotal = computed(() => base.value * times.value)

/* 求一个数是另一个数的几倍 */
const totalDiv = computed(() => Math.round(props.values.total ?? 6))
const baseDiv = computed(() => Math.round(props.values.base ?? 3))
const divTimes = computed(() => totalDiv.value / baseDiv.value)
const divList = computed(() => Array.from({ length: Math.min(totalDiv.value, 30) }, (_, i) => i))

/* 混合：爸爸/妈妈/小阳 */
const dad = computed(() => Math.round(props.values.dad ?? 32))
const less = computed(() => Math.round(props.values.less ?? 3))
const son = computed(() => Math.round(props.values.son ?? 7))
const mom = computed(() => dad.value - less.value)

const maxDots = 30
</script>

<template>
  <div class="times-wrap">
    <!-- 几个几 -->
    <template v-if="isConcept">
      <div class="group-boxes">
        <div v-for="g in Math.min(groups, 6)" :key="g" class="group-box">
          <span v-for="p in Math.min(each, 10)" :key="p" class="dot">🧑</span>
        </div>
        <span v-if="groups > 6" class="more">…</span>
      </div>
      <div class="formula-row">
        <span class="chip">{{ groups }} 个 {{ each }}</span>
        <span class="chip result">= {{ groups }} × {{ each }} = {{ conceptTotal }}</span>
      </div>
      <p class="tip">{{ groups }} 个 {{ each }} 相加是 {{ conceptTotal }}，可以说 {{ conceptTotal }} 是 {{ each }} 的 <b>{{ groups }} 倍</b></p>
    </template>

    <!-- 求一个数的几倍是多少 -->
    <template v-else-if="isMul">
      <div class="mul-rows">
        <div class="mul-row">
          <span class="row-label">1 倍</span>
          <span v-for="i in Math.min(base, 12)" :key="i" class="dot2">🔴</span>
        </div>
        <div v-for="t in Math.min(times - 1, 4)" :key="t" class="mul-row">
          <span class="row-label">{{ t + 1 }} 倍</span>
          <span v-for="i in Math.min(base, 12)" :key="i" class="dot2">🔵</span>
        </div>
        <span v-if="times > 5" class="more">… 共 {{ times }} 倍</span>
      </div>
      <div class="formula-row">
        <span class="chip">{{ base }} × {{ times }}</span>
        <span class="chip result">= {{ mulTotal }}</span>
      </div>
      <p class="tip">求一个数的几倍是多少，就是求<b>几个几</b>是多少，用乘法：{{ base }} × {{ times }} = {{ mulTotal }}</p>
    </template>

    <!-- 求一个数是另一个数的几倍 -->
    <template v-else-if="isDiv">
      <div class="div-rows">
        <div class="div-row all">
          <span v-for="i in divList" :key="i" class="dot3">🍁</span>
        </div>
        <div class="div-groups">
          <span
            v-for="g in Math.floor(totalDiv / baseDiv)"
            :key="g"
            class="div-group"
          >{{ baseDiv }} 片一组</span>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">{{ totalDiv }} ÷ {{ baseDiv }}</span>
        <span class="chip result">= {{ divTimes }}（倍）</span>
      </div>
      <p class="tip">{{ totalDiv }} 里面有 {{ divTimes }} 个 {{ baseDiv }}，所以 {{ totalDiv }} 是 {{ baseDiv }} 的 <b>{{ divTimes }} 倍</b>，用除法</p>
    </template>

    <!-- 混合：爸爸/妈妈/小阳 -->
    <template v-else>
      <div class="ages">
        <div class="age-chip dad">
          <p class="age-name">👨 爸爸</p>
          <p class="age-num">{{ dad }} 岁</p>
        </div>
        <div class="age-chip mom">
          <p class="age-name">👩 妈妈</p>
          <p class="age-num">{{ mom }} 岁</p>
        </div>
        <div class="age-chip son">
          <p class="age-name">👦 小阳</p>
          <p class="age-num">{{ son }} 岁</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">妈妈：{{ dad }} − {{ less }} = {{ mom }}</span>
        <span class="chip result">爸爸 ÷ 小阳：{{ dad }} ÷ {{ son }} ≈ {{ Math.round(dad / son) }} 倍</span>
      </div>
      <p class="tip">先求妈妈年龄，再求爸爸年龄是小阳年龄的几倍</p>
    </template>
  </div>
</template>

<style scoped>
.times-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.group-boxes {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
}
.group-box {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.4rem;
}
.dot {
  font-size: 1.3rem;
}
.mul-rows {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.mul-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.row-label {
  width: 3rem;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  text-align: right;
}
.dot2 {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 12px;
  line-height: 14px;
  text-align: center;
}
.more {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
}
.div-rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.div-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem;
  justify-content: center;
}
.dot3 {
  font-size: 1.1rem;
}
.div-groups {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.div-group {
  font-size: 0.72rem;
  color: var(--ui-primary);
  border: 1px dashed var(--ui-primary);
  border-radius: 9999px;
  padding: 0.15rem 0.5rem;
}
.ages {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.age-chip {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.7rem 1.1rem;
  text-align: center;
  min-width: 5.5rem;
}
.age-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.age-num {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-primary);
  margin-top: 0.2rem;
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
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.tip {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 26rem;
}
.tip b {
  color: var(--ui-primary);
}
</style>
