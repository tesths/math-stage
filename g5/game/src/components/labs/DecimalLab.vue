<script setup lang="ts">
/**
 * 小数乘法和除法（一）Lab：小数乘整数 / 小数除以整数 / 小数点移动
 *
 * 三处对齐课本算理的改动（都由 `@/lib/labs/decimal` 的纯函数 + 单元测试兜底）：
 * - 小数乘整数：竖式按位列出**部分积**（6.25×12 → 6250 + 1250 = 7500 → 75），
 *   面积模型改成真正的长方形：列 = 单价的小数位展开、行 = 数量，每格 = 0.1 或 0.01。
 * - 小数除以整数：平均分按**元 → 角 → 分**逐级分（9.6÷3 每份 3 元 2 角；9.6÷4 元分不完就换 16 角继续分），
 *   修掉原来写死「每份 10÷份数 个角」导致合计对不上的错误。
 * - 小数点移动：用十进制字符串移位算出精确结果（避免 0.07×100 = 7.000000000000001），
 *   并在数位表里把「原来那几位数字」移动后的位置高亮出来。
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { decimalPlaces, decimalText, placeDigits, shiftDecimalPoint, splitShares, verticalMul } from '@/lib/labs/decimal'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 小数乘整数 ---------- */
const price = computed(() => props.values.price ?? 0)
const count = computed(() => Math.max(0, Math.round(props.values.count ?? 0)))
const vertical = computed(() => verticalMul(price.value, count.value))
const mulTotalText = computed(() => vertical.value.productText)

/** 面积模型：列 = 单价按小数位展开的格数，行 = 数量；每格面积 = 10^-decimals */
const areaModel = computed(() => {
  const d = Math.max(1, decimalPlaces(price.value))
  const cols = Math.round(price.value * 10 ** d)
  const rows = count.value
  const cellValue = 10 ** -d
  const usable = cols > 0 && rows > 0 && cols <= 40 && rows <= 40
  const cellPx = usable ? Math.max(6, Math.min(26, 300 / Math.max(cols, rows))) : 0
  return { d, cols, rows, cellValue, usable, cellPx, cells: cols * rows, total: cols * rows * cellValue }
})
const priceChips = computed(() => Array.from({ length: Math.min(count.value, 12) }, (_, i) => i + 1))

/* ---------- 小数除以整数 ---------- */
const total = computed(() => props.values.total ?? 0)
const divCount = computed(() => Math.max(1, Math.round(props.values.count ?? 1)))
const split = computed(() => splitShares(total.value, divCount.value))
const unitText = computed(() => split.value.perGroupText)
/** 逐级分的过程说明：整数部分 → 点上小数点 → 逐级继续分 */
const divSteps = computed(() =>
  split.value.levels.map((lv, i) => ({
    level: lv,
    text:
      i === 0
        ? `${lv.units} ${lv.label} ÷ ${divCount.value} = ${lv.perGroup} ${lv.label}${lv.leftover ? `，余 ${lv.leftover} ${lv.label}` : ''}`
        : `余下的换 ${lv.units} ${lv.label} ÷ ${divCount.value} = ${lv.perGroup} ${lv.label}${lv.leftover ? `，余 ${lv.leftover} ${lv.label}` : ''}`,
  })),
)
/** 每份在各数位上分到的量（有分到的才显示筹码） */
const perGroupChips = computed(() => split.value.levels.filter((lv) => lv.perGroup > 0))

/* ---------- 小数点移动 ---------- */
const power = computed(() => Math.max(0, Math.round(props.values.power ?? 0)))
const base = computed(() => props.values.base ?? 1)
const divide = computed(() => (props.values.divide ?? 0) === 1)
const factor = computed(() => 10 ** power.value)
const pointResult = computed(() => shiftDecimalPoint(base.value, power.value, divide.value))
const resultStr = computed(() => decimalText(pointResult.value))

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
const positions = computed(() => {
  const arr: number[] = []
  for (let p = MAX_POS; p >= MIN_POS; p--) arr.push(p)
  return arr
})
const origMap = computed(() => placeDigits(base.value))
const resultMap = computed(() => placeDigits(pointResult.value))
/** 原数每一位移动后落到哪一位（用于高亮「搬过去的那几位」） */
const movedPlaces = computed(() => {
  const out: number[] = []
  for (const p of origMap.value.keys()) {
    const np = divide.value ? p - power.value : p + power.value
    if (np >= MIN_POS && np <= MAX_POS) out.push(np)
  }
  return out
})
</script>

<template>
  <div class="decimal-wrap">
    <!-- 小数乘整数：把小数当整数算，再点小数点 -->
    <template v-if="kind === 'decimal-mul'">
      <p class="lead">{{ price }} × {{ count }} 表示 <b>{{ count }} 个 {{ price }}</b> 相加</p>
      <div class="chips-row">
        <span v-for="i in priceChips" :key="i" class="price-chip">¥{{ price }}</span>
        <span v-if="count > 12" class="more">…×{{ count }}</span>
      </div>

      <div class="row-group">
        <!-- 竖式：部分积按位对齐 -->
        <div class="vertical" aria-label="竖直乘法">
          <div class="v-row mono">{{ vertical.intPrice }}<span class="v-note">（{{ price }} × {{ factor === 1 ? 1 : 10 ** vertical.decimals }}，先当整数）</span></div>
          <div class="v-row mono">× {{ count }}</div>
          <hr class="v-hr" />
          <div v-for="(p, i) in vertical.partials" :key="i" class="v-row mono partial" :style="{ paddingRight: `${p.shift * 0.9}rem` }">
            {{ p.value }}
          </div>
          <hr class="v-hr" />
          <div class="v-row mono total">{{ vertical.intProduct }}</div>
          <div class="v-point">
            小数点{{ vertical.decimals === 0 ? '不动' : `向左点 ${vertical.decimals} 位` }} →
            <b>{{ mulTotalText }}</b>
          </div>
          <p class="col-note">先按整数乘法算 {{ vertical.intPrice }} × {{ count }} = {{ vertical.intProduct }}，因数共有 {{ vertical.decimals }} 位小数，积就点 {{ vertical.decimals }} 位小数</p>
        </div>

        <!-- 面积模型：列 = 小数展开，行 = 数量 -->
        <div v-if="areaModel.usable" class="area-model">
          <svg :viewBox="`0 0 ${areaModel.cols * areaModel.cellPx + 10} ${areaModel.rows * areaModel.cellPx + 10}`" class="area-svg">
            <g v-for="r in areaModel.rows" :key="'r' + r">
              <rect
                v-for="c in areaModel.cols"
                :key="`${r}-${c}`"
                :x="5 + (c - 1) * areaModel.cellPx"
                :y="5 + (r - 1) * areaModel.cellPx"
                :width="areaModel.cellPx - 1"
                :height="areaModel.cellPx - 1"
                class="cell-on"
              />
            </g>
            <rect x="5" y="5" :width="areaModel.cols * areaModel.cellPx" :height="areaModel.rows * areaModel.cellPx" class="cell-outline" />
          </svg>
          <p class="grid-note">
            {{ areaModel.cols }} 列 × {{ areaModel.rows }} 行 = {{ areaModel.cells }} 格，每格 {{ areaModel.cellValue }} →
            面积 {{ areaModel.cells }} × {{ areaModel.cellValue }} = {{ mulTotalText }}
          </p>
        </div>
        <div v-else class="area-model fallback">
          <p class="grid-note">
            这个数据太大，画不出方格（列数 {{ areaModel.cols }}），改用上面的竖式看小数点的位置
          </p>
        </div>
      </div>
      <p class="verify-line">
        ✓ {{ vertical.intPrice }} × {{ count }} = {{ vertical.intProduct }}，因数共有 {{ vertical.decimals }} 位小数 →
        {{ price }} × {{ count }} = <b>{{ mulTotalText }}</b>
      </p>
    </template>

    <!-- 小数除以整数：按元→角→分逐级平均分 -->
    <template v-else-if="kind === 'decimal-div'">
      <p class="lead">{{ total }} 元平均分给 <b>{{ divCount }} 份</b>，每份多少元？</p>
      <div class="split-model">
        <div v-for="i in divCount" :key="i" class="split-group">
          <span
            v-for="(lv, li) in perGroupChips"
            :key="li"
            :class="li === 0 ? 'yuan-chip' : 'jiao-chip'"
          >{{ lv.perGroup }}{{ lv.label }}</span>
          <p class="split-label">第 {{ i }} 份 = {{ unitText }} 元</p>
        </div>
      </div>
      <div class="div-steps">
        <p v-for="(s, i) in divSteps" :key="i" class="div-step">
          <span class="step-idx">{{ i + 1 }}</span>{{ s.text }}
        </p>
      </div>
      <p class="lead2">
        每份合计 = <b>{{ unitText }} 元</b>{{ split.exact ? '' : `（除不尽，还余 ${ split.remainder } 元）` }}
      </p>
      <div class="col">
        <div class="col-row">{{ total }} ÷ {{ divCount }} = {{ unitText }}</div>
        <p class="col-note">商的小数点要和被除数的小数点对齐；整数部分余下的数换成更小的单位继续除</p>
      </div>
      <p class="verify-line">✓ 每份 {{ unitText }} 元 × {{ divCount }} 份 = {{ decimalText(split.perGroup * divCount) }} 元{{ split.exact ? '，正好分完' : `，还余 ${ split.remainder } 元` }}</p>
    </template>

    <!-- 小数点移动 -->
    <template v-else>
      <p class="lead">
        {{ decimalText(base) }} {{ divide ? '÷' : '×' }} {{ factor }} = {{ resultStr }}
      </p>
      <div class="place-table" role="table" aria-label="数位表">
        <div class="pt-head">
          <span class="pt-cell row-label">数位</span>
          <span v-for="p in positions" :key="'h' + p" class="pt-cell" :class="{ frac: p < 0, dotcol: p === -1 }">
            {{ PLACE_LABELS[p] }}
          </span>
        </div>
        <div class="pt-row">
          <span class="pt-cell row-label">原数</span>
          <span v-for="p in positions" :key="'o' + p" class="pt-cell" :class="{ frac: p < 0, dotcol: p === -1 }">
            <b :class="{ filled: origMap.has(p) }">{{ origMap.get(p) ?? '' }}</b>
          </span>
        </div>
        <div class="pt-row result-row">
          <span class="pt-cell row-label">结果</span>
          <span v-for="p in positions" :key="'r' + p" class="pt-cell" :class="{ frac: p < 0, dotcol: p === -1 }">
            <b :class="{ filled: resultMap.has(p), moved: movedPlaces.includes(p) }">
              {{ resultMap.get(p) ?? '' }}
            </b>
          </span>
        </div>
      </div>
      <div class="move-bar">
        <span class="arrow-chip">{{ divide ? '←' : '→' }} {{ power }} 位</span>
        <span class="move-note">小数点{{ divide ? '向左' : '向右' }}移动 {{ power }} 位；位数不够用 0 补足</span>
      </div>
      <p class="point-bridge">
        对齐数位表看：原数 {{ decimalText(base) }} 经过小数点{{ divide ? '向左' : '向右' }}移动 {{ power }} 位，落到结果 {{ resultStr }}。
      </p>
      <p class="verify-line">
        ✓ {{ decimalText(base) }} {{ divide ? '÷' : '×' }} {{ factor }}：小数点{{ divide ? '向左' : '向右' }}移动 {{ power }} 位 →
        <b>{{ resultStr }}</b>（高亮的格子就是搬过去的那几位数字）
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
  width: 100%;
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
.lead2 b {
  color: var(--ui-primary);
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
  gap: 1.6rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}
.vertical {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.1rem;
  min-width: 9rem;
}
.v-row {
  font-size: 1.15rem;
  color: var(--ui-text-highlighted);
}
.v-row.partial {
  color: var(--ui-text-toned);
}
.v-row.total {
  color: var(--ui-primary);
  font-weight: 800;
}
.v-note {
  font-size: 0.68rem;
  color: var(--ui-text-muted);
  margin-left: 0.4rem;
}
.mono {
  font-family: ui-monospace, monospace;
}
.v-hr {
  width: 100%;
  border-top: 2px solid var(--ui-text-highlighted);
  margin: 0.1rem 0;
}
.v-point {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.v-point b {
  color: var(--ui-primary);
  font-size: 1.1rem;
}
.col-note {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  max-width: 25rem;
  text-align: center;
}
.area-model {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.area-svg {
  max-width: 300px;
  max-height: 240px;
}
.cell-on {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
  stroke: var(--ui-primary);
  stroke-width: 0.6;
}
.cell-outline {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 1.6;
}
.grid-note {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 22rem;
}
.split-model {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.split-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  width: 7.5rem;
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
  color: var(--ui-text-toned);
}
.split-label {
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.div-steps {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
}
.div-step {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.step-idx {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 9999px;
  background: var(--ui-primary);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
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
  color: var(--ui-text-highlighted);
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  text-align: center;
  max-width: 40rem;
}
.verify-line b {
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
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 25%, transparent);
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
