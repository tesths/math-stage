<script setup lang="ts">
/**
 * 线段图 Lab：总量减运走、多几少几、每行人数变换、倍数两步计算
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const id = computed(() => props.lab.id)

/* segment-total */
const total = computed(() => Math.round(props.values.total ?? 300))
const part1 = computed(() => Math.round(props.values.part1 ?? 120))
const part2 = computed(() => Math.round(props.values.part2 ?? 160))
const left = computed(() => Math.max(0, total.value - part1.value - part2.value))

/* segment-more */
const base = computed(() => Math.round(props.values.base ?? 25))
const more1 = computed(() => Math.round(props.values.more1 ?? 15))
const more2 = computed(() => Math.round(props.values.more2 ?? 20))
const volleyball = computed(() => base.value + more1.value)
const football = computed(() => volleyball.value + more2.value)

/* rows */
const rowTotal = computed(() => Math.round(props.values.total ?? 144))
const per = computed(() => Math.round(props.values.per ?? 6))
const perMore = computed(() => Math.round(props.values.more ?? 2))
const perNew = computed(() => per.value + perMore.value)
const rowsNew = computed(() => Math.round(rowTotal.value / perNew.value))

/* times-word */
const base3 = computed(() => Math.round(props.values.base ?? 39))
const times = computed(() => Math.round(props.values.times ?? 2))
const less = computed(() => Math.round(props.values.less ?? 13))
const grade4 = computed(() => base3.value * times.value)
const grade5 = computed(() => grade4.value - less.value)

/** 把数量映射为条长（同一比例尺：260px 对应最大值） */
const BAR_W = 260
function barLen(v: number, max: number): number {
  return Math.round((v / max) * BAR_W)
}
const isTotal = computed(() => id.value === 'g3-c10-segment-total')
const isMore = computed(() => id.value === 'g3-c10-segment-more')
const isRows = computed(() => id.value === 'g3-c10-rows')
const isTimes = computed(() => id.value === 'g3-c10-times-word')

const segTotal = computed(() => [
  { label: `上午运走 ${part1.value} 箱`, len: barLen(part1.value, total.value), color: 'primary' },
  { label: `下午运走 ${part2.value} 箱`, len: barLen(part2.value, total.value), color: 'secondary' },
  { label: `还剩 ${left.value} 箱`, len: barLen(left.value, total.value), color: 'success' },
])

const moreMax = computed(() => Math.max(football.value, 40))
const moreScale = computed(() => Math.round(BAR_W / moreMax.value))
const moreBars = computed(() => {
  const b = barLen(base.value, moreMax.value)
  const v = barLen(volleyball.value, moreMax.value)
  const f = barLen(football.value, moreMax.value)
  return [
    { name: '篮球', val: `${base.value} 个`, len: b, ghostLen: 0, diffLen: 0, color: 'primary', diffLabel: '' },
    { name: '排球', val: `${volleyball.value} 个`, len: v, ghostLen: b, diffLen: v - b, color: 'secondary', diffLabel: `多 ${more1.value} 个` },
    { name: '足球', val: `${football.value} 个`, len: f, ghostLen: v, diffLen: f - v, color: 'success', diffLabel: `多 ${more2.value} 个` },
  ]
})

const timesMax = computed(() => Math.max(grade4.value, 40))
const timesScale = computed(() => Math.round(BAR_W / timesMax.value))
const timesBars = computed(() => {
  const b1 = barLen(base3.value, timesMax.value)
  const b2 = barLen(grade4.value, timesMax.value)
  const b3 = barLen(grade5.value, timesMax.value)
  return [
    { name: '三年级', val: `${base3.value} 幅`, len: b1, ghostLen: 0, diffFrom: 0, diffTo: 0, diffLabel: '', color: 'primary' },
    { name: '四年级', val: `${grade4.value} 幅`, len: b2, ghostLen: b1, diffFrom: 0, diffTo: 0, diffLabel: '', color: 'secondary' },
    { name: '五年级', val: `${grade5.value} 幅`, len: b3, ghostLen: 0, diffFrom: b3, diffTo: b2, diffLabel: `少 ${less.value} 幅`, color: 'success' },
  ]
})

/**
 * 过程态：课本 p89 的两步——先把线段图填完整（条件），再写数量关系式，最后列式解答。
 * 原来线段图画完就直接摆着答案，学生没有"从图到式"的一步（L3），
 * 而且三段条子全部 `x=0` 叠在一起画（图形与数值对不上，已修）。
 */
const segStep = ref(0)
function nextSegStep() {
  segStep.value = Math.min(segStep.value + 1, 2)
}
function resetSegStep() {
  segStep.value = 0
}
const relation = computed(() => {
  if (isTotal.value) return `剩下的箱数 = 总箱数 − （上午运走的箱数 + 下午运走的箱数）= ${total.value} − （${part1.value} + ${part2.value}）`
  if (isMore.value) return `排球的个数 = 篮球的个数 + ${more1.value}；足球的个数 = 排球的个数 + ${more2.value}`
  if (isRows.value) return `后来的行数 = 总人数 ÷ 后来每行的人数 = ${rowTotal.value} ÷ （${per.value} + ${perMore.value}）`
  return `四年级的幅数 = 三年级的幅数 × ${times.value}；五年级的幅数 = 四年级的幅数 − ${less.value}`
})
const expr = computed(() => {
  if (isTotal.value) return `${total.value} − （${part1.value} + ${part2.value}） = ${left.value}（箱）`
  if (isMore.value) return `${base.value} + ${more1.value} = ${volleyball.value}（个），${volleyball.value} + ${more2.value} = ${football.value}（个）`
  if (isRows.value) return `${rowTotal.value} ÷ （${per.value} + ${perMore.value}） = ${rowsNew.value}（行）`
  return `${base3.value} × ${times.value} = ${grade4.value}（幅），${grade4.value} − ${less.value} = ${grade5.value}（幅）`
})
/** 总长条的分段偏移：三段首尾相接，不能都从 x=0 画（会叠在一起） */
const segOffsets = computed(() => {
  let acc = 0
  return segTotal.value.map((seg) => {
    const x = acc
    acc += seg.len
    return { ...seg, x }
  })
})
/** 总长（用于刻度线右端） */
const segTotalLen = computed(() => segOffsets.value.reduce((a, s) => a + s.len, 0))

/** 差量括号路径：两端竖线 + 中间上拱弧线 */
function bracketPath(x1: number, x2: number, y0: number): string {
  const mid = (x1 + x2) / 2
  const dip = Math.min(5, (x2 - x1) / 4)
  const arc = `C ${mid} ${y0 - dip * 2.2} ${mid} ${y0 - dip * 2.2} ${x2} ${y0}`
  return `M ${x1} ${y0 - 3} L ${x1} ${y0} ${arc} L ${x2} ${y0 - 3}`
}
</script>

<template>
  <div class="segment-wrap">
    <!-- 总量 − 运走 = 剩余 -->
    <template v-if="isTotal">
      <svg viewBox="0 0 340 150" class="seg-svg">
        <text x="170" y="24" text-anchor="middle" class="bar-title">一共 {{ total }} 箱水果</text>
        <g transform="translate(30, 60)">
          <rect v-for="(s, i) in segOffsets" :key="i" :x="s.x" :width="s.len" height="22" rx="3" class="bar" :class="s.color" />
          <line
            v-for="(s, i) in segOffsets.slice(1)"
            :key="'sep' + i"
            :x1="s.x"
            y1="58"
            :x2="s.x"
            y2="84"
            class="seg-sep"
          />
        </g>
        <g transform="translate(30, 0)">
          <text
            v-for="(s, i) in segOffsets"
            :key="i"
            :x="s.x + s.len / 2"
            :y="56"
            text-anchor="middle"
            class="bar-tag"
          >{{ s.label }}</text>
        </g>
        <!-- 刻度：总长条两端 + 每段分界 -->
        <g transform="translate(30, 92)">
          <line x1="0" y1="0" :x2="segTotalLen" y2="0" class="dim-line" />
          <text x="0" y="14" text-anchor="middle" class="dim-text">0</text>
          <text :x="segTotalLen" y="14" text-anchor="middle" class="dim-text">{{ total }} 箱</text>
        </g>
      </svg>
      <div class="formula-row">
        <span class="chip">{{ total }} − {{ part1 }} − {{ part2 }}</span>
        <span class="chip result">= {{ left }} 箱</span>
      </div>
      <p class="tip">
        先算一共运走：{{ part1 }} + {{ part2 }} = {{ part1 + part2 }}（箱），还剩 {{ total }} − {{ part1 + part2 }} = <b>{{ left }}</b> 箱
      </p>
    </template>

    <!-- 多几少几 -->
    <template v-else-if="isMore">
      <svg viewBox="0 0 340 200" class="seg-svg">
        <g v-for="(bar, bi) in moreBars" :key="bi">
          <text x="40" :y="44 + bi * 62" text-anchor="end" class="bar-name">{{ bar.name }}</text>
          <rect :x="45" :y="36 + bi * 62" :width="bar.len" height="14" rx="3" class="bar" :class="bar.color" />
          <rect v-if="bar.ghostLen > 0" :x="45" :y="36 + bi * 62" :width="bar.ghostLen" height="14" rx="3" class="bar ghost" />
          <text :x="49 + bar.len" :y="44 + bi * 62" class="bar-val">{{ bar.val }}</text>
          <template v-if="bar.diffLen > 0">
            <path
              :d="bracketPath(45 + bar.ghostLen, 45 + bar.len, 30 + bi * 62)"
              fill="none"
              class="diff-line"
            />
            <text :x="45 + bar.ghostLen + bar.diffLen / 2" :y="16 + bi * 62" text-anchor="middle" class="diff-tag">{{ bar.diffLabel }}</text>
          </template>
        </g>
        <text x="170" y="192" text-anchor="middle" class="scale-note">同一比例尺：每 1 个 = {{ moreScale }} px</text>
      </svg>
      <p class="tip">
        排球 = {{ base }} + {{ more1 }} = <b>{{ volleyball }}</b>；足球 = {{ volleyball }} + {{ more2 }} = <b>{{ football }}</b>
      </p>
    </template>

    <!-- 变换队形 -->
    <template v-else-if="isRows">
      <svg viewBox="0 0 340 160" class="seg-svg">
        <text x="170" y="24" text-anchor="middle" class="bar-title">{{ rowTotal }} 人表演，原来每行 {{ per }} 人</text>
        <g transform="translate(30, 44)">
          <rect v-for="i in perNew" :key="i" :x="i * 6" :y="i % 2 === 0 ? -6 : 0" width="5" height="18" rx="1" class="people" />
        </g>
        <text x="170" y="92" text-anchor="middle" class="bar-tag">后来每行 {{ perNew }} 人</text>
        <g transform="translate(30, 100)">
          <rect v-for="i in Math.min(perNew, 20)" :key="i" :x="i * 6" y="0" width="5" height="18" rx="1" class="people2" />
        </g>
        <text x="170" y="148" text-anchor="middle" class="bar-tag">共排 {{ rowsNew }} 行</text>
      </svg>
      <div class="formula-row">
        <span class="chip">{{ rowTotal }} ÷ ({{ per }} + {{ perMore }})</span>
        <span class="chip result">= {{ rowsNew }} 行</span>
      </div>
      <p class="tip">后来每行 {{ per }} + {{ perMore }} = {{ perNew }} 人，{{ rowTotal }} ÷ {{ perNew }} = <b>{{ rowsNew }}</b> 行</p>
    </template>

    <!-- 倍 + 少 -->
    <template v-else-if="isTimes">
      <svg viewBox="0 0 340 200" class="seg-svg">
        <g v-for="(bar, bi) in timesBars" :key="bi">
          <text :x="40" :y="44 + bi * 62" text-anchor="end" class="bar-name">{{ bar.name }}</text>
          <rect :x="45" :y="36 + bi * 62" :width="bar.len" height="14" rx="3" class="bar" :class="bar.color" />
          <rect v-if="bar.ghostLen > 0" :x="45" :y="36 + bi * 62" :width="bar.ghostLen" height="14" rx="3" class="bar ghost" />
          <text :x="49 + bar.len" :y="44 + bi * 62" class="bar-val">{{ bar.val }}</text>
          <line
            v-if="bi === 1"
            :x1="45 + bar.ghostLen"
            :y1="36 + bi * 62"
            :x2="45 + bar.ghostLen"
            :y2="50 + bi * 62"
            class="diff-line"
          />
          <text v-if="bi === 1" :x="45 + bar.ghostLen" :y="30 + bi * 62" text-anchor="middle" class="diff-tag">1 倍</text>
          <path
            v-if="bar.diffTo > bar.diffFrom"
            :d="bracketPath(45 + bar.diffFrom, 45 + bar.diffTo, 30 + bi * 62)"
            fill="none"
            class="diff-line"
          />
          <text
            v-if="bar.diffTo > bar.diffFrom"
            :x="45 + (bar.diffFrom + bar.diffTo) / 2"
            :y="16 + bi * 62"
            text-anchor="middle"
            class="diff-tag"
          >{{ bar.diffLabel }}</text>
        </g>
        <text x="170" y="192" text-anchor="middle" class="scale-note">同一比例尺：每 1 幅 = {{ timesScale }} px</text>
      </svg>
      <p class="tip">
        四年级 = {{ base3 }} × {{ times }} = <b>{{ grade4 }}</b>；五年级 = {{ grade4 }} − {{ less }} = <b>{{ grade5 }}</b>
      </p>
    </template>

    <!-- 兜底 -->
    <template v-else>
      <p class="tip">线段图：{{ id }}</p>
    </template>

    <!-- 从图到式：先在图上标条件，再写数量关系式，最后列式 -->
    <div class="seg-bar">
      <button type="button" class="seg-btn primary" data-test="seg-next" :disabled="segStep >= 2" @click="nextSegStep">
        试一试：把图变成算式
      </button>
      <button type="button" class="seg-btn ghost" data-test="seg-reset" @click="resetSegStep">重来</button>
      <span class="seg-progress" data-test="seg-progress">第 {{ segStep }} / 2 步</span>
    </div>
    <p v-if="segStep >= 1" class="seg-relation" data-test="seg-relation">数量关系式：{{ relation }}</p>
    <p v-if="segStep >= 2" class="seg-expr" data-test="seg-expr">列式解答：{{ expr }}</p>
  </div>
</template>

<style scoped>
.segment-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.seg-sep {
  stroke: white;
  stroke-width: 1.5;
}
.dim-line {
  stroke: var(--ui-text-muted);
  stroke-width: 1;
}
.dim-text {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.seg-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.seg-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.seg-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.seg-btn.ghost {
  color: var(--ui-text-muted);
}
.seg-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.seg-progress {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.seg-relation,
.seg-expr {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 40rem;
}
.seg-expr {
  color: var(--ui-primary);
  font-weight: 800;
}
.seg-svg {
  width: 100%;
  max-width: 34rem;
}
.bar-title {
  fill: var(--ui-text-highlighted);
  font-size: 13px;
  font-weight: 700;
}
.bar-name {
  fill: var(--ui-text-toned);
  font-size: 12px;
  font-weight: 700;
}
.bar {
  stroke-width: 0;
}
.bar.primary {
  fill: color-mix(in srgb, var(--ui-primary) 65%, white);
}
.bar.secondary {
  fill: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 55%, white);
}
.bar.success {
  fill: color-mix(in srgb, var(--ui-success, #22c55e) 55%, white);
}
.bar.ghost {
  fill: color-mix(in srgb, var(--ui-text-muted) 18%, transparent);
}
.bar-tag {
  fill: var(--ui-text-toned);
  font-size: 11px;
}
.bar-val {
  fill: var(--ui-text-highlighted);
  font-size: 11px;
  font-weight: 700;
}
.diff-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  fill: none;
}
.diff-tag {
  fill: var(--ui-warning, #f59e0b);
  font-size: 10px;
  font-weight: 700;
}
.scale-note {
  fill: var(--ui-text-muted);
  font-size: 10px;
}
.people {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
}
.people2 {
  fill: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 55%, white);
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
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.tip {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
.tip b {
  color: var(--ui-primary);
}
</style>
