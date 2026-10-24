import { describe, expect, it } from 'vitest'
import {
  dialPairs,
  handAngles,
  hour12Of,
  hour24From12,
  hour24Of,
  isAfternoon,
  periodOf,
  walkOneTurn,
} from '@/lib/labs/time'

describe('handAngles · 指针角度按真实比例', () => {
  it('分针每分钟 6°', () => {
    expect(handAngles(3, 0).minute).toBe(0)
    expect(handAngles(3, 15).minute).toBe(90)
    expect(handAngles(3, 30).minute).toBe(180)
    expect(handAngles(3, 59).minute).toBe(354)
  })

  it('时针每小时 30°，并且随分钟连续走（3:30 不是正好指向 3）', () => {
    expect(handAngles(3, 0).hour).toBe(90)
    expect(handAngles(3, 30).hour).toBe(105)
    expect(handAngles(3, 45).hour).toBeCloseTo(112.5, 5)
  })

  it('24 时记时法下 20 时与 8 时的时针角度相同', () => {
    expect(handAngles(20, 0).hour).toBe(handAngles(8, 0).hour)
  })
})

describe('12/24 时互化', () => {
  it('hour12Of：24 时读数换成 12 时读数', () => {
    expect(hour12Of(0)).toBe(12)
    expect(hour12Of(13)).toBe(1)
    expect(hour12Of(12)).toBe(12)
    expect(hour12Of(20)).toBe(8)
  })

  it('hour24From12：下午的 8 时要 +12 变成 20 时，上午的 8 时不变', () => {
    expect(hour24From12(8, true)).toBe(20)
    expect(hour24From12(8, false)).toBe(8)
    expect(hour24From12(12, true)).toBe(12) // 中午 12 时
    expect(hour24From12(11, true)).toBe(23)
  })

  it('hour24Of：把越界读数规整回 0~23', () => {
    expect(hour24Of(24)).toBe(0)
    expect(hour24Of(-1)).toBe(23)
    expect(hour24Of(25)).toBe(1)
  })

  it('isAfternoon：过了中午才能减 12', () => {
    expect(isAfternoon(0)).toBe(false)
    expect(isAfternoon(12)).toBe(false)
    expect(isAfternoon(13)).toBe(true)
    expect(isAfternoon(23)).toBe(true)
  })

  it('periodOf：0 时是晚上 12 时', () => {
    expect(periodOf(0)).toBe('晚上')
    expect(periodOf(8)).toBe('上午')
    expect(periodOf(12)).toBe('中午')
    expect(periodOf(20)).toBe('晚上')
  })

  it('walkOneTurn：时针再走 12 小时，内圈读数不变', () => {
    expect(walkOneTurn(8)).toBe(20)
    expect(walkOneTurn(20)).toBe(8)
    expect(hour12Of(walkOneTurn(8))).toBe(hour12Of(8))
  })
})

describe('dialPairs · 双圈钟面内外圈一一对应', () => {
  it('12 个角度上，外圈 = 内圈 + 12', () => {
    const pairs = dialPairs()
    expect(pairs).toHaveLength(12)
    for (const p of pairs) {
      expect(p.outer).toBe(p.inner + 12)
      expect(p.angle).toBe((p.inner % 12) * 30)
    }
  })

  it('8 时与 20 时在同一角度（240°）', () => {
    const p = dialPairs().find((x) => x.inner === 8)!
    expect(p.outer).toBe(20)
    expect(p.angle).toBe(240)
  })
})
