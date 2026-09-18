import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import TimeLab from '@/components/labs/TimeLab.vue'
import DivLab from '@/components/labs/DivLab.vue'
import TimesLab from '@/components/labs/TimesLab.vue'
import MulLab from '@/components/labs/MulLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import MotionLab from '@/components/labs/MotionLab.vue'
import LengthLab from '@/components/labs/LengthLab.vue'
import TallyLab from '@/components/labs/TallyLab.vue'
import ViewsLab from '@/components/labs/ViewsLab.vue'
import { labsOfChapter, findLabById } from '@data'

describe('Lab 组件渲染', () => {
  it('MixCalcLab：乘加混合（笔记本+书包）', () => {
    const lab = findLabById('g3-c1-mix-multadd')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { price: 5, count: 3, bag: 50 } } })
    expect(wrapper.find('.mix-wrap').exists()).toBe(true)
    expect(wrapper.text()).toContain('5 × 3')
    expect(wrapper.text()).toContain('65')
  })

  it('MixCalcLab：除加混合（钢笔+订书机）', () => {
    const lab = findLabById('g3-c1-mix-divadd')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { box: 40, each: 5, stapler: 12 } } })
    expect(wrapper.text()).toContain('40 ÷ 5')
    expect(wrapper.text()).toContain('20')
  })

  it('MixCalcLab：小括号顺序对比', () => {
    const lab = findLabById('g3-c1-mix-order')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { a: 12, b: 8, c: 5 } } })
    expect(wrapper.text()).toContain('52')
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('小括号')
  })

  it('MixCalcLab：小括号购物', () => {
    const lab = findLabById('g3-c1-mix-bracket')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { money: 100, bag: 50, notebook: 5 } } })
    expect(wrapper.text()).toContain('100')
    expect(wrapper.text()).toContain('10')
  })

  it('TimeLab：24 时记时法（晚上 20 时）', () => {
    const lab = findLabById('g3-c2-time24')!
    const wrapper = mount(TimeLab, { props: { lab, values: { hour: 20, min: 0 } } })
    expect(wrapper.find('.clock-pair').exists()).toBe(true)
    expect(wrapper.findAll('.clock-svg')).toHaveLength(2)
    expect(wrapper.text()).toContain('晚上')
    expect(wrapper.text()).toContain('晚上8时')
    expect(wrapper.text()).toContain('20时')
    expect(wrapper.text()).toContain('8:00 = 20:00')
    expect(wrapper.text()).toContain('同一时刻的三种读法')
    expect(wrapper.findAll('.clock-num.active')).toHaveLength(2)
  })

  it('TimeLab：小时和分钟变化后钟面与时间词同步', async () => {
    const lab = findLabById('g3-c2-time24')!
    const wrapper = mount(TimeLab, { props: { lab, values: { hour: 20, min: 0 } } })

    await wrapper.setProps({ values: { hour: 13, min: 5 } })
    await nextTick()

    expect(wrapper.text()).toContain('13时5分')
    expect(wrapper.text()).toContain('下午1时5分')
    expect(wrapper.text()).toContain('1:05 = 13:05')
    expect(wrapper.findAll('.clock-num.active')).toHaveLength(2)
  })

  it('TimeLab：经过时间', () => {
    const lab = findLabById('g3-c2-elapsed')!
    const wrapper = mount(TimeLab, { props: { lab, values: { start: 9, end: 17 } } })
    expect(wrapper.find('.timeline').exists()).toBe(true)
    expect(wrapper.text()).toContain('8')
  })

  it('LengthLab：综合换算显示单位路径和余数分解', () => {
    const lab = findLabById('g3-c6-length-mix')!
    const wrapper = mount(LengthLab, { props: { lab, values: { value: 45, from: 0, to: 1 } } })
    expect(wrapper.find('.unit-ladder').exists()).toBe(true)
    expect(wrapper.text()).toContain('换算路径：毫米 → 厘米')
    expect(wrapper.text()).toContain('÷10')
    expect(wrapper.text()).toContain('45 毫米 = 4 厘米 5 毫米')
  })

  it('TallyLab：统计图保留调查记录到图表的来源链路', () => {
    const lab = findLabById('g3-c5-stat')!
    const wrapper = mount(TallyLab, { props: { lab, values: { campus: 10, animal: 7, scifi: 15, detective: 8 } } })
    expect(wrapper.find('.stat-flow').text()).toContain('1 调查记录')
    expect(wrapper.find('.record-panel').text()).toContain('科幻童话')
    expect(wrapper.find('.stat-table').text()).toContain('40')
    expect(wrapper.findAll('.bar-fill')).toHaveLength(4)
    expect(wrapper.text()).toContain('每个小圆点表示 1 人')
  })

  it('MulLab：笔算乘法顶行显示被乘数并从个位开始', async () => {
    const lab = findLabById('g3-c3-mul-pen')!
    const wrapper = mount(MulLab, { props: { lab, values: { tens: 1, ones: 4, multi: 3 } } })
    expect(wrapper.findAll('.v-cols .col-digit').map((x) => x.text())).toEqual(['1', '4'])
    expect(wrapper.findAll('.v-result .result-digit').map((x) => x.text())).toEqual(['4', '2'])
    expect(wrapper.text()).toContain('4 × 3 = 12')
    await wrapper.findAll('.step-chip')[1]!.trigger('click')
    expect(wrapper.text()).toContain('1 × 3 + 进1 = 4')
  })

  it('MulLab：连续进位显示传入高位的进位气泡', async () => {
    const lab = findLabById('g3-c3-mul-carry')!
    const wrapper = mount(MulLab, { props: { lab, values: { h: 2, t: 3, o: 4, multi: 3 } } })
    expect(wrapper.findAll('.v-cols .col-digit').map((x) => x.text())).toEqual(['2', '3', '4'])
    expect(wrapper.text()).toContain('4 × 3 = 12')
    await wrapper.findAll('.step-chip')[1]!.trigger('click')
    expect(wrapper.find('.carry-bubble').text()).toBe('1')
    expect(wrapper.text()).toContain('3 × 3 + 进1 = 10')
  })

  it('MulLab：中间 0 的乘法保留十位占位', async () => {
    const lab = findLabById('g3-c3-mul-zero')!
    const wrapper = mount(MulLab, { props: { lab, values: { h: 1, mid: 0, o: 2, multi: 4 } } })
    expect(wrapper.findAll('.v-cols .col-digit').map((x) => x.text())).toEqual(['1', '0', '2'])
    expect(wrapper.findAll('.v-result .result-digit').map((x) => x.text())).toEqual(['4', '0', '8'])
    await wrapper.findAll('.step-chip')[1]!.trigger('click')
    expect(wrapper.text()).toContain('0 × 4')
    expect(wrapper.text()).toContain('该位写 0')
  })

  it('DivLab：笔算除法（42 ÷ 3）', () => {
    const lab = findLabById('g3-c8-div-pen')!
    const wrapper = mount(DivLab, { props: { lab, values: { tens: 4, ones: 2, div: 3 } } })
    expect(wrapper.find('.div-svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('42')
    expect(wrapper.text()).toContain('14')
  })

  it('DivLab：口算除法（600 ÷ 2）', () => {
    const lab = findLabById('g3-c8-div-oral')!
    const wrapper = mount(DivLab, { props: { lab, values: { base: 600, div: 2 } } })
    expect(wrapper.text()).toContain('600')
    expect(wrapper.text()).toContain('300')
  })

  it('TimesLab：求一个数的几倍', () => {
    const lab = findLabById('g3-c12-times-mul')!
    const wrapper = mount(TimesLab, { props: { lab, values: { base: 4, times: 2 } } })
    expect(wrapper.text()).toContain('8')
  })

  it('SegmentLab：多几少几 SVG 坐标使用绑定后的数值', () => {
    const lab = findLabById('g3-c10-segment-more')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { base: 50, more1: 15, more2: 20 } } })
    expect(wrapper.html()).not.toContain('36 + bi')
    expect(wrapper.html()).not.toContain('68 + bi')
    expect(wrapper.text()).toContain('同一比例尺')
    expect(wrapper.text()).toContain('多 15 个')
    expect(wrapper.text()).toContain('多 20 个')
  })

  it('SegmentLab：倍数两步题 SVG 坐标使用绑定后的数值', () => {
    const lab = findLabById('g3-c10-times-word')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { base: 39, times: 2, less: 13 } } })
    expect(wrapper.html()).not.toContain('36 + bi')
    expect(wrapper.html()).not.toContain('68 + bi')
    expect(wrapper.text()).toContain('同一比例尺')
    expect(wrapper.text()).toContain('少 13 幅')
  })

  it('MotionLab：旋转箭头定义 marker，平移大步数仍扩大 viewBox', () => {
    const rotate = findLabById('g3-c7-rotate')!
    const rotateWrapper = mount(MotionLab, { props: { lab: rotate, values: { dir: 0, angle: 90 } } })
    expect(rotateWrapper.find('marker#mtri-arrow').exists()).toBe(true)
    expect(rotateWrapper.find('.arc').attributes('marker-end')).toBe('url(#mtri-arrow)')

    const translate = findLabById('g3-c7-translate')!
    const translateWrapper = mount(MotionLab, { props: { lab: translate, values: { dir: 1, steps: 8 } } })
    const [minX] = translateWrapper.find('svg').attributes('viewBox')!.split(' ').map(Number)
    expect(minX).toBeLessThan(0)
  })

  it('ViewsLab：三视图显示观察方向和未填充投影网格', () => {
    const lab = findLabById('g3-c11-views-match')!
    const wrapper = mount(ViewsLab, { props: { lab, values: { shape: 1 } } })
    expect(wrapper.text()).toContain('前面观察')
    expect(wrapper.text()).toContain('右面观察')
    expect(wrapper.text()).toContain('上面观察')
    expect(wrapper.find('marker#view-arrow').exists()).toBe(true)
    expect(wrapper.findAll('.proj-cell').length).toBeGreaterThan(wrapper.findAll('.proj-cell.on').length)
    expect(wrapper.text()).toContain('看宽和高')
  })

  it('每个单元都有 Lab 数据', () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })
})
