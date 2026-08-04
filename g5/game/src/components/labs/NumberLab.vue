<script setup lang="ts">
/**
 * 因数与倍数 Lab：因数拼图 / 倍数数轴 / 质数筛 / 公因数公倍数
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { factorsOf, isPrime, lcm, primesUpTo } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 因数 ---------- */
const n = computed(() => Math.round(props.values.n ?? 0))
const factorPairs = computed(() => {
  const out: { w: number; h: number }[] = []
  for (let i = 1; i * i <= n.value; i++) {
    if (n.value % i === 0) out.push({ w: i, h: n.value / i })
  }
  return out.slice(0, 6)
})
const allFactors = computed(() => factorsOf(n.value))

/* ---------- 倍数 ---------- */
const mBase = computed(() => Math.round(props.values.n ?? 3))
const mCount = computed(() => Math.round(props.values.k ?? 10))
const multiples = computed(() => Array.from({ length: mCount.value }, (_, i) => mBase.value * (i + 1)))
const lineMax = computed(() => Math.max(60, multiples.value[multiples.value.length - 1]!))
const lineStep = computed(() => {
  const s = Math.ceil(lineMax.value / 15 / 5) * 5
  return Math.max(1, s)
})

/* ---------- 质数 ---------- */
const primeN = computed(() => Math.round(props.values.n ?? 50))
const primes = computed(() => primesUpTo(primeN.value))
const primeSet = computed(() => new Set(primes.value))
const table = computed(() => {
  const rows: number[][] = []
  for (let i = 2; i <= primeN.value; i += 10) {
    rows.push(Array.from({ length: Math.min(10, primeN.value - i + 1) }, (_, j) => i + j))
  }
  return rows
})

/* ---------- 公因数公倍数 ---------- */
const a = computed(() => Math.round(props.values.a ?? 8))
const b = computed(() => Math.round(props.values.b ?? 12))
const fa = computed(() => factorsOf(a.value))
const fb = computed(() => factorsOf(b.value))
const common = computed(() => fa.value.filter((x) => fb.value.includes(x)))
const isLcmMode = computed(() => props.lab.title.includes('公倍数'))
const lcmVal = computed(() => lcm(a.value, b.value))
const lcmShow = computed(() => lcmVal.value <= 60)
const lcmLine = computed(() => {
  const ma = Array.from({ length: Math.floor(60 / a.value) }, (_, i) => a.value * (i + 1))
  const mb = Array.from({ length: Math.floor(60 / b.value) }, (_, i) => b.value * (i + 1))
  return { ma, mb }
})
</script>

<template>
  <div class="number-wrap">
    <!-- 因数 -->
    <template v-if="kind === 'factors'">
      <div class="pair-grids">
        <div v-for="(p, i) in factorPairs" :key="i" class="pair-box">
          <div
            class="mini-grid"
            :style="{
              gridTemplateColumns: `repeat(${Math.min(p.w, 6)}, 13px)`,
            }"
          >
            <span v-for="c in Math.min(p.w, 6) * Math.min(p.h, 6)" :key="c" class="mini-cell" />
            <span v-if="p.w * p.h > 36" class="mini-more">…</span>
          </div>
          <p class="pair-label">{{ p.w }} × {{ p.h }} = {{ n }}</p>
        </div>
      </div>
      <div class="factor-chips">
        <span v-for="f in allFactors" :key="f" class="factor-chip">{{ f }}</span>
      </div>
      <p class="note">{{ n }} 的因数有 {{ allFactors.length }} 个，成对出现</p>
    </template>

    <!-- 倍数 -->
    <template v-else-if="kind === 'multiples'">
      <div class="numline-wrap">
        <svg viewBox="0 0 460 120" class="w-full">
          <line x1="20" y1="60" x2="440" y2="60" class="nl-line" />
          <g v-for="v in Math.floor(lineMax / lineStep)" :key="v">
            <line :x1="20 + (v * lineStep * 420) / lineMax" :y1="60" :x2="20 + (v * lineStep * 420) / lineMax" :y2="70" class="nl-tick" />
            <text :x="20 + (v * lineStep * 420) / lineMax" :y="52" text-anchor="middle" class="nl-num">{{ v * lineStep }}</text>
          </g>
          <g v-for="m in multiples" :key="m">
            <path
              :d="`M ${20 + (m * 420) / lineMax} 92 l -6 -8 l 12 0 Z`"
              class="nl-mark"
            />
            <text :x="20 + (m * 420) / lineMax" :y="110" text-anchor="middle" class="nl-mark-num">{{ m }}</text>
          </g>
        </svg>
      </div>
      <div class="factor-chips">
        <span v-for="m in multiples" :key="m" class="factor-chip primary">{{ m }}</span>
      </div>
      <p class="note">{{ mBase }} 的倍数：每次加 {{ mBase }}，有无数个</p>
    </template>

    <!-- 质数 -->
    <template v-else-if="kind === 'prime'">
      <div class="sieve-table">
        <div v-for="(row, ri) in table" :key="ri" class="sieve-row">
          <span
            v-for="v in row"
            :key="v"
            class="sieve-cell"
            :class="{
              prime: primeSet.has(v),
              composite: !primeSet.has(v),
            }"
          >
            {{ v }}
          </span>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="dot prime" />质数（只有 1 和它本身两个因数）</span>
        <span class="legend-item"><span class="dot composite" />合数（还有别的因数）</span>
      </div>
      <p class="note">2~{{ primeN }} 中共有 {{ primes.length }} 个质数：{{ primes.slice(0, 20).join('、') }}{{ primes.length > 20 ? '…' : '' }}</p>
    </template>

    <!-- 公因数公倍数 -->
    <template v-else>
      <div class="gcdlcm">
        <div class="factor-chips">
          <span class="gc-label">{{ a }} 的因数</span>
          <span
            v-for="f in fa"
            :key="'a' + f"
            class="factor-chip"
            :class="{ common: common.includes(f) }"
          >
            {{ f }}
          </span>
        </div>
        <div class="factor-chips">
          <span class="gc-label">{{ b }} 的因数</span>
          <span
            v-for="f in fb"
            :key="'b' + f"
            class="factor-chip"
            :class="{ common: common.includes(f) }"
          >
            {{ f }}
          </span>
        </div>
        <p class="note">
          <template v-if="!isLcmMode">
            公因数：{{ common.join('、') }} · <b>最大公因数 = {{ Math.max(...common) }}</b>
          </template>
          <template v-else>
            公倍数中最小的一个 = <b>最小公倍数 {{ lcmVal }}</b>
          </template>
        </p>

        <template v-if="isLcmMode && lcmShow">
          <svg viewBox="0 0 460 150" class="w-full">
            <line x1="20" y1="40" x2="440" y2="40" class="nl-line" />
            <line x1="20" y1="100" x2="440" y2="100" class="nl-line" />
            <g v-for="m in lcmLine.ma" :key="'a' + m">
              <line :x1="20 + (m * 420) / 60" :y1="40" :x2="20 + (m * 420) / 60" :y2="50" class="nl-tick" />
              <text :x="20 + (m * 420) / 60" :y="32" text-anchor="middle" class="nl-num a">{{ m }}</text>
            </g>
            <g v-for="m in lcmLine.mb" :key="'b' + m">
              <line :x1="20 + (m * 420) / 60" :y1="100" :x2="20 + (m * 420) / 60" :y2="110" class="nl-tick" />
              <text :x="20 + (m * 420) / 60" :y="122" text-anchor="middle" class="nl-num b">{{ m }}</text>
            </g>
            <text x="12" y="42" class="gc-label">{{ a }} 的倍数</text>
            <text x="12" y="102" class="gc-label">{{ b }} 的倍数</text>
            <g v-for="m in lcmLine.ma.filter((x) => lcmLine.mb.includes(x))" :key="'s' + m">
              <text :x="20 + (m * 420) / 60" :y="72" text-anchor="middle" class="star">★</text>
            </g>
          </svg>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.number-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.pair-grids {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pair-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.mini-grid {
  display: grid;
  gap: 1px;
  background: var(--ui-border);
  padding: 1px;
  border-radius: 4px;
}
.mini-cell {
  width: 13px;
  height: 13px;
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border-radius: 1px;
}
.mini-more {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
  grid-column: 1 / -1;
  text-align: center;
}
.pair-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.factor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  align-items: center;
  max-width: 440px;
}
.factor-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  padding: 0.2rem 0.6rem;
  font-size: 0.85rem;
  color: var(--ui-text-highlighted);
}
.factor-chip.primary {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
.factor-chip.common {
  background: color-mix(in srgb, var(--ui-primary) 25%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.gc-label {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-weight: 600;
  margin-right: 0.2rem;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
.nl-line {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
}
.nl-tick {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.nl-num {
  font-size: 11px;
  fill: var(--ui-text-muted);
}
.nl-num.a {
  fill: var(--ui-primary);
}
.nl-num.b {
  fill: color-mix(in srgb, var(--ui-primary) 50%, var(--ui-text-muted));
}
.nl-mark {
  fill: var(--ui-primary);
}
.nl-mark-num {
  font-size: 12px;
  fill: var(--ui-primary);
  font-weight: 700;
}
.star {
  fill: var(--ui-primary);
  font-size: 16px;
}
.sieve-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sieve-row {
  display: flex;
  gap: 2px;
}
.sieve-cell {
  width: 2.1rem;
  height: 2.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.35rem;
  font-size: 0.85rem;
}
.sieve-cell.prime {
  background: color-mix(in srgb, var(--ui-primary) 30%, white);
  color: var(--ui-primary);
  font-weight: 800;
  border: 1px solid var(--ui-primary);
}
.sieve-cell.composite {
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
}
.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  display: inline-block;
}
.dot.prime {
  background: var(--ui-primary);
}
.dot.composite {
  background: var(--ui-text-muted);
}
.gcdlcm {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 460px;
  align-items: center;
}
</style>
