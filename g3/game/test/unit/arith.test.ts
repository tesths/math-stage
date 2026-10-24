import { describe, expect, it } from 'vitest'
import { estimateEnough, intervalCounts, stonesToMatch, verticalMul } from '@/lib/labs/arith'

describe('verticalMul · 竖式乘法的分步（含进位）', () => {
  it('14 × 3：个位 12 写 2 进 1，十位 1 × 3 + 进 1 = 4', () => {
    const r = verticalMul([1, 4], 3)
    expect(r.product).toBe(42)
    expect(r.notes[0]).toContain('4 × 3 = 12')
    expect(r.notes[0]).toContain('进 1')
    expect(r.notes[1]).toContain('1 × 3 + 进1 = 4')
  })

  it('234 × 3：连续进位，每一位都要把进上来的数加上', () => {
    const r = verticalMul([2, 3, 4], 3)
    expect(r.product).toBe(702)
    expect(r.notes[0]).toContain('4 × 3 = 12')
    expect(r.notes[1]).toContain('3 × 3 + 进1 = 10')
    expect(r.notes[2]).toContain('2 × 3 + 进1 = 7')
  })

  it('102 × 4：中间 0 也要写 0 占位，结果 408', () => {
    const r = verticalMul([1, 0, 2], 4)
    expect(r.product).toBe(408)
    expect(r.notes[1]).toContain('这一位写 0')
  })

  it('45 × 3 的积比被乘数多一位时，列数按积补齐', () => {
    const r = verticalMul([4, 5], 3)
    expect(r.product).toBe(135)
    expect(r.cols.length).toBe(3)
  })
})

describe('estimateEnough · 估算"够不够"必须是三值逻辑', () => {
  it('28 × 4 = 112，带 120 元：估大 30 × 4 = 120 不超 → 一定够', () => {
    const r = estimateEnough(28, 4, 120)
    expect(r.verdict).toBe('enough')
    expect(r.upper).toBe(120)
    expect(r.exact).toBe(112)
  })

  it('28 × 4 = 112，带 75 元：估小 20 × 4 = 80 已超 → 一定不够', () => {
    const r = estimateEnough(28, 4, 75)
    expect(r.verdict).toBe('not-enough')
    expect(r.lower).toBe(80)
  })

  it('28 × 4 = 112，带 100 元：估大超、估小没超 → 不能只靠估算下结论', () => {
    const r = estimateEnough(28, 4, 100)
    expect(r.verdict).toBe('unsure')
    expect(r.text).toContain('不能确定')
    expect(r.text).toContain('112')
  })

  it('整十数也能算（40 × 3 = 120，带 100 元一定不够）', () => {
    expect(estimateEnough(40, 3, 100).verdict).toBe('not-enough')
    expect(estimateEnough(40, 3, 200).verdict).toBe('enough')
  })
})

describe('intervalCounts · 间隔排列的两种物体个数', () => {
  it('两端都是圆形物体：圆形比方形多 1', () => {
    const r = intervalCounts(6, 0)
    expect(r.endObject).toBe(6)
    expect(r.other).toBe(5)
    expect(r.sameEnds).toBe(true)
  })

  it('两端不同：两种一样多', () => {
    const r = intervalCounts(6, 1)
    expect(r.endObject).toBe(6)
    expect(r.other).toBe(6)
    expect(r.sameEnds).toBe(false)
  })

  it('两端都是另一种物体：反过来多 1', () => {
    const r = intervalCounts(6, 2)
    expect(r.endObject).toBe(6)
    expect(r.other).toBe(5)
    expect(r.sameEnds).toBe(true)
  })
})

describe('stonesToMatch · 曹冲称象的"要几块石头"', () => {
  it('象重 2000 千克、每块 200 千克 → 正好 10 块', () => {
    const r = stonesToMatch(2000, 200)
    expect(r.count).toBe(10)
    expect(r.exact).toBe(true)
    expect(r.total).toBe(2000)
    expect(r.gap).toBe(0)
  })

  it('象重 2100 千克、每块 200 千克 → 11 块（多 100 千克）', () => {
    const r = stonesToMatch(2100, 200)
    expect(r.count).toBe(11)
    expect(r.exact).toBe(false)
    expect(r.total).toBe(2200)
    expect(r.gap).toBe(100)
  })
})
