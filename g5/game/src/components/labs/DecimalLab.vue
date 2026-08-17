<script setup lang="ts">
/**
 * 小数乘法和除法（一）Lab：小数乘整数 / 小数除以整数 / 小数点移动
 * 方格模型 + 竖式 + 位值芯片
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 小数乘整数 ---------- */
const price = computed(() => props.values.price ?? 0)
const count = computed(() => Math.round(props.values.count ?? 0))
const mulTotal = computed(() => price.value * count.value)
const mulShowGrid = computed(() => price.value <= 2 && price.value * 100 <= 200)
/** 方格模型：每行 10 格，一格 = 0.01；填充 price*100 格/行 × count 行（封顶） */
const gridCells = computed(() => {
  const perRow = Math.min(10, Math.ceil(price.value * 10))
  const total = Math.min(200, Math.round(price.value * 100) * Math.min(count.value, 20))
  const rows = Math.min(20, Math.ceil(total / 10))
  const out: boolean[][] = []
  let left = total
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = []
    for (let c = 0; c < 10; c++) {
      row.push(left > 0)
      left--
    }
    out.push(row)
  }
  return { rows: out, perRow, total: Math.round(price.value * 100) * Math.min(count.value, 20) }
})
/** 格宽：保证 rows×cell ≤ 200 */
const gridCellPx = computed(() => {
  const rows = Math.max(10, gridCells.value.rows.length)
  return Math.min(20, 200 / rows)
})
const gridSvgH = computed(() => gridCells.value.rows.length * gridCellPx.value + 8)

/* ---------- 小数除以整数 ---------- */
const total = computed(() => props.values.total ?? 0)
const divCount = computed(() => Math.round(props.values.count ?? 0))
const unit = computed(() => total.value / divCount.value)
const intPart = computed(() => Math.floor(total.value))
const fracPart = computed(() => Math.round((total.value - intPart.value) * 100) / 100)

/* ---------- 小数点移动 ---------- */
const power = computed(() => Math.round(props.values.power ?? 0))
const base = computed(() => props.values.base ?? 0.001)
const divide = computed(() => (props.values.divide ?? 0) === 1)
const factor = computed(() => 10 ** power.value)
const pointResult = computed(() => (divide.value ? base.value / factor.value : base.value * factor.value))

/** 数位表列：index = 位权（个位=0，十分位=-1…） */
const PLACE_LABELS: Record<number, string> = {
  3: '千',
  2: '百',
  1: '十',
  0: '个',
  [-1]: '十分位',
  [-2]: '百分位',
  [-3]: '千分位',
  [-4]: '万分位',
}
const MIN_POS = -4
const MAX_POS = 3

/** 把数值按位拆成 { 位权: 数字 }（给定小数位精度） */
function decompose(v: number, fracDigits: number): Map<number, number> {
  const map = new Map<number, number>()
  const int = Math.floor(Math.abs(v))
  const frac = Number((Math.abs(v) - int).toFixed(fracDigits))
  let i = 0
  let t = int
  if (t === 0) map.set(0, 0)
  while (t > 0) {
    map.set(i, t % 10)
    t = Math.floor(t / 10)
    i++
  }
  for (let k = 1; k <= fracDigits; k++) {
    const d = Math.floor((frac * 10 ** k) % 10)
    if (d !== 0 || k <= 3) map.set(-k, d)
  }
  return map
}

const fracPrec = computed(() => Math.max(3, power.value + 2))
const origMap = computed(() => decompose(base.value, Math.max(3, -Math.floor(Math.log10(Math.abs(base.value))) + 1)))
const resultMap = computed(() => decompose(pointResult.value, fracPrec.value))
const positions = computed(() => {
  const arr: number[] = []
  for (let p = MAX_POS; p >= MIN_POS; p--) arr.push(p)
  return arr
})
function decimalMoveText(v: number): string {
  if (Number.isInteger(v)) return String(v)
  return v.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')
}
const resultStr = computed(() => decimalMoveText(pointResult.value))

/** 轨道：把所有位权转成对应列（索引 0 = 最左 = 千位） */
const colIndex = (pos: number) => MAX_POS - pos

/** 某位权在原数中是否有非 0 数字（供“移动前”标注） */
function hasDigit(v: number, pos: number): boolean {
  return decompose(v, 6).get(pos) !== undefined
}
</script>

<template>
  <div class="decimal-wrap">
    <!-- 小数乘整数 -->
    <template v-if="kind === 'decimal-mul'">
      <p class="lead">{{ price }} × {{ count }} 表示 <b>{{ count }} 个 {{ price }}</b> 相加</p>
      <div class="chips-row">
        <span v-for="i in Math.min(count, 12)" :key="i" class="price-chip">¥{{ price }}</span>
        <span v-if="count > 12" class="more">…×{{ count }}</span>
      </div>
      <div class="row-group">
        <div class="col">
          <div class="col-row">{{ price }}</div>
          <div class="col-row">× {{ count }}</div>
          <hr class="col-hr" />
          <div class="col-row result">{{ mulTotal }}</div>
          <p class="col-note">先按整数乘，再看因数共有几位小数，积就点几位小数</p>
        </div>
        <svg v-if="mulShowGrid" :viewBox="`0 0 210 ${gridSvgH}`" class="grid-svg">
          <g v-for="(row, r) in gridCells.rows" :key="r">
            <rect
              v-for="(on, c) in row"
              :key="c"
              :x="c * gridCellPx + 5"
              :y="r * gridCellPx + 4"
              :width="gridCellPx - 1"
              :height="gridCellPx - 1"
              :class="on ? 'cell-on' : 'cell-off'"
            />
          </g>
        </svg>
        <p class="grid-note">一格 = 0.01 · 共 {{ gridCells.total }} 格 = {{ mulTotal }}</p>
      </div>
    </template>

    <!-- 小数除以整数 -->
    <template v-else-if="kind === 'decimal-div'">
      <p class="lead">{{ total }} 元平均分给 <b>{{ divCount }} 份</b>，每份多少元？</p>
      <div class="split-model">
        <div v-for="i in divCount" :key="i" class="split-group">
          <span v-for="j in intPart / divCount" :key="'int' + j" class="yuan-chip">¥1</span>
          <span v-for="j in 10 / divCount" :key="'jiao' + j" class="jiao-chip">0.1</span>
          <p class="split-label">第 {{ i }} 份</p>
        </div>
      </div>
      <p class="lead2">
        {{ intPart }} ÷ {{ divCount }} = {{ intPart / divCount }}；{{ fracPart }} ÷ {{ divCount }} = {{ (fracPart / divCount).toFixed(2) }}
      </p>
      <div class="col">
        <div class="col-row">{{ total }} ÷ {{ divCount }} = {{ unit }}</div>
        <p class="col-note">商的小数点要和被除数的小数点对齐；余数添 0 继续除</p>
      </div>
    </template>

    <!-- 小数点移动 -->
    <template v-else>
      <p class="lead">
        {{ base }} {{ divide ? '÷' : '×' }} {{ factor }} = {{ resultStr }}
      </p>
      <div class="place-table" role="table" aria-label="数位表">
        <div class="pt-head">
          <span class="pt-cell row-label">数位</span>
          <span v-for="p in positions" :key="'h' + p" class="pt-cell" :class="{ frac: p < 0, dotcol: p === -1 }">
            {{ PLACE_LABELS[p] }}
          </span>
        </div>
        <!-- 原数行 -->
        <div class="pt-row">
          <span class="pt-cell row-label">原数</span>
          <span v-for="p in positions" :key="'o' + p" class="pt-cell" :class="{ frac: p < 0, dotcol: p === -1 }">
            <b :class="{ filled: origMap.has(p) }">{{ origMap.get(p) ?? '' }}</b>
          </span>
        </div>
        <!-- 结果行（高亮移动的位数） -->
        <div class="pt-row result-row">
          <span class="pt-cell row-label">结果</span>
          <span v-for="p in positions" :key="'r' + p" class="pt-cell" :class="{ frac: p < 0, dotcol: p === -1 }">
            <b :class="{ filled: resultMap.has(p), moved: hasDigit(base, p) && resultMap.has(p) }">
              {{ resultMap.get(p) ?? '' }}
            </b>
          </span>
        </div>
      </div>
      <div class="move-bar">
        <span class="arrow-chip">{{ divide ? '←' : '→' }} {{ power }} 位</span>
        <span class="move-note">小数点向{{ divide ? '左' : '右' }}移动 {{ power }} 位；位数不够用 0 补足</span>
      </div>
      <p class="point-bridge">
        对齐数位表看：原数 {{ base }} 经过小数点{{ divide ? '向左' : '向右' }}移动 {{ power }} 位，落到结果 {{ resultStr }}。
      </p>
      <p class="col-note">
        小数{{ divide ? '除以' : '乘' }} 10、100、1000…，小数点就{{ divide ? '向左' : '向右' }}移动一位、两位、三位……
      </p>
    </template>
  </div>
</template>

<style scoped>
.decimal-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.lead {
  font-size: 1.05rem;
  color: var(--ui-text-highlighted);
}
.lead b {
  color: var(--ui-primary);
}
.lead2 {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-width: 602px;
  justify-content: center;
}
.price-chip {
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border: 1px solid var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  font-size: 0.9rem;
}
.more {
  color: var(--ui-text-muted);
  align-self: center;
}
.row-group {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}
.col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.col-row {
  font-family: ui-monospace, monospace;
  font-size: 1.15rem;
  min-width: 5rem;
  text-align: right;
  color: var(--ui-text-highlighted);
}
.col-row.result {
  color: var(--ui-primary);
  font-weight: 800;
  font-size: 1.4rem;
}
.col-hr {
  width: 100%;
  border-top: 2px solid var(--ui-text-highlighted);
  margin: 0;
}
.col-note {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  max-width: 25rem;
  text-align: center;
}
.grid-svg {
  max-width: 294px;
  max-height: 220px;
}
.grid-note {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.cell-on {
  fill: color-mix(in srgb, var(--ui-primary) 65%, white);
  stroke: var(--ui-primary);
}
.cell-off {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border);
}
.grid-note {
  font-size: 11px;
  fill: var(--ui-text-muted);
}.split-model {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.split-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  width: 6.5rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.4rem;
  justify-content: center;
}
.yuan-chip {
  background: color-mix(in srgb, var(--ui-primary) 25%, white);
  border: 1px solid var(--ui-primary);
  border-radius: 0.3rem;
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.jiao-chip {
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 0.3rem;
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  color: var(--ui-text-muted);
}
.split-label {
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.digits {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex-wrap: wrap;
  justify-content: center;
}
.digit-chip {
  font-family: ui-monospace, monospace;
  font-size: 1.5rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  border: 1px solid var(--ui-border-accented);
  border-radius: 0.4rem;
  padding: 0.15rem 0.45rem;
  color: var(--ui-text-highlighted);
  min-width: 1.6rem;
  text-align: center;
}
.digit-chip.dot {
  background: transparent;
  border: none;
  color: var(--ui-primary);
  font-size: 1.8rem;
}
.digits .arrow {
  font-size: 0.85rem;
  color: var(--ui-primary);
  font-weight: 700;
  margin-left: 0.6rem;
}
.result-row .digit-chip {
  color: var(--ui-primary);
}
/* 数位表 */
.place-table {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  width: 100%;
  max-width: 644px;
}
.pt-head,
.pt-row {
  display: grid;
  grid-template-columns: 4.4rem repeat(8, 1fr);
}
.pt-cell {
  text-align: center;
  padding: 0.2rem 0;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  border-bottom: 1px solid var(--ui-border);
}
.pt-cell.frac {
  background: color-mix(in srgb, var(--ui-info, #38bdf8) 6%, transparent);
}
.pt-cell.dotcol {
  border-left: 2px solid var(--ui-primary);
}
.pt-head .pt-cell {
  font-weight: 700;
  font-size: 0.75rem;
}
.pt-cell.row-label {
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
  font-weight: 800;
  border-right: 1px solid var(--ui-border);
}
.pt-row b {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
.pt-row b.filled {
  color: var(--ui-text-highlighted);
}
.result-row b.filled {
  color: var(--ui-primary);
}
.result-row b.moved {
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 22%, transparent);
  border-radius: 0.3rem;
  padding: 0 0.2rem;
}
.move-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.arrow-chip {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-warning, #f59e0b);
}
.move-note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.point-bridge {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 32rem;
}
@media (max-width: 520px) {
  .pt-head,
  .pt-row {
    grid-template-columns: 3.4rem repeat(8, minmax(1.55rem, 1fr));
  }
  .pt-cell {
    font-size: 0.66rem;
    padding: 0.18rem 0;
  }
  .pt-row b {
    font-size: 0.95rem;
  }
}
</style>
