import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { factorsOf, isPrime, primesUpTo, gcd, lcm, areaOf } from '@/lib/engine/math'

describe('math 工具', () => {
  it('factorsOf(12) = [1,2,3,4,6,12]', () => {
    expect(factorsOf(12)).toEqual([1, 2, 3, 4, 6, 12])
  })

  it('isPrime：2/3/5/7 是质数，1/4/9/15 不是', () => {
    for (const p of [2, 3, 5, 7]) expect(isPrime(p)).toBe(true)
    for (const p of [1, 4, 9, 15]) expect(isPrime(p)).toBe(false)
  })

  it('primesUpTo(20) = 2..19 的质数', () => {
    expect(primesUpTo(20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19])
  })

  it('gcd/lcm', () => {
    expect(gcd(8, 12)).toBe(4)
    expect(lcm(6, 9)).toBe(18)
  })

  it('面积公式', () => {
    expect(areaOf('parallelogram', { a: 6, h: 4 })).toBe(24)
    expect(areaOf('triangle', { a: 8, h: 5 })).toBe(20)
    expect(areaOf('trapezoid', { a: 4, b: 7, h: 5 })).toBe(27.5)
  })
})

describe('computeLab 各 kind', () => {
  it('translate：格数与方向', () => {
    const r = computeLab('translate', { dir: 0, grid: 9 })
    expect(r.value).toBe(9)
    expect(r.text).toContain('右')
  })

  it('rotate：角度与方向', () => {
    const r = computeLab('rotate', { angle: 90, dir: 0 })
    expect(r.value).toBe(90)
    expect(r.text).toContain('顺时针')
  })

  it('area：梯形面积', () => {
    const r = computeLab('area', { a: 36, b: 54, h: 40, shape: 2 })
    expect(r.value).toBe(1800)
  })

  it('hectare：100 米边长 = 1 公顷', () => {
    const r = computeLab('hectare', { side: 100 })
    expect(r.value).toBe(10000)
    expect(r.text).toContain('10000')
  })

  it('decimal-mul：0.6 × 3 = 1.8', () => {
    const r = computeLab('decimal-mul', { price: 0.6, count: 3 })
    expect(r.value).toBeCloseTo(1.8, 5)
  })

  it('decimal-div：9.6 ÷ 3 = 3.2', () => {
    const r = computeLab('decimal-div', { total: 9.6, count: 3 })
    expect(r.value).toBeCloseTo(3.2, 5)
  })

  it('decimal-point：0.001 × 10² = 0.1', () => {
    const r = computeLab('decimal-point', { power: 2, base: 0.001 })
    expect(r.value).toBeCloseTo(0.1, 5)
  })

  it('decimal-point 除法：135 ÷ 10³ = 0.135', () => {
    const r = computeLab('decimal-point', { power: 3, base: 135, divide: 1 })
    expect(r.value).toBeCloseTo(0.135, 5)
  })

  it('spinner：最大区域', () => {
    const r = computeLab('spinner', { red: 50, blue: 30, yellow: 20 })
    expect(r.text).toContain('红')
  })

  it('marble：红球多的可能性', () => {
    const r = computeLab('marble', { red: 4, yellow: 6 })
    expect(r.text).toContain('40')
    expect(r.conclusion).toContain('黄球多')
  })

  it('factors：16 的因数', () => {
    const r = computeLab('factors', { n: 16 })
    expect(r.steps[0]!.result).toContain('1、2、4、8、16')
  })

  it('multiples：3 的前 5 个倍数', () => {
    const r = computeLab('multiples', { n: 3, k: 5 })
    expect(r.steps[0]!.result).toBe('3、6、9、12、15')
  })

  it('prime：2~20 有 8 个质数', () => {
    const r = computeLab('prime', { n: 20 })
    expect(r.value).toBe(8)
  })

  it('gcdlcm：8 和 12 最大公因数 4', () => {
    const r = computeLab('gcdlcm', { a: 8, b: 12 })
    expect(r.value).toBe(4)
    expect(r.text).toContain('4')
  })

  it('frog：4 只青蛙', () => {
    const r = computeLab('frog', { n: 4 })
    expect(r.text).toContain('4 张嘴')
    expect(r.text).toContain('8 只眼睛')
    expect(r.text).toContain('16 条腿')
  })

  it('square：边长 5', () => {
    const r = computeLab('square', { a: 5 })
    expect(r.text).toContain('周长 20')
    expect(r.text).toContain('面积 25')
  })

  it('speed：15 × 3 = 45', () => {
    const r = computeLab('speed', { v: 15, t: 3 })
    expect(r.value).toBe(45)
  })

  it('pinboard：皮克定理', () => {
    const r = computeLab('pinboard', { shape: 0 })
    expect(r.text).toContain('面积')
    expect(r.steps[0]!.expr).toContain('n')
  })

  it('stats-table：合计与总计', () => {
    const r = computeLab('stats-table', { a1: 18, b1: 22, a2: 25, b2: 15, a3: 20, b3: 26, a4: 16, b4: 30 })
    expect(r.value).toBe(172) // 40+40+46+46
    expect(r.text).toContain('172')
  })

  it('stats-chart：自己与同桌总时间', () => {
    const r = computeLab('stats-chart', {
      s1: 1, d1: 0.5, s2: 2, d2: 3, s3: 1.5, d3: 1, s4: 1, d4: 0.5, s5: 0.5, d5: 1.5,
    })
    expect(r.text).toContain('自己 6')
    expect(r.text).toContain('同桌 6.5')
  })

  it('views3d：观察方向', () => {
    const r = computeLab('views3d', { view: 0 })
    expect(r.text).toContain('前面')
  })
})
