import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC7Lab from '@/components/labs/exercises/ExerciseC7Lab.vue'
import { computeC7 } from '@/lib/labs/exercises/c7'
import { findLabById } from '@data'
import { c7Exercises } from '@data/chapters/c7-exercises'

describe('ExerciseC7Lab（七 确定位置 · 练习题）', () => {
  it('ex-c7-route-path：默认参数画出分色路线与完整数对序列', () => {
    const lab = findLabById('g6-c7-ex-route-path')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { x0: 6, k: 3, m: 2 } } })

    expect(wrapper.find('.ex-c7-wrap').exists()).toBe(true)
    expect(wrapper.find('.route-svg').exists()).toBe(true)
    expect(wrapper.findAll('.route-line')).toHaveLength(2)
    expect(wrapper.find('.route-h').exists()).toBe(true)
    expect(wrapper.find('.route-v').exists()).toBe(true)
    // 水平段 4 个格点 + 竖直段 2 个格点
    expect(wrapper.findAll('.route-pt')).toHaveLength(6)
    expect(wrapper.findAll('.route-pt-lbl')).toHaveLength(6)
    expect(wrapper.findAll('.route-seq-item')).toHaveLength(6)
    expect(wrapper.find('.route-walker').exists()).toBe(true)

    expect(wrapper.text()).toContain('（6，2）')
    expect(wrapper.text()).toContain('（9，4）')
    expect(wrapper.text()).toContain('列 +1')
    expect(wrapper.text()).toContain('行 +1')
    expect(wrapper.find('.route-sum').text()).toContain('一共走 5 格')

    // 18 列 / 8 行刻度（对齐课本 109 页页图）
    expect(wrapper.findAll('.route-tick')).toHaveLength(26)
  })

  it('ex-c7-route-path：改变起点列与步数后格点、线段长度随之变化', () => {
    const lab = findLabById('g6-c7-ex-route-path')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { x0: 3, k: 1, m: 4 } } })

    expect(wrapper.findAll('.route-pt')).toHaveLength(6) // (3,2)(4,2) + (4,3)…(4,6)
    expect(wrapper.find('.route-h').attributes('style')).toContain('44px')
    expect(wrapper.find('.route-v').attributes('style')).toContain('176px')
    expect(wrapper.text()).toContain('（4，6）')
    expect(wrapper.find('.route-sum').text()).toContain('一共走 5 格')
  })

  it('ex-c7-route-path：滑块取最大值时参数封顶且格点不越出 viewBox', () => {
    const lab = findLabById('g6-c7-ex-route-path')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { x0: 12, k: 9, m: 9 } } })

    // x₀ 封顶 8、k 封顶 4 ⇒ 终点列 12；m 封顶 4 ⇒ 终点行 6
    expect(wrapper.findAll('.route-pt')).toHaveLength(9)
    expect(wrapper.find('.route-h').attributes('style')).toContain('176px')
    expect(wrapper.find('.route-v').attributes('style')).toContain('176px')

    const xs = wrapper.findAll('.route-pt').map((e) => Number(e.attributes('cx')))
    const ys = wrapper.findAll('.route-pt').map((e) => Number(e.attributes('cy')))
    expect(Math.max(...xs)).toBe(536)
    expect(Math.min(...ys)).toBe(130)
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...xs)).toBeLessThan(610) // R_W
    expect(Math.max(...ys)).toBeLessThan(398) // R_H
  })

  it('ex-c7-route-path：一格一格走，棋子与当前数对随步数联动', async () => {
    const lab = findLabById('g6-c7-ex-route-path')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { x0: 6, k: 3, m: 2 } } })

    const nextBtn = wrapper.findAll('button').find((b) => b.text().includes('走下一格'))
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('回到起点'))
    expect(nextBtn).toBeTruthy()
    expect(resetBtn).toBeTruthy()

    const pts = wrapper.findAll('.route-pt')
    const walker = wrapper.find('.route-walker')
    const note = () => wrapper.find('.route-step-note').text()

    // 初始态 = 全部走完：棋子停在终点（9，4）
    expect(Number(walker.attributes('cx'))).toBe(Number(pts[pts.length - 1]!.attributes('cx')))
    expect(Number(walker.attributes('cy'))).toBe(Number(pts[pts.length - 1]!.attributes('cy')))
    expect(note()).toContain('向东走了 3 / 3 格')
    expect(note()).toContain('（9，4）')

    // 回到起点：棋子回到（6，2），文案回到 0 / 3
    await resetBtn!.trigger('click')
    expect(Number(walker.attributes('cx'))).toBe(Number(pts[0]!.attributes('cx')))
    expect(Number(walker.attributes('cy'))).toBe(Number(pts[0]!.attributes('cy')))
    expect(note()).toContain('0 / 3')
    expect(note()).toContain('（6，2）')

    // 走下一格（向东）：第一个数 +1、第二个数不变 →（7，2）
    await nextBtn!.trigger('click')
    expect(note()).toContain('1 / 3')
    expect(note()).toContain('（7，2）')
    expect(note()).toContain('第一个数 +1、第二个数不变')
    expect(Number(walker.attributes('cx'))).toBe(Number(pts[1]!.attributes('cx')))
    expect(Number(walker.attributes('cy'))).toBe(Number(pts[1]!.attributes('cy')))
  })

  it('ex-c7-observer-point：默认参数画出射线、定位圆弧与同一排行走路线', () => {
    const lab = findLabById('g6-c7-ex-observer-point')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { angle: 60, dist: 400, dist2: 200 } } })

    expect(wrapper.find('.obs-svg').exists()).toBe(true)
    expect(wrapper.find('.obs-ray').exists()).toBe(true)
    expect(wrapper.find('.obs-radius-arc').exists()).toBe(true)
    expect(wrapper.find('.obs-angle-arc').exists()).toBe(true)
    expect(wrapper.find('.obs-angle-lbl').text()).toBe('60°')
    expect(wrapper.find('.obs-walk-route').exists()).toBe(true)
    expect(wrapper.find('.obs-walker').exists()).toBe(true)
    expect(wrapper.findAll('.obs-home-lbl')).toHaveLength(2)

    // 两家都在街道北面 2 格 → 同一排高亮线出现
    expect(wrapper.find('.obs-same-row').exists()).toBe(true)
    expect(wrapper.find('.obs-same-row-lbl').text()).toBe('同一排')

    expect(wrapper.text()).toContain('（4，5）')
    expect(wrapper.text()).toContain('（5.54，5）')
    expect(wrapper.text()).toContain('正北 200 米')
    expect(wrapper.text()).toContain('400 米')
    expect(wrapper.find('.obs-walk-sum').text()).toContain('1.54')
    expect(wrapper.find('.obs-walk-sum').text()).toContain('154')
  })

  it('ex-c7-observer-point：两家不在同一排时隐藏高亮线', () => {
    const lab = findLabById('g6-c7-ex-observer-point')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { angle: 15, dist: 100, dist2: 300 } } })

    expect(wrapper.find('.obs-same-row').exists()).toBe(false)
    expect(wrapper.find('.obs-same-row-lbl').exists()).toBe(false)
    expect(wrapper.text()).toContain('（4，6）')
    expect(wrapper.text()).toContain('（8.74，3.97）')
    // 不同排时按直线距离：√(4.74² + 2.03²) ≈ 5.16 格 ≈ 516 米
    expect(wrapper.find('.obs-walk-sum').text()).toContain('5.16')
    expect(wrapper.find('.obs-walk-sum').text()).toContain('516')
  })

  it('ex-c7-observer-point：三个滑块取极值时图形仍留在 viewBox 内', () => {
    const lab = findLabById('g6-c7-ex-observer-point')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { angle: 15, dist: 500, dist2: 100 } } })

    // 晓雨家最北：行 7.83 格 → 仍在方格内
    const ray = wrapper.find('.obs-ray')
    expect(Number(ray.attributes('y2'))).toBeGreaterThanOrEqual(0)
    expect(Number(ray.attributes('x2'))).toBeGreaterThanOrEqual(0)

    for (const el of wrapper.findAll('.obs-svg text')) {
      const x = Number(el.attributes('x'))
      const y = Number(el.attributes('y'))
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(528) // O_W
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(404) // O_H
    }
  })

  it('ex-c7-observer-point 过程态：分三步说清“以谁为观测点”与位置分解', async () => {
    const lab = findLabById('g6-c7-ex-observer-point')!
    const wrapper = mount(ExerciseC7Lab, { props: { lab, values: { angle: 60, dist: 400, dist2: 200 } } })

    const btn = wrapper.findAll('button').find((b) => b.text().includes('下一步：只看商店的方向线'))
    expect(btn).toBeTruthy()

    // 初始态 = 最完整的一步：两处位置、同一排高亮、分解线段、行走路线都在
    expect(wrapper.find('.obs-step-note').text()).toContain('第 3 步')
    expect(wrapper.findAll('.obs-home-lbl')).toHaveLength(2)
    expect(wrapper.find('.obs-same-row').exists()).toBe(true)
    expect(wrapper.find('.obs-walk-route').exists()).toBe(true)
    expect(wrapper.find('.obs-walk-route').classes()).toContain('obs-hot')
    expect(wrapper.find('.obs-ray').classes()).not.toContain('obs-hot')

    // 分解两段：向北 4×cos60° = 2 格（80px）、向西 4×sin60° ≈ 3.46 格（138.56px）
    const northLeg = wrapper.find('.obs-north-leg')
    const westLeg = wrapper.find('.obs-west-leg')
    expect(northLeg.exists()).toBe(true)
    expect(Number(northLeg.attributes('y1')) - Number(northLeg.attributes('y2'))).toBeCloseTo(80, 2)
    expect(Number(westLeg.attributes('x1')) - Number(westLeg.attributes('x2'))).toBeCloseTo(138.56, 2)

    // 第 1 步：只留商店的北偏西方向线，另一处（打谷场）与落点全部收起，方向线高亮
    await btn!.trigger('click')
    expect(wrapper.find('.obs-step-note').text()).toContain('第 1 步')
    expect(wrapper.find('.obs-ray').exists()).toBe(true)
    expect(wrapper.find('.obs-ray').classes()).toContain('obs-hot')
    expect(wrapper.find('.obs-angle-lbl').text()).toBe('60°')
    expect(wrapper.find('.obs-north-leg').exists()).toBe(false)
    expect(wrapper.find('.obs-west-leg').exists()).toBe(false)
    expect(wrapper.find('.obs-radius-arc').exists()).toBe(false)
    expect(wrapper.findAll('.obs-home-lbl')).toHaveLength(0)
    expect(wrapper.find('.obs-north-line').exists()).toBe(false)
    expect(wrapper.find('.obs-same-row').exists()).toBe(false)
    expect(wrapper.find('.obs-walk-route').exists()).toBe(false)
    expect(wrapper.find('.obs-sum').text()).not.toContain('（5.54，5）')
    expect(wrapper.findAll('button').some((b) => b.text().includes('下一步：拆成向北、向西两段'))).toBe(true)

    // 第 2 步：揭出向北/向西的分解与晓雨家落点，但还没和打谷场那处比
    await btn!.trigger('click')
    expect(wrapper.find('.obs-step-note').text()).toContain('第 2 步')
    expect(wrapper.find('.obs-step-note').text()).toContain('cos60°')
    expect(wrapper.find('.obs-north-leg').classes()).toContain('obs-hot')
    expect(wrapper.find('.obs-west-leg').classes()).toContain('obs-hot')
    expect(wrapper.find('.obs-radius-arc').exists()).toBe(true)
    expect(wrapper.findAll('.obs-home-lbl')).toHaveLength(1)
    expect(wrapper.find('.obs-home-lbl').text()).toContain('晓雨家')
    expect(wrapper.find('.obs-sum').text()).toContain('（5.54，5）')
    expect(wrapper.find('.obs-north-line').exists()).toBe(false)
    expect(wrapper.find('.obs-same-row').exists()).toBe(false)
    expect(wrapper.find('.obs-walk-route').exists()).toBe(false)
    expect(wrapper.findAll('button').some((b) => b.text().includes('下一步：和打谷场那处比较'))).toBe(true)

    // 第 3 步：点回初始态，揭示与打谷场观测的位置关系（同一排 · 向东 1.54 格）
    await btn!.trigger('click')
    expect(wrapper.find('.obs-step-note').text()).toContain('第 3 步')
    expect(wrapper.find('.obs-step-note').text()).toContain('同一排')
    expect(wrapper.find('.obs-step-note').text()).toContain('向东 1.54 格')
    expect(wrapper.find('.obs-same-row').exists()).toBe(true)
    expect(wrapper.findAll('.obs-home-lbl')).toHaveLength(2)
    expect(wrapper.find('.obs-walk-route').exists()).toBe(true)
    expect(wrapper.find('.obs-walk-route').classes()).toContain('obs-hot')
  })

  it('c7 全部练习题 lab 用空参数挂载不抛错且文本非空', () => {
    for (const lab of c7Exercises) {
      const wrapper = mount(ExerciseC7Lab, { props: { lab, values: {} } })
      expect(wrapper.find('.ex-c7-wrap').exists()).toBe(true)
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})

describe('computeC7（七 确定位置 · 练习题求值）', () => {
  it('ex-c7-route-path：一共走 k + m 格，终点数对给出变化结果', () => {
    const r = computeC7('ex-c7-route-path', { x0: 6, k: 3, m: 2 })
    expect(r.value).toBe(5)
    expect(r.text).toContain('（6，2）')
    expect(r.text).toContain('（9，4）')
    expect(r.steps).toHaveLength(4)
    expect(r.steps[0]!.result).toContain('第 1 个数加 3')
    expect(r.steps[1]!.result).toContain('第 2 个数加 2')
    expect(r.conclusion).toContain('电影院')
  })

  it('ex-c7-route-path：非课本路线时给出通用的数对变化说明', () => {
    const r = computeC7('ex-c7-route-path', { x0: 3, k: 1, m: 4 })
    expect(r.value).toBe(5)
    expect(r.text).toContain('（3，2）')
    expect(r.text).toContain('（4，6）')
    expect(r.conclusion).toContain('（3，2）')
    expect(r.conclusion).not.toContain('电影院')
  })

  it('ex-c7-observer-point：换算格数并求晓雨家坐标（同一排）', () => {
    const r = computeC7('ex-c7-observer-point', { angle: 60, dist: 400, dist2: 200 })
    expect(r.value).toBe(400)
    expect(r.steps).toHaveLength(4)
    expect(r.steps[0]!.result).toContain('（4，5）')
    expect(r.steps[1]!.result).toContain('3.46')
    expect(r.steps[2]!.result).toContain('（5.54，5）')
    expect(r.steps[3]!.result).toContain('约 154 米')
    expect(r.conclusion).toContain('同一排')
  })

  it('ex-c7-observer-point：两家不同排时给出南北偏移', () => {
    const south = computeC7('ex-c7-observer-point', { angle: 15, dist: 100, dist2: 300 })
    expect(south.steps[3]!.result).toContain('向南约 2.03 格')
    expect(south.conclusion).toContain('不在同一排')

    const north = computeC7('ex-c7-observer-point', { angle: 15, dist: 500, dist2: 100 })
    expect(north.steps[3]!.result).toContain('向北约 3.83 格')
    expect(north.text).toContain('500')
  })

  it('computeC7：空参数使用默认值（覆盖 ?? 兜底）', () => {
    expect(computeC7('ex-c7-route-path', {}).value).toBe(5)
    expect(computeC7('ex-c7-observer-point', {}).value).toBe(400)
    expect(computeC7('ex-c7-observer-point', {}).steps[3]!.result).toContain('约 154 米')
  })
})
