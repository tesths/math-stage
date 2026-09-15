import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC5Lab from '@/components/labs/exercises/ExerciseC5Lab.vue'
import { computeC5 } from '@/lib/labs/exercises/c5'
import { findLabById } from '@data'
import { c5Exercises } from '@data/chapters/c5-exercises'

describe('ExerciseC5Lab（五 圆 · 练习题）', () => {
  it('ex-c5-wheel-roll：默认参数渲染车轮 / 摆线 / 分段路程', () => {
    const lab = findLabById('g6-c5-ex-wheel-roll')!
    const wrapper = mount(ExerciseC5Lab, { props: { lab, values: { d: 70, n: 100, t: 10 } } })

    expect(wrapper.find('.ex-c5-wrap').exists()).toBe(true)
    expect(wrapper.find('.wheel-svg').exists()).toBe(true)
    expect(wrapper.find('.wheel-cycloid').exists()).toBe(true)
    expect(wrapper.find('.wheel-road').exists()).toBe(true)
    // 12 根辐条，只有正下方 1 根橙色标记
    expect(wrapper.findAll('.wheel-spoke')).toHaveLength(12)
    expect(wrapper.findAll('.wheel-spoke-mark')).toHaveLength(1)
    expect(wrapper.find('.wheel-mark').exists()).toBe(true)
    // 10 分钟 → 路程线段等分 10 段
    expect(wrapper.findAll('.road-seg')).toHaveLength(10)
    expect(wrapper.findAll('.road-seg-lbl')).toHaveLength(10)
    expect(wrapper.find('.wheel-badge').text()).toContain('共转 100 × 10 = 1000 圈')
    expect(wrapper.text()).toContain('219.8')
    expect(wrapper.text()).toContain('2.198')
    expect(wrapper.text()).toContain('每段 = 每分钟 219.8 米')
    expect(wrapper.text()).toContain('≈ 2198 米（约 2.2 千米）')
  })

  it('ex-c5-wheel-roll：改直径 / 圈数 / 时间后周长、每分钟路程与分段随之变化', () => {
    const lab = findLabById('g6-c5-ex-wheel-roll')!
    const small = mount(ExerciseC5Lab, { props: { lab, values: { d: 40, n: 50, t: 5 } } })

    // 3.14×40 = 125.6 厘米 = 1.256 米 → 每分钟 62.8 米 → 5 分钟 314 米
    expect(small.text()).toContain('125.6')
    expect(small.text()).toContain('1.256')
    expect(small.text()).toContain('62.8')
    expect(small.text()).toContain('314')
    expect(small.findAll('.road-seg')).toHaveLength(5)
    // 摆线始终从车轮着地点（100, 150）出发
    expect(small.find('.wheel-cycloid').attributes('d')).toContain('M 100.0 150.0')
  })

  it('ex-c5-wheel-roll：滑块取最大值时车轮与摆线不越出 viewBox', () => {
    const lab = findLabById('g6-c5-ex-wheel-roll')!
    const max = mount(ExerciseC5Lab, { props: { lab, values: { d: 80, n: 150, t: 30 } } })

    // 半径封顶 60px：车心 y = 90，最低点 y = 150，摆线最高点 y = 30（viewBox 高 260）
    expect(max.find('.wheel-rim').attributes('r')).toBe('60')
    expect(max.find('.wheel-mark').attributes('cy')).toBe('150')
    const ys = max
      .find('.wheel-cycloid')
      .attributes('d')!
      .split(/[ML] /)
      .slice(1)
      .map((pt) => Number(pt.trim().split(' ')[1]))
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...ys)).toBeLessThanOrEqual(260)
    expect(max.findAll('.road-seg')).toHaveLength(30)
    // t=30 时每段仅 10px，逐段标数字会重叠 → 不再渲染段标签
    expect(max.findAll('.road-seg-lbl')).toHaveLength(0)
  })

  it('ex-c5-circle-packing：默认参数整齐排列 28 个圆并给出面积对照', () => {
    const lab = findLabById('g6-c5-ex-circle-packing')!
    const wrapper = mount(ExerciseC5Lab, { props: { lab, values: { L: 15, W: 8, d: 2 } } })

    expect(wrapper.find('.pack-svg').exists()).toBe(true)
    expect(wrapper.findAll('.pack-disc')).toHaveLength(28)
    expect(wrapper.findAll('.pack-disc.primary').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.pack-disc.light').length).toBeGreaterThan(0)
    expect(wrapper.find('.pack-badge').text()).toContain('每行 7 个 × 4 行 = 28 个')
    // 长余 1 厘米 → 右侧余料带；宽正好整除 → 无底部余料带
    expect(wrapper.find('.pack-leftover-v').exists()).toBe(true)
    expect(wrapper.find('.pack-leftover-h').exists()).toBe(false)
    expect(wrapper.text()).toContain('不够再剪一个')
    expect(wrapper.find('.pack-compare').text()).toContain('按面积 ≈ 38 个')
    expect(wrapper.find('.pack-compare').text()).toContain('✗')
    expect(wrapper.text()).toContain('最多剪 28 个')
  })

  it('ex-c5-circle-packing：两个方向都有余料时两条余料带都出现', () => {
    const lab = findLabById('g6-c5-ex-circle-packing')!
    const wrapper = mount(ExerciseC5Lab, { props: { lab, values: { L: 15, W: 7, d: 2 } } })

    expect(wrapper.findAll('.pack-disc')).toHaveLength(21) // 7 列 × 3 行
    expect(wrapper.find('.pack-badge').text()).toContain('每行 7 个 × 3 行 = 21 个')
    expect(wrapper.find('.pack-leftover-v').exists()).toBe(true)
    expect(wrapper.find('.pack-leftover-h').exists()).toBe(true)
    expect(wrapper.findAll('.pack-leftover-txt')).toHaveLength(2)
  })

  it('ex-c5-circle-packing：长宽都能整除时没有余料带', () => {
    const lab = findLabById('g6-c5-ex-circle-packing')!
    const wrapper = mount(ExerciseC5Lab, { props: { lab, values: { L: 16, W: 8, d: 2 } } })

    expect(wrapper.findAll('.pack-disc')).toHaveLength(32) // 8 列 × 4 行
    expect(wrapper.find('.pack-leftover-v').exists()).toBe(false)
    expect(wrapper.find('.pack-leftover-h').exists()).toBe(false)
    expect(wrapper.findAll('.pack-leftover-txt')).toHaveLength(0)
  })

  it('ex-c5-circle-packing：面积法凑巧相同时不误判为“偏大”', () => {
    const lab = findLabById('g6-c5-ex-circle-packing')!
    const wrapper = mount(ExerciseC5Lab, { props: { lab, values: { L: 12, W: 4, d: 4 } } })

    expect(wrapper.findAll('.pack-disc')).toHaveLength(3) // 3 列 × 1 行
    expect(wrapper.find('.pack-compare').text()).toContain('按面积 ≈ 3 个')
    expect(wrapper.find('.pack-compare').text()).not.toContain('✗')
    expect(wrapper.find('.pack-compare').text()).toContain('两个方向正好排满')
  })

  it('c5 全部练习题 lab 用空参数挂载不抛错且文本非空', () => {
    for (const lab of c5Exercises) {
      const wrapper = mount(ExerciseC5Lab, { props: { lab, values: {} } })
      expect(wrapper.find('.ex-c5-wrap').exists()).toBe(true)
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})

describe('computeC5（五 圆 · 练习题求值）', () => {
  it('ex-c5-wheel-roll：路程 = 周长 × 圈数 × 时间', () => {
    const r = computeC5('ex-c5-wheel-roll', { d: 70, n: 100, t: 10 })
    expect(r.value).toBe(2198)
    expect(r.text).toContain('2198')
    expect(r.steps.length).toBeGreaterThanOrEqual(2)
    expect(r.steps[0]!.result).toContain('219.8')
    expect(r.conclusion).toContain('周长')
  })

  it('ex-c5-circle-packing：两个方向都去尾相除', () => {
    const r = computeC5('ex-c5-circle-packing', { L: 15, W: 8, d: 2 })
    expect(r.value).toBe(28)
    expect(r.steps[0]!.result).toContain('每行 7 个')
    expect(r.steps[1]!.result).toContain('共 4 行')
    expect(r.text).toContain('28 个')
    expect(r.conclusion).toContain('去尾法')
  })

  it('ex-c5-circle-packing：有余料且面积法偏大时给出“比实际多”', () => {
    const r = computeC5('ex-c5-circle-packing', { L: 15, W: 7, d: 2 })
    expect(r.value).toBe(21)
    expect(r.conclusion).toContain('比实际多')
  })

  it('ex-c5-circle-packing：无余料 / 面积法不偏大时措辞不同', () => {
    const same = computeC5('ex-c5-circle-packing', { L: 12, W: 4, d: 4 })
    expect(same.conclusion).toContain('凑巧')
    expect(same.conclusion).not.toContain('是错的')

    const full = computeC5('ex-c5-circle-packing', { L: 16, W: 8, d: 2 })
    expect(full.conclusion).toContain('正好排满')
  })

  it('computeC5：空参数使用默认值（覆盖 ?? 兜底）', () => {
    expect(computeC5('ex-c5-wheel-roll', {}).value).toBe(2198)
    expect(computeC5('ex-c5-circle-packing', {}).value).toBe(28)
  })
})
