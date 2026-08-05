import { describe, expect, it } from 'vitest'
import {
  COUNT_UNITS,
  digitCount,
  digitsOf,
  factorsOf,
  formatBig,
  roundTo,
  toFixed2,
} from '@/lib/engine/math'

describe('math 工具（边界与分支）', () => {
  it('digitCount', () => {
    expect(digitCount(0)).toBe(1)
    expect(digitCount(9)).toBe(1)
    expect(digitCount(10000)).toBe(5)
    expect(digitCount(-123)).toBe(3)
  })

  it('digitsOf', () => {
    expect(digitsOf(156)).toEqual([1, 5, 6])
    expect(digitsOf(0)).toEqual([0])
    expect(digitsOf(-12)).toEqual([1, 2])
  })

  it('roundTo 万位/亿位', () => {
    expect(roundTo(384204, 4)).toBe(380000)
    expect(roundTo(386685, 4)).toBe(390000)
    expect(roundTo(150000000, 8)).toBe(200000000)
  })

  it('formatBig 千分位与大数', () => {
    expect(formatBig(10000)).toBe('10,000')
    expect(formatBig(100000000)).toBe('100,000,000')
    expect(formatBig(0)).toBe('0')
  })

  it('factorsOf 边界', () => {
    expect(factorsOf(1)).toEqual([1])
    expect(factorsOf(2)).toEqual([1, 2])
  })

  it('toFixed2 去尾零', () => {
    expect(toFixed2(1)).toBe('1')
    expect(toFixed2(1.5)).toBe('1.5')
    expect(toFixed2(1.25)).toBe('1.25')
    expect(toFixed2(1.2345)).toBe('1.23')
  })

  it('COUNT_UNITS 计数单位序列', () => {
    expect(COUNT_UNITS[0]).toBe('个')
    expect(COUNT_UNITS[4]).toBe('万')
    expect(COUNT_UNITS[8]).toBe('亿')
    expect(COUNT_UNITS.length).toBe(12)
  })
})
