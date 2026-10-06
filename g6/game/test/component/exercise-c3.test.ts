import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC3Lab from '@/components/labs/exercises/ExerciseC3Lab.vue'
import { findLabById } from '@data'
import { c3Exercises } from '@data/chapters/c3-exercises'

/** 从内联 style 属性里取出量条宽度百分比，用来断言图形随状态真的联动 */
function widthPct(style: string | undefined): number {
  const m = /width:\s*([\d.]+)%/.exec(style ?? '')
  return m?.[1] === undefined ? Number.NaN : Number(m[1])
}

describe('ExerciseC3Lab（三 数与运算的再认识 · 练习题）', () => {
  it('ex-c3-div-to-mul：4.8÷0.1 显示乘 10 与两条算式', () => {
    const lab = findLabById('g6-c3-ex-div-to-mul')!
    const wrapper = mount(ExerciseC3Lab, { props: { lab, values: { divIdx: 0, a: 4.8 } } })
    expect(wrapper.find('.ex-c3-wrap').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-div-to-mul').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-bars').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-numline').exists()).toBe(true)
    expect(wrapper.text()).toContain('4.8 ÷ 0.1 = 48')
    expect(wrapper.text()).toContain('4.8 × 10 = 48')
    expect(wrapper.text()).toContain('1/b')
    expect(wrapper.text()).toContain('平均分成 10 段')
  })

  it('ex-c3-div-to-mul：除数 2 时商变小并改按除数分段', () => {
    const lab = findLabById('g6-c3-ex-div-to-mul')!
    const wrapper = mount(ExerciseC3Lab, { props: { lab, values: { divIdx: 1, a: 2.6 } } })
    expect(wrapper.text()).toContain('2.6 ÷ 2 = 1.3')
    expect(wrapper.text()).toContain('2.6 × 0.5 = 1.3')
    expect(wrapper.text()).toContain('平均分成 2 段')
  })

  it('ex-c3-div-to-mul 过程态：分三步揭示“除以 b”与“乘 1/b”', async () => {
    const lab = findLabById('g6-c3-ex-div-to-mul')!
    // 除数 10 > 1：商 0.54 比被除数 5.4 小
    const wrapper = mount(ExerciseC3Lab, { props: { lab, values: { divIdx: 3, a: 5.4 } } })
    // 初始态 = 最完整的一步：单位矩形、倒数对照条、乘法算式都在
    expect(wrapper.find('.ex-c3-unit').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-fill.divisor').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-fill.reciprocal').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-overlay').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-eq').text()).toContain('5.4 ÷ 10 = 0.54')
    expect(wrapper.find('.ex-c3-eq').text()).toContain('5.4 × 0.1 = 0.54')
    expect(wrapper.find('.ex-c3-compare').classes()).toContain('shrink')
    expect(wrapper.find('.ex-c3-compare').text()).toContain('除数 10 > 1')
    expect(wrapper.find('.ex-c3-compare').text()).toContain('商 0.54 比被除数 5.4 小')
    // 倒数条只有 1% 宽、除数条满宽，商条也只有 10% 宽 → 除数 > 1 商变小
    expect(widthPct(wrapper.find('.ex-c3-fill.reciprocal').attributes('style'))).toBeCloseTo(1, 4)
    expect(widthPct(wrapper.find('.ex-c3-fill.divisor').attributes('style'))).toBeCloseTo(100, 4)
    expect(widthPct(wrapper.find('.ex-c3-fill.quotient').attributes('style'))).toBeCloseTo(10, 4)

    const btn = wrapper.findAll('button').find((b) => b.text().includes('下一步：先看除法量条'))!
    expect(btn).toBeTruthy()
    expect(wrapper.find('.ex-c3-step-note').text()).toContain('第 3 步：两条路走到同一个结果')

    // 第 1 步：只留下除法量条与除法算式
    await btn.trigger('click')
    expect(wrapper.find('.ex-c3-unit').exists()).toBe(false)
    expect(wrapper.find('.ex-c3-fill.dividend').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-fill.reciprocal').exists()).toBe(false)
    expect(wrapper.find('.ex-c3-overlay').exists()).toBe(false)
    expect(wrapper.find('.ex-c3-eq').text()).not.toContain('×')
    expect(wrapper.find('.ex-c3-eq').text()).toContain('5.4 ÷ 10 = 0.54')
    expect(wrapper.text()).toContain('第 1 步：先只看除法')
    expect(wrapper.findAll('button').some((b) => b.text().includes('下一步：再叠倒数 1/b'))).toBe(true)

    // 第 2 步：叠出倒数量条与“乘 1/b”这一段，但还没标出结果相同
    await btn.trigger('click')
    expect(wrapper.find('.ex-c3-unit').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-fill.reciprocal').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-overlay').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-eq').text()).not.toContain('×')
    expect(wrapper.text()).toContain('第 2 步：再看倒数')
    expect(wrapper.findAll('button').some((b) => b.text().includes('下一步：两条路结果相同'))).toBe(true)

    // 第 3 步：回到初始态，标出两条路结果相同
    await btn.trigger('click')
    expect(wrapper.find('.ex-c3-eq').text()).toContain('5.4 × 0.1 = 0.54')
    expect(wrapper.find('.ex-c3-compare').classes()).toContain('shrink')
    expect(wrapper.findAll('button').some((b) => b.text().includes('下一步：先看除法量条'))).toBe(true)

    // 除数 0.1 < 1：商 48 比被除数 4.8 大，倒数条反过来满宽
    const grow = mount(ExerciseC3Lab, { props: { lab, values: { divIdx: 0, a: 4.8 } } })
    expect(grow.find('.ex-c3-compare').classes()).toContain('grow')
    expect(grow.find('.ex-c3-compare').text()).toContain('除数 0.1 < 1')
    expect(grow.find('.ex-c3-compare').text()).toContain('商 48 比被除数 4.8 大')
    expect(widthPct(grow.find('.ex-c3-fill.reciprocal').attributes('style'))).toBeCloseTo(100, 4)
    expect(widthPct(grow.find('.ex-c3-fill.quotient').attributes('style'))).toBeCloseTo(100, 4)
  })

  it('ex-c3-frac-split：和模式拆成 a 个与 7−a 个', () => {
    const lab = findLabById('g6-c3-ex-frac-split')!
    const wrapper = mount(ExerciseC3Lab, { props: { lab, values: { mode: 0, a: 3 } } })
    expect(wrapper.find('.ex-c3-frac').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-cell.primary').exists()).toBe(true)
    expect(wrapper.find('.ex-c3-cell.light').exists()).toBe(true)
    expect(wrapper.text()).toContain('3/12 + 4/12 = 7/12')
  })

  it('ex-c3-frac-split：差模式从 a+7 个里去掉 a 个', () => {
    const lab = findLabById('g6-c3-ex-frac-split')!
    const wrapper = mount(ExerciseC3Lab, { props: { lab, values: { mode: 1, a: 2 } } })
    expect(wrapper.find('.ex-c3-cell.removed').exists()).toBe(true)
    expect(wrapper.text()).toContain('9/12 − 2/12 = 7/12')
  })

  it('ex-c3-frac-split 过程态：换一种拆法，同一个和（差）有多组拆法', async () => {
    const lab = findLabById('g6-c3-ex-frac-split')!
    const wrapper = mount(ExerciseC3Lab, { props: { lab, values: { mode: 0, a: 3 } } })
    // 初始态：沿用参数里的 3/12 + 4/12，并把 5 组拆法都列出来
    expect(wrapper.find('.ex-c3-eq').text()).toBe('3/12 + 4/12 = 7/12')
    expect(wrapper.findAll('.ex-c3-split-chip').length).toBe(5)
    expect(wrapper.findAll('.ex-c3-split-chip').map((c) => c.text())).toEqual([
      '1/12 + 6/12 = 7/12',
      '2/12 + 5/12 = 7/12',
      '3/12 + 4/12 = 7/12',
      '4/12 + 3/12 = 7/12',
      '5/12 + 2/12 = 7/12',
    ])
    expect(wrapper.find('.ex-c3-split-chip.active').text()).toBe('3/12 + 4/12 = 7/12')
    expect(wrapper.findAll('.ex-c3-cell.primary').length).toBe(3)
    expect(wrapper.findAll('.ex-c3-cell.light').length).toBe(4)
    const x1 = Number(wrapper.find('.ex-c3-frac-svg line').attributes('x1'))

    const btn = wrapper.findAll('button').find((b) => b.text().includes('换一种拆法'))!
    expect(btn).toBeTruthy()

    // 点一次：算式、分数条高亮与分界虚线一起换成下一组拆法
    await btn.trigger('click')
    expect(wrapper.find('.ex-c3-eq').text()).toBe('4/12 + 3/12 = 7/12')
    expect(wrapper.find('.ex-c3-split-chip.active').text()).toBe('4/12 + 3/12 = 7/12')
    expect(wrapper.findAll('.ex-c3-cell.primary').length).toBe(4)
    expect(wrapper.findAll('.ex-c3-cell.light').length).toBe(3)
    expect(Number(wrapper.find('.ex-c3-frac-svg line').attributes('x1'))).toBeGreaterThan(x1)
    expect(wrapper.find('.ex-c3-step-note').text()).toContain('同一个和 7/12 有 5 组拆法')

    // 循环 4 次后回到初始那一组
    for (let i = 0; i < 4; i += 1) await btn.trigger('click')
    expect(wrapper.find('.ex-c3-eq').text()).toBe('3/12 + 4/12 = 7/12')
    expect(wrapper.find('.ex-c3-split-chip.active').text()).toBe('3/12 + 4/12 = 7/12')
    expect(wrapper.findAll('.ex-c3-cell.primary').length).toBe(3)

    // 差值模式同理：同一个差也能在多组拆法之间循环
    const diff = mount(ExerciseC3Lab, { props: { lab, values: { mode: 1, a: 2 } } })
    expect(diff.find('.ex-c3-eq').text()).toBe('9/12 − 2/12 = 7/12')
    expect(diff.find('.ex-c3-split-chip.active').text()).toBe('9/12 − 2/12 = 7/12')
    expect(diff.findAll('.ex-c3-cell.removed').length).toBe(2)
    const diffBtn = diff.findAll('button').find((b) => b.text().includes('换一种拆法'))!
    await diffBtn.trigger('click')
    expect(diff.find('.ex-c3-eq').text()).toBe('10/12 − 3/12 = 7/12')
    expect(diff.find('.ex-c3-split-chip.active').text()).toBe('10/12 − 3/12 = 7/12')
    expect(diff.findAll('.ex-c3-cell.removed').length).toBe(3)
    expect(diff.find('.ex-c3-step-note').text()).toContain('同一个差 7/12 有 5 组拆法')
    for (let i = 0; i < 4; i += 1) await diffBtn.trigger('click')
    expect(diff.find('.ex-c3-eq').text()).toBe('9/12 − 2/12 = 7/12')
    expect(diff.findAll('.ex-c3-cell.removed').length).toBe(2)
  })

  it('c3 全部练习题 lab 用空参数挂载不抛错且文本非空', () => {
    for (const lab of c3Exercises) {
      const wrapper = mount(ExerciseC3Lab, { props: { lab, values: {} } })
      expect(wrapper.find('.ex-c3-wrap').exists()).toBe(true)
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})
