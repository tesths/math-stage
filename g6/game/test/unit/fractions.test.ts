import { describe, expect, it } from 'vitest'
import { fractionCount, fractionDecimal, fractionText, isTerminating, reduce, snapUpToMultiple, unitFractionSum } from '@/lib/labs/fractions'

describe('分数与工程问题', () => {
  it('单位分数相加化成最简分数', () => {
    expect(unitFractionSum(6, 3)).toEqual([1, 2])
    expect(fractionText(1, 2)).toBe('1/2')
    expect(unitFractionSum(5, 7)).toEqual([12, 35])
    expect(fractionText(12, 35)).toBe('12/35')
    expect(unitFractionSum(4, 4)).toEqual([1, 2])
    expect(reduce(35, 12)).toEqual([35, 12])
  })

  it('有限小数判定：分母只含 2、5 才化得尽', () => {
    expect(isTerminating(2)).toBe(true)
    expect(isTerminating(4)).toBe(true)
    expect(isTerminating(8)).toBe(true)
    expect(isTerminating(5)).toBe(true)
    expect(isTerminating(3)).toBe(false)
    expect(isTerminating(7)).toBe(false)
    expect(isTerminating(12)).toBe(false)
  })

  it('1/2 → 0.5（精确）；35/12 → 2.92（近似，不能写成等式）', () => {
    expect(fractionDecimal(1, 2)).toEqual({ text: '0.5', value: 0.5, exact: true })
    const a = fractionDecimal(35, 12)
    expect(a.text).toBe('2.92')
    expect(a.exact).toBe(false)
    expect(a.value).not.toBe(35 / 12)
  })

  it('人数必须是整数：45 × 2/7 = 12.86 不是整数，调到 49 人', () => {
    expect(fractionCount(45, 2, 5)).toEqual({ value: 18, integral: true })
    const bad = fractionCount(45, 1, 7)
    expect(bad.integral).toBe(false)
    expect(bad.value).toBeCloseTo(6.4286, 3)
    expect(snapUpToMultiple(45, 7)).toBe(49)
  })
})
