import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { splitShares } from '@/lib/labs/decimal'
import { allLabs } from '@data'

/**
 * 第 4 轮（agent C 复核）新增的锁定测试：
 * `decimal-div` 的右侧计算面板必须与左侧「逐级平均分」用同一份算理。
 *
 * 复核发现的原问题：compute 里直接写 `9.6 ÷ 7 = 1.37143`（等号 + 5 位小数），
 * 而左侧组件的逐级平均分给出「每份 1.3 元，余 0.5 元」——两处互相矛盾，
 * 且「9.6 ÷ 7 = 1.37143」本身不成立（真值 1.371428…）。
 */
describe('decimal-div：商与余数必须与逐级平均分一致', () => {
  it('能除尽时用等号，给出精确的商', () => {
    const r = computeLab('decimal-div', { total: 9.6, count: 3 })
    expect(r.text).toContain('3.2')
    expect(r.text).not.toContain('≈')
    expect(r.conclusion).toContain('正好分完')
  })

  it('除不尽时给「商 + 余数」，并标约等号（不能再出现 1.37143）', () => {
    const r = computeLab('decimal-div', { total: 9.6, count: 7 })
    expect(r.text).toContain('余 0.5 元')
    expect(r.text).toContain('≈ 1.37')
    expect(JSON.stringify(r)).not.toContain('1.37143')
    // 商 + 余数必须回到总数
    expect(9.6 - 1.3 * 7).toBeCloseTo(0.5, 9)
  })

  it('可达参数全区间：显示出来的数不超过两位小数，且 每份 × 份数 + 余数 = 总数', () => {
    for (let i = 1; i <= 999; i++) {
      const total = Math.round(i) / 10 // 0.1 ~ 99.9
      for (let count = 1; count <= 9; count++) {
        const s = splitShares(total, count)
        expect(Math.abs(s.perGroup * count + s.remainder - total)).toBeLessThan(1e-9)
        const r = computeLab('decimal-div', { total, count })
        // 文案里凡是小数都不超过两位（元只有元/角/分三级）
        for (const m of r.text.matchAll(/\d+\.(\d+)/g)) {
          expect(m[1].length).toBeLessThanOrEqual(2)
        }
        if (s.exact) expect(r.text).not.toContain('≈')
        else expect(r.text).toContain('余')
      }
    }
  })

  it('教材原题 9.6 ÷ 3 = 3.2 元（书页 60）', () => {
    const lab = allLabs.find((l) => l.id === 'g5-c4-ddiv-eraser')!
    expect(lab.page).toBe(60)
    const r = computeLab('decimal-div', { total: 9.6, count: 3 }, lab)
    expect(r.value).toBeCloseTo(3.2, 9)
    expect(r.text).toBe('3.2 元')
  })
})
