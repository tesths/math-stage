/**
 * 钉子板（皮克定理）的纯几何。
 *
 * 关键点：内部钉子数 **必须独立数出来**，不能由面积倒推
 * （早期实现用 `b = S − n/2 + 1` 再代回 Pick 公式，等于把要证明的结论当条件，
 * 显示的"验证"没有任何意义，画面上的钉子和公式还可能对不上）。
 * 这里用「边上判定 + 射线法」逐个数钉子，再让 Pick 公式去对面积。
 */

export type Pt = [number, number]

export const PINBOARD_SHAPES: { name: string; pts: Pt[] }[] = [
  { name: '矩形', pts: [[0, 0], [5, 0], [5, 3], [0, 3]] },
  { name: '三角形', pts: [[0, 0], [6, 0], [2, 4]] },
  { name: 'L 形', pts: [[0, 0], [4, 0], [4, 2], [2, 2], [2, 4], [0, 4]] },
  { name: '五边形', pts: [[0, 0], [6, 0], [6, 2], [3, 4], [0, 2]] },
  { name: '凹四边形', pts: [[0, 0], [5, 0], [5, 4], [2, 2], [0, 4]] },
]

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) [x, y] = [y, x % y]
  return x
}

/** 鞋带公式求面积 */
export function shoelace(pts: Pt[]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

/** 边上的钉子数 = 每条边 gcd(|dx|,|dy|) 之和（顶点只数一次，所以是"和"而不是"和+边数"） */
export function boundaryPins(pts: Pt[]): number {
  let n = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    n += gcd(x2 - x1, y2 - y1)
  }
  return n
}

/** 单个格点相对多边形的位置 */
export function pointStatus(pts: Pt[], px: number, py: number): 'boundary' | 'inside' | 'outside' {
  // 落在边上？（叉积为 0 且落在该边范围内）
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    const cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)
    if (
      cross === 0 &&
      px >= Math.min(x1, x2) &&
      px <= Math.max(x1, x2) &&
      py >= Math.min(y1, y2) &&
      py <= Math.max(y1, y2)
    ) {
      return 'boundary'
    }
  }
  // 射线法（水平向右），凹凸多边形都适用
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]!
    const [xj, yj] = pts[j]!
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside ? 'inside' : 'outside'
}

/** 逐个数内部钉子 */
export function interiorPins(pts: Pt[]): number {
  const maxX = Math.max(...pts.map((p) => p[0]))
  const maxY = Math.max(...pts.map((p) => p[1]))
  let b = 0
  for (let y = 1; y < maxY; y++) {
    for (let x = 1; x < maxX; x++) {
      if (pointStatus(pts, x, y) === 'inside') b++
    }
  }
  return b
}

export interface PickCheck {
  /** 多边形内的钉子板范围 */
  maxX: number
  maxY: number
  /** 鞋带公式面积 */
  area: number
  /** 边上的钉子（gcd 求和） */
  n: number
  /** 内部钉子（逐个数出来） */
  b: number
  /** 用 Pick 公式算出的面积 */
  pickArea: number
  /** 两种算法是否一致 */
  ok: boolean
  formula: string
}

/** 独立数钉子 → 再用皮克定理对面积（S = n ÷ 2 + b − 1） */
export function pickCheck(pts: Pt[]): PickCheck {
  const maxX = Math.max(...pts.map((p) => p[0]))
  const maxY = Math.max(...pts.map((p) => p[1]))
  const area = shoelace(pts)
  const n = boundaryPins(pts)
  const b = interiorPins(pts)
  const pickArea = n / 2 + b - 1
  return {
    maxX,
    maxY,
    area,
    n,
    b,
    pickArea,
    ok: Math.abs(pickArea - area) < 1e-9,
    formula: `S = ${n} ÷ 2 + ${b} − 1 = ${pickArea}`,
  }
}
