import type { LabKind, ParamValues } from '@data/schema/lab'

/** 单元内子主题标签（用于归类显示） */
export const KIND_LABELS: Record<LabKind, string> = {
  translate: '图形的平移',
  rotate: '图形的旋转',
  axis: '轴对称图形',
  area: '多边形面积',
  hectare: '公顷与平方千米',
  composite: '组合图形的面积',
  'decimal-mul': '小数乘整数',
  'decimal-div': '小数除以整数',
  'decimal-point': '小数点移动',
  spinner: '可能性 · 转盘',
  marble: '可能性 · 摸球',
  factors: '因数与倍数',
  multiples: '倍数',
  prime: '质数与合数',
  gcdlcm: '公因数与公倍数',
  frog: '用字母表示数',
  square: '用字母表示数',
  speed: '用字母表示数',
  pinboard: '钉子板上的多边形',
  views3d: '观察物体（三）',
}

/** 求矩形面积（底×高），供 area lab 使用 */
export function rectArea(p: ParamValues): number {
  return p.a! * p.h!
}

/** 求三角形面积（底×高÷2） */
export function triangleArea(p: ParamValues): number {
  return (p.a! * p.h!) / 2
}

/** 求梯形面积 ((上底+下底)×高÷2) */
export function trapezoidArea(p: ParamValues): number {
  return ((p.a! + p.b!) * p.h!) / 2
}

export const AREA_SHAPES = ['parallelogram', 'triangle', 'trapezoid'] as const
export type AreaShape = (typeof AREA_SHAPES)[number]

export function areaOf(shape: AreaShape, p: ParamValues): number {
  switch (shape) {
    case 'parallelogram':
      return rectArea(p)
    case 'triangle':
      return triangleArea(p)
    case 'trapezoid':
      return trapezoidArea(p)
  }
}

/** 因数（升序、含1和自身） */
export function factorsOf(n: number): number[] {
  const out: number[] = []
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      out.push(i)
      const j = n / i
      if (j !== i) out.push(j)
    }
  }
  return out.sort((x, y) => x - y)
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n < 4) return true
  if (n % 2 === 0) return false
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false
  return true
}

export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return a
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

/** 埃拉托色尼筛：返回 2..n 内所有质数 */
export function primesUpTo(n: number): number[] {
  const sieve = new Array<boolean>(n + 1).fill(true)
  sieve[0] = sieve[1] = false
  for (let i = 2; i * i <= n; i++) {
    if (!sieve[i]) continue
    for (let j = i * i; j <= n; j += i) sieve[j] = false
  }
  return sieve.reduce<number[]>((acc, v, i) => (v ? (acc.push(i), acc) : acc), [])
}

/** 把小数解析为 (整数部分, 十分位, 百分位…) 的位值，用于竖式展示 */
export function decimalParts(v: number): { int: number; frac: number[] } {
  const s = v.toFixed(2)
  const [i, f = ''] = s.split('.')
  return { int: Number(i), frac: f.split('').map(Number) }
}

export function toFixed2(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
