<script setup lang="ts">
/**
 * 图形的运动 Lab（平移 / 旋转 / 轴对称）
 *
 * 证据链：情境（方格纸上的小船/小鱼/闸杆/三角形/待补全图形）
 *   → 模型（与图形同比例的单位方格，图形顶点落在格点上）
 *   → 操作（滑块改方向/格数/角度/对称轴位置；按钮触发过程动画）
 *   → 抽象（对应点距离、旋转角、对称点到轴的距离，与图同帧显示）。
 *
 * 几何全部在「格坐标、y 向上」里算，再统一换算到像素；
 * 公式集中在 `@/lib/labs/motion`，并由单元测试断言（旋转 90° 后 A′ 的位置、反射后到轴距离相等）。
 */
import { computed, ref } from 'vue'
import { animate } from 'animejs'
import type { LabDef, ParamValues } from '@data/schema/lab'
import {
  BOAT,
  FISH,
  LEVER,
  TRIANGLE,
  dist,
  reflectPoint,
  rotatePoint,
  translatePoint,
  type Pt,
  type ShapeFigure,
} from '@/lib/labs/motion'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const MARGIN = 14
const MAX_W = 430
const MAX_H = 350
/** 旋转网格与旋转中心的绝对格坐标 */
const ROT_COLS = 12
const ROT_ROWS = 12
const ROT_PIVOT: Record<number, Pt> = { 2: [4, 6], 3: [5, 4] }
/** 轴对称网格 */
const AXIS_COLS = 15
const AXIS_ROWS = 10
const AXIS_BASE = 6
const HALF_W = 3
/** 已画的一半（相对左边缘，y 向上；右边缘贴在对称轴上） */
const HALF_PTS: Pt[] = [
  [HALF_W, 0],
  [0.4, 0],
  [1.2, 1.6],
  [HALF_W, 3.2],
]

const kind = computed(() => props.lab.kind)
const isTranslate = computed(() => kind.value === 'translate')
const isRotate = computed(() => kind.value === 'rotate')
const isAxis = computed(() => kind.value === 'axis')

/* ---------------- 参数 ---------------- */
const dirIdx = computed(() => (((Math.round(props.values.dir ?? 0) % 4) + 4) % 4) as 0 | 1 | 2 | 3)
const cells = computed(() => Math.max(0, Math.round(props.values.grid ?? 0)))
const angle = computed(() => Math.max(0, Math.round(props.values.angle ?? 0)))
const clockwise = computed(() => Math.round(props.values.dir ?? 0) === 0)
/** 视觉角度：正 = 顺时针（与课本、SVG rotate() 一致） */
const visualDeg = computed(() => (clockwise.value ? angle.value : -angle.value))
const sym = computed(() => Math.min(2, Math.max(0, Math.round(props.values.sym ?? 1))))
/** fixed.figure：0 小船 / 1 小鱼 / 2 闸杆 / 3 三角形 */
const figCode = computed(() => Math.round(props.values.figure ?? 0))
const figure = computed<ShapeFigure>(() => [BOAT, FISH, LEVER, TRIANGLE][figCode.value] ?? BOAT)
const isTriangle = computed(() => figCode.value === 3)

/* ---------------- 布局 ---------------- */
const layout = computed(() => {
  if (isAxis.value) return { cols: AXIS_COLS, rows: AXIS_ROWS, cell: Math.min(30, MAX_W / AXIS_COLS, MAX_H / AXIS_ROWS) }
  if (isRotate.value) return { cols: ROT_COLS, rows: ROT_ROWS, cell: Math.min(30, MAX_W / ROT_COLS, MAX_H / ROT_ROWS) }
  const f = figure.value
  const g = cells.value
  const horizontal = dirIdx.value === 0 || dirIdx.value === 2
  const cols = horizontal ? f.w + g + 4 : f.w + 6
  const rows = horizontal ? f.h + 6 : f.h + g + 4
  return { cols, rows, cell: Math.min(30, MAX_W / cols, MAX_H / rows) }
})

/** 平移：图形外接框左下角的格坐标（沿运动方向预留空间） */
const figOrigin = computed<Pt>(() => {
  const { cols, rows } = layout.value
  const f = figure.value
  const g = cells.value
  if (dirIdx.value === 0) return [2, (rows - f.h) / 2]
  /** 向左：原图放在右侧，平移后的图形正好落到左边界 */
  if (dirIdx.value === 2) return [g + 2, (rows - f.h) / 2]
  if (dirIdx.value === 3) return [(cols - f.w) / 2, 2]
  /** 向下：原图放在上方，平移后的图形正好落到下边界 */
  return [(cols - f.w) / 2, g + 2]
})

/**
 * 网格线的条数必须是**整数**：`v-for="i in n"` 在客户端会执行 `new Array(n)`，
 * n 是小数时抛 `RangeError: Invalid array length`（页面直接变成 500 错误页）。
 * 图形宽高含小数（如 4.6 格），所以 cols/rows 会带小数——画布尺寸仍用精确值，
 * 只有"线的条数"向上取整。
 */
const colLines = computed(() => Math.ceil(layout.value.cols) + 1)
const rowLines = computed(() => Math.ceil(layout.value.rows) + 1)

const px = (x: number) => MARGIN + x * layout.value.cell
const py = (y: number) => MARGIN + (layout.value.rows - y) * layout.value.cell
const P = (p: Pt) => `${px(p[0]).toFixed(2)},${py(p[1]).toFixed(2)}`
const viewBox = computed(
  () =>
    `0 0 ${Math.round(MARGIN * 2 + layout.value.cols * layout.value.cell)} ${Math.round(MARGIN * 2 + layout.value.rows * layout.value.cell)}`,
)

/** 把图形外接框平移到 origin（格坐标） */
function atOrigin(f: ShapeFigure, origin: Pt): ShapeFigure {
  const map = (p: Pt): Pt => [p[0] + origin[0], p[1] + origin[1]]
  return {
    ...f,
    polys: f.polys.map((poly) => poly.map(map)),
    lines: f.lines.map(([a, b]) => [map(a), map(b)] as [Pt, Pt]),
    dots: f.dots.map((d) => ({ p: map(d.p), r: d.r })),
    marks: f.marks.map((m) => ({ p: map(m.p), label: m.label })),
  }
}

/* ---------------- 平移 ---------------- */
/** 「换一组对应点」步进量：用于在 A→A′ / B→B′ / C→C′ 之间轮换 */
const pairStep = ref(0)
const moveVec = computed<Pt>(() => {
  const g = cells.value
  if (dirIdx.value === 0) return [g, 0]
  if (dirIdx.value === 1) return [0, -g]
  if (dirIdx.value === 2) return [-g, 0]
  return [0, g]
})
const placed = computed(() => atOrigin(figure.value, figOrigin.value))
/** 平移后的对应点位置（用于画静态箭头与标签），形状本身用 CSS 补间移动 */
const finalMarks = computed(() =>
  placed.value.marks.map((m) => ({ ...m, p: translatePoint(m.p, dirIdx.value, cells.value) })),
)
const dirWord = computed(() => ['右', '下', '左', '上'][dirIdx.value]!)
const translateVerify = computed(() => {
  const m = placed.value.marks[0]!
  return `对应点 A → A′ 相距 ${dist(m.p, finalMarks.value[0]!.p).toFixed(0)} 格，其余各组对应点也都是 ${cells.value} 格，形状和大小不变`
})

/** 每组对应点（A→A′ / B→B′ / C→C′）：当前高亮组的下标 */
const pairCount = computed(() => placed.value.marks.length)
const activePair = computed(() =>
  pairCount.value ? ((pairStep.value % pairCount.value) + pairCount.value) % pairCount.value : 0,
)
const activePairMark = computed(() => placed.value.marks[activePair.value] ?? null)
const activePairTarget = computed(() => finalMarks.value[activePair.value] ?? null)
/**
 * 这一组对应点相距的格数：直接由两组坐标算出，
 * 所以它恒等于当前平移格数 `values.grid`（这是本 Lab 的重点概念）。
 */
const activePairDist = computed(() =>
  activePairMark.value && activePairTarget.value ? dist(activePairMark.value.p, activePairTarget.value.p) : 0,
)
const pairReadout = computed(() => {
  const m = activePairMark.value
  if (!m) return ''
  return `这一组对应点（${m.label} → ${m.label}′）相距 ${activePairDist.value.toFixed(0)} 格`
})
function nextPair() {
  if (pairCount.value <= 0) return
  pairStep.value += 1
  playClick()
}

/* ---------------- 旋转 ---------------- */
const rotPivotAbs = computed<Pt>(() => ROT_PIVOT[figCode.value] ?? [4, 6])
const rotOrigin = computed<Pt>(() => [rotPivotAbs.value[0] - figure.value.pivot[0], rotPivotAbs.value[1] - figure.value.pivot[1]])
const rotPlaced = computed(() => atOrigin(figure.value, rotOrigin.value))
const markAbs = (i: number): Pt => {
  const m = figure.value.marks[i]!
  return [rotOrigin.value[0] + m.p[0], rotOrigin.value[1] + m.p[1]]
}
/** 对应点对（排除与旋转中心重合的点，例如三角形里 A 点自己） */
const rotPairs = computed(() =>
  figure.value.marks
    .map((m, i) => {
      const from = markAbs(i)
      return {
        label: m.label,
        from,
        to: rotatePoint(from, rotPivotAbs.value, visualDeg.value),
        r: dist(from, rotPivotAbs.value),
      }
    })
    .filter((pair) => pair.r > 0.05),
)
const markA = computed(() => rotPairs.value[0]!.from)
const markA2 = computed(() => rotPairs.value[0]!.to)
const rotRadius = computed(() => Math.max(...rotPairs.value.map((pair) => pair.r), 1))
const sectorRadius = computed(() => Math.min(rotRadius.value * 0.62, 3.2) * layout.value.cell)
/** 屏幕极坐标：正角 = 顺时针（屏幕 y 向下） */
function polar(center: Pt, r: number, deg: number): Pt {
  const t = (deg * Math.PI) / 180
  return [px(center[0]) + r * Math.cos(t), py(center[1]) + r * Math.sin(t)]
}
const arcPath = computed(() => {
  if (angle.value === 0) return ''
  const c = rotPivotAbs.value
  const r = sectorRadius.value
  const p0 = polar(c, r, 0)
  if (angle.value >= 360) {
    const mid = polar(c, r, 180)
    return `M ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A ${r} ${r} 0 1 1 ${mid[0].toFixed(2)} ${mid[1].toFixed(2)} A ${r} ${r} 0 1 1 ${p0[0].toFixed(2)} ${p0[1].toFixed(2)}`
  }
  const p1 = polar(c, r, visualDeg.value)
  const large = angle.value > 180 ? 1 : 0
  const sweep = clockwise.value ? 1 : 0
  return `M ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`
})
const sectorPath = computed(() => {
  if (angle.value === 0 || angle.value >= 360) return ''
  const c = rotPivotAbs.value
  const r = sectorRadius.value
  const p0 = polar(c, r, 0)
  const p1 = polar(c, r, visualDeg.value)
  const large = angle.value > 180 ? 1 : 0
  const sweep = clockwise.value ? 1 : 0
  return `M ${px(c[0]).toFixed(2)} ${py(c[1]).toFixed(2)} L ${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} Z`
})
const angleLabelPt = computed(() => {
  const p = polar(rotPivotAbs.value, sectorRadius.value * 0.75, visualDeg.value / 2)
  return { x: p[0], y: p[1] + 4 }
})
const rotateVerify = computed(() => {
  const pivotName = isTriangle.value ? 'A' : 'O'
  const detail = rotPairs.value
    .map((pair) => `${pivotName}${pair.label}′ = ${pivotName}${pair.label} = ${pair.r.toFixed(1)} 格`)
    .join('、')
  return `绕 ${pivotName} 点${clockwise.value ? '顺' : '逆'}时针旋转 ${angle.value}°：${detail}，对应点到旋转中心的距离不变`
})

/** 一步一步转：每次严格 +15°（直接写回参数，滑块同步） */
const ROT_STEP = 15
const canStepRotate = computed(() => angle.value < 360)
function stepRotate() {
  if (!canStepRotate.value) return
  props.values.angle = Math.min(360, angle.value + ROT_STEP)
  playClick()
}

/** 量一量：对应点旋转前后到旋转中心的距离（两条线段长度由坐标分别算出） */
const measuredRot = ref(false)
const rotMeasures = computed(() =>
  rotPairs.value.map((pair) => ({
    label: pair.label,
    name: `${pivotName.value}${pair.label}`,
    from: dist(pair.from, rotPivotAbs.value),
    to: dist(pair.to, rotPivotAbs.value),
  })),
)
const measureLabel = computed(() =>
  rotMeasures.value[0] ? `量一量 ${rotMeasures.value[0]!.name} 与 ${rotMeasures.value[0]!.name}′` : '量一量',
)
const measuredEqual = computed(
  () => rotMeasures.value.length > 0 && rotMeasures.value.every((m) => Math.abs(m.from - m.to) < 1e-9),
)

/* ---------------- 轴对称 ---------------- */
const foldP = ref(0)
const mirrorShown = ref(false)
const axisAt = computed(() => AXIS_BASE + sym.value)
const halfLeft = computed(() => AXIS_BASE - 1 - HALF_W)
const halfAbs = (p: Pt): Pt => [halfLeft.value + p[0], p[1]]
const mirrorPts = computed(() => HALF_PTS.map((p) => reflectPoint(halfAbs(p), axisAt.value)))
const axisPairs = computed(() =>
  [halfAbs(HALF_PTS[1]!), halfAbs(HALF_PTS[2]!)].map((p) => ({ from: p, to: reflectPoint(p, axisAt.value) })),
)
const axisDistances = computed(() =>
  axisPairs.value.map((pair) => ({ left: dist(pair.from, [axisAt.value, pair.from[1]]) })),
)
/** 以对称轴为折痕翻折：x′ = 2·axis·p + (1−2p)·x */
const foldTransform = computed(() => {
  const p = foldP.value
  return `translate(${(2 * px(axisAt.value) * p).toFixed(2)}px, 0) scale(${(1 - 2 * p).toFixed(4)}, 1)`
})
function runFold() {
  playClick()
  mirrorShown.value = true
  const state = { t: foldP.value }
  animate(state, {
    t: 1,
    duration: 1100,
    easing: 'easeInOutQuad',
    update: () => {
      foldP.value = Math.round(state.t * 1000) / 1000
    },
    complete: () => {
      foldP.value = 1
    },
  })
}
function resetFold() {
  foldP.value = 0
  mirrorShown.value = false
  playClick()
}
const axisVerify = computed(() => `对应点到对称轴的距离相等：都是 ${axisDistances.value[0]!.left.toFixed(1)} 格，对折后两边完全重合`)

/** 「标出对应点到对称轴的距离」：左右成对显示，换对称轴位置自动重算 */
const measuredAxis = ref(false)
const AXIS_PT_LABELS = ['A', 'B']
const axisPairDistances = computed(() =>
  axisPairs.value.map((pair, i) => ({
    name: AXIS_PT_LABELS[i] ?? String.fromCharCode(65 + i),
    /** 左边的点（已画的一半）到对称轴的距离 */
    left: dist(pair.from, [axisAt.value, pair.from[1]]),
    /** 右边对应点（反射得到）到对称轴的距离 */
    right: dist(pair.to, [axisAt.value, pair.to[1]]),
  })),
)
const axisPairsEqual = computed(
  () => axisPairDistances.value.length > 0 && axisPairDistances.value.every((d) => Math.abs(d.left - d.right) < 1e-9),
)
const axisMeasureText = computed(() =>
  axisPairDistances.value.map((d) => `${d.name}/${d.name}′ ${d.left.toFixed(1)} = ${d.right.toFixed(1)} 格`).join('；'),
)

const pivotName = computed(() => (isTriangle.value ? 'A' : 'O'))
</script>

<template>
  <div class="lab-wrap">
    <div class="legend-row">
      <span class="legend-chip">方格纸：每小格边长 1 格</span>
      <span v-if="isTranslate" class="legend-chip">实线：原来的图形　浅色虚线：平移后的图形</span>
      <span v-else-if="isRotate" class="legend-chip">实线：旋转后的图形　灰虚线：原来的图形</span>
      <span v-else class="legend-chip">红色虚线：对称轴　灰色虚线：补全后的图形</span>
    </div>

    <svg :viewBox="viewBox" class="w-full" role="img" aria-label="图形的运动可视化">
      <defs>
        <marker id="motion-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ui-warning, #f59e0b)" />
        </marker>
      </defs>

      <!-- 单位方格 -->
      <g class="grid-lines">
        <line v-for="i in colLines" :key="'vx' + i" :x1="px(i - 1)" :y1="py(0)" :x2="px(i - 1)" :y2="py(layout.rows)" />
        <line v-for="i in rowLines" :key="'hy' + i" :x1="px(0)" :y1="py(i - 1)" :x2="px(layout.cols)" :y2="py(i - 1)" />
      </g>

      <!-- ===================== 平移 ===================== -->
      <template v-if="isTranslate">
        <!-- 原图 -->
        <g>
          <polygon v-for="(poly, i) in placed.polys" :key="'p' + i" :points="poly.map(P).join(' ')" class="fill-original" />
          <line
            v-for="(l, i) in placed.lines"
            :key="'l' + i"
            :x1="px(l[0][0])"
            :y1="py(l[0][1])"
            :x2="px(l[1][0])"
            :y2="py(l[1][1])"
            class="stroke-original"
          />
          <circle v-for="(d, i) in placed.dots" :key="'d' + i" :cx="px(d.p[0])" :cy="py(d.p[1])" :r="d.r * layout.cell" class="fill-dot" />
        </g>
        <!-- 平移后的图形（CSS 补间） -->
        <g
          :style="{
            transform: `translate(${(moveVec[0] * layout.cell).toFixed(2)}px, ${(-moveVec[1] * layout.cell).toFixed(2)}px)`,
            transition: 'transform .55s cubic-bezier(.4,0,.2,1)',
          }"
        >
          <polygon v-for="(poly, i) in placed.polys" :key="'mp' + i" :points="poly.map(P).join(' ')" class="fill-target" />
          <line
            v-for="(l, i) in placed.lines"
            :key="'ml' + i"
            :x1="px(l[0][0])"
            :y1="py(l[0][1])"
            :x2="px(l[1][0])"
            :y2="py(l[1][1])"
            class="stroke-target"
          />
          <circle v-for="(d, i) in placed.dots" :key="'md' + i" :cx="px(d.p[0])" :cy="py(d.p[1])" :r="d.r * layout.cell" class="fill-dot-target" />
        </g>
        <!-- 对应点、箭头、格数标尺 -->
        <g v-if="cells > 0">
          <g v-for="(m, i) in placed.marks" :key="'cm' + i" :class="{ 'pair-active': i === activePair }">
            <line
              :x1="px(m.p[0])"
              :y1="py(m.p[1])"
              :x2="px(finalMarks[i]!.p[0])"
              :y2="py(finalMarks[i]!.p[1])"
              class="corr-line"
              marker-end="url(#motion-arrow)"
            />
            <circle :cx="px(m.p[0])" :cy="py(m.p[1])" r="3.5" class="pt-original" />
            <text :x="px(m.p[0]) - 10" :y="py(m.p[1]) - 7" class="mark-label">{{ m.label }}</text>
            <circle :cx="px(finalMarks[i]!.p[0])" :cy="py(finalMarks[i]!.p[1])" r="3.5" class="pt-target" />
            <text :x="px(finalMarks[i]!.p[0]) + 6" :y="py(finalMarks[i]!.p[1]) + 14" class="mark-label">{{ m.label }}′</text>
          </g>
          <text
            :x="(px(placed.marks[0]!.p[0]) + px(finalMarks[0]!.p[0])) / 2 + (dirIdx === 0 || dirIdx === 2 ? 0 : -14)"
            :y="(py(placed.marks[0]!.p[1]) + py(finalMarks[0]!.p[1])) / 2 + (dirIdx === 0 || dirIdx === 2 ? 26 : 4)"
            text-anchor="middle"
            class="corr-label"
          >
            {{ cells }} 格
          </text>
          <!-- 沿运动方向每格一条刻度，学生可以逐格数 -->
          <template v-for="k in cells" :key="'tk' + k">
            <line
              v-if="dirIdx === 0 || dirIdx === 2"
              :x1="px(placed.marks[0]!.p[0] + (dirIdx === 0 ? k - 1 : -(k - 1)))"
              :y1="py(placed.marks[0]!.p[1]) + 16"
              :x2="px(placed.marks[0]!.p[0] + (dirIdx === 0 ? k - 1 : -(k - 1)))"
              :y2="py(placed.marks[0]!.p[1]) + 24"
              class="ruler-tick"
            />
            <line
              v-else
              :x1="px(placed.marks[0]!.p[0]) - 12"
              :y1="py(placed.marks[0]!.p[1] + (dirIdx === 3 ? k - 1 : -(k - 1)))"
              :x2="px(placed.marks[0]!.p[0]) - 4"
              :y2="py(placed.marks[0]!.p[1] + (dirIdx === 3 ? k - 1 : -(k - 1)))"
              class="ruler-tick"
            />
          </template>
          <!-- 「换一组对应点」后同步写出的这一组距离 -->
          <text :x="px(layout.cols / 2)" :y="py(0) - 6" text-anchor="middle" class="pair-readout">
            {{ pairReadout }}
          </text>
        </g>
      </template>

      <!-- ===================== 旋转 ===================== -->
      <template v-else-if="isRotate">
        <!-- 原来的图形（灰虚线） -->
        <g>
          <polygon v-for="(poly, i) in rotPlaced.polys" :key="'gp' + i" :points="poly.map(P).join(' ')" class="fill-ghost" />
          <line
            v-for="(l, i) in rotPlaced.lines"
            :key="'gl' + i"
            :x1="px(l[0][0])"
            :y1="py(l[0][1])"
            :x2="px(l[1][0])"
            :y2="py(l[1][1])"
            class="stroke-ghost"
          />
        </g>
        <!-- 旋转后的图形（CSS rotate，绕旋转中心） -->
        <g
          :style="{
            transform: `rotate(${visualDeg}deg)`,
            transformOrigin: `${px(rotPivotAbs[0]).toFixed(2)}px ${py(rotPivotAbs[1]).toFixed(2)}px`,
            transition: 'transform .6s ease',
          }"
        >
          <polygon v-for="(poly, i) in rotPlaced.polys" :key="'rp' + i" :points="poly.map(P).join(' ')" class="fill-original" />
          <line
            v-for="(l, i) in rotPlaced.lines"
            :key="'rl' + i"
            :x1="px(l[0][0])"
            :y1="py(l[0][1])"
            :x2="px(l[1][0])"
            :y2="py(l[1][1])"
            class="stroke-original"
          />
          <circle v-for="(d, i) in rotPlaced.dots" :key="'rd' + i" :cx="px(d.p[0])" :cy="py(d.p[1])" :r="d.r * layout.cell" class="fill-dot" />
        </g>
        <!-- 旋转中心 -->
        <circle :cx="px(rotPivotAbs[0])" :cy="py(rotPivotAbs[1])" r="4" class="pivot" />
        <text :x="px(rotPivotAbs[0]) - 14" :y="py(rotPivotAbs[1]) + 5" class="mark-label">{{ pivotName }}</text>
        <!-- 对应点（A/A′、B/B′…）与角度扇形 -->
        <g v-if="angle > 0">
          <g v-for="pair in rotPairs" :key="'rp' + pair.label">
            <line :x1="px(rotPivotAbs[0])" :y1="py(rotPivotAbs[1])" :x2="px(pair.from[0])" :y2="py(pair.from[1])" class="corr-line" />
            <line v-if="angle > 0" :x1="px(rotPivotAbs[0])" :y1="py(rotPivotAbs[1])" :x2="px(pair.to[0])" :y2="py(pair.to[1])" class="corr-line" />
            <circle :cx="px(pair.from[0])" :cy="py(pair.from[1])" r="3.5" class="pt-original" />
            <circle :cx="px(pair.to[0])" :cy="py(pair.to[1])" r="3.5" class="pt-target" />
            <text :x="px(pair.from[0]) + 7" :y="py(pair.from[1]) + 5" class="mark-label">{{ pair.label }}</text>
            <text :x="px(pair.to[0]) + 7" :y="py(pair.to[1]) + 5" class="mark-label">{{ pair.label }}′</text>
          </g>
          <path v-if="angle < 360" :d="sectorPath" class="sector" />
          <path :d="arcPath" class="arc" marker-end="url(#motion-arrow)" />
          <text :x="angleLabelPt.x" :y="angleLabelPt.y" text-anchor="middle" class="angle-label">{{ angle }}°</text>
          <!-- 量一量：把 OA 与 OA′ 两条线段单独描出来 -->
          <g v-if="measuredRot" class="measure-layer">
            <g v-for="pair in rotPairs" :key="'ms' + pair.label">
              <line :x1="px(rotPivotAbs[0])" :y1="py(rotPivotAbs[1])" :x2="px(pair.from[0])" :y2="py(pair.from[1])" class="measure-seg" />
              <line :x1="px(rotPivotAbs[0])" :y1="py(rotPivotAbs[1])" :x2="px(pair.to[0])" :y2="py(pair.to[1])" class="measure-seg" />
            </g>
          </g>
        </g>
      </template>

      <!-- ===================== 轴对称 ===================== -->
      <template v-else>
        <line :x1="px(axisAt)" :y1="py(0)" :x2="px(axisAt)" :y2="py(layout.rows)" class="axis-line" />
        <text :x="px(axisAt) + 6" :y="py(layout.rows) + 16" class="axis-label">对称轴</text>
        <polygon v-if="mirrorShown" :points="mirrorPts.map(P).join(' ')" class="fill-target" />
        <!-- 已画的一半：对折时以对称轴为折痕翻折 -->
        <g :style="{ transform: foldTransform, transformOrigin: '0 0' }">
          <polygon :points="HALF_PTS.map((p) => P(halfAbs(p))).join(' ')" class="fill-original" />
        </g>
        <!-- 对应点到对称轴的垂线 -->
        <g v-for="(pair, i) in axisPairs" :key="'ap' + i">
          <line :x1="px(pair.from[0])" :y1="py(pair.from[1])" :x2="px(axisAt)" :y2="py(pair.from[1])" class="corr-line" />
          <line
            v-if="mirrorShown || measuredAxis"
            :x1="px(axisAt)"
            :y1="py(pair.to[1])"
            :x2="px(pair.to[0])"
            :y2="py(pair.to[1])"
            class="corr-line"
          />
          <circle :cx="px(pair.from[0])" :cy="py(pair.from[1])" r="3.5" class="pt-original" />
          <circle v-if="mirrorShown" :cx="px(pair.to[0])" :cy="py(pair.to[1])" r="3.5" class="pt-target" />
          <circle v-else-if="measuredAxis" :cx="px(pair.to[0])" :cy="py(pair.to[1])" r="3.5" class="axis-measure-pt" />
          <text v-if="!measuredAxis" :x="px(axisAt) - 40" :y="py(pair.from[1]) - 7" class="corr-label">
            {{ axisDistances[i]!.left.toFixed(1) }} 格
          </text>
          <text v-if="mirrorShown && !measuredAxis" :x="px(axisAt) + 7" :y="py(pair.to[1]) - 7" class="corr-label">
            {{ axisDistances[i]!.left.toFixed(1) }} 格
          </text>
          <!-- 「标出距离」：左右成对显示，换对称轴位置时自动重算 -->
          <template v-if="measuredAxis">
            <text :x="px(pair.from[0]) - 4" :y="py(pair.from[1]) - 7" text-anchor="end" class="axis-pair-left">
              {{ axisPairDistances[i]!.left.toFixed(1) }} 格
            </text>
            <text :x="px(pair.to[0]) + 4" :y="py(pair.to[1]) - 7" class="axis-pair-right">
              {{ axisPairDistances[i]!.right.toFixed(1) }} 格
            </text>
          </template>
        </g>
      </template>
    </svg>

    <div class="controls">
      <UButton v-if="isTranslate" size="sm" variant="outline" color="neutral" @click="nextPair" data-act>换一组对应点</UButton>
      <UButton
        v-if="isRotate"
        size="sm"
        variant="outline"
        color="neutral"
        :disabled="!canStepRotate"
        @click="stepRotate" data-act>
        一步一步转（每次 +15°）
      </UButton>
      <UButton v-if="isRotate" size="sm" variant="outline" color="neutral" @click="measuredRot = !measuredRot">
        {{ measuredRot ? '收起测量' : measureLabel }}
      </UButton>
      <UButton v-if="isAxis" size="sm" variant="outline" color="neutral" @click="measuredAxis = !measuredAxis">
        {{ measuredAxis ? '收起距离标注' : '标出对应点到对称轴的距离' }}
      </UButton>
      <UButton v-if="isAxis" size="sm" color="primary" variant="soft" icon="i-heroicons-arrows-right-left" @click="runFold">
        对折验证 · 两边完全重合
      </UButton>
      <UButton v-if="isAxis && mirrorShown" size="sm" variant="outline" color="neutral" @click="resetFold">复位</UButton>
      <span class="verify-line">
        <template v-if="isTranslate">✓ {{ translateVerify }}</template>
        <template v-else-if="isRotate">✓ {{ rotateVerify }}</template>
        <template v-else-if="measuredAxis">✓ 对应点到对称轴的距离成对相等：{{ axisMeasureText }}</template>
        <template v-else-if="mirrorShown">✓ {{ axisVerify }}</template>
        <template v-else>拖动「对称轴位置」：无论对称轴在哪，对应点到轴的距离都相等</template>
      </span>
    </div>
    <!-- 量一量 OA 与 OA′：两条线段的长度由坐标分别算出，旋转前后相等 -->
    <div v-if="isRotate && measuredRot" class="measure-panel">
      <p class="measure-title">
        {{ pivotName }} 是旋转中心：量一量对应点旋转前后到 {{ pivotName }} 的距离
      </p>
      <p v-for="m in rotMeasures" :key="'mv' + m.label" class="measure-row">
        <span class="measure-name">{{ m.name }}</span>
        <span class="measure-val measure-from">{{ m.from.toFixed(1) }} 格</span>
        <span class="measure-eq">=</span>
        <span class="measure-name">{{ m.name }}′</span>
        <span class="measure-val measure-to">{{ m.to.toFixed(1) }} 格</span>
      </p>
      <p class="measure-conclusion" :class="{ ok: measuredEqual }">
        {{ measuredEqual ? `✓ 每一组 ${pivotName}A 与 ${pivotName}A′ 都相等：旋转只改变位置，不改变到旋转中心的距离` : '对应点到旋转中心的距离不相等' }}
      </p>
    </div>
    <p class="lab-caption">{{ lab.prompt }}</p>
  </div>
</template>

<style scoped>
.lab-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
svg {
  max-width: 672px;
}
.legend-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}
.legend-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  padding: 0.15rem 0.6rem;
}
.grid-lines line {
  stroke: color-mix(in srgb, var(--ui-border) 70%, var(--ui-text-muted));
  stroke-width: 1;
}
.fill-original {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.fill-target {
  fill: color-mix(in srgb, var(--ui-primary) 22%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.6;
  stroke-dasharray: 5 4;
}
.fill-ghost {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-width: 1.6;
  stroke-dasharray: 4 3;
}
.stroke-original {
  stroke: var(--ui-primary);
  stroke-width: 2.5;
}
.stroke-target {
  stroke: var(--ui-primary);
  stroke-width: 2;
  stroke-dasharray: 5 4;
}
.stroke-ghost {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
  stroke-dasharray: 4 3;
}
.fill-dot {
  fill: var(--ui-primary);
}
.fill-dot-target {
  fill: color-mix(in srgb, var(--ui-primary) 50%, white);
}
.corr-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.6;
  stroke-dasharray: 4 3;
}
.corr-label,
.mark-label,
.angle-label,
.axis-label,
.pair-readout,
.axis-pair-left,
.axis-pair-right {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ui-text-muted);
}
/* 「换一组对应点」：当前这一组加粗、加深，其余保持浅色 */
.pair-active .corr-line {
  stroke-width: 3;
  stroke: var(--ui-error, #ef4444);
  stroke-dasharray: none;
}
.pair-active .pt-original,
.pair-active .pt-target {
  r: 4.5;
}
.pair-readout {
  fill: var(--ui-error, #ef4444);
}
.axis-pair-left,
.axis-pair-right {
  fill: var(--ui-warning, #f59e0b);
}
.axis-measure-pt {
  fill: var(--ui-warning, #f59e0b);
  stroke: var(--ui-bg);
  stroke-width: 1.5;
}
.measure-seg {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 3.2;
}
.measure-panel {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.85rem;
}
.measure-title {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.measure-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.86rem;
  font-weight: 700;
}
.measure-name {
  color: var(--ui-primary);
}
.measure-val {
  color: var(--ui-warning, #f59e0b);
}
.measure-eq {
  color: var(--ui-text-muted);
}
.measure-conclusion {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.measure-conclusion.ok {
  color: var(--ui-success, #16a34a);
}
.angle-label {
  fill: var(--ui-warning, #f59e0b);
}
.pt-original {
  fill: var(--ui-primary);
  stroke: var(--ui-bg);
  stroke-width: 1.5;
}
.pt-target {
  fill: var(--ui-warning, #f59e0b);
  stroke: var(--ui-bg);
  stroke-width: 1.5;
}
.pivot {
  fill: var(--ui-error, #ef4444);
}
.sector {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 18%, transparent);
}
.arc {
  fill: none;
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2.2;
}
.axis-line {
  stroke: var(--ui-error, #ef4444);
  stroke-width: 2;
  stroke-dasharray: 7 5;
}
.ruler-tick {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.4;
}
.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
}
.lab-caption {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 59rem;
}
</style>
