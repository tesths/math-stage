import { describe, expect, it } from 'vitest'
import {
  VERDICT_TEXT,
  affordableVerdict,
  estimateShop,
  fracMix,
  piecewiseFee,
  roundLife,
  roundLifeCeil,
  roundLifeFloor,
  segmentMore,
} from '@/lib/labs/quantity'
import { computeLab } from '@/lib/labs/compute'
import { allLabs } from '@data'

/** 已买的商品（课本：鸡蛋 19.6 元、牛奶 30.4 元 ×2）；面粉 16.8 / 大米 21.6 是拿去比的对象 */
const GOODS = [
  { name: '鸡蛋', price: 19.6, n: 1 },
  { name: '牛奶', price: 30.4, n: 2 },
]
const FLOUR = 16.8
const RICE = 21.6

describe('估算购物（课本 p018）', () => {
  it('带 100 元：估大 20+31×2=82 剩 18；估小 19+30×2=79 剩 21', () => {
    const r = estimateShop(100, GOODS)
    expect(r.spendHigh).toBe(82)
    expect(r.leftHigh).toBe(18)
    expect(r.spendLow).toBe(79)
    expect(r.leftLow).toBe(21)
    // 最少剩 18 ≥ 16.8 → 一定够买面粉；最多剩 21 < 21.6 → 一定不够买大米
    expect(affordableVerdict(r, FLOUR)).toBe('definitely')
    expect(affordableVerdict(r, RICE)).toBe('never')
    // 18~21 元之间的东西无法确定
    expect(affordableVerdict(r, 19)).toBe('maybe')
    expect(VERDICT_TEXT).toEqual({ definitely: '一定够', never: '一定不够', maybe: '无法确定' })
  })

  it('预算变大时结论会变：带 150 元时两样都一定够', () => {
    const r = estimateShop(150, GOODS)
    expect(r.leftHigh).toBe(68)
    expect(r.leftLow).toBe(71)
    expect(affordableVerdict(r, FLOUR)).toBe('definitely')
    expect(affordableVerdict(r, RICE)).toBe('definitely')
  })

  it('compute 与共用模块一致（含 16.8 / 21.6 两个比较）', () => {
    const r = computeLab('estimate-shop', { budget: 100 })
    expect(r.text).toContain('18')
    expect(r.text).toContain('21')
    expect(r.steps.some((s) => s.result.includes('20') && s.result.includes('31'))).toBe(true)
    expect(computeLab('estimate-shop', { budget: 150 }).text).toContain('68')
  })

  it('数据层的商品价格与课本一致', () => {
    const lab = allLabs.find((l) => l.kind === 'estimate-shop')!
    const budget = lab.params.find((p) => p.key === 'budget')?.default
    expect(budget).toBe(100)
    expect(GOODS.map((g) => g.price)).toEqual([19.6, 30.4])
  })
})

describe('分段计费（课本 p028）', () => {
  it('3 千米内 10 元；超出按 2.2 元/千米', () => {
    expect(piecewiseFee(0).fee).toBe(10)
    expect(piecewiseFee(3).fee).toBe(10)
    expect(piecewiseFee(3).withinBase).toBe(true)
    expect(piecewiseFee(4)).toMatchObject({ extraKm: 1, extraFee: 2.2, fee: 12.2 })
    expect(piecewiseFee(5)).toMatchObject({ extraKm: 2, extraFee: 4.4, fee: 14.4 })
  })

  it('不足 1 千米按 1 千米计算（5.5 千米 → 按 3 千米收费）', () => {
    const r = piecewiseFee(5.5)
    expect(r.extraKm).toBe(3)
    expect(r.roundedUp).toBe(true)
    expect(r.fee).toBe(16.6)
    expect(piecewiseFee(5.5).fee).toBe(piecewiseFee(6).fee)
    expect(piecewiseFee(5).roundedUp).toBe(false)
  })

  it('费用随路程不减（0~20 千米逐个检查）', () => {
    let prev = -1
    for (let km = 0; km <= 20; km += 0.5) {
      const f = piecewiseFee(km).fee
      expect(f).toBeGreaterThanOrEqual(prev)
      prev = f
    }
  })

  it('compute 显示分段算式且不超过起步价时不提超出部分', () => {
    const r5 = computeLab('piecewise', { km: 5.5 })
    expect(r5.value).toBe(16.6)
    expect(r5.text).toContain('16.6')
    expect(r5.steps.some((s) => s.result.includes('3 千米'))).toBe(true)
    const r2 = computeLab('piecewise', { km: 2 })
    expect(r2.value).toBe(10)
  })
})

describe('分数混合运算（中国结）', () => {
  it('两种解法结果相同，两个分率和是 1', () => {
    for (const [a, b, n] of [[2, 3, 18], [1, 4, 10], [3, 2, 20]] as [number, number, number][]) {
      const r = fracMix(a, b, n)
      expect(r.total).toBeCloseTo(n * ((a + b) / (a + b)), 6)
      expect(r.each[0] + r.each[1]).toBeCloseTo(r.total, 6)
      expect(r.method1).toContain('=')
      // 解法二先把两个分率相加（和为 1），再乘个数 → 与解法一结果相同
      expect(r.method2).toContain('= 1 × ')
      expect(r.method2.endsWith(String(n))).toBe(true)
      // 解法二的两个分率相加为 1
      expect(a / (a + b) + b / (a + b)).toBe(1)
    }
    const r = fracMix(2, 3, 18)
    expect(r.fraction1).toBe('2/5')
    expect(r.fraction2).toBe('3/5')
    expect(r.each).toEqual([7.2, 10.8])
    expect(r.total).toBe(18)
    expect(r.method1).toBe('2/5×18 + 3/5×18 = 7.2 + 10.8 = 18')
  })

  it('compute 的两种解法与共用模块一致', () => {
    const r = computeLab('frac-mix', { a: 2, b: 3, n: 18 })
    expect(r.value).toBe(18)
    expect(r.steps).toHaveLength(2)
    expect(r.steps[0]!.result).toContain('7.2')
    expect(r.steps[0]!.result).toContain('10.8')
  })
})

describe('合理取近似值（去尾 / 进一，两种情境分开）', () => {
  it('去尾法（买铅笔）：300 ÷ 3.5 = 85.7… → 85 支，且 86 支的钱超过 300', () => {
    const r = roundLifeFloor(300)
    expect(r.quotient).toBeCloseTo(85.71, 2)
    expect(r.result).toBe(85)
    expect(r.usedValue).toBe(297.5)
    expect(r.nextValue).toBe(301)
    expect(r.remainder).toBeCloseTo(2.5, 6)
    // 关键性质：result 支买得起，result+1 支买不起
    expect(r.usedValue).toBeLessThanOrEqual(300)
    expect(r.nextValue).toBeGreaterThan(300)
  })

  it('进一法（装油壶）：300 ÷ 2.5 = 120 → 120 个，且少一个装不下、多一个装得下', () => {
    const r = roundLifeCeil(300)
    expect(r.result).toBe(120)
    // usedValue = 少一个能装的量（下界），nextValue = result 个能装的量（上界）
    expect(r.usedValue).toBeCloseTo(297.5, 6)
    expect(r.nextValue).toBeCloseTo(300, 6)
    expect(r.usedValue).toBeLessThan(300)
    expect(r.nextValue).toBeGreaterThanOrEqual(300)
  })

  it('两种方法都满足「不多不少」的性质（0~500 逐个检查）', () => {
    for (let total = 100; total <= 500; total += 5) {
      const f = roundLifeFloor(total)
      expect(f.usedValue).toBeLessThanOrEqual(total + 1e-9)
      expect(f.nextValue).toBeGreaterThan(total - 1e-9)
      const c = roundLifeCeil(total)
      expect(c.usedValue).toBeLessThan(total - 1e-9)
      expect(c.nextValue).toBeGreaterThanOrEqual(total - 1e-9)
      // 去尾 ≤ 精确商 ≤ 进一
      expect(f.result).toBeLessThanOrEqual(c.result)
    }
  })

  it('roundLife 按方法号分派到两种情境', () => {
    expect(roundLife(300, 0).mode).toBe('floor')
    expect(roundLife(300, 1).mode).toBe('ceil')
    expect(roundLife(300, 0).result).toBe(85)
    expect(roundLife(300, 1).result).toBe(120)
  })
})

describe('比一个数多（少）几分之几', () => {
  it('14 天多 2/7 → 18 天；少 2/7 → 10 天', () => {
    expect(segmentMore(14, 2, 7, 0)).toMatchObject({ delta: 4, result: 18, integral: true })
    expect(segmentMore(14, 2, 7, 1)).toMatchObject({ delta: 4, result: 10, integral: true })
    expect(segmentMore(14, 2, 7, 0).fraction).toBe('2/7')
  })

  it('除不尽时标出不整（天数出现小数要提示）', () => {
    const r = segmentMore(10, 1, 3, 0)
    expect(r.result).toBeCloseTo(13.33, 2)
    expect(r.integral).toBe(false)
  })

  it('compute 与共用模块一致', () => {
    expect(computeLab('segment-more', { base: 14, fn: 2, fd: 7, mode: 0 }).value).toBe(18)
    expect(computeLab('segment-more', { base: 14, fn: 2, fd: 7, mode: 1 }).value).toBe(10)
  })
})
