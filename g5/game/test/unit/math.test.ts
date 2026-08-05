import { describe, expect, it } from 'vitest'
import {
  AREA_SHAPES,
  areaOf,
  decimalParts,
  factorsOf,
  gcd,
  isPrime,
  lcm,
  primesUpTo,
  rectArea,
  shapeFromCode,
  toFixed2,
  trapezoidArea,
  triangleArea,
} from '@/lib/engine/math'

describe('math 工具（边界与分支）', () => {
  it('shapeFromCode：0/1/2 映射三种形状，undefined 与越界取模回退', () => {
    expect(shapeFromCode(0)).toBe('parallelogram')
    expect(shapeFromCode(1)).toBe('triangle')
    expect(shapeFromCode(2)).toBe('trapezoid')
    expect(shapeFromCode(undefined)).toBe('parallelogram')
    expect(shapeFromCode(3)).toBe('parallelogram')
    expect(shapeFromCode(4)).toBe('triangle')
    expect(shapeFromCode(5)).toBe('trapezoid')
  })

  it('AREA_SHAPES 三种形状齐全', () => {
    expect(AREA_SHAPES).toEqual(['parallelogram', 'triangle', 'trapezoid'])
  })

  it('rectArea / triangleArea / trapezoidArea', () => {
    expect(rectArea({ a: 6, h: 4 })).toBe(24)
    expect(triangleArea({ a: 8, h: 5 })).toBe(20)
    expect(trapezoidArea({ a: 4, b: 7, h: 5 })).toBe(27.5)
  })

  it('areaOf 三种形状面积', () => {
    expect(areaOf('parallelogram', { a: 6, h: 4 })).toBe(24)
    expect(areaOf('triangle', { a: 8, h: 5 })).toBe(20)
    expect(areaOf('trapezoid', { a: 4, b: 7, h: 5 })).toBe(27.5)
  })

  it('factorsOf：1 / 平方数 / 大数', () => {
    expect(factorsOf(1)).toEqual([1])
    expect(factorsOf(4)).toEqual([1, 2, 4])
    expect(factorsOf(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36])
  })

  it('isPrime：0/1 非质数，2/3 质数，4 合数，97 质数', () => {
    expect(isPrime(0)).toBe(false)
    expect(isPrime(1)).toBe(false)
    expect(isPrime(2)).toBe(true)
    expect(isPrime(3)).toBe(true)
    expect(isPrime(4)).toBe(false)
    expect(isPrime(97)).toBe(true)
  })

  it('gcd：含 0 与互质', () => {
    expect(gcd(0, 5)).toBe(5)
    expect(gcd(8, 12)).toBe(4)
    expect(gcd(7, 13)).toBe(1)
  })

  it('lcm：互质与倍数关系', () => {
    expect(lcm(3, 5)).toBe(15)
    expect(lcm(4, 8)).toBe(8)
  })

  it('primesUpTo：0/1 空，2 含 2', () => {
    expect(primesUpTo(0)).toEqual([])
    expect(primesUpTo(1)).toEqual([])
    expect(primesUpTo(2)).toEqual([2])
  })

  it('decimalParts：整数（toFixed 补零）/ 一位 / 两位小数', () => {
    expect(decimalParts(6.25)).toEqual({ int: 6, frac: [2, 5] })
    expect(decimalParts(3)).toEqual({ int: 3, frac: [0, 0] })
    expect(decimalParts(0.5)).toEqual({ int: 0, frac: [5, 0] })
  })

  it('toFixed2：整数原样、小数去尾零、普通两位', () => {
    expect(toFixed2(3)).toBe('3')
    expect(toFixed2(3.5)).toBe('3.5')
    expect(toFixed2(3.14159)).toBe('3.14')
    expect(toFixed2(2)).toBe('2')
  })
})
