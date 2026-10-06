import { describe, expect, it } from 'vitest'
import { PINBOARD_SHAPES, boundaryPins, interiorPins, pickCheck, pointStatus, shoelace } from '@/lib/labs/pinboard'

describe('钉子板与皮克定理', () => {
  it('基本量能独立算对：单位正方形、5×3 矩形', () => {
    const square = [[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][]
    expect(shoelace(square)).toBe(1)
    expect(boundaryPins(square)).toBe(4)
    expect(interiorPins(square)).toBe(0)
    const rect = [[0, 0], [5, 0], [5, 3], [0, 3]] as [number, number][]
    expect(shoelace(rect)).toBe(15)
    expect(boundaryPins(rect)).toBe(16)
    // 5×3 的矩形内部格点 = 4×2 = 8，逐个数出来
    expect(interiorPins(rect)).toBe(8)
  })

  it('内部钉子是真数出来的，不是由面积倒推的', () => {
    const tri = [[0, 0], [6, 0], [2, 4]] as [number, number][]
    const b = interiorPins(tri)
    // 与"面积倒推"独立核对：每个数出来的点都必须在内部
    let counted = 0
    for (let y = 0; y <= 4; y++) {
      for (let x = 0; x <= 6; x++) {
        if (pointStatus(tri, x, y) === 'inside') counted++
      }
    }
    expect(b).toBe(counted)
    expect(b).toBe(7)
    expect(tri.map((p) => pointStatus(tri, p[0], p[1]))).toEqual(['boundary', 'boundary', 'boundary'])
  })

  it('凹多边形的射线法判定正确（凹进去的格点算外面）', () => {
    const concave = PINBOARD_SHAPES.find((s) => s.name === '凹四边形')!.pts
    // (3,3) 落在凹口里，应在多边形外
    expect(pointStatus(concave, 3, 3)).toBe('outside')
    expect(pointStatus(concave, 0, 0)).toBe('boundary')
    expect(pointStatus(concave, 2, 1)).toBe('inside')
  })

  it('5 个预设图形都满足皮克定理（独立数钉子 vs 鞋带公式面积）', () => {
    for (const shape of PINBOARD_SHAPES) {
      const r = pickCheck(shape.pts)
      expect(r.ok).toBe(true)
      expect(r.pickArea).toBeCloseTo(r.area, 10)
      // 面积一定是 0.5 的整数倍
      expect(Math.abs(r.area * 2 - Math.round(r.area * 2))).toBeLessThan(1e-9)
      // 公式文案与实际数值一致
      expect(r.formula).toBe(`S = ${r.n} ÷ 2 + ${r.b} − 1 = ${r.pickArea}`)
    }
  })

  it('矩形：n = 2(a+b)、b = (a−1)(b−1)，面积 = a×b', () => {
    for (const [a, b] of [[3, 2], [5, 3], [6, 4]] as [number, number][]) {
      const rect = [[0, 0], [a, 0], [a, b], [0, b]] as [number, number][]
      const r = pickCheck(rect)
      expect(r.n).toBe(2 * (a + b))
      expect(r.b).toBe((a - 1) * (b - 1))
      expect(r.area).toBe(a * b)
      expect(r.ok).toBe(true)
    }
  })
})
