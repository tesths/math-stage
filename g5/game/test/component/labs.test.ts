import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AreaLab from '@/components/labs/AreaLab.vue'
import FormulaLab from '@/components/labs/FormulaLab.vue'
import { labsOfChapter, findLabById } from '@data'

describe('Lab 组件渲染', () => {
  it('AreaLab：平行四边形默认参数渲染网格与公式', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, shape: 0 } },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.area-wrap').exists()).toBe(true)
    expect(wrapper.text()).toContain('底')
    // 改变参数后面积变化
    await wrapper.setProps({ values: { a: 8, h: 4, shape: 0 } })
    expect(wrapper.find('.area-value strong').text()).toContain('32')
  })

  it('AreaLab：三角形剪拼按钮存在', () => {
    const lab = findLabById('g5-c3-area-triangle')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 8, h: 5, shape: 1 } },
    })
    expect(wrapper.text()).toContain('拼一拼')
  })

  it('FormulaLab：青蛙歌数量', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 3 } } })
    expect(wrapper.text()).toContain('张嘴')
    expect(wrapper.text()).toContain('6')
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })
})
