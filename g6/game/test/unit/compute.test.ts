import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { allLabs } from '@data'
import type { ParamValues } from '@data/schema/lab'

describe('computeLab 一 小数乘法和除法', () => {
  it('mul-decimal：0.6 × 0.4 = 0.24', () => {
    const r = computeLab('mul-decimal', { a: 0.6, b: 0.4 })
    expect(r.value).toBeCloseTo(0.24, 5)
    expect(r.text).toContain('0.24')
  })

  it('mul-compare：积与因数比较的三种情况', () => {
    expect(computeLab('mul-compare', { base: 4.9, factor: 1.01 }).conclusion).toContain('大于 1')
    const eq = computeLab('mul-compare', { base: 4.9, factor: 1 })
    expect(eq.value).toBeCloseTo(4.9, 5)
    expect(eq.steps[1]!.result).toContain('等于')
    expect(computeLab('mul-compare', { base: 4.9, factor: 0.99 }).conclusion).toContain('小于 1')
  })

  it('mul-approx：6.25 × 1.5 保留一位小数 ≈ 9.4', () => {
    const r = computeLab('mul-approx', { price: 6.25, count: 1.5, digits: 1 })
    expect(r.value).toBe(9.4)
    expect(r.text).toContain('9.4')
  })

  it('div-decimal：三个例题转化', () => {
    expect(computeLab('div-decimal', { sel: 0 }).value).toBe(2)
    expect(computeLab('div-decimal', { sel: 1 }).value).toBe(5)
    expect(computeLab('div-decimal', { sel: 2 }).value).toBe(20)
  })

  it('div-approx：40 千米/时 ≈ 666.67 米/分', () => {
    const r = computeLab('div-approx', { speed: 40 })
    expect(r.value).toBeCloseTo(666.67, 2)
  })

  it('round-life：去尾 / 进一', () => {
    expect(computeLab('round-life', { method: 0, total: 300 }).value).toBe(85)
    expect(computeLab('round-life', { method: 1, total: 300 }).value).toBe(86)
    expect(computeLab('round-life', { method: 0, total: 300 }).text).toContain('最多')
  })
})

describe('computeLab 二 混合运算与数量关系', () => {
  it('frac-mix：两种解法结果一致', () => {
    const r = computeLab('frac-mix', { a: 2, b: 3, n: 18 })
    expect(r.value).toBe(18)
    expect(r.steps[0]!.result).toContain('18')
    expect(r.steps[1]!.result).toContain('18')
  })

  it('estimate-shop：估大估小', () => {
    const r = computeLab('estimate-shop', { budget: 100 })
    expect(r.value).toBe(18)
    expect(r.text).toContain('最少剩')
  })

  it('segment：45 人，男占 2/5', () => {
    const r = computeLab('segment', { total: 45, fn: 2, fd: 5 })
    expect(r.value).toBe(27)
    expect(r.text).toContain('女运动员 27')
  })

  it('segment-more：增加 / 减少', () => {
    expect(computeLab('segment-more', { base: 14, fn: 2, fd: 7, mode: 0 }).value).toBe(18)
    expect(computeLab('segment-more', { base: 14, fn: 2, fd: 7, mode: 1 }).value).toBe(10)
  })

  it('work-together：6 小时和 3 小时 → 2 小时', () => {
    const r = computeLab('work-together', { a: 6, b: 3 })
    expect(r.value).toBeCloseTo(2, 5)
  })

  it('piecewise：5 千米 → 14.4 元；3 千米内 10 元', () => {
    expect(computeLab('piecewise', { km: 5 }).value).toBeCloseTo(14.4, 5)
    expect(computeLab('piecewise', { km: 2 }).value).toBe(10)
    expect(computeLab('piecewise', { km: 3.5 }).value).toBeCloseTo(12.2, 5)
  })
})

describe('computeLab 三 数与运算的再认识', () => {
  it('place-value：五个数', () => {
    expect(computeLab('place-value', { sel: 0 }).value).toBe(231)
    expect(computeLab('place-value', { sel: 2 }).text).toContain('3.36')
    expect(computeLab('place-value', { sel: 4 }).text).toContain('0.24')
  })

  it('compare-unit：五组数比较', () => {
    expect(computeLab('compare-unit', { sel: 0 }).text).toContain('>')
    expect(computeLab('compare-unit', { sel: 1 }).text).toContain('<')
    expect(computeLab('compare-unit', { sel: 2 }).text).toContain('>')
    expect(computeLab('compare-unit', { sel: 3 }).text).toContain('>')
  })

  it('op-consistency：六个运算示例', () => {
    expect(computeLab('op-consistency', { sel: 0 }).value).toBe(60)
    expect(computeLab('op-consistency', { sel: 2 }).value).toBe(400)
    expect(computeLab('op-consistency', { sel: 5 }).value).toBeCloseTo(4.65, 5)
  })

  it('binary：十进制转二进制', () => {
    const r = computeLab('binary', { dec: 5 })
    expect(r.text).toContain('101')
    expect(r.steps.length).toBeGreaterThan(1)
    expect(computeLab('binary', { dec: 0 }).steps[0]!.result).toContain('余 0')
  })
})

describe('computeLab 四 比和比例', () => {
  it('ratio-intro：比值', () => {
    const r = computeLab('ratio-intro', { a: 3, b: 2 })
    expect(r.value).toBeCloseTo(1.5, 5)
    expect(r.text).toContain('3 : 2')
  })

  it('ratio-value：90:54 → 5/3', () => {
    const r = computeLab('ratio-value', { w: 90, h: 54 })
    expect(r.value).toBeCloseTo(5 / 3, 5)
  })

  it('ratio-simplify：四个示例', () => {
    expect(computeLab('ratio-simplify', { sel: 0 }).text).toContain('2:3')
    expect(computeLab('ratio-simplify', { sel: 1 }).text).toContain('10:9')
    expect(computeLab('ratio-simplify', { sel: 2 }).text).toContain('20:1')
    expect(computeLab('ratio-simplify', { sel: 3 }).text).toContain('2:5')
  })

  it('ratio-distribute：3:2 分配 500 克', () => {
    const r = computeLab('ratio-distribute', { a: 3, b: 2, total: 500 })
    expect(r.value).toBe(300)
    expect(r.text).toContain('糯米粉 300')
    expect(r.text).toContain('鼠曲草浆 200')
  })

  it('proportion-basic：外项积 = 内项积', () => {
    const r = computeLab('proportion-basic', { a: 4, b: 2, k: 2 })
    expect(r.value).toBe(16)
    expect(r.conclusion).toContain('外项')
  })

  it('solve-proportion：25:200 = x:300 → 37.5', () => {
    const r = computeLab('solve-proportion', { a: 25, b: 200, c: 300 })
    expect(r.value).toBeCloseTo(37.5, 5)
  })

  it('golden-ratio：宽 200 → 长 ≈ 323.6', () => {
    const r = computeLab('golden-ratio', { w: 200 })
    expect(r.value).toBeCloseTo(323.62, 1)
    expect(r.conclusion).toContain('0.618')
  })
})

describe('computeLab 五 圆', () => {
  it('circle-feature：d = 2r', () => {
    const r = computeLab('circle-feature', { r: 4 })
    expect(r.value).toBe(8)
  })

  it('sector：圆心角比例', () => {
    expect(computeLab('sector', { angle: 90 }).value).toBe(90)
    expect(computeLab('sector', { angle: 90 }).text).toContain('0.25')
  })

  it('circumference：半径 14 → 87.92', () => {
    const r = computeLab('circumference', { r: 14 })
    expect(r.value).toBeCloseTo(87.92, 2)
  })

  it('circle-area：半径 5 → 78.5', () => {
    const r = computeLab('circle-area', { r: 5, slices: 8 })
    expect(r.value).toBeCloseTo(78.5, 2)
    expect(r.text).toContain('78.5')
  })

  it('annulus：R=10 r=6 → 200.96', () => {
    const r = computeLab('annulus', { R: 10, r: 6 })
    expect(r.value).toBeCloseTo(200.96, 2)
  })

  it('annulus：内圆大于外圆时被钳制', () => {
    const r = computeLab('annulus', { R: 6, r: 10 })
    expect(r.value).toBeCloseTo(0, 5)
  })

  it('circle-composite：边长 2 → 5.57', () => {
    const r = computeLab('circle-composite', { side: 2 })
    expect(r.value).toBeCloseTo(5.57, 2)
  })
})

describe('computeLab 六 放大与缩小 / 七 确定位置', () => {
  it('scale-shape：放大 / 缩小 / 不变', () => {
    expect(computeLab('scale-shape', { n: 2, d: 1 }).text).toContain('放大')
    expect(computeLab('scale-shape', { n: 1, d: 2 }).text).toContain('缩小')
    expect(computeLab('scale-shape', { n: 1, d: 1 }).conclusion).toContain('不变')
  })

  it('map-scale：1:1000，5 厘米 → 50 米', () => {
    const r = computeLab('map-scale', { scaleDen: 1000, cm: 5 })
    expect(r.value).toBe(50)
  })

  it('coordinate：数对（列，行）', () => {
    const r = computeLab('coordinate', { col: 3, row: 4 })
    expect(r.value).toBe(304)
    expect(r.text).toContain('（3，4）')
  })

  it('direction：四个方向', () => {
    expect(computeLab('direction', { angle: 30, dist: 3, dir: 0 }).text).toContain('北偏东 30°')
    expect(computeLab('direction', { angle: 30, dist: 3, dir: 1 }).text).toContain('北偏西')
    expect(computeLab('direction', { angle: 30, dist: 3, dir: 2 }).text).toContain('南偏东')
    expect(computeLab('direction', { angle: 30, dist: 3, dir: 3 }).text).toContain('南偏西')
    expect(computeLab('direction', { angle: 30, dist: 3, dir: 7 }).text).toContain('南偏西')
  })
})

describe('computeLab 分支覆盖', () => {
  it('参数缺失时走默认值兜底分支（全覆盖）', () => {
    for (const l of allLabs) {
      expect(() => computeLab(l.kind, {})).not.toThrow()
    }
  })

  it('mul-approx 保留两位小数', () => {
    const r = computeLab('mul-approx', { price: 3.145, count: 2, digits: 2 })
    expect(r.value).toBe(6.29)
  })

  it('segment-more 减少分支结论', () => {
    const r = computeLab('segment-more', { base: 21, fn: 1, fd: 3, mode: 1 })
    expect(r.value).toBe(14)
    expect(r.conclusion).toContain('少')
  })

  it('piecewise 起步价内 steps 显示 0 超出', () => {
    const r = computeLab('piecewise', { km: 2 })
    expect(r.steps[1]!.result).toBe('0 千米')
  })

  it('estimate-shop 结论翻转分支（钱少 / 钱多）', () => {
    const poor = computeLab('estimate-shop', { budget: 80 })
    expect(poor.steps[2]!.result).toContain('≤ 16.8')
    const rich = computeLab('estimate-shop', { budget: 150 })
    expect(rich.steps[3]!.result).toContain('≥ 21.6')
  })

  it('round-life 进一法结论', () => {
    const r = computeLab('round-life', { method: 1, total: 100 })
    expect(r.conclusion).toContain('至少')
  })
})

describe('computeLab 练习题（练习一 … 练习十四）', () => {
  const exerciseLabs = allLabs.filter((l) => l.kind.startsWith('ex-'))

  it('14 条练习题都能用默认 / 最小 / 最大参数求值（覆盖分支与钳位）', () => {
    expect(exerciseLabs).toHaveLength(14)
    for (const l of exerciseLabs) {
      const variants: ParamValues[] = []
      for (const pick of ['default', 'min', 'max'] as const) {
        const vals: ParamValues = { ...(l.fixed ?? {}) }
        for (const param of l.params) vals[param.key] = param[pick]
        variants.push(vals)
      }
      for (const vals of variants) {
        const r = computeLab(l.kind, vals)
        expect(r.text.length).toBeGreaterThan(0)
        expect(r.steps.length).toBeGreaterThan(0)
        expect(r.conclusion.length).toBeGreaterThan(0)
        expect(Number.isFinite(r.value)).toBe(true)
      }
    }
  })

  it('circle-packing 有余料时步骤给出余数（remW > 0 分支）', () => {
    const r = computeLab('ex-c5-circle-packing', { L: 15, W: 7, d: 2 })
    expect(r.value).toBe(21)
    expect(r.steps[1]!.result).toContain('…1')
  })
})
