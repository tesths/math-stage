import { describe, expect, it } from 'vitest'
import {
  KIND_LABELS,
  toFixed2,
  koujue,
  numCn,
  DIRECTIONS,
  oppositeOf,
  leftOf,
  rightOf,
  splitDigits,
} from '@/lib/engine/math'

describe('math 工具', () => {
  it('KIND_LABELS 覆盖全部 17 种 Lab 类型', () => {
    expect(Object.keys(KIND_LABELS)).toHaveLength(17)
    for (const v of Object.values(KIND_LABELS)) expect(v.length).toBeGreaterThan(0)
  })

  it('toFixed2：整数省略小数，小数去尾零', () => {
    expect(toFixed2(5)).toBe('5')
    expect(toFixed2(3.14)).toBe('3.14')
    expect(toFixed2(3.1)).toBe('3.1')
    expect(toFixed2(3.0)).toBe('3')
  })

  it('koujue：得数小于 10 用「得」', () => {
    expect(koujue(2, 4)).toBe('二四得八')
    expect(koujue(3, 3)).toBe('三三得九')
    expect(koujue(4, 2)).toBe('二四得八')
  })

  it('koujue：得数等于 10 用「一十」', () => {
    expect(koujue(5, 2)).toBe('二五一十')
    expect(koujue(2, 5)).toBe('二五一十')
  })

  it('koujue：十位为 1 时省略「一」', () => {
    expect(koujue(6, 2)).toBe('二六十二')
    expect(koujue(9, 2)).toBe('二九十八')
  })

  it('koujue：一般口诀（因数从小到大排列）', () => {
    expect(koujue(7, 8)).toBe('七八五十六')
    expect(koujue(8, 7)).toBe('七八五十六')
    expect(koujue(9, 3)).toBe('三九二十七')
    expect(koujue(6, 7)).toBe('六七四十二')
    expect(koujue(9, 9)).toBe('九九八十一')
  })

  it('numCn：1~9 中文数字', () => {
    expect(numCn(1)).toBe('一')
    expect(numCn(5)).toBe('五')
    expect(numCn(9)).toBe('九')
  })

  it('DIRECTIONS 顺序为 东南西北', () => {
    expect(DIRECTIONS).toEqual(['东', '南', '西', '北'])
  })

  it('oppositeOf：相对方向', () => {
    expect(oppositeOf(0)).toBe(2)
    expect(oppositeOf(1)).toBe(3)
    expect(oppositeOf(2)).toBe(0)
    expect(oppositeOf(3)).toBe(1)
  })

  it('leftOf：面向东时左手边是北（逆时针）', () => {
    expect(leftOf(0)).toBe(3)
    expect(leftOf(1)).toBe(0)
    expect(leftOf(2)).toBe(1)
    expect(leftOf(3)).toBe(2)
  })

  it('rightOf：面向东时右手边是南（顺时针）', () => {
    expect(rightOf(0)).toBe(1)
    expect(rightOf(1)).toBe(2)
    expect(rightOf(2)).toBe(3)
    expect(rightOf(3)).toBe(0)
  })

  it('splitDigits：三位数分解', () => {
    expect(splitDigits(124)).toEqual([1, 2, 4])
    expect(splitDigits(402)).toEqual([4, 0, 2])
    expect(splitDigits(999)).toEqual([9, 9, 9])
  })
})
