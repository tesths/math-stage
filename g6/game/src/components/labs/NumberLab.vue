<script setup lang="ts">
/**
 * 数与运算 Lab：数位与计数单位 / 数的大小比较 / 运算意义一致性 / 二进制的秘密
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toBinary, toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 数位与计数单位 ---------- */
const PLACE_NUMS = [
  {
    v: 231,
    label: '231',
    rows: [
      { unit: '百', val: 2, pow: 100 },
      { unit: '十', val: 3, pow: 10 },
      { unit: '一', val: 1, pow: 1 },
    ],
  },
  {
    v: 2000,
    label: '2000',
    rows: [
      { unit: '千', val: 2, pow: 1000 },
      { unit: '百', val: 0, pow: 100 },
      { unit: '十', val: 0, pow: 10 },
      { unit: '一', val: 0, pow: 1 },
    ],
  },
  {
    v: 3.36,
    label: '3.36',
    rows: [
      { unit: '一', val: 3, pow: 1 },
      { unit: '十分之一', val: 3, pow: 0.1 },
      { unit: '百分之一', val: 6, pow: 0.01 },
    ],
  },
  {
    v: 4.05,
    label: '4.05',
    rows: [
      { unit: '一', val: 4, pow: 1 },
      { unit: '十分之一', val: 0, pow: 0.1 },
      { unit: '百分之一', val: 5, pow: 0.01 },
    ],
  },
  {
    v: 0.24,
    label: '0.24',
    rows: [
      { unit: '十分之一', val: 2, pow: 0.1 },
      { unit: '百分之一', val: 4, pow: 0.01 },
    ],
  },
]
const place = computed(() => PLACE_NUMS[Math.round(props.values.sel ?? 0) % PLACE_NUMS.length]!)
const beads = (n: number) => Array.from({ length: Math.min(n, 12) }, (_, i) => i)

/* ---------- 数的大小比较 ---------- */
const COMPARE_PAIRS = [
  { a: '1000', b: '923', gt: true, how: '1000 是 10 个百，923 不足 10 个百' },
  { a: '3.34', b: '3.4', gt: false, how: '3.34 = 33.4 个 0.1，3.4 = 34 个 0.1' },
  { a: '4.7', b: '4.05', gt: true, how: '47 个 0.1 > 40.5 个 0.1' },
  { a: '2/3', b: '3/5', gt: true, how: '通分后 10/15 > 9/15' },
  { a: '0.78', b: '0.87', gt: false, how: '78 个 0.01 < 87 个 0.01' },
]
const pair = computed(() => COMPARE_PAIRS[Math.round(props.values.sel ?? 0) % COMPARE_PAIRS.length]!)

/* ---------- 运算意义一致性 ---------- */
const OP_EXAMPLES = [
  { expr: '20 × 3', how: '2 个十 × 3 = 6 个十 = 60', ans: '60', unit: '个十', n: 6 },
  { expr: '2/5 × 3', how: '(1/5 × 2) × 3 = 1/5 × 6 = 6/5', ans: '6/5', unit: '1/5', n: 6 },
  { expr: '1200 ÷ 3', how: '12 个百 ÷ 3 = 4 个百 = 400', ans: '400', unit: '个百', n: 4 },
  { expr: '1200 ÷ 400', how: '12 个百 ÷ 4 个百 = 12 ÷ 4 = 3', ans: '3', unit: '（同计数单位直接比个数）', n: 3 },
  { expr: '135 + 24', how: '1 个百 + 3 个十 + 5 个一，加上 2 个十 + 4 个一', ans: '159', unit: '个一（从低到高进位）', n: 9 },
  { expr: '3.4 + 1.25', how: '34 个 0.1 + 125 个 0.01', ans: '4.65', unit: '0.01', n: 465 },
]
const op = computed(() => OP_EXAMPLES[Math.round(props.values.sel ?? 0) % OP_EXAMPLES.length]!)

/* ---------- 二进制的秘密 ---------- */
const dec = computed(() => Math.round(props.values.dec ?? 5))
const bin = computed(() => toBinary(dec.value))
const bits = computed(() => {
  const padded = bin.value.padStart(5, '0')
  return padded.split('').map((ch, i) => ({
    bit: Number(ch),
    weight: 2 ** (4 - i),
    count: Number(ch) * 2 ** (4 - i),
  }))
})
const binarySteps = computed(() => {
  const steps: { expr: string; result: string }[] = []
  let v = dec.value
  if (v === 0) steps.push({ expr: '0 ÷ 2', result: '商 0 余 0' })
  while (v > 0) {
    steps.push({ expr: `${v} ÷ 2`, result: `商 ${Math.floor(v / 2)} 余 ${v % 2}` })
    v = Math.floor(v / 2)
  }
  return steps
})
</script>

<template>
  <div class="num-wrap">
    <!-- 数位与计数单位 -->
    <template v-if="kind === 'place-value'">
      <p class="pv-num">{{ place.label }}</p>
      <div class="pv-table">
        <div v-for="r in place.rows" :key="r.unit" class="pv-row">
          <span class="pv-unit">{{ r.unit }}</span>
          <div class="pv-beads">
            <span v-for="i in beads(r.val)" :key="i" class="pv-bead" />
          </div>
          <span class="pv-pow">{{ r.val }} × {{ toFixed2(r.pow) }}</span>
        </div>
      </div>
      <p class="note">
        {{ place.label }} = {{ place.rows.filter((r) => r.val > 0).map((r) => `${r.val} 个${r.unit}`).join(' + ') }}
      </p>
    </template>

    <!-- 数的大小比较 -->
    <template v-else-if="kind === 'compare-unit'">
      <div class="cmp-card">
        <p class="cmp-big">
          {{ pair.a }} <span class="cmp-sym">{{ pair.gt ? '>' : '<' }}</span> {{ pair.b }}
        </p>
        <p class="cmp-how">{{ pair.how }}</p>
        <p class="note">比较数的大小 = 比较相同计数单位的个数</p>
      </div>
    </template>

    <!-- 运算意义一致性 -->
    <template v-else-if="kind === 'op-consistency'">
      <div class="cmp-card">
        <p class="cmp-big">{{ op.expr }} = {{ op.ans }}</p>
        <p class="cmp-how">{{ op.how }}</p>
        <div class="unit-pills">
          <span v-for="i in Math.min(op.n, 12)" :key="i" class="unit-pill">{{ op.unit }}</span>
          <span v-if="op.n > 12" class="unit-pill">…共 {{ op.n }} 个</span>
        </div>
        <p class="note">四则运算都是把相同计数单位的个数进行计算</p>
      </div>
    </template>

    <!-- 二进制的秘密 -->
    <template v-else>
      <p class="pv-num">十进制 {{ dec }} = 二进制（{{ bin }}）₂</p>
      <div class="bin-counter">
        <div v-for="bt in bits" :key="bt.weight" class="bin-bit">
          <span class="bin-weight">{{ bt.weight }}</span>
          <div class="bin-beads">
            <span v-for="i in bt.count" :key="i" class="bin-bead" />
          </div>
          <span class="bin-digit">{{ bt.bit }}</span>
        </div>
      </div>
      <div class="bin-steps">
        <p v-for="(s, i) in binarySteps" :key="i" class="bin-step">
          {{ s.expr }} → {{ s.result }}
        </p>
      </div>
      <p class="note">二进制按"满二进一"的规则计数，余数倒序排列就是二进制数</p>
    </template>
  </div>
</template>

<style scoped>
.num-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.pv-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.pv-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.pv-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.pv-unit {
  width: 4rem;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: right;
}
.pv-beads {
  display: flex;
  gap: 2px;
  min-width: 8.5rem;
}
.pv-bead {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border: 1px solid var(--ui-primary);
}
.pv-pow {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.cmp-card {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 1rem 1.4rem;
  text-align: center;
  min-width: 16rem;
  max-width: 22rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.cmp-big {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-sym {
  color: var(--ui-primary);
}
.cmp-how {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.unit-pills {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.unit-pill {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border: 1px solid var(--ui-primary);
  color: var(--ui-primary);
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
}
.bin-counter {
  display: flex;
  gap: 0.8rem;
}
.bin-bit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.6rem;
  background: var(--ui-bg-muted);
}
.bin-weight {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.bin-beads {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 6rem;
  justify-content: flex-start;
}
.bin-bead {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.bin-digit {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.bin-steps {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
</style>
