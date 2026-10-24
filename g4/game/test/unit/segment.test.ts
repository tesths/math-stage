import { describe, expect, it } from 'vitest'
import { segModel } from '@/lib/labs/segment'

describe('segModel · 梨/橘子/苹果三步数量关系', () => {
  it('梨 20、少 12、3 倍：橘子 8、和 28、苹果 84', () => {
    const m = segModel(20, 12, 3)
    expect(m.orange).toBe(8)
    expect(m.sum).toBe(28)
    expect(m.apple).toBe(84)
    expect(m.clamped).toBe(false)
    expect(m.text[2]).toContain('84')
  })

  it('"少"比梨还多时不会画出负数线段：梨 5、少 20 → 少按 4 算，橘子 1', () => {
    const m = segModel(5, 20, 3)
    expect(m.less).toBe(4)
    expect(m.orange).toBe(1)
    expect(m.clamped).toBe(true)
    expect(m.text[0]).toContain('不能是负数')
  })

  it('橘子永远非负，苹果 = 总和 × 倍数', () => {
    for (const [p, l, t] of [[5, 20, 3], [20, 12, 3], [1, 1, 0], [60, 20, 6]] as const) {
      const m = segModel(p, l, t)
      expect(m.orange).toBeGreaterThanOrEqual(0)
      expect(m.apple).toBe((m.pear + m.orange) * m.times)
    }
  })
})
