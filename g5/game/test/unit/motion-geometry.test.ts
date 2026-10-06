import { describe, expect, it } from 'vitest'
import { BOAT, FISH, LEVER, TRIANGLE, dist, reflectPoint, rotatePoint, translatePoint, figureByCode } from '@/lib/labs/motion'

describe('图形的运动几何', () => {
  it('旋转：绕点 O 顺时针 90°，右边 4 格处的点转到正下方 4 格处', () => {
    const p = rotatePoint([4, 0], [0, 0], 90)
    expect(p[0]).toBeCloseTo(0, 6)
    expect(p[1]).toBeCloseTo(-4, 6)
  })

  it('旋转：逆时针 90° 与顺时针 270° 结果相同', () => {
    const a = rotatePoint([3, 1], [1, 1], -90)
    const b = rotatePoint([3, 1], [1, 1], 270)
    expect(a[0]).toBeCloseTo(b[0], 6)
    expect(a[1]).toBeCloseTo(b[1], 6)
  })

  it('旋转：任意角度下对应点到旋转中心的距离不变', () => {
    const center: [number, number] = [5, 4]
    for (const deg of [0, 15, 45, 90, 180, 270, 360]) {
      for (const p of [[8, 4], [5, 7], [6.2, 5.4]] as [number, number][]) {
        expect(dist(rotatePoint(p, center, deg), center)).toBeCloseTo(dist(p, center), 6)
      }
    }
  })

  it('旋转：三角形绕直角顶点 A 顺时针 90°，B(3,0)→(0,−3)、C(0,3)→(3,0)', () => {
    const A: [number, number] = [0, 0]
    expect(rotatePoint([3, 0], A, 90).map((v) => Math.round(v))).toEqual([0, -3])
    expect(rotatePoint([0, 3], A, 90).map((v) => Math.round(v))).toEqual([3, 0])
  })

  it('轴对称：关于竖直轴反射后，对应点到轴的距离相等且连线垂直于轴', () => {
    const axis = 7
    for (const p of [[2, 0], [3.2, 1.6], [5, 3.2]] as [number, number][]) {
      const q = reflectPoint(p, axis)
      expect(dist(p, [axis, p[1]])).toBeCloseTo(dist(q, [axis, q[1]]), 6)
      expect(q[1]).toBeCloseTo(p[1], 6)
    }
    // 两次反射回到原处
    const p: [number, number] = [3.2, 1.6]
    const back = reflectPoint(reflectPoint(p, axis), axis)
    expect(back[0]).toBeCloseTo(p[0], 6)
    expect(back[1]).toBeCloseTo(p[1], 6)
  })

  it('平移：四向平移格数与方向正确，且保持任意两点距离', () => {
    expect(translatePoint([1, 1], 0, 5)).toEqual([6, 1])
    expect(translatePoint([1, 1], 1, 5)).toEqual([1, -4])
    expect(translatePoint([1, 1], 2, 5)).toEqual([-4, 1])
    expect(translatePoint([1, 1], 3, 5)).toEqual([1, 6])
    const a: [number, number] = [1, 1]
    const b: [number, number] = [4, 3]
    for (const dir of [0, 1, 2, 3] as const) {
      expect(dist(translatePoint(a, dir, 7), translatePoint(b, dir, 7))).toBeCloseTo(dist(a, b), 6)
    }
  })

  it('图形定义：小船/小鱼/闸杆/三角形都有顶点与对应点，且顶点都在外接框内', () => {
    for (const f of [BOAT, FISH, LEVER, TRIANGLE]) {
      expect(f.marks.length).toBeGreaterThanOrEqual(2)
      expect(f.w).toBeGreaterThan(0)
      expect(f.h).toBeGreaterThan(0)
      const pts = [...f.polys.flat(), ...f.lines.flat(), ...f.marks.map((m) => m.p)]
      for (const [x, y] of pts) {
        expect(x).toBeGreaterThanOrEqual(-0.001)
        expect(y).toBeGreaterThanOrEqual(-0.001)
        expect(x).toBeLessThanOrEqual(f.w + 0.001)
        expect(y).toBeLessThanOrEqual(f.h + 0.001)
      }
    }
    expect(figureByCode(0)).toBe(BOAT)
    expect(figureByCode(3)).toBe(TRIANGLE)
    expect(figureByCode(99)).toBe(BOAT)
  })
})
