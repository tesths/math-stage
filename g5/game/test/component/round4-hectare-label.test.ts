import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import { findLabById } from '@data'

/**
 * 第 4 轮（agent C 复核）：公顷图的三个标注不能互相重叠、也不能指错对象。
 *
 * 复核用截图确认的原问题：
 * - 「100 米 = 1 公顷」落在 1 公顷小方块的底边上，和「10000 m²」叠在一起；
 * - 「边长 100 米」居中画在 1 千米外框下方，看起来像在标注外框（实际标的是 100 米方块）。
 * 修法：两个量标签统一贴在当前正方形右侧，面积与公顷写在同一条里。
 */
describe('MeasureLab：公顷图标注', () => {
  const lab = findLabById('g5-c3-hectare-square')!

  it('边长 100 米时：面积与公顷写在同一条标签里，旧的重叠标签已移除', () => {
    const wrapper = mount(MeasureLab, { props: { lab, values: { side: 100 } } })
    const svg = wrapper.find('.ha-square-box svg')
    expect(svg.exists()).toBe(true)
    const svgText = svg.text()
    expect(svgText).toContain('10000 m² = 1 公顷')
    expect(svgText).not.toContain('100 米 = 1 公顷')
    expect(svgText).toContain('边长 100 米')
  })

  it('两个标签不重叠：「边长」贴在方块右侧，面积标签在方块正上方', () => {
    const wrapper = mount(MeasureLab, { props: { lab, values: { side: 100 } } })
    const texts = wrapper.findAll('.ha-square-box svg text')
    const sideLabel = texts.find((t) => t.text().startsWith('边长'))!
    const areaLabel = texts.find((t) => t.text().includes('m²'))!
    // 1 公顷方块 = 1 千米外框的 1/10；sqX = 24、BOX = 240 → 方块右边 = 48、方块上边 = 248
    expect(Number(sideLabel.attributes('x'))).toBeGreaterThan(48)
    // 面积标签在方块上方（y 小于方块上边），边长标签在方块右侧偏下
    expect(Number(areaLabel.attributes('y'))).toBeLessThan(248)
    expect(Number(sideLabel.attributes('y'))).toBeGreaterThan(Number(areaLabel.attributes('y')) + 12)
  })

  it('边长 1000 米时：按同一比例尺铺满外框（面积 = 1 平方千米）', () => {
    const wrapper = mount(MeasureLab, { props: { lab, values: { side: 1000 } } })
    expect(wrapper.text()).toContain('1000000 m² = 100 公顷')
    expect(wrapper.text()).toContain('1 平方千米')
  })
})
