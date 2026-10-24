<script setup lang="ts">
/**
 * 周长与面积 Lab：长方形/正方形的周长与面积、面积单位量面积
 *
 * 本轮（第 4 轮）改动：
 * - 每个图形都画上**尺寸线**（带端点的引线）和**单位方格**，长和宽都标出来
 *   （旧实现只标了"长"，面积公式还压在图里，学生看不出 8×5 是从哪儿来的）。
 * - 面积类加了「一格一格铺满」：每点一次真的多铺满一排 1 平方厘米的小方格（L3）。
 * - 周长类加了「把四条边拉直」：长、宽、长、宽 依次拉成一条直线，
 *   看得见周长就是四条边的总长（旧实现只有一句话）。
 * - 方格大小 = 同一比例尺下的真实方格，长 36 与长 8 的方格一样大，不随数值乱缩放。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

const rectA = computed(() => Math.round(props.values.a ?? 8))
const rectB = computed(() => Math.round(props.values.b ?? 5))

const isGrid = computed(() => kind.value === 'area-grid')
const isSquare = computed(() => kind.value === 'peri-square' || kind.value === 'area-square')
const isPeri = computed(() => kind.value === 'peri-rect' || kind.value === 'peri-square')
const isArea = computed(() => !isPeri.value)

/** 图形的长（横向格数/厘米数）与宽（纵向） */
const wNum = computed(() => (isGrid.value ? Math.round(props.values.a ?? 8) : isSquare.value ? Math.round(props.values.a ?? 6) : rectA.value))
const hNum = computed(() => (isGrid.value ? Math.round(props.values.b ?? 5) : isSquare.value ? Math.round(props.values.a ?? 6) : rectB.value))
const unit = computed(() => (isGrid.value ? '格' : '厘米'))
const areaUnit = computed(() => (isGrid.value ? '格' : '平方厘米'))
const periValue = computed(() => (wNum.value + hNum.value) * 2)
const areaValue = computed(() => wNum.value * hNum.value)

/* ---------- 画布与比例 ---------- */
const viewW = 380
const viewH = 300
/** 每 1 单位 = 多少像素：整幅图里所有图形共用同一个比例尺 */
const cellPx = computed(() => {
  const maxW = Math.max(wNum.value, 1)
  const maxH = Math.max(hNum.value, 1)
  return Math.max(6, Math.min(24, Math.floor((viewW - 130) / maxW), Math.floor((viewH - 130) / maxH)))
})
const rw = computed(() => wNum.value * cellPx.value)
const rh = computed(() => hNum.value * cellPx.value)
const rx = computed(() => (viewW - rw.value) / 2)
const ry = computed(() => (viewH - rh.value) / 2 + 8)

/** 方格（每个格子就是 1 个面积单位） */
const cells = computed(() => {
  const out: { x: number; y: number; i: number }[] = []
  for (let r = 0; r < hNum.value; r++) {
    for (let c = 0; c < wNum.value; c++) {
      out.push({ x: rx.value + c * cellPx.value, y: ry.value + r * cellPx.value, i: r * wNum.value + c })
    }
  }
  return out
})

/* ---------- 过程态 1：铺满小方格 ---------- */
const filled = ref(areaValue.value)
const coveredRows = computed(() => Math.round(filled.value / Math.max(wNum.value, 1)))
function fillNextRow() {
  if (filled.value >= areaValue.value) filled.value = wNum.value
  else filled.value = Math.min(areaValue.value, filled.value + wNum.value)
}
function fillAll() {
  filled.value = areaValue.value
}

/* ---------- 过程态 2：把四条边拉直 ---------- */
const unfoldStep = ref(4)
const stripScale = computed(() => (viewW - 80) / Math.max(periValue.value, 1))
const stripSegs = computed(() => [
  { label: `长 ${wNum.value}`, len: wNum.value * stripScale.value, color: 'a' },
  { label: `宽 ${hNum.value}`, len: hNum.value * stripScale.value, color: 'b' },
  { label: `长 ${wNum.value}`, len: wNum.value * stripScale.value, color: 'a' },
  { label: `宽 ${hNum.value}`, len: hNum.value * stripScale.value, color: 'b' },
])
const stripOffsets = computed(() => {
  let acc = 0
  return stripSegs.value.map((seg) => {
    const x = acc
    acc += seg.len
    return { ...seg, x }
  })
})
const stripTotal = computed(() => stripOffsets.value.reduce((a, s) => a + s.len, 0))
function unfoldNext() {
  if (unfoldStep.value >= 4) unfoldStep.value = 1
  else unfoldStep.value += 1
}
function unfoldAll() {
  unfoldStep.value = 4
}
/** 四条边拉直时的算式文字 */
const perLabel = computed(() => `长 ${wNum.value} + 宽 ${hNum.value} + 长 ${wNum.value} + 宽 ${hNum.value}`)
</script>

<template>
  <div class="shape-wrap">
    <svg :viewBox="`0 0 ${viewW} ${viewH}`" class="shape-svg">
      <!-- 单位方格：每个小格 = 1 个面积单位 -->
      <g v-if="isArea" class="grid-box">
        <rect
          v-for="c in cells"
          :key="'cell' + c.i"
          :x="c.x"
          :y="c.y"
          :width="cellPx - 0.6"
          :height="cellPx - 0.6"
          class="unit-cell"
          :class="{ on: c.i < filled }"
        />
      </g>

      <!-- 轮廓 -->
      <rect :x="rx" :y="ry" :width="rw" :height="rh" class="rect-outline" />

      <!-- 尺寸线：长（上方） -->
      <g class="dim">
        <line :x1="rx" :y1="ry - 22" :x2="rx + rw" :y2="ry - 22" class="dim-line" />
        <line :x1="rx" :y1="ry - 27" :x2="rx" :y2="ry - 17" class="dim-tick" />
        <line :x1="rx + rw" :y1="ry - 27" :x2="rx + rw" :y2="ry - 17" class="dim-tick" />
        <line :x1="rx" :y1="ry - 18" :x2="rx" :y2="ry" class="dim-guide" />
        <line :x1="rx + rw" :y1="ry - 18" :x2="rx + rw" :y2="ry" class="dim-guide" />
        <text :x="rx + rw / 2" :y="ry - 30" text-anchor="middle" class="dim-text">
          {{ isSquare ? `边长 a = ${wNum}` : `长 a = ${wNum}` }} {{ unit }}
        </text>
      </g>

      <!-- 尺寸线：宽（左侧） -->
      <g class="dim">
        <line :x1="rx - 22" :y1="ry" :x2="rx - 22" :y2="ry + rh" class="dim-line" />
        <line :x1="rx - 27" :y1="ry" :x2="rx - 17" :y2="ry" class="dim-tick" />
        <line :x1="rx - 27" :y1="ry + rh" :x2="rx - 17" :y2="ry + rh" class="dim-tick" />
        <line :x1="rx - 18" :y1="ry" :x2="rx" :y2="ry" class="dim-guide" />
        <line :x1="rx - 18" :y1="ry + rh" :x2="rx" :y2="ry + rh" class="dim-guide" />
        <text
          :x="rx - 32"
          :y="ry + rh / 2"
          text-anchor="middle"
          class="dim-text"
          :transform="`rotate(-90 ${rx - 32} ${ry + rh / 2})`"
        >
          {{ isSquare ? `边长 a = ${hNum}` : `宽 b = ${hNum}` }} {{ unit }}
        </text>
      </g>

      <!-- 面积：每排几个 × 几排 -->
      <text v-if="isArea" :x="viewW / 2" :y="viewH - 18" text-anchor="middle" class="area-text">
        每排 {{ wNum }} 个 × {{ hNum }} 排 = {{ areaValue }} 个 1 {{ areaUnit }}
      </text>

      <!-- 周长：把四条边拉成一条直线 -->
      <g v-else>
        <template v-for="(seg, i) in stripOffsets" :key="'seg' + i">
          <g v-if="i < unfoldStep">
            <rect :x="40 + seg.x" :y="viewH - 52" :width="seg.len" height="18" class="strip" :class="seg.color" />
            <text :x="40 + seg.x + seg.len / 2" :y="viewH - 58" text-anchor="middle" class="strip-label">{{ seg.label }}</text>
          </g>
        </template>
        <line :x1="40" :y1="viewH - 28" x2="40" y2="0" class="hidden-guide" />
        <line :x1="40" :y1="viewH - 28" :x2="40 + stripTotal" :y2="viewH - 28" class="dim-line" />
        <text :x="40 + stripTotal / 2" :y="viewH - 12" text-anchor="middle" class="strip-total">
          {{ unfoldStep }} 条边拉直：{{ isSquare ? `${hNum} + ${hNum} + ${hNum} + ${hNum}` : perLabel }} = {{ periValue }} {{ unit }}
        </text>
      </g>
    </svg>

    <div class="op-bar">
      <button v-if="isArea" type="button" class="op-btn primary" data-test="fill-next" @click="fillNextRow">
        试一试：一格一格铺满（已铺 {{ filled }} / {{ areaValue }}，共 {{ coveredRows }} 排）
      </button>
      <button v-else type="button" class="op-btn primary" data-test="unfold-next" @click="unfoldNext">
        试一试：把四条边拉直（已拉 {{ unfoldStep }} 条）
      </button>
      <button v-if="isArea" type="button" class="op-btn ghost" data-test="fill-all" @click="fillAll">铺满</button>
      <button v-else type="button" class="op-btn ghost" data-test="unfold-all" @click="unfoldAll">全部拉直</button>
    </div>

    <div class="formula-row">
      <span class="chip">{{ isPeri ? (isSquare ? 'C = a × 4' : 'C = (a + b) × 2') : 'S = a × b' }}</span>
      <span class="chip op" data-test="formula-result">
        {{ isPeri
          ? isSquare
            ? `${wNum} × 4 = ${periValue} ${unit}`
            : `(${wNum} + ${hNum}) × 2 = ${periValue} ${unit}`
          : isGrid
            ? `${wNum} × ${hNum} = ${areaValue} ${areaUnit}`
            : `${wNum} × ${hNum} = ${areaValue} ${areaUnit}` }}
      </span>
    </div>
    <p class="note">
      <template v-if="isPeri">
        周长是<b>四条边</b>的总长：两条长 + 两条宽 = {{ wNum }} + {{ hNum }} + {{ wNum }} + {{ hNum }} = <b>{{ periValue }}</b> {{ unit }}
      </template>
      <template v-else>
        面积是<b>铺满的方格数</b>：每排 {{ wNum }} 个、共 {{ hNum }} 排，{{ wNum }} × {{ hNum }} = <b>{{ areaValue }}</b> {{ areaUnit }}
      </template>
    </p>
  </div>
</template>

<style scoped>
.shape-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.shape-svg {
  width: 100%;
  max-width: 34rem;
}
.unit-cell {
  fill: transparent;
  stroke: color-mix(in srgb, var(--ui-border) 80%, transparent);
  stroke-width: 0.6;
}
.unit-cell.on {
  fill: color-mix(in srgb, var(--ui-primary) 30%, white);
}
.rect-outline {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 2.4;
}
.dim-line,
.dim-tick {
  stroke: var(--ui-text-highlighted);
  stroke-width: 1.2;
}
.dim-guide {
  stroke: var(--ui-text-muted);
  stroke-width: 0.7;
  stroke-dasharray: 3 2;
}
.dim-text {
  fill: var(--ui-text-highlighted);
  font-size: 11px;
  font-weight: 700;
}
.area-text {
  fill: var(--ui-text-toned);
  font-size: 11px;
}
.strip {
  stroke-width: 1;
}
.strip.a {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-primary);
}
.strip.b {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 45%, white);
  stroke: var(--ui-warning, #f59e0b);
}
.strip-label {
  fill: var(--ui-text-toned);
  font-size: 9px;
}
.strip-total {
  fill: var(--ui-primary);
  font-size: 11px;
  font-weight: 700;
}
.hidden-guide {
  stroke: transparent;
}
.op-bar {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.op-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.op-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.op-btn.ghost {
  color: var(--ui-text-muted);
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
  font-size: 0.88rem;
  color: var(--ui-text-toned);
}
.chip.op {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 38rem;
}
.note b {
  color: var(--ui-primary);
}
</style>
