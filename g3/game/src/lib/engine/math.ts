import type { LabKind } from '@data/schema/lab'

/** 单元内子主题标签（用于归类显示） */
export const KIND_LABELS: Record<LabKind, string> = {
  'mix-calc': '混合运算',
  bracket: '小括号',
  time24: '24 时记时法',
  elapsed: '经过时间',
  'mul-oral': '口算乘法',
  'mul-pen': '笔算乘法',
  'mul-zero': '有 0 的乘法',
  weight: '质量单位',
  equivalent: '等量代换',
  tally: '画"正"字统计',
  stat: '统计表',
  'length-convert': '长度单位换算',
  translate: '平移',
  rotate: '旋转',
  axis: '轴对称',
  'div-oral': '口算除法',
  'div-pen': '笔算除法',
  'div-zero': '商中间有 0',
  remainder: '有余数除法',
  interval: '间隔排列',
  segment: '线段图',
  views: '三视图',
  views3d: '三维观察',
  times: '倍的含义',
  'times-mul': '求一个数的几倍',
  'times-div': '求一个数是另一个数的几倍',
}

/** 混合运算类型 */
export type MixOp = 'add' | 'sub' | 'mul' | 'div'

/** 求四则运算（除数不能为 0） */
export function applyOp(a: number, op: MixOp, b: number): number {
  switch (op) {
    case 'add':
      return a + b
    case 'sub':
      return a - b
    case 'mul':
      return a * b
    case 'div':
      return Math.floor(a / b)
  }
}

export const OP_SYMBOL: Record<MixOp, string> = { add: '+', sub: '−', mul: '×', div: '÷' }

/** 24 时制 → 普通记时法文本（如 20 → 晚上 8 时） */
export function time12Text(hour: number): { period: string; display: number } {
  if (hour === 0) return { period: '凌晨', display: 12 }
  if (hour < 6) return { period: '凌晨', display: hour }
  if (hour < 12) return { period: '上午', display: hour }
  if (hour === 12) return { period: '中午', display: 12 }
  return { period: hour < 18 ? '下午' : '晚上', display: hour - 12 }
}

/** 长度单位表：毫米/厘米/分米/米/千米（到毫米的进率） */
export const LENGTH_UNITS = ['毫米', '厘米', '分米', '米', '千米'] as const
export type LengthUnit = (typeof LENGTH_UNITS)[number]
/** 每单位对应的毫米数 */
export const LENGTH_MM: Record<LengthUnit, number> = {
  毫米: 1,
  厘米: 10,
  分米: 100,
  米: 1000,
  千米: 1_000_000,
}

/** 质量单位表：克/千克/吨（到克的进率） */
export const WEIGHT_UNITS = ['克', '千克', '吨'] as const
export type WeightUnit = (typeof WEIGHT_UNITS)[number]
export const WEIGHT_G: Record<WeightUnit, number> = { 克: 1, 千克: 1000, 吨: 1_000_000 }

/** 把若干数量拆成商与余数 */
export function divideWithRemainder(total: number, div: number): { q: number; r: number } {
  return { q: Math.floor(total / div), r: total % div }
}

/** 一个"正"字的画数计数：n 人 = 若干"正"字 + 剩余画数 */
export function zhengCount(n: number): { chars: number; strokes: number } {
  return { chars: Math.floor(n / 5), strokes: n % 5 }
}

/** 求一个数是另一个数的几倍（整除判断） */
export function timesOf(total: number, base: number): { times: number; exact: boolean } {
  const t = total / base
  return { times: Math.round(t * 100) / 100, exact: Number.isInteger(t) }
}

export function toFixed2(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

/** 三位数按位拆分 [百, 十, 个] */
export function splitDigits3(n: number): [number, number, number] {
  const h = Math.floor(n / 100)
  const t = Math.floor((n % 100) / 10)
  const o = n % 10
  return [h, t, o]
}

/** 两位数按位拆分 [十, 个] */
export function splitDigits2(n: number): [number, number] {
  const t = Math.floor(n / 10)
  const o = n % 10
  return [t, o]
}
