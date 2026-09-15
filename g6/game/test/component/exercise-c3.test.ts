import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC3Lab from '@/components/labs/exercises/ExerciseC3Lab.vue'
import { findLabById } from '@data'
import { c3Exercises } from '@data/chapters/c3-exercises'

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

  it('c3 全部练习题 lab 用空参数挂载不抛错且文本非空', () => {
    for (const lab of c3Exercises) {
      const wrapper = mount(ExerciseC3Lab, { props: { lab, values: {} } })
      expect(wrapper.find('.ex-c3-wrap').exists()).toBe(true)
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})
