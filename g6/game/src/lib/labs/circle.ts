/**
 * 圆的面积剪拼 / 滚圆测周长的纯几何（像素坐标，y 向下）。
 *
 * 关键结论（都由单元测试断言）：
 * - 把圆平均分成 n 份，上下一一交错拼成的图形，外接长方形宽 = n·R·sin(π/n)、高 = R；
 *   n·sin(π/n) → π，所以长方形面积 → πR²，即 S = πr²。
 * - 圆沿直线滚动一周（转过 360°）前进的距离正好是周长 2πR；轮上一点的轨迹是摆线。
 */

export interface Wedge {
  /** SVG path */
  d: string
  /** 朝上（弧在上）或朝下 */
  up: boolean
}

export interface WedgeLayout {
  wedges: Wedge[]
  /** 外接长方形宽（px） */
  width: number
  /** 外接长方形高（px），恒等于 R */
  height: number
  /** 基础 y（长方形的下边界） */
  baseY: number
  /** 左边界 x */
  x0: number
}

/** 交错拼合：n 份扇形（n 取偶） */
export function wedgeLayout(n: number, R: number, x0: number, baseY: number): WedgeLayout {
  const count = Math.max(4, Math.round(n / 2) * 2)
  const half = Math.PI / count
  const step = R * Math.sin(half)
  const wedges: Wedge[] = []
  for (let i = 0; i < count; i++) {
    const cx = x0 + step * (i + 1)
    const dx = R * Math.sin(half)
    const dy = R * Math.cos(half)
    if (i % 2 === 0) {
      // 顶点在下，弧在上
      wedges.push({
        up: true,
        d: `M ${cx.toFixed(2)} ${baseY.toFixed(2)} L ${(cx - dx).toFixed(2)} ${(baseY - dy).toFixed(2)} A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 1 ${(cx + dx).toFixed(2)} ${(baseY - dy).toFixed(2)} Z`,
      })
    } else {
      // 顶点在上，弧在下
      wedges.push({
        up: false,
        d: `M ${cx.toFixed(2)} ${(baseY - R).toFixed(2)} L ${(cx - dx).toFixed(2)} ${(baseY - R + dy).toFixed(2)} A ${R.toFixed(2)} ${R.toFixed(2)} 0 0 0 ${(cx + dx).toFixed(2)} ${(baseY - R + dy).toFixed(2)} Z`,
      })
    }
  }
  return { wedges, width: count * step, height: R, baseY, x0 }
}

/** 拼成图形的长（以半径 r 为单位）：n·sin(π/n) → π */
export function approxLengthInR(n: number): number {
  const count = Math.max(4, Math.round(n / 2) * 2)
  return count * Math.sin(Math.PI / count)
}

/** 圆周上的等分扇形（用于左图） */
export function sectorPath(cx: number, cy: number, R: number, fromDeg: number, toDeg: number): string {
  const a1 = (fromDeg * Math.PI) / 180
  const a2 = (toDeg * Math.PI) / 180
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0
  const sweep = toDeg > fromDeg ? 1 : 0
  return `M ${cx} ${cy} L ${(cx + R * Math.cos(a1)).toFixed(2)} ${(cy + R * Math.sin(a1)).toFixed(2)} A ${R} ${R} 0 ${large} ${sweep} ${(cx + R * Math.cos(a2)).toFixed(2)} ${(cy + R * Math.sin(a2)).toFixed(2)} Z`
}

/**
 * 滚圆：圆心从 (x0, baseY-R) 出发向右滚动 θ 弧度，轮上原来在接触点的那个点的轨迹。
 * θ = 2π 时恰好回到起点高度，前进距离 = 2πR。
 */
export function rollPoint(x0: number, baseY: number, R: number, theta: number): [number, number] {
  return [x0 + R * theta + R * Math.sin(theta), baseY - R + R * Math.cos(theta)]
}

export function cycloidPath(x0: number, baseY: number, R: number, steps = 96): string {
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI
    const [x, y] = rollPoint(x0, baseY, R, t)
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `M ${pts.join(' L ')}`
}

/** 滚动 θ 弧度后圆的水平位移（px） */
export function rollDistance(R: number, theta: number): number {
  return R * theta
}
