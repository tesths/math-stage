<script setup lang="ts">
/**
 * 除法 Lab：整十数口算 / 竖式试商 / 笔算竖式 / 两步连除
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { digitsOf } from '@/lib/engine/math'

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

/** 竖式逐步：返回每步 { col, qd, sub, rem } */
const penSteps = computed(() => {
  const digs = digitsOf(dividend.value)
  let rem = 0
  let first = false
  const out: { col: number; qd: number; sub: number; rem: number; started: boolean }[] = []
  for (let i = 0; i < digs.length; i++) {
    rem = rem * 10 + digs[i]!
    const qd = Math.floor(rem / divisor.value)
    if (qd > 0 || first) {
      first = true
      const sub = qd * divisor.value
      out.push({ col: i, qd, sub, rem: rem - sub, started: true })
      rem = rem - sub
    } else {
      out.push({ col: i, qd, sub: 0, rem, started: false })
    }
  }
  return out
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
const cur = ref(Math.max(started.value.length - 1, 0))
const setCur = (i: number) => {
  cur.value = Math.min(Math.max(i, 0), started.value.length - 1)
}
const roundNotes = computed(() => {
  const digs = digitsOf(dividend.value)
  return started.value.map((s, i) => {
    const prev = i === 0 ? 0 : started.value[i - 1]!.rem
    return { idx: i, col: s.col, qd: s.qd, sub: s.sub, rem: s.rem, curVal: prev * 10 + digs[s.col]! }
  })
})
const activeRound = computed(() => roundNotes.value[cur.value])

/* ---------- 试商流程 ---------- */
const tryFlow = computed(() => {
  const est = Math.floor(divisor.value / 10) * 10
  const qd = Math.floor(dividend.value / divisor.value)
  const sub = qd * divisor.value
  return [
    { label: `估除数≈${est}` },
    { label: `试商 ${qd}` },
    { label: `${qd} × ${divisor.value} = ${sub}` },
    { label: `${dividend.value} − ${sub} = ${dividend.value - sub}${dividend.value - sub >= 0 ? ' ✓' : ' ✗ 调商'}` },
  ]
})
</script>

<template>
  <div class="div-wrap">
    <!-- 口算除法 -->
    <template v-if="kind === 'div-oral'">
      <div class="piles">
        <div v-for="(g, i) in groupCount" :key="i" class="pile">
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
            :x="30 + s.col * 34"
            :y="30"
            text-anchor="middle"
            class="qd-digit"
            :class="{ active: s.started && started.findIndex((x) => x === s) === cur, zero: !s.started }"
          >{{ s.started ? s.qd : '' }}</text>
          <rect
            v-if="!s.started"
            :x="30 + s.col * 34 - 10"
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
          :x="72 + i * 34"
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
              :x="72 + (s.col - String(s.sub).length + 1 + di) * 34"
              :y="62 + si * 40"
              text-anchor="middle"
              class="sub-digit"
            >{{ d === '0' ? '' : d }}</text>
            <line :x1="66 + (s.col - String(s.sub).length + 1) * 34 - 6" :x2="66 + (s.col + 1) * 34 + 2" :y1="72 + si * 40" :y2="72 + si * 40" class="sub-line" />
            <text
              v-for="(d, di) in String(s.rem).padStart(s.col + 1, '0').split('')"
              :key="'m' + di"
              :x="72 + (s.col - String(s.rem).length + 1 + di) * 34"
              :y="82 + si * 40"
              text-anchor="middle"
              class="rem-digit"
            >{{ d === '0' ? '' : d }}</text>
          </g>
          <g v-if="si === cur" class="connector">
            <line :x1="30 + s.col * 34" :y1="30" :x2="72 + s.col * 34" :y2="60" class="conn-line" />
            <line :x1="72 + s.col * 34" :y1="72" :x2="72 + s.col * 34" :y2="84" class="conn-line" />
          </g>
        </template>
      </svg>

      <!-- 试商流程条 -->
      <div v-if="kind === 'div-try'" class="try-bar">
        <template v-for="(f, i) in tryFlow" :key="i">
          <span class="try-chip">{{ f.label }}</span>
          <span v-if="i < tryFlow.length - 1" class="try-arrow">→</span>
        </template>
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
      <p v-if="activeRound" class="round-note">
        第 {{ cur + 1 }} 轮：{{ activeRound.curVal }} ÷ {{ divisor }} = {{ activeRound.qd }}……{{ activeRound.rem }}（商写 {{ activeRound.qd }}，乘积 {{ activeRound.sub }}）
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
      <div class="formula-row">
        <span class="chip">{{ total }} ÷ {{ shelf }} = {{ perShelf }}</span>
        <span class="chip op">{{ perShelf }} ÷ {{ floor }} = {{ perFloor }}</span>
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
