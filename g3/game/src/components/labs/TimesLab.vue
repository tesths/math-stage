<script setup lang="ts">
/**
 * 倍的认识 Lab：几个几、求一个数的几倍、求一个数是另一个数的几倍
 */
import { computed, ref } from 'vue'
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
/** 过程态：一盒一盒地数（原来"几个几"这一支没有任何操作按钮） */
const conceptShown = ref(groups.value)
function nextConcept() {
  conceptShown.value = conceptShown.value >= groups.value ? 1 : conceptShown.value + 1
}

/* 求一个数的几倍 */
const base = computed(() => Math.round(props.values.base ?? 4))
const times = computed(() => Math.round(props.values.times ?? 2))
const mulTotal = computed(() => base.value * times.value)
/** 过程态：一组一组摆出来（1 倍 → 2 倍 → …） */
const rowsShown = ref(times.value)
function nextRow() {
  rowsShown.value = rowsShown.value >= times.value ? 1 : rowsShown.value + 1
}

/* 求一个数是另一个数的几倍 */
const totalDiv = computed(() => Math.round(props.values.total ?? 6))
const baseDiv = computed(() => Math.round(props.values.base ?? 3))
/** 整倍数？原来直接用 total ÷ base 可能得到 2.33 这种"倍"，与"几倍"的定义不符 */
const divWhole = computed(() => totalDiv.value % baseDiv.value === 0)
const divTimes = computed(() => Math.floor(totalDiv.value / baseDiv.value))
const divRest = computed(() => totalDiv.value % baseDiv.value)
const divList = computed(() => Array.from({ length: totalDiv.value }, (_, i) => i + 1))
/** 过程态：一圈一圈地分（每 baseDiv 片圈一组） */
const circled = ref(0)
function circleGroup() {
  circled.value = circled.value >= divTimes.value ? 0 : circled.value + 1
}
const groupIndexOf = (i: number) => Math.floor((i - 1) / baseDiv.value)

/* 混合：妈妈/爸爸/小阳 */
const mom = computed(() => Math.round(props.values.mom ?? 32))
const more = computed(() => Math.round(props.values.more ?? 3))
const son = computed(() => Math.round(props.values.son ?? 7))
const dad = computed(() => mom.value + more.value)
/** 爸爸是小阳的几倍：必须如实给商和余数，"≈ 几倍"是把 5.2 倍说成 5 倍 */
const dadQ = computed(() => Math.floor(dad.value / son.value))
const dadR = computed(() => dad.value % son.value)
const dadWhole = computed(() => dadR.value === 0)
/** 过程态：先求爸爸年龄，再求倍数 */
const mixStep = ref(2)
function nextMix() {
  mixStep.value = mixStep.value >= 2 ? 1 : mixStep.value + 1
}

/** 圆点大小随数量自适应：数量大时缩小，绝不少画（原来 Math.min(base,12) 会画少） */
const dotPx = computed(() => (base.value > 12 ? 9 : base.value > 8 ? 11 : 14))
const groupDotPx = computed(() => (each.value > 6 || groups.value > 6 ? 12 : 18))
</script>

<template>
  <div class="times-wrap">
    <!-- 几个几 -->
    <template v-if="isConcept">
      <div class="group-boxes">
        <div
          v-for="g in groups"
          :key="g"
          class="group-box"
          :class="{ dim: g > conceptShown }"
          :style="{ fontSize: groupDotPx + 'px' }"
        >
          <span v-for="p in each" :key="p" class="dot">🧑</span>
          <span class="group-tag">第 {{ g }} 组 {{ each }} 人</span>
        </div>
      </div>
      <div class="times-bar">
        <button type="button" class="tm-btn primary" data-test="concept-next" @click="nextConcept">
          试一试：一盒一盒地数（已数 {{ conceptShown }} / {{ groups }} 盒 = {{ conceptShown * each }} 人）
        </button>
        <button type="button" class="tm-btn ghost" data-test="concept-reset" @click="conceptShown = groups">重来</button>
      </div>
      <div class="formula-row">
        <span class="chip">{{ groups }} 个 {{ each }}</span>
        <span class="chip result">= {{ groups }} × {{ each }} = {{ conceptTotal }}</span>
      </div>
      <p class="tip">{{ groups }} 个 {{ each }} 相加是 {{ conceptTotal }}，可以说 {{ conceptTotal }} 是 {{ each }} 的 <b>{{ groups }} 倍</b></p>
      <p class="tip">每盒人数相同，一共 {{ groups }} 盒，就是 {{ groups }} 个 {{ each }}；求几个几用乘法。</p>
    </template>

    <!-- 求一个数的几倍是多少 -->
    <template v-else-if="isMul">
      <div class="mul-rows">
        <div class="mul-row" :class="{ dim: rowsShown < 1 }">
          <span class="row-label">1 倍</span>
          <span v-for="i in base" :key="i" class="dot2" :style="{ width: dotPx + 'px', height: dotPx + 'px' }">🔴</span>
          <span class="row-note">{{ base }} 个</span>
        </div>
        <div v-for="t in times - 1" :key="t" class="mul-row" :class="{ dim: t + 1 > rowsShown }">
          <span class="row-label">{{ t + 1 }} 倍</span>
          <span v-for="i in base" :key="i" class="dot2" :style="{ width: dotPx + 'px', height: dotPx + 'px' }">🔵</span>
          <span class="row-note">{{ base }} 个</span>
        </div>
        <span class="more">共 {{ times }} 个 {{ base }}，就是 {{ base }} 的 {{ times }} 倍</span>
      </div>
      <div class="times-bar">
        <button type="button" class="tm-btn primary" data-test="row-next" @click="nextRow">
          试一试：一组一组摆出来（已摆 {{ rowsShown }} / {{ times }} 组 = {{ rowsShown * base }} 个）
        </button>
        <button type="button" class="tm-btn ghost" data-test="row-reset" @click="rowsShown = times">重来</button>
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
          <span
            v-for="i in divList"
            :key="i"
            class="dot3"
            :class="{ circled: groupIndexOf(i) < circled && i <= circled * baseDiv }"
          >🍁</span>
        </div>
        <div class="div-groups">
          <span v-for="g in divTimes" :key="g" class="div-group" :class="{ on: g <= circled }">
            第 {{ g }} 组：{{ baseDiv }} 片
          </span>
          <span v-if="divRest" class="div-group rest">还剩 {{ divRest }} 片，不够一组</span>
        </div>
        <p class="div-count" data-test="div-count">
          已经圈了 {{ circled }} 组，共 {{ circled * baseDiv }} 片
        </p>
      </div>
      <div class="formula-row">
        <span class="chip">{{ totalDiv }} ÷ {{ baseDiv }}</span>
        <span class="chip result">= {{ divTimes }}{{ divRest ? ` 余 ${divRest}` : '（倍）' }}</span>
      </div>
      <div class="times-bar">
        <button type="button" class="tm-btn primary" data-test="circle-next" @click="circleGroup">试一试：一圈一圈地分</button>
        <button type="button" class="tm-btn ghost" data-test="circle-reset" @click="circled = 0">重来</button>
        <span class="tm-state">每圈 {{ baseDiv }} 片，已圈 {{ circled }} / {{ divTimes }} 圈</span>
      </div>
      <p class="tip">
        <template v-if="divWhole">
          {{ totalDiv }} 里面有 {{ divTimes }} 个 {{ baseDiv }}，所以 {{ totalDiv }} 是 {{ baseDiv }} 的 <b>{{ divTimes }} 倍</b>，用除法
        </template>
        <template v-else>
          {{ totalDiv }} ÷ {{ baseDiv }} = {{ divTimes }} 余 {{ divRest }}：{{ totalDiv }} 里面有 {{ divTimes }} 个 {{ baseDiv }}，还剩 {{ divRest }} 片，
          <b>不是整倍数</b>（说"倍"必须是正好分完）
        </template>
      </p>
    </template>

    <!-- 混合：爸爸/妈妈/小阳 -->
    <template v-else>
      <div class="ages">
        <div class="age-chip dad" :class="{ dim: mixStep < 1 }" :data-test="`dad-${mixStep >= 1 ? 'on' : 'off'}`">
          <p class="age-name">👨 爸爸</p>
          <p class="age-num">{{ mixStep >= 1 ? `${dad} 岁` : '？ 岁' }}</p>
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
      <div class="times-bar">
        <button type="button" class="tm-btn primary" data-test="mix-next" @click="nextMix">
          试一试：先求爸爸年龄，再求倍数（第 {{ mixStep }} / 2 步）
        </button>
        <button type="button" class="tm-btn ghost" data-test="mix-reset" @click="mixStep = 2">重来</button>
      </div>
      <div class="formula-row">
        <span class="chip" :class="{ dim: mixStep < 1 }">① 爸爸：{{ mom }} + {{ more }} = {{ dad }}（岁）</span>
        <span class="chip result" :class="{ dim: mixStep < 2 }" data-test="mix-rate">
          <template v-if="dadWhole">② 爸爸 ÷ 小阳：{{ dad }} ÷ {{ son }} = {{ dadQ }} 倍</template>
          <template v-else>
            ② {{ dad }} ÷ {{ son }} = {{ dadQ }} 余 {{ dadR }}：{{ dad }} 里面有 {{ dadQ }} 个 {{ son }}，还剩
            {{ dadR }} 岁，<b>不是整倍数</b>（要说"倍"必须正好分完）
          </template>
        </span>
      </div>
      <p class="tip">先求爸爸年龄，再求爸爸年龄是小阳年龄的几倍</p>
    </template>
  </div>
</template>

<style scoped>
.dim {
  opacity: 0.3;
}
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
  font-size: 1em;
}
.group-tag {
  grid-column: 1 / -1;
  font-size: 0.68rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.row-note {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.div-count {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.dot3.circled {
  filter: drop-shadow(0 0 2px var(--ui-primary));
  background: color-mix(in srgb, var(--ui-primary) 22%, transparent);
  border-radius: 9999px;
}
.div-group.on {
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  font-weight: 800;
}
.div-group.rest {
  border-color: var(--ui-error, #dc2626);
  color: var(--ui-error, #dc2626);
}
.times-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.tm-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.tm-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.tm-btn.ghost {
  color: var(--ui-text-muted);
}
.tm-state {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
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
  max-width: 36rem;
}
.tip b {
  color: var(--ui-primary);
}
</style>
