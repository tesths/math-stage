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

describe('ExerciseC4Lab · 棱长比过程态（分步揭示平方 / 立方）', () => {
  it('点按钮逐步揭示底面积比与体积比，走完再回到棱长比', async () => {
    const lab = findLabById('g6-c4-ex-cube-ratio')!
    const wrapper = mount(ExerciseC4Lab, { props: { lab, values: { a: 4, b: 6 } } })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('下一步'))!
    expect(btn).toBeDefined()

    // 初始 = 最完整的一步：三个比都在，与既有渲染一致
    expect(wrapper.find('.ex-c4-cube').classes()).toContain('c4-cube-step-2')
    expect(wrapper.find('.ex-c4-base-svg').exists()).toBe(true)
    expect(wrapper.findAll('.ex-c4-badge.power')).toHaveLength(2)
    expect(wrapper.text()).toContain('4:9')
    expect(wrapper.text()).toContain('8:27')
    expect(btn.text()).toContain('下一步：棱长比')

    // 第 1 步：只剩棱长比，底面积方格与平方 / 立方徽章一起收起
    await btn.trigger('click')
    expect(wrapper.find('.ex-c4-cube').classes()).toContain('c4-cube-step-0')
    expect(wrapper.findAll('.ex-c4-badge.power')).toHaveLength(0)
    expect(wrapper.find('.ex-c4-badge.edge').classes()).toContain('on')
    expect(wrapper.find('.ex-c4-base-svg').exists()).toBe(false)
    expect(wrapper.text()).toContain('2:3')
    expect(wrapper.text()).not.toContain('4:9')
    expect(wrapper.text()).not.toContain('8:27')
    expect(wrapper.text()).toContain('第 1 步：先看棱长比')

    // 第 2 步：揭开底面积比 = 棱长比²，底面方格点亮
    await btn.trigger('click')
    expect(wrapper.find('.ex-c4-cube').classes()).toContain('c4-cube-step-1')
    expect(wrapper.find('.ex-c4-base-svg').exists()).toBe(true)
    expect(wrapper.find('.ex-c4-base-stage').classes()).toContain('c4-on')
    expect(wrapper.findAll('.ex-c4-badge.power')).toHaveLength(1)
    expect(wrapper.find('.ex-c4-badge.area').classes()).toContain('on')
    expect(wrapper.text()).toContain('4:9')
    expect(wrapper.text()).not.toContain('8:27')
    expect(wrapper.text()).toContain('底面积比 = 棱长比²')

    // 再点一次：回到最完整的一步，体积比与立体图高亮都回来
    await btn.trigger('click')
    expect(wrapper.find('.ex-c4-cube').classes()).toContain('c4-cube-step-2')
    expect(wrapper.findAll('.ex-c4-badge.power')).toHaveLength(2)
    expect(wrapper.find('.ex-c4-cube-stage').classes()).toContain('c4-on')
    expect(wrapper.text()).toContain('8:27')
    expect(wrapper.text()).toContain('第 3 步：体积比 = 棱长比³')
  })
})

describe('ExerciseC4Lab · 比分过程态（先求 1 份 → 乘份数 → 合计）', () => {
  it('点按钮先只留每份，再揭示黑白块数，最后露出合计校验', async () => {
    const lab = findLabById('g6-c4-ex-football-ratio')!
    const wrapper = mount(ExerciseC4Lab, { props: { lab, values: { a: 3, b: 5, per: 4 } } })
    const btn = wrapper.findAll('button').find((b) => b.text().includes('下一步'))!
    expect(btn).toBeDefined()

    // 初始 = 最完整的一步：块数、四张步骤卡、合计都在，与既有渲染一致
    expect(wrapper.find('.ex-c4-foot').classes()).toContain('c4-foot-step-2')
    expect(wrapper.findAll('.ex-c4-block')).toHaveLength(2)
    expect(wrapper.findAll('.ex-c4-step')).toHaveLength(4)
    expect(wrapper.find('.ex-c4-foot-sum').exists()).toBe(true)
    expect(wrapper.text()).toContain('12 + 20 = 32 块')
    expect(btn.text()).toContain('下一步：先求 1 份')

    // 第 1 步：先求 1 份——只留份数 / 每份，量条上仍是 8 个小格
    await btn.trigger('click')
    expect(wrapper.find('.ex-c4-foot').classes()).toContain('c4-foot-step-0')
    expect(wrapper.findAll('.ex-c4-per')).toHaveLength(8)
    expect(wrapper.findAll('.ex-c4-block')).toHaveLength(0)
    expect(wrapper.findAll('.ex-c4-step')).toHaveLength(2)
    expect(wrapper.findAll('.ex-c4-step.on')).toHaveLength(2)
    expect(wrapper.find('.ex-c4-foot-sum').exists()).toBe(false)
    expect(wrapper.text()).toContain('3 + 5 = 8 份')
    expect(wrapper.text()).toContain('第 1 步：先求 1 份')
    expect(wrapper.text()).not.toContain('黑色皮 12 块')

    // 第 2 步：再分别乘份数——黑白块数与总块数卡片出现，量条两段点亮
    await btn.trigger('click')
    expect(wrapper.find('.ex-c4-foot').classes()).toContain('c4-foot-step-1')
    expect(wrapper.findAll('.ex-c4-block')).toHaveLength(2)
    expect(wrapper.findAll('.ex-c4-step')).toHaveLength(4)
    expect(wrapper.findAll('.ex-c4-seg.on')).toHaveLength(2)
    expect(wrapper.text()).toContain('黑色皮 12 块')
    expect(wrapper.text()).toContain('白色皮 20 块')
    expect(wrapper.text()).toContain('4 × 8 = 32 块')
    expect(wrapper.text()).toContain('第 2 步：再分别乘份数')
    expect(wrapper.find('.ex-c4-foot-sum').exists()).toBe(false)

    // 再点一次：合计 = 总数，露出合计校验
    await btn.trigger('click')
    expect(wrapper.find('.ex-c4-foot').classes()).toContain('c4-foot-step-2')
    expect(wrapper.find('.ex-c4-foot-sum').exists()).toBe(true)
    expect(wrapper.text()).toContain('12 + 20 = 32 块')
    expect(wrapper.text()).toContain('第 3 步：合计 = 总数')
  })
})
