import { describe, expect, it } from 'vitest'
import { clamp, countLabel, joinItems, range } from '../utils'

describe('共享工具 utils', () => {
  it('clamp 限制数值范围', () => {
    expect(clamp(5, 1, 10)).toBe(5)
    expect(clamp(-3, 1, 10)).toBe(1)
    expect(clamp(99, 1, 10)).toBe(10)
    expect(clamp(0, 0, 0)).toBe(0)
  })

  it('range 生成整数序列（含 start 不含 end）', () => {
    expect(range(1, 4)).toEqual([1, 2, 3])
    expect(range(0, 3)).toEqual([0, 1, 2])
    expect(range(2, 2)).toEqual([])
  })

  it('joinItems 用顿号连接', () => {
    expect(joinItems(['a', 'b', 'c'])).toBe('a、b、c')
    expect(joinItems(['单'])).toBe('单')
    expect(joinItems([])).toBe('')
  })

  it('countLabel 输出计数文案', () => {
    expect(countLabel(5, '个')).toBe('5 个')
    expect(countLabel(1, '道')).toBe('1 道')
    expect(countLabel(20, '个')).toBe('20 个')
  })
})
