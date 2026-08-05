import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { allLabs } from '@data'

describe('Lab 计算与参数联动', () => {
  it('默认参数下 computeLab 不抛错', () => {
    for (const l of allLabs) {
      const values: Record<string, number> = {}
      for (const p of l.params) values[p.key] = p.default
      if (l.fixed) Object.assign(values, l.fixed)
      expect(() => computeLab(l.kind, values)).not.toThrow()
    }
  })

  it('面积类 Lab 结果随参数变化', () => {
    const r1 = computeLab('area-rect', { a: 4, b: 3 })
    const r2 = computeLab('area-rect', { a: 8, b: 3 })
    expect(r2.value).toBeGreaterThan(r1.value)
  })

  it('周长类 Lab 结果随参数变化', () => {
    const r1 = computeLab('peri-rect', { a: 4, b: 3 })
    const r2 = computeLab('peri-rect', { a: 8, b: 3 })
    expect(r2.value).toBeGreaterThan(r1.value)
  })
})
