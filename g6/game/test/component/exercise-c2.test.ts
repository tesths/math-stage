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

  it('ex-c2-overlap-club 过程态：先看两条长条，再揭示重叠部分', async () => {
    const lab = findLabById('g6-c2-ex-overlap-club')!
    const wrapper = mount(ExerciseC2Lab, { props: { lab, values: { total: 48, dn: 2, sn: 3 } } })
    // 初始态：重叠区与重叠结论可见（未弱化），按钮提示可以切到“先看两条长条”
    const toggle = wrapper.findAll('button').find((b) => b.text().includes('先看两条长条'))!
    expect(toggle).toBeTruthy()
    expect(wrapper.find('.ex-c2-overlap-svg.hide-overlap').exists()).toBe(false)
    expect(wrapper.find('.ex-c2-res.hide-overlap').exists()).toBe(false)
    expect(wrapper.find('.overlap-mark').exists()).toBe(true)
    expect(wrapper.text()).toContain('两条长条都摆好了')

    // 切到“先看两条长条”：重叠区与重叠结论被弱化，说明文案随之变化
    await toggle.trigger('click')
    expect(wrapper.find('.ex-c2-overlap-svg.hide-overlap').exists()).toBe(true)
    expect(wrapper.find('.ex-c2-res.hide-overlap').exists()).toBe(true)
    expect(wrapper.text()).toContain('先看两条长条：跳舞 32 人')
    expect(wrapper.text()).not.toContain('两条长条都摆好了')
    // 重叠区仍在 DOM 里，只是视觉弱化（学生仍能对照读数）
    expect(wrapper.find('.overlap-mark').exists()).toBe(true)
    expect(wrapper.find('.overlap-arrow').exists()).toBe(true)
    expect(wrapper.find('.ex-c2-res').text()).toContain('32 + 36 − 48 = 20 人')
    const back = wrapper.findAll('button').find((b) => b.text().includes('揭示重叠部分'))!
    expect(back).toBeTruthy()

    // 再点一次回到初始态
    await back.trigger('click')
    expect(wrapper.find('.ex-c2-overlap-svg.hide-overlap').exists()).toBe(false)
    expect(wrapper.find('.ex-c2-res.hide-overlap').exists()).toBe(false)
    expect(wrapper.text()).toContain('两条长条都摆好了')
    expect(wrapper.findAll('button').some((b) => b.text().includes('先看两条长条'))).toBe(true)
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

  it('ex-c2-egg-crate 过程态：两次称重 → 相减抵消筐重得一半 → ×2 得全部并求总价', async () => {
    const lab = findLabById('g6-c2-ex-egg-crate')!
    const wrapper = mount(ExerciseC2Lab, { props: { lab, values: { crate: 1, withEggs: 8, price: 12.8 } } })

    // 初始态：取最完整的一步（egg-step-2），分界线/相差箭头/总价结论都在，按钮可重看
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toContain('重看')
    expect(wrapper.find('.ex-c2-egg-svg.egg-step-2').exists()).toBe(true)
    expect(wrapper.find('.half-divider').exists()).toBe(true)
    expect(wrapper.find('.diff-arrow').exists()).toBe(true)
    expect(wrapper.find('.ex-c2-res').text()).toContain('7 × 12.8 =')
    // 第 2 步才高亮鸡蛋段与总价，初始（最完整）态下按钮不会把学生卡在第 1 步
    expect(wrapper.findAll('.crate-seg.cancel-focus').length).toBe(0)
    expect(wrapper.findAll('.egg-seg.all-focus').length).toBe(2)

    // 第 0 步：先看两次称重——分界线/相差箭头/结论先收起，两个称重标签高亮
    await btn.trigger('click')
    expect(wrapper.find('.ex-c2-egg-svg.egg-step-0').exists()).toBe(true)
    expect(wrapper.find('.half-divider').exists()).toBe(false)
    expect(wrapper.find('.diff-arrow').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('相差 3.5 千克 = 一半鸡蛋')
    expect(wrapper.find('.ex-c2-res').exists()).toBe(false)
    expect(wrapper.findAll('.crate-seg').length).toBe(2)
    expect(wrapper.findAll('.egg-seg').length).toBe(2)
    expect(wrapper.findAll('.ex-lbl.weigh-focus').length).toBe(2)
    expect(wrapper.text()).toContain('先看两次称重：连筐重 8 千克')
    expect(wrapper.find('.ex-c2-note').text()).toContain('先只比较两次称重的读数')
    expect(wrapper.find('button').text()).toContain('相减抵消筐重')

    // 第 1 步：揭示“两次相减，筐重正好抵消 = 一半鸡蛋”——筐段高亮，但总价还没揭示
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.ex-c2-egg-svg.egg-step-1').exists()).toBe(true)
    expect(wrapper.find('.half-divider').exists()).toBe(true)
    expect(wrapper.find('.diff-arrow').exists()).toBe(true)
    expect(wrapper.text()).toContain('相差 3.5 千克 = 一半鸡蛋')
    expect(wrapper.findAll('.crate-seg.cancel-focus').length).toBe(2)
    expect(wrapper.findAll('.egg-seg.all-focus').length).toBe(0)
    expect(wrapper.find('.ex-c2-res').text()).toContain('8 − 4.5 = 3.5 千克')
    expect(wrapper.find('.ex-c2-res').text()).not.toContain('7 × 12.8 =')
    expect(wrapper.text()).toContain('筐重正好抵消')
    expect(wrapper.find('button').text()).toContain('×2 得全部')

    // 第 2 步：×2 得全部、×单价得总价，回到初始（最完整）态
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.ex-c2-egg-svg.egg-step-2').exists()).toBe(true)
    expect(wrapper.findAll('.egg-seg.all-focus').length).toBe(2)
    expect(wrapper.findAll('.crate-seg.cancel-focus').length).toBe(0)
    expect(wrapper.find('.ex-c2-res').text()).toContain('全部 7 千克')
    expect(wrapper.find('.ex-c2-res').text()).toContain('7 × 12.8 =')
    expect(wrapper.text()).toContain('89.6 元')
    expect(wrapper.find('button').text()).toContain('重看')
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
