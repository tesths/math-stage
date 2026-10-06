import { describe, expect, it } from 'vitest'
import {
  decimalPlaces,
  decimalText,
  partialsSum,
  placeDigits,
  shiftDecimalPoint,
  splitCheck,
  splitShares,
  verticalMul,
} from '@/lib/labs/decimal'
import { allLabs } from '@data'

describe('小数点移动（十进制字符串移位）', () => {
  it('乘 10/100/1000 就是小数点右移（含 0.07 × 100 = 7 这类浮点陷阱）', () => {
    expect(shiftDecimalPoint(0.001, 2)).toBe(0.1)
    expect(shiftDecimalPoint(0.001, 3)).toBe(1)
    expect(shiftDecimalPoint(0.001, 4)).toBe(10)
    expect(shiftDecimalPoint(0.07, 2)).toBe(7)
    expect(shiftDecimalPoint(0.29, 2)).toBe(29)
    expect(shiftDecimalPoint(1.5, 3)).toBe(1500)
  })

  it('除以 10/100/1000 就是小数点左移', () => {
    expect(shiftDecimalPoint(135, 2, true)).toBe(1.35)
    expect(shiftDecimalPoint(135, 3, true)).toBe(0.135)
    expect(shiftDecimalPoint(9.6, 1, true)).toBe(0.96)
    expect(shiftDecimalPoint(0.6, 2, true)).toBe(0.006)
    expect(shiftDecimalPoint(2, 4, true)).toBe(0.0002)
  })

  it('移动后再反向移动回到原数', () => {
    for (const v of [0.001, 0.07, 1.35, 135, 9.6, 6.25]) {
      for (const p of [1, 2, 3]) {
        expect(shiftDecimalPoint(shiftDecimalPoint(v, p), p, true)).toBeCloseTo(v, 9)
      }
    }
  })

  it('decimalText 去掉浮点噪声与多余的 0', () => {
    expect(decimalText(0.07 * 100)).toBe('7')
    expect(decimalText(1.8)).toBe('1.8')
    expect(decimalText(75)).toBe('75')
    expect(decimalText(0.135)).toBe('0.135')
    expect(decimalText(1.005)).toBe('1.005')
  })

  it('decimalPlaces 正确数出小数位', () => {
    expect(decimalPlaces(0.6)).toBe(1)
    expect(decimalPlaces(6.25)).toBe(2)
    expect(decimalPlaces(0.001)).toBe(3)
    expect(decimalPlaces(75)).toBe(0)
  })

  it('数位拆解：0.135 → 十分位 1、百分位 3、千分位 5', () => {
    const m = placeDigits(0.135)
    expect(m.get(-1)).toBe(1)
    expect(m.get(-2)).toBe(3)
    expect(m.get(-3)).toBe(5)
    expect(m.get(0)).toBe(0)
    const m2 = placeDigits(231)
    expect(m2.get(0)).toBe(1)
    expect(m2.get(1)).toBe(3)
    expect(m2.get(2)).toBe(2)
  })
})

describe('竖式乘法', () => {
  it('部分积之和 = 整数积；积 = 整数积左移小数位', () => {
    for (const [price, count] of [[0.6, 3], [6.25, 12], [1.5, 4], [0.85, 7], [12.5, 8]] as [number, number][]) {
      const v = verticalMul(price, count)
      expect(partialsSum(v)).toBe(v.intProduct)
      expect(v.intProduct).toBe(Math.round(price * 10 ** decimalPlaces(price)) * count)
      expect(v.product).toBeCloseTo(price * count, 6)
      expect(v.productText).toBe(decimalText(v.product))
      // 部分积按位左移对齐
      for (const p of v.partials) expect(p.value).toBe(v.intPrice * p.digit * 10 ** p.shift)
    }
  })

  it('6.25 × 12：部分积 1250 与 6250，合计 7500 → 75', () => {
    const v = verticalMul(6.25, 12)
    expect(v.intPrice).toBe(625)
    expect(v.decimals).toBe(2)
    expect(v.partials.map((p) => p.value)).toEqual([6250, 1250])
    expect(v.intProduct).toBe(7500)
    expect(v.productText).toBe('75')
  })
})

describe('平均分模型（元→角→分）', () => {
  it('9.6 ÷ 3 = 3.2：每份 3 元 2 角，份数 × 每份正好等于总数', () => {
    const r = splitShares(9.6, 3)
    expect(r.levels[0]).toMatchObject({ label: '元', units: 9, perGroup: 3, leftover: 0 })
    expect(r.levels[1]).toMatchObject({ label: '角', units: 6, perGroup: 2, leftover: 0 })
    expect(r.perGroupText).toBe('3.2')
    expect(r.exact).toBe(true)
    expect(splitCheck(9.6, 3, r)).toBe(0)
  })

  it('9.6 ÷ 4 = 2.4：元 9 分不完，余 1 元换 10 角继续分', () => {
    const r = splitShares(9.6, 4)
    // 元：9 ÷ 4 = 2 余 1 元；余 1 元换 10 角，加上原数的 6 角 → 16 角 ÷ 4 = 4 角
    expect(r.levels[0]).toMatchObject({ units: 9, perGroup: 2, leftover: 1 })
    expect(r.levels[1]).toMatchObject({ units: 16, perGroup: 4, leftover: 0 })
    expect(r.perGroupText).toBe('2.4')
    expect(splitCheck(9.6, 4, r)).toBe(0)
  })

  it('除不尽时余数不为 0 且能被检出（9.6 ÷ 7）', () => {
    const r = splitShares(9.6, 7)
    expect(r.exact).toBe(false)
    expect(r.remainder).toBeGreaterThan(0)
    expect(splitCheck(9.6, 7, r)).toBe(0)
    expect(r.perGroup).toBeLessThan(9.6 / 7)
  })

  it('数据层每个 decimal-div 例题都能整除到分位', () => {
    for (const lab of allLabs.filter((l) => l.kind === 'decimal-div')) {
      const total = lab.params.find((p) => p.key === 'total')?.default ?? 0
      const count = lab.params.find((p) => p.key === 'count')?.default ?? 1
      const r = splitShares(total, count)
      expect(splitCheck(total, count, r)).toBe(0)
      expect(r.perGroup).toBeCloseTo(total / count, 6)
    }
  })
})
