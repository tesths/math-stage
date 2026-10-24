import { describe, expect, it } from 'vitest'
import { computeLab, isPrimeNum } from '@/lib/labs/compute'
import { allLabs, findLabById } from '@data'
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

  it('area：梯形麦田面积带平方米单位', () => {
    const lab = findLabById('g5-c3-area-mcfield')!
    const r = computeLab('area', { a: 36, b: 54, h: 40, shape: 2 }, lab)
    expect(r.value).toBe(1800)
    expect(r.text).toBe('1800 平方米')
  })

  it('area：平行四边形同时给出格数与真实面积', () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const r = computeLab('area', { a: 6, h: 4, slant: 1, shape: 0 }, lab)
    expect(r.value).toBe(24)
    expect(r.text).toBe('24 格 = 2400 平方米')
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
    expect(r.text).toBe('0.135')
    expect(r.conclusion).toContain('结果是 0.135')
    expect(r.conclusion).not.toContain('0.14')
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

  it('speed：单位由 Lab 的 units 决定（米 / 千米）', () => {
    const car = findLabById('g5-c7-speed-car')!
    const train = findLabById('g5-c7-speed-train')!
    expect(computeLab('speed', { v: 15, t: 3 }, car).text).toBe('45 米')
    expect(computeLab('speed', { v: 250, t: 3 }, train).text).toBe('750 千米')
    expect(computeLab('speed', { v: 250, t: 3 }, train).conclusion).toContain('750 千米')
  })

  it('speed：15 × 3 = 45', () => {
    const r = computeLab('speed', { v: 15, t: 3 })
    expect(r.value).toBe(45)
  })

  it('pinboard：与组件共用图形数据，矩形 5×3 得 n=16、b=8、面积 15', () => {
    const r = computeLab('pinboard', { shape: 0 })
    expect(r.value).toBe(15)
    expect(r.text).toBe('矩形面积 = 15（格）')
    expect(r.steps[0]!.expr).toContain('边上 n = 16')
    expect(r.steps[0]!.expr).toContain('内部 b = 8')
    expect(r.steps[1]!.result).toBe('16 ÷ 2 + 8 − 1 = 15')
    expect(r.steps[2]!.result).toContain('两种算法一致')
    // 5 个图形都要自洽
    for (let i = 0; i < 5; i++) {
      const ri = computeLab('pinboard', { shape: i })
      expect(ri.steps[2]!.result).toContain('一致')
    }
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

describe('computeLab 分支覆盖', () => {
  it('translate：四个方向与取模回绕', () => {
    expect(computeLab('translate', { dir: 0, grid: 9 }).text).toContain('右')
    expect(computeLab('translate', { dir: 1, grid: 9 }).text).toContain('下')
    expect(computeLab('translate', { dir: 2, grid: 9 }).text).toContain('左')
    expect(computeLab('translate', { dir: 3, grid: 9 }).text).toContain('上')
    expect(computeLab('translate', { dir: 4, grid: 9 }).text).toContain('右')
  })

  it('rotate：逆时针方向', () => {
    const r = computeLab('rotate', { angle: 90, dir: 1 })
    expect(r.text).toContain('逆时针')
    expect(r.conclusion).toContain('旋转')
  })

  it('axis：对称轴三个位置', () => {
    expect(computeLab('axis', { sym: 0 }).text).toContain('左')
    expect(computeLab('axis', { sym: 1 }).text).toContain('中间')
    expect(computeLab('axis', { sym: 2 }).text).toContain('右')
  })

  it('area：平行四边形 / 三角形 / 梯形三步过程', () => {
    const para = computeLab('area', { a: 6, h: 4, shape: 0 })
    expect(para.steps[0]!.expr).toContain('转化成长方形')
    expect(para.steps[1]!.expr).toContain('S = 底 × 高')
    const tri = computeLab('area', { a: 8, h: 5, shape: 1 })
    expect(tri.steps[0]!.expr).toContain('两个完全一样的三角形')
    expect(tri.conclusion).toContain('三角形')
    const trap = computeLab('area', { a: 4, b: 7, h: 5, shape: 2 })
    expect(trap.steps[0]!.expr).toContain('两个完全一样的梯形')
    expect(trap.conclusion).toContain('梯形')
  })

  it('area：未声明 units 时退回「格」', () => {
    const r = computeLab('area', { a: 6, h: 4, shape: 0 })
    expect(r.text).toBe('24 平方格')
  })

  it('hectare：非 100 米边长的换算结论', () => {
    const r = computeLab('hectare', { side: 50 })
    expect(r.value).toBe(2500)
    expect(r.conclusion).toContain('2500')
  })

  it('spinner：蓝 / 黄区域最大', () => {
    expect(computeLab('spinner', { red: 20, blue: 50, yellow: 30 }).text).toContain('蓝')
    expect(computeLab('spinner', { red: 20, blue: 30, yellow: 50 }).text).toContain('黄')
  })

  it('spinner：三等分时不能说「某色区域最大」，结论要落在「可能性相等」', () => {
    const r = computeLab('spinner', { red: 30, blue: 30, yellow: 30 })
    expect(r.text).toBe('三个区域一样大')
    expect(r.text).not.toContain('最大')
    expect(r.conclusion).toContain('面积相等')
    expect(r.conclusion).toContain('可能性都相等')
  })

  it('spinner：两个区域并列最大时用「并列」，不谎称唯一最大', () => {
    const r = computeLab('spinner', { red: 40, blue: 40, yellow: 20 })
    expect(r.text).toBe('红、蓝色并列最大')
    expect(r.conclusion).toContain('并列最大')
    expect(r.conclusion).toContain('相等')
    // 另外两种并列组合也要认对
    expect(computeLab('spinner', { red: 40, blue: 20, yellow: 40 }).text).toBe('红、黄色并列最大')
    expect(computeLab('spinner', { red: 20, blue: 40, yellow: 40 }).text).toBe('蓝、黄色并列最大')
  })

  it('marble：红多 / 一样多', () => {
    const redMore = computeLab('marble', { red: 6, yellow: 4 })
    expect(redMore.conclusion).toContain('红球多')
    const equal = computeLab('marble', { red: 5, yellow: 5 })
    expect(equal.conclusion).toContain('相等')
  })

  it('decimal-point：乘法方向与除法的 0 补足结论', () => {
    const mul = computeLab('decimal-point', { power: 2, base: 0.001, divide: 0 })
    expect(mul.conclusion).toContain('乘')
    expect(mul.conclusion).toContain('向右')
    const div = computeLab('decimal-point', { power: 1, base: 12.5, divide: 1 })
    expect(div.conclusion).toContain('除以')
    expect(div.conclusion).toContain('向左')
  })

  it('stats-chart：同桌最多活动在不同位置', () => {
    const r = computeLab('stats-chart', {
      s1: 1, d1: 0.5, s2: 2, d2: 3, s3: 1.5, d3: 1, s4: 1, d4: 0.5, s5: 0.5, d5: 9,
    })
    expect(r.steps[3]!.result).toContain('看电视')
  })

  it('pinboard：五种图形的皮克定理', () => {
    const names = ['矩形', '三角形', 'L 形', '五边形', '凹四边形']
    for (let i = 0; i < 5; i++) {
      const r = computeLab('pinboard', { shape: i })
      expect(r.conclusion).toContain(names[i]!)
      expect(r.value).toBeGreaterThan(0)
    }
  })

  it('views3d：右面 / 上面观察', () => {
    expect(computeLab('views3d', { view: 1 }).text).toContain('右面')
    expect(computeLab('views3d', { view: 2 }).text).toContain('上面')
  })

  it('参数缺失时走 ?? 默认值兜底分支（全覆盖）', () => {
    // 所有 kind 以空参数调用，覆盖 p.x ?? 0 / p.x ?? 1 等默认值分支
    for (const l of allLabs) {
      expect(() => computeLab(l.kind, {})).not.toThrow()
    }
    // 空参数下的代表性默认值
    expect(computeLab('translate', {}).text).toContain('右')
    expect(computeLab('axis', {}).text).toContain('中间')
    expect(computeLab('views3d', {}).text).toContain('前面')
    expect(computeLab('marble', {}).conclusion).toContain('一样多')
  })

  it('isPrimeNum 质数判断', () => {
    expect(isPrimeNum(7)).toBe(true)
    expect(isPrimeNum(8)).toBe(false)
  })
})
