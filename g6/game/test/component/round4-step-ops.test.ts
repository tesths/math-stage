import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import { findLabById } from '@data'

/**
 * 第 4 轮收尾（agent C）：给两页"只有滑块"的 Lab 补「做一次」的步进操作。
 *
 * 改前：`g6-c1-mul-decimal`、`g6-c1-div-approx` 重截的 `<id>-act.png` 与初始态**逐字节相同**
 * ——整页只有滑块，没有按钮，属于 rubric 的「静态图当过程」（L3 fail）。
 * 改后：
 * - 方格模型可以「一行一行地数」（每行 6 格 → 6/100、18/100、24/100），积是数出来的；
 * - 商的近似值可以「一位一位地试」（余数 ×10 ÷ 60 → 本位商 + 新余数）。
 * 两处都不动基线断言（`.grid-cell.filled` = 24、`.div-approx-final` 一开始就在）。
 */
describe('g6-c1-mul-decimal：逐行数格', () => {
  const lab = findLabById('g6-c1-mul-decimal')!
  const mountIt = () => mount(DecimalLab, { props: { lab, values: { a: 0.6, b: 0.4 } } })

  it('初始态：阴影 24 格已画满（基线保持），但一行都还没数', () => {
    const w = mountIt()
    expect(w.findAll('.grid-cell.filled')).toHaveLength(24)
    expect(w.findAll('.grid-cell.row-on')).toHaveLength(0)
    expect(w.find('[data-test="row-status"]').text()).toContain('还没开始数')
    expect(w.find('[data-test="row-next"]').exists()).toBe(true)
  })

  it('点一次 → 点亮第一行 6 格，读数 6/100 = 0.06（DOM 真的变了）', async () => {
    const w = mountIt()
    const before = w.html()
    await w.find('[data-test="row-next"]').trigger('click')
    expect(w.findAll('.grid-cell.row-on')).toHaveLength(6)
    expect(w.find('[data-test="row-status"]').text()).toContain('已数 1 行')
    expect(w.find('[data-test="row-status"]').text()).toContain('6/100 = 0.06')
    expect(w.html()).not.toBe(before)
  })

  it('数满 4 行 = 24/100 = 0.24，与 0.6 × 0.4 一致，按钮变灰', async () => {
    const w = mountIt()
    const btn = w.find('[data-test="row-next"]')
    for (let i = 0; i < 4; i++) await btn.trigger('click')
    expect(w.findAll('.grid-cell.row-on')).toHaveLength(24)
    const cells = Number((0.6 * 0.4 * 100).toFixed(0))
    expect(w.find('[data-test="row-status"]').text()).toContain(`24 格 = 24/100 = 0.24`)
    expect(`24 格 = 24/100 = 0.24`).toContain(`${cells}/100`)
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('换 a/b 后计数清零（不会把上一组的读数带到新题上）', async () => {
    const w = mountIt()
    await w.findAll('button').find((b) => b.text().startsWith('数完'))!.trigger('click')
    expect(w.findAll('.grid-cell.row-on')).toHaveLength(24)
    await w.setProps({ values: { a: 0.5, b: 0.3 } })
    expect(w.findAll('.grid-cell.row-on')).toHaveLength(0)
    expect(w.findAll('.grid-cell.filled')).toHaveLength(15)
  })
})

describe('g6-c1-div-approx：逐位试商', () => {
  const lab = findLabById('g6-c1-div-approx')!
  const mountIt = (speed = 40) => mount(DecimalLab, { props: { lab, values: { speed } } })

  it('初始态：商只有整数部分加省略号，一位都没试', () => {
    const w = mountIt(40)
    expect(w.find('[data-test="digit-quot"]').text()).toContain('666…')
    expect(w.findAll('[data-test="digit-row"]')).toHaveLength(0)
    // 基线：结论框一开始就在（不许改坏）
    expect(w.find('.div-approx-final').exists()).toBe(true)
  })

  it('点一次 → 第一行「400 ÷ 60 = 6 …… 余 40」，商变成 666.6…', async () => {
    const w = mountIt(40)
    const before = w.html()
    await w.find('[data-test="digit-next"]').trigger('click')
    const row = w.findAll('[data-test="digit-row"]')[0]!.text()
    expect(row).toContain('第 1 位：400 ÷ 60 = 6')
    expect(row).toContain('余 40')
    expect(w.find('[data-test="digit-quot"]').text()).toContain('666.6…')
    expect(w.html()).not.toBe(before)
  })

  it('三位试完 → 给出 666.666…、判定位与四舍五入结论，按钮变灰', async () => {
    const w = mountIt(40)
    const btn = w.find('[data-test="digit-next"]')
    for (let i = 0; i < 3; i++) await btn.trigger('click')
    expect(w.findAll('[data-test="digit-row"]')).toHaveLength(3)
    expect(w.find('[data-test="digit-quot"]').text()).toContain('666.666')
    expect(w.find('.digit-trial-verdict').text()).toContain('≥ 5，第二位进 1')
    expect(w.find('.digit-trial-verdict').text()).toContain('666.67')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('全区间：逐位试商算出的每一位，与独立长除复算完全一致', async () => {
    for (let speed = 30; speed <= 60; speed += 1) {
      const w = mountIt(speed)
      const btn = w.find('[data-test="digit-next"]')
      for (let i = 0; i < 3; i++) await btn.trigger('click')
      const shown = w.findAll('[data-test="digit-row"]').map((r) => r.text())
      // 独立复算：mph ÷ 60 的整数部分 + 三位小数
      const mph = speed * 1000
      let rem = mph % 60
      const digits: number[] = []
      const rems: number[] = []
      for (let k = 0; k < 3; k++) {
        const div = rem * 10
        digits.push(Math.floor(div / 60))
        rem = div % 60
        rems.push(rem)
      }
      digits.forEach((d, i) => {
        expect(shown[i], `speed=${speed} 第 ${i + 1} 位`).toContain(`= ${d}`)
        expect(shown[i]).toContain(`余 ${rems[i]}`)
      })
      expect(w.find('[data-test="digit-quot"]').text()).toContain(
        `${Math.floor(mph / 60)}.${digits.join('')}`,
      )
    }
  })
})
