/**
 * 数量关系的纯逻辑：估算的上下界、分段计费、分数混合运算、比一个数多（少）几分之几。
 *
 * 要点：
 * - 估算「够不够」必须给**三值**结论：用估大法得到最少剩余，若仍够 → 一定够；
 *   用估小法得到最多剩余，若仍不够 → 一定不够；否则无法确定（原来只有两值判断，容易说错）。
 * - 分段计费要处理「不足 1 千米按 1 千米计算」的进位，并保证费用随路程不减。
 */
import { fractionText } from './fractions'

/* ---------------- 估算购物 ---------------- */
export type Verdict = 'definitely' | 'never' | 'maybe'

/** 课本 p018 已买的商品与要比较的两样东西 */
export const SHOP_GOODS: EstimateGood[] = [
  { name: '鸡蛋', price: 19.6, n: 1 },
  { name: '牛奶', price: 30.4, n: 2 },
]
export const FLOUR_PRICE = 16.8
export const RICE_PRICE = 21.6

export interface EstimateGood {
  name: string
  price: number
  n: number
}

export interface EstimateResult {
  budget: number
  /** 估大法：把已买商品的价钱都往上估，得到「最少剩多少」 */
  spendHigh: number
  leftHigh: number
  /** 估小法：把价钱都往下估，得到「最多剩多少」 */
  spendLow: number
  leftLow: number
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

/** 去掉多余的 0（0.5 → "0.5"，18 → "18"） */
function decimalText(v: number): string {
  const s = v.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')
  return s === '' || s === '-' ? '0' : s
}

export function estimateShop(budget: number, goods: EstimateGood[]): EstimateResult {
  // 课本的估法：估大法把价钱「往上估到整元」（19.6 → 20、30.4 → 31），
  // 估小法「往下估到整元」（19.6 → 19、30.4 → 30）
  const spendHigh = goods.reduce((acc, g) => acc + Math.ceil(g.price) * g.n, 0)
  const spendLow = goods.reduce((acc, g) => acc + Math.floor(g.price) * g.n, 0)
  const leftHigh = round2(budget - spendHigh)
  const leftLow = round2(budget - spendLow)
  return { budget, spendHigh, leftHigh, spendLow, leftLow }
}

/**
 * 剩下的钱够不够买某件商品：
 * 最少剩余 ≥ 价钱 → 一定够；最多剩余 < 价钱 → 一定不够；否则无法确定。
 * （课本 p018 就是拿剩下的钱分别与面粉 16.8 元、大米 21.6 元比。）
 */
export function affordableVerdict(r: EstimateResult, price: number): Verdict {
  if (r.leftHigh >= price) return 'definitely'
  if (r.leftLow < price) return 'never'
  return 'maybe'
}

export const VERDICT_TEXT: Record<Verdict, string> = {
  definitely: '一定够',
  never: '一定不够',
  maybe: '无法确定',
}

/* ---------------- 分段计费 ---------------- */
export interface PiecewiseResult {
  km: number
  withinBase: boolean
  /** 起步价包含的千米数 */
  baseKm: number
  baseFee: number
  /** 超出部分按「不足 1 千米按 1 千米」进位后的千米数 */
  extraKm: number
  extraFee: number
  fee: number
  /** 是否发生了进位（路程不是整数千米时） */
  roundedUp: boolean
}

export function piecewiseFee(km: number, baseKm = 3, baseFee = 10, perKm = 2.2): PiecewiseResult {
  const withinBase = km <= baseKm
  const raw = Math.max(0, km - baseKm)
  const extraKm = withinBase ? 0 : Math.ceil(raw - 1e-9)
  const extraFee = round2(extraKm * perKm)
  return {
    km,
    withinBase,
    baseKm,
    baseFee,
    extraKm,
    extraFee,
    fee: round2(baseFee + extraFee),
    roundedUp: !withinBase && extraKm > raw,
  }
}

/* ---------------- 分数混合运算（中国结） ---------------- */
export interface FracMixResult {
  parts: [number, number]
  fraction1: string
  fraction2: string
  each: [number, number]
  method1: string
  method2: string
  total: number
}

export function fracMix(a: number, b: number, n: number): FracMixResult {
  const each1 = round2((a / (a + b)) * n)
  const each2 = round2((b / (a + b)) * n)
  const sumFraction = (a + b) / (a + b)
  return {
    parts: [a, b],
    fraction1: fractionText(a, a + b),
    fraction2: fractionText(b, a + b),
    each: [each1, each2],
    method1: `${fractionText(a, a + b)}×${n} + ${fractionText(b, a + b)}×${n} = ${decimalText(each1)} + ${decimalText(each2)} = ${decimalText(round2(each1 + each2))}`,
    method2: `(${fractionText(a, a + b)} + ${fractionText(b, a + b)}) × ${n} = ${decimalText(sumFraction)} × ${n} = ${decimalText(round2(sumFraction * n))}`,
    total: round2(each1 + each2),
  }
}

/* ---------------- 合理取近似值（去尾 / 进一） ---------------- */
export interface RoundLifeResult {
  mode: 'floor' | 'ceil'
  /** 被除数（总钱数 / 总油量） */
  total: number
  /** 除数（单价 3.5 元/支 或 每个油壶装 2.5 千克） */
  unit: number
  quotient: number
  result: number
  /** 按 result 个（支）算出的量 */
  usedValue: number
  /** 再多一个（支）需要的量，用于验算 */
  nextValue: number
  /** 剩下的量（去尾法：剩下的钱） */
  remainder: number
}

/** 去尾法：用 total 元买单价 3.5 元的铅笔，最多买几支 */
export function roundLifeFloor(total: number, price = 3.5): RoundLifeResult {
  const quotient = round2(total / price)
  const result = Math.floor(round2(total / price) + 1e-9)
  return {
    mode: 'floor',
    total,
    unit: price,
    quotient,
    result,
    usedValue: round2(price * result),
    nextValue: round2(price * (result + 1)),
    remainder: round2(total - price * result),
  }
}

/** 进一法：total 千克油，每个油壶最多装 cap 千克，至少需要几个油壶 */
export function roundLifeCeil(total: number, cap = 2.5): RoundLifeResult {
  const quotient = round2(total / cap)
  const result = Math.ceil(round2(total / cap) - 1e-9)
  return {
    mode: 'ceil',
    total,
    unit: cap,
    quotient,
    result,
    // 对进一法而言 usedValue 是「少一个能装多少」（验算下界），nextValue 是「result 个能装多少」
    usedValue: round2(cap * (result - 1)),
    nextValue: round2(cap * result),
    remainder: round2(cap * result - total),
  }
}

export function roundLife(total: number, method: number): RoundLifeResult {
  return method === 0 ? roundLifeFloor(total) : roundLifeCeil(total)
}

/* ---------------- 比一个数多（少）几分之几 ---------------- */
export interface SegmentMoreResult {
  base: number
  delta: number
  result: number
  fraction: string
  increase: boolean
  /** 结果是否还是整数（天数、人数这类离散量需要整数） */
  integral: boolean
}

export function segmentMore(base: number, fn: number, fd: number, mode: number): SegmentMoreResult {
  const increase = mode === 0
  const delta = round2((base * fn) / fd)
  const result = round2(increase ? base + delta : base - delta)
  return {
    base,
    delta,
    result,
    fraction: fractionText(fn, fd),
    increase,
    integral: Math.abs(result - Math.round(result)) < 1e-9,
  }
}
