<script setup lang="ts">
/**
 * 多边形面积 Lab：平行四边形 / 三角形 / 梯形
 *
 * 证据链：情境（公园/麦田/方格纸）→ 数学模型（单位方格 + 真实比例尺）→ 图形变化过程（数方格 / 剪拼）
 *         → 算式与结论（格数换算成平方米/平方厘米）。
 *
 * 数学约束（每条都按坐标推算过）：
 * - 平行四边形：剪下竖直线右侧的直角三角形，**向左平移「一个底」的长度**后恰好补在左边的缺口上
 *   （缺口 = 矩形 [0,a]×[0,h] 内、平行四边形左侧的三角形），拼合后与底为 a、高为 h 的矩形完全重合。
 *   斜边水平偏移 s 参与坐标，但面积恒为 a×h —— 这正是课本「面积与斜边倾斜无关」的直观证据。
 * - 三角形：任意三角形与其关于一条边中点的中心对称图形拼成平行四边形，底 = a、高 = h，面积是该平行四边形的一半。
 * - 梯形：任意梯形与其关于一条腰中点的中心对称图形拼成平行四边形，底 = 上底 + 下底、高 = h。
 */
import { computed, ref } from 'vue'
import { animate } from 'animejs'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { areaOf, shapeFromCode, toFixed2, type AreaShape } from '@/lib/engine/math'
import {
  bodyCells,
  copyCells as copyCellsOf,
  cutPieceCells,
  cutShiftCells,
  gapCells as gapCellsOf,
  polygonArea,
  shapeCells,
  targetCells as targetCellsOf,
  translatePoly,
  type AreaGeomInput,
  type Pt,
} from '@/lib/labs/area'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/* ---------------- 视图常量 ---------------- */
const CELL_MAX = 46
const PLOT_W = 350
const PLOT_H = 250
const TOP_PAD = 56
const BOTTOM_PAD = 84
const LEFT_PAD = 44
const RIGHT_PAD = 26

/* ---------------- 参数与量纲 ---------------- */
const activeShape = computed<AreaShape>(() => shapeFromCode(props.values.shape))
const a = computed(() => props.values.a ?? 1)
const b = computed(() => props.values.b ?? 1)
const h = computed(() => props.values.h ?? 1)
const slant = computed(() => props.values.slant ?? 0)

/** 是否打开「找对应关系」标注（转化骨架里最容易被跳过的一步） */
const corrOn = ref(false)
function toggleCorr() {
  corrOn.value = !corrOn.value
  playClick()
}

const lengthUnit = computed(() => props.lab.units?.length ?? '格')
const cellSize = computed<number | undefined>(() => props.lab.units?.cellSize)
const cellUnitArea = computed(() => (cellSize.value ? cellSize.value * cellSize.value : undefined))
const showGrid = computed(() => cellSize.value !== undefined)

/** 每格代表的长度文案，例如「10 米」 */
const cellLegend = computed(() =>
  cellSize.value === undefined
    ? ''
    : cellSize.value === 1
      ? `每格边长 1 ${lengthUnit.value}`
      : `每格边长 ${cellSize.value} ${lengthUnit.value}（每格 ${cellUnitArea.value} 平方${lengthUnit.value}）`,
)

/** 真实面积（平方米/平方厘米…） */
const realArea = computed(() =>
  cellSize.value === undefined ? undefined : areaOf(activeShape.value, { a: a.value, b: b.value, h: h.value }) * cellSize.value * cellSize.value,
)
const areaText = computed(() => {
  const s = area.value
  if (realArea.value === undefined || cellSize.value === 1) return `${s} 平方${lengthUnit.value}`
  return `${s} 格 = ${realArea.value} 平方${lengthUnit.value}`
})

/* ---------------- 单位方格几何（格坐标，y 向上） ---------------- */
/** 平行四边形斜边水平偏移（格） */
const s = computed(() => Math.min(slant.value, Math.max(0, a.value - 0.5)))

const geom = computed<AreaGeomInput>(() => ({ a: a.value, b: b.value, h: h.value, slant: slant.value }))

const polyCells = computed<Pt[]>(() => shapeCells(activeShape.value, geom.value))
/** 剪切/复制后拼成的目标图形（格坐标） */
const targetCells = computed<Pt[]>(() => targetCellsOf(activeShape.value, geom.value))
/** 复制件（与原件完全一样的图形）在拼合后的位置 */
const copyCells = computed<Pt[]>(() => copyCellsOf(activeShape.value, geom.value))
/** 平行四边形剪下的直角三角形与左侧缺口 */
const cutPiece = computed<Pt[]>(() => cutPieceCells(geom.value))
const gapCells = computed<Pt[]>(() => gapCellsOf(geom.value))
/** 剪拼后留在原位的部分 */
const bodyCellsRef = computed<Pt[]>(() => bodyCells(geom.value))
/** 剪下部分向左平移的格数（= 底 a），平移后与左侧缺口完全重合 */
const cutShiftCellsValue = computed(() => -cutShiftCells(geom.value))

/* ---------------- 比例尺：格坐标 → 像素 ---------------- */
const bounds = computed(() => {
  const all = [...polyCells.value, ...targetCells.value]
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  return { minX: Math.min(...xs, 0), maxX: Math.max(...xs, a.value), maxY: Math.max(...ys, h.value) }
})
const cell = computed(() => {
  const { minX, maxX, maxY } = bounds.value
  const w = Math.max(1, maxX - minX)
  const hh = Math.max(1, maxY)
  return Math.min(CELL_MAX, PLOT_W / w, PLOT_H / hh)
})
/** 视口随图形大小自适应：图形始终居中占满，不留大片空白 */
const originX = computed(() => LEFT_PAD)
const originY = computed(() => TOP_PAD + bounds.value.maxY * cell.value)
const vbW = computed(() => Math.round(originX.value + (bounds.value.maxX - bounds.value.minX) * cell.value + RIGHT_PAD))
/** 打开对应关系标注时，底部要多留出一行文字的高度（对应关系的文字说明） */
const bottomPad = computed(() => (corrOn.value ? 132 : BOTTOM_PAD))
const vbH = computed(() => Math.round(originY.value + bottomPad.value))
const px = (x: number) => originX.value + (x - bounds.value.minX) * cell.value
const py = (y: number) => originY.value - y * cell.value
const pts = (poly: Pt[]) => poly.map(([x, y]) => `${px(x)},${py(y)}`).join(' ')
/** 多边形重心的屏幕坐标（用于 ① ② 标注） */
function centroid(poly: Pt[]): [number, number] {
  const cx = poly.reduce((sum, p) => sum + p[0], 0) / poly.length
  const cy = poly.reduce((sum, p) => sum + p[1], 0) / poly.length
  return [px(cx), py(cy) + 4]
}

/* ---------------- 单位方格 ---------------- */
const gridX = computed(() => {
  const from = Math.floor(bounds.value.minX) - 1
  const to = Math.ceil(bounds.value.maxX) + 1
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
})
const gridY = computed(() => {
  const to = Math.ceil(bounds.value.maxY) + 1
  return Array.from({ length: to + 1 }, (_, i) => i)
})

/* ---------------- 数方格：整格 / 不满整格 ---------------- */
function pointInPoly(x: number, y: number, poly: Pt[]): boolean {
  let sign = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!
    const [x2, y2] = poly[(i + 1) % poly.length]!
    const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
    if (cross === 0) continue
    const sg = cross > 0 ? 1 : -1
    if (sign === 0) sign = sg
    else if (sg !== sign) return false
  }
  return true
}
function segIntersectsRect(p1: Pt, p2: Pt, x: number, y: number): boolean {
  // 线段与单元格四条边是否相交（仅需布尔判断，用参数化求交）
  const edges: [Pt, Pt][] = [
    [
      [x, y],
      [x + 1, y],
    ],
    [
      [x + 1, y],
      [x + 1, y + 1],
    ],
    [
      [x + 1, y + 1],
      [x, y + 1],
    ],
    [
      [x, y + 1],
      [x, y],
    ],
  ]
  for (const [q1, q2] of edges) {
    const d1x = p2[0] - p1[0]
    const d1y = p2[1] - p1[1]
    const d2x = q2[0] - q1[0]
    const d2y = q2[1] - q1[1]
    const den = d1x * d2y - d1y * d2x
    if (Math.abs(den) < 1e-9) continue
    const t = ((q1[0] - p1[0]) * d2y - (q1[1] - p1[1]) * d2x) / den
    const u = ((q1[0] - p1[0]) * d1y - (q1[1] - p1[1]) * d1x) / den
    if (t >= -1e-9 && t <= 1 + 1e-9 && u >= -1e-9 && u <= 1 + 1e-9) return true
  }
  return false
}
/** 每个单位方格的分类：full（四个顶点都在图形内）/ partial（与图形相交但不完整）/ outside */
const cells = computed(() => {
  // 只有方格模型才统计方格（真实米制图形没有单位方格）
  if (!showGrid.value) return []
  const poly = polyCells.value
  const out: { x: number; y: number; kind: 'full' | 'partial' }[] = []
  const from = Math.floor(bounds.value.minX)
  const to = Math.ceil(bounds.value.maxX)
  const top = Math.ceil(bounds.value.maxY)
  for (let x = from; x < to; x++) {
    for (let y = 0; y < top; y++) {
      const corners: Pt[] = [
        [x, y],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y + 1],
      ]
      const insideCount = corners.filter(([cx, cy]) => pointInPoly(cx, cy, poly)).length
      if (insideCount === 4) {
        out.push({ x, y, kind: 'full' })
        continue
      }
      const touches =
        insideCount > 0 ||
        poly.some(([vx, vy]) => vx >= x && vx <= x + 1 && vy >= y && vy <= y + 1) ||
        poly.some((p1, i) => segIntersectsRect(p1, poly[(i + 1) % poly.length]!, x, y))
      if (touches) out.push({ x, y, kind: 'partial' })
    }
  }
  return out
})
const fullCells = computed(() => cells.value.filter((c) => c.kind === 'full'))
const area = computed(() => areaOf(activeShape.value, { a: a.value, b: b.value, h: h.value }))
/** 由图形顶点直接算出的面积，用来校验公式与图形一致（数方格面板显示它） */
const areaFromShape = computed(() => polygonArea(polyCells.value))
const partialArea = computed(() => Math.round((areaFromShape.value - fullCells.value.length) * 100) / 100)

/** 剪下的三角形平移 a 格后是否与左侧缺口完全重合（坐标级校验） */
const pieceLandsInGap = computed(() => {
  const landed = translatePoly(cutPiece.value, cutShiftCells(geom.value))
  const key = (p: Pt) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`
  return (
    landed.map(key).sort().join('|') ===
    gapCells.value
      .map(key)
      .sort()
      .join('|')
  )
})
/** 两个完全一样的图形拼成的平行四边形面积 = 目标图形面积（坐标级校验） */
const copyJoinOk = computed(() => {
  const sum = polygonArea(polyCells.value) + polygonArea(copyCells.value)
  return Math.abs(sum - polygonArea(targetCells.value)) < 1e-6
})
const copyJoinText = computed(() =>
  activeShape.value === 'triangle'
    ? `拼成的平行四边形：底 = 三角形的底 = ${a.value}，高 = ${h.value}，面积 = ${a.value * h.value} = 2 × ${(a.value * h.value) / 2}`
    : `拼成的平行四边形：底 = 上底 + 下底 = ${a.value} + ${b.value} = ${a.value + b.value}，高 = ${h.value}，面积 = ${(a.value + b.value) * h.value} = 2 × ${((a.value + b.value) * h.value) / 2}`,
)

const counting = ref(false)
function toggleCounting() {
  counting.value = !counting.value
  playClick()
}
/* ---------------- 剪拼动画 ---------------- */
/** 平行四边形剪下部分的水平位移（格，负值向左） */
const cutShift = ref(0)
const animating = ref(false)
/** 是否已剪拼到位（平行四边形）或已倍拼对齐（三角形/梯形） */
const placed = ref(false)
/**
 * 倍拼步数：0 未开始 / 1 第二个图形已放在旁边（还没对齐）/ 2 已旋转 180° 并平移对齐
 * 课本的倍拼是两步：先放第二个完全一样的图形，再旋转、平移让它拼成平行四边形。
 */
const copyStep = ref(0)
/** 对齐进度：0 = 未对齐（偏移 + 转了 180°），1 = 完全重合 */
const copyT = ref(0)
const copyDx = computed(() => Math.round(26 * (1 - copyT.value)))
const copyDy = computed(() => Math.round(-20 * (1 - copyT.value)))
const copyRotate = computed(() => Math.round((1 - copyT.value) * 180))

const cut = computed(() => {
  const av = a.value
  const hv = h.value
  const sv = s.value
  return {
    body: pts(bodyCellsRef.value),
    piece: pts(cutPiece.value),
    gap: pts(gapCells.value),
    target: pts(targetCells.value),
    pieceTransform: `translate(${(-cutShift.value * cell.value).toFixed(1)} 0)`,
    canCut: sv > 0 && av > 0 && hv > 0,
    /** 剪下部分平移后是否正好落在缺口上（供测试与提示使用） */
    lands: Math.abs(cutShift.value - a.value) < 0.01,
  }
})

function runCut() {
  if (animating.value) return
  if (activeShape.value === 'parallelogram' && !cut.value.canCut) return
  playClick()
  if (activeShape.value === 'parallelogram') {
    animating.value = true
    const dist = a.value - cutShift.value
    if (dist <= 0) {
      cutShift.value = a.value
      placed.value = true
      animating.value = false
      return
    }
    animate(cutShift, {
      value: a.value,
      duration: 950,
      easing: 'easeInOutQuad',
      update: () => {
        cutShift.value = Math.round(cutShift.value * 100) / 100
      },
      complete: () => {
        cutShift.value = a.value
        animating.value = false
        placed.value = true
      },
    })
    return
  }
  // 倍拼第一步：先把第二个完全一样的图形放到旁边（还没有对齐）
  if (copyStep.value === 0) {
    copyStep.value = 1
    copyT.value = 0
    return
  }
  // 倍拼第二步：旋转 180° 再平移，与①拼成平行四边形
  if (copyStep.value === 1) {
    animating.value = true
    const state = { t: copyT.value }
    animate(state, {
      t: 1,
      duration: 850,
      easing: 'easeOutCubic',
      update: () => {
        copyT.value = Math.round(state.t * 100) / 100
      },
      complete: () => {
        copyT.value = 1
        copyStep.value = 2
        animating.value = false
        placed.value = true
      },
    })
  }
}

function resetCut() {
  cutShift.value = 0
  copyT.value = 0
  copyStep.value = 0
  placed.value = false
  playClick()
}

/* ---------------- 尺寸标注 ---------------- */
/** 高的落脚点（格坐标 x） */
const heightFoot = computed(() => {
  if (activeShape.value === 'parallelogram') return s.value
  if (activeShape.value === 'triangle') return a.value * 0.35
  return 0
})
/** 底边左右端点（格坐标） */
const baseSpan = computed<[number, number]>(() => {
  if (activeShape.value === 'parallelogram') return [0, a.value]
  if (activeShape.value === 'triangle') return [0, a.value]
  return [0, b.value]
})
const label = (v: number) => `${v} ${lengthUnit.value}`
/** 每格代表的真实长度换算文案 */
const realLabel = (v: number) =>
  cellSize.value && cellSize.value !== 1 ? `${v * cellSize.value} ${lengthUnit.value}` : undefined
function dimText(name: string, v: number) {
  const real = realLabel(v)
  return real ? `${name} = ${v} 格（${real}）` : `${name} = ${label(v)}`
}

/** 无方格时给出比例尺：取一个「整十整百」长度，画成约 100px 的标尺 */
const scaleBarLen = computed(() => {
  const candidates = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
  let best = candidates[0]!
  for (const c of candidates) if (c * cell.value <= 120) best = c
  return best
})

/* ---------------- 推导链 ---------------- */
const derivation = computed(() => {
  const av = a.value
  const bv = b.value
  const hv = h.value
  const sv = area.value
  if (activeShape.value === 'parallelogram') {
    const tail = realArea.value !== undefined && cellSize.value !== 1 ? [`S = ${sv} × ${cellUnitArea.value} = ${realArea.value} 平方米`] : []
    return [`转化成长方形：长 = 底 ${av}，宽 = 高 ${hv}`, `S = ${av} × ${hv} = ${sv} 格`, ...tail]
  }
  if (activeShape.value === 'triangle') {
    return [`两个完全一样的三角形：${av} × ${hv} = ${av * hv}`, `一个三角形：${av * hv} ÷ 2 = ${sv}`]
  }
  return [`两个完全一样的梯形：(${av} + ${bv}) × ${hv} = ${(av + bv) * hv}`, `一个梯形：${(av + bv) * hv} ÷ 2 = ${sv}`]
})

/* ---------------- 找对应关系（转化骨架的第 4 步） ---------------- */
/**
 * 一条对应关系 = 源图形上的特征线段 + 拼成图形上的特征线段 + 它们之间的虚线连线 + 同色文字标注。
 * 坐标统一转成像素，模板直接画。
 */
function corrPair(
  key: 'base' | 'height',
  src: [Pt, Pt],
  tgt: [Pt, Pt],
  text: string,
  labelDx = 0,
  labelDy = 0,
) {
  const sm: [number, number] = [(src[0][0] + src[1][0]) / 2, (src[0][1] + src[1][1]) / 2]
  const tm: [number, number] = [(tgt[0][0] + tgt[1][0]) / 2, (tgt[0][1] + tgt[1][1]) / 2]
  return {
    key,
    text,
    src: { x1: px(src[0][0]), y1: py(src[0][1]), x2: px(src[1][0]), y2: py(src[1][1]) },
    tgt: { x1: px(tgt[0][0]), y1: py(tgt[0][1]), x2: px(tgt[1][0]), y2: py(tgt[1][1]) },
    link: { x1: px(sm[0]), y1: py(sm[1]), x2: px(tm[0]), y2: py(tm[1]) },
    label: { x: px(sm[0]) + labelDx, y: py(sm[1]) + labelDy, text },
  }
}

/** 底↔拼成图形的底、高↔拼成图形的高（梯形还要把「上底＋下底」标出来） */
const corrPairs = computed(() => {
  const av = a.value
  const bv = b.value
  const hv = h.value
  const t = targetCells.value
  if (activeShape.value === 'parallelogram') {
    return [
      corrPair('base', [[0, 0], [av, 0]], [[0, hv], [av, hv]], `底 ${av} = 长 ${av}`, 0, 58),
      corrPair('height', [[heightFoot.value, 0], [heightFoot.value, hv]], [[0, 0], [0, hv]], `高 ${hv} = 宽 ${hv}`, 46, -12),
    ]
  }
  if (activeShape.value === 'triangle') {
    const foot = (t[0]![0] + t[1]![0]) / 2
    return [
      corrPair('base', [[0, 0], [av, 0]], [t[3]!, t[2]!], `底 ${av} = 底 ${av}`, 0, 58),
      corrPair('height', [[heightFoot.value, 0], [heightFoot.value, hv]], [[foot, 0], [foot, hv]], `高 ${hv} = 高 ${hv}`, 46, -12),
    ]
  }
  const foot = (t[0]![0] + t[1]![0]) / 2
  return [
    corrPair('base', [[0, 0], [bv, 0]], [[t[0]![0], 0], [t[1]![0], 0]], `下底 ${bv} + 上底 ${av} = ${av + bv}`, 0, 58),
    corrPair('height', [[0, 0], [0, hv]], [[foot, 0], [foot, hv]], `高 ${hv} = 高 ${hv}`, 46, -12),
  ]
})

/** 梯形：在拼成的平行四边形的底上再标出「上底」那一段 */
const corrUpper = computed(() => {
  if (activeShape.value !== 'trapezoid') return null
  const av = a.value
  const bv = b.value
  return {
    x1: px(bv),
    y1: py(0),
    x2: px(av + bv),
    y2: py(0),
    lx: px(bv + av / 2),
    ly: py(0) + 78,
  }
})

/** 拼成图形（平行四边形 / 长方形）的底、高、面积，与单图形面积对照 */
const joinBase = computed(() => (activeShape.value === 'trapezoid' ? a.value + b.value : a.value))
const joinHeight = computed(() => h.value)
const joinArea = computed(() => joinBase.value * joinHeight.value)
const singleArea = computed(() => area.value)

const corrShort = computed(() => {
  if (activeShape.value === 'parallelogram') return `长方形的长 = 底 ${a.value}，宽 = 高 ${h.value}`
  if (activeShape.value === 'triangle') return `平行四边形的底 = 三角形的底 ${a.value}，高 = 三角形的高 ${h.value}`
  return `平行四边形的底 = 上底 + 下底 = ${a.value} + ${b.value} = ${a.value + b.value}，高 = 梯形的高 ${h.value}`
})

const corrVerify = computed(() => {
  const u = lengthUnit.value
  if (activeShape.value === 'parallelogram') {
    return `✓ 找对应：长方形的长 = 平行四边形的底 = ${a.value} ${u}；长方形的宽 = 平行四边形的高 = ${h.value} ${u}`
  }
  if (activeShape.value === 'triangle') {
    return `✓ 找对应：平行四边形的底 = 三角形的底 = ${a.value} ${u}；平行四边形的高 = 三角形的高 = ${h.value} ${u}；拼成图形的面积 ${joinArea.value} = 2 × 三角形面积 ${singleArea.value}`
  }
  return `✓ 找对应：平行四边形的底 = 上底 + 下底 = ${a.value} + ${b.value} = ${joinBase.value} ${u}；平行四边形的高 = 梯形的高 = ${h.value} ${u}；拼成图形的面积 ${joinArea.value} = 2 × 梯形面积 ${singleArea.value}`
})

/* ---------------- 单位与进率（麦田：米 → 公顷） ---------------- */
/** 真实面积：有每格边长就按格换算；米制 Lab（无方格）直接就是平方米 */
const metricArea = computed(() => {
  if (cellSize.value !== undefined) return area.value * cellSize.value * cellSize.value
  return lengthUnit.value === '米' ? area.value : undefined
})
const hectareHint = computed(() =>
  metricArea.value === undefined || lengthUnit.value !== '米' || showGrid.value
    ? ''
    : `${metricArea.value} 平方米 = ${toFixed2(metricArea.value / 10000)} 公顷（1 公顷 = 10000 平方米）`,
)
</script>

<template>
  <div class="area-wrap">
    <div class="legend-row">
      <span class="legend-chip">图形：{{ activeShape === 'parallelogram' ? '平行四边形' : activeShape === 'triangle' ? '三角形' : '梯形' }}</span>
      <span v-if="showGrid" class="legend-chip">{{ cellLegend }}</span>
      <span v-else class="legend-chip">图上按同一比例尺绘制，单位：{{ lengthUnit }}</span>
    </div>

    <svg :viewBox="`0 0 ${vbW} ${vbH}`" class="w-full" role="img" aria-label="多边形面积可视化">
      <!-- 单位方格：数方格模式下高亮整格与不满整格 -->
      <g v-if="showGrid" class="grid-lines">
        <line v-for="gx in gridX" :key="'vx' + gx" :x1="px(gx)" :y1="py(gridY[gridY.length - 1]!)" :x2="px(gx)" :y2="py(0)" />
        <line v-for="gy in gridY" :key="'hy' + gy" :x1="px(gridX[0]!)" :y1="py(gy)" :x2="px(gridX[gridX.length - 1]!)" :y2="py(gy)" />
      </g>
      <g v-if="showGrid && counting">
        <rect
          v-for="c in cells"
          :key="`c${c.x}-${c.y}`"
          :x="px(c.x)"
          :y="py(c.y + 1)"
          :width="cell"
          :height="cell"
          :class="c.kind === 'full' ? 'cell-full' : 'cell-partial'"
        />
      </g>

      <!-- 目标图形轮廓（拼合后应得到的图形） -->
      <polygon :points="cut.target" class="target-ghost" />

      <!-- ===== 平行四边形：剪下右侧直角三角形，向左平移一个底，补上左侧缺口 ===== -->
      <template v-if="activeShape === 'parallelogram'">
        <polygon :points="cut.body" class="shape-fill" />
        <polygon v-if="counting" :points="cut.gap" class="gap-ghost" />
        <polygon
          v-if="cut.canCut"
          :points="cut.piece"
          class="cut-solid"
          :transform="cut.pieceTransform"
        />
        <polygon v-if="counting && cut.canCut" :points="cut.piece" class="cut-outline" />
        <!-- 剪开线 -->
        <line v-if="cut.canCut" :x1="px(a)" :y1="py(0)" :x2="px(a)" :y2="py(h)" class="cut-line" />
      </template>

      <!-- ===== 三角形 / 梯形：完全一样的复制件拼过来（先放旁边，再旋转平移对齐） ===== -->
      <template v-else>
        <polygon :points="pts(polyCells)" class="shape-fill" />
        <polygon
          :points="pts(copyCells)"
          class="cut-solid"
          :data-copy-step="copyStep"
          :style="{
            opacity: copyStep >= 1 ? 1 : 0,
            transform: `translate(${copyDx}px, ${copyDy}px) rotate(${copyRotate}deg)`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
          }"
        />
        <text :x="centroid(polyCells)[0]" :y="centroid(polyCells)[1]" text-anchor="middle" class="piece-no">①</text>
        <text
          v-if="copyStep >= 1"
          :x="centroid(copyCells)[0]"
          :y="centroid(copyCells)[1]"
          text-anchor="middle"
          class="piece-no copy"
        >
          ②
        </text>
      </template>

      <!-- 底边尺寸线 -->
      <g class="dim-line">
        <line :x1="px(baseSpan[0])" :y1="py(0) + 18" :x2="px(baseSpan[1])" :y2="py(0) + 18" />
        <line :x1="px(baseSpan[0])" :y1="py(0) + 12" :x2="px(baseSpan[0])" :y2="py(0) + 24" />
        <line :x1="px(baseSpan[1])" :y1="py(0) + 12" :x2="px(baseSpan[1])" :y2="py(0) + 24" />
      </g>
      <text :x="(px(baseSpan[0]) + px(baseSpan[1])) / 2" :y="py(0) + 38" text-anchor="middle" class="dim-label">
        {{ activeShape === 'trapezoid' ? dimText('下底 b', b) : dimText('底 a', a) }}
      </text>
      <!-- 上底尺寸线（画在上方，避免与图形标注重叠） -->
      <template v-if="activeShape === 'trapezoid'">
        <g class="dim-line">
          <line :x1="px((b - a) / 2)" :y1="py(h) - 20" :x2="px((a + b) / 2)" :y2="py(h) - 20" />
          <line :x1="px((b - a) / 2)" :y1="py(h) - 26" :x2="px((b - a) / 2)" :y2="py(h) - 14" />
          <line :x1="px((a + b) / 2)" :y1="py(h) - 26" :x2="px((a + b) / 2)" :y2="py(h) - 14" />
        </g>
        <text :x="px(b / 2)" :y="py(h) - 28" text-anchor="middle" class="dim-label">{{ dimText('上底 a', a) }}</text>
      </template>

      <!-- 高：虚线 + 直角标记 -->
      <g>
        <line :x1="px(heightFoot)" :y1="py(0)" :x2="px(heightFoot)" :y2="py(h) - (activeShape === 'triangle' ? 14 : 2)" class="height-line" />
        <path
          :d="`M ${px(heightFoot)} ${py(0) - 10} h 10 v 10`"
          class="right-angle"
        />
      </g>
      <text
        :x="px(heightFoot) + 8"
        :y="py(h / 2)"
        class="dim-label"
      >
        {{ dimText('高 h', h) }}
      </text>

      <!-- 平行四边形斜边偏移标注 -->
      <template v-if="activeShape === 'parallelogram' && s > 0">
        <line :x1="px(0)" :y1="py(h) - 14" :x2="px(s)" :y2="py(h) - 14" class="offset-line" />
        <text :x="px(s) + 4" :y="py(h) - 18" class="offset-label">斜边偏移 {{ s }} 格</text>
      </template>

      <!-- ===== 找对应关系：同色标注 + 虚线连线（底↔底、高↔高；梯形标出「上底+下底」） ===== -->
      <g v-if="corrOn" class="corr-group" aria-label="对应关系">
        <g v-for="c in corrPairs" :key="c.key">
          <line
            :x1="c.src.x1"
            :y1="c.src.y1"
            :x2="c.src.x2"
            :y2="c.src.y2"
            class="corr-src"
            :class="`corr-${c.key}`"
            :data-pair="c.key"
          />
          <line
            :x1="c.tgt.x1"
            :y1="c.tgt.y1"
            :x2="c.tgt.x2"
            :y2="c.tgt.y2"
            class="corr-tgt"
            :class="`corr-${c.key}`"
            :data-pair="c.key"
          />
          <line
            :x1="c.link.x1"
            :y1="c.link.y1"
            :x2="c.link.x2"
            :y2="c.link.y2"
            class="corr-link"
            :class="`corr-${c.key}`"
            :data-pair="c.key"
          />
          <text
            :x="c.label.x"
            :y="c.label.y"
            text-anchor="middle"
            class="corr-label"
            :class="`corr-${c.key}`"
            :data-pair="c.key"
          >
            {{ c.label.text }}
          </text>
        </g>
        <template v-if="corrUpper">
          <line
            :x1="corrUpper.x1"
            :y1="corrUpper.y1"
            :x2="corrUpper.x2"
            :y2="corrUpper.y2"
            class="corr-src corr-base"
            data-pair="base-add"
          />
          <text
            :x="corrUpper.lx"
            :y="corrUpper.ly"
            text-anchor="middle"
            class="corr-label corr-base"
            data-pair="base-add"
          >
            上底 {{ a }}
          </text>
        </template>
      </g>

      <!-- 无方格时给出比例尺 -->
      <g v-if="!showGrid" class="scale-bar">
        <line :x1="originX" :y1="vbH - 30" :x2="originX + cell * scaleBarLen" :y2="vbH - 30" />
        <line :x1="originX" :y1="vbH - 35" :x2="originX" :y2="vbH - 25" />
        <line :x1="originX + cell * scaleBarLen" :y1="vbH - 35" :x2="originX + cell * scaleBarLen" :y2="vbH - 25" />
        <text :x="originX" :y="vbH - 10" class="scale-text">比例尺：这一段表示 {{ scaleBarLen }} {{ lengthUnit }}</text>
      </g>
    </svg>

    <div class="controls">
      <UButton
        v-if="showGrid"
        size="sm"
        color="primary"
        variant="soft"
        icon="i-heroicons-table-cells"
        @click="toggleCounting"
      >
        {{ counting ? '隐藏方格计数' : '数一数方格' }}
      </UButton>
      <UButton
        size="sm"
        color="primary"
        variant="soft"
        icon="i-heroicons-cursor-arrow-rays"
        :disabled="
          animating ||
          (activeShape === 'parallelogram' ? !cut.canCut : copyStep === 2)
        "
        @click="runCut"
      >
        {{
          activeShape === 'parallelogram'
            ? cut.canCut
              ? '剪一剪 · 平移拼成长方形'
              : '已是长方形，无需剪拼'
            : copyStep === 0
              ? '拼一拼 · 先放第二个图形'
              : copyStep === 1
                ? '旋转平移 · 对齐拼成平行四边形'
                : '已拼成平行四边形'
        }}
      </UButton>
      <UButton
        size="sm"
        color="primary"
        variant="soft"
        icon="i-heroicons-arrows-right-left"
        @click="toggleCorr"
      >
        {{ corrOn ? '隐藏对应关系' : '显示对应关系' }}
      </UButton>
      <UButton
        v-if="placed || cutShift > 0 || counting || copyStep > 0"
        size="sm"
        variant="outline"
        color="neutral"
        @click="resetCut"
      >
        复位
      </UButton>
      <span class="area-value">S = <strong>{{ area }}</strong>（{{ areaText }}）</span>
    </div>

    <div v-if="counting" class="count-panel" aria-label="方格计数结果">
      <span class="count-chip">整格 <strong>{{ fullCells.length }}</strong> 个</span>
      <span class="count-chip">不满整格的部分合起来 <strong>{{ partialArea }}</strong> 格</span>
      <span class="count-chip result">一共 {{ areaFromShape }} 格{{ realArea !== undefined && cellSize !== 1 ? ` = ${realArea} 平方${lengthUnit}` : ` 平方${lengthUnit}` }}</span>
    </div>

    <p v-if="copyStep === 1" class="copy-step-hint">
      ② 号图形先放在旁边：它和①完全一样，但转了 180°、还没有对齐 —— 下一步旋转平移，把它拼过来
    </p>
    <p v-if="placed && activeShape === 'parallelogram' && pieceLandsInGap" class="verify-line">
      ✓ 剪下的三角形向左平移 {{ a }} 格，正好补上左边的缺口，拼成长 {{ a }}、宽 {{ h }} 的长方形
    </p>
    <p v-else-if="placed && copyJoinOk" class="verify-line">✓ {{ copyJoinText }}，是两个完全一样的{{ activeShape === 'triangle' ? '三角形' : '梯形' }}面积的和</p>

    <p
      v-if="corrOn"
      class="corr-verify"
      aria-label="对应关系说明"
      :data-join-base="joinBase"
      :data-join-height="joinHeight"
      :data-join-area="joinArea"
      :data-single-area="singleArea"
    >
      {{ corrVerify }}
    </p>
    <p v-if="hectareHint" class="unit-rate">{{ hectareHint }}</p>

    <div class="derive-row" aria-label="面积推导">
      <span v-for="(item, i) in derivation" :key="item" class="derive-chip" :class="{ result: i === derivation.length - 1 }">
        {{ item }}
      </span>
      <span v-if="corrOn" class="derive-chip corr">找对应：{{ corrShort }}</span>
    </div>
  </div>
</template>

<style scoped>
.area-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
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
.cell-full {
  fill: color-mix(in srgb, var(--ui-primary) 26%, transparent);
  stroke: none;
}
.cell-partial {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 30%, transparent);
  stroke: none;
}
.target-ghost {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
}
.shape-fill {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.gap-ghost {
  fill: none;
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.cut-solid {
  fill: color-mix(in srgb, var(--ui-primary) 70%, white);
  stroke: var(--ui-primary);
  stroke-width: 2;
  transition: opacity 0.4s, transform 0.05s linear;
}
.cut-outline {
  fill: none;
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.cut-line {
  stroke: var(--ui-error, #ef4444);
  stroke-width: 1.6;
  stroke-dasharray: 5 3;
}
.dim-line line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
.dim-label,
.offset-label,
.scale-text {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.offset-line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
.height-line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.3;
  stroke-dasharray: 4 3;
}
.right-angle {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
.piece-no {
  font-size: 17px;
  font-weight: 800;
  fill: var(--ui-text-highlighted);
  paint-order: stroke;
  stroke: var(--ui-bg);
  stroke-width: 4px;
}
.piece-no.copy {
  fill: var(--ui-primary);
}
.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.area-value {
  font-size: 0.95rem;
  color: var(--ui-text-highlighted);
}
.area-value strong {
  color: var(--ui-primary);
  font-size: 1.15rem;
}
.count-panel {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.count-chip {
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.85rem;
  padding: 0.2rem 0.6rem;
}
.count-chip.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
  color: var(--ui-primary);
  font-weight: 700;
}
.derive-row {
  display: flex;
  gap: 0.45rem;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 44rem;
}
.verify-line {
  margin: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
}
.copy-step-hint {
  margin: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 14%, var(--ui-bg));
  color: #b45309;
  font-size: 0.84rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  max-width: 42rem;
  text-align: center;
}
.corr-verify {
  margin: 0;
  border-radius: 8px;
  background: color-mix(in srgb, #2563eb 12%, var(--ui-bg));
  color: #1d4ed8;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  max-width: 44rem;
  text-align: center;
}
.unit-rate {
  margin: 0;
  border-radius: 8px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.84rem;
  font-weight: 700;
  padding: 0.28rem 0.75rem;
}
.derive-chip.corr {
  border-color: #2563eb;
  color: #1d4ed8;
  background: color-mix(in srgb, #2563eb 10%, var(--ui-bg));
}
.corr-src,
.corr-tgt,
.corr-link {
  fill: none;
  stroke-width: 1.8;
}
.corr-src {
  stroke-dasharray: 7 4;
}
.corr-tgt {
  stroke-dasharray: 3 3;
}
.corr-link {
  stroke-width: 1.3;
  stroke-dasharray: 4 4;
}
.corr-base {
  stroke: #2563eb;
}
.corr-height {
  stroke: #d97706;
}
.corr-label {
  font-size: 11px;
  font-weight: 800;
  paint-order: stroke;
  stroke: var(--ui-bg);
  stroke-width: 3px;
}
.corr-label.corr-base {
  fill: #2563eb;
  stroke: var(--ui-bg);
}
.corr-label.corr-height {
  fill: #d97706;
  stroke: var(--ui-bg);
}
.derive-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.28rem 0.7rem;
}
.derive-chip.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
  color: var(--ui-primary);
}
.scale-bar line {
  stroke: var(--ui-text-muted);
  stroke-width: 1.2;
}
</style>
