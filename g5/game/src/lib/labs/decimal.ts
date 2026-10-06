/**
 * 小数乘除法的纯算理（竖直乘法、平均分、小数点移动）。
 *
 * 这些都要能被单元测试逐条复算，避免三类别扭的错：
 * - 竖式的部分积要按位对齐，部分积之和必须等于整数积；
 * - 「平均分」模型不能像早期实现那样写死 `10 ÷ 份数` 个角（9.6 ÷ 3 时只有 3 角、合计 9.9 ≠ 9.6），
 *   必须按 元→角→分 逐级分完，且 份数 × 每份 + 余数 = 总数；
 * - 小数点移动用十进制字符串移位，避免 0.07 × 100 = 7.000000000000001 这类浮点噪声。
 */

/** 小数位数（按十进制字符串判断） */
export function decimalPlaces(v: number): number {
  const s = String(Math.abs(v))
  if (s.includes('e') || s.includes('E')) {
    const [mant, exp] = s.split(/[eE]/)
    const mFrac = (mant ?? '').split('.')[1]?.length ?? 0
    return Math.max(0, mFrac - Number(exp ?? 0))
  }
  return s.split('.')[1]?.length ?? 0
}

function parseDecimal(v: number): { digits: bigint; scale: number; sign: 1 | -1 } {
  const neg = v < 0
  const s = String(Math.abs(v))
  if (s.includes('e') || s.includes('E')) {
    const [mant = '0', exp = '0'] = s.split(/[eE]/)
    const [mi = '0', mf = ''] = mant.split('.')
    const shift = Number(exp) - mf.length
    const digitsStr = (mi + mf).replace(/^0+(?=\d)/, '') || '0'
    if (shift >= 0) return { digits: BigInt(digitsStr + '0'.repeat(shift)), scale: 0, sign: neg ? -1 : 1 }
    return { digits: BigInt(digitsStr), scale: -shift, sign: neg ? -1 : 1 }
  }
  const [i = '0', f = ''] = s.split('.')
  return { digits: BigInt((i + f).replace(/^0+(?=\d)/, '') || '0'), scale: f.length, sign: neg ? -1 : 1 }
}

/** 由整数与小数位数还原数值（避免浮点误差） */
export function fromScaled(digits: bigint, scale: number, sign: 1 | -1 = 1): number {
  const text = digits.toString().padStart(scale + 1, '0')
  const body = scale === 0 ? text : `${text.slice(0, -scale)}.${text.slice(-scale)}`
  return Number(body) * sign
}

/**
 * 干净的小数字符串：去掉多余的 0，并抹掉浮点噪声。
 * 先按 10 位定点四舍五入，`0.07 × 100 = 7.000000000000001` → "7"。
 */
export function decimalText(v: number, maxFrac = 10): string {
  if (!Number.isFinite(v)) return String(v)
  const s = v.toFixed(maxFrac).replace(/0+$/, '').replace(/\.$/, '')
  return s === '' || s === '-' ? '0' : s
}

/** 小数点移动 power 位（divide=true 向左），用十进制字符串移位 */
export function shiftDecimalPoint(v: number, power: number, divide = false): number {
  const p = Math.max(0, Math.round(power))
  const { digits, scale, sign } = parseDecimal(v)
  const newScale = divide ? scale + p : Math.max(0, scale - p)
  const extra = divide ? 0 : Math.max(0, p - scale)
  return fromScaled(digits * 10n ** BigInt(extra), newScale, sign)
}

/** 把小数按位拆成 { 位权: 数字 }（个位 = 0，十分位 = -1） */
export function placeDigits(v: number): Map<number, number> {
  const map = new Map<number, number>()
  const { digits, scale } = parseDecimal(v)
  const text = digits.toString()
  for (let i = 0; i < text.length; i++) {
    const pos = text.length - 1 - i - scale
    map.set(pos, Number(text[i]))
  }
  // 小于 1 的数要补上「个位 0」，数位表才能显示 0.135 的个位
  const hasInteger = [...map.keys()].some((p) => p >= 0)
  if (!hasInteger) map.set(0, 0)
  return map
}

/**
 * 竖式乘法：把 price 先当整数算，再点小数点。
 * partials：每一位乘数的部分积（带左移位数，用于对齐显示）。
 */
export interface VerticalMul {
  intPrice: number
  decimals: number
  partials: { digit: number; value: number; shift: number; text: string }[]
  intProduct: number
  product: number
  productText: string
}

export function verticalMul(price: number, count: number): VerticalMul {
  const decimals = decimalPlaces(price)
  const { digits } = parseDecimal(price)
  const intPrice = Number(digits)
  const c = Math.max(0, Math.round(count))
  const digitsOfCount = String(c).split('').map(Number)
  const partials = digitsOfCount
    .map((digit, i) => {
      const shift = digitsOfCount.length - 1 - i
      return { digit, value: intPrice * digit * 10 ** shift, shift, text: String(intPrice * digit) }
    })
    .filter((p) => p.digit !== 0 || digitsOfCount.length === 1)
  const intProduct = intPrice * c
  const product = shiftDecimalPoint(intProduct, decimals, true)
  return { intPrice, decimals, partials, intProduct, product, productText: decimalText(product) }
}

/** 竖直乘法：部分积之和必须等于整数积 */
export function partialsSum(v: VerticalMul): number {
  return v.partials.reduce((acc, p) => acc + p.value, 0)
}

/**
 * 平均分模型：按 元 → 角 → 分 逐级平均分，余下的换到下一级继续分。
 * 每级给出「每份几个单位」和「分不尽的剩余单位」，末级剩余就是真余数。
 */
export interface SplitLevel {
  /** 单位大小：1 元 / 0.1 元（角）/ 0.01 元（分） */
  unit: number
  label: string
  /** 这一级一共有多少个单位 */
  units: number
  /** 每份分到几个单位 */
  perGroup: number
  /** 分不尽的剩余单位 */
  leftover: number
}

export interface SplitResult {
  levels: SplitLevel[]
  /** 每份的总值 */
  perGroup: number
  perGroupText: string
  /** 最后剩下多少（除不尽时 > 0） */
  remainder: number
  exact: boolean
}

export function splitShares(total: number, divisor: number, extraLevels = 1): SplitResult {
  const d = Math.max(1, Math.round(divisor))
  const defs: { unit: number; label: string }[] = [
    { unit: 1, label: '元' },
    { unit: 0.1, label: '角' },
    { unit: 0.01, label: '分' },
  ]
  const places = placeDigits(total)
  const levels: SplitLevel[] = []
  // 级数：元 + 小数位（角/分…）+ 额外 1 级，最多 3 级
  const count = Math.min(3, 1 + Math.max(1, decimalPlaces(total)) + extraLevels - 1)
  let leftover = 0
  let per = 0
  for (let i = 0; i < count; i++) {
    const def = defs[i]!
    // 本级可分的「单位」数：元级 = 全部整元；后面每级 = 上一级余数 × 10 + 本位的数字
    const digit = i === 0 ? 0 : (places.get(-i) ?? 0)
    const units = i === 0 ? Math.floor(Math.abs(total)) : leftover * 10 + digit
    const perGroup = Math.floor(units / d)
    leftover = units - perGroup * d
    levels.push({ unit: def.unit, label: def.label, units, perGroup, leftover })
    per += perGroup * def.unit
  }
  const perGroup = Number(per.toFixed(6))
  const last = levels[levels.length - 1]!
  const remainder = Number((last.leftover * last.unit).toFixed(6))
  return {
    levels,
    perGroup,
    perGroupText: decimalText(perGroup),
    remainder,
    exact: Math.abs(remainder) < 1e-9,
  }
}

/** 每份 × 份数 + 余数 必须等于总数（自检用） */
export function splitCheck(total: number, divisor: number, r: SplitResult): number {
  return Number((r.perGroup * divisor + r.remainder - total).toFixed(6))
}
