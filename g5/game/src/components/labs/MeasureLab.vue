<script setup lang="ts">
/**
 * 测量与单位 Lab：公顷/平方千米换算 + 组合图形割补求面积
 *
 * 两处对齐课本的改动（都由 `@/lib/labs/area` 的新函数 + 单元测试兜底）：
 * - 公顷：原来 `sidePx = 60 + 边长 × 0.14` 是「假映射」——1 米和 100 米的方块看起来差不多大。
 *   现在用真实比例尺（1 千米 = 画框边长），并始终画出 1 千米外框与 10×10 个 1 公顷格子。
 * - 组合图形：原来按 w/h1/h2 算成 10750 m²，与课本例 6（上边 100、左边高 90、右上竖边 40、下底 140）
 *   的正确结果 **10000 m² = 1 公顷** 不符。现在按课本图形建模，并给出三种割补方法的对照。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'
import { compositeMethods, compositeOutline, hectareScale, polygonArea, toHectare, type Pt } from '@/lib/labs/area'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 公顷 ---------- */
const side = computed(() => props.values.side ?? 100)
const m2 = computed(() => side.value * side.value)
const ha = computed(() => m2.value / 10000)
const km2 = computed(() => m2.value / 1_000_000)
const BOX = 240
/** 真实比例尺：1 千米 = 200px；当前正方形的边长按同一比例 */
const sidePx = computed(() => hectareScale(side.value, 1000, BOX))
const sidePxShown = computed(() => Math.max(sidePx.value, 1.5))
const haTiles = computed(() => Math.min(100, Math.round(ha.value)))
const sqX = 24
/** 画框 520×520，1 千米外框边长 BOX=240：底边留一点空位，整个外框（含铺满的方块）都在画布内 */
const sqY = 272
const isOneHectare = computed(() => Math.abs(side.value - 100) < 1e-9)
const isOneKm = computed(() => Math.abs(side.value - 1000) < 1e-9)
const hectareVerify = computed(() =>
  isOneHectare.value
    ? `✓ 边长 100 米 → 100 × 100 = 10000 平方米 = 1 公顷`
    : isOneKm.value
      ? `✓ 边长 1000 米 → 1000 × 1000 = 1000000 平方米 = 100 公顷 = 1 平方千米`
      : `✓ 边长 ${side.value} 米 → ${side.value} × ${side.value} = ${m2.value} 平方米 = ${toFixed2(ha.value)} 公顷（1 公顷 = 10000 平方米）`,
)

/* ---------- 组合图形 ---------- */
const spec = computed(() => ({
  top: props.values.top ?? 100,
  left: props.values.left ?? 90,
  right: props.values.right ?? 40,
  bottom: props.values.bottom ?? 140,
}))
const methods = computed(() => compositeMethods(spec.value))
const outline = computed(() => compositeOutline(spec.value))
const methodIdx = ref(0)
const activeMethod = computed(() => methods.value[Math.min(methodIdx.value, methods.value.length - 1)]!)
const total = computed(() => activeMethod.value.total)
const totalHectare = computed(() => toHectare(total.value))
/** 用鞋带公式独立算一遍图形面积，和三种方法互证 */
const shapeArea = computed(() => polygonArea(outline.value))
const allAgree = computed(() => methods.value.every((m) => Math.abs(m.total - shapeArea.value) < 1e-6))
function pickMethod(i: number) {
  methodIdx.value = i
  playClick()
}
/** 换一种割法：在三种割补方法之间轮换（结果必须完全相同） */
function cycleMethod() {
  methodIdx.value = (methodIdx.value + 1) % methods.value.length
  playClick()
}

/* ---------- 公顷：把 1 公顷小方块逐行铺满 1 平方千米 ---------- */
const FILL_ROWS = 10
const FILL_COLS = 10
const fillRows = ref(0)
const filledTiles = computed(() => fillRows.value * FILL_COLS)
const fillDone = computed(() => fillRows.value >= FILL_ROWS)
const fillTiles = computed(() => {
  const size = BOX / FILL_COLS
  const out: { x: number; y: number; key: string }[] = []
  for (let r = 0; r < fillRows.value; r++) {
    for (let c = 0; c < FILL_COLS; c++) {
      out.push({ x: sqX + c * size, y: sqY - (r + 1) * size, key: `r${r}c${c}` })
    }
  }
  return out
})
function fillNextRow() {
  if (fillDone.value) return
  fillRows.value++
  playClick()
}
function fillAll() {
  fillRows.value = FILL_ROWS
  playClick()
}
function resetFill() {
  fillRows.value = 0
  playClick()
}

/* ---------- 组合图形：米 → 像素（等比） ---------- */
const PAD = 70
const DRAW = 260
const drawScale = computed(() => DRAW / Math.max(spec.value.bottom, spec.value.left, 1))
const pxOf = (v: number) => v * drawScale.value
const toSvg = (p: Pt) => `${(PAD + pxOf(p[0])).toFixed(1)},${(PAD + DRAW - pxOf(p[1])).toFixed(1)}`
const viewBox = computed(() => `0 0 ${PAD * 2 + DRAW} ${PAD * 2 + DRAW}`)
const outlinePts = computed(() => outline.value.map(toSvg).join(' '))
const partPts = (points: Pt[]) => points.map(toSvg).join(' ')
const partLabelPos = (points: Pt[]) => {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length
  const cy = points.reduce((s, p) => s + p[1], 0) / points.length
  return { x: PAD + pxOf(cx), y: PAD + DRAW - pxOf(cy) }
}
</script>

<template>
  <div class="measure-wrap">
    <!-- 公顷 -->
    <template v-if="kind === 'hectare'">
      <div class="ha-row">
        <div class="ha-square-box">
          <svg :viewBox="`0 0 ${PAD * 4 + BOX} ${PAD * 4 + BOX}`" class="w-full">
            <!-- 1 千米外框（参照系） -->
            <rect :x="sqX" :y="sqY - BOX" :width="BOX" :height="BOX" class="km-outline" />
            <text :x="sqX + BOX - 4" :y="sqY - BOX + 14" text-anchor="end" class="dim-label">1 千米 × 1 千米 = 1 平方千米</text>
            <!-- 1 公顷小方块（100 米，按真实比例：1 千米外框的 1/10 宽） -->
            <rect :x="sqX" :y="sqY - (BOX / 10) * 1" :width="BOX / 10" :height="BOX / 10" class="ha-unit" />
            <!-- 铺满看进率：逐行铺进 1 公顷小方块 -->
            <g v-if="fillRows > 0" class="fill-layer" aria-label="逐行铺满的 1 公顷方块">
              <rect
                v-for="t in fillTiles"
                :key="t.key"
                :x="t.x"
                :y="t.y"
                :width="BOX / 10"
                :height="BOX / 10"
                class="fill-tile"
              />
            </g>
            <!-- 当前正方形 -->
            <rect :x="sqX" :y="sqY - sidePxShown" :width="sidePxShown" :height="sidePxShown" class="square-fill" />
            <!--
              标注一律贴在当前正方形右侧：原来「100 米 = 1 公顷」落在方块底边上、「10000 m²」压在方块中间，
              「边长 100 米」还居中在外框下方（看起来像在说外框），三个标签互相重叠且指错了对象。
            -->
            <text :x="sqX + sidePxShown + 6" :y="sqY - 6" text-anchor="start" class="dim-label">
              边长 {{ side }} 米
            </text>
            <text :x="sqX" :y="sqY - sidePxShown - 8" text-anchor="start" class="m2-label">
              {{ m2 }} m² = {{ toFixed2(ha) }} 公顷
            </text>
          </svg>
          <p class="grid-note">同一个比例尺下比较：边长 100 米的方块只有 1 千米外框的十分之一宽，面积是它的百分之一</p>
        </div>
        <div class="ha-convert">
          <div class="convert-row">
            <span class="convert-unit">平方米</span>
            <strong>{{ toFixed2(m2) }}</strong>
          </div>
          <div class="convert-row">
            <span class="convert-unit">公顷</span>
            <strong>{{ toFixed2(ha) }}</strong>
          </div>
          <div class="convert-row">
            <span class="convert-unit">平方千米</span>
            <strong>{{ toFixed2(km2) }}</strong>
          </div>
          <p class="convert-note">1 公顷 = 10000 平方米<br />1 平方千米 = 100 公顷</p>
        </div>
      </div>
      <div class="km-reference">
        <div class="km-grid" aria-label="1 平方千米由 100 个 1 公顷组成">
          <span v-for="i in 100" :key="i" class="km-cell" :class="{ active: i <= haTiles }" />
        </div>
        <div class="km-caption">
          <p><b>1 平方千米</b> = 10 × 10 个 1 公顷 = <b>100 公顷</b></p>
          <p>每格 1 公顷；当前正方形约占 <b>{{ toFixed2(ha) }}</b> 格。</p>
        </div>
      </div>
      <div class="fill-bar">
        <UButton size="sm" color="primary" variant="soft" :disabled="fillDone" @click="fillNextRow" data-act>
          再铺一行（{{ FILL_COLS }} 个 1 公顷）
        </UButton>
        <UButton size="sm" color="primary" variant="solid" :disabled="fillDone" @click="fillAll">铺满看进率</UButton>
        <UButton v-if="fillRows > 0" size="sm" variant="outline" color="neutral" @click="resetFill">复位</UButton>
        <span class="fill-count" aria-label="已铺个数">已铺 <b>{{ filledTiles }}</b> 个 1 公顷</span>
      </div>
      <p v-if="fillDone" class="fill-verify">
        ✓ 每行 {{ FILL_COLS }} 个、铺满 {{ FILL_ROWS }} 行：{{ FILL_COLS }} × {{ FILL_ROWS }} = <b>{{ filledTiles }}</b> 个 1 公顷 =
        <b>100 公顷</b> = 1 平方千米（1 公顷 = 10000 平方米，所以 1 平方千米 = 1000000 平方米）
      </p>
      <p class="verify-line">{{ hectareVerify }}</p>
      <p class="note">测量或计量土地面积，常用公顷（hm²）作单位；边长 100 米的正方形土地面积就是 1 公顷。</p>
    </template>

    <!-- 组合图形 -->
    <template v-else>
      <div class="method-bar">
        <UButton
          v-for="(m, i) in methods"
          :key="m.key"
          size="sm"
          :color="i === methodIdx ? 'primary' : 'neutral'"
          :variant="i === methodIdx ? 'solid' : 'outline'"
          @click="pickMethod(i)"
        >
          {{ m.label }}
        </UButton>
      </div>
      <div class="cycle-bar">
        <UButton size="sm" color="warning" variant="soft" icon="i-heroicons-arrow-path" @click="cycleMethod">
          换一种割法（第 {{ methodIdx + 1 }}/{{ methods.length }} 种）
        </UButton>
        <span class="cycle-tip">三种割法只是分法不同，总面积一定相同</span>
      </div>
      <div class="method-totals" aria-label="三种割法结果对照">
        <span
          v-for="(m, i) in methods"
          :key="m.key"
          class="method-total-chip"
          :class="{ active: i === methodIdx }"
        >
          {{ m.label }}：<b>{{ m.total }}</b> m²
        </span>
      </div>
      <svg :viewBox="viewBox" class="pond-svg" role="img" aria-label="池塘平面图与割补方法">
        <!-- 底图 -->
        <polygon :points="outlinePts" class="pond-fill" />
        <!-- 当前方法的各部分 -->
        <g v-for="(part, i) in activeMethod.parts" :key="part.name">
          <polygon
            :points="partPts(part.points)"
            :class="activeMethod.op === 'subtract' && i === 1 ? 'part-missing' : i === 0 ? 'part-a' : 'part-b'"
          />
          <text :x="partLabelPos(part.points).x" :y="partLabelPos(part.points).y" text-anchor="middle" class="part-label">
            {{ part.area }} m²
          </text>
        </g>
        <polygon :points="outlinePts" class="pond-outline" />
        <!-- 尺寸标注 -->
        <line :x1="PAD" :y1="PAD + DRAW" :x2="PAD + pxOf(spec.bottom)" :y2="PAD + DRAW" class="dim-line" />
        <text :x="PAD + pxOf(spec.bottom) / 2" :y="PAD + DRAW + 18" text-anchor="middle" class="dim-label">下底 {{ spec.bottom }} 米</text>
        <text :x="PAD + pxOf(spec.top) / 2" :y="PAD + DRAW - pxOf(spec.left) - 8" text-anchor="middle" class="dim-label">上边 {{ spec.top }} 米</text>
        <text :x="PAD - 6" :y="PAD + DRAW - pxOf(spec.left) / 2" text-anchor="end" class="dim-label">左边 {{ spec.left }} 米</text>
        <text :x="PAD + pxOf(spec.top) + 6" :y="PAD + DRAW - pxOf(spec.left) + 24" class="dim-label">右上 {{ spec.right }} 米</text>
      </svg>
      <div class="formula-row">
        <span v-for="(part, i) in activeMethod.parts" :key="part.name" class="formula-chip">
          {{ activeMethod.op === 'add' ? (i === 0 ? '' : '+ ') : i === 0 ? '' : '− ' }}{{ part.name }} = {{ part.area }} m²
        </span>
        <span class="formula-chip primary">
          S = {{ total }} 平方米 = {{ toFixed2(totalHectare) }} 公顷
        </span>
      </div>
      <p class="verify-line">
        <template v-if="allAgree">
          ✓ 三种割补方法结果相同，都是 <b>{{ shapeArea }}</b> 平方米 = <b>{{ toFixed2(totalHectare) }}</b> 公顷（用图形顶点+鞋带公式独立核对过）
        </template>
        <template v-else>注意：三种方法结果不一致，请检查已知条件</template>
      </p>
      <p class="note">求组合图形的面积：可以割补成能直接计算面积的图形；割补时要根据图形特点利用已知条件。</p>
    </template>
  </div>
</template>

<style scoped>
.measure-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.ha-row {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.ha-square-box {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.ha-square-box svg {
  max-width: 320px;
  height: auto;
}
.km-outline {
  fill: color-mix(in srgb, var(--ui-primary) 6%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 1.4;
  stroke-dasharray: 5 4;
}
.ha-unit {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 35%, transparent);
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.2;
}
.square-fill {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  transition: all 0.3s;
}
.m2-label {
  font-size: 0.9rem;
  font-weight: 800;
  fill: var(--ui-text-highlighted);
}
.dim-label {
  font-size: 11px;
  fill: var(--ui-text-muted);
  font-weight: 700;
}
.ha-convert {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.convert-row {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  border-bottom: 1px dashed var(--ui-border);
  padding-bottom: 0.25rem;
}
.convert-unit {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  width: 4.5rem;
}
.convert-row strong {
  font-size: 1.15rem;
  color: var(--ui-primary);
}
.convert-note {
  margin-top: 0.2rem;
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.km-reference {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.km-grid {
  display: grid;
  grid-template-columns: repeat(10, 0.55rem);
  gap: 1px;
  padding: 2px;
  border: 1px solid var(--ui-border);
  border-radius: 5px;
  background: var(--ui-bg-muted);
}
.km-cell {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 1px;
  background: white;
  border: 1px solid color-mix(in srgb, var(--ui-border) 72%, transparent);
}
.km-cell.active {
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border-color: var(--ui-primary);
}
.km-caption {
  max-width: 17rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
}
.km-caption b {
  color: var(--ui-primary);
}
.method-bar {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.cycle-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.cycle-tip {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  font-weight: 700;
}
.method-totals {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.method-total-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  padding: 0.2rem 0.65rem;
}
.method-total-chip b {
  color: var(--ui-text-highlighted);
}
.method-total-chip.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
  color: var(--ui-primary);
}
.method-total-chip.active b {
  color: var(--ui-primary);
}
.fill-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.fill-count {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.fill-count b {
  color: var(--ui-primary);
  font-size: 1rem;
}
.fill-tile {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-primary);
  stroke-width: 0.6;
}
.fill-verify {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  text-align: center;
  max-width: 44rem;
}
.fill-verify b {
  color: var(--ui-primary);
}
.pond-svg {
  max-width: 420px;
  height: auto;
}
.pond-fill {
  fill: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.pond-outline {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 2.4;
}
.part-a {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.4;
}
.part-b {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 35%, white);
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.4;
}
.part-missing {
  fill: color-mix(in srgb, var(--ui-text-muted) 18%, transparent);
  stroke: var(--ui-text-muted);
  stroke-width: 1.4;
  stroke-dasharray: 5 4;
}
.part-label {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-highlighted);
}
.dim-line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.formula-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.formula-chip.primary {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  text-align: center;
  max-width: 42rem;
}
.verify-line b {
  color: var(--ui-primary);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 42rem;
}
.grid-note {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
  text-align: center;
}
</style>
