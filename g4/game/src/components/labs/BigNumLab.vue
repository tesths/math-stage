<script setup lang="ts">
/**
 * 大数的运算 Lab：三位数乘两位数 / 计算器探索规律 / 1亿有多大
 *
 * 本轮（第 4 轮）改动：
 * - 竖式乘法**数位对齐**（P0）：旧实现把两个因数画在 x=130~190，
 *   两个部分积却各自靠 x=250 / 220 右对齐，还有一个孤零零的 0 落在 x=230，
 *   学生照着抄必然错位。现在所有数字共用一条"个位线"，第二个部分积整体左移一位、个位补 0。
 * - 「1 亿有多大」的纸堆不再用 `min(140, 米/20)` 这种假比例尺（一旦超过就压平），
 *   改成纸堆和珠穆朗玛峰**共用同一比例尺**，谁高一眼看得出。
 * - 三块都加了过程按钮：先乘个位再乘十位最后相加 / 一步一步验算 / 和珠峰比一比。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { digitsOf, formatBig } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 三位数乘两位数 ---------- */
const num = computed(() => Math.round(props.values.num ?? 128))
const mult = computed(() => Math.round(props.values.mult ?? 16))
const o = computed(() => mult.value % 10)
const t = computed(() => Math.floor(mult.value / 10))
const oProd = computed(() => num.value * o.value)
const tProd = computed(() => num.value * t.value)
const total = computed(() => num.value * mult.value)

/** 数位列：第 k 列是 10^k 位，所有行共用同一个个位线 */
const COLW = 30
const RIGHT = 258
const colX = (k: number) => RIGHT - k * COLW
/** 把 m 按数位排成 [{digit, x}]，个位永远落在 RIGHT 这一列上 */
function placesOf(value: number, shift = 0): { digit: string; x: number }[] {
  const s = String(value)
  return s.split('').map((digit, i) => ({
    digit,
    x: colX(s.length - 1 - i + shift),
  }))
}
const numPlaces = computed(() => placesOf(num.value))
const multPlaces = computed(() => placesOf(mult.value))
const oPlaces = computed(() => placesOf(oProd.value))
const tPlaces = computed(() => placesOf(tProd.value, 1))
const totalPlaces = computed(() => placesOf(total.value))
const lineLeft = computed(() => colX(Math.max(num.value, mult.value, total.value).toString().length - 1) - 18)
const lineRight = computed(() => colX(0) + 18)

/* 过程态：先乘个位 → 再乘十位（个位补 0）→ 相加 */
const step = ref(3)
function nextStep() {
  // 从"全部显示"点一下就回到第 1 步，保证过程态截图里能看见个位积
  step.value = step.value >= 3 ? 1 : step.value + 1
}
function showAllSteps() {
  step.value = 3
}

/* ---------- 计算器规律 ---------- */
const tens = computed(() => Math.round(props.values.tens ?? 3))
const n5 = computed(() => tens.value * 10 + 5)
const n5sq = computed(() => n5.value * n5.value)
const prefix = computed(() => tens.value * (tens.value + 1))
const calcStep = ref(2)
function nextCalc() {
  calcStep.value = calcStep.value >= 2 ? 0 : calcStep.value + 1
}

/* ---------- 1亿有多大 ---------- */
const sheets = computed(() => Math.round(props.values.sheets ?? 1000000))
const thick = computed(() => props.values.thick ?? 1)
const cm = computed(() => (sheets.value / 100) * thick.value)
const meters = computed(() => cm.value / 100)
const yiCm = computed(() => (100000000 / 100) * thick.value)
const yiMeters = computed(() => yiCm.value / 100)
const EVEREST = 8848
/** 纸堆与珠峰共用同一比例尺：160px 对应两者中较高的那个 */
const scaleMax = computed(() => Math.max(meters.value, EVEREST))
const pxPerMeter = computed(() => 160 / scaleMax.value)
const stackPx = computed(() => Math.max(1, meters.value * pxPerMeter.value))
const everestPx = computed(() => EVEREST * pxPerMeter.value)
const compare = ref(false)
function toggleCompare() {
  compare.value = !compare.value
}
const meterText = computed(() => (meters.value >= 100 ? `${formatBig(Math.round(meters.value))} 米` : `${Math.round(cm.value * 100) / 100} 厘米`))
</script>

<template>
  <div class="big-wrap">
    <!-- 三位数乘两位数 -->
    <template v-if="kind === 'big-mul'">
      <svg viewBox="0 0 340 240" class="mul-svg" aria-label="三位数乘两位数的竖式（数位对齐）">
        <!-- 被乘数 -->
        <text v-for="(p, i) in numPlaces" :key="'n' + i" :x="p.x" :y="40" text-anchor="middle" class="mul-d">{{ p.digit }}</text>
        <!-- 乘数 -->
        <text v-for="(p, i) in multPlaces" :key="'m' + i" :x="p.x" :y="70" text-anchor="middle" class="mul-d">{{ p.digit }}</text>
        <text :x="lineLeft - 8" y="70" text-anchor="middle" class="mul-op">×</text>
        <line :x1="lineLeft" y1="84" :x2="lineRight" y2="84" class="mul-line" />
        <!-- 个位乘得的部分积（与个位对齐） -->
        <template v-if="step >= 1">
          <text v-for="(p, i) in oPlaces" :key="'o' + i" :x="p.x" y="112" text-anchor="middle" class="mul-r">{{ p.digit }}</text>
          <text :x="lineRight + 16" y="112" text-anchor="start" class="mul-tag">{{ num }} × {{ o }}</text>
        </template>
        <!-- 十位乘得的部分积（整体左移一位，个位补 0） -->
        <template v-if="step >= 2">
          <text v-for="(p, i) in tPlaces" :key="'t' + i" :x="p.x" y="142" text-anchor="middle" class="mul-r">{{ p.digit }}</text>
          <text :x="colX(0)" y="142" text-anchor="middle" class="mul-zero">0</text>
          <text :x="lineRight + 16" y="142" text-anchor="start" class="mul-tag">{{ num }} × {{ t }} 十</text>
        </template>
        <line v-if="step >= 2" :x1="lineLeft" y1="154" :x2="lineRight" y2="154" class="mul-line" />
        <!-- 积 -->
        <template v-if="step >= 3">
          <text v-for="(p, i) in totalPlaces" :key="'T' + i" :x="p.x" y="184" text-anchor="middle" class="mul-total">{{ p.digit }}</text>
          <text :x="lineRight + 16" y="184" text-anchor="start" class="mul-tag">相加</text>
        </template>
        <!-- 数位列参考线 -->
        <g class="col-guides">
          <text :x="colX(0)" y="206" text-anchor="middle" class="col-name">个位</text>
          <text :x="colX(1)" y="206" text-anchor="middle" class="col-name">十位</text>
          <text :x="colX(2)" y="206" text-anchor="middle" class="col-name">百位</text>
          <text :x="colX(3)" y="206" text-anchor="middle" class="col-name">千位</text>
          <line :x1="RIGHT" y1="212" :x2="RIGHT" y2="24" class="oneline" />
        </g>
      </svg>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="big-next" @click="nextStep">
          试一试：先乘个位，再乘十位（第 {{ step }} / 3 步）
        </button>
        <button type="button" class="op-btn ghost" data-test="big-all" @click="showAllSteps">全部显示</button>
      </div>
      <div class="formula-row">
        <span class="chip">{{ num }} × {{ o }} = {{ oProd }}</span>
        <span class="chip">{{ num }} × {{ t }} 十 = {{ tProd }}0</span>
        <span class="chip op" data-test="big-total">{{ oProd }} + {{ tProd }}0 = {{ formatBig(total) }}</span>
      </div>
      <p class="note">
        第二个部分积是 {{ num }} × {{ t }} = {{ tProd }} 个十，所以末位要和<b>十位对齐</b>（个位补 0）；
        两条横线、所有数字都对齐在同一根个位线上。
      </p>
    </template>

    <!-- 计算器规律 -->
    <template v-else-if="kind === 'big-calc'">
      <div class="calc-cards">
        <div class="calc-card">
          <p class="calc-expr">{{ n5 }} × {{ n5 }}</p>
          <p class="calc-result">{{ n5sq }}</p>
        </div>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="calc-next" @click="nextCalc">
          试一试：一步一步验算（第 {{ calcStep }} / 2 步）
        </button>
      </div>
      <div class="formula-row">
        <span class="chip">末两位是 25</span>
        <span v-if="calcStep >= 1" class="chip">前面 = {{ tens }} × {{ tens + 1 }} = {{ prefix }}</span>
        <span v-if="calcStep >= 2" class="chip op">{{ prefix }} × 100 + 25 = {{ n5sq }}</span>
      </div>
      <p class="note">
        个位是 5 的数自乘：<b>{{ n5 }} × {{ n5 }} = {{ n5sq }}</b>，先算 {{ tens }} × {{ tens + 1 }} = {{ prefix }}，再在后面写 25
      </p>
    </template>

    <!-- 1亿有多大 -->
    <template v-else>
      <div class="yi-box">
        <div class="yi-paper">
          <p class="yi-count">{{ formatBig(sheets) }} 张纸</p>
          <div class="paper-stack" :style="{ height: stackPx + 'px' }" />
          <p class="yi-meters">{{ meterText }}</p>
        </div>
        <div class="yi-everest">
          <p class="everest-top">🏔️ 珠穆朗玛峰 {{ EVEREST }} 米</p>
          <div class="everest-mountain" :style="{ height: everestPx + 'px' }" />
          <p v-if="compare" class="compare-text" data-test="compare-text">
            {{ meters > EVEREST ? `纸堆比珠峰高 ${formatBig(Math.round(meters - EVEREST))} 米` : meters < EVEREST ? '纸堆还没到珠峰的高度' : '纸堆和珠峰一样高' }}
          </p>
        </div>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="compare-toggle" @click="toggleCompare">
          试一试：和珠穆朗玛峰比一比
        </button>
      </div>
      <div class="formula-row">
        <span class="chip">{{ formatBig(sheets) }} ÷ 100 × {{ thick }} 厘米</span>
        <span class="chip op">{{ meterText }}</span>
      </div>
      <p class="note">
        纸堆和山峰画在<b>同一个比例尺</b>上（160 像素对应 {{ formatBig(Math.round(scaleMax)) }} 米）。
        1 亿张纸摞起来约 <b>{{ formatBig(Math.round(yiMeters)) }} 米</b>，
        {{ yiMeters > EVEREST ? '比珠穆朗玛峰（8848 米）还高！' : '比珠穆朗玛峰矮。' }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.big-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.mul-svg {
  width: 100%;
  max-width: 30rem;
}
.mul-d {
  fill: var(--ui-text-highlighted);
  font-size: 17px;
  font-weight: 700;
}
.mul-r {
  fill: var(--ui-text-toned);
  font-size: 17px;
}
.mul-zero {
  fill: var(--ui-error, #dc2626);
  font-size: 17px;
  font-weight: 800;
}
.mul-total {
  fill: var(--ui-primary);
  font-size: 17px;
  font-weight: 800;
}
.mul-op {
  fill: var(--ui-text-highlighted);
  font-size: 16px;
}
.mul-tag {
  fill: var(--ui-text-muted);
  font-size: 10px;
}
.mul-line {
  stroke: var(--ui-text-highlighted);
  stroke-width: 1.6;
}
.col-name {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.oneline {
  stroke: color-mix(in srgb, var(--ui-primary) 45%, transparent);
  stroke-width: 1;
  stroke-dasharray: 3 3;
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
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.88rem;
  color: var(--ui-text-toned);
}
.chip.op {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.note {
  font-size: 0.84rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 40rem;
}
.note b {
  color: var(--ui-primary);
}
.calc-cards {
  display: flex;
  gap: 0.6rem;
}
.calc-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 1.2rem;
  text-align: center;
}
.calc-expr {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.calc-result {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.yi-box {
  display: flex;
  align-items: flex-end;
  gap: 2.2rem;
  min-height: 210px;
}
.yi-paper,
.yi-everest {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.2rem;
}
.yi-count,
.everest-top {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.paper-stack {
  width: 56px;
  background: repeating-linear-gradient(
    180deg,
    color-mix(in srgb, var(--ui-primary) 55%, white) 0 3px,
    white 3px 5px
  );
  border: 1px solid var(--ui-primary);
  border-radius: 2px;
}
.everest-mountain {
  width: 84px;
  background: linear-gradient(180deg, #e2e8f0, #94a3b8);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}
.yi-meters,
.compare-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-primary);
}
</style>
