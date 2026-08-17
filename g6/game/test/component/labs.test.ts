import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import RatioLab from '@/components/labs/RatioLab.vue'
import CircleLab from '@/components/labs/CircleLab.vue'
import ScaleLab from '@/components/labs/ScaleLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import PositionLab from '@/components/labs/PositionLab.vue'
import { findLabById, labsOfChapter, allLabs } from '@data'
import { labComponentFor } from '@/lib/labs/registry'

describe('Lab 组件渲染', () => {
  it('DecimalLab：mul-decimal 渲染方格网格与结果', () => {
    const lab = findLabById('g6-c1-mul-decimal')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { a: 0.6, b: 0.4 } } })
    expect(wrapper.find('.grid-100').exists()).toBe(true)
    expect(wrapper.text()).toContain('0.24')
  })

  it('DecimalLab：mul-compare 显示比较结论', () => {
    const lab = findLabById('g6-c1-mul-compare')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { base: 4.9, factor: 1.01 } } })
    expect(wrapper.text()).toContain('4.9')
  })

  it('DecimalLab：div-decimal 显示除数变整数的同步转化', () => {
    const lab = findLabById('g6-c1-div-decimal')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { sel: 1 } } })
    expect(wrapper.find('.decimal-rule').exists()).toBe(true)
    expect(wrapper.text()).toContain('把除数 0.24 变成整数 24')
    expect(wrapper.text()).toContain('两数同乘 100')
    expect(wrapper.text()).toContain('120 ÷ 24 = 5')
  })

  it('DecimalLab：div-approx 显示保留两位的判定位', () => {
    const lab = findLabById('g6-c1-div-approx')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { speed: 40 } } })
    expect(wrapper.find('.round-flow').exists()).toBe(true)
    expect(wrapper.text()).toContain('判定位 6')
    expect(wrapper.text()).toContain('第三位 ≥ 5，第二位进 1')
    expect(wrapper.text()).toContain('666.67')
  })

  it('MixCalcLab：frac-mix 显示两种解法', () => {
    const lab = findLabById('g6-c2-frac-mix')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { a: 2, b: 3, n: 18 } } })
    expect(wrapper.text()).toContain('18')
    expect(wrapper.findAll('.method').length).toBe(2)
  })

  it('MixCalcLab：piecewise 显示车费', () => {
    const lab = findLabById('g6-c2-piecewise')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { km: 5 } } })
    expect(wrapper.text()).toContain('14.4')
  })

  it('NumberLab：place-value 渲染数位', () => {
    const lab = findLabById('g6-c3-place-value')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 0 } } })
    expect(wrapper.text()).toContain('231')
    expect(wrapper.findAll('.pv-row').length).toBeGreaterThan(0)
  })

  it('NumberLab：binary 渲染二进制计数器', () => {
    const lab = findLabById('g6-c3-binary')!
    const wrapper = mount(NumberLab, { props: { lab, values: { dec: 5 } } })
    expect(wrapper.text()).toContain('101')
    expect(wrapper.findAll('.bin-bit').length).toBe(5)
  })

  it('RatioLab：ratio-distribute 显示分配结果', () => {
    const lab = findLabById('g6-c4-ratio-distribute')!
    const wrapper = mount(RatioLab, { props: { lab, values: { a: 3, b: 2, total: 500 } } })
    expect(wrapper.find('.ledger-row').exists()).toBe(true)
    expect(wrapper.findAll('.ledger-chip')).toHaveLength(3)
    expect(wrapper.text()).toContain('先求 1 份')
    expect(wrapper.text()).toContain('100 克')
    expect(wrapper.text()).toContain('300')
    expect(wrapper.text()).toContain('200')
  })

  it('RatioLab：proportion-basic 显示外项积', () => {
    const lab = findLabById('g6-c4-proportion-basic')!
    const wrapper = mount(RatioLab, { props: { lab, values: { a: 4, b: 2, k: 2 } } })
    expect(wrapper.text()).toContain('16')
  })

  it('RatioLab：golden-ratio 显示黄金比', () => {
    const lab = findLabById('g6-c4-golden-ratio')!
    const wrapper = mount(RatioLab, { props: { lab, values: { w: 200 } } })
    expect(wrapper.find('.gold-segment').exists()).toBe(true)
    expect(wrapper.text()).toContain('较短 : 较长')
    expect(wrapper.text()).toContain('全长')
    expect(wrapper.text()).toContain('0.618')
  })

  it('CircleLab：circle-feature 渲染 SVG 圆', () => {
    const lab = findLabById('g6-c5-circle-feature')!
    const wrapper = mount(CircleLab, { props: { lab, values: { r: 4 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('直径')
  })

  it('CircleLab：circumference 显示周长', () => {
    const lab = findLabById('g6-c5-circumference')!
    const wrapper = mount(CircleLab, { props: { lab, values: { r: 14 } } })
    expect(wrapper.text()).toContain('87.92')
  })

  it('ScaleLab：scale-shape 渲染放大图形', () => {
    const lab = findLabById('g6-c6-scale-shape')!
    const wrapper = mount(ScaleLab, { props: { lab, values: { n: 2, d: 1, shape: 0 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.ratio-strip').text()).toContain('原图 1 格')
    expect(wrapper.find('.ratio-strip').text()).toContain('后图 2 格')
    expect(wrapper.text()).toContain('放大')
  })

  it('ScaleLab：map-scale 显示实际距离', () => {
    const lab = findLabById('g6-c6-map-scale')!
    const wrapper = mount(ScaleLab, { props: { lab, values: { scaleDen: 1000, cm: 5 } } })
    expect(wrapper.find('.unit-flow').exists()).toBe(true)
    expect(wrapper.find('.unit-flow').text()).toContain('5000 厘米')
    expect(wrapper.text()).toContain('50')
  })

  it('PositionLab：coordinate 高亮座位', () => {
    const lab = findLabById('g6-c7-coordinate')!
    const wrapper = mount(PositionLab, { props: { lab, values: { col: 3, row: 4 } } })
    expect(wrapper.text()).toContain('严军')
    expect(wrapper.find('.seat.active').exists()).toBe(true)
  })

  it('PositionLab：direction 渲染方位图', () => {
    const lab = findLabById('g6-c7-direction')!
    const wrapper = mount(PositionLab, { props: { lab, values: { angle: 30, dist: 3, dir: 0 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('北偏东')
    expect(wrapper.find('.direction-steps').text()).toContain('从正北开始')
    expect(wrapper.find('.direction-steps').text()).toContain('向东偏 30°')
    expect(wrapper.text()).toContain('比例尺：1 千米 = 22 个画布单位')
  })

  it('MixCalcLab：estimate-shop 显示两种估法', () => {
    const lab = findLabById('g6-c2-estimate-shop')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { budget: 100 } } })
    expect(wrapper.text()).toContain('估大法')
    expect(wrapper.text()).toContain('估小法')
  })

  it('SegmentLab：segment 显示线段图与女运动员人数', () => {
    const lab = findLabById('g6-c2-segment')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { total: 45, fn: 2, fd: 5 } } })
    expect(wrapper.text()).toContain('女运动员')
    expect(wrapper.findAll('.seg-part').length).toBe(2)
  })

  it('SegmentLab：segment-more 增加 / 减少两种模式', () => {
    const lab = findLabById('g6-c2-segment-more')!
    const up = mount(SegmentLab, { props: { lab, values: { base: 14, fn: 2, fd: 7, mode: 0 } } })
    expect(up.text()).toContain('增加')
    expect(up.text()).toContain('18')
    expect(up.text()).toContain('同一比例尺')
    expect(up.find('.bar-row .bar-base').attributes('style')).toContain('77.777')
    expect(up.find('.bar-delta').text()).toContain('+4')
    const down = mount(SegmentLab, { props: { lab, values: { base: 21, fn: 1, fd: 3, mode: 1 } } })
    expect(down.text()).toContain('减少')
    expect(down.text()).toContain('14')
    expect(down.find('.bar-row .bar-base').attributes('style')).toContain('100')
    expect(down.find('.bar-delta').text()).toContain('-7')
  })

  it('SegmentLab：work-together 显示合作时间', () => {
    const lab = findLabById('g6-c2-work-together')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { a: 6, b: 3 } } })
    expect(wrapper.text()).toContain('小时')
  })

  it('NumberLab：compare-unit 显示比较符号', () => {
    const lab = findLabById('g6-c3-compare-unit')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 0 } } })
    expect(wrapper.text()).toContain('>')
  })

  it('NumberLab：op-consistency 显示运算结果', () => {
    const lab = findLabById('g6-c3-op-consistency')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 0 } } })
    expect(wrapper.text()).toContain('60')
  })

  it('RatioLab：ratio-intro 显示比', () => {
    const lab = findLabById('g6-c4-ratio-intro')!
    const wrapper = mount(RatioLab, { props: { lab, values: { a: 3, b: 2 } } })
    expect(wrapper.text()).toContain('3 : 2')
  })

  it('RatioLab：ratio-value 显示比值', () => {
    const lab = findLabById('g6-c4-ratio-value')!
    const wrapper = mount(RatioLab, { props: { lab, values: { w: 90, h: 54 } } })
    expect(wrapper.text()).toContain('1.67')
  })

  it('RatioLab：ratio-simplify 显示化简结果', () => {
    const lab = findLabById('g6-c4-ratio-simplify')!
    const wrapper = mount(RatioLab, { props: { lab, values: { sel: 0 } } })
    expect(wrapper.find('.sim-flow').exists()).toBe(true)
    expect(wrapper.find('.flow-chip.ans').text()).toContain('2 : 3')
    expect(wrapper.text()).toContain('两边同做')
    expect(wrapper.text()).toContain('2 : 3')
  })

  it('RatioLab：solve-proportion 显示解出的 x', () => {
    const lab = findLabById('g6-c4-solve-proportion')!
    const wrapper = mount(RatioLab, { props: { lab, values: { a: 25, b: 200, c: 300 } } })
    expect(wrapper.find('.solve-flow').exists()).toBe(true)
    expect(wrapper.text()).toContain('外项积 = 内项积')
    expect(wrapper.text()).toContain('37.5')
  })

  it('CircleLab：sector 显示圆心角', () => {
    const lab = findLabById('g6-c5-sector')!
    const wrapper = mount(CircleLab, { props: { lab, values: { angle: 90 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.sector-parts').exists()).toBe(true)
    expect(wrapper.text()).toContain('半径 OA')
    expect(wrapper.text()).toContain('弧 AB')
    expect(wrapper.text()).toContain('90°')
  })

  it('CircleLab：circle-area 显示面积', () => {
    const lab = findLabById('g6-c5-circle-area')!
    const wrapper = mount(CircleLab, { props: { lab, values: { r: 5, slices: 8 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('78.5')
  })

  it('CircleLab：annulus 显示环形面积', () => {
    const lab = findLabById('g6-c5-annulus')!
    const wrapper = mount(CircleLab, { props: { lab, values: { R: 10, r: 6 } } })
    expect(wrapper.text()).toContain('200.96')
  })

  it('CircleLab：circle-composite 显示窗户面积', () => {
    const lab = findLabById('g6-c5-circle-composite')!
    const wrapper = mount(CircleLab, { props: { lab, values: { side: 2 } } })
    expect(wrapper.text()).toContain('5.57')
  })

  it('ScaleLab：scale-shape 三角形 / 梯形', () => {
    const lab = findLabById('g6-c6-scale-shape')!
    const tri = mount(ScaleLab, { props: { lab, values: { n: 2, d: 1, shape: 1 } } })
    expect(tri.find('svg').exists()).toBe(true)
    const trap = mount(ScaleLab, { props: { lab, values: { n: 1, d: 2, shape: 2 } } })
    expect(trap.text()).toContain('缩小')
  })

  it('ScaleLab：scale-shape 放大 4 倍时画布动态扩展', () => {
    const lab = findLabById('g6-c6-scale-shape')!
    const wrapper = mount(ScaleLab, { props: { lab, values: { n: 4, d: 1, shape: 2 } } })
    const views = wrapper.findAll('svg').map((s) => s.attributes('viewBox'))
    expect(views.some((v) => (v ?? '').includes('272'))).toBe(true)
    expect(views.some((v) => (v ?? '').includes('144'))).toBe(true)
    expect(wrapper.text()).toContain('256')
  })

  it('ScaleLab：map-scale 显示图上 1 厘米对应实际距离', () => {
    const lab = findLabById('g6-c6-map-scale')!
    const wrapper = mount(ScaleLab, { props: { lab, values: { scaleDen: 1000, cm: 5 } } })
    expect(wrapper.text()).toContain('10 米')
    expect(wrapper.text()).toContain('÷ 100')
  })

  it('PositionLab：direction 四个方位', () => {
    const lab = findLabById('g6-c7-direction')!
    const dirs = ['北偏东', '北偏西', '南偏东', '南偏西']
    const bases = ['正北', '正北', '正南', '正南']
    for (let i = 0; i < 4; i++) {
      const wrapper = mount(PositionLab, { props: { lab, values: { angle: 30, dist: 3, dir: i } } })
      expect(wrapper.text()).toContain(dirs[i]!)
      expect(wrapper.find('.direction-steps').text()).toContain(`从${bases[i]}开始`)
    }
    const southEast = mount(PositionLab, { props: { lab, values: { angle: 30, dist: 3, dir: 2 } } })
    expect(southEast.find('.base-ray').attributes('y2')).toBe('296')
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })

  it('全部 kind 以空参数挂载不抛错（覆盖 ?? 兜底分支）', () => {
    for (const l of allLabs) {
      const comp = labComponentFor(l.kind)!
      expect(() => mount(comp, { props: { lab: l, values: {} } })).not.toThrow()
    }
  })

  it('DecimalLab：round-life 进一法', () => {
    const lab = findLabById('g6-c1-round-life')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { method: 1, total: 100 } } })
    expect(wrapper.text()).toContain('进一法')
  })

  it('CircleLab：sector 圆心角超过 180°（大弧）', () => {
    const lab = findLabById('g6-c5-sector')!
    const wrapper = mount(CircleLab, { props: { lab, values: { angle: 240 } } })
    expect(wrapper.text()).toContain('240°')
  })

  it('MixCalcLab：estimate-shop 钱少 / 钱多翻转结论', () => {
    const lab = findLabById('g6-c2-estimate-shop')!
    const poor = mount(MixCalcLab, { props: { lab, values: { budget: 80 } } })
    expect(poor.text()).toContain('可能不够买面粉')
    const rich = mount(MixCalcLab, { props: { lab, values: { budget: 150 } } })
    expect(rich.text()).toContain('可能够买大米')
  })

  it('MixCalcLab：piecewise 起步价内', () => {
    const lab = findLabById('g6-c2-piecewise')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { km: 2 } } })
    expect(wrapper.text()).toContain('起步')
  })

  it('NumberLab：place-value 含 0 计数单位', () => {
    const lab = findLabById('g6-c3-place-value')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 1 } } })
    expect(wrapper.text()).toContain('2000')
  })

  it('NumberLab：op-consistency 计数单位超过 12 个', () => {
    const lab = findLabById('g6-c3-op-consistency')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 5 } } })
    expect(wrapper.text()).toContain('465')
  })

  it('NumberLab：binary 十进制 0', () => {
    const lab = findLabById('g6-c3-binary')!
    const wrapper = mount(NumberLab, { props: { lab, values: { dec: 0 } } })
    expect(wrapper.text()).toContain('0')
  })
})
