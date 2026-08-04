import { describe, it, expect } from 'vitest'
import { countUnits, tensOf, onesOf, isWithin } from '@/lib/engine/count'

describe('countUnits', () => {
  it('统计 emoji 串码点个数', () => {
    expect(countUnits('🍎🍎🍎')).toBe(3)
    expect(countUnits('')).toBe(0)
    expect(countUnits('👨\u200d👩\u200d👧')).toBe(5)
  })
})

describe('tensOf / onesOf', () => {
  it('13 = 1个十和3个一', () => {
    expect(tensOf(13)).toBe(1)
    expect(onesOf(13)).toBe(3)
  })
  it('0 ~ 9 没有十位', () => {
    expect(tensOf(5)).toBe(0)
    expect(onesOf(5)).toBe(5)
  })
  it('19', () => {
    expect(tensOf(19)).toBe(1)
    expect(onesOf(19)).toBe(9)
  })
})

describe('isWithin', () => {
  it('闭区间判断', () => {
    expect(isWithin(5, 0, 9)).toBe(true)
    expect(isWithin(-1, 0, 9)).toBe(false)
    expect(isWithin(10, 0, 9)).toBe(false)
  })
})
