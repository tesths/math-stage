/**
 * 多边形面积「剪拼」的纯几何（格坐标，y 向上）。
 *
 * 单独成模块的目的：剪拼动画的坐标可以直接被单元测试用鞋带公式验证，
 * 保证「剪下的图形平移后确实补上了缺口」「两个完全一样的图形确实拼成了平行四边形」，
 * 而不是只靠肉眼看动画。
 *
 * 约定：a = 底（梯形为上底）、b = 下底、h = 高、slant = 平行四边形斜边水平偏移（单位：格）。
 */
import type { AreaShape } from '@/lib/engine/math'

export type Pt = [number, number]

export interface AreaGeomInput {
  a: number
  b: number
  h: number
  slant: number
}

/** 图形顶点（格坐标，逆时针或顺时针均可） */
export function shapeCells(shape: AreaShape, { a, b, h, slant }: AreaGeomInput): Pt[] {
  if (shape === 'parallelogram') {
    const s = Math.min(slant, Math.max(0, a - 0.5))
    return [
      [0, 0],
      [a, 0],
      [a + s, h],
      [s, h],
    ]
  }
  if (shape === 'triangle') {
    // 一般三角形：顶点水平偏移 0.35a，拼出来的才是平行四边形（而不是长方形）
    return [
      [0, 0],
      [a, 0],
      [a * 0.35, h],
    ]
  }
  // 等腰梯形：上下底中点对齐
  return [
    [0, 0],
    [b, 0],
    [(a + b) / 2, h],
    [(b - a) / 2, h],
  ]
}

/** 关于中点 M 作中心对称 */
function pointReflect(p: Pt, m: Pt): Pt {
  return [2 * m[0] - p[0], 2 * m[1] - p[1]]
}

/**
 * 拼合后得到的目标图形：
 * - 平行四边形：底 a、高 h 的长方形
 * - 三角形/梯形：底为 a（梯形为 a+b）、高为 h 的平行四边形
 */
export function targetCells(shape: AreaShape, g: AreaGeomInput): Pt[] {
  const { a, b, h } = g
  if (shape === 'parallelogram') {
    return [
      [0, 0],
      [a, 0],
      [a, h],
      [0, h],
    ]
  }
  const poly = shapeCells(shape, g)
  if (shape === 'triangle') {
    const [A, B, C] = poly as [Pt, Pt, Pt]
    // 关于边 BC 的中点作中心对称：A' = B + C − A
    return [A, B, [B[0] + C[0] - A[0], B[1] + C[1] - A[1]], C]
  }
  const [A, B, C, D] = poly as [Pt, Pt, Pt, Pt]
  const M: Pt = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2]
  return [A, pointReflect(D, M), pointReflect(A, M), D]
}

/** 与原件完全一样的复制件在拼合后的位置（关于腰 BC 的中点作中心对称，B 与 C 互换） */
export function copyCells(shape: AreaShape, g: AreaGeomInput): Pt[] {
  const poly = shapeCells(shape, g)
  if (shape === 'triangle') {
    const [A, B, C] = poly as [Pt, Pt, Pt]
    const M: Pt = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2]
    return [pointReflect(A, M), C, B]
  }
  const [A, B, C, D] = poly as [Pt, Pt, Pt, Pt]
  const M: Pt = [(B[0] + C[0]) / 2, (B[1] + C[1]) / 2]
  return [pointReflect(A, M), C, B, pointReflect(D, M)]
}

/**
 * 平行四边形：竖直线 x = a 右侧剪下的直角三角形。
 * 把它**向左平移 a 格**（`cutShiftCells`）后与 `gapCells` 完全重合。
 */
export function cutPieceCells({ a, b, h, slant }: AreaGeomInput): Pt[] {
  const s = Math.min(slant, Math.max(0, a - 0.5))
  void b
  return [
    [a, 0],
    [a, h],
    [a + s, h],
  ]
}

/** 剪拼后留下的主体（平行四边形去掉右侧直角三角形） */
export function bodyCells({ a, b, h, slant }: AreaGeomInput): Pt[] {
  const s = Math.min(slant, Math.max(0, a - 0.5))
  void b
  return [
    [0, 0],
    [a, 0],
    [a, h],
    [s, h],
  ]
}

/** 长方形 [0,a]×[0,h] 内、平行四边形左侧的缺口三角形 */
export function gapCells({ a, b, h, slant }: AreaGeomInput): Pt[] {
  const s = Math.min(slant, Math.max(0, a - 0.5))
  void b
  void a
  return [
    [0, 0],
    [0, h],
    [s, h],
  ]
}

/** 剪下部分应当平移的格数（负值 = 向左），等于底 a */
export function cutShiftCells({ a }: Pick<AreaGeomInput, 'a'>): number {
  return -a
}

/** 平移多边形 */
export function translatePoly(poly: Pt[], dx: number, dy = 0): Pt[] {
  return poly.map(([x, y]) => [x + dx, y + dy])
}

/** 鞋带公式求多边形面积（格²） */
export function polygonArea(poly: Pt[]): number {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!
    const [x2, y2] = poly[(i + 1) % poly.length]!
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

/** 直线 y = k 与凸多边形的交线段（用于数方格/检查对齐），返回 [xmin,xmax] 或 null */
export function spanAtY(poly: Pt[], y: number): [number, number] | null {
  const xs: number[] = []
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]!
    const [x2, y2] = poly[(i + 1) % poly.length]!
    if (y1 === y2) {
      if (y === y1) {
        xs.push(x1, x2)
      }
      continue
    }
    const t = (y - y1) / (y2 - y1)
    if (t >= 0 && t <= 1) xs.push(x1 + t * (x2 - x1))
  }
  if (xs.length === 0) return null
  return [Math.min(...xs), Math.max(...xs)]
}

/* ==================== 组合图形（书页 42 例 6 · 华丰公园池塘） ==================== */

/**
 * 池塘平面图（课本标注：上边 100 m、左边高 90 m、右上竖边 40 m、下底 140 m）。
 * 坐标用「米、y 向上」，原点在左下角：
 *   (0,0) → (bottom,0) → (top, left-right) → (top, left) → (0, left)
 * 课本原图面积正好 10000 平方米 = 1 公顷。
 */
export interface CompositeSpec {
  top: number
  left: number
  right: number
  bottom: number
}

export interface CompositePart {
  name: string
  /** 顶点（米，y 向上） */
  points: Pt[]
  area: number
}

export interface CompositeMethod {
  key: string
  label: string
  /** 割补方式：add = 分割后相加，subtract = 补成大图形再减 */
  op: 'add' | 'subtract'
  parts: CompositePart[]
  total: number
}

export function compositeOutline({ top, left, right, bottom }: CompositeSpec): Pt[] {
  return [
    [0, 0],
    [bottom, 0],
    [top, left - right],
    [top, left],
    [0, left],
  ]
}

/** 三种割补方法（都用同一组已知条件，结果必须完全相等） */
export function compositeMethods({ top, left, right, bottom }: CompositeSpec): CompositeMethod[] {
  const drop = left - right
  const rectUpper: CompositePart = {
    name: `长方形 ${top} × ${right}`,
    points: [
      [0, drop],
      [top, drop],
      [top, left],
      [0, left],
    ],
    area: top * right,
  }
  const trapLower: CompositePart = {
    name: `梯形（${top} + ${bottom}）× ${drop} ÷ 2`,
    points: [
      [0, 0],
      [bottom, 0],
      [top, drop],
      [0, drop],
    ],
    area: ((top + bottom) * drop) / 2,
  }
  const rectFull: CompositePart = {
    name: `长方形 ${top} × ${left}`,
    points: [
      [0, 0],
      [top, 0],
      [top, left],
      [0, left],
    ],
    area: top * left,
  }
  const triRight: CompositePart = {
    name: `三角形 ${bottom - top} × ${drop} ÷ 2`,
    points: [
      [top, 0],
      [bottom, 0],
      [top, drop],
    ],
    area: ((bottom - top) * drop) / 2,
  }
  const bigRect: CompositePart = {
    name: `大长方形 ${bottom} × ${left}`,
    points: [
      [0, 0],
      [bottom, 0],
      [bottom, left],
      [0, left],
    ],
    area: bottom * left,
  }
  const missingTrap: CompositePart = {
    name: `补上的梯形（${left} + ${right}）× ${bottom - top} ÷ 2`,
    points: [
      [top, left - right],
      [bottom, 0],
      [bottom, left],
      [top, left],
    ],
    area: ((left + right) * (bottom - top)) / 2,
  }
  return [
    {
      key: 'rect-trap',
      label: '分割法一：长方形 + 梯形',
      op: 'add',
      parts: [rectUpper, trapLower],
      total: rectUpper.area + trapLower.area,
    },
    {
      key: 'rect-tri',
      label: '分割法二：长方形 + 三角形',
      op: 'add',
      parts: [rectFull, triRight],
      total: rectFull.area + triRight.area,
    },
    {
      key: 'big-minus',
      label: '添补法：大长方形 − 补上的梯形',
      op: 'subtract',
      parts: [bigRect, missingTrap],
      total: bigRect.area - missingTrap.area,
    },
  ]
}

/** 公顷换算：10000 平方米 = 1 公顷 */
export function toHectare(m2: number): number {
  return Math.round((m2 / 10000) * 10000) / 10000
}

/** 公顷 Lab 的图上比例尺：1 千米 = box px，正方形边长按同一比例（不再用「60 + 边长×0.14」这种假映射） */
export function hectareScale(side: number, maxSide: number, box: number): number {
  void maxSide
  return (box / 1000) * side
}
