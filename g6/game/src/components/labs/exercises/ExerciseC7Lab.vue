<script setup lang="ts">
/**
 * 练习题 Lab · 七 确定位置
 * ex-c7-route-path      数对画出行走路线（12×8 方格 · 分色路线 · 步行点 · 数对序列）
 * ex-c7-observer-point  两个观测点找家（打谷场正北 · 商店北偏西 · 射线交会 · 行走路线）
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

function clampInt(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.round(v)))
}

/* ================= 数对画出行走路线 ================= */
/** 页图派生常量统一取自数据层 fixed，避免“数据声明了却被组件写死”的脱钩 */
const FIXED = props.lab.fixed!
const R_CELL = 44
const R_COLS = FIXED.cols!
const R_ROWS = FIXED.rows!
const R_PAD_L = 30
const R_PAD_T = 20
const R_PAD_B = 26
const R_PAD_R = 52
const R_W = R_PAD_L + R_COLS * R_CELL + R_PAD_R
const R_H = R_PAD_T + R_ROWS * R_CELL + R_PAD_B
const R_Y0 = FIXED.y0!
const R_GRID_W = R_COLS * R_CELL
const R_GRID_H = R_ROWS * R_CELL

/** 参数封顶在方格范围内：x₀≤8、k≤4 ⇒ 终点列 ≤12；m≤4 ⇒ 终点行 ≤6 */
const rX0 = computed(() => clampInt(props.values.x0 ?? 6, 3, 8))
const rK = computed(() => clampInt(props.values.k ?? 3, 1, 4))
const rM = computed(() => clampInt(props.values.m ?? 2, 1, 4))
const rXEnd = computed(() => rX0.value + rK.value)
const rYEnd = computed(() => R_Y0 + rM.value)

/** 单元格中心：列 1..12 从左往右，行 1..8 从下往上 */
function rCx(col: number): number {
  return R_PAD_L + (col - 0.5) * R_CELL
}
function rCy(row: number): number {
  return R_PAD_T + (R_ROWS - row + 0.5) * R_CELL
}

interface RoutePt {
  key: string
  col: number
  row: number
  x: number
  y: number
  vertical: boolean
}

/** 路线的全部格点：先水平段（行不变），再竖直段（列不变） */
const routePts = computed<RoutePt[]>(() => {
  const pts: RoutePt[] = []
  for (let i = 0; i <= rK.value; i++) {
    const col = rX0.value + i
    pts.push({ key: `${col}-${R_Y0}`, col, row: R_Y0, x: rCx(col), y: rCy(R_Y0), vertical: false })
  }
  for (let j = 1; j <= rM.value; j++) {
    const row = R_Y0 + j
    pts.push({ key: `${rXEnd.value}-${row}`, col: rXEnd.value, row, x: rCx(rXEnd.value), y: rCy(row), vertical: true })
  }
  return pts
})
const routeStart = computed(() => routePts.value[0]!)
const routeCorner = computed(() => ({ x: rCx(rXEnd.value), y: rCy(R_Y0) }))
const routeEnd = computed(() => routePts.value[routePts.value.length - 1]!)
const routeHPoints = computed(() => `${routeStart.value.x},${routeStart.value.y} ${routeCorner.value.x},${routeCorner.value.y}`)
const routeVPoints = computed(() => `${routeCorner.value.x},${routeCorner.value.y} ${routeEnd.value.x},${routeEnd.value.y}`)
const routeHLenPx = computed(() => `${rK.value * R_CELL}px`)
const routeVLenPx = computed(() => `${rM.value * R_CELL}px`)
const routeWalking = computed(() => rK.value + rM.value)

/**
 * 过程态：一格一格地走。
 * 步数默认「全部走完」（= k + m），所以默认渲染与原来完全一致；
 * 改起点/步数（滑块）时重新回到「走完」态，动作仍由两个按钮驱动。
 */
const rStep = ref(routeWalking.value)
watch([rK, rM], () => {
  rStep.value = routeWalking.value
})
const rWalked = computed(() => Math.min(routeWalking.value, Math.max(0, rStep.value)))
const rWalkedEast = computed(() => Math.min(rWalked.value, rK.value))
const rWalkedNorth = computed(() => Math.max(0, rWalked.value - rK.value))
/** 当前棋子所在格：先沿行 R_Y0 向东走 k 格，再沿终点列向北走 m 格 */
const rNowCol = computed(() => (rWalked.value <= rK.value ? rX0.value + rWalked.value : rXEnd.value))
const rNowRow = computed(() => (rWalked.value <= rK.value ? R_Y0 : R_Y0 + rWalkedNorth.value))
const rPieceX = computed(() => rCx(rNowCol.value))
const rPieceY = computed(() => rCy(rNowRow.value))
/** 随步数变化的说明：向东一格只改第一个数、向北一格只改第二个数 */
const routeStepNote = computed(() => {
  const pair = `（${rNowCol.value}，${rNowRow.value}）`
  const hint = rWalked.value === 0
    ? `还没出发，起点就是电影院 ${pair}`
    : rWalkedNorth.value === 0
      ? `刚向东走 1 格：第一个数 +1、第二个数不变 → ${pair}`
      : `刚向北走 1 格：第二个数 +1、第一个数不变 → ${pair}`
  return `向东走了 ${rWalkedEast.value} / ${rK.value} 格，向北走了 ${rWalkedNorth.value} / ${rM.value} 格，当前数对 ${pair}；${hint}。`
})
function routeNextStep() {
  if (rWalked.value >= routeWalking.value) return
  rStep.value = rWalked.value + 1
  playClick()
}
function routeResetStep() {
  if (rWalked.value === 0) return
  rStep.value = 0
  playClick()
}

/** 数对文字：水平段标在格点上方，竖直段标在格点左侧 */
const routeLabels = computed(() =>
  routePts.value.map((pt) => ({
    key: pt.key,
    text: `（${pt.col}，${pt.row}）`,
    x: pt.vertical ? pt.x - 9 : pt.x,
    y: pt.vertical ? pt.y + 4 : pt.y - 10,
    anchor: pt.vertical ? 'end' : 'middle',
  })),
)

const routeArrowH = computed(() => {
  const s = routeStart.value
  const c = routeCorner.value
  const y = s.y + 18
  return { x1: s.x, x2: c.x, y, textX: (s.x + c.x) / 2, textY: y + 16 }
})
const routeArrowV = computed(() => {
  const c = routeCorner.value
  const e = routeEnd.value
  const x = c.x + 18
  return { x, y1: c.y, y2: e.y, textX: x + 8, textY: (c.y + e.y) / 2 + 4 }
})

const ROUTE_V_BOUNDS = Array.from({ length: R_COLS + 1 }, (_, i) => R_PAD_L + i * R_CELL)
const ROUTE_H_BOUNDS = Array.from({ length: R_ROWS + 1 }, (_, i) => R_PAD_T + i * R_CELL)
const ROUTE_COL_TICKS = Array.from({ length: R_COLS }, (_, i) => i + 1)
const ROUTE_ROW_TICKS = Array.from({ length: R_ROWS }, (_, i) => i + 1)

/* ================= 两个观测点找家 ================= */
const O_CELL = 40
const O_COLS = 12
const O_ROWS = 8
const O_PAD_L = 24
const O_PAD_T = 40
const O_PAD_B = 44
const O_PAD_R = 24
const O_W = O_PAD_L + O_COLS * O_CELL + O_PAD_R
const O_H = O_PAD_T + O_ROWS * O_CELL + O_PAD_B
const O_BOTTOM = O_PAD_T + O_ROWS * O_CELL
const O_GRID_W = O_COLS * O_CELL

/** 单位：1 格 = 100 米 */
const O_GX = FIXED.gx!
const O_GY = FIXED.gy!
const O_SX = FIXED.sx!
const O_SY = FIXED.sy!
const O_U = FIXED.u!

/** 参数封顶：角度 15°~75°、距离 1~5 格且射线终点不越出方格 */
const oAngle = computed(() => clampInt(props.values.angle ?? 60, 15, 75))
const oDist = computed(() => clampInt(props.values.dist ?? 400, 100, 500))
const oDist2 = computed(() => clampInt(props.values.dist2 ?? 200, 100, 300))

const oGridL = computed(() => oDist2.value / O_U)
const oR = computed(() => oDist.value / O_U)
const oRad = computed(() => (oAngle.value * Math.PI) / 180)
const oNorth = computed(() => oR.value * Math.cos(oRad.value))
const oWest = computed(() => oR.value * Math.sin(oRad.value))

const oHomeL = computed(() => ({ x: O_GX, y: O_GY + oGridL.value }))
const oHomeY = computed(() => ({ x: O_SX - oWest.value, y: O_SY + oNorth.value }))

/** 画布坐标保留两位小数，避免浮点误差导致同一排的对齐线错位 */
function round2(v: number): number {
  return Math.round(v * 100) / 100
}
function oPx(x: number): number {
  return round2(O_PAD_L + x * O_CELL)
}
function oPy(y: number): number {
  return round2(O_BOTTOM - y * O_CELL)
}

const oGrainPx = computed(() => ({ x: oPx(O_GX), y: oPy(O_GY) }))
const oShopPx = computed(() => ({ x: oPx(O_SX), y: oPy(O_SY) }))
const oHomeLPx = computed(() => ({ x: oPx(oHomeL.value.x), y: oPy(oHomeL.value.y) }))
const oHomeYPx = computed(() => ({ x: oPx(oHomeY.value.x), y: oPy(oHomeY.value.y) }))
const oStreetY = computed(() => oPy(O_GY))

const oSameRow = computed(() => Math.abs(oNorth.value - oGridL.value) < 0.05)

/** 商店到晓雨家的射线：比家再延伸 0.4 格，保证交点（家）落在射线上 */
const oRayEnd = computed(() => {
  const len = oR.value + 0.4
  return { x: oPx(O_SX - len * Math.sin(oRad.value)), y: oPy(O_SY + len * Math.cos(oRad.value)) }
})
const oNorthAxisEnd = computed(() => ({ x: oShopPx.value.x, y: oShopPx.value.y - oR.value * O_CELL }))

/** 半径 = dist/u 的定位圆弧：从正北方向转到射线方向 */
const oRadiusArc = computed(() => {
  const R = oR.value * O_CELL
  const s = oNorthAxisEnd.value
  const e = oHomeYPx.value
  return `M ${s.x} ${s.y} A ${R} ${R} 0 0 0 ${e.x} ${e.y}`
})
const oAngleArc = computed(() => {
  const R = 54
  const cx = oShopPx.value.x
  const cy = oShopPx.value.y
  const end = { x: cx - R * Math.sin(oRad.value), y: cy - R * Math.cos(oRad.value) }
  const mid = oRad.value / 2
  return {
    d: `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${end.x} ${end.y}`,
    label: { x: cx - (R + 18) * Math.sin(mid), y: cy - (R + 10) * Math.cos(mid) },
  }
})

/** 行走路线：向南到街道 → 沿街向东到商店 → 沿北偏西射线到家 */
const oWalkPath = computed(() => {
  const l = oHomeLPx.value
  const y = oHomeYPx.value
  const street = oStreetY.value
  return `M ${l.x} ${l.y} L ${l.x} ${street} L ${oShopPx.value.x} ${street} L ${y.x} ${y.y}`
})
const oWalkPoints = computed(() => {
  const l = oHomeLPx.value
  const y = oHomeYPx.value
  const street = oStreetY.value
  return `${l.x},${l.y} ${l.x},${street} ${oShopPx.value.x},${street} ${y.x},${y.y}`
})

const oHomeLText = computed(() => `（${toFixed2(oHomeL.value.x)}，${toFixed2(oHomeL.value.y)}）`)
const oHomeYText = computed(() => `（${toFixed2(oHomeY.value.x)}，${toFixed2(oHomeY.value.y)}）`)
/** 两家相隔 = 直线距离（不是只取东西向差），同排时与东西向差相等 */
const oGapGrid = computed(() =>
  Math.hypot(oHomeY.value.x - oHomeL.value.x, oHomeY.value.y - oHomeL.value.y),
)
const oGapText = computed(() => toFixed2(oGapGrid.value))
const oGapMeters = computed(() => Math.round(oGapGrid.value * O_U))

/**
 * 过程态：分三步说清“以谁为观测点”。
 * 初值 2 = 最完整的一步（两处位置、同一排关系、行走路线都在），与既有渲染完全一致；
 * 点一次往前走一步，走完回到第 0 步。
 */
const OBS_STEPS = ['只看商店的方向线', '拆成向北、向西两段', '和打谷场那处比较']
const oStep = ref(2)
/** 第 2 步起：揭出“向北 r·cos、向西 r·sin”的分解与晓雨家落点 */
const oStepSplit = computed(() => oStep.value >= 1)
/** 第 3 步起：再以打谷场为观测点，揭出两家位置关系与行走路线 */
const oStepCompare = computed(() => oStep.value >= 2)
function nextObsStep() {
  oStep.value = (oStep.value + 1) % OBS_STEPS.length
  playClick()
}
const oNextStepLabel = computed(() => OBS_STEPS[(oStep.value + 1) % OBS_STEPS.length] ?? OBS_STEPS[0]!)

/** 分解出的两条直角边：从商店先向北 r·cos、再向西 r·sin，落点正是晓雨家 */
const oNorthLegEnd = computed(() => ({ x: oShopPx.value.x, y: oHomeYPx.value.y }))
const oNorthLegMidY = computed(() => (oShopPx.value.y + oHomeYPx.value.y) / 2)
const oWestLegMidX = computed(() => (oShopPx.value.x + oHomeYPx.value.x) / 2)
const oNorthLegText = computed(() => `向北 ${toFixed2(oNorth.value)} 格`)
const oWestLegText = computed(() => `向西 ${toFixed2(oWest.value)} 格`)
/** 两家东西向相差（不同排时要先向东走这么多）与南北向相差 */
const oEastGrid = computed(() => oHomeY.value.x - oHomeL.value.x)
const oRowDelta = computed(() => oHomeY.value.y - oHomeL.value.y)

/** 随步数变化的说明：第 1 步只认方向、第 2 步拆出两段、第 3 步与打谷场那处比较 */
const oStepNote = computed(() => {
  const r = toFixed2(oR.value)
  const north = toFixed2(oNorth.value)
  const west = toFixed2(oWest.value)
  if (oStep.value === 0) {
    return `第 1 步：先只以商店为观测点——“北偏西 ${oAngle.value}°”画出的是一条方向线：方向有了，可 ${oDist.value} 米还没用上，晓雨家在这条射线上的哪一点还定不下来。`
  }
  if (oStep.value === 1) {
    return `第 2 步：把 ${oDist.value} 米换成 ${r} 格再拆开——向北 ${r} × cos${oAngle.value}° = ${north} 格、向西 ${r} × sin${oAngle.value}° ≈ ${west} 格，两条直角边的落点 ${oHomeYText.value} 就是晓雨家。`
  }
  return oSameRow.value
    ? `第 3 步：再以打谷场为观测点比一比——小琳家在正北 ${oDist2.value} 米（${toFixed2(oGridL.value)} 格），小琳家 ${oHomeLText.value}、晓雨家 ${oHomeYText.value} 在同一排上；从小琳家一直向东 ${oGapText.value} 格（约 ${oGapMeters.value} 米）就到晓雨家。`
    : `第 3 步：再以打谷场为观测点比一比——小琳家 ${oHomeLText.value}、晓雨家 ${oHomeYText.value} 不在同一排；从小琳家先向东 ${toFixed2(oEastGrid.value)} 格，再向${oRowDelta.value > 0 ? '北' : '南'} ${toFixed2(Math.abs(oRowDelta.value))} 格就到晓雨家。`
})

const OBS_V_BOUNDS = Array.from({ length: O_COLS + 1 }, (_, i) => O_PAD_L + i * O_CELL)
const OBS_H_BOUNDS = Array.from({ length: O_ROWS + 1 }, (_, i) => O_BOTTOM - i * O_CELL)
</script>

<template>
  <div class="ex-c7-wrap">
    <!-- 数对画出行走路线 -->
    <template v-if="kind === 'ex-c7-route-path'">
      <div class="route-stage">
        <svg class="route-svg" :width="R_W" :height="R_H" :viewBox="`0 0 ${R_W} ${R_H}`">
          <defs>
            <marker id="c7-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--ui-primary)" />
            </marker>
          </defs>

          <line
            v-for="x in ROUTE_V_BOUNDS" :key="'gv' + x" class="route-grid"
            :x1="x" :y1="R_PAD_T" :x2="x" :y2="R_PAD_T + R_GRID_H"
          />
          <line
            v-for="y in ROUTE_H_BOUNDS" :key="'gh' + y" class="route-grid"
            :x1="R_PAD_L" :y1="y" :x2="R_PAD_L + R_GRID_W" :y2="y"
          />

          <text
            v-for="c in ROUTE_COL_TICKS" :key="'ct' + c" class="route-tick"
            :x="rCx(c)" :y="R_PAD_T + R_GRID_H + 18" text-anchor="middle"
          >{{ c }}</text>
          <text
            v-for="r in ROUTE_ROW_TICKS" :key="'rt' + r" class="route-tick"
            :x="R_PAD_L - 12" :y="rCy(r) + 4" text-anchor="end"
          >{{ r }}</text>

          <polyline class="route-line route-h" :points="routeHPoints" :style="{ '--len': routeHLenPx }" />
          <polyline
            class="route-line route-v" :points="routeVPoints"
            :style="{ '--len': routeVLenPx, animationDelay: '0.7s' }"
          />

          <circle v-for="pt in routePts" :key="'p' + pt.key" class="route-pt" :cx="pt.x" :cy="pt.y" r="4.5" />
          <text
            v-for="lb in routeLabels" :key="'l' + lb.key" class="route-pt-lbl"
            :x="lb.x" :y="lb.y" :text-anchor="lb.anchor"
          >{{ lb.text }}</text>

          <line
            class="route-arrow" :x1="routeArrowH.x1" :y1="routeArrowH.y"
            :x2="routeArrowH.x2" :y2="routeArrowH.y" marker-end="url(#c7-arrow)"
          />
          <text class="route-arrow-lbl" :x="routeArrowH.textX" :y="routeArrowH.textY" text-anchor="middle">列 +1</text>
          <line
            class="route-arrow" :x1="routeArrowV.x" :y1="routeArrowV.y1"
            :x2="routeArrowV.x" :y2="routeArrowV.y2" marker-end="url(#c7-arrow)"
          />
          <text class="route-arrow-lbl" :x="routeArrowV.textX" :y="routeArrowV.textY">行 +1</text>

          <text class="route-emoji" :x="routeStart.x - 26" :y="routeStart.y + 4">🎬</text>
          <text class="route-place" :x="routeStart.x - 26" :y="routeStart.y + 18" text-anchor="middle">电影院</text>
          <text class="route-emoji" :x="routeEnd.x" :y="routeEnd.y - 26" text-anchor="middle">🏫</text>
          <text class="route-place" :x="routeEnd.x" :y="routeEnd.y - 38" text-anchor="middle">学校</text>

          <circle class="route-walker" :cx="rPieceX" :cy="rPieceY" r="6" />
        </svg>

        <div class="route-panel">
          <h4 class="route-panel-title">路线的数对序列</h4>
          <div class="route-seq">
            <template v-for="(lb, i) in routeLabels" :key="'s' + lb.key">
              <span class="route-seq-item">{{ lb.text }}</span>
              <span v-if="i < routeLabels.length - 1" class="route-seq-arrow">→</span>
            </template>
          </div>
          <p class="route-sum">
            向东 {{ rK }} 格、向北 {{ rM }} 格，一共走 <b>{{ routeWalking }}</b> 格；终点数对（{{ rXEnd }}，{{ rYEnd }}）。
          </p>
          <div class="route-steps">
            <UButton size="sm" color="primary" :disabled="rWalked >= routeWalking" @click="routeNextStep">
              走下一格
            </UButton>
            <UButton size="sm" variant="outline" color="neutral" :disabled="rWalked === 0" @click="routeResetStep" data-act>
              回到起点
            </UButton>
          </div>
          <p class="route-step-note">{{ routeStepNote }}</p>
        </div>
      </div>
    </template>

    <!-- 两个观测点找家 -->
    <template v-else-if="kind === 'ex-c7-observer-point'">
      <div class="obs-stage">
        <svg class="obs-svg" :width="O_W" :height="O_H" :viewBox="`0 0 ${O_W} ${O_H}`">
          <defs>
            <marker id="c7-north" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="var(--ui-text-toned)" />
            </marker>
          </defs>

          <line
            v-for="x in OBS_V_BOUNDS" :key="'ov' + x" class="obs-grid"
            :x1="x" :y1="O_PAD_T" :x2="x" :y2="O_BOTTOM"
          />
          <line
            v-for="y in OBS_H_BOUNDS" :key="'oh' + y" class="obs-grid"
            :x1="O_PAD_L" :y1="y" :x2="O_PAD_L + O_GRID_W" :y2="y"
          />

          <text class="obs-north-lbl" :x="O_PAD_L + O_GRID_W / 2" y="16" text-anchor="middle">北</text>
          <line
            class="obs-north-marker" :x1="O_PAD_L + O_GRID_W / 2" y1="34"
            :x2="O_PAD_L + O_GRID_W / 2" y2="20" marker-end="url(#c7-north)"
          />

          <line class="obs-street" :x1="O_PAD_L" :y1="oStreetY" :x2="O_PAD_L + O_GRID_W" :y2="oStreetY" />
          <text class="obs-street-lbl" :x="O_PAD_L + 4" :y="oStreetY - 7">街道</text>

          <line class="obs-scale" :x1="O_PAD_L" :y1="O_BOTTOM + 24" :x2="O_PAD_L + O_CELL" :y2="O_BOTTOM + 24" />
          <text class="obs-scale-lbl" :x="O_PAD_L + O_CELL + 8" :y="O_BOTTOM + 28">1 格 = 100 米</text>

          <line
            v-if="oStepCompare" class="obs-north-line"
            :x1="oGrainPx.x" :y1="oGrainPx.y" :x2="oHomeLPx.x" :y2="oHomeLPx.y"
          />
          <text
            v-if="oStepCompare" class="obs-north-dist" :x="oHomeLPx.x - 8"
            :y="(oGrainPx.y + oHomeLPx.y) / 2 + 4" text-anchor="end"
          >正北 {{ oDist2 }} 米</text>

          <line class="obs-north-axis" :x1="oShopPx.x" :y1="oShopPx.y" :x2="oNorthAxisEnd.x" :y2="oNorthAxisEnd.y" />
          <path v-if="oStepSplit" class="obs-radius-arc" :d="oRadiusArc" fill="none" />
          <line
            class="obs-ray" :class="{ 'obs-hot': oStep === 0 }"
            :x1="oShopPx.x" :y1="oShopPx.y" :x2="oRayEnd.x" :y2="oRayEnd.y"
          />
          <path class="obs-angle-arc" :d="oAngleArc.d" fill="none" />
          <text class="obs-angle-lbl" :x="oAngleArc.label.x" :y="oAngleArc.label.y">{{ oAngle }}°</text>

          <!-- 第 2 步：把北偏西方向拆成“先向北 r·cos、再向西 r·sin”两条直角边 -->
          <line
            v-if="oStepSplit" class="obs-north-leg" :class="{ 'obs-hot': oStep === 1 }"
            :x1="oShopPx.x" :y1="oShopPx.y" :x2="oNorthLegEnd.x" :y2="oNorthLegEnd.y"
          />
          <line
            v-if="oStepSplit" class="obs-west-leg" :class="{ 'obs-hot': oStep === 1 }"
            :x1="oNorthLegEnd.x" :y1="oNorthLegEnd.y" :x2="oHomeYPx.x" :y2="oHomeYPx.y"
          />
          <text
            v-if="oStepSplit" class="obs-leg-lbl" :x="oShopPx.x + 6"
            :y="oNorthLegMidY + 4"
          >{{ oNorthLegText }}</text>
          <text
            v-if="oStepSplit" class="obs-leg-lbl" :x="oWestLegMidX"
            :y="oHomeYPx.y - 8" text-anchor="middle"
          >{{ oWestLegText }}</text>

          <line
            v-if="oSameRow && oStepCompare" class="obs-same-row"
            :x1="oHomeLPx.x" :y1="oHomeLPx.y" :x2="oHomeYPx.x" :y2="oHomeYPx.y"
          />
          <text
            v-if="oSameRow && oStepCompare" class="obs-same-row-lbl"
            :x="(oHomeLPx.x + oHomeYPx.x) / 2" :y="oHomeLPx.y - 8" text-anchor="middle"
          >同一排</text>

          <polyline
            v-if="oStepCompare" class="obs-walk-route" :class="{ 'obs-hot': oStep === 2 }"
            :points="oWalkPoints"
          />
          <circle v-if="oStepCompare" class="obs-walker" r="5">
            <animateMotion :path="oWalkPath" dur="4.4s" repeatCount="indefinite" />
          </circle>

          <text class="obs-emoji" :x="oGrainPx.x" :y="oGrainPx.y - 14" text-anchor="middle">🌾</text>
          <text class="obs-place" :x="oGrainPx.x" :y="oGrainPx.y + 24" text-anchor="middle">打谷场</text>
          <text class="obs-emoji" :x="oShopPx.x" :y="oShopPx.y - 14" text-anchor="middle">🏪</text>
          <text class="obs-place" :x="oShopPx.x" :y="oShopPx.y + 24" text-anchor="middle">商店</text>

          <text
            v-if="oStepCompare" class="obs-emoji" :x="oHomeLPx.x" :y="oHomeLPx.y - 12"
            text-anchor="middle"
          >🏠</text>
          <text
            v-if="oStepCompare" class="obs-home-lbl" :x="oHomeLPx.x" :y="oHomeLPx.y + 24"
            text-anchor="middle"
          >小琳家{{ oHomeLText }}</text>
          <text
            v-if="oStepSplit" class="obs-emoji" :x="oHomeYPx.x" :y="oHomeYPx.y - 12"
            text-anchor="middle"
          >🏠</text>
          <text
            v-if="oStepSplit" class="obs-home-lbl" :x="oHomeYPx.x" :y="oHomeYPx.y + 24"
            text-anchor="middle"
          >晓雨家{{ oHomeYText }}</text>
        </svg>

        <p class="obs-sum">
          小琳家 = 打谷场正北 {{ oDist2 }} 米<template v-if="oStepCompare"> → {{ oHomeLText }}</template>；
          晓雨家 = 商店北偏西 {{ oAngle }}° {{ oDist }} 米<template v-if="oStepSplit"> → {{ oHomeYText }}</template>。
        </p>
        <p v-if="oStepCompare" class="obs-walk-sum">
          行走路线：向南到街道 → 沿街向东到商店 → 沿北偏西 {{ oAngle }}° 方向走 {{ oDist }} 米；两家相隔约
          <b>{{ oGapText }}</b> 格（约 {{ oGapMeters }} 米）。
        </p>

        <div class="obs-steps">
          <UButton size="sm" color="primary" @click="nextObsStep">下一步：{{ oNextStepLabel }}</UButton>
          <span class="obs-step-note">{{ oStepNote }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ex-c7-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 320px;
}
.route-stage,
.obs-stage {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.route-svg,
.obs-svg {
  max-width: 100%;
  height: auto;
}

/* ---------- 数对画出行走路线 ---------- */
.route-grid {
  stroke: var(--ui-border);
  stroke-width: 1;
}
.route-tick {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  fill: var(--ui-text-muted);
}
.route-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: var(--len);
  stroke-dashoffset: var(--len);
  animation: route-draw 0.8s ease forwards;
}
.route-h {
  stroke: var(--ui-primary);
}
.route-v {
  stroke: #b45309;
}
@keyframes route-draw {
  to {
    stroke-dashoffset: 0;
  }
}
.route-pt {
  fill: var(--ui-bg);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.route-pt-lbl {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.route-arrow {
  stroke: var(--ui-primary);
  stroke-width: 1.6;
  stroke-dasharray: 4 3;
}
.route-arrow-lbl {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-primary);
}
.route-emoji {
  font-size: 17px;
}
.route-place {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-toned);
}
.route-walker {
  fill: var(--ui-primary);
  stroke: var(--ui-bg);
  stroke-width: 2;
}
.route-panel {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.45rem 0.7rem;
  max-width: 100%;
}
.route-panel-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--ui-text-toned);
}
.route-seq {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
  justify-content: center;
  align-items: center;
}
.route-seq-item {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.route-seq-arrow {
  font-size: 0.7rem;
  color: var(--ui-text-muted);
}
.route-sum {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.route-sum b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
.route-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
}
.route-step-note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}

/* ---------- 两个观测点找家 ---------- */
.obs-grid {
  stroke: var(--ui-border);
  stroke-width: 1;
}
.obs-street {
  stroke: var(--ui-text-muted);
  stroke-width: 7;
  opacity: 0.35;
  stroke-linecap: round;
}
.obs-street-lbl {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-muted);
}
.obs-north-lbl {
  font-size: 12px;
  font-weight: 800;
  fill: #b45309;
}
.obs-north-marker {
  stroke: var(--ui-text-toned);
  stroke-width: 1.5;
}
.obs-scale {
  stroke: var(--ui-text-toned);
  stroke-width: 2;
}
.obs-scale-lbl {
  font-size: 11px;
  fill: var(--ui-text-muted);
}
.obs-north-line {
  stroke: #0369a1;
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.obs-north-dist {
  font-size: 11px;
  font-weight: 800;
  fill: #0369a1;
}
.obs-north-axis {
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}
.obs-radius-arc {
  stroke: var(--ui-primary);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
  opacity: 0.7;
}
.obs-ray {
  stroke: var(--ui-primary);
  stroke-width: 2.5;
}
.obs-angle-arc {
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.obs-angle-lbl {
  font-size: 12px;
  font-weight: 800;
  fill: var(--ui-primary);
}
/* 第 2 步的分解两段：向北 r·cos、向西 r·sin */
.obs-north-leg,
.obs-west-leg {
  stroke: #b45309;
  stroke-width: 2.5;
  stroke-linecap: round;
}
.obs-north-leg {
  stroke-dasharray: 8 3;
}
.obs-west-leg {
  stroke-dasharray: 3 3;
}
.obs-leg-lbl {
  font-size: 11px;
  font-weight: 800;
  fill: #b45309;
}
.obs-same-row {
  stroke: #b45309;
  stroke-width: 1.6;
  stroke-dasharray: 6 4;
  opacity: 0.8;
}
.obs-same-row-lbl {
  font-size: 11px;
  font-weight: 800;
  fill: #b45309;
}
.obs-walk-route {
  fill: none;
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 3;
  stroke-dasharray: 7 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.obs-walker {
  fill: var(--ui-warning, #f59e0b);
  stroke: var(--ui-bg);
  stroke-width: 2;
}
.obs-emoji {
  font-size: 18px;
}
.obs-place {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-text-toned);
}
.obs-home-lbl {
  font-size: 11px;
  font-weight: 800;
  fill: var(--ui-primary);
}
.obs-sum,
.obs-walk-sum {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 40rem;
}
.obs-walk-sum b {
  color: var(--ui-primary);
  font-size: 1.02rem;
}
.obs-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  max-width: 44rem;
}
.obs-step-note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
/* 放在最后：与 .obs-ray/.obs-north-leg/.obs-west-leg/.obs-walk-route 同权重，靠顺序生效 */
.obs-hot {
  stroke-width: 4.2;
  animation: obs-pulse 1.1s ease-in-out infinite;
}
@keyframes obs-pulse {
  50% {
    opacity: 0.4;
  }
}
</style>
