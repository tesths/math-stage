import { describe, expect, it } from 'vitest'
import { compositeMethods, compositeOutline, hectareScale, polygonArea, toHectare } from '@/lib/labs/area'
import { allLabs } from '@data'

const BOOK = { top: 100, left: 90, right: 40, bottom: 140 }

describe('组合图形（书页 42 例 6 池塘）', () => {
  it('课本原图：三种割补方法都得 10000 平方米 = 1 公顷', () => {
    const methods = compositeMethods(BOOK)
    expect(methods).toHaveLength(3)
    for (const m of methods) expect(m.total).toBe(10000)
    // 分割法一：100×40 + (100+140)×50÷2
    expect(methods[0]!.parts.map((p) => p.area)).toEqual([4000, 6000])
    // 分割法二：100×90 + 40×50÷2
    expect(methods[1]!.parts.map((p) => p.area)).toEqual([9000, 1000])
    // 添补法：140×90 − (90+40)×40÷2
    expect(methods[2]!.parts.map((p) => p.area)).toEqual([12600, 2600])
    expect(toHectare(10000)).toBe(1)
  })

  it('图形顶点用鞋带公式算出的面积 = 三种方法的结果（图形与算式一致）', () => {
    expect(polygonArea(compositeOutline(BOOK))).toBeCloseTo(10000, 6)
    for (const spec of [
      { top: 100, left: 90, right: 40, bottom: 140 },
      { top: 60, left: 80, right: 30, bottom: 120 },
      { top: 20, left: 25, right: 5, bottom: 40 },
    ]) {
      const methods = compositeMethods(spec)
      const byShape = polygonArea(compositeOutline(spec))
      for (const m of methods) {
        expect(m.total).toBeCloseTo(byShape, 6)
        // 每个部分自己也要对
        for (const part of m.parts) expect(polygonArea(part.points)).toBeCloseTo(part.area, 6)
      }
      expect(methods[0]!.total).toBeCloseTo(methods[1]!.total, 6)
      expect(methods[1]!.total).toBeCloseTo(methods[2]!.total, 6)
    }
  })

  it('数据层的组合图形例题参数与课本一致，且结果 = 1 公顷', () => {
    const lab = allLabs.find((l) => l.kind === 'composite')!
    const spec = {
      top: lab.params.find((p) => p.key === 'top')?.default ?? 0,
      left: lab.params.find((p) => p.key === 'left')?.default ?? 0,
      right: lab.params.find((p) => p.key === 'right')?.default ?? 0,
      bottom: lab.params.find((p) => p.key === 'bottom')?.default ?? 0,
    }
    expect(spec).toEqual(BOOK)
    expect(toHectare(polygonArea(compositeOutline(spec)))).toBe(1)
  })

  it('公顷比例尺：1000 米 = 画框边长，100 米正好是十分之一（不再用假映射）', () => {
    const box = 200
    expect(hectareScale(1000, 1000, box)).toBe(box)
    expect(hectareScale(100, 1000, box)).toBe(box / 10)
    expect(hectareScale(1, 1000, box)).toBeCloseTo(0.2, 6)
    // 面积比 = 边长比的平方
    const a = hectareScale(100, 1000, box)
    const b = hectareScale(1000, 1000, box)
    expect((b * b) / (a * a)).toBeCloseTo(100, 6)
  })
})
