import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { approxLengthInR } from '@/lib/labs/circle'
import { segmentMore } from '@/lib/labs/quantity'
import { findLabById } from '@data'
import { fractionText } from '@/lib/labs/fractions'

/**
 * 第 4 轮（agent C 复核）新增的锁定测试。
 *
 * 两个「算式本身不成立」的显示问题：
 * 1) 比一个数多几分之几：原来把 2/7 先四舍五入成 1.28571 再乘，
 *    屏幕上出现「14 × 1.28571 = 18 天」——这句话不成立（14 × 1.28571 = 17.99994）。
 *    改为按分率原样写：14 × (1 + 2/7) = 18 天。
 * 2) 圆的面积剪拼：长方形的长取两位小数（15.31）后，屏幕上出现
 *    「15.31 × 5 ≈ 76.54」——15.31 × 5 = 76.55，对不上；长按三位小数（15.307）才对得上。
 */
describe('比一个数多（少）几分之几：分率必须原样出现', () => {
  it('14 比 14 多 2/7 → 步骤里写 14 × (1 + 2/7) = 18，不写 1.28571', () => {
    const r = computeLab('segment-more', { base: 14, fn: 2, fd: 7, mode: 0 })
    const text = r.steps.map((s) => `${s.expr}|${s.result}`).join('\n')
    expect(text).toContain('1 + 2/7')
    expect(text).toContain('= 18 天')
    expect(text).not.toContain('1.28571')
  })

  it('各种分率组合：步骤三条里的乘法式还原出的结果与显示值一致', () => {
    for (const [fn, fd] of [
      [2, 7],
      [1, 3],
      [2, 5],
      [3, 4],
    ] as const) {
      for (const mode of [0, 1]) {
        const base = 12
        const m = segmentMore(base, fn, fd, mode)
        const step = computeLab('segment-more', { base, fn, fd, mode }).steps[2]!.result
        expect(step).toContain(fractionText(fn, fd))
        // 用分数真值复算，不能和显示值差出四舍五入级别的误差
        const exact = base * (1 + (mode === 0 ? 1 : -1) * (fn / fd))
        expect(Math.abs(exact - m.result)).toBeLessThan(0.01)
      }
    }
  })

  it('圆的面积：长按三位小数显示，乘法式才成立', () => {
    const lab = findLabById('g6-c5-circle-area')!
    const r = computeLab('circle-area', { r: 5, slices: 8 })
    expect(lab.page).toBe(80)
    // 8 份：长 = 8·sin(π/8)·r = 3.0615r = 15.307 米
    const len = Math.round(approxLengthInR(8) * 5 * 1000) / 1000
    expect(len).toBe(15.307)
    expect(Math.round(len * 5 * 100) / 100).toBe(76.54) // 15.307 × 5 = 76.535 ≈ 76.54
    expect(Math.round(15.31 * 5 * 100) / 100).toBe(76.55) // 两位小数时会是 76.55，与 76.54 打不上
    expect(r.text).toContain('78.5')
  })
})
