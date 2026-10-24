/**
 * 七巧板几何（纯函数，可单测）
 *
 * 依据课本（苏教版二上 p34，OCR 第 1221-1223 行）：
 * 「①号板和②号板都是三角形的，形状、大小完全一样；③号板和⑤号板可以拼成④号板，
 *   还可以拼成⑦号板或⑥号板」「想一想，拼一拼：用哪几块板可以拼成和①号板完全一样的三角形？
 *   ①号板的大小相当于几块③号板？」
 *
 * 坐标系：把整块七巧板正方形看成边长 8 的正方形（面积 64 = 16 个「小三角形面积 4」的一半…）。
 * 各板面积：①②大三角形 16+16，③⑤小三角形 4+4，④正方形 8，⑥平行四边形 8，⑦中三角形 8，合计 64。
 * 顶点全部取自课本原图实测（p042-1.jpg 逐像素取色）后落到整数格点上。
 *
 * 关键不变量（见 test/unit/tangram.test.ts）：
 * - 7 块板面积之和 = 正方形面积 64，且每个采样点恰好被 1 块板覆盖（既不重叠也不留空）；
 * - 每种拼法的「板面积之和 = 目标轮廓面积」，且拼合后顶点集合与目标轮廓顶点集合一致；
 * - 拼合后每块板与原板全等（边长集合、面积一致，可用刚性变换从原位置变换得到）。
 */

/** 平面点：[x, y] */
export type Pt = readonly [number, number]

const K = Math.SQRT2

/** 七块板的形状（区分板型用的名字，用于断言「同形同大小」） */
export type PieceShape = '大三角形' | '中三角形' | '小三角形' | '正方形' | '平行四边形'

export interface Piece {
  /** 板号 1~7，与课本 ①②③④⑤⑥⑦ 一致 */
  no: number
  shape: PieceShape
  /** 在整块正方形里的原始位置（边长 8 的正方形内） */
  points: Pt[]
}

/** 七巧板原始拼法：7 块板正好拼成边长 8 的正方形（面积 64） */
export const PIECES: Piece[] = [
  { no: 1, shape: '大三角形', points: [[0, 0], [8, 0], [4, 4]] },
  { no: 2, shape: '大三角形', points: [[0, 0], [4, 4], [0, 8]] },
  { no: 3, shape: '小三角形', points: [[8, 0], [6, 2], [8, 4]] },
  { no: 4, shape: '正方形', points: [[6, 2], [8, 4], [6, 6], [4, 4]] },
  { no: 5, shape: '小三角形', points: [[4, 4], [6, 6], [2, 6]] },
  { no: 6, shape: '平行四边形', points: [[2, 6], [6, 6], [4, 8], [0, 8]] },
  { no: 7, shape: '中三角形', points: [[8, 4], [8, 8], [4, 8]] },
]

export const SQUARE_SIDE = 8

/** 鞋带公式求多边形面积 */
export function polygonArea(points: Pt[]): number {
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]!
    const [x2, y2] = points[(i + 1) % points.length]!
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

/** 多边形各边长度 */
export function sideLengths(points: Pt[]): number[] {
  return points.map((p, i) => {
    const q = points[(i + 1) % points.length]!
    return Math.hypot(q[0] - p[0], q[1] - p[1])
  })
}

/** 边长排序后用于「全等」比较 */
export function shapeSignature(points: Pt[]): string {
  return sideLengths(points)
    .map((v) => v.toFixed(3))
    .sort()
    .join('|')
}

/** 刚性变换：先按 flip 镜像（y 取反），再旋转 rot（弧度），最后平移 */
export interface Rigid {
  rot: number
  flip: boolean
  tx: number
  ty: number
}

export const IDENTITY: Rigid = { rot: 0, flip: false, tx: 0, ty: 0 }

export function applyRigid(points: Pt[], t: Rigid): Pt[] {
  const cos = Math.cos(t.rot)
  const sin = Math.sin(t.rot)
  return points.map(([x0, y0]) => {
    const x = x0
    const y = t.flip ? -y0 : y0
    return [x * cos - y * sin + t.tx, x * sin + y * cos + t.ty] as Pt
  })
}

/** 把变换按 t∈[0,1] 插值（旋转与平移同时插值，中间态仍是刚性变换） */
export function lerpRigid(from: Rigid, to: Rigid, t: number): Rigid {
  return {
    rot: from.rot + (to.rot - from.rot) * t,
    flip: t < 0.5 ? from.flip : to.flip,
    tx: from.tx + (to.tx - from.tx) * t,
    ty: from.ty + (to.ty - from.ty) * t,
  }
}

const EPS = 1e-6

function samePoint(a: Pt, b: Pt): boolean {
  return Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS
}

/** 顶点集合比较（无序） */
export function sameVertexSet(a: Pt[], b: Pt[]): boolean {
  if (a.length !== b.length) return false
  const used = new Array(b.length).fill(false)
  for (const p of a) {
    const i = b.findIndex((q, k) => !used[k] && samePoint(p, q))
    if (i < 0) return false
    used[i] = true
  }
  return true
}

/**
 * 求把 base 变换到 target 的刚性变换。
 * 试 8 种（4 个顶点起点 × 正/反两种走向）对应关系，失败返回 null。
 * 这也顺便证明「拼合后的板与原板全等」：拿不到刚性变换就说明形状变了。
 */
export function solveRigid(base: Pt[], target: Pt[]): Rigid | null {
  if (base.length !== target.length) return null
  const n = base.length
  for (const flip of [false, true]) {
    const src = base.map(([x, y]) => [x, flip ? -y : y] as Pt)
    for (let shift = 0; shift < n; shift++) {
      const a0 = src[shift]!
      const a1 = src[(shift + 1) % n]!
      const b0 = target[0]!
      const b1 = target[1]!
      const rot =
        Math.atan2(b1[1] - b0[1], b1[0] - b0[0]) - Math.atan2(a1[1] - a0[1], a1[0] - a0[0])
      const cos = Math.cos(rot)
      const sin = Math.sin(rot)
      const tx = b0[0] - (a0[0] * cos - a0[1] * sin)
      const ty = b0[1] - (a0[0] * sin + a0[1] * cos)
      const cand: Rigid = { rot, flip, tx, ty }
      const mapped = applyRigid(base, cand)
      // 目标顶点顺序可能相对 src 有循环位移，逐点比对集合
      if (sameVertexSet(mapped, target)) return cand
    }
  }
  return null
}

/** 一块板在某种拼法里的摆放：板号 + 变换 */
export interface Placement {
  no: number
  transform: Rigid
}

/** 一种拼法的目标：参加拼的板 + 目标轮廓 */
export interface Assembly {
  key: string
  name: string
  /** 用的板号 */
  pieces: number[]
  /** 目标轮廓（顶点按顺序） */
  outline: Pt[]
  /** 每块板拼好后的顶点（顺序与 PIECES 对应板的顶点顺序无关，仅用于断言/渲染） */
  targets: { no: number; points: Pt[] }[]
  /** 课本口径的一句话说明 */
  note: string
}

const rect = (w: number, h: number): Pt[] => [[0, 0], [w, 0], [w, h], [0, h]]

/** 边长 2√2 的轴对齐正方形 */
const side = 2 * K // ≈ 2.828

/**
 * 六种拼法。
 * ①②③④⑤⑥⑦ 与课本编号一致：③⑤ 是两个完全一样的小三角形，
 * 知识点「③⑤可以拼成④（正方形）、⑥（平行四边形）、⑦（中三角形）」以及
 * 「③⑤⑦能拼成和①完全一样的三角形」全部在这里成立。
 */
export const ASSEMBLIES: Assembly[] = [
  {
    key: 'square7',
    name: '正方形（7 块）',
    pieces: [1, 2, 3, 4, 5, 6, 7],
    outline: rect(SQUARE_SIDE, SQUARE_SIDE),
    targets: PIECES.map((p) => ({ no: p.no, points: p.points })),
    note: '7 块板正好拼成一个正方形。',
  },
  {
    key: 'rectangle345',
    name: '长方形（③⑤④三块）',
    pieces: [3, 4, 5],
    outline: rect(2 * side, side),
    targets: [
      { no: 4, points: [[0, 0], [side, 0], [side, side], [0, side]] },
      { no: 3, points: [[side, 0], [2 * side, 0], [side, side]] },
      { no: 5, points: [[side, side], [2 * side, side], [2 * side, 0]] },
    ],
    note: '③⑤两块板先拼成一块正方形，再接上④号板，就成了长方形。',
  },
  {
    key: 'square2',
    name: '正方形（③⑤两块）',
    pieces: [3, 5],
    outline: rect(side, side),
    targets: [
      { no: 3, points: [[0, 0], [side, 0], [side, side]] },
      { no: 5, points: [[0, 0], [side, side], [0, side]] },
    ],
    note: '③号和⑤号板拼成了和④号板一样的正方形。',
  },
  {
    key: 'parallelogram2',
    name: '平行四边形（③⑤两块）',
    pieces: [3, 5],
    outline: [[0, 0], [side, 0], [2 * side, side], [side, side]],
    targets: [
      { no: 3, points: [[0, 0], [side, 0], [side, side]] },
      { no: 5, points: [[side, side], [2 * side, side], [side, 0]] },
    ],
    note: '③号和⑤号板拼成了和⑥号板一样的平行四边形。',
  },
  {
    key: 'triangle2',
    name: '三角形（③⑤两块）',
    pieces: [3, 5],
    outline: [[0, 0], [4, 0], [0, 4]],
    targets: [
      { no: 3, points: [[0, 0], [4, 0], [2, 2]] },
      { no: 5, points: [[0, 0], [2, 2], [0, 4]] },
    ],
    note: '③号和⑤号板拼成了和⑦号板一样的三角形。',
  },
  {
    key: 'triangle357',
    name: '三角形（③⑤⑦三块，和①一样大）',
    pieces: [3, 5, 7],
    outline: [[0, 0], [8, 0], [4, 4]],
    targets: [
      { no: 7, points: [[0, 0], [4, 0], [4, 4]] },
      { no: 3, points: [[4, 0], [8, 0], [6, 2]] },
      { no: 5, points: [[4, 0], [6, 2], [4, 4]] },
    ],
    note: '③⑤⑦三块板拼成的三角形，和①号板完全一样大。',
  },
]

export function assemblyByKey(key: string): Assembly {
  const found = ASSEMBLIES.find((a) => a.key === key)
  if (!found) throw new Error(`未知拼法：${key}`)
  return found
}

/** 某种拼法里，每块板从原位置到目标位置的刚性变换 */
export function placementsOf(assembly: Assembly): Placement[] {
  return assembly.targets.map((t) => {
    const base = PIECES.find((p) => p.no === t.no)!.points
    const transform = solveRigid(base, t.points)
    if (!transform) throw new Error(`第 ${t.no} 号板拼合后与原板不全等`)
    return { no: t.no, transform }
  })
}

/** 拼法在进度 t（0 = 原正方形位置，1 = 拼合完成）时每块板的顶点 */
export function piecesAt(assembly: Assembly, t: number): { no: number; points: Pt[] }[] {
  const placements = placementsOf(assembly)
  return placements.map((pl) => {
    const base = PIECES.find((p) => p.no === pl.no)!.points
    const rigid = lerpRigid(IDENTITY, pl.transform, Math.max(0, Math.min(1, t)))
    return { no: pl.no, points: applyRigid(base, rigid) }
  })
}

/** 点是否在多边形内部（射线法，边界上的点不计入） */
export function pointInPolygon(pt: Pt, poly: Pt[]): boolean {
  const [px, py] = pt
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!
    const [xj, yj] = poly[j]!
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** 点到线段距离（判断采样点是否压在板与板的分界线上，压线的点不计入统计） */
function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len2 = dx * dx + dy * dy
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

/** 采样点到所有板边的最近距离 */
function nearestEdge(p: Pt, pieces: { points: Pt[] }[]): number {
  let best = Infinity
  for (const pc of pieces) {
    for (let i = 0; i < pc.points.length; i++) {
      best = Math.min(best, distToSegment(p, pc.points[i]!, pc.points[(i + 1) % pc.points.length]!))
    }
  }
  return best
}

/** 采样检查：轮廓内每个点恰好被一块板覆盖（既不重叠也不留空） */
export function coversExactly(
  pieces: { points: Pt[] }[],
  outline: Pt[],
  step = 0.1,
): { ok: boolean; overlaps: number; holes: number; leaks: number } {
  let overlaps = 0
  let holes = 0
  let leaks = 0
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of outline) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  // 避开格点边界，减少「点在边上」的数值抖动
  const off = step / 2 + 0.003
  for (let x = minX + off; x < maxX; x += step) {
    for (let y = minY + off; y < maxY; y += step) {
      const p: Pt = [x, y]
      // 压在分界线上的采样点不算（既不判重叠也不判留空），否则 45° 分界线会被数两遍
      if (nearestEdge(p, pieces) < 1e-3) continue
      const insideOutline = pointInPolygon(p, outline)
      let count = 0
      for (const pc of pieces) if (pointInPolygon(p, pc.points)) count++
      if (insideOutline && count === 0) holes++
      if (insideOutline && count > 1) overlaps++
      if (!insideOutline && count > 0) leaks++
    }
  }
  return { ok: overlaps === 0 && holes === 0 && leaks === 0, overlaps, holes, leaks }
}

/** 轮廓顶点是否都是某块板的顶点（拼合后顶点集合 = 目标轮廓顶点集合） */
export function outlineVerticesCovered(
  pieces: { points: Pt[] }[],
  outline: Pt[],
): boolean {
  const all = pieces.flatMap((p) => p.points)
  return outline.every((v) => all.some((p) => samePoint(p, v)))
}

/** 每块板的顶点是否都落在轮廓内或轮廓上 */
export function piecesInsideOutline(pieces: { points: Pt[] }[], outline: Pt[]): boolean {
  const onEdge = (p: Pt, a: Pt, b: Pt) => {
    const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
    if (Math.abs(cross) > 1e-6) return false
    const dot = (p[0] - a[0]) * (p[0] - b[0]) + (p[1] - a[1]) * (p[1] - b[1])
    return dot <= 1e-6
  }
  return pieces.every((pc) =>
    pc.points.every(
      (p) =>
        pointInPolygon(p, outline) ||
        outline.some((a, i) => onEdge(p, a, outline[(i + 1) % outline.length]!)),
    ),
  )
}

/** 一块板在单位正方形里的归一化顶点（给组件按像素画图用） */
export function toSvgPoints(points: Pt[]): string {
  return points.map(([x, y]) => `${round(x)},${round(y)}`).join(' ')
}

function round(v: number): number {
  return Math.round(v * 1000) / 1000
}

/** 板中心（放板号标签） */
export function centroid(points: Pt[]): Pt {
  const n = points.length
  const sx = points.reduce((s, p) => s + p[0], 0)
  const sy = points.reduce((s, p) => s + p[1], 0)
  return [sx / n, sy / n]
}
