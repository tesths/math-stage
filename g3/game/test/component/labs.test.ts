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
import WeightLab from '@/components/labs/WeightLab.vue'
import IntervalLab from '@/components/labs/IntervalLab.vue'
import ConceptTip from '@shared/components/ConceptTip.vue'
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
    expect(wrapper.text()).toContain('这一位写 0')
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

describe('第 4 轮：过程态与形数同帧', () => {
  it('ConceptTip：默认收起，点开后显示概念提示与课本出处', async () => {
    const wrapper = mount(ConceptTip, { props: { tip: '1 米 = 10 分米', page: 53, source: '例题' } })
    expect(wrapper.find('[data-test="concept-text"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="concept-toggle"]').exists()).toBe(true)
    await wrapper.find('[data-test="concept-toggle"]').trigger('click')
    expect(wrapper.find('[data-test="concept-text"]').text()).toContain('1 米 = 10 分米')
    expect(wrapper.text()).toContain('课本第 53 页')
  })

  it('TimeLab：24 时钟面内外圈同时高亮，20 时对应内圈 8', () => {
    const lab = findLabById('g3-c2-time24')!
    const wrapper = mount(TimeLab, { props: { lab, values: { hour: 20, min: 0 } } })
    expect(wrapper.findAll('.clock-num24')).toHaveLength(12)
    expect(wrapper.find('.clock-num24.active').text()).toBe('20')
    expect(wrapper.find('.clock-num.active').text()).toBe('8')
    expect(wrapper.find('.map-link').attributes('d')).toMatch(/^M .* L /)
  })

  it('TimeLab：点"转动一圈"，24 时读数 +12、内圈读数不变', async () => {
    const lab = findLabById('g3-c2-time24')!
    const wrapper = mount(TimeLab, { props: { lab, values: { hour: 8, min: 0 } } })
    expect(wrapper.text()).toContain('8时')
    await wrapper.find('[data-test="walk-turn"]').trigger('click')
    expect(wrapper.text()).toContain('20时')
    expect(wrapper.find('.clock-num.active').text()).toBe('8')
    expect(wrapper.find('[data-test="walk-state"]').text()).toContain('12 小时')
  })

  it('MulLab：没算到的数位不显示，点"演示下一步"才逐位出现', async () => {
    const lab = findLabById('g3-c3-mul-pen')!
    const wrapper = mount(MulLab, { props: { lab, values: { tens: 1, ones: 4, multi: 3 } } })
    const digit0 = () => wrapper.find('[data-test="result-digit-0"]')
    // 第 1 步只算个位：个位数字先出现，十位还没算到
    expect(digit0().classes()).toContain('pending')
    expect(wrapper.find('[data-test="result-digit-1"]').classes()).toContain('shown')
    expect(wrapper.find('[data-test="mul-progress"]').text()).toContain('已写出 1 / 2 位')
    await wrapper.find('[data-test="mul-next"]').trigger('click')
    expect(digit0().classes()).toContain('shown')
    expect(wrapper.find('[data-test="mul-progress"]').text()).toContain('已写出 2 / 2 位')
  })

  it('LengthLab：米→千米 的进率写成 ×1000（不是 ×10）', () => {
    const lab = findLabById('g3-c6-length-mix')!
    const wrapper = mount(LengthLab, { props: { lab, values: { value: 3, from: 3, to: 4 } } })
    const rates = wrapper.findAll('.unit-rate').map((x) => x.text())
    expect(rates).toContain('×1000')
    expect(wrapper.text()).toContain('换算路径：米 → 千米')
    expect(wrapper.text()).toContain('3 米 = 0.003 千米')
  })

  it('LengthLab：点"开始换算"逐步走到目标单位', async () => {
    const lab = findLabById('g3-c6-length-mix')!
    const wrapper = mount(LengthLab, { props: { lab, values: { value: 45, from: 0, to: 1 } } })
    expect(wrapper.find('[data-test="mix-step"]').exists()).toBe(false)
    await wrapper.find('[data-test="mix-next"]').trigger('click')
    expect(wrapper.find('[data-test="mix-step"]').text()).toContain('45 毫米 ÷ 10 = 4.5 厘米')
  })

  it('LengthLab：千米路段 1 千米画 10 小段（每段 100 米）', () => {
    const lab = findLabById('g3-c6-km-m')!
    const wrapper = mount(LengthLab, { props: { lab, values: { value: 2, to: 0 } } })
    expect(wrapper.findAll('.road-seg')).toHaveLength(20)
  })

  it('ViewsLab：点"再放一块"后三视图格数随之变化', async () => {
    const lab = findLabById('g3-c11-views-match')!
    const wrapper = mount(ViewsLab, { props: { lab, values: { shape: 1 } } })
    const before = wrapper.findAll('.proj-cell.on').length
    await wrapper.find('[data-test="place-one"]').trigger('click')
    const after = wrapper.findAll('.proj-cell.on').length
    expect(after).toBeLessThan(before)
    expect(wrapper.findAll('.proj-cell.fresh').length).toBeGreaterThan(0)
  })

  it('IntervalLab：点"数一数间隔"，间隔弧线一条一条出现', async () => {
    const lab = findLabById('g3-c9-interval')!
    const wrapper = mount(IntervalLab, { props: { lab, values: { count: 6, end: 0 } } })
    expect(wrapper.findAll('.gap-arc')).toHaveLength(0)
    await wrapper.find('[data-test="gap-count"]').trigger('click')
    expect(wrapper.findAll('.gap-arc')).toHaveLength(1)
    await wrapper.find('[data-test="gap-count"]').trigger('click')
    expect(wrapper.findAll('.gap-arc')).toHaveLength(2)
    expect(wrapper.find('[data-test="gap-state"]').text()).toContain('已数 2 个间隔')
  })

  it('WeightLab：一块一块放石头，放到刻线时给出象重', async () => {
    const lab = findLabById('g3-c4-equivalent')!
    const wrapper = mount(WeightLab, { props: { lab, values: { mass: 2000, each: 200 } } })
    expect(wrapper.find('[data-test="stone-status"]').text()).toContain('还差')
    await wrapper.find('[data-test="stone-fill"]').trigger('click')
    expect(wrapper.find('[data-test="stone-status"]').text()).toContain('2000 千克')
    expect(wrapper.text()).toContain('10 块 × 200 千克 = 2000 千克')
  })

describe('第 4 轮补：静态图变真过程（-act 截图必须与初始态不同）', () => {
  it('TimesLab 几个几：一盒一盒地数，没数到的盒子变淡', async () => {
    const lab = findLabById('g3-c12-times-concept')!
    const wrapper = mount(TimesLab, { props: { lab, values: { each: 2, groups: 3 } } })
    expect(wrapper.findAll('.group-box.dim')).toHaveLength(0) // 初始态全部可见
    const btn = wrapper.find('[data-test=concept-next]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(wrapper.findAll('.group-box.dim')).toHaveLength(2) // 只剩第一盒
    expect(btn.text()).toContain('已数 1 / 3 盒 = 2 人')
  })

  it('TimesLab 几倍：一组一组摆出来，第 2 组起变淡', async () => {
    const lab = findLabById('g3-c12-times-mul')!
    const wrapper = mount(TimesLab, { props: { lab, values: { base: 4, times: 3 } } })
    expect(wrapper.findAll('.mul-row.dim')).toHaveLength(0)
    const btn = wrapper.find('[data-test=row-next]')
    await btn.trigger('click')
    expect(wrapper.findAll('.mul-row.dim')).toHaveLength(2)
    expect(btn.text()).toContain('已摆 1 / 3 组 = 4 个')
  })

  it('MulLab 口算：一捆一捆地数小棒', async () => {
    const lab = findLabById('g3-c3-mul-oral')!
    const wrapper = mount(MulLab, { props: { lab, values: { base: 40, count: 3 } } })
    expect(wrapper.findAll('.ten-rod.dim')).toHaveLength(0)
    const btn = wrapper.find('[data-test=rod-next]')
    await btn.trigger('click')
    expect(wrapper.findAll('.ten-rod.dim')).toHaveLength(3) // 4 捆里只剩 1 捆亮
    expect(btn.text()).toContain('已数 1 / 4 捆')
  })

  it('MulLab 估算：先估大、再估小、最后精算，逐条出现', async () => {
    const lab = findLabById('g3-c3-mul-estimate')!
    const wrapper = mount(MulLab, { props: { lab, values: { price: 24, count: 9, money: 180 } } })
    expect(wrapper.find('[data-test=estimate-verdict]').exists()).toBe(true) // 初始三步全在
    const btn = wrapper.find('[data-test=est-next]')
    await btn.trigger('click')
    expect(wrapper.find('[data-test=estimate-verdict]').exists()).toBe(false)
    expect(wrapper.findAll('.est-line:not(.muted)')).toHaveLength(1) // 只剩"估大"一条
    expect(wrapper.find('[data-test=est-progress]').text()).toContain('1 / 3')
    await btn.trigger('click')
    expect(wrapper.findAll('.est-line:not(.muted)')).toHaveLength(2) // 估大 + 估小
    await btn.trigger('click')
    expect(wrapper.findAll('.est-line:not(.muted)')).toHaveLength(3) // 再加上精算
  })

  it('LengthLab 分米行：一格一格地量，没量到的格子变淡', async () => {
    const lab = findLabById('g3-c6-dm-m')!
    const wrapper = mount(LengthLab, { props: { lab, values: { m: 1, cm: 90 } } })
    const btn = wrapper.find('[data-test=dm-next]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click') // 19 格 → 1 格
    expect(btn.text()).toContain('已量 1 / 19 格')
    expect(wrapper.findAll('.dm-seg.counted')).toHaveLength(1)
  })

  it('DivLab 口算：一份一份地分，答案在分完后才给出', async () => {
    const lab = findLabById('g3-c8-div-oral')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 60, div: 2 } } })
    const btn = wrapper.find('[data-test=oral-next]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    expect(btn.text()).toContain('已分 1 /')
    expect(wrapper.find('[data-test=oral-answer]').text()).toContain('已分 1 份')
  })
})

  it('TimesLab 混合：爸爸年龄先空着，点第一步才出现；倍数如实给余数', async () => {
    const lab = findLabById('g3-c12-times-mix')!
    const wrapper = mount(TimesLab, { props: { lab, values: { mom: 32, more: 3, son: 7 } } })
    const btn = wrapper.find('[data-test=mix-next]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click') // 2 → 1：只剩第一步亮
    expect(wrapper.findAll('.age-chip.dad.dim')).toHaveLength(0) // 爸爸这一步是亮的
    expect(wrapper.find('[data-test=mix-rate]').classes()).toContain('dim')
    expect(btn.text()).toContain('第 1 / 2 步')
    expect(wrapper.find('[data-test=mix-rate]').text()).toContain('35 ÷ 7 = 5 倍')
    // 不能整除时不许写"≈ 几倍"
    const w2 = mount(TimesLab, { props: { lab, values: { mom: 32, more: 3, son: 6 } } })
    expect(w2.find('[data-test=mix-rate]').text()).toContain('余 5')
    expect(w2.text()).not.toContain('≈')
  })
})
