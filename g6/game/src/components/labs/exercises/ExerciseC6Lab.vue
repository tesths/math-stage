<script setup lang="ts">
/**
 * 练习题 Lab · 六 放大与缩小
 * ex-c6-scale-area  放大缩小后的面积倍数（方格纸对比 + 面积对比条）
 * ex-c6-two-maps    两种比例尺的图纸对比（图纸卡片 + 同一段实际距离 + 改画流程）
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ================= 放大缩小后的面积倍数 ================= */
/** 方格边长（px，原图与放大图共用同一格边长） */
const CELL = 10
/** 方格纸底线 y */
const GROUND_Y = 168
/** 原图 / 放大图左下角 x */
const TRI_ORIG_X = 30
const TRI_BIG_X = 190
/** 梯形原图 / 缩小图左下角 x */
const TRAP_ORIG_X = 30
const TRAP_BIG_X = 190
/** 面积对比条：1 格² = 6px，并封顶避免越出 viewBox */
const AREA_PX = 6
const MAX_BAR = 430
/** 逐级放大的阶梯柱：柱宽 / 间距 / 满格高度 / 基线 y */
const STEP_X0 = 30
const STEP_W = 74
const STEP_GAP = 18
const STEP_H = 66
const STEP_BASE = 104

const a = computed(() => props.values.a ?? 2)
const n = computed(() => Math.round(props.values.n ?? 3))
const d = computed(() => Math.round(props.values.d ?? 2))
const trapTop = computed(() => props.values.trapTop ?? 4)
const trapBottom = computed(() => props.values.trapBottom ?? 8)
const trapHeight = computed(() => props.values.trapHeight ?? 6)

const triArea = computed(() => (a.value * a.value) / 2)
const scaledArea = computed(() => (a.value * a.value * n.value * n.value) / 2)
const times = computed(() => n.value * n.value)
const trapArea = computed(() => ((trapTop.value + trapBottom.value) * trapHeight.value) / 2)
const fracDen = computed(() => d.value * d.value)
const trapScaled = computed(() => trapArea.value / fracDen.value)

/* ---------- 过程态：一格一格地放大，看边长 ×k 时面积变 k² 倍 ---------- */
/** 当前放大级数：1 = 还是原图那么大，n = 放大到位；初值用大数哨兵 → 取到 n（最完整态，随 n 变化） */
const growLevel = ref(99)
const stepK = computed(() => Math.min(Math.max(1, growLevel.value), n.value))
/** 放大到第 k 级时：直角边、面积、面积倍数、面积条宽度 */
const stepLeg = computed(() => a.value * stepK.value)
const stepArea = computed(() => (a.value * a.value * stepK.value * stepK.value) / 2)
const stepTimes = computed(() => stepK.value * stepK.value)
const stepBarScaled = computed(() => Math.min(stepArea.value * AREA_PX, MAX_BAR))
const stepAtFull = computed(() => stepK.value >= n.value)
const stepAtFirst = computed(() => stepK.value <= 1)
function growOnce() {
  if (stepAtFull.value) return
  growLevel.value = stepK.value + 1
  playClick()
}
function backToFirst() {
  growLevel.value = 1
  playClick()
}
/** 阶梯柱：第 k 级柱高按 k²/n² 归一，逐级标出 1²、2² … n² 格 */
const stepCols = computed(() =>
  Array.from({ length: n.value }, (_, i) => {
    const k = i + 1
    const h = (k * k * STEP_H) / (n.value * n.value)
    return {
      k,
      x: STEP_X0 + i * (STEP_W + STEP_GAP),
      y: STEP_BASE - h,
      w: STEP_W,
      h,
      current: k === stepK.value,
    }
  }),
)
const stepNote = computed(() =>
  stepAtFull.value
    ? `最完整态：边长 ${toFixed2(a.value)} 格 × ${n.value} = ${toFixed2(stepLeg.value)} 格，面积由 ${toFixed2(triArea.value)} 格² 变成 ${toFixed2(stepArea.value)} 格²——边长 ×${n.value}，面积就 ×${n.value}² = ${stepTimes.value} 倍`
    : `第 ${stepK.value} 级：边长 ×${stepK.value} → ${toFixed2(stepLeg.value)} 格，面积 ${toFixed2(stepArea.value)} 格²，是原图的 ${stepK.value} × ${stepK.value} = ${stepTimes.value} 倍；再点「再放大 1 倍」看下一级`,
)

/** 直角在左下的等腰直角三角形：两直角边沿格线 */
const triOrigPath = computed(
  () =>
    `M ${TRI_ORIG_X} ${GROUND_Y} L ${TRI_ORIG_X + a.value * CELL} ${GROUND_Y} L ${TRI_ORIG_X} ${GROUND_Y - a.value * CELL} Z`,
)
const triScaledPath = computed(() => {
  const leg = stepLeg.value * CELL
  return `M ${TRI_BIG_X} ${GROUND_Y} L ${TRI_BIG_X + leg} ${GROUND_Y} L ${TRI_BIG_X} ${GROUND_Y - leg} Z`
})
/** 放大图上叠原图虚线轮廓（与原图同尺寸，锚在同一左下角） */
const triGhostPath = computed(
  () =>
    `M ${TRI_BIG_X} ${GROUND_Y} L ${TRI_BIG_X + a.value * CELL} ${GROUND_Y} L ${TRI_BIG_X} ${GROUND_Y - a.value * CELL} Z`,
)
/** 直角梯形（左侧竖直）：上底 trapTop、下底 trapBottom、高 trapHeight（单位：格） */
const trapOrigPath = computed(() => {
  const b = trapBottom.value * CELL
  const t = trapTop.value * CELL
  const h = trapHeight.value * CELL
  return `M ${TRAP_ORIG_X} ${GROUND_Y} L ${TRAP_ORIG_X + b} ${GROUND_Y} L ${TRAP_ORIG_X + t} ${GROUND_Y - h} L ${TRAP_ORIG_X} ${GROUND_Y - h} Z`
})
/** 按 1:d 缩小后的直角梯形（每条边都是原来的 1/d） */
const trapScaledPath = computed(() => {
  const k = 1 / d.value
  const b = trapBottom.value * CELL * k
  const t = trapTop.value * CELL * k
  const h = trapHeight.value * CELL * k
  return `M ${TRAP_BIG_X} ${GROUND_Y} L ${TRAP_BIG_X + b} ${GROUND_Y} L ${TRAP_BIG_X + t} ${GROUND_Y - h} L ${TRAP_BIG_X} ${GROUND_Y - h} Z`
})

const barOrig = computed(() => Math.min(triArea.value * AREA_PX, MAX_BAR))
const barTrap = computed(() => Math.min(trapArea.value * AREA_PX, MAX_BAR))
const barTrapScaled = computed(() => Math.min(trapScaled.value * AREA_PX, MAX_BAR))

/* ================= 两种比例尺的图纸对比 ================= */
/** 图上距离的示意比例：50px/厘米；对比条封顶避免越出 viewBox */
const SEG_PX_PER_CM = 50
const MAX_SEG = 280

const denA = computed(() => Math.round(props.values.denA ?? 5000))
const denB = computed(() => Math.round(props.values.denB ?? 2000))
const cm = computed(() => props.values.cm ?? 2)
const cmA = computed(() => props.values.cmA ?? 3)

const actualACm = computed(() => cmA.value * denA.value)
const actualAM = computed(() => actualACm.value / 100)
const actualBCm = computed(() => cmA.value * denB.value)
const actualBM = computed(() => actualBCm.value / 100)
const actualCmCm = computed(() => cm.value * denB.value)
const actualCmM = computed(() => actualCmCm.value / 100)
const newCm = computed(() => (cm.value * denB.value) / denA.value)
/** 两条对比条共用同一比例尺，保证“同一实际距离、图上长度与分母成反比”在极值下也成立 */
const segK = computed(() => Math.min(1, MAX_SEG / (Math.max(newCm.value, cm.value) * SEG_PX_PER_CM)))
const segAPx = computed(() => newCm.value * SEG_PX_PER_CM * segK.value)
const segBPx = computed(() => cm.value * SEG_PX_PER_CM * segK.value)

/* ---------- 过程态：先算「图上 × 分母 ÷ 100」，再揭示换画到 A 图 ---------- */
/** 1 = 只揭示第 1 步（算出实际距离）；2 = 再揭示第 2 步（换画到 A 图）；初值取最完整的第 2 步 */
const revealStep = ref(2)
const showStep2 = computed(() => revealStep.value >= 2)
function onlyStep1() {
  revealStep.value = 1
  playClick()
}
function showBothSteps() {
  revealStep.value = 2
  playClick()
}
const tmStepNote = computed(() =>
  showStep2.value
    ? `两步都亮着：B 图 ${toFixed2(cm.value)} 厘米 × ${denB.value} ÷ 100 = ${toFixed2(actualCmM.value)} 米（实际距离）；同一段实际距离换画到 A 图：${toFixed2(actualCmCm.value)} ÷ ${denA.value} = ${toFixed2(newCm.value)} 厘米`
    : `第 1 步：B 图 ${toFixed2(cm.value)} 厘米 × ${denB.value} = ${toFixed2(actualCmCm.value)} 厘米，÷ 100 = ${toFixed2(actualCmM.value)} 米——这就是两幅图共同表示的实际距离；第 2 步再点「揭示第 2 步」，看它画到 A 图上有多长`,
)
</script>

<template>
  <div class="ex-c6-wrap">
    <!-- 放大缩小后的面积倍数 -->
    <template v-if="kind === 'ex-c6-scale-area'">
      <div class="sa-stage">
        <span class="sa-badge">面积是原来的 {{ times }} 倍 · 缩小后是 1/{{ fracDen }}</span>

        <!-- 过程态：一级一级地放大，看边长 ×k 时面积格子变 k² 倍 -->
        <div class="sa-steps">
          <UButton size="sm" color="primary" :disabled="stepAtFull" @click="growOnce">再放大 1 倍</UButton>
          <UButton size="sm" variant="outline" color="neutral" :disabled="stepAtFirst" @click="backToFirst">
            回到 1×
          </UButton>
          <span class="sa-step-note">{{ stepNote }}</span>
        </div>

        <!-- 第一行：等腰直角三角形 + 放大图 + 面积对比 -->
        <svg class="sa-svg-tri" width="840" height="210" viewBox="0 0 840 210">
          <defs>
            <pattern id="ex-c6-grid-tri" :width="CELL" :height="CELL" patternUnits="userSpaceOnUse">
              <path class="sa-grid-line" :d="`M ${CELL} 0 L 0 0 L 0 ${CELL}`" />
            </pattern>
          </defs>
          <rect class="sa-grid" x="16" y="20" width="360" height="158" fill="url(#ex-c6-grid-tri)" />
          <path class="sa-tri-orig" :d="triOrigPath" />
          <path class="sa-tri-scaled" :class="{ 'is-origin-step': stepAtFirst }" :d="triScaledPath" />
          <path class="sa-tri-ghost" :d="triGhostPath" />
          <text class="sa-cap" :x="TRI_ORIG_X" :y="GROUND_Y + 22">原图（直角边 {{ toFixed2(a) }} 格）</text>
          <text class="sa-cap" :x="TRI_BIG_X" :y="GROUND_Y + 22">放大后（边长 ×{{ stepK }}，按 {{ stepK }}:1）</text>
          <text class="sa-arrow" x="150" :y="110">→</text>

          <text class="sa-bar-title" x="400" y="40">面积对比（1 格² = 6px）</text>
          <text class="sa-bar-lbl" x="400" y="72">原图 a²/2 = {{ toFixed2(triArea) }} 格²</text>
          <rect class="sa-bar-orig" x="400" y="78" :width="barOrig" height="16" rx="3" />
          <text class="sa-bar-lbl" x="400" y="124">现在（边长 ×{{ stepK }}）= {{ toFixed2(stepArea) }} 格²</text>
          <rect class="sa-bar-scaled" x="400" y="130" :width="stepBarScaled" height="16" rx="3" />
          <text class="sa-bar-note" x="400" y="178">面积倍数 = {{ stepK }} × {{ stepK }} = {{ stepTimes }}</text>
        </svg>

        <!-- 过程态阶梯：边长 1 倍 / 2 倍 / 3 倍 … 对应面积格子 1、4、9 … -->
        <svg class="sa-svg-step" width="840" height="140" viewBox="0 0 840 140">
          <text class="sa-step-title" x="30" y="16">一级一级看：边长 ×k，面积格子就是 k × k 倍</text>
          <line class="sa-step-axis" x1="24" :y1="STEP_BASE" x2="400" :y2="STEP_BASE" />
          <g v-for="col in stepCols" :key="col.k" class="sa-step-group">
            <rect
              class="sa-step-col"
              :class="{ 'is-current': col.current }"
              :x="col.x"
              :y="col.y"
              :width="col.w"
              :height="col.h"
              rx="3"
            />
            <text
              class="sa-step-lbl"
              :class="{ 'is-current': col.current }"
              :x="col.x + col.w / 2"
              :y="col.y - 6"
              text-anchor="middle"
            >{{ col.k }}² = {{ col.k * col.k }}</text>
            <text class="sa-step-lbl2" :x="col.x + col.w / 2" y="124" text-anchor="middle">边长 ×{{ col.k }}</text>
          </g>
          <text class="sa-step-now" x="470" y="46">原图面积 {{ toFixed2(triArea) }} 格²</text>
          <text class="sa-step-now" x="470" y="72">现在面积 {{ toFixed2(stepArea) }} 格²</text>
          <text class="sa-step-now primary" x="470" y="102">面积格子数 ×{{ stepTimes }}（边长 ×{{ stepK }}）</text>
        </svg>

        <!-- 第二行：直角梯形 + 缩小图 + 面积对比 -->
        <svg class="sa-svg-trap" width="840" height="210" viewBox="0 0 840 210">
          <defs>
            <pattern id="ex-c6-grid-trap" :width="CELL" :height="CELL" patternUnits="userSpaceOnUse">
              <path class="sa-grid-line" :d="`M ${CELL} 0 L 0 0 L 0 ${CELL}`" />
            </pattern>
          </defs>
          <rect class="sa-grid" x="16" y="20" width="360" height="158" fill="url(#ex-c6-grid-trap)" />
          <path class="sa-trap-orig" :d="trapOrigPath" />
          <path class="sa-trap-scaled" :d="trapScaledPath" />
          <text class="sa-cap" :x="TRAP_ORIG_X" :y="GROUND_Y + 22">
            原图（上底 {{ toFixed2(trapTop) }} / 下底 {{ toFixed2(trapBottom) }} / 高 {{ toFixed2(trapHeight) }}）
          </text>
          <text class="sa-cap" :x="TRAP_BIG_X" :y="GROUND_Y + 22">缩小后（按 1:{{ d }}）</text>
          <text class="sa-arrow" x="150" :y="110">→</text>

          <text class="sa-bar-title" x="400" y="40">面积对比（1 格² = 6px）</text>
          <text class="sa-bar-lbl" x="400" y="72">原图 = {{ toFixed2(trapArea) }} 格²</text>
          <rect class="sa-bar-orig" x="400" y="78" :width="barTrap" height="16" rx="3" />
          <text class="sa-bar-lbl" x="400" y="124">缩小后 = {{ toFixed2(trapScaled) }} 格²</text>
          <rect class="sa-bar-scaled" x="400" y="130" :width="barTrapScaled" height="16" rx="3" />
          <text class="sa-bar-note" x="400" y="178">缩小后是原来的 1/{{ d }}² = 1/{{ fracDen }}</text>
        </svg>

        <p class="sa-sum">
          等腰直角三角形：{{ toFixed2(a) }} × {{ toFixed2(a) }} ÷ 2 = {{ toFixed2(triArea) }} 格² → 放大后
          {{ toFixed2(a * n) }} × {{ toFixed2(a * n) }} ÷ 2 = {{ toFixed2(scaledArea) }} 格²，是原来的
          <b>{{ times }} 倍</b>；直角梯形 ({{ toFixed2(trapTop) }} + {{ toFixed2(trapBottom) }}) × {{ toFixed2(trapHeight) }} ÷ 2 =
          {{ toFixed2(trapArea) }} 格² → 缩小后 {{ toFixed2(trapScaled) }} 格²，是原来的 <b>1/{{ fracDen }}</b>
        </p>
      </div>
    </template>

    <!-- 两种比例尺的图纸对比 -->
    <template v-else-if="kind === 'ex-c6-two-maps'">
      <div class="tm-stage" :class="{ 'tm-step-one': !showStep2 }">
        <div class="tm-cards">
          <div class="tm-card tm-card-a">
            <span class="tm-card-title">图纸 A · 比例尺 1:{{ denA }}</span>
            <svg class="tm-ruler tm-ruler-a" width="180" height="40" viewBox="0 0 180 40">
              <line class="tm-ruler-line" x1="12" y1="22" x2="162" y2="22" />
              <line class="tm-ruler-tick" x1="12" y1="14" x2="12" y2="30" />
              <line class="tm-ruler-tick" x1="162" y1="14" x2="162" y2="30" />
              <circle class="tm-end-dot" cx="12" cy="22" r="3" />
              <circle class="tm-end-dot" cx="162" cy="22" r="3" />
              <text class="tm-ruler-lbl" x="87" y="12" text-anchor="middle">{{ toFixed2(cmA) }} 厘米</text>
            </svg>
            <span class="tm-card-actual">实际 {{ toFixed2(actualAM) }} 米</span>
          </div>
          <div class="tm-card tm-card-b">
            <span class="tm-card-title">图纸 B · 比例尺 1:{{ denB }}</span>
            <svg class="tm-ruler tm-ruler-b" width="180" height="40" viewBox="0 0 180 40">
              <line class="tm-ruler-line" x1="12" y1="22" x2="162" y2="22" />
              <line class="tm-ruler-tick" x1="12" y1="14" x2="12" y2="30" />
              <line class="tm-ruler-tick" x1="162" y1="14" x2="162" y2="30" />
              <circle class="tm-end-dot" cx="12" cy="22" r="3" />
              <circle class="tm-end-dot" cx="162" cy="22" r="3" />
              <text class="tm-ruler-lbl" x="87" y="12" text-anchor="middle">{{ toFixed2(cmA) }} 厘米</text>
            </svg>
            <span class="tm-card-actual">实际 {{ toFixed2(actualBM) }} 米</span>
          </div>
        </div>

        <!-- 同一段实际距离：两张图上画的长度不同，代表的实际长度相同 -->
        <svg class="tm-compare" width="470" height="140" viewBox="0 0 470 140">
          <line class="tm-actual-line" x1="40" y1="70" x2="430" y2="70" />
          <text class="tm-actual-lbl" x="235" y="62" text-anchor="middle">同一段实际距离 = {{ toFixed2(actualCmM) }} 米</text>
          <text class="tm-actual-lbl2" x="235" y="86" text-anchor="middle">◀ 实际距离相同 ▶</text>
          <line class="tm-lead" x1="40" y1="34" x2="40" y2="106" />

          <g v-if="showStep2" class="tm-a-seg">
            <line class="tm-seg-a-cmp" x1="40" y1="34" :x2="40 + segAPx" y2="34" />
            <circle class="tm-end-dot" :cx="40 + segAPx" cy="34" r="3" />
            <text class="tm-seg-lbl" x="52" y="22">A 图画 {{ toFixed2(newCm) }} 厘米</text>
          </g>
          <text v-else class="tm-seg-hint" x="52" y="22">A 图先空着：把这段实际距离记住，下一步再换算</text>

          <line class="tm-seg-b-cmp" x1="40" y1="106" :x2="40 + segBPx" y2="106" />
          <circle class="tm-end-dot" :cx="40 + segBPx" cy="106" r="3" />
          <text class="tm-seg-lbl" x="52" y="126">B 图画 {{ toFixed2(cm) }} 厘米</text>
        </svg>

        <div class="tm-flow">
          <span class="tm-flow-chip">B 图 {{ toFixed2(cm) }} 厘米</span>
          <b class="tm-flow-op">× {{ denB }}</b>
          <span class="tm-flow-chip">{{ toFixed2(actualCmCm) }} 厘米</span>
          <b class="tm-flow-op">÷ 100</b>
          <span class="tm-flow-chip">{{ toFixed2(actualCmM) }} 米</span>
          <template v-if="showStep2">
            <b class="tm-flow-op">÷ {{ denA }}</b>
            <span class="tm-flow-chip primary">A 图 {{ toFixed2(newCm) }} 厘米</span>
          </template>
        </div>

        <!-- 过程态：先把 B 图换成实际距离，再揭示换画到 A 图 -->
        <div class="tm-steps">
          <UButton size="sm" color="primary" :disabled="!showStep2" @click="onlyStep1">先只看第 1 步</UButton>
          <UButton size="sm" variant="outline" color="neutral" :disabled="showStep2" @click="showBothSteps">
            揭示第 2 步
          </UButton>
          <span class="tm-step-note">{{ tmStepNote }}</span>
        </div>
      </div>

      <p class="tm-sum">
        A 图：{{ toFixed2(cmA) }} × {{ denA }} = {{ toFixed2(actualACm) }} 厘米 = <b>{{ toFixed2(actualAM) }} 米</b>；B 图：{{ toFixed2(cmA) }} ×
        {{ denB }} = {{ toFixed2(actualBCm) }} 厘米 = <b>{{ toFixed2(actualBM) }} 米</b><template v-if="showStep2"
          >；改画到 A 图：{{ toFixed2(cm) }} × {{ denB }} ÷ {{ denA }} = <b>{{ toFixed2(newCm) }} 厘米</b></template
        >
      </p>
    </template>
  </div>
</template>

<style scoped>
.ex-c6-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 320px;
}

.sa-stage,
.tm-stage {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  width: 100%;
}
.sa-badge {
  align-self: flex-start;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
  padding: 0.2rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 800;
}
.sa-svg-tri,
.sa-svg-trap,
.sa-svg-step,
.tm-compare,
.tm-ruler {
  max-width: 100%;
  height: auto;
}

/* ---------- 过程态：一级一级放大 ---------- */
.sa-steps,
.tm-steps {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}
.sa-step-note,
.tm-step-note {
  font-size: 0.76rem;
  color: var(--ui-text-muted);
  max-width: 30rem;
  font-family: ui-monospace, monospace;
}
.sa-step-title {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-toned);
}
.sa-step-axis {
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.sa-step-col {
  fill: color-mix(in srgb, var(--ui-primary) 22%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
  transition: height 0.25s, y 0.25s;
}
.sa-step-col.is-current {
  fill: var(--ui-primary);
}
.sa-step-lbl {
  font-size: 11px;
  font-weight: 700;
  fill: var(--ui-text-muted);
}
.sa-step-lbl.is-current {
  fill: #b45309;
  font-weight: 800;
}
.sa-step-lbl2 {
  font-size: 10px;
  fill: var(--ui-text-muted);
}
.sa-step-now {
  font-size: 11px;
  fill: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.sa-step-now.primary {
  font-weight: 800;
  fill: var(--ui-primary);
}

/* ---------- 方格纸与图形 ---------- */
.sa-grid {
  stroke: var(--ui-border-accented);
  stroke-width: 0.5;
}
.sa-grid-line {
  fill: none;
  stroke: var(--ui-border-accented);
  stroke-width: 0.6;
}
.sa-tri-orig,
.sa-trap-orig {
  fill: color-mix(in srgb, var(--ui-primary) 25%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.sa-tri-scaled,
.sa-trap-scaled {
  fill: color-mix(in srgb, var(--ui-primary) 50%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.sa-tri-ghost {
  fill: none;
  stroke: #b45309;
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}
.sa-cap {
  font-size: 10px;
  fill: var(--ui-text-muted);
}
.sa-arrow {
  font-size: 20px;
  font-weight: 800;
  fill: var(--ui-primary);
}

/* ---------- 面积对比条 ---------- */
.sa-bar-title {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-toned);
}
.sa-bar-lbl {
  font-size: 10px;
  fill: var(--ui-text-muted);
}
.sa-bar-note {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-primary);
}
.sa-bar-orig {
  fill: color-mix(in srgb, var(--ui-primary) 25%, white);
  transition: width 0.25s;
}
.sa-bar-scaled {
  fill: var(--ui-primary);
  transition: width 0.25s;
}

/* ---------- 图纸卡片 ---------- */
.tm-cards {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.tm-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.8rem;
}
.tm-card-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.tm-card-actual {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-primary);
}
.tm-ruler-line {
  stroke: var(--ui-primary);
  stroke-width: 3;
}
.tm-ruler-tick {
  stroke: var(--ui-text-toned);
  stroke-width: 1.5;
}
.tm-ruler-lbl,
.tm-seg-lbl {
  font-size: 10px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.tm-seg-hint {
  font-size: 10px;
  font-weight: 700;
  fill: #b45309;
  font-style: italic;
}
.tm-end-dot {
  fill: #b45309;
}

/* ---------- 同一段实际距离 ---------- */
.tm-actual-line {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}
.tm-actual-lbl {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-toned);
}
.tm-actual-lbl2 {
  font-size: 10px;
  font-weight: 700;
  fill: #b45309;
}
.tm-seg-a-cmp,
.tm-seg-b-cmp {
  stroke: var(--ui-primary);
  stroke-width: 4;
}
.tm-lead {
  stroke: var(--ui-border-accented);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

/* ---------- 改画流程条 ---------- */
.tm-flow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
}
.tm-flow-chip {
  color: var(--ui-text-toned);
  font-weight: 700;
}
.tm-flow-chip.primary {
  color: var(--ui-primary);
}
.tm-flow-op {
  color: var(--ui-primary);
}

.sa-sum,
.tm-sum {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.sa-sum b,
.tm-sum b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
</style>
