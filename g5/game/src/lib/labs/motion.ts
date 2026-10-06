/**
 * 图形的运动（平移 / 旋转 / 轴对称）纯几何，格坐标、y 轴向上。
 *
 * 屏幕坐标 y 轴向下，所以「看上去顺时针旋转 θ」在数学习惯坐标（y 向上）里是 −θ。
 * 这里统一用「视觉角度」：正角 = 顺时针，与课本和 SVG 的 rotate() 一致。
 */

export type Pt = [number, number]

export interface ShapeFigure {
  /** 外接框宽、高（格） */
  w: number
  h: number
  /** 主体多边形（格坐标，相对外接框左下角，y 向上） */
  polys: Pt[][]
  /** 线段（如桅杆） */
  lines: [Pt, Pt][]
  /** 圆点（如鱼眼） */
  dots: { p: Pt; r: number }[]
  /** 对应点（标注 A/B/C） */
  marks: { p: Pt; label: string }[]
  /** 旋转中心（相对外接框左下角） */
  pivot: Pt
  /** 参考半径（对应点到旋转中心的距离，格） */
  radius: number
}

/** 小船：船身 + 桅杆 + 帆 */
export const BOAT: ShapeFigure = {
  w: 5,
  h: 3.6,
  polys: [
    [
      [0, 0],
      [5, 0],
      [4.35, 1.25],
      [0.65, 1.25],
    ],
    [
      [2.5, 3.6],
      [4.2, 1.55],
      [2.6, 1.55],
    ],
  ],
  lines: [
    [
      [2.5, 1.25],
      [2.5, 3.6],
    ],
  ],
  dots: [],
  marks: [
    { p: [0.45, 0.35], label: 'A' },
    { p: [2.5, 3.5], label: 'B' },
    { p: [4.55, 0.35], label: 'C' },
  ],
  pivot: [2.5, 0],
  radius: 2.5,
}

/** 小鱼：尾 + 菱形身体 + 眼睛 */
export const FISH: ShapeFigure = {
  w: 4.6,
  h: 1.6,
  polys: [
    [
      [1, 0.8],
      [0, 0],
      [0, 1.6],
    ],
    [
      [1, 0.8],
      [2.8, 0],
      [4.6, 0.8],
      [2.8, 1.6],
    ],
  ],
  lines: [],
  dots: [{ p: [3.8, 0.95], r: 0.13 }],
  marks: [
    { p: [0, 0.8], label: 'A' },
    { p: [2.8, 1.6], label: 'B' },
    { p: [4.6, 0.8], label: 'C' },
  ],
  pivot: [2.3, 0.8],
  radius: 2.3,
}

/** 闸杆：绕 O 点的杆 + 手柄 */
export const LEVER: ShapeFigure = {
  w: 4.6,
  h: 1.2,
  polys: [
    [
      [4, 0.25],
      [4.6, 0.25],
      [4.6, 0.95],
      [4, 0.95],
    ],
  ],
  lines: [
    [
      [0, 0.6],
      [4, 0.6],
    ],
  ],
  dots: [{ p: [0, 0.6], r: 0.16 }],
  marks: [
    { p: [4, 0.6], label: 'A' },
    { p: [2, 0.6], label: 'B' },
  ],
  pivot: [0, 0.6],
  radius: 4,
}

/** 直角三角形 ABC，直角在 A，绕 A 旋转 */
export const TRIANGLE: ShapeFigure = {
  w: 3,
  h: 3,
  polys: [
    [
      [0, 0],
      [3, 0],
      [0, 3],
    ],
  ],
  lines: [],
  dots: [],
  marks: [
    { p: [0, 0], label: 'A' },
    { p: [3, 0], label: 'B' },
    { p: [0, 3], label: 'C' },
  ],
  pivot: [0, 0],
  radius: 3,
}

export function figureByCode(code: number): ShapeFigure {
  return [BOAT, FISH, LEVER, TRIANGLE][Math.round(code)] ?? BOAT
}

/** 视觉顺时针旋转 deg 度（格坐标，y 向上） */
export function rotatePoint(p: Pt, center: Pt, deg: number): Pt {
  const t = (deg * Math.PI) / 180
  const dx = p[0] - center[0]
  const dy = p[1] - center[1]
  return [center[0] + dx * Math.cos(t) + dy * Math.sin(t), center[1] - dx * Math.sin(t) + dy * Math.cos(t)]
}

/** 关于竖直线 x = axisX 作轴对称 */
export function reflectPoint(p: Pt, axisX: number): Pt {
  return [2 * axisX - p[0], p[1]]
}

/** 平移 */
export function translatePoint(p: Pt, dir: 0 | 1 | 2 | 3, cells: number): Pt {
  if (dir === 0) return [p[0] + cells, p[1]]
  if (dir === 1) return [p[0], p[1] - cells]
  if (dir === 2) return [p[0] - cells, p[1]]
  return [p[0], p[1] + cells]
}

/** 两点距离 */
export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}
