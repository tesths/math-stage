import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DivLab from '@/components/labs/DivLab.vue'
import ShapeLab from '@/components/labs/ShapeLab.vue'
import AreaUnitLab from '@/components/labs/AreaUnitLab.vue'
import PuzzleLab from '@/components/labs/PuzzleLab.vue'
import QuantityLab from '@/components/labs/QuantityLab.vue'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import BigNumLab from '@/components/labs/BigNumLab.vue'
import { allLabs, findLabById, labsOfChapter } from '@data'
import { labComponentFor } from '@/lib/labs/registry'

vi.mock('animejs', () => ({
  animate: vi.fn((_target: unknown, cfg: { complete?: () => void }) => {
    cfg.complete?.()
  }),
}))

describe('Lab 组件渲染', () => {
  it('DivLab：口算除法渲染分组', () => {
    const lab = findLabById('g4-c1-div-oral')!
    const wrapper = mount(DivLab, { props: { lab, values: { base: 60, div: 20 } } })
    expect(wrapper.find('.div-wrap').exists()).toBe(true)
    expect(wrapper.text()).toContain('个十')
  })

  it('DivLab：竖式试商渲染 SVG 与试商提示', () => {
    const lab = findLabById('g4-c1-div-try')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 96, div: 24 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('试商')
  })

  it('DivLab：笔算竖式（前两位不够除看三位）', () => {
    const lab = findLabById('g4-c1-div-pen')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 156, div: 12 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('前两位')
  })

  it('DivLab：两步连除渲染书架', () => {
    const lab = findLabById('g4-c1-div-route')!
    const wrapper = mount(DivLab, { props: { lab, values: { total: 224, shelf: 2, floor: 4 } } })
    expect(wrapper.text()).toContain('28')
  })

  it('ShapeLab：长方形周长', () => {
    const lab = findLabById('g4-c2-peri-rect')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 12, b: 8 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('40 厘米')
  })

  it('ShapeLab：长方形面积', () => {
    const lab = findLabById('g4-c2-area-rect')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 8, b: 5 } } })
    expect(wrapper.text()).toContain('40 平方厘米')
  })

  it('ShapeLab：正方形周长', () => {
    const lab = findLabById('g4-c2-peri-square')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 6 } } })
    expect(wrapper.text()).toContain('24 厘米')
  })

  it('ShapeLab：正方形面积', () => {
    const lab = findLabById('g4-c2-area-square')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 6 } } })
    expect(wrapper.text()).toContain('36 平方厘米')
  })

  it('QuantityLab：归一解决问题', () => {
    const lab = findLabById('g4-c4-mul-solve')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { price: 6, count: 5 } } })
    expect(wrapper.text()).toContain('30 元')
  })

  it('ShapeLab：面积单位量面积网格', () => {
    const lab = findLabById('g4-c2-area-grid')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 8, b: 5 } } })
    expect(wrapper.find('.grid-box').exists()).toBe(true)
  })

  it('AreaUnitLab：换算方向切换', async () => {
    const lab = findLabById('g4-c2-area-unit')!
    const wrapper = mount(AreaUnitLab, { props: { lab, values: { v: 300, dir: 0 } } })
    expect(wrapper.text()).toContain('3')
    await wrapper.setProps({ values: { v: 3, dir: 1 } })
    expect(wrapper.text()).toContain('300')
    const w2 = mount(AreaUnitLab, { props: { lab, values: { v: 5, dir: 1 } } })
    expect(w2.text()).toContain('500')
  })

  it('PuzzleLab：拼图形周长对比', () => {
    const lab = findLabById('g4-c3-peri-area-change')!
    const wrapper = mount(PuzzleLab, { props: { lab, values: { rows: 4 } } })
    expect(wrapper.find('.combo-table').exists()).toBe(true)
    expect(wrapper.text()).toContain('24')
  })

  it('QuantityLab：乘法意义', () => {
    const lab = findLabById('g4-c4-mul-meaning')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { groups: 3, per: 4 } } })
    expect(wrapper.text()).toContain('12')
  })

  it('QuantityLab：总价', () => {
    const lab = findLabById('g4-c4-mul-total')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { price: 8, count: 3 } } })
    expect(wrapper.text()).toContain('24 元')
  })

  it('QuantityLab：路程', () => {
    const lab = findLabById('g4-c4-mul-distance')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { v: 70, t: 4 } } })
    expect(wrapper.text()).toContain('280 米')
  })

  it('QuantityLab：旅游计划', () => {
    const lab = findLabById('g4-c6-travel-plan')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { person: 3, transport: 400, ticket: 150, hotel: 300, days: 2 } } })
    expect(wrapper.find('.plan-cards').exists()).toBe(true)
    expect(wrapper.text()).toContain('合计')
  })

  it('MixCalcLab：三步混合运算', () => {
    const lab = findLabById('g4-c5-mix-three')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { calligraphy: 18, times: 2, less: 6 } } })
    expect(wrapper.find('.bar-chart').exists()).toBe(true)
    expect(wrapper.text()).toContain('48')
  })

  it('MixCalcLab：含括号运算', () => {
    const lab = findLabById('g4-c5-mix-bracket')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { money: 600, plane: 126, pcount: 4, ship: 48 } } })
    expect(wrapper.text()).toContain('2')
  })

  it('SegmentLab：线段图', () => {
    const lab = findLabById('g4-c5-mix-segment')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { pear: 20, less: 12, times: 3 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('84')
  })

  it('NumberLab：计数单位', () => {
    const lab = findLabById('g4-c7-num-count')!
    const wrapper = mount(NumberLab, { props: { lab, values: { v: 10000 } } })
    expect(wrapper.text()).toContain('10,000')
  })

  it('NumberLab：计数单位 千/百 分支', () => {
    const lab = findLabById('g4-c7-num-count')!
    const w1 = mount(NumberLab, { props: { lab, values: { v: 1000 } } })
    expect(w1.text()).toContain('千')
    const w2 = mount(NumberLab, { props: { lab, values: { v: 100 } } })
    expect(w2.text()).toContain('百')
  })

  it('NumberLab：数位顺序表（含越界数位兜底）', () => {
    const lab = findLabById('g4-c7-num-place')!
    const wrapper = mount(NumberLab, { props: { lab, values: { digit: 3, place: 4 } } })
    expect(wrapper.find('.place-table').exists()).toBe(true)
    expect(wrapper.text()).toContain('千')
    const w2 = mount(NumberLab, { props: { lab, values: { digit: 5, place: 0 } } })
    expect(w2.find('.place-table').exists()).toBe(true)
  })

  it('NumberLab：多位数组成（含亿级与零级）', () => {
    const lab = findLabById('g4-c7-num-multidigit')!
    const w1 = mount(NumberLab, { props: { lab, values: { wan: 1600, yi: 0 } } })
    expect(w1.text()).toContain('16,000,000')
    const w2 = mount(NumberLab, { props: { lab, values: { wan: 300, yi: 12 } } })
    expect(w2.text()).toContain('1,203,000,000')
  })

  it('NumberLab：四舍五入（舍去与进位分支）', () => {
    const lab = findLabById('g4-c7-num-approx')!
    const w1 = mount(NumberLab, { props: { lab, values: { v: 384204 } } })
    expect(w1.text()).toContain('38 万')
    const w2 = mount(NumberLab, { props: { lab, values: { v: 386685 } } })
    expect(w2.text()).toContain('39 万')
    const w3 = mount(NumberLab, { props: { lab, values: { v: 999 } } })
    expect(w3.find('.approx-box').exists()).toBe(true)
  })

  it('NumberLab：身份证编码', () => {
    const lab = findLabById('g4-c7-num-idcode')!
    const wrapper = mount(NumberLab, { props: { lab, values: { year: 2016, month: 2, day: 18 } } })
    expect(wrapper.text()).toContain('20160218')
  })

  it('MeasureLab：度量衡换算', () => {
    const lab = findLabById('g4-c8-measure-story')!
    const wrapper = mount(MeasureLab, { props: { lab, values: { chi: 5, sheng: 3, jin: 4 } } })
    expect(wrapper.find('.measure-cards').exists()).toBe(true)
    expect(wrapper.text()).toContain('115 厘米')
  })

  it('BigNumLab：三位数乘两位数竖式', () => {
    const lab = findLabById('g4-c9-big-mul')!
    const wrapper = mount(BigNumLab, { props: { lab, values: { num: 128, mult: 16 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('2,048')
  })

  it('BigNumLab：计算器规律', () => {
    const lab = findLabById('g4-c9-big-calc')!
    const wrapper = mount(BigNumLab, { props: { lab, values: { tens: 3 } } })
    expect(wrapper.text()).toContain('1225')
  })

  it('BigNumLab：1亿有多大', () => {
    const lab = findLabById('g4-c9-big-1yi')!
    const wrapper = mount(BigNumLab, { props: { lab, values: { sheets: 100000000, thick: 1 } } })
    expect(wrapper.text()).toContain('米')
    const w2 = mount(BigNumLab, { props: { lab, values: { sheets: 10000, thick: 0.5 } } })
    expect(w2.text()).toContain('厘米')
  })

  it('SegmentLab：线段图（苹果为 0 兜底）', () => {
    const lab = findLabById('g4-c5-mix-segment')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { pear: 5, less: 5, times: 0 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })

  it('全 kind 空参数挂载：组件 ?? 默认值兜底分支（全覆盖）', () => {
    const components = [DivLab, ShapeLab, AreaUnitLab, PuzzleLab, QuantityLab, MixCalcLab, SegmentLab, NumberLab, MeasureLab, BigNumLab]
    const seen = new Set<string>()
    for (const l of allLabs) {
      if (seen.has(l.kind)) continue
      seen.add(l.kind)
      const C = components.find((c) => labComponentFor(l.kind) === c)
      expect(C).toBeDefined()
      const wrapper = mount(C!, { props: { lab: l, values: {} } })
      expect(wrapper.find('div').exists()).toBe(true)
    }
    expect(seen.size).toBeGreaterThan(20)
  })
})
