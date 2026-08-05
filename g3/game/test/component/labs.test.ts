import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import TimeLab from '@/components/labs/TimeLab.vue'
import DivLab from '@/components/labs/DivLab.vue'
import TimesLab from '@/components/labs/TimesLab.vue'
import { labsOfChapter, findLabById } from '@data'

describe('Lab 组件渲染', () => {
  it('MixCalcLab：乘加混合（笔记本+书包）', () => {
    const lab = findLabById('g3-c1-mix-multadd')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { price: 5, count: 3, bag: 50 } } })
    expect(wrapper.find('.mix-wrap').exists()).toBe(true)
    expect(wrapper.text()).toContain('5 × 3')
    expect(wrapper.text()).toContain('65')
  })

  it('MixCalcLab：除加混合（钢笔+订书机）', () => {
    const lab = findLabById('g3-c1-mix-divadd')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { box: 40, each: 5, stapler: 12 } } })
    expect(wrapper.text()).toContain('40 ÷ 5')
    expect(wrapper.text()).toContain('20')
  })

  it('MixCalcLab：小括号顺序对比', () => {
    const lab = findLabById('g3-c1-mix-order')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { a: 12, b: 8, c: 5 } } })
    expect(wrapper.text()).toContain('52')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('小括号')
  })

  it('MixCalcLab：小括号购物', () => {
    const lab = findLabById('g3-c1-mix-bracket')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { money: 100, bag: 50, notebook: 5 } } })
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('10')
  })

  it('TimeLab：24 时记时法（晚上 20 时）', () => {
    const lab = findLabById('g3-c2-time24')!
    const wrapper = mount(TimeLab, { props: { lab, values: { hour: 20, min: 0 } } })
    expect(wrapper.find('.clock-svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('晚上')
    expect(wrapper.text()).toContain('20:00')
  })

  it('TimeLab：经过时间', () => {
    const lab = findLabById('g3-c2-elapsed')!
    const wrapper = mount(TimeLab, { props: { lab, values: { start: 9, end: 17 } } })
    expect(wrapper.find('.timeline').exists()).toBe(true)
    expect(wrapper.text()).toContain('8')
  })

  it('DivLab：笔算除法（42 ÷ 3）', () => {
    const lab = findLabById('g3-c8-div-pen')!
    const wrapper = mount(DivLab, { props: { lab, values: { tens: 4, ones: 2, div: 3 } } })
    expect(wrapper.find('.div-svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('14')
  })

  it('DivLab：口算除法（600 ÷ 2）', () => {
    const lab = findLabById('g3-c8-div-oral')!
    const wrapper = mount(DivLab, { props: { lab, values: { base: 600, div: 2 } } })
    expect(wrapper.text()).toContain('600')
    expect(wrapper.text()).toContain('300')
  })

  it('TimesLab：求一个数的几倍', () => {
    const lab = findLabById('g3-c12-times-mul')!
    const wrapper = mount(TimesLab, { props: { lab, values: { base: 4, times: 2 } } })
    expect(wrapper.text()).toContain('8')
  })

  it('每个单元都有 Lab 数据', () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })
})
