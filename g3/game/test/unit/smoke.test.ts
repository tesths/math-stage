import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { allLabs } from '@data'

describe('Lab 计算与参数联动', () => {
  it('默认参数下 computeLab 不抛错且返回完整结果', () => {
    for (const l of allLabs) {
      const values: Record<string, number> = {}
      for (const p of l.params) values[p.key] = p.default
      if (l.fixed) Object.assign(values, l.fixed)
      const r = computeLab(l.kind, values)
      expect(r.text.length).toBeGreaterThan(0)
      expect(r.steps.length).toBeGreaterThan(0)
      expect(r.conclusion.length).toBeGreaterThan(0)
      expect(typeof r.value).toBe('number')
    }
  })

  it('mix-calc 结果随参数变化', () => {
    const r1 = computeLab('mix-calc', { price: 5, count: 3, bag: 50 })
    const r2 = computeLab('mix-calc', { price: 8, count: 3, bag: 50 })
    expect(r2.value).toBeGreaterThan(r1.value)
  })

  it('elapsed 结束越晚经过越长', () => {
    const r1 = computeLab('elapsed', { start: 9, end: 12 })
    const r2 = computeLab('elapsed', { start: 9, end: 17 })
    expect(r2.value).toBeGreaterThan(r1.value)
  })

  it('remainder 余数小于除数', () => {
    for (const total of [10, 50, 99]) {
      for (const div of [3, 5, 7]) {
        const r = computeLab('remainder', { total, div })
        expect(r.value).toBe(Math.floor(total / div))
        expect(r.text).toContain(String(total % div))
      }
    }
  })
})
