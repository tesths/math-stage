import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CircleLab from '@/components/labs/CircleLab.vue'
import { findLabById } from '@data'

/**
 * 第 4 轮（agent C 复核）：圆的面积「拼成的长方形」文案必须自洽。
 *
 * 复核用截图确认：屏幕上曾显示「拼成的长方形：15.31 × 5 ≈ 76.54 平方米」，
 * 而 15.31 × 5 = 76.55 —— 乘法式打不上（长被提前四舍五入到两位小数，
 * 面积却按三位小数算）。修法：长也显示三位小数（15.307 × 5 = 76.535 ≈ 76.54）。
 */
describe('CircleLab：圆的面积剪拼文案', () => {
  const lab = findLabById('g6-c5-circle-area')!

  it('8 份、r = 5：长按三位小数给出，乘法式对得上', () => {
    const wrapper = mount(CircleLab, { props: { lab, values: { r: 5, slices: 8 } } })
    const text = wrapper.text()
    expect(text).toContain('拼成的长方形：15.307 × 5 ≈ 76.54 平方米')
    expect(text).not.toContain('15.31 × 5')
  })

  it('「长与 πr 的差」这一栏：两位正文 + 三位精确值同时给，相减必须真的等于显示出来的差', () => {
    for (const n of [8, 16, 32, 64]) {
      const t = mount(CircleLab, { props: { lab, values: { r: 5, slices: n } } })
        .find('[data-test="len-gap"]')
        .text()
        .replace(/\s+/g, ' ')
      const three = [...t.matchAll(/(\d+\.\d{3})(?!\d)/g)].map((m) => Number(m[1]))
      const two = [...t.matchAll(/(\d+\.\d{2})(?!\d)/g)].map((m) => Number(m[1]))
      // 顺序：长（精确三位）、πr（精确三位）、差
      expect(three.length, t).toBeGreaterThanOrEqual(3)
      const [len3, pi3, gap] = three as [number, number, number]
      // 三位精确值相减必须真的等于显示的差（两位值相减会被二次舍入破坏，所以两位只作正文表述）
      expect(Math.abs(pi3 - len3 - gap), t).toBeLessThanOrEqual(0.001)
      // 两位正文表述必须保留，且与三位值只差舍入
      expect(two.length, t).toBeGreaterThanOrEqual(2)
      expect(Math.abs(two[0]! - len3), t).toBeLessThanOrEqual(0.005)
      expect(Math.abs(two[1]! - pi3), t).toBeLessThanOrEqual(0.005)
    }
  })

  it('16 份、r = 3：长与 πr 的差随份数变小（逼近是真的在动）', () => {
    const w8 = mount(CircleLab, { props: { lab, values: { r: 3, slices: 8 } } })
    const w16 = mount(CircleLab, { props: { lab, values: { r: 3, slices: 16 } } })
    // 8 份：3·3.0615 = 9.1845；16 份：3·3.1215 = 9.3644；πr = 9.4248
    expect(w8.text()).toContain('9.184')
    expect(w16.text()).toContain('9.364')
    expect(w16.text()).not.toContain('9.184')
    // 剪拼出的长方形面积也在变，说明过程态不是一张静态图
    expect(w8.text()).toContain('27.55')
  })
})
