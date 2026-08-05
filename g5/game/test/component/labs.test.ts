import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AreaLab from '@/components/labs/AreaLab.vue'
import FormulaLab from '@/components/labs/FormulaLab.vue'
import { labsOfChapter, findLabById } from '@data'

// 动画立即完成，便于断言动画结束态
vi.mock('animejs', () => ({
  animate: vi.fn((_target: unknown, cfg: { complete?: () => void }) => {
    cfg.complete?.()
  }),
}))

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

  it('AreaLab：三角形剪拼按钮点击后显示拼合结果，可重置', async () => {
    const lab = findLabById('g5-c3-area-triangle')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 8, h: 5, shape: 1 } },
    })
    expect(wrapper.text()).toContain('拼一拼')
    const cutBtn = wrapper.findAll('button').find((b) => b.text().includes('拼一拼'))
    expect(cutBtn).toBeDefined()
    await cutBtn!.trigger('click')
    // 复位按钮出现，点击后恢复
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    expect(resetBtn).toBeDefined()
    await resetBtn!.trigger('click')
  })

  it('AreaLab：平行四边形剪拼（runCut 滑移）后显示完成态（复位按钮）', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, shape: 0 } },
    })
    const cutBtn = wrapper.findAll('button').find((b) => b.text().includes('剪一剪'))
    expect(cutBtn).toBeDefined()
    await cutBtn!.trigger('click')
    // 平行四边形完成态：出现复位按钮（placed=true）
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    expect(resetBtn).toBeDefined()
  })

  it('AreaLab：梯形渲染（shape 2）', () => {
    const lab = findLabById('g5-c3-area-trapezoid')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 36, b: 54, h: 40, shape: 2 } },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('梯')
  })

  it('FormulaLab：青蛙歌数量（≤20 只全部渲染）', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 3 } } })
    expect(wrapper.text()).toContain('张嘴')
    expect(wrapper.text()).toContain('6')
  })

  it('FormulaLab：青蛙歌超过 20 只显示省略与总数', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 25 } } })
    expect(wrapper.text()).toContain('…共 25 只')
    // 只渲染 20 只（frogs 截断）
    expect(wrapper.findAll('.frog-item').length).toBeLessThanOrEqual(20)
  })

  it('FormulaLab：正方形周长面积（square）', () => {
    const lab = findLabById('g5-c7-square-formula')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { a: 5 } } })
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('25')
  })

  it('FormulaLab：速度路程（speed）', () => {
    const lab = findLabById('g5-c7-speed-car')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { v: 15, t: 3 } } })
    expect(wrapper.text()).toContain('45')
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })
})
