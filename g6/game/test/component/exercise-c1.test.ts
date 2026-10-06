import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC1Lab from '@/components/labs/exercises/ExerciseC1Lab.vue'
import { findLabById } from '@data'
import { c1Exercises } from '@data/chapters/c1-exercises'

describe('ExerciseC1Lab · 过程态：一位一位算出循环节', () => {
  it('重来后只显示整数位，再算一位就多一个数字，算到重复就能看出循环节', async () => {
    const lab = findLabById('g6-c1-ex-div11-cycle')!
    const wrapper = mount(ExerciseC1Lab, { props: { lab, values: { n: 3, digits: 2 } } })
    // 默认完整显示（0 . 2 7 2 7 … 共 7 个字符）
    expect(wrapper.findAll('.ca-digit')).toHaveLength(7)
    const reset = wrapper.findAll('button').find((b) => b.text().includes('重来'))!
    await reset.trigger('click')
    expect(wrapper.findAll('.ca-digit')).toHaveLength(2)
    expect(wrapper.text()).toContain('才算出 0 位小数')
    const step = wrapper.findAll('button').find((b) => b.text().includes('再多算一位'))!
    await step.trigger('click')
    await step.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.ca-digit')).toHaveLength(4)
    expect(wrapper.text()).toContain('才算出 2 位小数')
    // 一直算到 "27" 第二次出现 → 提示循环节
    await step.trigger('click')
    await step.trigger('click')
    await step.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.ca-digit')).toHaveLength(7)
    expect(wrapper.text()).toContain('循环节就是 27')
  })
})

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

  it('ex-c1-pgram-area 过程态：先只看估算，再揭示精确计算', async () => {
    const lab = findLabById('g6-c1-ex-pgram-area')!
    const wrapper = mount(ExerciseC1Lab, {
      props: { lab, values: { base: 3.2, height: 1.84, digits: 1 } },
    })
    // 初始态：估算与精确同屏，卡片未弱化，按钮提示可以切换
    const toggle = wrapper.findAll('button').find((b) => b.text().includes('先只看估算'))!
    expect(toggle).toBeTruthy()
    expect(wrapper.find('.pgram-card.hide-exact').exists()).toBe(false)
    expect(wrapper.find('.bar.exact').exists()).toBe(true)
    expect(wrapper.text()).toContain('先估一估')
    expect(wrapper.text()).toContain('3 × 2 = 6')

    // 切到"只看估算"：卡片加 hide-exact，精确值直条被弱化，文案随之变化
    await toggle.trigger('click')
    expect(wrapper.find('.pgram-card.hide-exact').exists()).toBe(true)
    expect(wrapper.text()).toContain('现在只看估算')
    expect(wrapper.text()).not.toContain('先估一估')
    const back = wrapper.findAll('button').find((b) => b.text().includes('再看精确计算'))!
    expect(back).toBeTruthy()
    // 精确值直条仍在 DOM 里，只是视觉弱化（学生仍能对照读数）
    expect(wrapper.find('.bar.exact').exists()).toBe(true)

    // 再点一次回到精确态
    await back.trigger('click')
    expect(wrapper.find('.pgram-card.hide-exact').exists()).toBe(false)
    expect(wrapper.text()).toContain('先估一估')
    expect(wrapper.findAll('button').some((b) => b.text().includes('先只看估算'))).toBe(true)
  })

  it('全部练习题 Lab 用空参数挂载不抛错（覆盖 ?? 兜底分支）', () => {
    for (const lab of c1Exercises) {
      const wrapper = mount(ExerciseC1Lab, { props: { lab, values: {} } })
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})
