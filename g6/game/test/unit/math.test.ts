import { describe, expect, it } from 'vitest'
import {
  KIND_LABELS,
  toFixed2,
  toFixedN,
  gcd,
  simplifyRatio,
  toBinary,
  fromBinary,
  roundTo,
  isTerminatingDecimal,
} from '@/lib/engine/math'

describe('math 工具', () => {
  it('KIND_LABELS 覆盖全部 33 种 Lab 类型', () => {
    expect(Object.keys(KIND_LABELS)).toHaveLength(33)
    for (const v of Object.values(KIND_LABELS)) expect(v.length).toBeGreaterThan(0)
  })

  it('toFixed2：整数省略小数，小数去尾零', () => {
    expect(toFixed2(5)).toBe('5')
    expect(toFixed2(3.14)).toBe('3.14')
    expect(toFixed2(3.1)).toBe('3.1')
    expect(toFixed2(3.0)).toBe('3')
  })

  it('toFixedN：保留指定位数', () => {
    expect(toFixedN(3.14159, 2)).toBe('3.14')
    expect(toFixedN(2, 0)).toBe('2')
  })

  it('gcd', () => {
    expect(gcd(12, 18)).toBe(6)
    expect(gcd(8, 12)).toBe(4)
    expect(gcd(7, 13)).toBe(1)
  })

  it('simplifyRatio：化简整数比', () => {
    expect(simplifyRatio(12, 18)).toEqual([2, 3])
    expect(simplifyRatio(90, 54)).toEqual([5, 3])
    expect(simplifyRatio(7, 13)).toEqual([7, 13])
  })

  it('toBinary / fromBinary', () => {
    expect(toBinary(0)).toBe('0')
    expect(toBinary(5)).toBe('101')
    expect(toBinary(31)).toBe('11111')
    expect(fromBinary('101')).toBe(5)
    expect(fromBinary('11111')).toBe(31)
    expect(fromBinary(toBinary(20))).toBe(20)
  })

  it('roundTo：四舍五入', () => {
    expect(roundTo(3.146, 2)).toBe(3.15)
    expect(roundTo(2.5, 0)).toBe(3)
    expect(roundTo(40 * 1000 / 3600, 2)).toBe(11.11)
  })

  it('isTerminatingDecimal', () => {
    expect(isTerminatingDecimal(0.5)).toBe(true)
    expect(isTerminatingDecimal(0.3333333333)).toBe(true)
  })
})
