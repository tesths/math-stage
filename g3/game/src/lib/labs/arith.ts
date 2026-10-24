/**
 * 三年级计算类 Lab 的纯函数内核（不依赖 Vue，可被单元测试直接复算）。
 *
 * 抽出来的理由（本轮 L0 要求"数学正确性可被测试"）：
 * - 竖式乘法的**进位链**必须显式：4 × 3 = 12 → 写 2 进 1 → 十位 1 × 3 + 进 1 = 4。
 *   散在组件里时，"分步思考"面板就漏掉进位的 1，图与算式各说一套。
 * - 估算"够不够"不能只看一个估计值：把单价四舍五入后既可能估大也可能估小，
 *   估小的时候"估出来的钱 ≤ 带的钱"并不能推出"一定够买"。
 * - 间隔排列的两种物体个数由"两端是否相同"决定，是纯计数问题。
 */

/** 竖式中一列的信息（从高位到低位排列） */
export interface MulCol {
  /** 数位序号（个位为 0）；纯进位列记为 digits.length */
  place: number
  /** 该列原有的数字；纯进位列为 null */
  src: number | null
  /** 进入这一列时已经带上来的进位 */
  carryIn: number
  /** 这一列再产生的进位 */
  carryOut: number
  /** 这一列写的数字 */
  digit: number
  /** src × multi + carryIn */
  prod: number
}

export interface VerticalMul {
  /** 从高位到低位的各列 */
  cols: MulCol[]
  /** 从个位开始计算的顺序（cols 的下标） */
  order: number[]
  product: number
  /** 与 order 一一对应的说明文字（含进位相加） */
  notes: string[]
}

/**
 * 一位数乘法竖式：4 × 3 = 12 → 写 2 进 1；十位 3 × 3 + 进 1 = 10 → 写 0 进 1。
 * 返回的 notes 与 order 一一对应，组件与 compute 共用同一份文字。
 */
export function verticalMul(digits: number[], multi: number): VerticalMul {
  const cols: MulCol[] = []
  let carry = 0
  for (let i = digits.length - 1; i >= 0; i--) {
    const src = digits[i]!
    const prod = src * multi + carry
    cols.unshift({
      place: i,
      src,
      carryIn: carry,
      carryOut: Math.floor(prod / 10),
      digit: prod % 10,
      prod,
    })
    carry = Math.floor(prod / 10)
  }
  if (carry > 0) {
    cols.unshift({ place: digits.length, src: null, carryIn: carry, carryOut: 0, digit: carry, prod: carry })
  }

  const order: number[] = []
  for (let i = cols.length - 1; i >= 0; i--) {
    if (cols[i]!.src !== null) order.push(i)
  }
  if (cols[0]!.src === null) order.push(0)

  const notes = order.map((colIdx) => {
    const c = cols[colIdx]!
    if (c.src === null) return `最高位写下最后的进位 ${c.carryIn}`
    const carryPart = c.carryIn > 0 ? ` + 进${c.carryIn}` : ''
    const head = `${c.src} × ${multi}${carryPart} = ${c.prod}`
    const write = `，这一位写 ${c.digit}`
    const next = c.carryOut > 0 ? `，向高一位进 ${c.carryOut}` : ''
    return `${head}${write}${next}`
  })

  const product = digits.reduce((acc, d) => acc * 10 + d, 0) * multi
  return { cols, order, product, notes }
}

export type EnoughVerdict = 'enough' | 'not-enough' | 'unsure'

export interface EstimateResult {
  /** 把单价往小估（退到整十数）得到的钱数 */
  lower: number
  /** 把单价往大估（进到整十数）得到的钱数 */
  upper: number
  /** 精确值 */
  exact: number
  lowerPrice: number
  upperPrice: number
  verdict: EnoughVerdict
  text: string
}

/**
 * "带的钱够不够买"的估算三值判定。
 *
 * 教材的做法是把单价看作接近的整十数再乘数量：
 * - 往**大**估计（估大法）得到的钱数都不超过带的钱 → 一定够；
 * - 往**小**估计（估小法）得到的钱数已经超过带的钱 → 一定不够；
 * - 两者之间（估大超了、估小没超）→ 估算**不能确定**，必须精算。
 * 旧实现只看一个四舍五入后的估计值，28 → 30 时恰好对，24 → 20 时会把
 * "24 × 9 = 216 元 > 180 元"错判成"够买"（真错误，本轮修掉）。
 */
export function estimateEnough(price: number, count: number, money: number): EstimateResult {
  const lowerPrice = Math.floor(price / 10) * 10
  const upperPrice = Math.ceil(price / 10) * 10
  const lower = lowerPrice * count
  const upper = upperPrice * count
  const exact = price * count

  let verdict: EnoughVerdict
  if (upper <= money) verdict = 'enough'
  else if (lower > money) verdict = 'not-enough'
  else verdict = 'unsure'

  const text =
    verdict === 'enough'
      ? `估大：${upperPrice} × ${count} = ${upper} ≤ ${money}，所以一定够买（精算 ${exact} 元）`
      : verdict === 'not-enough'
        ? `估小：${lowerPrice} × ${count} = ${lower} > ${money}，所以一定不够买（精算 ${exact} 元）`
        : `估大 ${upper} 元超了、估小 ${lower} 元没超，估算不能确定，要精算：${price} × ${count} = ${exact} 元`

  return { lower, upper, exact, lowerPrice, upperPrice, verdict, text }
}

export interface IntervalCounts {
  /** 两端出现的那个物体的个数 */
  endObject: number
  /** 另一种物体的个数 */
  other: number
  /** 两端是否同一种物体 */
  sameEnds: boolean
}

/**
 * 间隔排列：两端物体的个数 n 已定时，另一种物体的个数。
 * 两端相同 → 另一种少 1 个；两端不同 → 两种一样多。
 */
export function intervalCounts(n: number, end: 0 | 1 | 2): IntervalCounts {
  const sameEnds = end !== 1
  return { endObject: n, other: sameEnds ? n - 1 : n, sameEnds }
}

export interface MatchResult {
  /** 需要多少块 */
  count: number
  /** 是否正好称平 */
  exact: boolean
  /** 石块总质量 = count × each */
  total: number
  /** 差多少才到目标质量（正数表示还差） */
  gap: number
}

/**
 * 曹冲称象：船下沉到同一水位，说明石头总质量 = 大象质量。
 * 旧实现把"大象质量"直接定义成"每块 × 块数"（`大象 = 石头` 本身就是被求的结论），
 * 属于循环论证；改成先给定大象质量，由 student 一块一块加石头去逼近。
 */
export function stonesToMatch(mass: number, each: number): MatchResult {
  const count = Math.ceil(mass / each)
  const total = count * each
  return { count, exact: total === mass, total, gap: total - mass }
}
