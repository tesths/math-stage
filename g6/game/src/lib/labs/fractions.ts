/**
 * 分数与「实际意义」的纯逻辑（工程问题、几分之几）。
 *
 * 存在的理由：把中间量四舍五入后再写进算式，会让等式自相矛盾。
 * 例：1/5 + 1/7 = 0.34（显示值），而 1 ÷ 0.34 = 2.9412 ≠ 2.92（真值 35/12 = 2.9166…）。
 * 这里统一用最简分数表达中间量，只有最后一步才给出小数近似。
 */
import { gcd } from '@/lib/engine/math'

/** 最简分数 */
export function reduce(n: number, d: number): [number, number] {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1
  return [n / g, d / g]
}

/** 1/a + 1/b 的最简分数 */
export function unitFractionSum(a: number, b: number): [number, number] {
  return reduce(a + b, a * b)
}

/** 分数文案：分母为 1 时给整数 */
export function fractionText(n: number, d: number): string {
  const [rn, rd] = reduce(n, d)
  return rd === 1 ? String(rn) : `${rn}/${rd}`
}

/** 分母只含质因数 2 和 5 → 能化成有限小数 */
export function isTerminating(denominator: number): boolean {
  let d = Math.abs(Math.round(denominator))
  if (d === 0) return false
  while (d % 2 === 0) d /= 2
  while (d % 5 === 0) d /= 5
  return d === 1
}

/** 分数化小数（保留 maxFrac 位，四舍五入到十进制），并说明是否精确 */
export function fractionDecimal(n: number, d: number, maxFrac = 2): { text: string; value: number; exact: boolean } {
  const value = n / d
  const text = value.toFixed(maxFrac).replace(/0+$/, '').replace(/\.$/, '')
  const rounded = Number(text)
  return { text, value: rounded, exact: isTerminating(d) }
}

/** 人数/个数这类离散量：total × fn/fd 必须是整数才有实际意义 */
export function fractionCount(total: number, fn: number, fd: number): { value: number; integral: boolean } {
  const value = (total * fn) / fd
  return { value, integral: Math.abs(value - Math.round(value)) < 1e-9 }
}

/** 把 total 调到最接近的 fd 的倍数（向上），用于提示「把总人数调成几的倍数」 */
export function snapUpToMultiple(total: number, fd: number): number {
  const m = Math.max(1, Math.round(fd))
  return Math.ceil(total / m) * m
}
