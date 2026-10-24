/**
 * 四年级「两、三位数除以两位数」的试商内核。
 *
 * 抽出来的理由（本轮 L0）：旧实现把"商"直接用精确除法算出来
 * （`Math.floor(dividend / divisor)`），再补一句"验算通过"，
 * 学生根本看不到"把 24 看作 20，初商 4，4 × 24 = 96 正好"这样的过程，
 * 更看不到"初商偏大要调小、偏小要调大"——这是一个循环论证的空转（P1）。
 *
 * 这里的算法与课本一致：
 *   1. 把除数"四舍五入"看成整十数；
 *   2. 用整十数试商；
 *   3. 乘积大于被除数 → 初商偏大，调小；余数 ≥ 除数 → 商偏小，调大；
 *   4. 定商，写下乘积与余数，落下一个数位继续除。
 */

export interface TrialStep {
  /** bigger = 初商偏大（乘积超过被除数）；smaller = 商偏小（余数还不小于除数） */
  kind: 'trial' | 'bigger' | 'smaller' | 'settle'
  qd: number
  product: number
  text: string
}

export interface TryRound {
  /** 本轮实际拿来除的数（余数落位后的"当前被除数"） */
  curVal: number
  /** 这一位商写在什么数位上面 */
  place: string
  /** 试商过程：trial → (bigger|smaller)* → settle */
  steps: TrialStep[]
  /** 最终定下来的商 */
  qd: number
  /** 商 × 除数 */
  product: number
  /** 余数 */
  remainder: number
  /** 只有一位商时，商的个位数就是 qd；多位数时见 quotient */
  col: number
}

export interface TryResult {
  divisor: number
  dividend: number
  /** 四舍五入后的整十数 */
  rounded: number
  /** 用的是"四舍"还是"五入" */
  method: '四舍' | '五入'
  rounds: TryRound[]
  quotient: number
  remainder: number
  /** 每轮试商的文字（给分步思考面板直接显示） */
  notes: string[]
}

function placeName(totalDigits: number, col: number): string {
  const place = totalDigits - 1 - col
  return place === 0 ? '个位' : place === 1 ? '十位' : place === 2 ? '百位' : '千位'
}

/** 除数看成整十数：个位 <5 四舍，≥5 五入 */
export function roundDivisor(divisor: number): { rounded: number; method: '四舍' | '五入' } {
  const ones = divisor % 10
  const tens = Math.floor(divisor / 10) * 10
  if (ones === 0) return { rounded: divisor, method: '四舍' }
  return ones < 5 ? { rounded: tens, method: '四舍' } : { rounded: tens + 10, method: '五入' }
}

/**
 * 一轮试商：先用整十数试，再看偏大/偏小调商，最后定商。
 * 返回的 steps 里能直接读出"初商几、偏大还是偏小、调成几"。
 */
export function trialRound(curVal: number, divisor: number, rounded: number): { steps: TrialStep[]; qd: number } {
  const steps: TrialStep[] = []
  let qd = Math.max(0, Math.min(9, Math.floor(curVal / rounded)))
  steps.push({
    kind: 'trial',
    qd,
    product: qd * divisor,
    text: `把 ${divisor} 看作 ${rounded}：${curVal} 里最多有 ${qd} 个 ${rounded}，初商 ${qd}`,
  })
  let guard = 0
  while (guard++ < 20) {
    const product = qd * divisor
    if (product > curVal) {
      qd -= 1
      steps.push({
        kind: 'bigger',
        qd,
        product: qd * divisor,
        text: `初商偏大：${(qd + 1) * divisor} > ${curVal}，调小成 ${qd}`,
      })
      continue
    }
    if (curVal - product >= divisor) {
      qd += 1
      steps.push({
        kind: 'smaller',
        qd,
        product: qd * divisor,
        text: `商偏小：余 ${curVal - product} 还不小于除数 ${divisor}，调大成 ${qd}`,
      })
      continue
    }
    break
  }
  const product = qd * divisor
  steps.push({
    kind: 'settle',
    qd,
    product,
    text: `定商 ${qd}：${qd} × ${divisor} = ${product}，${curVal} − ${product} = ${curVal - product}`,
  })
  return { steps, qd }
}

/** 完整的两、三位数除以两位数（逐位落数，每轮都走一遍试商） */
export function trialDivide(dividend: number, divisor: number): TryResult {
  const { rounded, method } = roundDivisor(divisor)
  const digs = String(Math.abs(Math.round(dividend))).split('').map(Number)
  const total = digs.length
  const rounds: TryRound[] = []
  let rem = 0
  let quotient = 0
  let first = false
  for (let i = 0; i < total; i++) {
    rem = rem * 10 + digs[i]!
    if (!first && rem < divisor) {
      // 这一位不够商 1，继续看下一位
      continue
    }
    first = true
    const { steps, qd } = trialRound(rem, divisor, rounded)
    const product = qd * divisor
    rounds.push({
      curVal: rem,
      place: placeName(total, i),
      steps,
      qd,
      product,
      remainder: rem - product,
      col: i,
    })
    quotient = quotient * 10 + qd
    rem = rem - product
  }
  return {
    divisor,
    dividend,
    rounded,
    method,
    rounds,
    quotient,
    remainder: rem,
    notes: rounds.flatMap((r) => r.steps.map((s) => s.text)),
  }
}

/** 一句话结论（商……余……） */
export function quotientText(r: TryResult): string {
  return `${r.dividend} ÷ ${r.divisor} = ${r.quotient}${r.remainder ? `……${r.remainder}` : ''}`
}
