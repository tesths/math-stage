import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC6Lab from '@/components/labs/exercises/ExerciseC6Lab.vue'
import { computeC6 } from '@/lib/labs/exercises/c6'
import { findLabById } from '@data'
import { c6Exercises } from '@data/chapters/c6-exercises'

describe('ExerciseC6Lab（六 放大与缩小 · 练习题）', () => {
  it('ex-c6-scale-area：默认参数渲染三角形放大 / 梯形缩小与面积对比条', () => {
    const lab = findLabById('g6-c6-ex-scale-area')!
    // trapTop / trapBottom / trapHeight 来自 lab.fixed（页面会并入 values），测试显式传入
    const wrapper = mount(ExerciseC6Lab, {
      props: { lab, values: { a: 2, n: 3, d: 2, trapTop: 4, trapBottom: 8, trapHeight: 6 } },
    })

    expect(wrapper.find('.ex-c6-wrap').exists()).toBe(true)
    expect(wrapper.find('.sa-svg-tri').exists()).toBe(true)
    expect(wrapper.find('.sa-tri-orig').exists()).toBe(true)
    expect(wrapper.find('.sa-tri-scaled').exists()).toBe(true)
    // 放大图上叠原图虚线轮廓
    expect(wrapper.find('.sa-tri-ghost').exists()).toBe(true)
    expect(wrapper.find('.sa-svg-trap').exists()).toBe(true)
    expect(wrapper.find('.sa-trap-orig').exists()).toBe(true)
    expect(wrapper.find('.sa-trap-scaled').exists()).toBe(true)
    // 面积条宽度 = 面积 × 6px：原图 a²/2 = 2 格² → 12px；放大 a²n²/2 = 18 格² → 108px
    expect(wrapper.find('.sa-bar-orig').attributes('width')).toBe('12')
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('108')
    expect(wrapper.find('.sa-badge').text()).toContain('面积是原来的 9 倍')
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('36')
    expect(wrapper.text()).toContain('1/4')
    expect(wrapper.text()).toContain('9 倍')
  })

  it('ex-c6-scale-area：改变直角边与放大 / 缩小比后面积与倍数随之变化', () => {
    const lab = findLabById('g6-c6-ex-scale-area')!
    const wrapper = mount(ExerciseC6Lab, { props: { lab, values: { a: 3, n: 2, d: 4 } } })

    // a=3：原面积 4.5 格²，放大 2:1 后 18 格²（4 倍）；d=4 → 1/16
    expect(wrapper.text()).toContain('4.5')
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('4 倍')
    expect(wrapper.text()).toContain('1/16')
    // 直角梯形固定上底 4 / 下底 8 / 高 6 → 36 格²
    expect(wrapper.text()).toContain('36')
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('108')
  })

  it('ex-c6-scale-area：滑块取最大值时图形与面积条不越出 viewBox', () => {
    const lab = findLabById('g6-c6-ex-scale-area')!
    const max = mount(ExerciseC6Lab, { props: { lab, values: { a: 3, n: 4, d: 2 } } })

    // 放大后直角边 = 3×4×10px = 120px，最右 x = 190 + 120 = 310 < 840
    expect(max.find('.sa-tri-scaled').attributes('d')).toContain('310')
    // 最大放大面积 72 格² × 6px = 432，封顶 430 不越出 viewBox
    expect(Number(max.find('.sa-bar-scaled').attributes('width'))).toBeLessThanOrEqual(430)
  })

  it('ex-c6-two-maps：默认参数渲染两张图纸卡片与改画流程', () => {
    const lab = findLabById('g6-c6-ex-two-maps')!
    // cmA 来自 lab.fixed（页面会并入 values），测试显式传入
    const wrapper = mount(ExerciseC6Lab, { props: { lab, values: { denA: 5000, denB: 2000, cm: 2, cmA: 3 } } })

    expect(wrapper.find('.tm-stage').exists()).toBe(true)
    expect(wrapper.findAll('.tm-card')).toHaveLength(2)
    expect(wrapper.find('.tm-card-a').text()).toContain('1:5000')
    expect(wrapper.find('.tm-card-b').text()).toContain('1:2000')
    // 3 厘米分别表示实际 150 米 / 60 米
    expect(wrapper.find('.tm-card-a').text()).toContain('150')
    expect(wrapper.find('.tm-card-b').text()).toContain('60')
    expect(wrapper.find('.tm-ruler-a').exists()).toBe(true)
    expect(wrapper.find('.tm-ruler-b').exists()).toBe(true)
    expect(wrapper.find('.tm-actual-line').exists()).toBe(true)
    expect(wrapper.find('.tm-lead').exists()).toBe(true)
    expect(wrapper.find('.tm-seg-a-cmp').exists()).toBe(true)
    expect(wrapper.find('.tm-seg-b-cmp').exists()).toBe(true)
    // 改画：2 × 2000 ÷ 5000 = 0.8 厘米 → 0.8 × 50px = 40px，起点 x=40
    expect(wrapper.find('.tm-seg-a-cmp').attributes('x2')).toBe('80')
    expect(wrapper.find('.tm-seg-b-cmp').attributes('x2')).toBe('140')
    expect(wrapper.find('.tm-flow').text()).toContain('A 图 0.8 厘米')
    expect(wrapper.text()).toContain('0.8')
    expect(wrapper.text()).toContain('40 米')
  })

  it('ex-c6-two-maps：改变分母与线段长后实际距离与图上长随之变化', () => {
    const lab = findLabById('g6-c6-ex-two-maps')!
    const wrapper = mount(ExerciseC6Lab, { props: { lab, values: { denA: 1000, denB: 8000, cm: 4 } } })

    // A：3×1000 = 3000 厘米 = 30 米；B：3×8000 = 24000 厘米 = 240 米
    expect(wrapper.find('.tm-card-a').text()).toContain('30')
    expect(wrapper.find('.tm-card-b').text()).toContain('240')
    // 改画：4 × 8000 ÷ 1000 = 32 厘米
    expect(wrapper.text()).toContain('32')
    // 两条对比条共用同一比例尺：max(32,4)×50=1600 → K=0.175
    // A：32×50×0.175 = 280 → x2 = 320；B：4×50×0.175 = 35 → x2 = 75
    expect(wrapper.find('.tm-seg-a-cmp').attributes('x2')).toBe('320')
    expect(wrapper.find('.tm-seg-b-cmp').attributes('x2')).toBe('75')
  })

  it('c6 全部练习题 lab 用空参数挂载不抛错且文本非空', () => {
    for (const lab of c6Exercises) {
      const wrapper = mount(ExerciseC6Lab, { props: { lab, values: {} } })
      expect(wrapper.find('.ex-c6-wrap').exists()).toBe(true)
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})

describe('ExerciseC6Lab · 过程态：一格一格放大，看边长 ×k 时面积 ×k²', () => {
  it('ex-c6-scale-area 过程态：默认最完整态，退回 1× 后逐级放大回原位', async () => {
    const lab = findLabById('g6-c6-ex-scale-area')!
    const wrapper = mount(ExerciseC6Lab, {
      props: { lab, values: { a: 2, n: 3, d: 2, trapTop: 4, trapBottom: 8, trapHeight: 6 } },
    })

    // 初始态：最完整（边长 ×3，面积 18 格² → 108px），阶梯柱 3 根且第 3 根高亮
    expect(wrapper.findAll('.sa-step-col')).toHaveLength(3)
    expect(wrapper.find('.sa-step-col.is-current').exists()).toBe(true)
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('108')
    expect(wrapper.text()).toContain('最完整态')
    expect(wrapper.text()).toContain('面积格子数 ×9（边长 ×3）')

    // 回到 1×：放大图缩回原图大小（与原图同尺寸、只是平移 160px）
    const back = wrapper.findAll('button').find((b) => b.text().includes('回到 1×'))!
    expect(back).toBeTruthy()
    await back.trigger('click')
    expect(wrapper.find('.sa-tri-scaled.is-origin-step').exists()).toBe(true)
    expect(wrapper.find('.sa-tri-scaled').attributes('d')).toBe('M 190 168 L 210 168 L 190 148 Z')
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('12')
    expect(wrapper.text()).toContain('第 1 级')
    expect(wrapper.text()).toContain('1 × 1 = 1 倍')

    // 逐级放大：边长 ×2 → 面积 8 格²（4 倍）；再放大一级 → 18 格²（9 倍）
    const grow = wrapper.findAll('button').find((b) => b.text().includes('再放大 1 倍'))!
    await grow.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('第 2 级')
    expect(wrapper.find('.sa-tri-scaled').attributes('d')).toBe('M 190 168 L 230 168 L 190 128 Z')
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('48')

    await grow.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.sa-tri-scaled.is-origin-step').exists()).toBe(false)
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('108')
    expect(wrapper.text()).toContain('最完整态')
    // 已到位：再点也不再放大（宽度不变）
    await grow.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.sa-bar-scaled').attributes('width')).toBe('108')
  })
})

describe('ExerciseC6Lab · 过程态：先算实际距离，再揭示换画到 A 图', () => {
  it('ex-c6-two-maps 过程态：默认两步同屏，退到第 1 步再揭示第 2 步', async () => {
    const lab = findLabById('g6-c6-ex-two-maps')!
    const wrapper = mount(ExerciseC6Lab, { props: { lab, values: { denA: 5000, denB: 2000, cm: 2, cmA: 3 } } })

    // 初始态：最完整的两步同屏（A 图那一段 0.8 厘米 → 40px，x2 = 80）
    expect(wrapper.find('.tm-stage.tm-step-one').exists()).toBe(false)
    expect(wrapper.find('.tm-a-seg').exists()).toBe(true)
    expect(wrapper.find('.tm-seg-a-cmp').attributes('x2')).toBe('80')
    expect(wrapper.find('.tm-flow').text()).toContain('A 图 0.8 厘米')
    expect(wrapper.text()).toContain('两步都亮着')

    // 第 1 步：只保留「图上 × 分母 ÷ 100」，A 图那一段与换画结论先藏起来
    const step1 = wrapper.findAll('button').find((b) => b.text().includes('先只看第 1 步'))!
    expect(step1).toBeTruthy()
    await step1.trigger('click')
    expect(wrapper.find('.tm-stage.tm-step-one').exists()).toBe(true)
    expect(wrapper.find('.tm-a-seg').exists()).toBe(false)
    expect(wrapper.find('.tm-seg-a-cmp').exists()).toBe(false)
    expect(wrapper.find('.tm-seg-hint').exists()).toBe(true)
    expect(wrapper.find('.tm-flow').text()).toContain('× 2000')
    expect(wrapper.find('.tm-flow').text()).toContain('÷ 100')
    expect(wrapper.find('.tm-flow').text()).toContain('40 米')
    expect(wrapper.find('.tm-flow').text()).not.toContain('A 图 0.8 厘米')
    expect(wrapper.text()).not.toContain('0.8')
    expect(wrapper.text()).toContain('第 1 步')

    // 第 2 步：换画换算重新出现，回到初始的最完整态
    const step2 = wrapper.findAll('button').find((b) => b.text().includes('揭示第 2 步'))!
    await step2.trigger('click')
    expect(wrapper.find('.tm-stage.tm-step-one').exists()).toBe(false)
    expect(wrapper.find('.tm-seg-a-cmp').attributes('x2')).toBe('80')
    expect(wrapper.find('.tm-flow').text()).toContain('÷ 5000')
    expect(wrapper.find('.tm-flow').text()).toContain('A 图 0.8 厘米')
    expect(wrapper.text()).toContain('0.8')
  })
})

describe('computeC6（六 放大与缩小 · 练习题求值）', () => {
  it('ex-c6-scale-area：放大 n 倍面积是 n² 倍、缩小 d 倍面积是 1/d²', () => {
    const r = computeC6('ex-c6-scale-area', { a: 2, n: 3, d: 2, trapTop: 4, trapBottom: 8, trapHeight: 6 })
    expect(r.value).toBe(9)
    expect(r.text).toContain('9 倍')
    expect(r.text).toContain('1/4')
    expect(r.steps.length).toBeGreaterThanOrEqual(2)
    expect(r.steps[1]!.result).toContain('18')
    expect(r.steps[3]!.result).toContain('36')
    expect(r.conclusion).toContain('形状')
  })

  it('ex-c6-two-maps：实际距离 = 图上 × 分母，改画 = ×原分母 ÷新分母', () => {
    const r = computeC6('ex-c6-two-maps', { denA: 5000, denB: 2000, cm: 2, cmA: 3 })
    expect(r.value).toBeCloseTo(0.8, 6)
    expect(r.text).toContain('150')
    expect(r.text).toContain('60')
    expect(r.text).toContain('0.8')
    expect(r.steps[3]!.result).toContain('0.8')
    expect(r.conclusion).toContain('分母越大')
  })

  it('ex-c6-two-maps：方向性措辞随分母大小关系变化（不写死“更大”）', () => {
    expect(
      computeC6('ex-c6-two-maps', { denA: 5000, denB: 2000, cm: 2, cmA: 3 }).conclusion,
    ).toContain('分母更大的')
    expect(
      computeC6('ex-c6-two-maps', { denA: 1000, denB: 8000, cm: 4, cmA: 3 }).conclusion,
    ).toContain('分母更小的')
    expect(
      computeC6('ex-c6-two-maps', { denA: 3000, denB: 3000, cm: 2, cmA: 3 }).conclusion,
    ).toContain('分母相同的')
  })

  it('computeC6：空参数使用默认值（覆盖 ?? 兜底）', () => {
    expect(computeC6('ex-c6-scale-area', {}).value).toBe(9)
    expect(computeC6('ex-c6-two-maps', {}).value).toBeCloseTo(0.8, 6)
  })
})
