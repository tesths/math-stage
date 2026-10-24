<script setup lang="ts">
/**
 * 除法 Lab：整十数口算 / 竖式试商 / 笔算竖式 / 两步连除
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { digitsOf } from '@/lib/engine/math'
import { quotientText, trialDivide } from '@/lib/labs/divTry'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 竖式步骤 ---------- */
const divisor = computed(() => Math.round(props.values.div ?? 24))
const dividend = computed(() => {
  const v = props.values
  if (v.num !== undefined) return Math.round(v.num)
  if (v.total !== undefined) return Math.round(v.total)
  return 96
})

/** 竖式逐步：curVal 是本轮真正拿来除的当前部分被除数 */
const penSteps = computed(() => {
  const digs = digitsOf(dividend.value)
  let rem = 0
  let first = false
  const out: { col: number; qd: number; sub: number; rem: number; started: boolean; curVal: number }[] = []
  for (let i = 0; i < digs.length; i++) {
    rem = rem * 10 + digs[i]!
    const curVal = rem
    const qd = Math.floor(rem / divisor.value)
    if (qd > 0 || first) {
      first = true
      const sub = qd * divisor.value
      out.push({ col: i, qd, sub, rem: rem - sub, started: true, curVal })
      rem = rem - sub
    } else {
      out.push({ col: i, qd, sub: 0, rem, started: false, curVal })
    }
  }
  // 商如果是两位数、被除数是三位数，最前面"不够商 1"的那一位不写商，也不该画空格子
  const firstStarted = out.findIndex((x) => x.started)
  return firstStarted <= 0 ? out : out.slice(firstStarted)
})

/* ---------- 口算分组 ---------- */
const base = computed(() => Math.round(props.values.base ?? 60))
const oralDiv = computed(() => Math.round(props.values.div ?? 20))
const tensBase = computed(() => Math.floor(base.value / 10))
const tensDiv = computed(() => Math.floor(oralDiv.value / 10))
const groupCount = computed(() => {
  const per = Math.max(1, Math.floor(tensBase.value / tensDiv.value))
  const arr: number[] = []
  let left = tensBase.value
  while (left > 0) {
    const take = Math.min(per, left)
    arr.push(take)
    left -= take
  }
  return arr
})

/* ---------- 连除 ---------- */
const total = computed(() => Math.round(props.values.total ?? 224))
const shelf = computed(() => Math.round(props.values.shelf ?? 2))
const floor = computed(() => Math.round(props.values.floor ?? 4))
const perShelf = computed(() => total.value / shelf.value)
const perFloor = computed(() => perShelf.value / floor.value)

/* ---------- 竖式逐步演示 ---------- */
const started = computed(() => penSteps.value.filter((s) => s.started))
const cur = ref(0)
const setCur = (i: number) => {
  cur.value = Math.min(Math.max(i, 0), Math.max(started.value.length - 1, 0))
}
const roundNotes = computed(() => {
  return started.value.map((s, i) => {
    return { idx: i, col: s.col, qd: s.qd, sub: s.sub, rem: s.rem, curVal: s.curVal }
  })
})
const activeRound = computed(() => roundNotes.value[cur.value])
const digitX = (col: number) => 72 + col * 34
/** 数位名：商写在哪一位上面必须与列号对应 */
function placeName(col: number): string {
  const total = String(dividend.value).length
  const place = total - 1 - col
  return place === 0 ? '个位' : place === 1 ? '十位' : place === 2 ? '百位' : '千位'
}

/**
 * 试商流程（本轮重写）：真正按课本走
 * 把除数四舍五入看成整十数 → 试商 → 乘积超过被除数就调小 / 余数不小于除数就调大 → 定商。
 * 旧实现直接用精确商，"验算"必然通过，学生学不到试商（P1 空转）。
 */
const tryResult = computed(() => trialDivide(dividend.value, divisor.value))
const tryFlow = computed(() => tryResult.value.rounds.flatMap((round) => round.steps.map((step) => ({ ...step, place: round.place }))))
const tryIdx = ref(-1)
const tryShown = computed(() => tryFlow.value.slice(0, Math.max(0, tryIdx.value + 1)))
function nextTry() {
  tryIdx.value = Math.min(tryIdx.value + 1, tryFlow.value.length - 1)
}
function resetTry() {
  tryIdx.value = -1
}
const tryDone = computed(() => tryIdx.value >= tryFlow.value.length - 1)
const trySummary = computed(() => quotientText(tryResult.value))

/* ---------- 口算：一包一包地分 ---------- */
const packedPiles = ref(0)
function nextPile() {
  packedPiles.value = packedPiles.value >= groupCount.value.length ? 0 : packedPiles.value + 1
}

/* ---------- 连除：两步 ---------- */
const routeStep = ref(0)
function nextRoute() {
  routeStep.value = Math.min(routeStep.value + 1, 2)
}
function resetRoute() {
  routeStep.value = 0
}
</script>

<template>
  <div class="div-wrap">
    <!-- 口算除法 -->
    <template v-if="kind === 'div-oral'">
      <div class="piles">
        <div v-for="(g, i) in groupCount" :key="i" class="pile" :class="{ dim: i >= packedPiles }">
          <div class="rod-block">
            <span v-for="j in Math.min(g, 10)" :key="j" class="ten-rod" />
          </div>
          <p class="pile-val">{{ g }} 个十</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip big">{{ base }} ÷ {{ oralDiv }} =</span>
        <span class="chip op">{{ base / oralDiv }}</span>
      </div>
      <div class="try-buttons">
        <button type="button" class="round-btn primary" data-test="pile-next" @click="nextPile">
          试一试：一包一包地分（已分 {{ packedPiles }} / {{ groupCount.length }} 包）
        </button>
      </div>
      <p class="note">
        {{ base }} 是 {{ tensBase }} 个十，每 {{ tensDiv }} 个十为 1 份，能分
        <b>{{ groupCount.length }}</b> 包
      </p>
    </template>

    <!-- 竖式（试商/笔算） -->
    <template v-else-if="kind === 'div-try' || kind === 'div-pen'">
      <svg viewBox="0 0 380 230" class="div-svg">
        <!-- 商位 -->
        <template v-for="(s, si) in penSteps" :key="'q' + si">
          <text
            :x="digitX(s.col)"
            :y="30"
            text-anchor="middle"
            class="qd-digit"
            :class="{ active: s.started && started.findIndex((x) => x === s) === cur, zero: !s.started }"
          >{{ s.started ? s.qd : '' }}</text>
          <rect
            v-if="!s.started"
            :x="digitX(s.col) - 10"
            :y="16"
            width="20"
            height="28"
            rx="3"
            class="zero-box"
          />
        </template>

        <text x="20" y="30" class="divisor">{{ divisor }}</text>
        <text x="52" y="30" class="div-sym">)⎯</text>
        <text
          v-for="(d, i) in digitsOf(dividend)"
          :key="'d' + i"
          :x="digitX(i)"
          :y="30"
          text-anchor="middle"
          class="dd-digit"
          :class="{ colactive: roundNotes[cur] && roundNotes[cur]!.col === i }"
        >{{ d }}</text>

        <!-- 逐轮：当前轮高亮 + 连接线 -->
        <template v-for="(s, si) in started" :key="'r' + si">
          <g :class="si === cur ? 'round-active' : 'round-dim'">
            <text
              v-for="(d, di) in String(s.sub).padStart(s.col + 1, '0').split('')"
              :key="'s' + di"
              :x="digitX(s.col - String(s.sub).length + 1 + di)"
              :y="62 + si * 40"
              text-anchor="middle"
              class="sub-digit"
            >{{ d === '0' ? '' : d }}</text>
            <line :x1="digitX(s.col - String(s.sub).length + 1) - 12" :x2="digitX(s.col) + 12" :y1="72 + si * 40" :y2="72 + si * 40" class="sub-line" />
            <text
              v-for="(d, di) in String(s.rem).padStart(s.col + 1, '0').split('')"
              :key="'m' + di"
              :x="digitX(s.col - String(s.rem).length + 1 + di)"
              :y="82 + si * 40"
              text-anchor="middle"
              class="rem-digit"
            >{{ d === '0' ? '' : d }}</text>
          </g>
          <g v-if="si === cur" class="connector">
            <line :x1="digitX(s.col)" :y1="34" :x2="digitX(s.col)" :y2="60" class="conn-line" />
            <line :x1="digitX(s.col)" :y1="72" :x2="digitX(s.col)" :y2="84" class="conn-line" />
          </g>
        </template>
      </svg>

      <!-- 试商流程条：真实试商/调商 -->
      <div v-if="kind === 'div-try'" class="try-block">
        <p class="try-head" data-test="try-head">
          把除数 {{ divisor }} {{ tryResult.method === '四舍' ? '四舍' : '五入' }}看成 <b>{{ tryResult.rounded }}</b>
          （{{ tryResult.method }}法）
        </p>
        <div class="try-bar">
          <template v-for="(f, i) in tryShown" :key="i">
            <span class="try-chip" :class="f.kind">{{ f.text }}</span>
          </template>
          <span v-if="!tryShown.length" class="try-empty">还没开始试商</span>
        </div>
        <div class="try-buttons">
          <button type="button" class="round-btn primary" data-test="try-next" :disabled="tryDone" @click="nextTry">
            试一试：一步一步试商
          </button>
          <button type="button" class="round-btn ghost" data-test="try-reset" @click="resetTry">重来</button>
          <span class="try-summary" data-test="try-summary">{{ tryDone ? trySummary : `已进行 ${tryShown.length} / ${tryFlow.length} 步` }}</span>
        </div>
      </div>

      <div class="step-bar">
        <button
          v-for="(n, i) in roundNotes"
          :key="i"
          type="button"
          class="step-chip"
          :class="{ on: i === cur }"
          @click="setCur(i)"
        >
          {{ i + 1 }}
        </button>
      </div>
      <div class="try-buttons">
        <button type="button" class="round-btn" data-test="div-prev" :disabled="cur === 0" @click="setCur(cur - 1)">上一轮</button>
        <button
          type="button"
          class="round-btn primary"
          data-test="div-next"
          :disabled="cur >= roundNotes.length - 1"
          @click="setCur(cur + 1)"
        >
          开始下一轮
        </button>
        <button type="button" class="round-btn ghost" data-test="div-reset" @click="setCur(0)">重来</button>
      </div>
      <p v-if="activeRound" class="round-note" data-test="div-round-note">
        第 {{ cur + 1 }} 轮：{{ activeRound.curVal }} ÷ {{ divisor }} = {{ activeRound.qd }}……{{ activeRound.rem }}，商
        {{ activeRound.qd }} 写在{{ placeName(activeRound.col) }}上面，乘积 {{ activeRound.sub }}（共 {{ roundNotes.length }} 轮）
      </p>

      <div class="formula-row">
        <span class="chip big">{{ dividend }} ÷ {{ divisor }} =</span>
        <span class="chip op">{{ Math.floor(dividend / divisor) }}{{ dividend % divisor ? ' …… ' + (dividend % divisor) : '' }}</span>
      </div>
      <p v-if="kind === 'div-try'" class="note">
        把除数 <b>{{ divisor }}</b> 看作整十数 <b>{{ Math.floor(divisor / 10) * 10 }}</b> 试商
      </p>
      <p v-else class="note">先除被除数的前两位，不够商 1 再除前三位</p>
    </template>

    <!-- 两步连除 -->
    <template v-else>
      <div class="shelf-tree">
        <div class="shelf-root">
          <p class="shelf-label">共 {{ total }} 本</p>
        </div>
        <div class="shelf-branch">
          <div v-for="s in shelf" :key="'s' + s" class="shelf-col">
            <p class="shelf-box">书架 {{ s }}</p>
            <div class="shelf-floors">
              <span v-for="f in floor" :key="'f' + f" class="floor-box">{{ perFloor }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="try-buttons">
        <button type="button" class="round-btn primary" data-test="route-next" :disabled="routeStep >= 2" @click="nextRoute">
          试一试：两步算下去
        </button>
        <button type="button" class="round-btn ghost" data-test="route-reset" @click="resetRoute">重来</button>
        <span class="try-summary" data-test="route-progress">第 {{ routeStep }} / 2 步</span>
      </div>
      <div class="route-steps">
        <p class="route-line" :class="{ on: routeStep >= 1 }">
          {{ total }} ÷ {{ shelf }} = {{ perShelf }}（每个书架放 {{ perShelf }} 本）
        </p>
        <p class="route-line" :class="{ on: routeStep >= 2 }">
          {{ perShelf }} ÷ {{ floor }} = {{ perFloor }}（平均每层放 {{ perFloor }} 本）
        </p>
      </div>
      <p class="note">平均每层放 <b>{{ perFloor }}</b> 本</p>
    </template>
  </div>
</template>

<style scoped>
.div-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.piles {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.rod-block {
  display: grid;
  gap: 2px;
  grid-template-columns: repeat(5, 14px);
}
.ten-rod {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.pile-val {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.div-svg {
  width: 100%;
  max-width: 532px;
}
.qd-digit {
  font-size: 20px;
  font-weight: 800;
  fill: var(--ui-primary);
  transition: opacity 0.2s ease;
}
.qd-digit.zero {
  fill: var(--ui-text-muted);
}
.qd-digit.active {
  font-size: 22px;
}
.zero-box {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-dasharray: 3 3;
}
.divisor {
  font-size: 17px;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.div-sym {
  font-size: 17px;
  fill: var(--ui-text-muted);
}
.dd-digit {
  font-size: 19px;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.dd-digit.colactive {
  fill: var(--ui-primary);
  font-size: 21px;
}
.sub-digit {
  font-size: 15px;
  fill: var(--ui-text-muted);
}
.sub-line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.rem-digit {
  font-size: 15px;
  font-weight: 700;
  fill: var(--ui-primary);
}
.round-active .sub-digit {
  fill: var(--ui-primary);
  font-weight: 800;
}
.round-active .rem-digit {
  fill: var(--ui-primary);
  font-weight: 800;
}
.round-dim {
  opacity: 0.35;
}
.conn-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}
.step-bar {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step-chip {
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 9999px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.step-chip:hover {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.step-chip.on {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
  color: white;
}
.round-note {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-primary);
  text-align: center;
}
.try-bar {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.try-chip {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-warning, #f59e0b) 45%, white);
  color: var(--ui-text-highlighted);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.25rem 0.7rem;
}
.try-arrow {
  color: var(--ui-warning, #f59e0b);
  font-weight: 800;
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
.chip.big {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.chip.op {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
  font-size: 1.15rem;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
.dim {
  opacity: 0.35;
}
.try-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  max-width: 40rem;
}
.try-head {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.try-head b {
  color: var(--ui-primary);
}
.try-bar {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}
.try-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  color: var(--ui-text-toned);
  background: var(--ui-bg-muted);
}
.try-chip.trial {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.try-chip.bigger,
.try-chip.smaller {
  border-color: var(--ui-warning, #f59e0b);
  color: var(--ui-warning, #f59e0b);
  font-weight: 700;
}
.try-chip.settle {
  border-color: var(--ui-success, #16a34a);
  color: var(--ui-success, #16a34a);
  font-weight: 700;
}
.try-empty {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.try-buttons {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.try-summary {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.route-steps {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
}
.route-line {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  opacity: 0.35;
}
.route-line.on {
  opacity: 1;
  color: var(--ui-primary);
  font-weight: 700;
}
.shelf-tree {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  width: 100%;
  max-width: 588px;
}
.shelf-root {
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 1.4rem;
  background: var(--ui-bg-muted);
}
.shelf-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.shelf-branch {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.shelf-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}
.shelf-box {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-primary);
  border: 1px solid var(--ui-primary);
  border-radius: var(--ui-radius-md);
  padding: 0.2rem 0.7rem;
}
.shelf-floors {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.floor-box {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  background: var(--ui-bg-muted);
  border-radius: var(--ui-radius-sm);
  padding: 0.1rem 0.6rem;
  text-align: center;
}
</style>
