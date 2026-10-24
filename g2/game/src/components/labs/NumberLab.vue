<script setup lang="ts">
/**
 * 数 Lab：三位数的组成（计数器）/ 三位数比大小 / 算盘拨珠
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { splitDigits } from '@/lib/engine/math'
import { abacusBeads, comparePlaces, placeReading } from '@/lib/labs/process'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()
const emit = defineEmits<{ acted: [] }>()

/* ---------- 过程态：0 = 全部摆好；>0 = 正在演示第 k 步 ---------- */
const step = ref(0)
const doing = computed(() => step.value > 0)

const kind = computed(() => props.lab.kind)
const list = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------- 三位数的组成 ---------- */
const h = computed(() => props.values.h ?? 1)
const t = computed(() => props.values.t ?? 2)
const o = computed(() => props.values.o ?? 4)
const pvNumber = computed(() => h.value * 100 + t.value * 10 + o.value)
const placeRows = computed(() => [
  { unit: '百', val: h.value },
  { unit: '十', val: t.value },
  { unit: '个', val: o.value },
])

/* ---------- 三位数比大小 ---------- */
const a = computed(() => props.values.a ?? 402)
const b = computed(() => props.values.b ?? 385)
const sign = computed(() => (a.value > b.value ? '>' : a.value < b.value ? '<' : '='))
const aDigits = computed(() => splitDigits(a.value))
const bDigits = computed(() => splitDigits(b.value))
const PLACE_NAMES = ['百位', '十位', '个位']

/** 逐位比较：返回第一个不同的位下标（0=百位），全同返回 -1 */
const diffIdx = computed(() => {
  const [ah, at, ao] = aDigits.value
  const [bh, bt, bo] = bDigits.value
  if (ah !== bh) return 0
  if (at !== bt) return 1
  if (ao !== bo) return 2
  return -1
})
const compareSteps = computed(() => {
  const names = ['先比百位', '再比十位', '再比个位']
  return names.map((label, i) => ({ label, dim: diffIdx.value >= 0 && i > diffIdx.value, hit: i === diffIdx.value }))
})
const isAllSame = computed(() => diffIdx.value === -1)
const compareRows = computed(() => PLACE_NAMES.map((place, i) => {
  const leftDigit = aDigits.value[i]!
  const rightDigit = bDigits.value[i]!
  const relation = leftDigit > rightDigit ? '>' : leftDigit < rightDigit ? '<' : '='
  const beforeDecision = diffIdx.value === -1 || i <= diffIdx.value
  const hit = i === diffIdx.value
  return {
    place,
    leftDigit,
    rightDigit,
    relation,
    hit,
    dim: !beforeDecision,
    note: hit
      ? `${place} ${leftDigit} ${relation} ${rightDigit}，高位已经分出大小`
      : relation === '='
        ? `${place}相同，继续比下一位`
        : '不用再比这一位',
  }
}))

/* ---------- 算盘 ---------- */
const ABACUS_NUMS = [
  { num: 5, how: '个位上珠表示 5' },
  { num: 105, how: '百位 1、个位 5' },
  { num: 234, how: '二百三十四' },
  { num: 360, how: '三百六十' },
  { num: 999, how: '九百九十九' },
]
const abacusSel = computed(() => Math.round(props.values.sel ?? 0) % ABACUS_NUMS.length)
const abacusNum = computed(() => ABACUS_NUMS[abacusSel.value]!.num)
const abacusRows = computed(() => {
  const [hh, tt, oo] = splitDigits(abacusNum.value)
  return [['百', hh], ['十', tt], ['个', oo]].map(([unit, v], i) => ({
    unit: String(unit),
    val: Number(v),
    upper: Number(v) >= 5 ? 1 : 0,
    lower: Number(v) % 5,
    weight: 10 ** (2 - i),
  }))
})
const abacusTotal = computed(() => abacusRows.value.reduce((s, r) => s + r.upper * 5 * r.weight + r.lower * r.weight, 0))
const UPPER = [1]
const LOWER = [1, 2, 3, 4]

/* ---------- 过程态：一档一档读数 / 逐位比较 / 一档一档拨珠 ---------- */
/** 数位表：从百位开始一档一档拨，累计到多少 */
const reading = computed(() => placeReading(pvNumber.value))
const curPlace = computed(() => (doing.value ? (reading.value[step.value - 1]?.place ?? '个位') : '三档都拨好'))
const curRunning = computed(() =>
  doing.value ? (reading.value[step.value - 1]?.running ?? 0) : pvNumber.value,
)
/** 比大小：比到第几位 */
const cmpSteps = computed(() => comparePlaces(a.value, b.value))
const curScan = computed(() => (doing.value ? step.value : 3))
/** 算盘：拨到第几档 */
const beads = computed(() => abacusBeads(abacusNum.value))
const curBead = computed(() => (doing.value ? step.value : 3))
const curAbacus = computed(() =>
  doing.value ? (beads.value[step.value - 1]?.running ?? 0) : abacusTotal.value,
)
const totalSteps = computed(() => {
  if (kind.value === 'place-value') return 3
  if (kind.value === 'compare') return cmpSteps.value.length
  return 3
})
const stepLabel = computed(() => (kind.value === 'compare' ? '比一位' : '拨一拨'))

function nextStep() {
  step.value = step.value >= totalSteps.value ? 0 : step.value + 1
  if (step.value > 0) emit('acted')
}

watch([h, t, o, a, b, abacusSel, kind], () => {
  step.value = 0
})

/* ---------- 方块模型（组成） ---------- */
const hundredCells = computed(() => list(h.value))
</script>

<template>
  <div class="num-wrap">
    <!-- 三位数的组成：数位表 + 计数器 + 方块模型 -->
    <template v-if="kind === 'place-value'">
      <div class="pv-grid">
        <div class="pv-slot">
          <p class="slot-title">① 数位表</p>
          <div class="pv-table">
            <div class="pv-head"><span>百位</span><span>十位</span><span>个位</span></div>
            <div class="pv-nums-cell">
              <span class="num-cell">{{ h }}</span>
              <span class="num-cell">{{ t }}</span>
              <span class="num-cell">{{ o }}</span>
            </div>
          </div>
        </div>
        <div class="pv-slot">
          <p class="slot-title">② 小方块</p>
          <div class="blocks">
            <div v-for="i in hundredCells" :key="'h' + i" class="hundred-block" aria-label="百">
              <span v-for="r in 10" :key="'r' + r" class="hundred-row">
                <span v-for="c in 10" :key="'c' + c" class="tiny-dot" />
              </span>
            </div>
            <div v-for="i in list(t)" :key="'t' + i" class="ten-rod" aria-label="十">
              <span v-for="r in 10" :key="'r' + r" class="rod-dot" />
            </div>
            <div v-for="i in list(o)" :key="'o' + i" class="one-dot" aria-label="个" />
          </div>
        </div>
        <div class="pv-slot">
          <p class="slot-title">③ 计数器</p>
          <div class="counter">
            <div
              v-for="(row, ri) in placeRows"
              :key="row.unit"
              class="counter-col"
              :class="{ dim: doing && ri + 1 > curBead }"
              :data-lit="!doing || ri + 1 <= curBead"
            >
              <span class="counter-unit">{{ row.unit }}</span>
              <div class="counter-beads">
                <span v-for="i in list(row.val)" :key="i" class="counter-bead" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="pv-num">{{ pvNumber }} = {{ h }}×100 + {{ t }}×10 + {{ o }}</p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">
          {{ stepLabel }}
        </button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `拨到${curPlace}：现在计数器上是 ${curRunning}`
              : '点「拨一拨」，从百位一档一档拨到个位'
          }}
        </span>
      </div>
    </template>

    <!-- 三位数比大小：并排数位表 + 逐位高亮 -->
    <template v-else-if="kind === 'compare'">
      <div class="cmp-row">
        <div class="cmp-card">
          <p class="cmp-big">{{ a }}</p>
          <div class="pv-table">
            <div class="pv-head"><span>百</span><span>十</span><span>个</span></div>
            <div class="pv-nums-cell">
              <span
                v-for="(d, i) in aDigits"
                :key="i"
                class="num-cell"
                :class="{ dim: !isAllSame && diffIdx >= 0 && i > diffIdx, hit: i === diffIdx }"
              >{{ d }}</span>
            </div>
          </div>
        </div>
        <p class="cmp-sym">{{ sign }}</p>
        <div class="cmp-card">
          <p class="cmp-big">{{ b }}</p>
          <div class="pv-table">
            <div class="pv-head"><span>百</span><span>十</span><span>个</span></div>
            <div class="pv-nums-cell">
              <span
                v-for="(d, i) in bDigits"
                :key="i"
                class="num-cell"
                :class="{ dim: !isAllSame && diffIdx >= 0 && i > diffIdx, hit: i === diffIdx }"
              >{{ d }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="cmp-steps">
        <span
          v-for="(s, i) in compareSteps"
          :key="i"
          class="step-chip"
          :class="{ dim: s.dim, hit: s.hit && !isAllSame }"
        >{{ s.label }}</span>
        <span class="step-chip final" :class="{ hit: !isAllSame }">
          {{ isAllSame ? '每一位都相同' : `结论：${a} ${sign} ${b}` }}
        </span>
      </div>
      <div class="cmp-scan" aria-label="逐位比较过程">
        <div
          v-for="(row, ri) in compareRows"
          :key="row.place"
          class="scan-row"
          :class="{ hit: row.hit && (!doing || ri + 1 <= curScan), dim: doing ? ri + 1 > curScan : row.dim }"
          :data-lit="!doing || ri + 1 <= curScan"
        >
          <span class="scan-place">{{ row.place }}</span>
          <span class="scan-digits">{{ row.leftDigit }} {{ row.relation }} {{ row.rightDigit }}</span>
          <span class="scan-note">{{ row.note }}</span>
        </div>
      </div>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">
          {{ stepLabel }}
        </button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `比到${cmpSteps[curScan - 1]?.place ?? '个位'}：${cmpSteps[curScan - 1]?.left} ${cmpSteps[curScan - 1]?.relation} ${cmpSteps[curScan - 1]?.right}${cmpSteps[curScan - 1]?.decided ? '，已经分出大小' : '，相同，还要往下比'}`
              : '点「比一位」，从百位开始一位一位比'
          }}
        </span>
      </div>
    </template>

    <!-- 算盘：上珠5 下珠1 + 档位贡献 -->
    <template v-else>
      <svg viewBox="0 0 300 150" class="abacus-svg" role="img">
        <rect x="10" y="6" width="280" height="138" rx="8" class="aba-frame" />
        <line x1="10" y1="62" x2="290" y2="62" class="aba-beam" />
        <g v-for="(row, i) in abacusRows" :key="i">
          <line :x1="30 + i * 80" :y1="10" :x2="30 + i * 80" :y2="140" class="aba-rod" />
          <line :x1="46 + i * 80" :y1="10" :x2="46 + i * 80" :y2="140" class="aba-rod" />
          <circle v-for="u in UPPER" :key="`u${i}`" :cx="30 + i * 80" :cy="u * 34" r="13" class="aba-bead upper" :class="{ on: row.upper >= u && (!doing || i + 1 <= curBead), off: doing && i + 1 > curBead }" />
          <circle v-for="l in LOWER" :key="`l${i}`" :cx="46 + i * 80" :cy="l * 20 + 86" r="13" class="aba-bead" :class="{ on: row.lower >= l && (!doing || i + 1 <= curBead), off: doing && i + 1 > curBead }" />
          <text :x="30 + i * 80" y="75" class="aba-unit">{{ row.unit }}位</text>
        </g>
      </svg>
      <div class="aba-value">
        <span v-for="(row, i) in abacusRows" :key="i" class="aba-contrib">{{ row.unit }}位：{{ row.val }}×{{ row.weight }}</span>
      </div>
      <p class="note">
        上珠 1 颗 = 5，下珠 1 颗 = 1。全部珠子的总数 =
        <b class="strong">{{ curAbacus }}</b>（读作：{{ ABACUS_NUMS[abacusSel]!.how }}）
      </p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">
          {{ stepLabel }}
        </button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `拨好${beads[curBead - 1]?.place}：上珠 ${beads[curBead - 1]?.upper} 颗、下珠 ${beads[curBead - 1]?.lower} 颗，一共 ${curAbacus}`
              : '点「拨一拨」，从百位一档一档拨珠'
          }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dim {
  opacity: 0.22;
}
.aba-bead.off {
  opacity: 0.15;
}
.step-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step-btn {
  border: 1px solid var(--ui-primary);
  background: var(--ui-bg);
  color: var(--ui-primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.22rem 0.9rem;
  cursor: pointer;
}
.step-say {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  max-width: 26rem;
  line-height: 1.4;
}
.num-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.pv-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}
.pv-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.7rem 0.9rem;
  max-width: 17rem;
}
.slot-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-muted);
  margin: 0;
}
.pv-table {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
  display: inline-grid;
}
.pv-head,
.pv-nums-cell {
  display: grid;
  grid-template-columns: repeat(3, minmax(2.6rem, 1fr));
}
.pv-head span {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
  padding: 0.2rem 0;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-default);
}
.pv-nums-cell span {
  text-align: center;
  padding: 0.4rem 0;
  font-size: 1.3rem;
  font-weight: 800;
  font-family: ui-monospace, monospace;
  color: var(--ui-text-highlighted);
}
.num-cell {
  transition: all 0.2s;
}
.num-cell.dim {
  opacity: 0.3;
}
.num-cell.hit {
  background: color-mix(in srgb, var(--ui-primary) 22%, var(--ui-bg));
  color: var(--ui-primary);
  box-shadow: inset 0 3px 0 var(--ui-primary);
}
.blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  max-width: 16rem;
}
.hundred-block {
  display: grid;
  grid-template-columns: repeat(10, 4.5px);
  grid-template-rows: repeat(10, 4.5px);
  gap: 0.5px;
  background: color-mix(in srgb, var(--ui-primary) 30%, white);
  padding: 1px;
  border-radius: 2px;
  border: 1px solid var(--ui-primary);
}
.tiny-dot {
  background: var(--ui-primary);
  border-radius: 1px;
}
.ten-rod {
  display: flex;
  gap: 1.5px;
  padding: 1px 1.5px;
  background: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 30%, white);
  border: 1px solid var(--ui-secondary, var(--ui-info));
  border-radius: 2px;
}
.rod-dot {
  width: 3.5px;
  height: 3.5px;
  background: var(--ui-secondary, var(--ui-info));
  border-radius: 1px;
}
.one-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--ui-color-success-500, #22c55e);
  border: 1px solid var(--ui-color-success-600, #16a34a);
}
.counter {
  display: flex;
  gap: 1rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.8rem 1.2rem;
  background: var(--ui-bg-default);
}
.counter-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.counter-unit {
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.counter-beads {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 5rem;
}
.counter-bead {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.pv-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.cmp-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 0.7rem 1.1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.cmp-big {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-sym {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.cmp-steps {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step-chip {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  padding: 0.25rem 0.7rem;
  transition: all 0.2s;
}
.step-chip.dim {
  opacity: 0.35;
}
.step-chip.hit {
  background: color-mix(in srgb, var(--ui-primary) 18%, var(--ui-bg));
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.step-chip.final {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.cmp-scan {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: min(100%, 30rem);
}
.scan-row {
  display: grid;
  grid-template-columns: 4.2rem 4.2rem 1fr;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.45rem 0.65rem;
  color: var(--ui-text-toned);
}
.scan-row.hit {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
}
.scan-row.dim {
  opacity: 0.45;
}
.scan-place {
  font-weight: 900;
  color: var(--ui-text-highlighted);
}
.scan-digits {
  justify-self: center;
  font-family: ui-monospace, monospace;
  font-size: 1.05rem;
  font-weight: 900;
  color: var(--ui-primary);
}
.scan-note {
  font-size: 0.82rem;
  font-weight: 700;
}
.abacus-svg {
  width: 280px;
  max-width: 100%;
}
.aba-frame {
  fill: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.aba-beam {
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.aba-rod {
  stroke: var(--ui-border-accented);
  stroke-width: 1;
}
.aba-bead {
  fill: var(--ui-bg);
  stroke: var(--ui-border-accented);
  stroke-width: 1.2;
}
.aba-bead.on {
  fill: var(--ui-primary);
  stroke: var(--ui-primary);
}
.aba-bead.upper {
  opacity: 0.9;
}
.aba-unit {
  fill: var(--ui-text-muted);
  font-size: 13px;
  font-weight: 700;
  text-anchor: middle;
}
.aba-value {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.aba-contrib {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
}
.note {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.strong {
  color: var(--ui-primary);
  font-weight: 800;
}

@media (max-width: 480px) {
  .scan-row {
    grid-template-columns: 3.5rem 3.6rem 1fr;
    gap: 0.35rem;
    padding: 0.4rem 0.5rem;
  }
  .scan-note {
    font-size: 0.76rem;
  }
}
</style>
