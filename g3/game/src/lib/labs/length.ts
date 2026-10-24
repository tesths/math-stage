/**
 * 三年级「毫米、分米和千米」的纯几何/换算内核。
 *
 * 抽出来的理由：长度 Lab 原来在模板里写死"相邻单位都是 ×10"的阶梯，
 * 于是 1 米 → 1 千米 也被标成 ×10（真错误，米到千米是 ×1000）；
 * 千米路段又是 `i <= km * 10 / 3` 这种假比例尺（3 千米正好填满 10 段，
 * 1 千米却填 3.33 段），与"10 个 100 米是 1 千米"直接矛盾。
 */
import { LENGTH_MM, LENGTH_UNITS, type LengthUnit } from '@/lib/engine/math'

/** 相邻两个长度单位之间的进率（大单位在前时是倍数） */
export function rateBetween(from: LengthUnit, to: LengthUnit): number {
  const a = LENGTH_MM[from]
  const b = LENGTH_MM[to]
  return a < b ? b / a : a / b
}

/** 阶梯上相邻两格之间的进率文字（米→千米 是 ×1000，其余 ×10） */
export function rateLabel(from: LengthUnit, to: LengthUnit): string {
  return `×${rateBetween(from, to)}`
}

/** 换算路径上的每一步：从大单位到小单位用乘法，反之用除法 */
export interface RateStep {
  from: LengthUnit
  to: LengthUnit
  factor: number
  symbol: '×' | '÷'
}

export function conversionSteps(fromIdx: number, toIdx: number): RateStep[] {
  const out: RateStep[] = []
  if (fromIdx === toIdx) return out
  const dir = fromIdx < toIdx ? 1 : -1
  for (let i = fromIdx; i !== toIdx; i += dir) {
    const from = LENGTH_UNITS[i]!
    const to = LENGTH_UNITS[i + dir]!
    out.push({ from, to, factor: rateBetween(from, to), symbol: dir > 0 ? '÷' : '×' })
  }
  return out
}

/** 单一进率的复名数拆分：45 毫米 = 4 厘米 5 毫米 */
export function decompose(value: number, factor: number): { whole: number; rest: number } {
  const whole = Math.floor(value / factor)
  const rest = Math.round((value - whole * factor) * 1e6) / 1e6
  return { whole, rest }
}

/** 1 米 90 厘米 → 19 分米；每 10 分米排成一整米一行，便于"10 厘米是 1 分米"逐个对上 */
export function meterRows(m: number, cm: number): { dm: number; rows: { filled: number }[]; cmRest: number } {
  const dm = m * 10 + Math.floor(cm / 10)
  const rows: { filled: number }[] = []
  const fullMeters = Math.floor(dm / 10)
  for (let i = 0; i < fullMeters; i++) rows.push({ filled: 10 })
  const rest = dm % 10
  if (rest > 0) rows.push({ filled: rest })
  return { dm, rows, cmRest: cm % 10 }
}

/**
 * 千米路段：一小段 = 100 米，所以 1 千米 = 10 小段。
 * 返回每一小段属于第几千米，长度严格与数值成比例（旧实现是 `km*10/3` 的假映射）。
 */
export function kmSegments(km: number): { index: number; kmIndex: number }[] {
  return Array.from({ length: Math.max(1, km) * 10 }, (_, i) => ({ index: i, kmIndex: Math.floor(i / 10) }))
}

/** 厘米尺上的毫米刻度数（每厘米 10 毫米） */
export function rulerMmTicks(cmSpan: number): number[] {
  return Array.from({ length: cmSpan * 10 + 1 }, (_, i) => i)
}
