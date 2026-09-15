import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseC4Lab from '@/components/labs/exercises/ExerciseC4Lab.vue'
import { findLabById } from '@data'
import { c4Exercises } from '@data/chapters/c4-exercises'

describe('ExerciseC4Lab（四 比和比例 · 练习题）', () => {
  it('ex-c4-cube-ratio：4:6 化简出棱长比 / 底面积比 / 体积比', () => {
    const lab = findLabById('g6-c4-ex-cube-ratio')!
    const wrapper = mount(ExerciseC4Lab, { props: { lab, values: { a: 4, b: 6 } } })

    expect(wrapper.find('.ex-c4-wrap').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-cube-svg').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-base-svg').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-badges').exists()).toBe(true)
    expect(wrapper.findAll('.c4-face')).toHaveLength(6)

    expect(wrapper.text()).toContain('棱长比')
    expect(wrapper.text()).toContain('底面积比')
    expect(wrapper.text()).toContain('体积比')
    expect(wrapper.text()).toContain('2:3')
    expect(wrapper.text()).toContain('4:9')
    expect(wrapper.text()).toContain('8:27')
    // 面积比 / 体积比高亮为“平方 / 立方”
    expect(wrapper.findAll('.ex-c4-badge.power')).toHaveLength(2)
    expect(wrapper.text()).toContain('= 棱长比的平方')
    expect(wrapper.text()).toContain('= 棱长比的立方')
    // 底面积方格：a² = 16、b² = 36
    expect(wrapper.text()).toContain('底面积 4² = 16 平方厘米')
    expect(wrapper.text()).toContain('底面积 6² = 36 平方厘米')
  })

  it('ex-c4-cube-ratio：改棱长联动三个比，且最大值不越出 viewBox', () => {
    const lab = findLabById('g6-c4-ex-cube-ratio')!
    const wrapper = mount(ExerciseC4Lab, { props: { lab, values: { a: 2, b: 9 } } })

    expect(wrapper.text()).toContain('2:9')
    expect(wrapper.text()).toContain('4:81')
    expect(wrapper.text()).toContain('8:729')
    expect(wrapper.text()).toContain('小正方体棱长 2 厘米')
    expect(wrapper.text()).toContain('大正方体棱长 9 厘米')

    // 棱长拉到最大（a=6、b=9）时，正方体与底面积方格的顶点仍在 300×190 / 300×200 内
    const maxCube = mount(ExerciseC4Lab, { props: { lab, values: { a: 6, b: 9 } } })
    for (const poly of maxCube.findAll('.ex-c4-cube-svg polygon')) {
      for (const pair of poly.attributes('points')!.trim().split(/\s+/)) {
        const [x, y] = pair.split(',').map(Number)
        expect(x!).toBeLessThanOrEqual(300)
        expect(y!).toBeGreaterThanOrEqual(0)
        expect(y!).toBeLessThanOrEqual(190)
      }
    }
    for (const rect of maxCube.findAll('.ex-c4-base-svg rect')) {
      const right = Number(rect.attributes('x')) + Number(rect.attributes('width'))
      const bottom = Number(rect.attributes('y')) + Number(rect.attributes('height'))
      expect(right).toBeLessThanOrEqual(300)
      expect(bottom).toBeLessThanOrEqual(200)
    }
  })

  it('ex-c4-cube-ratio：两个棱长可交换，小/大自动按 min/max 判定', () => {
    const lab = findLabById('g6-c4-ex-cube-ratio')!
    const wrapper = mount(ExerciseC4Lab, { props: { lab, values: { a: 6, b: 3 } } })
    expect(wrapper.text()).toContain('小正方体棱长 3 厘米')
    expect(wrapper.text()).toContain('大正方体棱长 6 厘米')
    expect(wrapper.text()).toContain('1:2')
    expect(wrapper.text()).toContain('1:4')
    expect(wrapper.text()).toContain('1:8')
  })

  it('ex-c4-football-ratio：每份 4 块时 3:5 分成 12 块与 20 块', () => {
    const lab = findLabById('g6-c4-ex-football-ratio')!
    const wrapper = mount(ExerciseC4Lab, {
      props: { lab, values: { a: 3, b: 5, per: 4 } },
    })

    expect(wrapper.find('.ex-c4-foot').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-bar').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-seg.dark').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-seg.light').exists()).toBe(true)
    // 每份小格：a + b = 8 格，每格都标同一个“每份”数值
    expect(wrapper.findAll('.ex-c4-per')).toHaveLength(8)

    expect(wrapper.text()).toContain('黑色皮 12 块')
    expect(wrapper.text()).toContain('白色皮 20 块')
    expect(wrapper.text()).toContain('3 + 5 = 8 份')
    expect(wrapper.text()).toContain('4 × 8 = 32 块')
    expect(wrapper.text()).toContain('黑色 4 × 3 = 12 块')
    expect(wrapper.text()).toContain('白色 4 × 5 = 20 块')
  })

  it('ex-c4-football-ratio：改每份块数后总块数与黑白块数同步变化（恒为整数）', () => {
    const lab = findLabById('g6-c4-ex-football-ratio')!
    const wrapper = mount(ExerciseC4Lab, {
      props: { lab, values: { a: 3, b: 5, per: 2 } },
    })
    expect(wrapper.text()).toContain('2 × 8 = 16 块')
    expect(wrapper.text()).toContain('黑色皮 6 块')
    expect(wrapper.text()).toContain('白色皮 10 块')

    const one = mount(ExerciseC4Lab, { props: { lab, values: { a: 1, b: 1, per: 8 } } })
    expect(one.text()).toContain('1 + 1 = 2 份')
    expect(one.findAll('.ex-c4-per')).toHaveLength(2)
    expect(one.text()).toContain('黑色皮 8 块')
    expect(one.text()).toContain('白色皮 8 块')
  })

  it('c4 全部练习题 lab 用空参数挂载不抛错且文本非空（覆盖 ?? 兜底分支）', () => {
    for (const lab of c4Exercises) {
      const wrapper = mount(ExerciseC4Lab, { props: { lab, values: {} } })
      expect(wrapper.find('.ex-c4-wrap').exists()).toBe(true)
      expect(wrapper.text().length).toBeGreaterThan(0)
    }
  })
})
