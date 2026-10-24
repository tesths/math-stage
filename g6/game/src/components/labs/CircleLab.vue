<script setup lang="ts">
/**
 * 圆 Lab：认识圆 / 扇形 / 圆的周长 / 圆的面积 / 环形面积 / 组合图形
 *
 * 三处关键改进（对齐 Mathigon 的「一个滑块控制离散化程度」与课本的「滚圆/等分剪拼」）：
 * - 圆的面积：等分份数 4→64 逐个重画，上下一一交错拼成图形，实时显示
 *   长 = n·sin(π/n)·r（n 越大越接近 πr）、宽 = r，把「极限」摆到学生眼前。
 * - 圆的周长：圆沿直线真正滚动一周（摆线轨迹），前进距离恰好等于周长，图上 C÷d = π。
 * - 环形面积：内外圆共用同一比例尺，环宽与外圆面积占比都与真实值一致。
 */
import { computed, ref } from 'vue'
import { animate } from 'animejs'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { fixedN, gcd, roundTo, toFixed2 } from '@/lib/engine/math'
import { approxLengthInR, cycloidPath, rollDistance, rollPoint, sectorPath, wedgeLayout } from '@/lib/labs/circle'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const PI = 3.14

/* ---------- 认识圆 ---------- */
const cr = computed(() => Math.round(props.values.r ?? 4))
/**
 * 比例尺（px/厘米）：上限 16，r=8 时收窄到 12.5 → crPx=100，
 * 圆纵向 [120−100, 120+100] = [20, 220] 完整落在 240 高的视口里，
 * 竖直半径线的箭头也不会被裁掉。
 */
const crK = computed(() => Math.min(16, 100 / Math.max(1, cr.value)))
const crPx = computed(() => cr.value * crK.value)
const cd = computed(() => cr.value * 2)
const CX = 170
const CY = 120
/** 三条半径（含竖直向上的一条）与它们到圆周的端点 */
const radiusDirs = [-90, 30, 210]
const radiusEnds = computed(() =>
  radiusDirs.map((deg) => {
    const rad = (deg * Math.PI) / 180
    return { x: CX + crPx.value * Math.cos(rad), y: CY + crPx.value * Math.sin(rad) }
  }),
)
/** 两条过圆心的虚线直径（对称轴）——圆有无数条对称轴 */
/** 20°/160°（浅斜）避开图内「半径 r / r / 直径 d / 圆心 O」四处标注，又明显不等于水平直径 */
const axisDirs = [20, 160]
const axisEnds = computed(() =>
  axisDirs.map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      x1: CX - crPx.value * Math.cos(rad),
      y1: CY - crPx.value * Math.sin(rad),
      x2: CX + crPx.value * Math.cos(rad),
      y2: CY + crPx.value * Math.sin(rad),
    }
  }),
)
/**
 * 「多画几条半径」：按一次多画一条半径并标注长度，画够 RADIUS_TARGET 条给出完成态
 * （同一个圆里半径有无数条、都相等 + d = 2r）。
 * 新增的半径用独立 class `.line-radius-extra`：既有的 3 条 `.line-radius` 语义不变
 * （审计用例 C1-1 锁定了「三条半径」）。
 */
const EXTRA_DIRS = [90, 150, 270, 330, -30, -150]
const RADIUS_TARGET = 6
const extraCount = ref(0)
const extraRadii = computed(() =>
  EXTRA_DIRS.slice(0, extraCount.value).map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      deg,
      x: CX + crPx.value * Math.cos(rad),
      y: CY + crPx.value * Math.sin(rad),
      /** 每条半径的长度（厘米）——同一个圆里都相等 */
      len: cr.value,
      /** 长度标注放在半径中点偏外一点，避开圆心与圆周标注 */
      lx: CX + crPx.value * 0.62 * Math.cos(rad),
      ly: CY + crPx.value * 0.62 * Math.sin(rad),
    }
  }),
)
const radiusCount = computed(() => radiusDirs.length + extraCount.value)
const radiusAllDrawn = computed(() => extraCount.value >= RADIUS_TARGET)
function drawRadius() {
  playClick()
  extraCount.value = radiusAllDrawn.value ? 0 : extraCount.value + 1
}

/* ---------- 扇形 ---------- */
const angleParam = computed(() => Math.max(0, Math.round(props.values.angle ?? 90)))
/**
 * 「对折成四分之一」：本地把圆心角锁到 90°（对折两次把圆平均分成 4 份），
 * 再点一次恢复滑块角度。滑块照旧生效，不受覆盖影响。
 */
const quarterOverride = ref(false)
const angle = computed(() => (quarterOverride.value ? 90 : angleParam.value))
function foldQuarter() {
  playClick()
  quarterOverride.value = !quarterOverride.value
}
/** 对折线：竖直与水平两条直径，把圆分成 4 个相等的扇形（每份圆心角 90°） */
const foldLines = computed(() =>
  [90, 0].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      x1: CX - sr * Math.cos(rad),
      y1: CY - sr * Math.sin(rad),
      x2: CX + sr * Math.cos(rad),
      y2: CY + sr * Math.sin(rad),
    }
  }),
)
const sectorR = computed(() => Math.max(1, Math.round(props.values.r ?? 6)))
/** 占比的最简分数：30° → 1/12，45° → 1/8，90° → 1/4 */
const angleFrac = computed(() => {
  const g = gcd(Math.round(angle.value), 360) || 1
  return `${Math.round(angle.value) / g}/${360 / g}`
})
const sr = 96
/** 圆心角 360° 时整圆都是扇形，用圆代替扇形路径（SVG 弧在 360° 会退化） */
const isFullCircle = computed(() => angle.value >= 360)
const arc = computed(() => {
  if (isFullCircle.value) return ''
  const start = -90
  const end = start + angle.value
  const sRad = (start * Math.PI) / 180
  const eRad = (end * Math.PI) / 180
  const x1 = CX + sr * Math.cos(sRad)
  const y1 = CY + sr * Math.sin(sRad)
  const x2 = CX + sr * Math.cos(eRad)
  const y2 = CY + sr * Math.sin(eRad)
  const large = angle.value > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${sr} ${sr} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
})
const sectorArea = computed(() => roundTo(PI * sectorR.value * sectorR.value * (angle.value / 360), 2))
const sectorArcLen = computed(() => roundTo(2 * PI * sectorR.value * (angle.value / 360), 2))
const angleArc = computed(() => {
  const end = -90 + angle.value
  const eRad = (end * Math.PI) / 180
  const e1x = CX + 46 * Math.cos(((-90) * Math.PI) / 180)
  const e1y = CY + 46 * Math.sin(((-90) * Math.PI) / 180)
  const e2x = CX + 46 * Math.cos(eRad)
  const e2y = CY + 46 * Math.sin(eRad)
  const large = angle.value > 180 ? 1 : 0
  return `M ${e1x.toFixed(2)} ${e1y.toFixed(2)} A 46 46 0 ${large} 1 ${e2x.toFixed(2)} ${e2y.toFixed(2)}`
})
const angleMid = computed(() => {
  const mid = ((-90 + angle.value / 2) * Math.PI) / 180
  return { x: CX + 62 * Math.cos(mid), y: CY + 62 * Math.sin(mid) }
})
const sectorArcLabel = computed(() => {
  const mid = ((-90 + angle.value / 2) * Math.PI) / 180
  return { x: CX + (sr + 16) * Math.cos(mid), y: CY + (sr + 16) * Math.sin(mid) }
})
const arcEnd = computed(() => {
  const end = -90 + angle.value
  const rad = (end * Math.PI) / 180
  return { x: CX + sr * Math.cos(rad), y: CY + sr * Math.sin(rad) }
})

/* ---------- 圆的周长：滚圆一周 ---------- */
const cir = computed(() => Math.max(1, Math.round(props.values.r ?? 14)))
/** 图上半径（px）：随 r 略增大，但保证滚动一周的长度能画进画布 */
const rollR = computed(() => Math.min(46, Math.max(22, cir.value * 2.2)))
const rollBaseY = 176
const rollX0 = 26
const C = computed(() => roundTo(2 * PI * cir.value, 2))
const cdValue = computed(() => cir.value * 2)
const rollTheta = ref(0)
const rolling = ref(false)
const rollX = computed(() => rollX0 + rollDistance(rollR.value, rollTheta.value))
const markPoint = computed(() => rollPoint(rollX0, rollBaseY, rollR.value, rollTheta.value))
const cycloid = computed(() => cycloidPath(rollX0, rollBaseY, rollR.value))
const rolledFull = computed(() => rollTheta.value >= 2 * Math.PI - 1e-6)
const rollTurns = computed(() => rollTheta.value / (2 * Math.PI))
/** 图上比例尺（px/米）：圆、直径线、滚动距离都按它绘制，因此图上 C ÷ d 恒为 π */
const rollScale = computed(() => rollR.value / cir.value)
/**
 * 绕绳 / 滚圆测量表：三个大小不同的圆（半径 r、2r、3r），
 * C ÷ d 都是 3.14——把「π 是定值」的发现过程摆出来。
 */
const measureRows = computed(() =>
  [1, 2, 3].map((m) => {
    const rr = cir.value * m
    const d = 2 * rr
    const c = roundTo(2 * PI * rr, 2)
    return { r: rr, d, c, ratio: fixedN(c / d, 2) }
  }),
)
/**
 * 「不同直径对照表」：换几个固定的直径量一量（1 / 2 / 4 / 8 米）。
 * 直径每变一次周长就跟着变，但 C ÷ d 恒为 3.14——「都是 3 倍多一些」。
 * 与上面随滑块变化的绕绳测量表互为印证（那一张锁定了课本半径序列）。
 */
const DIAMETERS = [1, 2, 4, 8]
const diameterRows = computed(() =>
  DIAMETERS.map((d) => {
    const c = roundTo(PI * d, 2)
    const ratio = roundTo(c / d, 4)
    return { d, c, ratio: fixedN(ratio, 2), over: fixedN(ratio - 3, 2) }
  }),
)
function runRoll() {
  if (rolling.value) return
  playClick()
  rolling.value = true
  const state = { t: rollTheta.value }
  animate(state, {
    t: 2 * Math.PI,
    duration: 1800,
    easing: 'linear',
    update: () => {
      rollTheta.value = state.t
    },
    complete: () => {
      rollTheta.value = 2 * Math.PI
      rolling.value = false
    },
  })
}
function resetRoll() {
  rollTheta.value = 0
  rolling.value = false
  playClick()
}

/* ---------- 圆的面积：等分 + 交错剪拼 ---------- */
const ar = computed(() => Math.max(1, Math.round(props.values.r ?? 5)))
/** 滑块给出的份数（取偶） */
const slicesParam = computed(() => Math.max(4, Math.round((props.values.slices ?? 8) / 2) * 2))
/**
 * 「逐级翻倍」：课本序列 8 → 16 → 32 → 64。
 * 按钮写的是本地覆盖值，滑块照旧生效；拖动滑块后可点「取消翻倍」回到滑块读数。
 */
const sliceOverride = ref<number | null>(null)
const slices = computed(() => sliceOverride.value ?? slicesParam.value)
const DOUBLE_STEPS = [8, 16, 32, 64]
/** 点一次「逐级翻倍」后的份数：落在课本序列上就往后走一档，64 之后回到 8 */
const nextSlices = computed(() => {
  const i = DOUBLE_STEPS.indexOf(slices.value)
  if (i < 0) return DOUBLE_STEPS[0]!
  return DOUBLE_STEPS[(i + 1) % DOUBLE_STEPS.length]!
})
function doubleSlices() {
  playClick()
  sliceOverride.value = nextSlices.value
}
function resetSlices() {
  playClick()
  sliceOverride.value = null
}
const A = computed(() => roundTo(PI * ar.value * ar.value, 2))
const pieR = 60
const pieCX = 74
const pieCY = 84
const piePaths = computed(() => {
  const n = slices.value
  return Array.from({ length: n }, (_, i) => ({
    d: sectorPath(pieCX, pieCY, pieR, -90 + (360 / n) * i, -90 + (360 / n) * (i + 1)),
    alt: i % 2 === 0,
  }))
})
const wedgeR = 60
const layout = computed(() => wedgeLayout(slices.value, wedgeR, 166, 172))
/** 拼成图形的长，以半径 r 为单位：n·sin(π/n) → π */
const approxLenR = computed(() => approxLengthInR(slices.value))
const approxLenReal = computed(() => roundTo(approxLenR.value * ar.value, 3))
/** πr 的真值：差用真 π 复算，才是「份数越多差越小」，不会在 64 份时冒出负数 */
const piRReal = computed(() => roundTo(Math.PI * ar.value, 4))
const lenGap = computed(() => roundTo(piRReal.value - approxLenReal.value, 4))

/* ---------- 环形面积 ---------- */
const R = computed(() => Math.round(props.values.R ?? 10))
const r = computed(() => Math.round(props.values.r ?? 6))
const invalidRing = computed(() => r.value >= R.value)
/** 内外圆共用同一比例尺：外圆固定 60px，内圆按 r/R 缩放，比例才与真实一致 */
const OUTER_PX = 60
const innerPx = computed(() => (r.value / Math.max(1, R.value)) * OUTER_PX)
const aOuter = computed(() => roundTo(PI * R.value * R.value, 2))
const aInner = computed(() => roundTo(PI * r.value * r.value, 2))
const annulus = computed(() => roundTo(PI * (R.value * R.value - r.value * r.value), 2))
const ringShare = computed(() => (invalidRing.value ? 0 : (R.value * R.value - r.value * r.value) / (R.value * R.value)))
const ringPath = computed(
  () =>
    `M 65 ${65 - OUTER_PX} A ${OUTER_PX} ${OUTER_PX} 0 1 1 ${65 - OUTER_PX + 0.01} ${65 - OUTER_PX} Z ` +
    `M 65 ${65 - innerPx.value} A ${innerPx.value} ${innerPx.value} 0 1 0 ${65 - innerPx.value + 0.01} ${65 - innerPx.value} Z`,
)
/**
 * 「外圆减内圆」图形化扣减步进：0 未开始 → 1 画外圆 → 2 挖掉内圆 → 3 剩下环。
 * 三步都给出面积，最后一步并排给出 π(R² − r²) 的写法，与 πR² − πr² 结果一致。
 */
const ringStep = ref(0)
const ringSteps = computed(() => [
  { label: '① 画外圆', expr: `S大 = πR² = 3.14 × ${R.value}²`, value: fixedN(aOuter.value, 2) },
  { label: '② 挖掉内圆', expr: `S小 = πr² = 3.14 × ${r.value}²`, value: fixedN(aInner.value, 2) },
  { label: '③ 剩下环', expr: 'S环 = S大 − S小 = π(R² − r²)', value: fixedN(annulus.value, 2) },
])
const shownRingSteps = computed(() => ringSteps.value.slice(0, ringStep.value))
const ringDone = computed(() => ringStep.value >= 3)
function stepRing() {
  playClick()
  ringStep.value = ringDone.value ? 0 : ringStep.value + 1
}

/* ---------- 组合图形 · 窗户 ---------- */
const side = computed(() => props.values.side ?? 1.8)
/**
 * 比例尺（px/米）：上限 46；side 较大时收窄到 120/side，
 * 保证「正方形 + 半圆 + 上下标注」总高（1.5·sqPx + 标注）不超过 200，
 * 正方形顶部与半圆顶都不会被 240 高的视口裁掉。
 */
const sqK = computed(() => Math.min(46, 120 / Math.max(1, side.value)))
const sqPx = computed(() => side.value * sqK.value)
const smRadius = computed(() => sqPx.value / 2)
const windowSq = computed(() => roundTo(side.value * side.value, 4))
const windowSemi = computed(() => roundTo((PI * (side.value / 2) ** 2) / 2, 4))
const windowTotal = computed(() => roundTo(windowSq.value + windowSemi.value, 2))
/** 窗户周长 = 3 条正方形边 + 半圆弧 = 边长 ×(3 + π/2) */
const windowPerim = computed(() => roundTo(side.value * (3 + PI / 2), 3))
/**
 * 分块高亮 + 面积累加：0 未开始 → 1 正方形 → 2 半圆 → 3 相加。
 * 先分别算再相加，最后一行与 computeLab 的总面积完全一致。
 */
const compStep = ref(0)
const compSquare = computed(() => roundTo(windowSq.value, 2))
const compSemi = computed(() => roundTo(windowSemi.value, 2))
const compSum = computed(() => roundTo(compSquare.value + compSemi.value, 2))
const compParts = computed(() => [
  { key: 'square', label: '正方形', expr: `${toFixed2(side.value)} × ${toFixed2(side.value)}`, value: compSquare.value },
  { key: 'semi', label: '半圆', expr: `π × ${toFixed2(side.value / 2)}² ÷ 2`, value: compSemi.value },
])
const compDone = computed(() => compStep.value >= 3)
function stepComposite() {
  playClick()
  compStep.value = compDone.value ? 0 : compStep.value + 1
}
</script>

<template>
  <div class="circle-wrap">
    <!-- 认识圆 -->
    <template v-if="kind === 'circle-feature'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <defs>
            <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 8 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>
          <circle :cx="CX" :cy="CY" :r="crPx" class="circle-outline" />
          <!-- 过圆心的虚线直径：每一条都是圆的对称轴（有无数条） -->
          <line
            v-for="(a, i) in axisEnds"
            :key="'ax' + i"
            :x1="a.x1"
            :y1="a.y1"
            :x2="a.x2"
            :y2="a.y2"
            class="line-axis"
            stroke-dasharray="6 4"
          />
          <line :x1="CX - crPx" :y1="CY" :x2="CX + crPx" :y2="CY" class="line-diameter" />
          <g v-for="(p, i) in radiusEnds" :key="'r' + i">
            <line :x1="CX" :y1="CY" :x2="p.x" :y2="p.y" class="line-radius" :marker-end="i === 0 ? 'url(#arr)' : undefined" />
            <circle :cx="p.x" :cy="p.y" r="3" class="dot amber" />
          </g>
          <!-- 多画出来的半径：每条都标注长度，长度都相等 -->
          <g v-for="(p, i) in extraRadii" :key="'xr' + i">
            <line :x1="CX" :y1="CY" :x2="p.x" :y2="p.y" class="line-radius-extra" />
            <circle :cx="p.x" :cy="p.y" r="2.5" class="dot amber" />
            <text :x="p.lx" :y="p.ly" text-anchor="middle" class="t-lbl2 radius-len">{{ p.len }} 厘米</text>
          </g>
          <circle :cx="CX" :cy="CY" r="4" class="dot-center" />
          <text :x="CX" :y="CY + 22" text-anchor="middle" class="t-lbl">圆心 O</text>
          <text :x="CX + 8" :y="CY - crPx / 2 - 6" class="t-lbl amber">半径 r = {{ cr }} 厘米</text>
          <text :x="CX + Math.max(crPx / 2 + 6, 50)" :y="CY + 16" class="t-lbl sky">直径 d = {{ cd }} 厘米</text>
          <text :x="CX + 14" :y="CY - 10" class="t-lbl amber">r</text>
          <text x="8" y="232" class="t-lbl2">虚线是过圆心的直线——圆有无数条对称轴</text>
        </svg>
      </div>
      <div class="controls" aria-label="画半径操作">
        <UButton size="sm" color="primary" variant="soft" data-test="draw-radius" @click="drawRadius" data-act>
          {{ radiusAllDrawn ? '再画一遍（重置）' : '再画一条半径' }} · 已画 {{ radiusCount }} 条
        </UButton>
      </div>
      <p v-if="radiusAllDrawn" class="done-line" data-test="radius-done">
        ✓ 已画出 {{ radiusCount }} 条半径，每条都是 <b>{{ cr }}</b> 厘米——同一个圆里的半径有无数条，全部相等；直径 d = 2r = 2 ×
        {{ cr }} = <b>{{ cd }}</b> 厘米
      </p>
      <p class="res-line">同一个圆里所有半径都相等（OA = OB = OC = {{ cr }} 厘米）：d = 2r = 2 × {{ cr }} = <b>{{ cd }}</b> 厘米</p>
    </template>

    <!-- 扇形 -->
    <template v-else-if="kind === 'sector'">
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <defs>
            <marker id="arr2" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
              <polygon points="0 0, 8 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>
          <circle :cx="CX" :cy="CY" :r="sr" class="circle-outline-muted" />
          <!-- 对折线：竖直 + 水平两条直径，把圆平均分成 4 份 -->
          <g v-if="quarterOverride">
            <line
              v-for="(f, i) in foldLines"
              :key="'fold' + i"
              :x1="f.x1"
              :y1="f.y1"
              :x2="f.x2"
              :y2="f.y2"
              class="fold-line"
              stroke-dasharray="5 4"
            />
          </g>
          <circle v-if="isFullCircle" :cx="CX" :cy="CY" :r="sr" class="sector-fill" />
          <path v-else :d="arc" class="sector-fill-stroke" />
          <line :x1="CX" :y1="CY" :x2="CX" :y2="CY - sr" class="line-radius" />
          <line :x1="CX" :y1="CY" :x2="arcEnd.x" :y2="arcEnd.y" class="line-radius" />
          <path v-if="angle < 360" :d="angleArc" fill="none" class="line-angle" marker-end="url(#arr2)" />
          <circle v-else :cx="CX" :cy="CY" :r="46" fill="none" class="line-angle" />
          <text :x="CX" :y="CY - sr - 8" text-anchor="middle" class="t-lbl sky">A</text>
          <text :x="arcEnd.x + 12" :y="arcEnd.y + 4" class="t-lbl sky">B</text>
          <text :x="angleMid.x" :y="angleMid.y + 4" text-anchor="middle" class="t-lbl amber">{{ angle }}°</text>
          <text :x="sectorArcLabel.x" :y="sectorArcLabel.y" text-anchor="middle" class="t-lbl sky">弧 AB</text>
          <text :x="CX" :y="CY + 22" text-anchor="middle" class="t-lbl">圆心 O</text>
          <text :x="CX + 14" :y="CY - 8" class="t-lbl amber">r = {{ sectorR }} 厘米</text>
        </svg>
      </div>
      <div class="sector-parts" aria-label="扇形组成部分">
        <span class="part-chip">半径 OA</span>
        <span class="part-chip">半径 OB</span>
        <span class="part-chip">弧 AB</span>
        <span class="part-chip primary">圆心角 ∠AOB = {{ angle }}°</span>
      </div>
      <p class="res-line">
        扇形占全圆的 {{ angle }} ÷ 360 = <b>{{ angleFrac }}</b> ≈ {{ fixedN(angle / 360, 3) }}；弧长 = 2πr × {{ angle }}/360 ≈
        <b>{{ fixedN(sectorArcLen, 2) }}</b> 厘米，面积 = πr² × {{ angle }}/360 ≈ <b>{{ fixedN(sectorArea, 2) }}</b> 平方厘米
      </p>
      <div class="controls" aria-label="对折操作">
        <UButton size="sm" color="primary" variant="soft" data-test="fold-quarter" @click="foldQuarter">
          {{ quarterOverride ? '取消对折，跟随滑块' : '对折成四分之一（90°）' }}
        </UButton>
      </div>
      <p v-if="quarterOverride" class="done-line quarter-line" data-test="quarter-line">
        ✓ 对折两次把圆平均分成 4 份：每份的圆心角 = 360° ÷ 4 = <b>90°</b>，占全圆的
        <b>1/4</b>（90 ÷ 360 = 1/4）；阴影就是这 1/4 个圆
      </p>
    </template>

    <!-- 圆的周长：滚圆一周 -->
    <template v-else-if="kind === 'circumference'">
      <div class="svg-box">
        <svg :width="360" :height="220" viewBox="0 0 360 220">
          <line :x1="rollX0 - 14" :y1="rollBaseY" :x2="352" :y2="rollBaseY" class="baseline" />
          <!-- 一周的滚动轨迹（摆线） -->
          <path v-if="rollTheta > 0" :d="cycloid" class="cycloid" />
          <!-- 圆 -->
          <circle :cx="rollX" :cy="rollBaseY - rollR" :r="rollR" class="circle-roll" />
          <line :x1="rollX - rollR" :y1="rollBaseY - rollR" :x2="rollX + rollR" :y2="rollBaseY - rollR" class="line-diameter-roll" />
          <line :x1="rollX" :y1="rollBaseY - rollR" :x2="markPoint[0]" :y2="markPoint[1]" class="line-radius" />
          <circle :cx="markPoint[0]" :cy="markPoint[1]" r="4" class="dot amber" />
          <circle :cx="rollX" :cy="rollBaseY - rollR" r="3" class="dot-center" />
          <text :x="Math.max(70, rollX)" :y="rollBaseY - rollR * 2 - 8" text-anchor="middle" class="t-lbl">直径 d = {{ cdValue }} 米</text>
          <!-- 走过的距离 = 周长 -->
          <g v-if="rollTheta > 0">
            <line :x1="rollX0" :y1="rollBaseY + 20" :x2="rollX" :y2="rollBaseY + 20" class="line-diameter" />
            <line :x1="rollX0" :y1="rollBaseY + 15" :x2="rollX0" :y2="rollBaseY + 25" class="line-diameter" />
            <line :x1="rollX" :y1="rollBaseY + 15" :x2="rollX" :y2="rollBaseY + 25" class="line-diameter" />
            <text :x="(rollX0 + rollX) / 2" :y="rollBaseY + 38" text-anchor="middle" class="t-lbl amber">
              已滚 {{ fixedN(rollTurns, 2) }} 周，前进 {{ fixedN(rollTurns * C, 2) }} 米
            </text>
          </g>
          <text :x="352" :y="rollBaseY - 6" text-anchor="end" class="t-lbl2">滚圆一周，前进的距离就是周长</text>
        </svg>
      </div>
      <p class="scale-line">
        比例尺：图上 1 米 ≈ {{ toFixed2(rollScale) }} px（圆、直径线、滚动距离都按同一比例尺绘制，长度单位统一用米）
      </p>
      <div class="controls">
        <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-arrow-path" :disabled="rolling" @click="runRoll">
          滚一周 · 看前进多少米
        </UButton>
        <UButton v-if="rollTheta > 0" size="sm" variant="outline" color="neutral" @click="resetRoll">复位</UButton>
        <span class="verify-line">
          <template v-if="rolledFull">
            ✓ 滚动一周前进的距离 = 周长 C = 2πr = 2 × 3.14 × {{ cir }} = <b>{{ C }}</b> 米；C ÷ d = {{ C }} ÷ {{ cdValue }} = {{ fixedN(C / cdValue, 2) }} ≈ π
          </template>
          <template v-else-if="rollTheta > 0">滚动中：转过 {{ fixedN((rollTheta / (2 * Math.PI)) * 360, 0) }}°</template>
          <template v-else>半径 r = {{ cir }} 米，直径 d = {{ cdValue }} 米，周长 C = 2πr = {{ C }} 米</template>
        </span>
      </div>
      <!-- 绕绳 / 滚圆量一量：三个大小不同的圆，比值都相同 -->
      <table class="measure-table" aria-label="绕绳滚圆测量表">
        <caption>绕绳、滚圆量一量：圆的半径越大，直径和周长都变大，但 C ÷ d 始终是 3.14</caption>
        <thead>
          <tr><th>半径 r / 米</th><th>直径 d / 米</th><th>周长 C / 米</th><th>C ÷ d</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in measureRows" :key="'m' + i">
            <td>{{ row.r }}</td>
            <td>{{ row.d }}</td>
            <td>{{ fixedN(row.c, 2) }}</td>
            <td>{{ row.ratio }}</td>
          </tr>
        </tbody>
      </table>
      <!-- 不同直径对照表：直径换几个，C ÷ d 恒为 π（都是 3 倍多一些） -->
      <table class="measure-table diameter-table" data-test="diameter-table" aria-label="不同直径对照表">
        <caption>换几个直径量一量：直径变大周长跟着变大，但 C ÷ d 始终是 3 倍多一些</caption>
        <thead>
          <tr><th>直径 d / 米</th><th>周长 C / 米</th><th>C ÷ d</th><th>比 3 多</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in diameterRows" :key="'dd' + row.d">
            <td>{{ row.d }}</td>
            <td>{{ fixedN(row.c, 2) }}</td>
            <td class="ratio-cell">{{ row.ratio }}</td>
            <td>{{ row.over }}</td>
          </tr>
        </tbody>
      </table>
      <p class="diameter-note" data-test="diameter-note">
        无论直径是 1 米还是 8 米，C ÷ d 都是 <b>3 倍多一些</b>（3.14）——这个固定不变的倍数就是圆周率 <b>π</b>
      </p>
      <p class="res-line">C = πd = 2πr = 2 × 3.14 × {{ cir }} = <b>{{ C }}</b> 米，且 C ÷ d ≈ <b>π = 3.14</b></p>
    </template>

    <!-- 圆的面积 · 等分剪拼 -->
    <template v-else-if="kind === 'circle-area'">
      <div class="svg-box">
        <svg :width="360" :height="196" viewBox="0 0 360 196">
          <!-- 左：等分圆 -->
          <g>
            <path
              v-for="(p, i) in piePaths"
              :key="'pie' + i"
              :d="p.d"
              :class="p.alt ? 'slice-a' : 'slice-b'"
            />
            <circle :cx="pieCX" :cy="pieCY" :r="pieR" class="circle-outline-muted" />
            <text :x="pieCX" :y="166" text-anchor="middle" class="t-lbl">把圆平均分成 {{ slices }} 份</text>
            <text :x="pieCX" :y="184" text-anchor="middle" class="t-lbl2">r = {{ ar }} 米</text>
          </g>
          <!-- 右：上下一一交错拼成近似长方形 -->
          <g>
            <path v-for="(w, i) in layout.wedges" :key="'w' + i" :d="w.d" :class="w.up ? 'slice-a' : 'slice-b'" />
            <rect :x="layout.x0" :y="layout.baseY - layout.height" :width="layout.width" :height="layout.height" class="rect-ghost" />
            <text :x="layout.x0 + layout.width / 2" :y="layout.baseY - layout.height - 10" text-anchor="middle" class="t-lbl amber">
              长 ≈ {{ fixedN(approxLenR, 3) }} r = {{ fixedN(approxLenReal, 2) }} 米
            </text>
            <text :x="layout.x0 + layout.width - 6" :y="layout.baseY - 8" text-anchor="end" class="t-lbl sky">宽 = r</text>
            <text :x="layout.x0 + layout.width / 2" :y="layout.baseY + 18" text-anchor="middle" class="t-lbl2">
              拼成的长方形：{{ fixedN(approxLenReal, 3) }} × {{ ar }} ≈ {{ fixedN(roundTo(approxLenReal * ar, 2), 2) }} 平方米
            </text>
          </g>
        </svg>
      </div>
      <div class="conv-panel" aria-label="逼近过程">
        <span class="conv-chip">份数 <strong>{{ slices }}</strong></span>
        <span class="conv-chip">长 = {{ slices }} × sin(180°/{{ slices }}) × r = <strong>{{ fixedN(approxLenR, 3) }}</strong> r</span>
        <span class="conv-chip">πr = <strong>3.142</strong> r</span>
        <span class="conv-chip result" data-test="len-gap">
          现在的长 {{ fixedN(approxLenReal, 2) }} 米（精确 {{ fixedN(approxLenReal, 3) }} 米）
          与 πr = {{ fixedN(piRReal, 2) }} 米（精确 {{ fixedN(piRReal, 3) }} 米）的差 = {{ fixedN(lenGap, 3) }} 米（份数越多差越小）
        </span>
      </div>
      <div class="controls" aria-label="等分操作">
        <UButton size="sm" color="primary" variant="soft" data-test="double-slices" @click="doubleSlices" data-act>
          逐级翻倍 · 下一档 {{ nextSlices }} 份
        </UButton>
        <UButton
          v-if="sliceOverride !== null"
          size="sm"
          variant="outline"
          color="neutral"
          data-test="follow-slider"
          @click="resetSlices"
        >
          取消翻倍，跟随滑块 {{ slicesParam }} 份
        </UButton>
      </div>
      <p class="res-line">
        S = 长 × 宽 = πr × r = 3.14 × {{ ar }} × {{ ar }} = <b>{{ fixedN(A, 2) }}</b> 平方米
      </p>
    </template>

    <!-- 环形面积 -->
    <template v-else-if="kind === 'annulus'">
      <p v-if="invalidRing" class="warn-line">注意：内圆半径 {{ r }} 应小于外圆半径 {{ R }}，请调大外圆或调小内圆</p>
      <template v-else>
        <div class="ring-stage">
          <div class="ring-card">
            <svg :width="130" :height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" :r="OUTER_PX" class="ring-fill" />
              <circle cx="65" cy="65" :r="innerPx" class="ring-hole" fill="var(--ui-bg-muted)" />
            </svg>
            <p class="ring-tag">外圆半径 R = {{ R }} 厘米<br />S大 = πR² = {{ fixedN(aOuter, 2) }} 平方厘米</p>
          </div>
          <p class="op">－</p>
          <div class="ring-card">
            <svg :width="130" :height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" :r="OUTER_PX" class="ring-fill" />
              <circle
                cx="65"
                cy="65"
                :r="innerPx"
                class="ring-hole"
                fill="var(--ui-bg-muted)"
                stroke="#f59e0b"
                stroke-width="2"
                stroke-dasharray="4 3"
              />
            </svg>
            <p class="ring-tag">内圆半径 r = {{ r }} 厘米<br />S小 = πr² = {{ fixedN(aInner, 2) }} 平方厘米</p>
          </div>
          <p class="op">＝</p>
          <div class="ring-card">
            <svg :width="130" :height="130" viewBox="0 0 130 130">
              <path :d="ringPath" class="ring-fill-stroke" />
              <line x1="65" y1="65" :x2="65 + innerPx" y2="65" class="line-radius" />
              <line x1="65" y1="65" :x2="65 + OUTER_PX" y2="65" class="line-diameter" />
            </svg>
            <p class="ring-tag ring-result">S环 = {{ fixedN(annulus, 2) }} 平方厘米<br />（占外圆的 {{ fixedN(ringShare * 100, 1) }}%）</p>
          </div>
        </div>
        <p class="res-line">
          S 环 = πR² − πr² = π(R² − r²) = 3.14 × ({{ R }}² − {{ r }}²) = <b>{{ fixedN(annulus, 2) }}</b> 平方厘米；环宽 R − r = {{ R - r }} 厘米
        </p>
        <!-- 外圆减内圆：图形化扣减步进 -->
        <div class="deduct-panel" aria-label="外圆减内圆扣减步进">
          <UButton size="sm" color="primary" variant="soft" data-test="ring-step" @click="stepRing">
            {{ ringDone ? '重看一遍' : '下一步：外圆减内圆' }}
          </UButton>
          <ol class="deduct-list">
            <li v-for="(s, i) in shownRingSteps" :key="'rs' + i" class="deduct-line" data-test="deduct-line">
              <span class="deduct-label">{{ s.label }}</span>
              <span class="deduct-expr">{{ s.expr }}</span>
              <b class="deduct-value">{{ s.value }}</b> 平方厘米
            </li>
          </ol>
          <p v-if="ringDone" class="done-line" data-test="ring-done">
            ✓ 环面积 = 外圆 − 内圆 = {{ fixedN(aOuter, 2) }} − {{ fixedN(aInner, 2) }} = <b>{{ fixedN(annulus, 2) }}</b> 平方厘米；
            用 π(R² − r²) 算同样得 <b>{{ fixedN(annulus, 2) }}</b> 平方厘米（R² − r² = {{ R * R - r * r }}）
          </p>
        </div>
      </template>
    </template>

    <!-- 组合图形 · 窗户 -->
    <template v-else>
      <div class="svg-box">
        <svg :width="340" :height="240" viewBox="0 0 340 240">
          <g transform="translate(170 200)">
            <rect
              :x="-sqPx / 2"
              :y="-sqPx"
              :width="sqPx"
              :height="sqPx"
              :class="{ 'part-hl': compStep === 1 }"
              fill="color-mix(in srgb, var(--ui-primary) 20%, transparent)"
              stroke="var(--ui-primary)"
              stroke-width="2.5"
            />
            <path
              :d="`M ${-smRadius} ${-sqPx} A ${smRadius} ${smRadius} 0 0 1 ${smRadius} ${-sqPx}`"
              :class="{ 'part-hl': compStep === 2 }"
              fill="color-mix(in srgb, var(--ui-primary) 45%, white)"
              stroke="var(--ui-primary)"
              stroke-width="2.5"
            />
            <line :x1="-sqPx / 2" :y1="-sqPx" :x2="sqPx / 2" :y2="-sqPx" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 4" />
            <text :x="0" :y="-sqPx - smRadius - 8" text-anchor="middle" class="t-lbl">
              半圆直径 = 正方形边长 = {{ toFixed2(side) }} 米，r = {{ toFixed2(side / 2) }} 米
            </text>
            <!-- 半圆面积标注在半圆内部，不再落进正方形 -->
            <text :x="0" :y="-sqPx - smRadius / 2 + 4" text-anchor="middle" class="t-lbl sky semi-area-label">
              半圆 S = πr²÷2 = {{ fixedN(windowSemi, 2) }} 平方米
            </text>
            <!-- 正方形面积标注放在图形下方居中，不会右溢出 -->
            <text :x="0" :y="24" text-anchor="middle" class="t-lbl sq-area-label">
              正方形 {{ toFixed2(side) }} × {{ toFixed2(side) }} = {{ fixedN(windowSq, 2) }} 平方米
            </text>
            <text :x="sqPx / 2 + 8" :y="-sqPx / 2 + 4" class="t-lbl2 side-label">边长 {{ toFixed2(side) }} 米</text>
          </g>
        </svg>
      </div>
      <!-- 分块高亮 + 各部分面积累加 -->
      <div class="composite-panel" aria-label="分块累加">
        <div class="comp-chips">
          <span
            v-for="(p, i) in compParts"
            :key="p.key"
            class="comp-chip"
            :class="{ on: compStep >= i + 1 && compStep <= 2 }"
            data-test="comp-chip"
          >{{ p.label }} S = {{ p.expr }} = <b>{{ fixedN(p.value, 2) }}</b> 平方米</span>
        </div>
        <UButton size="sm" color="primary" variant="soft" data-test="comp-step" @click="stepComposite" data-act>
          {{ compDone ? '重看一遍' : compStep === 0 ? '第 1 步：先算正方形' : compStep === 1 ? '第 2 步：再算半圆' : '第 3 步：两部分相加' }}
        </UButton>
        <p v-if="compDone" class="done-line" data-test="comp-done">
          ✓ 各部分之和 = {{ fixedN(compSquare, 2) }} + {{ fixedN(compSemi, 2) }} =
          <b>{{ fixedN(compSum, 2) }}</b> 平方米（半圆直径 = 正方形边长 = {{ toFixed2(side) }} 米，先分别算再相加）
        </p>
      </div>
      <p class="res-line">
        S = {{ fixedN(windowSq, 2) }} + π×{{ toFixed2(side / 2) }}²÷2 = {{ fixedN(windowSq, 2) }} + {{ fixedN(windowSemi, 2) }} =
        <b>{{ fixedN(windowTotal, 2) }} 平方米</b>；周长 = {{ toFixed2(side) }} × (3 + 3.14 ÷ 2) ≈
        <b>{{ fixedN(windowPerim, 3) }}</b> 米
      </p>
    </template>
  </div>
</template>

<style scoped>
.circle-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.svg-box {
  display: flex;
  justify-content: center;
}
.svg-box svg {
  max-width: 560px;
  height: auto;
}
.t-lbl {
  font-size: 12px;
  fill: var(--ui-text-toned);
  font-weight: 700;
}
.t-lbl.amber {
  fill: #b45309;
}
.t-lbl.sky {
  fill: #0369a1;
}
.t-lbl2 {
  font-size: 11px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.dot {
  fill: #b45309;
}
.dot-center {
  fill: var(--ui-primary);
}
.circle-outline {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 2.5;
}
.circle-outline-muted {
  fill: none;
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.circle-roll {
  fill: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 2.5;
}
.line-radius {
  stroke: #f59e0b;
  stroke-width: 1.8;
}
.line-radius-extra {
  stroke: #f59e0b;
  stroke-width: 1.4;
  stroke-dasharray: 5 3;
}
.radius-len {
  fill: #b45309;
}
.fold-line {
  stroke: #a855f7;
  stroke-width: 1.4;
}
.part-hl {
  stroke-width: 4;
  stroke: var(--ui-warning, #f59e0b);
}
.line-diameter {
  stroke: #0ea5e9;
  stroke-width: 2;
}
.line-diameter-roll {
  stroke: #0ea5e9;
  stroke-width: 1.6;
}
.line-angle {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2;
}
.line-axis {
  stroke: #a855f7;
  stroke-width: 1.2;
  stroke-dasharray: 6 4;
}
.baseline {
  stroke: var(--ui-text-muted);
  stroke-width: 1.6;
}
.cycloid {
  fill: none;
  stroke: color-mix(in srgb, var(--ui-primary) 55%, transparent);
  stroke-width: 1.4;
  stroke-dasharray: 4 3;
}
.sector-fill {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
}
.sector-fill-stroke {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.slice-a {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke: var(--ui-bg);
  stroke-width: 1;
}
.slice-b {
  fill: color-mix(in srgb, var(--ui-primary) 25%, white);
  stroke: var(--ui-bg);
  stroke-width: 1;
}
.rect-ghost {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-width: 1.4;
  stroke-dasharray: 6 4;
}
.ring-fill {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.ring-fill-stroke {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.sector-parts,
.conv-panel,
.controls {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  align-items: center;
}
.part-chip,
.conv-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
  font-weight: 800;
}
.part-chip.primary,
.conv-chip.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}
.ring-stage {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
}
.ring-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.6rem;
}
.ring-card svg {
  width: 130px;
  height: 130px;
}
.ring-tag {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  text-align: center;
  margin: 0;
}
.ring-tag.ring-result {
  color: var(--ui-primary);
}
.op {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.warn-line {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-warning, #f59e0b);
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
}
.done-line {
  margin: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  text-align: center;
  max-width: 34rem;
}
.diameter-note {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-weight: 600;
  text-align: center;
  max-width: 34rem;
}
.diameter-table td.ratio-cell,
.diameter-table td:last-child {
  color: var(--ui-primary);
  font-weight: 800;
}
.deduct-panel,
.composite-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  max-width: 100%;
}
.deduct-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.deduct-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-variant-numeric: tabular-nums;
}
.deduct-label {
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.deduct-value {
  color: var(--ui-primary);
}
.comp-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.comp-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.comp-chip.on {
  border-color: var(--ui-warning, #f59e0b);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 16%, var(--ui-bg));
  color: var(--ui-text-highlighted);
}
.scale-line {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ui-text-muted);
  text-align: center;
}
.measure-table {
  border-collapse: collapse;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.measure-table caption {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  font-weight: 600;
  padding-bottom: 0.25rem;
  caption-side: top;
}
.measure-table th,
.measure-table td {
  border: 1px solid var(--ui-border);
  padding: 0.15rem 0.6rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.measure-table th {
  background: var(--ui-bg-muted);
  font-weight: 800;
}
.measure-table td:last-child {
  color: var(--ui-primary);
  font-weight: 800;
}
.res-line {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.res-line b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
</style>
