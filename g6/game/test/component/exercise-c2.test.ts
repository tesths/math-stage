import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC2Lab from '@/components/labs/exercises/ExerciseC2Lab.vue'
import { computeC2 } from '@/lib/labs/exercises/c2'
import { findLabById } from '@data'
import { c2Exercises } from '@data/chapters/c2-exercises'

describe('ExerciseC2Lab · 二单元练习题可视化', () => {
  it('ex-c2-overlap-club：渲染三条长条、斜线重叠区与双箭头', () => {
    const lab = findLabById('g6-c2-ex-overlap-club')!
    const wrapper = mount(ExerciseC2Lab, { props: { lab, values: { total: 48, dn: 2, sn: 3 } } })
    expect(wrapper.find('.ex-c2-overlap-svg').exists()).toBe(true)
    expect(wrapper.findAll('.overlap-bar').length).toBe(3)
    expect(wrapper.find('.overlap-bar.ref').exists()).toBe(true)
    expect(wrapper.find('.overlap-bar.dance').exists()).toBe(true)
    expect(wrapper.find('.overlap-bar.sing').exists()).toBe(true)
    expect(wrapper.find('.overlap-mark').exists()).toBe(true)
    expect(wrapper.find('.overlap-arrow').exists()).toBe(true)
    expect(wrapper.text()).toContain('全班 48 人')
    expect(wrapper.text()).toContain('跳舞 32 人')
    expect(wrapper.text()).toContain('唱歌 36 人')
    expect(wrapper.text()).toContain('重叠 20 人')
    expect(wrapper.find('.ex-c2-res').text()).toContain('32 + 36 − 48 = 20 人')
  })

  it('ex-c2-overlap-club：换一组数据（重叠等于全班）', () => {
    const lab = findLabById('g6-c2-ex-overlap-club')!
    const wrapper = mount(ExerciseC2Lab, { props: { lab, values: { total: 24, dn: 3, sn: 4 } } })
    expect(wrapper.text()).toContain('全班 24 人')
    expect(wrapper.text()).toContain('跳舞 24 人')
    expect(wrapper.text()).toContain('唱歌 24 人')
    expect(wrapper.text()).toContain('重叠 24 人')
  })

  it('ex-c2-egg-crate：渲染上下堆叠条、平半分界线与相差箭头', () => {
    const lab = findLabById('g6-c2-ex-egg-crate')!
    const wrapper = mount(ExerciseC2Lab, { props: { lab, values: { crate: 1, withEggs: 8, price: 12.8 } } })
    expect(wrapper.find('.ex-c2-egg-svg').exists()).toBe(true)
    expect(wrapper.findAll('.crate-seg').length).toBe(2)
    expect(wrapper.findAll('.egg-seg').length).toBe(2)
    expect(wrapper.find('.egg-seg.half').exists()).toBe(true)
    expect(wrapper.find('.half-divider').exists()).toBe(true)
    expect(wrapper.find('.diff-arrow').exists()).toBe(true)
    expect(wrapper.text()).toContain('连筐重 8 千克')
    expect(wrapper.text()).toContain('卖出一半后连筐重 4.5 千克')
    expect(wrapper.text()).toContain('相差 3.5 千克 = 一半鸡蛋')
    expect(wrapper.find('.ex-c2-res').text()).toContain('8 − 4.5 = 3.5 千克')
    expect(wrapper.find('.ex-c2-res').text()).toContain('7 × 12.8 =')
    expect(wrapper.text()).toContain('89.6 元')
  })

  it('ex-c2-egg-crate：换一组数据', () => {
    const lab = findLabById('g6-c2-ex-egg-crate')!
    const wrapper = mount(ExerciseC2Lab, { props: { lab, values: { crate: 2, withEggs: 12, price: 8 } } })
    expect(wrapper.text()).toContain('连筐重 12 千克')
    expect(wrapper.text()).toContain('卖出一半后连筐重 7 千克')
    expect(wrapper.text()).toContain('全部 10 千克')
    expect(wrapper.text()).toContain('80 元')
  })

  it('本单元全部练习题 lab 以空参数挂载不抛错（覆盖 ?? 兜底分支）', () => {
    expect(c2Exercises.length).toBeGreaterThan(0)
    for (const lab of c2Exercises) {
      const wrapper = mount(ExerciseC2Lab, { props: { lab, values: {} } })
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.text().trim().length).toBeGreaterThan(0)
    }
  })
})

describe('computeC2 · 二单元练习题求值', () => {
  it('ex-c2-overlap-club：三步求重叠人数', () => {
    const r = computeC2('ex-c2-overlap-club', { total: 48, dn: 2, sn: 3 })
    expect(r.value).toBe(20)
    expect(r.text).toContain('20 人')
    expect(r.steps.length).toBe(3)
    expect(r.steps[0]!.result).toContain('32 人')
    expect(r.steps[1]!.result).toContain('36 人')
    expect(r.steps[2]!.result).toContain('20 人')
    expect(r.conclusion).toContain('两样都喜欢')
  })

  it('ex-c2-overlap-club：空参数走 ?? 兜底', () => {
    expect(computeC2('ex-c2-overlap-club', {}).value).toBe(20)
  })

  it('ex-c2-egg-crate：筐重抵消求收入', () => {
    const r = computeC2('ex-c2-egg-crate', { crate: 1, withEggs: 8, price: 12.8 })
    expect(r.value).toBeCloseTo(89.6, 5)
    expect(r.text).toContain('89.6 元')
    expect(r.steps.length).toBe(3)
    expect(r.steps[0]!.result).toContain('3.5 千克')
    expect(r.steps[1]!.result).toContain('7 千克')
    expect(r.steps[2]!.result).toContain('89.6 元')
    expect(r.conclusion).toContain('抵消')
  })

  it('ex-c2-egg-crate：空参数走 ?? 兜底', () => {
    expect(computeC2('ex-c2-egg-crate', {}).value).toBeCloseTo(89.6, 5)
  })
})
