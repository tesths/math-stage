<script setup lang="ts">
/**
 * 乘法 Lab：口算乘法（整十整百）、笔算乘法（竖式）、中间有 0 的乘法
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { estimateEnough, verticalMul } from '@/lib/labs/arith'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* mul-oral */
const base = computed(() => props.values.base ?? props.values.price ?? 40)
const count = computed(() => Math.round(props.values.count ?? 3))
const isEstimate = computed(() => props.values.money !== undefined)
const money = computed(() => props.values.money ?? 0)
/** 估算三值判定：估大不超→一定够；估小已超→一定不够；其余不能靠估算下结论 */
/** 过程态：估算三步（估大 → 估小 → 精算） */
const estStep = ref(isEstimate.value ? 3 : 0)
function nextEst() {
  estStep.value = estStep.value >= 3 ? 1 : estStep.value + 1
}
const estimate = computed(() => estimateEnough(base.value, count.value, money.value))
const verdictText = computed(() =>
  estimate.value.verdict === 'enough' ? '一定够买' : estimate.value.verdict === 'not-enough' ? '一定不够买' : '估算不能确定，要精算',
)

/** 把整十整百数分解为数量单位：40 → { n: 4, unit: '十' } */
const baseUnit = computed(() => {
  if (base.value >= 100) return { n: base.value / 100, unit: '百' }
  if (base.value >= 10) return { n: base.value / 10, unit: '十' }
  return { n: base.value, unit: '一' }
})

const rodCount = computed(() => Math.min(baseUnit.value.n, 9))
/** 过程态：口算的小棒一捆一捆地数 */
const rodsShown = ref(rodCount.value)
function nextRod() {
  rodsShown.value = rodsShown.value >= rodCount.value ? 1 : rodsShown.value + 1
}

/* mul-pen */
const multi = computed(() => Math.round(props.values.multi ?? 3))
const hasTens = computed(() => props.values.tens !== undefined)
const digits = computed(() => {
  if (hasTens.value) return [props.values.tens ?? 1, props.values.ones ?? 0]
  if (props.values.mid !== undefined) return [props.values.h ?? 1, props.values.mid ?? 0, props.values.o ?? 0]
  return [props.values.h ?? 2, props.values.t ?? 3, props.values.o ?? 4]
})
const num = computed(() => digits.value.reduce((acc, d) => acc * 10 + d, 0))
const product = computed(() => num.value * multi.value)

/**
 * 竖式的每一列、每一步都由 `verticalMul` 统一算出（与「分步思考」面板同一份文字）：
 * 4 × 3 = 12 → 写 2 进 1 → 十位 1 × 3 + 进 1 = 4。
 */
const isZero = computed(() => props.values.mid !== undefined && Math.round(props.values.mid) === 0)
const vm = computed(() => verticalMul(digits.value, multi.value))
const cols = computed(() => vm.value.cols)
const stepOrder = computed(() => vm.value.order)
const stepNotes = computed(() => vm.value.notes.map((text, idx) => ({ idx, text })))

/** 当前演示步骤（0 = 从个位开始） */
const cur = ref(0)
const setStep = (i: number) => {
  cur.value = Math.min(Math.max(i, 0), Math.max(stepOrder.value.length - 1, 0))
}
const nextStep = () => setStep(cur.value + 1)
const prevStep = () => setStep(cur.value - 1)
const resetSteps = () => setStep(0)

const currentStep = computed(() => Math.min(cur.value, Math.max(stepOrder.value.length - 1, 0)))
const activeNote = computed(() => stepNotes.value[currentStep.value])
const activeCol = computed(() => stepOrder.value[currentStep.value] ?? cols.value.length - 1)
/** 某一列是否为当前演示列 */
const isCur = (idx: number) => idx === activeCol.value
const colStepPos = (idx: number) => stepOrder.value.indexOf(idx)
const isDone = (idx: number) => {
  const pos = colStepPos(idx)
  return pos >= 0 && pos < currentStep.value
}
const isPending = (idx: number) => {
  const pos = colStepPos(idx)
  return pos > currentStep.value
}
/** 进位气泡显示在下一步要计算的高位上方 */
const carryBubble = (idx: number) => {
  const c = cols.value[idx]
  return c && c.src !== null ? c.carryIn : 0
}
/** 积的第 i 位对应哪一列（积可能比被乘数多一位，不能直接用 i） */
const resultCol = (i: number) => cols.value.length - String(vm.value.product).length + i
const resultStepPos = (i: number) => colStepPos(resultCol(i))
/** 已经算出的积的位数（过程态：没算到的位不显示，避免一上来就剧透答案） */
const shownResultCount = computed(() => {
  let n = 0
  for (let i = 0; i < String(vm.value.product).length; i++) {
    if (resultStepPos(i) >= 0 && resultStepPos(i) <= currentStep.value) n++
  }
  return n
})
</script>

<template>
  <div class="mul-wrap">
    <!-- 口算乘法：整十整百数点子图 -->
    <template v-if="kind === 'mul-oral'">
      <template v-if="isEstimate">
        <div class="estimate-card">
          <p v-if="estStep >= 1" class="est-line">
            把单价 {{ base }} 元往上估成 <b>{{ estimate.upperPrice }}</b> 元：{{ estimate.upperPrice }} × {{ count }} = <b>{{ estimate.upper }}</b> 元
          </p>
          <p v-if="estStep >= 2" class="est-line">
            往下估成 <b>{{ estimate.lowerPrice }}</b> 元：{{ estimate.lowerPrice }} × {{ count }} = <b>{{ estimate.lower }}</b> 元
          </p>
          <p v-if="estStep >= 3" class="est-line">精算：{{ base }} × {{ count }} = <b>{{ estimate.exact }}</b> 元，带 {{ money }} 元</p>
          <p v-if="estStep >= 3" class="est-result" :class="estimate.verdict === 'not-enough' ? 'no' : estimate.verdict === 'enough' ? 'ok' : 'maybe'" data-test="estimate-verdict">
            {{ verdictText }}
          </p>
          <p v-else class="est-line muted" data-test="est-progress">第 {{ estStep }} / 3 步：先估大，再估小，最后精算</p>
        </div>
        <div class="pen-buttons">
          <button type="button" class="pen-btn primary" data-test="est-next" @click="nextEst">
            试一试：先估大，再估小，最后精算
          </button>
          <button type="button" class="pen-btn ghost" data-test="est-reset" @click="estStep = 3">重来</button>
        </div>
      </template>
      <template v-else>
        <div v-if="baseUnit.unit === '百'" class="blocks-row">
          <div v-for="i in rodCount" :key="'b' + i" class="hundred-block">
            <span v-for="r in 10" :key="'r' + r" class="hundred-row">
              <span v-for="c2 in 10" :key="'c' + c2" class="tiny-dot" />
            </span>
          </div>
        </div>
        <div v-else class="blocks-row">
          <span
            v-for="i in rodCount"
            :key="'r' + i"
            class="ten-rod"
            :class="{ dim: i > rodsShown }"
          >
            <span v-for="j in 10" :key="'d' + j" class="rod-dot" />
          </span>
        </div>
        <div class="pen-buttons">
          <button type="button" class="pen-btn primary" data-test="rod-next" @click="nextRod">
            试一试：一捆一捆地数（已数 {{ rodsShown }} / {{ rodCount }} 捆 = {{ rodsShown * 10 }} 个点）
          </button>
        </div>
        <p class="decompose">{{ baseUnit.n }} 个{{ baseUnit.unit }} × {{ count }} = {{ baseUnit.n * count }} 个{{ baseUnit.unit }}</p>
        <div class="formula-row">
          <span class="chip">{{ baseUnit.n }} × {{ count }} = {{ baseUnit.n * count }}</span>
          <span class="chip op">末尾添 0</span>
          <span class="chip result">{{ base }} × {{ count }} = {{ base * count }}</span>
        </div>
      </template>
    </template>

    <!-- 笔算乘法：竖式 -->
    <template v-else>
      <div class="pen-grid">
        <div class="vertical">
          <!-- 进位气泡行 -->
          <div class="v-bubble-row">
            <span
              v-for="(c, i) in cols"
              :key="'b' + i"
              class="bubble-slot"
              :class="{ show: carryBubble(i) > 0 && colStepPos(i) <= currentStep, at: i === activeCol }"
            >
              <span v-if="carryBubble(i) > 0 && colStepPos(i) <= currentStep" class="carry-bubble">{{ carryBubble(i) }}</span>
            </span>
          </div>
          <!-- 被乘数数位列 -->
          <div class="v-cols">
            <span v-for="(c, i) in cols" :key="'c' + i" class="col" :class="{ active: isCur(i), done: isDone(i), pending: isPending(i), blank: c.src === null }">
              <span class="col-digit">{{ c.src ?? '' }}</span>
            </span>
          </div>
          <div class="v-op-row">
            <span class="v-op">×</span>
            <span class="v-digit">{{ multi }}</span>
          </div>
          <div class="v-line" />
          <div class="v-result">
            <span
              v-for="(d, i) in String(product).split('')"
              :key="'p' + i"
              class="v-digit result-digit"
              :class="{ active: resultCol(i) === activeCol, pending: resultStepPos(i) > currentStep, shown: resultStepPos(i) >= 0 && resultStepPos(i) <= currentStep }"
              :data-test="'result-digit-' + i"
            >{{ d }}</span>
          </div>
        </div>
        <div class="pen-notes">
          <div class="step-bar">
            <button
              v-for="(n, i) in stepNotes"
              :key="i"
              type="button"
              class="step-chip"
              :class="{ on: i === cur }"
              @click="setStep(i)"
            >
              {{ i + 1 }}
            </button>
          </div>
          <p class="note-line">
            第 {{ cur + 1 }} / {{ stepNotes.length }} 步：{{ activeNote?.text }}
          </p>
          <div class="pen-buttons">
            <button type="button" class="pen-btn" data-test="mul-prev" :disabled="cur === 0" @click="prevStep">上一步</button>
            <button
              type="button"
              class="pen-btn primary"
              data-test="mul-next"
              :disabled="cur >= stepNotes.length - 1"
              @click="nextStep"
            >
              演示下一步
            </button>
            <button type="button" class="pen-btn ghost" data-test="mul-reset" @click="resetSteps">重来</button>
          </div>
          <p class="note-result" data-test="mul-progress">
            {{ num }} × {{ multi }} = <b>{{ product }}</b>（已写出 {{ shownResultCount }} / {{ String(product).length }} 位）
          </p>
        </div>
      </div>
      <p v-if="isZero" class="zero-tip" data-test="zero-tip">
        💡 十位是 0：0 × {{ multi }} = 0，积的十位必须写 0 占位（不能跳过这一位）
      </p>
      <p v-else-if="Math.round(props.values.o ?? -1) === 0" class="zero-tip" data-test="zero-tip">
        💡 末尾有 0：先算 {{ Math.round(num / 10) }} × {{ multi }} = {{ Math.round(num / 10) * multi }}，再在积的末尾添 0，得 {{ product }}
      </p>
    </template>
  </div>
</template>

<style scoped>
.mul-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.blocks-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  align-items: center;
}
.hundred-block {
  display: grid;
  grid-template-columns: repeat(10, 7px);
  grid-template-rows: repeat(10, 7px);
  gap: 1px;
  border: 1.5px solid var(--ui-primary);
  border-radius: 3px;
  padding: 2px;
  background: color-mix(in srgb, var(--ui-primary) 10%, white);
}
.tiny-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.ten-rod {
  display: flex;
  gap: 3px;
  align-items: center;
  border: 1.5px solid var(--ui-primary);
  border-radius: 6px;
  padding: 5px 8px;
}
.rod-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
}
.decompose {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.dim {
  opacity: 0.3;
}
.est-line.muted {
  color: var(--ui-text-muted);
  font-size: 0.8rem;
}
.estimate-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 1rem 1.4rem;
  background: var(--ui-bg-muted);
}
.est-line {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.est-line b {
  color: var(--ui-primary);
}
.est-result {
  font-size: 0.95rem;
  font-weight: 700;
  margin-top: 0.3rem;
}
.est-result.ok {
  color: var(--ui-success, #16a34a);
}
.est-result.no {
  color: var(--ui-error, #dc2626);
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
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
  font-weight: 700;
}
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.pen-grid {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.vertical {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: ui-monospace, monospace;
}
.v-bubble-row,
.v-cols {
  display: flex;
  gap: 0.2rem;
}
.bubble-slot {
  width: 1.9rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.carry-bubble {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: var(--ui-warning, #f59e0b);
  color: white;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.bubble-slot.at .carry-bubble {
  animation: bubblePop 0.4s ease;
}
@keyframes bubblePop {
  0% {
    transform: scale(0.4);
  }
  60% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
.col {
  width: 1.9rem;
  text-align: center;
  padding: 0.15rem 0;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.col-digit {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.col.active {
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}
.col.active .col-digit {
  color: var(--ui-primary);
}
.col.done .col-digit {
  color: var(--ui-text-highlighted);
}
.col.pending .col-digit {
  color: var(--ui-text-muted);
  opacity: 0.45;
}
.col.blank {
  opacity: 0.5;
}
.v-op-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}
.v-op {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.v-digit {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.result-digit {
  color: var(--ui-primary);
}
.result-digit.active {
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  border-radius: 6px;
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}
.pen-buttons {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.pen-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
}
.pen-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.pen-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.pen-btn.ghost {
  color: var(--ui-text-muted);
}
.result-digit.pending {
  color: var(--ui-text-muted);
  /* 过程态：还没算到的那一位先不显示，避免一上来就把答案写在竖式里 */
  opacity: 0;
}
.v-line {
  width: 7rem;
  border-top: 2px solid var(--ui-text-highlighted);
  margin: 0.3rem 0;
}
.v-result {
  display: flex;
  gap: 0.1rem;
}
.step-bar {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
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
.carry-note {
  font-size: 0.8rem;
  color: var(--ui-error, #dc2626);
  font-weight: 700;
}
.pen-notes {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  max-width: 25rem;
}
.note-line {
  font-weight: 700;
  color: var(--ui-primary);
  min-height: 1.4rem;
}
.note-result {
  margin-top: 0.4rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.note-result b {
  color: var(--ui-primary);
  font-size: 1.15rem;
}
.zero-tip {
  font-size: 0.9rem;
  color: var(--ui-primary);
  font-weight: 600;
}
</style>
