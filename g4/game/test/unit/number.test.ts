import { describe, expect, it } from 'vitest'
import { fourDigitGroups, roundToWan, thousandsDigit } from '@/lib/labs/number'

describe('thousandsDigit · 千位是第 4 位（从右数）', () => {
  it('384204 的千位是 4，不是百位的 2', () => {
    expect(thousandsDigit(384204)).toBe(4)
    expect(thousandsDigit(385204)).toBe(5)
    expect(thousandsDigit(1000)).toBe(1)
    expect(thousandsDigit(999)).toBe(0)
  })
})

describe('roundToWan · 四舍五入到万位', () => {
  it('384204 → 38 万（千位 4，舍）', () => {
    const r = roundToWan(384204)
    expect(r.digit).toBe(4)
    expect(r.up).toBe(false)
    expect(r.wan).toBe(38)
    expect(r.text).toContain('不满 5 舍去')
  })

  it('385204 → 39 万（千位 5，进 1）——旧实现读成千位 2，结果与文字矛盾', () => {
    const r = roundToWan(385204)
    expect(r.digit).toBe(5)
    expect(r.up).toBe(true)
    expect(r.wan).toBe(39)
    expect(r.text).toContain('进 1')
  })

  it('结果与整数除法一致：万位 = 四舍五入(v / 10000)', () => {
    for (const v of [384204, 385204, 12345, 9999, 250000, 999999, 1000000]) {
      expect(roundToWan(v).wan).toBe(Math.round(v / 10000))
    }
  })
})

describe('fourDigitGroups · 从右边起四位一级', () => {
  it('12345678 → 个级 5678 / 万级 1234', () => {
    const g = fourDigitGroups(12345678)
    expect(g.map((x) => x.name)).toEqual(['个级', '万级'])
    expect(g[0]!.digits).toBe('5678')
    expect(g[1]!.digits).toBe('1234')
  })

  it('不足四位也是一个级：384204 → 个级 4204 / 万级 38', () => {
    const g = fourDigitGroups(384204)
    expect(g[0]!.digits).toBe('4204')
    expect(g[1]!.digits).toBe('38')
  })

  it('拼接各级能还原原数', () => {
    for (const v of [12345678, 384204, 100000000, 7]) {
      const joined = fourDigitGroups(v)
        .slice()
        .reverse()
        .map((x) => x.digits)
        .join('')
      expect(Number(joined)).toBe(v)
    }
  })
})
