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
import { computeLab } from '@/lib/labs/compute'

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

  it('NumberLab：数位表列出计数单位与进率，文案与 compute 一致', () => {
    const lab = findLabById('g6-c3-place-value')!
    const w231 = mount(NumberLab, { props: { lab, values: { sel: 0 } } })
    expect(w231.findAll('.pv-row').map((n) => n.find('.pv-unit').text())).toEqual(['百', '十', '一'])
    expect(w231.findAll('.pv-pow').map((n) => n.text())).toEqual(['2 × 100', '3 × 10', '1 × 1'])
    expect(w231.text()).toContain('231 = 2×100 + 3×10 + 1×1')
    expect(w231.findAll('.carry-chip')).toHaveLength(4)
    expect(w231.text()).toContain('10 个一 = 1 个十')
    // 小数：4.05 的十分位是 0，也要占一行
    const w405 = mount(NumberLab, { props: { lab, values: { sel: 3 } } })
    expect(w405.findAll('.pv-row').map((n) => n.find('.pv-unit').text())).toEqual(['一', '十分之一', '百分之一'])
    // 0.24：不显示「0 个一」
    const w024 = mount(NumberLab, { props: { lab, values: { sel: 4 } } })
    expect(w024.findAll('.pv-row').map((n) => n.find('.pv-unit').text())).toEqual(['十分之一', '百分之一'])
  })

  it('NumberLab：大小比较与运算一致性的文案与 compute 一致', () => {
    const cmpLab = findLabById('g6-c3-compare-unit')!
    // 2/3 与 3/5：不能靠 Number('2/3') → NaN 特判
    const w = mount(NumberLab, { props: { lab: cmpLab, values: { sel: 3 } } })
    expect(w.find('.cmp-sym').text()).toBe('>')
    expect(w.text()).toContain('通分后 10/15 > 9/15')
    expect(computeLab('compare-unit', { sel: 3 }).text).toBe('2/3 > 3/5')
    const w1 = mount(NumberLab, { props: { lab: cmpLab, values: { sel: 1 } } })
    expect(w1.find('.cmp-sym').text()).toBe('<')
    expect(computeLab('compare-unit', { sel: 1 }).text).toBe('3.34 < 3.4')

    const opLab = findLabById('g6-c3-op-consistency')!
    const w3 = mount(NumberLab, { props: { lab: opLab, values: { sel: 5 } } })
    expect(w3.find('.cmp-big').text()).toBe('3.4 + 1.25 = 4.65')
    expect(w3.text()).toContain('465 个 0.01')
    expect(computeLab('op-consistency', { sel: 5 }).conclusion).toContain('465 个 0.01')
  })

  it('NumberLab：binary 渲染二进制计数器', () => {
    const lab = findLabById('g6-c3-binary')!
    const wrapper = mount(NumberLab, { props: { lab, values: { dec: 5 } } })
    expect(wrapper.text()).toContain('101')
    // 5 的二进制是 101 → 3 位（位权按实际位数给：4、2、1，不再写死 5 位）
    expect(wrapper.findAll('.bin-bit')).toHaveLength(3)
    expect(wrapper.findAll('.bin-weight').map((n) => n.text())).toEqual(['4', '2', '1'])
    // 逐位读法 + 满二进一的现场
    expect(wrapper.text()).toContain('读作"一零一"')
    expect(wrapper.text()).toContain('满二进一的现场')
    expect(wrapper.text()).toContain('3 = （11）₂')
  })

  it('RatioLab：按比例分配的算式在屏幕上成立（每份 × 份数 = 部分）', () => {
    const lab = findLabById('g6-c4-ratio-distribute')!
    // 500 克按 3:2 → 每份 100，100 × 3 = 300、100 × 2 = 200
    const exact = mount(RatioLab, { props: { lab, values: { total: 500, a: 3, b: 2 } } })
    expect(exact.find('.dist-check').text()).toContain('100 × 3 = 300')
    expect(exact.find('.dist-check').text()).toContain('300 + 200 = 500 克')
    // 除不尽的情况：改用"总数 × 几分之几"，并说明原因
    const odd = mount(RatioLab, { props: { lab, values: { total: 500, a: 1, b: 2 } } })
    const t = odd.find('.dist-check').text()
    // 166.67 × 3 = 500.01 ≠ 500，所以改用"总数 × 几分之几"，屏幕上不再出现不成立的算式
    expect(t).toContain('每份除不尽')
    expect(t).toContain('500 × 1/3 = 166.67')
    expect(t).toContain('合计 500 克')
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

  it('PositionLab：数对表头与座位列对齐（表头补行号等宽空位）', () => {
    const lab = findLabById('g6-c7-coordinate')!
    const wrapper = mount(PositionLab, { props: { lab, values: { col: 3, row: 4 } } })
    // 表头 = 空位 + 8 个列号；每行 = 行号 + 8 个座位
    const head = wrapper.find('.seat-head')
    expect(head.findAll('.seat-label')).toHaveLength(9)
    expect(head.find('.seat-label.spacer').exists()).toBe(true)
    expect(wrapper.findAll('.seat-row')[0]!.findAll('.seat')).toHaveLength(8)
    const widths = head.findAll('.seat-label').map((n) => n.element.getAttribute('style') ?? '')
    expect(widths.filter((w) => w === '').length).toBe(9 - 0)
    // 第 3 列第 4 行 → 数对（3，4）
    expect(wrapper.text()).toContain('数对')
    expect(wrapper.text()).toContain('（3，4）')
  })

  it('ScaleLab：比例尺三种问法（求实际 / 求图上 / 求比例尺）', () => {
    const lab = findLabById('g6-c6-map-scale')!
    const forward = mount(ScaleLab, { props: { lab, values: { scaleDen: 1000, cm: 5, ask: 0, actualM: 1000 } } })
    expect(forward.text()).toContain('求实际距离')
    expect(forward.text()).toContain('10 米')
    // 实际 1000 米、1:1000 → 图上 100 厘米
    const reverse = mount(ScaleLab, { props: { lab, values: { scaleDen: 1000, cm: 5, ask: 1, actualM: 1000 } } })
    expect(reverse.text()).toContain('图上距离 = 100000 ÷ 1000 = 100 厘米')
    // 图上 5 厘米、实际 500 米 → 1:10000
    const den = mount(ScaleLab, { props: { lab, values: { scaleDen: 1000, cm: 5, ask: 2, actualM: 500 } } })
    expect(den.text()).toContain('1 : 10000')
  })

  it('PositionLab：direction 渲染方位图', () => {
    const lab = findLabById('g6-c7-direction')!
    const wrapper = mount(PositionLab, { props: { lab, values: { angle: 30, dist: 3, dir: 0 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('北偏东')
    expect(wrapper.find('.direction-steps').text()).toContain('从正北开始')
    expect(wrapper.find('.direction-steps').text()).toContain('向东偏 30°')
    expect(wrapper.text()).toContain('比例尺：1 千米 = 20 个画布单位')
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
    // 正南基准射线：CY 215 + 距离 3 × 比例 20 = 275
    expect(southEast.find('.base-ray').attributes('y2')).toBe('275')
    // 角度弧 sweep：北偏东/南偏西顺时针（1），北偏西/南偏东逆时针（0）
    const sweeps = [0, 1, 2, 3].map((i) => {
      const w = mount(PositionLab, { props: { lab, values: { angle: 30, dist: 3, dir: i } } })
      return w.findAll('path').map((n) => n.attributes('d')).find((d) => d?.includes(' A '))
    })
    expect(sweeps[0]).toContain('0 0 1 ')
    expect(sweeps[1]).toContain('0 0 0 ')
    expect(sweeps[2]).toContain('0 0 0 ')
    expect(sweeps[3]).toContain('0 0 1 ')
  })

  it('SegmentLab：工程问题显示最简分数与合作时间；人数不整时给出提示', () => {
    const work = findLabById('g6-c2-work-together')!
    const w = mount(SegmentLab, { props: { lab: work, values: { a: 5, b: 7 } } })
    // 第三个效率条（合作效率）给出最简分数
    expect(w.findAll('.wp-rate')[2]!.text()).toContain('1/5 + 1/7 = 12/35')
    expect(w.text()).toContain('1 ÷ 12/35')
    expect(w.text()).toContain('35/12 小时 ≈ 2.92 小时')
    const exact = mount(SegmentLab, { props: { lab: work, values: { a: 6, b: 3 } } })
    expect(exact.text()).toContain('1/6 + 1/3 = 1/2')
    expect(exact.text()).toContain('2 小时')

    const seg = findLabById('g6-c2-segment')!
    const bad = mount(SegmentLab, { props: { lab: seg, values: { total: 45, fn: 1, fd: 7 } } })
    expect(bad.find('.seg-warn').text()).toContain('人数必须是整数')
    expect(bad.find('.seg-warn').text()).toContain('49 人')
    const ok = mount(SegmentLab, { props: { lab: seg, values: { total: 45, fn: 2, fd: 5 } } })
    expect(ok.find('.seg-warn').exists()).toBe(false)
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })

  it('DecimalLab：进一去尾两种情境各用各的（铅笔买 / 油壶装）', () => {
    const lab = findLabById('g6-c1-round-life')!
    const floor = mount(DecimalLab, { props: { lab, values: { method: 0, total: 300 } } })
    expect(floor.text()).toContain('每支自动铅笔 3.5 元，300 元最多买多少支？')
    expect(floor.text()).toContain('300 ÷ 3.5 = 85.71')
    expect(floor.text()).toContain('去尾法（最多买）')
    expect(floor.text()).toContain('85 支')
    expect(floor.text()).toContain('再买 1 支要 301 元，钱不够')

    const ceil = mount(DecimalLab, { props: { lab, values: { method: 1, total: 300 } } })
    expect(ceil.text()).toContain('每个油壶最多装 2.5 千克油，300 千克油至少需要几个油壶？')
    expect(ceil.text()).toContain('300 ÷ 2.5 = 120')
    expect(ceil.text()).toContain('进一法（至少需要）')
    expect(ceil.text()).toContain('120 个')
    expect(ceil.text()).toContain('油壶')
    // 进一法分支里不能再出现"自动铅笔"这种张冠李戴
    expect(ceil.text()).not.toContain('自动铅笔')
    // 两条量条：已用 / 总量
    expect(ceil.findAll('.approx-fill').length).toBeGreaterThanOrEqual(2)
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

  it('MixCalcLab：分数混合两种解法并列且结果相同', () => {
    const lab = findLabById('g6-c2-frac-mix')!
    const wrapper = mount(MixCalcLab, { props: { lab, values: { a: 2, b: 3, n: 18 } } })
    const methods = wrapper.findAll('.method').map((n) => n.text())
    expect(methods[0]).toContain('解法一（分别算）：2/5×18 + 3/5×18 = 7.2 + 10.8 = 18')
    expect(methods[1]).toContain('解法二（先合再乘）：(2/5 + 3/5) × 18 = 1 × 18 = 18')
    expect(wrapper.find('.verify-line').text()).toContain('两种解法结果相同')
    expect(wrapper.find('.verify-line').text()).toContain('乘法分配律')
    // 两条彩绳条按分率同比例画出（40% / 60%）
    const widths = wrapper.findAll('.rope-fill').map((n) => (n.attributes('style') ?? '').match(/width: ([\d.]+)%/)?.[1])
    expect(widths).toEqual(['40', '60'])
  })

  it('MixCalcLab：分段计费按「不足 1 千米按 1 千米」计费并画费用构成', () => {
    const lab = findLabById('g6-c2-piecewise')!
    const w5 = mount(MixCalcLab, { props: { lab, values: { km: 5 } } })
    expect(w5.findAll('.fee-part')).toHaveLength(2)
    expect(w5.find('.fee-part.extra').text()).toContain('超出 2×2.2 = 4.4 元')
    expect(w5.find('.verify-line').text()).toContain('起步价 10 元 + 2 千米 × 2.2 元 = 14.4 元')
    // 5.5 千米 → 超出 2.5 千米按 3 千米计费 → 16.6 元
    const w55 = mount(MixCalcLab, { props: { lab, values: { km: 5.5 } } })
    expect(w55.find('.verify-line').text()).toContain('起步价 10 元 + 3 千米 × 2.2 元 = 16.6 元')
    expect(w55.find('.verify-line').text()).toContain('不足 1 千米，按 3 千米计算')
    // 起步价内只有一段
    const w2 = mount(MixCalcLab, { props: { lab, values: { km: 2 } } })
    expect(w2.findAll('.fee-part')).toHaveLength(1)
    expect(w2.find('.verify-line').text()).toContain('3 千米内收起步价 10 元')
  })

  it('MixCalcLab：estimate-shop 钱少 / 钱多翻转结论', () => {
    const lab = findLabById('g6-c2-estimate-shop')!
    const poor = mount(MixCalcLab, { props: { lab, values: { budget: 80 } } })
    // 预算 80：估大剩 -2、估小剩 1 → 连 16.8 元的面粉也一定不够
    expect(poor.text()).toContain('一定不够')
    expect(poor.findAll('.verdict-card.never')).toHaveLength(2)
    // 两条花钱条：估大法剩 -2 元（钱不够）、估小法剩 1 元
    expect(poor.findAll('.money-left').map((n) => n.text())).toEqual(['剩 -2', '剩 1'])
    const rich = mount(MixCalcLab, { props: { lab, values: { budget: 150 } } })
    // 预算 150：估大剩 68、估小剩 71 → 两样都一定够
    expect(rich.findAll('.verdict-card.definitely')).toHaveLength(2)
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
