/**
 * 「数与运算的再认识」的共用数据与算理（数位与计数单位 / 大小比较 / 运算一致性 / 二进制）。
 *
 * 为什么要单独成模块：这批例题原来在**组件**和**compute** 里各写了一份硬编码数组，
 * 两边一旦不同步就会出现「图上写的和下面算式说的不是一回事」。
 * 现在数据与判定只此一份，并用单元测试逐条核对（含把「2/3 与 3/5」这种分数比较算清楚，
 * 而不是靠 Number('2/3') → NaN 再特判）。
 */
import { gcd } from '@/lib/engine/math'

/* ---------------- 数位与计数单位 ---------------- */
export interface PlaceRow {
  unit: string
  val: number
  pow: number
}

const UNIT_TABLE: { key: number; unit: string; pow: number }[] = [
  { key: 3, unit: '千', pow: 1000 },
  { key: 2, unit: '百', pow: 100 },
  { key: 1, unit: '十', pow: 10 },
  { key: 0, unit: '一', pow: 1 },
  { key: -1, unit: '十分之一', pow: 0.1 },
  { key: -2, unit: '百分之一', pow: 0.01 },
  { key: -3, unit: '千分之一', pow: 0.001 },
]

/** 十进制的数位（string 版，避免浮点误差） */
function decimalPlacesOf(v: number): number {
  const s = String(Math.abs(v))
  return s.includes('.') ? s.split('.')[1]!.length : 0
}

/** 把任意数拆成「几个计数单位」的行（只保留最高位到最低非零位） */
export function placeRows(v: number): PlaceRow[] {
  const s = String(Math.abs(v))
  const [intPart = '0', fracPart = ''] = s.split('.')
  const rows: PlaceRow[] = []
  const digits: { key: number; digit: number }[] = []
  for (let i = 0; i < intPart.length; i++) {
    digits.push({ key: intPart.length - 1 - i, digit: Number(intPart[i]) })
  }
  for (let i = 0; i < fracPart.length; i++) {
    digits.push({ key: -1 - i, digit: Number(fracPart[i]) })
  }
  // 去掉整数部分的前导零（含个数位上的 0，如 0.24 的「0 个一」）与小数部分的末尾零
  while (digits.length > 1 && digits[0]!.digit === 0 && digits[0]!.key >= 0) digits.shift()
  while (digits.length && digits[digits.length - 1]!.digit === 0 && digits[digits.length - 1]!.key < 0) digits.pop()
  for (const d of digits) {
    const row = UNIT_TABLE.find((u) => u.key === d.key)
    if (row) rows.push({ unit: row.unit, val: d.digit, pow: row.pow })
  }
  return rows
}

export function placeLabel(v: number): string {
  return String(v)
}

/** 数位例题（课本 p031：231、3.36、4.05；p031 练习：2000、0.24） */
export const PLACE_EXAMPLES = [231, 2000, 3.36, 4.05, 0.24] as const

export function placeExample(sel: number) {
  const v = PLACE_EXAMPLES[((Math.round(sel) % PLACE_EXAMPLES.length) + PLACE_EXAMPLES.length) % PLACE_EXAMPLES.length]!
  const rows = placeRows(v)
  return {
    v,
    label: placeLabel(v),
    rows,
    text: `${placeLabel(v)} = ${rows.filter((r) => r.val > 0).map((r) => `${r.val} 个${r.unit}`).join(' + ')}`,
    powText: `${placeLabel(v)} = ${rows.filter((r) => r.val > 0).map((r) => `${r.val}×${r.pow}`).join(' + ')}`,
  }
}

/** 相邻计数单位的进率：10 个低一级单位 = 1 个高一级单位 */
export const CARRY_DEMO = [
  { low: '一', high: '十', lowCount: 10 },
  { low: '十', high: '百', lowCount: 10 },
  { low: '百', high: '千', lowCount: 10 },
  { low: '十分之一', high: '一', lowCount: 10 },
  { low: '百分之一', high: '十分之一', lowCount: 10 },
] as const

/* ---------------- 数的大小比较 ---------------- */
export interface ComparePair {
  a: string
  b: string
  /** 用精确值算出来的比较结果，true 表示 a > b */
  gt: boolean
  how: string
}

/** 解析整数/小数/分数为精确比值（分子/分母），用于比较 */
export function parseValue(text: string): { n: number; d: number } {
  const t = text.trim()
  const frac = t.match(/^(-?\d+)\s*\/\s*(\d+)$/)
  if (frac) return { n: Number(frac[1]), d: Number(frac[2]) }
  const places = t.includes('.') ? t.split('.')[1]!.length : 0
  const scale = 10 ** places
  return { n: Math.round(Number(t) * scale), d: scale }
}

/** a > b ? */
export function greaterThan(aText: string, bText: string): boolean {
  const a = parseValue(aText)
  const b = parseValue(bText)
  return a.n * b.d > b.n * a.d
}

export const COMPARE_PAIRS: ComparePair[] = [
  { a: '1000', b: '923', gt: true, how: '1000 是 10 个百，923 不足 10 个百' },
  { a: '3.34', b: '3.4', gt: false, how: '3.34 = 33.4 个 0.1，3.4 = 34 个 0.1' },
  { a: '4.7', b: '4.05', gt: true, how: '47 个 0.1 > 40.5 个 0.1' },
  { a: '2/3', b: '3/5', gt: true, how: '通分后 10/15 > 9/15（分数单位相同）' },
  { a: '0.78', b: '0.87', gt: false, how: '78 个 0.01 < 87 个 0.01' },
]

export function comparePair(sel: number) {
  return COMPARE_PAIRS[((Math.round(sel) % COMPARE_PAIRS.length) + COMPARE_PAIRS.length) % COMPARE_PAIRS.length]!
}

/* ---------------- 运算意义一致性 ---------------- */
export interface OpExample {
  expr: string
  how: string
  ans: string
  /** 数值答案，用于测试与展示一致性 */
  value: number
  /** 计数单位的名称与个数（用于画单位小片） */
  unit: string
  n: number
}

export const OP_EXAMPLES: OpExample[] = [
  { expr: '20 × 3', how: '2 个十 × 3 = 6 个十 = 60', ans: '60', value: 60, unit: '个十', n: 6 },
  { expr: '2/5 × 3', how: '(1/5 × 2) × 3 = 1/5 × 6 = 6/5', ans: '6/5', value: 6 / 5, unit: '1/5', n: 6 },
  { expr: '1200 ÷ 3', how: '12 个百 ÷ 3 = 4 个百 = 400', ans: '400', value: 400, unit: '个百', n: 4 },
  { expr: '1200 ÷ 400', how: '12 个百 ÷ 4 个百 = 12 ÷ 4 = 3（计数单位相同，直接比个数）', ans: '3', value: 3, unit: '（同单位）', n: 3 },
  { expr: '135 + 24', how: '5 个一 + 4 个一 = 9 个一；3 个十 + 2 个十 = 5 个十；1 个百', ans: '159', value: 159, unit: '个一', n: 9 },
  { expr: '3.4 + 1.25', how: '34 个 0.1 + 125 个 0.01 = 340 个 0.01 + 125 个 0.01 = 465 个 0.01', ans: '4.65', value: 4.65, unit: '0.01', n: 465 },
]

export function opExample(sel: number) {
  return OP_EXAMPLES[((Math.round(sel) % OP_EXAMPLES.length) + OP_EXAMPLES.length) % OP_EXAMPLES.length]!
}

/* ---------------- 二进制 ---------------- */
/** 二进制各位：位权从高到低，恒按实际位数给权重（不再写死 5 位） */
export function binaryBits(dec: number): { bit: number; weight: number; count: number }[] {
  const bin = Math.max(0, Math.round(dec)).toString(2)
  return bin.split('').map((ch, i) => {
    const weight = 2 ** (bin.length - 1 - i)
    return { bit: Number(ch), weight, count: Number(ch) * weight }
  })
}

const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 二进制读法：101 → 一零一（逐位读，不能读成一百零一） */
export function binaryReading(bin: string): string {
  return bin
    .split('')
    .map((ch) => CN_DIGITS[Number(ch)] ?? ch)
    .join('')
}

/** 除以 2 取余的过程（余数倒序 = 二进制） */
export function binaryDivisionSteps(dec: number): { expr: string; result: string }[] {
  const steps: { expr: string; result: string }[] = []
  let v = Math.max(0, Math.round(dec))
  if (v === 0) return [{ expr: '0 ÷ 2', result: '商 0 余 0' }]
  while (v > 0) {
    steps.push({ expr: `${v} ÷ 2`, result: `商 ${Math.floor(v / 2)} 余 ${v % 2}` })
    v = Math.floor(v / 2)
  }
  return steps
}

/** 满二进一的现场：给出 dec 之前最近的「进位处」（2 的整数次幂） */
export function carryBoundary(dec: number): { from: number; to: number; fromBin: string; toBin: string } {
  const v = Math.max(1, Math.round(dec))
  let p = 1
  while (p * 2 <= v) p *= 2
  return {
    from: p - 1,
    to: p,
    fromBin: (p - 1).toString(2),
    toBin: p.toString(2),
  }
}

/** 分数化简（保留给需要展示最简分数的地方） */
export function reduceFraction(n: number, d: number): [number, number] {
  const g = gcd(Math.abs(n), Math.abs(d)) || 1
  return [n / g, d / g]
}
