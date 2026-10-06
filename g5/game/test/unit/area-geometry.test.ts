import { describe, expect, it } from 'vitest'
import {
  bodyCells,
  copyCells,
  cutPieceCells,
  cutShiftCells,
  gapCells,
  polygonArea,
  shapeCells,
  spanAtY,
  targetCells,
  translatePoly,
  type AreaGeomInput,
} from '@/lib/labs/area'
import { areaOf } from '@/lib/engine/math'

const cases: { shape: 'parallelogram' | 'triangle' | 'trapezoid'; g: AreaGeomInput }[] = [
  { shape: 'parallelogram', g: { a: 6, b: 0, h: 4, slant: 1 } },
  { shape: 'parallelogram', g: { a: 8, b: 0, h: 5, slant: 3 } },
  { shape: 'triangle', g: { a: 7, b: 0, h: 6, slant: 0 } },
  { shape: 'triangle', g: { a: 10, b: 0, h: 4, slant: 0 } },
  { shape: 'trapezoid', g: { a: 4, b: 6, h: 3, slant: 0 } },
  { shape: 'trapezoid', g: { a: 5, b: 11, h: 6, slant: 0 } },
  // 上底比下底长的极端情况也要成立
  { shape: 'trapezoid', g: { a: 8, b: 2, h: 4, slant: 0 } },
]

describe('面积剪拼几何', () => {
  it('图形顶点算出的面积与面积公式一致', () => {
    for (const { shape, g } of cases) {
      expect(polygonArea(shapeCells(shape, g))).toBeCloseTo(areaOf(shape, g), 6)
    }
  })

  it('平行四边形：剪下的三角形向左平移「一个底」后与左侧缺口完全重合', () => {
    for (const { g } of cases.filter((c) => c.shape === 'parallelogram')) {
      const landed = translatePoly(cutPieceCells(g), cutShiftCells(g))
      const key = (p: [number, number]) => `${p[0]},${p[1]}`
      // 平移量与缺口顶点集合一致
      expect(landed.map(key).sort()).toEqual(gapCells(g).map(key).sort())
      // 主体 + 缺口 = 目标长方形
      expect(polygonArea(bodyCells(g)) + polygonArea(gapCells(g))).toBeCloseTo(polygonArea(targetCells('parallelogram', g)), 6)
      expect(polygonArea(targetCells('parallelogram', g))).toBeCloseTo(g.a * g.h, 6)
    }
  })

  it('平行四边形：平移距离等于底（不是斜边偏移）', () => {
    const g = { a: 6, b: 0, h: 4, slant: 1 }
    expect(cutShiftCells(g)).toBe(-6)
    // 只平移斜边偏移（旧的错误做法）补不上缺口
    const wrong = translatePoly(cutPieceCells(g), -g.slant)
    const key = (p: [number, number]) => `${p[0]},${p[1]}`
    expect(wrong.map(key).sort()).not.toEqual(gapCells(g).map(key).sort())
  })

  it('三角形/梯形：原件 + 完全一样的复制件 = 目标平行四边形', () => {
    for (const { shape, g } of cases.filter((c) => c.shape !== 'parallelogram')) {
      const sum = polygonArea(shapeCells(shape, g)) + polygonArea(copyCells(shape, g))
      expect(sum).toBeCloseTo(polygonArea(targetCells(shape, g)), 6)
      // 目标平行四边形的底与面积
      const span = spanAtY(targetCells(shape, g), g.h)!
      expect(span[1] - span[0]).toBeCloseTo(shape === 'triangle' ? g.a : g.a + g.b, 6)
      expect(polygonArea(targetCells(shape, g))).toBeCloseTo(shape === 'triangle' ? g.a * g.h : (g.a + g.b) * g.h, 6)
    }
  })

  it('三角形/梯形：拼成的目标图形是平行四边形（两组对边平行且相等）', () => {
    for (const { shape, g } of cases.filter((c) => c.shape !== 'parallelogram')) {
      const t = targetCells(shape, g)
      const side = (i: number) => {
        const p1 = t[i]!
        const p2 = t[(i + 1) % t.length]!
        return [p2[0] - p1[0], p2[1] - p1[1]] as [number, number]
      }
      const [s0, s1, s2, s3] = [side(0), side(1), side(2), side(3)]
      expect(s0[0]).toBeCloseTo(-s2[0], 6)
      expect(s0[1]).toBeCloseTo(-s2[1], 6)
      expect(s1[0]).toBeCloseTo(-s3[0], 6)
      expect(s1[1]).toBeCloseTo(-s3[1], 6)
    }
  })
})
