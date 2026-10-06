import { describe, expect, it } from 'vitest'
import { approxLengthInR, cycloidPath, rollDistance, rollPoint, sectorPath, wedgeLayout } from '@/lib/labs/circle'

const PI = Math.PI

describe('圆的面积剪拼几何', () => {
  it('交错拼成的图形：外接长方形高 = R，宽 = nR·sin(π/n)', () => {
    for (const n of [8, 16, 32, 64]) {
      const R = 70
      const layout = wedgeLayout(n, R, 0, 200)
      expect(layout.height).toBe(R)
      expect(layout.width).toBeCloseTo(n * R * Math.sin(PI / n), 6)
      // 第一个扇形从 x0 开始，最后一个在 x0+width 结束
      expect(layout.width).toBeLessThanOrEqual(PI * R)
      expect(layout.width).toBeGreaterThan(0.9 * PI * R)
    }
  })

  it('长（以 r 为单位）随份数增加趋近 π', () => {
    expect(approxLengthInR(8)).toBeCloseTo(3.0615, 3)
    expect(approxLengthInR(16)).toBeCloseTo(3.1214, 3)
    expect(approxLengthInR(32)).toBeCloseTo(3.1365, 3)
    expect(approxLengthInR(64)).toBeCloseTo(3.1403, 3)
    // 单调递增且不超过 π
    for (const n of [8, 12, 16, 24, 32, 48, 64]) {
      expect(approxLengthInR(n)).toBeLessThan(PI)
    }
    expect(approxLengthInR(8)).toBeLessThan(approxLengthInR(16))
    expect(approxLengthInR(16)).toBeLessThan(approxLengthInR(32))
    expect(PI - approxLengthInR(64)).toBeLessThan(0.002)
  })

  it('拼成图形的面积恒等于圆面积 πR²（面积在剪拼中不变）', () => {
    for (const n of [8, 16, 32, 64]) {
      const R = 70
      const each = (PI * R * R) / n
      expect(each * n).toBeCloseTo(PI * R * R, 6)
      const layout = wedgeLayout(n, R, 0, 0)
      expect(layout.wedges).toHaveLength(n)
    }
  })

  it('扇形等分路径：首尾相接覆盖整圆', () => {
    const R = 50
    const n = 8
    const first = sectorPath(0, 0, R, 0, 360 / n)
    expect(first.startsWith('M 0 0')).toBe(true)
    expect(sectorPath(0, 0, R, 0, 200)).toContain('0 1 1') // 大于 180° 用 large-arc
    expect(sectorPath(0, 0, R, 0, 90)).toContain('0 0 1')
  })
})

describe('滚圆测周长几何', () => {
  it('滚动一周前进 2πR，轮上标记点回到轮的同一位置', () => {
    const R = 40
    expect(rollDistance(R, 2 * PI)).toBeCloseTo(2 * PI * R, 6)
    const start = rollPoint(20, 200, R, 0)
    const end = rollPoint(20, 200, R, 2 * PI)
    expect(end[0] - start[0]).toBeCloseTo(2 * PI * R, 6)
    expect(end[1]).toBeCloseTo(start[1], 6)
  })

  it('摆线：最高点为 2R，最低点落在直线上', () => {
    const R = 40
    const baseY = 200
    const ys: number[] = []
    for (let i = 0; i <= 200; i++) ys.push(rollPoint(0, baseY, R, (i / 200) * 2 * PI)[1])
    expect(Math.min(...ys)).toBeCloseTo(baseY - 2 * R, 6)
    expect(Math.max(...ys)).toBeCloseTo(baseY, 6)
    expect(cycloidPath(0, baseY, R).startsWith('M ')).toBe(true)
  })

  it('滚动 k 周前进 k 倍周长', () => {
    const R = 25
    for (const k of [1, 2, 3, 5]) {
      expect(rollDistance(R, 2 * PI * k)).toBeCloseTo(k * 2 * PI * R, 6)
    }
  })
})
