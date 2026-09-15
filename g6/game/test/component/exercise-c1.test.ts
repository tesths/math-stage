import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC1Lab from '@/components/labs/exercises/ExerciseC1Lab.vue'
import { findLabById } from '@data'
import { c1Exercises } from '@data/chapters/c1-exercises'

describe('ExerciseC1Lab：一单元练习题', () => {
  it('ex-c1-div11-cycle 渲染长除法 / 循环节弧 / 规律表', () => {
    const lab = findLabById('g6-c1-ex-div11-cycle')!
    const wrapper = mount(ExerciseC1Lab, { props: { lab, values: { n: 3, digits: 2 } } })

    expect(wrapper.find('.long-div').exists()).toBe(true)
    expect(wrapper.find('.cycle-arc').exists()).toBe(true)
    expect(wrapper.find('.rule-table').exists()).toBe(true)
    // 循环节两位数正好高亮 2 个字
    expect(wrapper.findAll('.ca-cycle')).toHaveLength(2)
    expect(wrapper.text()).toContain('0.2727')
    expect(wrapper.text()).toContain('循环节 27')
    expect(wrapper.text()).toContain('9 × 3 = 27')
    // 行高亮跟随被除数
    expect(wrapper.find('.rule-row.active').text()).toContain('3 ÷ 11')
    expect(wrapper.text()).toContain('0.27')
  })

  it('ex-c1-div11-cycle 联动被除数与保留位数', () => {
    const lab = findLabById('g6-c1-ex-div11-cycle')!
    const one = mount(ExerciseC1Lab, { props: { lab, values: { n: 3, digits: 1 } } })
    expect(one.text()).toContain('0.3')

    const five = mount(ExerciseC1Lab, { props: { lab, values: { n: 5, digits: 1 } } })
    expect(five.text()).toContain('循环节 45')
    expect(five.text()).toContain('0.5')
    expect(five.find('.rule-row.active').text()).toContain('5 ÷ 11')

    const ten = mount(ExerciseC1Lab, { props: { lab, values: { n: 10, digits: 3 } } })
    expect(ten.text()).toContain('0.9090')
    expect(ten.text()).toContain('0.909')
    expect(ten.find('.rule-row.active').text()).toContain('10 ÷ 11')

    // n=6 时 6÷11=0.5454…：展示值必须按循环节截取，不能四舍五入成 0.5455
    const six = mount(ExerciseC1Lab, { props: { lab, values: { n: 6, digits: 2 } } })
    expect(six.text()).toContain('0.5454')
    expect(six.text()).not.toContain('0.5455')

    const leadZero = mount(ExerciseC1Lab, { props: { lab, values: { n: 1, digits: 2 } } })
    expect(leadZero.text()).toContain('0.0909')
    expect(leadZero.text()).toContain('循环节 09')
  })

  it('ex-c1-pgram-area 渲染平行四边形与估算 / 计算对比', () => {
    const lab = findLabById('g6-c1-ex-pgram-area')!
    const wrapper = mount(ExerciseC1Lab, {
      props: { lab, values: { base: 3.2, height: 1.84, digits: 1 } },
    })

    expect(wrapper.find('.pgram-svg').exists()).toBe(true)
    expect(wrapper.find('.pgram-bars').exists()).toBe(true)
    expect(wrapper.findAll('.bar')).toHaveLength(2)
    expect(wrapper.find('.bar.estimate').exists()).toBe(true)
    expect(wrapper.find('.bar.exact').exists()).toBe(true)
    expect(wrapper.text()).toContain('底 3.2 分米')
    expect(wrapper.text()).toContain('高 1.84 分米')
    expect(wrapper.text()).toContain('5.888')
    expect(wrapper.text()).toContain('5.9')
    expect(wrapper.text()).toContain('6')
  })

  it('ex-c1-pgram-area 保留两位小数 / 滑块取最大值不越出 viewBox', () => {
    const lab = findLabById('g6-c1-ex-pgram-area')!
    const two = mount(ExerciseC1Lab, {
      props: { lab, values: { base: 3.2, height: 1.84, digits: 2 } },
    })
    expect(two.text()).toContain('5.89')

    // 底 5 → 220px、斜移 26px：右下角 x = 55 + 220 + 26 = 301，仍在 viewBox 360 内
    const maxW = mount(ExerciseC1Lab, {
      props: { lab, values: { base: 5, height: 3, digits: 1 } },
    })
    const points = maxW.find('.pgram-svg polygon').attributes('points')!
    expect(points).toContain('301,64')
    expect(maxW.text()).toContain('15')
  })

  it('全部练习题 Lab 用空参数挂载不抛错（覆盖 ?? 兜底分支）', () => {
    for (const lab of c1Exercises) {
      const wrapper = mount(ExerciseC1Lab, { props: { lab, values: {} } })
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})
