<script setup lang="ts">
/**
 * 乘法 Lab：口算乘法（整十整百）、笔算乘法（竖式）、中间有 0 的乘法
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* mul-oral */
const base = computed(() => props.values.base ?? props.values.price ?? 40)
const count = computed(() => Math.round(props.values.count ?? 3))
const isEstimate = computed(() => props.values.money !== undefined)
const rounded = computed(() => Math.round(base.value / 10) * 10)
const est = computed(() => rounded.value * count.value)
const enough = computed(() => est.value <= (props.values.money ?? 0))

/** 把整十整百数分解为数量单位：40 → { n: 4, unit: '十' } */
const baseUnit = computed(() => {
  if (base.value >= 100) return { n: base.value / 100, unit: '百' }
  if (base.value >= 10) return { n: base.value / 10, unit: '十' }
  return { n: base.value, unit: '一' }
})

const rodCount = computed(() => Math.min(baseUnit.value.n, 9))

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

/** 逐位乘积（从个位起），用于竖式展示 */
const rows = computed(() => {
  const out: { digit: number; carry: number; place: number }[] = []
  let carry = 0
  for (let i = digits.value.length - 1; i >= 0; i--) {
    const prod = digits.value[i]! * multi.value + carry
    out.push({ digit: prod % 10, carry: Math.floor(prod / 10), place: i })
    carry = Math.floor(prod / 10)
  }
  if (carry > 0) out.push({ digit: carry, carry: 0, place: -1 })
  return out.reverse()
})

/** 竖式每一行需要显示的进位提示 */
const carryNotes = computed(() => {
  const notes: string[] = []
  let carry = 0
  for (let i = digits.value.length - 1; i >= 0; i--) {
    const prod = digits.value[i]! * multi.value + carry
    if (carry > 0) notes.push(`${digits.value[i]} × ${multi.value} + 进${carry} = ${prod}`)
    else notes.push(`${digits.value[i]} × ${multi.value} = ${prod}`)
    carry = Math.floor(prod / 10)
  }
  return notes.reverse()
})

const isZero = computed(() => props.values.mid !== undefined)
</script>

<template>
  <div class="mul-wrap">
    <!-- 口算乘法：整十整百数点子图 -->
    <template v-if="kind === 'mul-oral'">
      <template v-if="isEstimate">
        <div class="estimate-card">
          <p class="est-line">单价 {{ base }} 元 ≈ 整十数 <b>{{ rounded }}</b> 元</p>
          <p class="est-line">{{ rounded }} × {{ count }} = <b>{{ est }}</b> 元</p>
          <p class="est-result" :class="enough ? 'ok' : 'no'">
            {{ base }} × {{ count }} = {{ base * count }} 元 {{ enough ? '≤' : '>' }} 带的钱 {{ props.values.money }} 元 → {{ enough ? '够买' : '不够买' }}
          </p>
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
          <span v-for="i in rodCount" :key="'r' + i" class="ten-rod">
            <span v-for="j in 10" :key="'d' + j" class="rod-dot" />
          </span>
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
          <div class="v-num">
            <span v-for="(d, i) in digits" :key="'n' + i" class="v-digit">{{ d }}</span>
          </div>
          <div class="v-times">
            <span class="v-op">×</span>
            <span class="v-digit">{{ multi }}</span>
          </div>
          <div class="v-line" />
          <div class="v-result">
            <span v-for="(d, i) in String(product).split('')" :key="'p' + i" class="v-digit result-digit">
              {{ d }}
            </span>
          </div>
          <!-- 进位小字 -->
          <div class="v-carry">
            <template v-if="isZero && String(product).includes('0')">
              <span class="carry-note">十位写 0</span>
            </template>
          </div>
        </div>
        <div class="pen-notes">
          <p v-for="(n, i) in carryNotes" :key="i" class="note-line">{{ i + 1 }}. {{ n }}</p>
          <p class="note-result">= {{ num }} × {{ multi }} = <b>{{ product }}</b></p>
        </div>
      </div>
      <p v-if="isZero" class="zero-tip">💡 十位是 0，0 × {{ multi }} = 0，积的十位写 0 占位</p>
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
.v-num,
.v-times,
.v-result {
  display: flex;
  gap: 0.1rem;
}
.v-op {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  margin-right: 0.4rem;
}
.v-digit {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.result-digit {
  color: var(--ui-primary);
}
.v-line {
  width: 7rem;
  border-top: 2px solid var(--ui-text-highlighted);
  margin: 0.3rem 0;
}
.v-carry {
  height: 1.2rem;
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
  max-width: 18rem;
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
