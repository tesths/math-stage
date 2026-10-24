<script setup lang="ts">
/**
 * 计算 Lab：表内乘除混合 / 有余数的除法 / 余数比除数小
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { koujue } from '@/lib/engine/math'
import { chunkGroups, remainderCycle } from '@/lib/labs/process'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()
const emit = defineEmits<{ acted: [] }>()

const kind = computed(() => props.lab.kind)
const list = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------- 表内乘除混合 ---------- */
const a = computed(() => props.values.a ?? 6)
const b = computed(() => props.values.b ?? 7)
const mode = computed(() => Math.round(props.values.mode ?? 0))
const prod = computed(() => a.value * b.value)

/* ---------- 有余数的除法 ---------- */
const total = computed(() => props.values.total ?? 10)
const per = computed(() => props.values.per ?? 3)
const q = computed(() => Math.floor(total.value / per.value))
const r = computed(() => total.value % per.value)
const groups = computed(() => list(q.value))
const pcols = computed(() => list(per.value))

/* ---------- 余数比除数小 ---------- */
const d = computed(() => props.values.d ?? 3)
const maxR = computed(() => d.value - 1)
const remRows = computed(() =>
  list(d.value).map((rr) => ({
    r: rr,
    dividend: d.value * 3 + rr,
    expr: `${d.value * 3 + rr} ÷ ${d.value}`,
  })),
)

/* ---------- 过程态 ---------- */
/** 0 = 全部摆好；>0 = 正在演示第 k 步 */
const step = ref(0)
/** 有余数除法：圈到第几份 */
const chunks = computed(() => chunkGroups(total.value, per.value))
const curGroups = computed(() => (step.value > 0 ? (chunks.value[step.value - 1]?.state.groups ?? 0) : q.value))
/** 余数循环：余数走到第几个 */
const cycle = computed(() => remainderCycle(d.value))
const curR = computed(() => (step.value > 0 ? (cycle.value[step.value - 1]?.remainder ?? 0) : maxR.value))
/** 表内乘除：一句口诀先写乘法、再写两道除法 */
const famRows = computed(() => [
  { expr: `${a.value} × ${b.value} = ${prod.value}`, note: '先想口诀' },
  { expr: `${prod.value} ÷ ${a.value} = ${b.value}`, note: `因为 ${koujue(a.value, b.value)}` },
  { expr: `${prod.value} ÷ ${b.value} = ${a.value}`, note: `因为 ${koujue(a.value, b.value)}` },
])
const curFam = computed(() => (step.value > 0 ? step.value : famRows.value.length))
const totalSteps = computed(() => {
  if (kind.value === 'table-calc') return famRows.value.length
  if (kind.value === 'remainder') return chunks.value.length
  return cycle.value.length
})
const doing = computed(() => step.value > 0)

const stepLabel = computed(() => {
  if (kind.value === 'table-calc') return '写一道'
  if (kind.value === 'remainder') return '再分一份'
  return '再加 1'
})

function nextStep() {
  step.value = step.value >= totalSteps.value ? 0 : step.value + 1
  if (step.value > 0) emit('acted')
}

watch([a, b, mode, total, per, d, kind], () => {
  step.value = 0
})
</script>

<template>
  <div class="calc-wrap">
    <!-- 表内乘除混合 -->
    <template v-if="kind === 'table-calc'">
      <div class="kj-card">
        <p class="kj-expr">
          {{ mode === 1 ? `${prod} ÷ ${a} = ${b}` : `${a} × ${b} = ${prod}` }}
        </p>
        <p class="kj-text">{{ koujue(a, b) }}</p>
        <div class="family">
          <span
            v-for="(row, i) in famRows"
            :key="row.expr"
            :class="{ dim: i + 1 > curFam }"
            :data-lit="i + 1 <= curFam"
          >{{ row.expr }}</span>
        </div>
      </div>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">
          {{ stepLabel }}
        </button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `第 ${step} 句：${famRows[step - 1]?.expr}（${famRows[step - 1]?.note}）`
              : '一句口诀能写出 1 道乘法和 2 道除法，点「写一道」一句一句来'
          }}
        </span>
      </div>
    </template>

    <!-- 有余数的除法 -->
    <template v-else-if="kind === 'remainder'">
      <p class="lead">{{ total }} 个，每 {{ per }} 个一份</p>
      <div class="pgroup-box">
        <div v-for="g in groups" :key="g" class="pgroup" :class="{ dim: g + 1 > curGroups }">
          <span v-for="cc in pcols" :key="cc" class="share-item" />
        </div>
        <div v-if="r > 0" class="pgroup pgroup-left">
          <span v-for="i in list(r)" :key="i" class="share-item leftover" />
        </div>
      </div>
      <p class="lead calc-expr">{{ total }} ÷ {{ per }} = {{ q }} …… {{ r }}</p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">
          {{ stepLabel }}
        </button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `圈了 ${curGroups} 份，还剩 ${total - curGroups * per} 个，不够再分一份了`
              : `点「再分一份」，每 ${per} 个一份圈下去，看最后剩几个`
          }}
        </span>
      </div>
    </template>

    <!-- 余数比除数小 -->
    <template v-else>
      <p class="lead">除以 {{ d }} 的余数</p>
      <div class="rem-table">
        <div
          v-for="row in remRows"
          :key="row.r"
          class="rem-row"
          :class="{ dim: step > 0 && row.r > curR }"
        >
          <span class="rem-expr">{{ row.expr }}</span>
          <span class="rem-gap">= 3 ……</span>
          <span class="rem-r" :class="{ max: row.r === maxR }">{{ row.r }}</span>
        </div>
      </div>
      <p class="lead">最大余数是 {{ maxR }}（比除数小）</p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">
          {{ stepLabel }}
        </button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `再多 1 个：${cycle[step - 1]?.dividend} ÷ ${d} = ${cycle[step - 1]?.quotient} …… ${curR}`
              : `点「再加 1」，被除数一个一个加，看余数怎么变（余数最大只能是 ${maxR}）`
          }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.calc-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.dim {
  opacity: 0.22;
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
}
.lead {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.calc-expr {
  font-family: ui-monospace, monospace;
  color: var(--ui-primary);
}
.kj-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 1rem 1.8rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  min-width: 15rem;
}
.kj-expr {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
.kj-text {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.family {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.pgroup-box {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.7rem;
  background: var(--ui-bg-muted);
  max-width: 36rem;
}
.pgroup {
  display: flex;
  gap: 0.25rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  padding: 0.25rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.pgroup-left {
  border-style: dashed;
  border-color: var(--ui-error, #dc2626);
}
.share-item {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 50%, white);
  border: 1px solid var(--ui-primary);
}
.share-item.leftover {
  background: var(--ui-error, #dc2626);
  border-color: var(--ui-error, #dc2626);
}
.rem-table {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.7rem 1.2rem;
  background: var(--ui-bg-muted);
}
.rem-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-family: ui-monospace, monospace;
}
.rem-expr {
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.rem-gap {
  color: var(--ui-text-muted);
}
.rem-r {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--ui-primary) 25%, transparent);
  color: var(--ui-primary);
}
.rem-r.max {
  background: var(--ui-error, #dc2626);
  color: white;
}
</style>
