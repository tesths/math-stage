import { describe, expect, it } from 'vitest'
import { conversionSteps, decompose, kmSegments, meterRows, rateBetween, rateLabel } from '@/lib/labs/length'

describe('rateBetween · 单位进率（米→千米是 1000，不是 10）', () => {
  it('毫米→厘米→分米→米 相邻进率都是 10', () => {
    expect(rateBetween('毫米', '厘米')).toBe(10)
    expect(rateBetween('厘米', '分米')).toBe(10)
    expect(rateBetween('分米', '米')).toBe(10)
    expect(rateBetween('厘米', '毫米')).toBe(10)
  })

  it('米→千米 进率是 1000', () => {
    expect(rateBetween('米', '千米')).toBe(1000)
    expect(rateBetween('千米', '米')).toBe(1000)
    expect(rateLabel('米', '千米')).toBe('×1000')
  })

  it('跨两级：厘米→米 是 100，毫米→米 是 1000', () => {
    expect(rateBetween('厘米', '米')).toBe(100)
    expect(rateBetween('毫米', '米')).toBe(1000)
  })
})

describe('conversionSteps · 换算要经过哪几级', () => {
  it('毫米→厘米 一步：÷10', () => {
    const steps = conversionSteps(0, 1)
    expect(steps).toHaveLength(1)
    expect(steps[0]).toEqual({ from: '毫米', to: '厘米', factor: 10, symbol: '÷' })
  })

  it('毫米→米 三步，每步 ÷10', () => {
    const steps = conversionSteps(0, 3)
    expect(steps.map((s) => s.to)).toEqual(['厘米', '分米', '米'])
    expect(steps.every((s) => s.symbol === '÷' && s.factor === 10)).toBe(true)
  })

  it('米→千米 一步：÷1000', () => {
    const steps = conversionSteps(3, 4)
    expect(steps).toHaveLength(1)
    expect(steps[0]!.factor).toBe(1000)
  })
})

describe('decompose / meterRows / kmSegments · 图与数值一致', () => {
  it('45 毫米 = 4 厘米 5 毫米', () => {
    expect(decompose(45, 10)).toEqual({ whole: 4, rest: 5 })
  })

  it('1 米 90 厘米 = 19 分米：一整行 10 格 + 9 格', () => {
    const r = meterRows(1, 90)
    expect(r.dm).toBe(19)
    expect(r.cmRest).toBe(0)
    expect(r.rows).toHaveLength(2)
    expect(r.rows[0]!.filled).toBe(10)
    expect(r.rows[1]!.filled).toBe(9)
  })

  it('2 米 30 厘米：两整行 + 第三行 3 格', () => {
    const r = meterRows(2, 30)
    expect(r.rows).toHaveLength(3)
    expect(r.rows[2]!.filled).toBe(3)
    expect(r.dm).toBe(23)
  })

  it('1 米 90 厘米零头 5 厘米时如实写"5 厘米"', () => {
    expect(meterRows(1, 95).cmRest).toBe(5)
  })

  it('1 千米 = 10 个 100 米（不再用 km×10/3 的假比例尺）', () => {
    const segs = kmSegments(1)
    expect(segs).toHaveLength(10)
    expect(kmSegments(3)).toHaveLength(30)
    expect(segs.every((seg) => seg.kmIndex === 0)).toBe(true)
    expect(kmSegments(3).at(-1)!.kmIndex).toBe(2)
  })
})
