import { describe, expect, it } from 'vitest'
import { quotientText, roundDivisor, trialDivide, trialRound } from '@/lib/labs/divTry'

describe('roundDivisor · 四舍五入把除数看作整十数', () => {
  it('24 → 20（四舍）、36 → 40（五入）、20 → 20', () => {
    expect(roundDivisor(24)).toEqual({ rounded: 20, method: '四舍' })
    expect(roundDivisor(36)).toEqual({ rounded: 40, method: '五入' })
    expect(roundDivisor(20)).toEqual({ rounded: 20, method: '四舍' })
    expect(roundDivisor(15)).toEqual({ rounded: 20, method: '五入' })
  })
})

describe('trialDivide · 96 ÷ 24（四舍试商，商正好）', () => {
  const r = trialDivide(96, 24)

  it('商 4，没有余数', () => {
    expect(r.quotient).toBe(4)
    expect(r.remainder).toBe(0)
    expect(quotientText(r)).toBe('96 ÷ 24 = 4')
  })

  it('试商过程：把 24 看作 20，初商 4，4 × 24 = 96 正好', () => {
    expect(r.rounded).toBe(20)
    expect(r.method).toBe('四舍')
    expect(r.rounds).toHaveLength(1)
    const round = r.rounds[0]!
    expect(round.curVal).toBe(96)
    expect(round.steps[0]).toMatchObject({ kind: 'trial', qd: 4 })
    expect(round.steps.map((s) => s.kind)).toEqual(['trial', 'settle'])
    expect(r.notes[0]).toContain('把 24 看作 20')
    expect(r.notes.at(-1)).toContain('96')
  })

  it('商写在个位上（96 的两位一起除）', () => {
    expect(r.rounds[0]!.place).toBe('个位')
  })
})

describe('trialDivide · 192 ÷ 24（初商偏大要调小）', () => {
  const r = trialDivide(192, 24)

  it('商 8', () => {
    expect(r.quotient).toBe(8)
    expect(r.remainder).toBe(0)
  })

  it('初商 9 偏大（9 × 24 = 216 > 192），调成 8', () => {
    const round = r.rounds[0]!
    expect(round.steps.map((s) => s.kind)).toEqual(['trial', 'bigger', 'settle'])
    expect(round.steps[0]!.qd).toBe(9)
    expect(round.steps[1]!.text).toContain('初商偏大')
    expect(round.qd).toBe(8)
  })
})

describe('trialDivide · 252 ÷ 36（商偏小要调大）', () => {
  const r = trialDivide(252, 36)

  it('商 7', () => {
    expect(r.quotient).toBe(7)
    expect(r.remainder).toBe(0)
  })

  it('36 五入看成 40，初商 6 余 36（余数不小于除数）→ 调成 7', () => {
    expect(r.method).toBe('五入')
    const round = r.rounds[0]!
    expect(round.steps.map((s) => s.kind)).toEqual(['trial', 'smaller', 'settle'])
    expect(round.steps[0]!.qd).toBe(6)
    expect(round.steps[1]!.text).toContain('商偏小')
    expect(round.qd).toBe(7)
  })
})

describe('trialDivide · 三位数除以两位数要落两次数位', () => {
  it('768 ÷ 24 = 32，两轮试商，商分别写在十位和个位', () => {
    const r = trialDivide(768, 24)
    expect(r.quotient).toBe(32)
    expect(r.remainder).toBe(0)
    expect(r.rounds.map((x) => x.place)).toEqual(['十位', '个位'])
    expect(r.rounds[0]!.qd).toBe(3)
    expect(r.rounds[1]!.qd).toBe(2)
  })

  it('有余数时余数必须比除数小：200 ÷ 24 = 8 余 8', () => {
    const r = trialDivide(200, 24)
    expect(r.quotient).toBe(8)
    expect(r.remainder).toBe(8)
    expect(r.remainder).toBeLessThan(r.divisor)
    expect(quotientText(r)).toBe('200 ÷ 24 = 8……8')
  })
})

describe('trialRound · 单轮试商一定能收敛', () => {
  it('128 ÷ 36：初商 3，3 × 36 = 108，余 20 < 36 → 定商 3', () => {
    const { steps, qd } = trialRound(128, 36, 40)
    expect(qd).toBe(3)
    expect(steps.at(-1)!.kind).toBe('settle')
    expect(128 - qd * 36).toBeLessThan(36)
  })

  it('任何一轮定商后都满足 0 ≤ 余数 < 除数', () => {
    for (const [cur, div] of [[96, 24], [192, 24], [252, 36], [500, 36], [99, 47]] as const) {
      const { rounded } = roundDivisor(div)
      const { qd } = trialRound(cur, div, rounded)
      const rest = cur - qd * div
      expect(rest).toBeGreaterThanOrEqual(0)
      expect(rest).toBeLessThan(div)
    }
  })
})
