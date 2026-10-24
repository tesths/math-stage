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
    const qDigit = wrapper.findAll('.qd-digit').find((x) => x.text() === '4')!
    const lastDividendDigit = wrapper.findAll('.dd-digit').at(1)!
    expect(qDigit.attributes('x')).toBe(lastDividendDigit.attributes('x'))
  })

  it('DivLab：笔算竖式（前两位不够除看三位）', () => {
    const lab = findLabById('g4-c1-div-pen')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 156, div: 12 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('前两位')
    expect(wrapper.text()).toContain('第 1 轮：15 ÷ 12 = 1')
  })

  it('DivLab：笔算竖式步骤按钮可切换当前轮', async () => {
    const lab = findLabById('g4-c1-div-pen')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 156, div: 12 } } })
    const buttons = wrapper.findAll('.step-chip')
    expect(buttons.length).toBeGreaterThan(1)
    await buttons[1]!.trigger('click')
    expect(wrapper.text()).toContain('第 2 轮')
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
    const wrapper = mount(AreaUnitLab, { props: { lab, values: { v: 3, pair: 0, dir: 0 } } })
    expect(wrapper.text()).toContain('3 平方分米')
    expect(wrapper.text()).toContain('= 300 平方厘米')
    expect(wrapper.findAll('.mini-cell')).toHaveLength(100)
    expect(wrapper.text()).toContain('10 × 10 = 100')
    expect(wrapper.text()).not.toMatch(/\d+\.\d/)
    await wrapper.setProps({ values: { v: 3, pair: 0, dir: 1 } })
    expect(wrapper.text()).toContain('300 平方厘米')
    expect(wrapper.text()).toContain('= 3 平方分米')
    const w2 = mount(AreaUnitLab, { props: { lab, values: { v: 5, pair: 1, dir: 1 } } })
    expect(w2.text()).toContain('500 平方分米')
    expect(w2.text()).toContain('= 5 平方米')
    expect(w2.text()).not.toMatch(/\d+\.\d/)
  })

  it('PuzzleLab：拼图形周长对比', () => {
    const lab = findLabById('g4-c3-peri-area-change')!
    const wrapper = mount(PuzzleLab, { props: { lab, values: { rows: 4 } } })
    expect(wrapper.find('.combo-table').exists()).toBe(true)
    expect(wrapper.findAll('.mini-rect').length).toBeGreaterThan(1)
    expect(wrapper.findAll('.peri-bar-fill').length).toBe(wrapper.findAll('.mini-rect').length)
    expect(wrapper.text()).toContain('36')
    expect(wrapper.text()).toContain('24 厘米')
    expect(wrapper.text()).toContain('细长拼法最长')
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

describe('第 4 轮：真过程与真对齐', () => {
  it('DivLab 试商：192 ÷ 24 初商 9 偏大，要调成 8（旧实现直接用精确商，永远"验算通过"）', async () => {
    const lab = findLabById('g4-c1-div-try')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 192, div: 24 } } })
    expect(wrapper.text()).toContain('看成 20')
    const btn = wrapper.find('[data-test=try-next]')
    expect(btn.exists()).toBe(true)
    for (let i = 0; i < 3; i++) await btn.trigger('click')
    expect(wrapper.text()).toContain('初商偏大')
    expect(wrapper.text()).toContain('调小成 8')
    expect(wrapper.find('[data-test=try-summary]').text()).toContain('192 ÷ 24 = 8')
  })

  it('DivLab 竖式：有"开始下一轮 / 重来"按钮，商写在正确的数位上', async () => {
    const lab = findLabById('g4-c1-div-pen')!
    const wrapper = mount(DivLab, { props: { lab, values: { num: 156, div: 12 } } })
    expect(wrapper.text()).toContain('商 1 写在十位上面')
    const next = wrapper.find('[data-test=div-next]')
    expect(next.exists()).toBe(true)
    await next.trigger('click')
    expect(wrapper.find('[data-test=div-round-note]').text()).toContain('商 3 写在个位上面')
    const reset = wrapper.find('[data-test=div-reset]')
    await reset.trigger('click')
    expect(wrapper.find('[data-test=div-round-note]').text()).toContain('第 1 轮')
  })

  it('BigNumLab：两个部分积与积都对齐在同一根个位线上', () => {
    const lab = findLabById('g4-c9-big-mul')!
    const wrapper = mount(BigNumLab, { props: { lab, values: { num: 128, mult: 16 } } })
    const xOf = (cls: string) => wrapper.findAll(`text.${cls}`).map((t) => Number(t.attributes('x')))
    const ones = Math.max(...xOf('mul-d')) // 个位线：被乘数与乘数的个位都落在最右边这一列
    const last = (arr: number[]) => arr[arr.length - 1]
    // 个位部分积 128 × 6 = 768 的末位落在个位线上
    expect(xOf('mul-r')).toContain(ones)
    // 十位部分积 128 × 1 个十 整体左移一位，个位补 0（补的 0 也必须在个位线）
    expect(xOf('mul-zero')).toEqual([ones])
    // 第二部分积（128，整体左移一位）三位分别落在千位、百位、十位
    expect(xOf('mul-r').slice(-3)).toEqual([ones - 90, ones - 60, ones - 30])
    // 积的末位同样在个位线
    expect(last(xOf('mul-total'))).toBe(ones)
    expect(wrapper.find('[data-test=big-total]').text()).toContain('768 + 1280 = 2,048')
  })

  it('BigNumLab：1 亿张纸与珠峰共用同一比例尺（不再封顶压平）', async () => {
    const lab = findLabById('g4-c9-big-1yi')!
    const wrapper = mount(BigNumLab, { props: { lab, values: { sheets: 100000000, thick: 1 } } })
    const stack = wrapper.find('.paper-stack').attributes('style')!
    const peak = wrapper.find('.everest-mountain').attributes('style')!
    const h = (style: string) => Number(/height:\s*([\d.]+)px/.exec(style)?.[1])
    expect(h(stack)).toBeGreaterThan(h(peak)) // 10000 米 > 8848 米
    expect(h(stack)).toBeLessThan(200) // 仍在画布内（真的按比例，不是 min 封顶）
    const toggle = wrapper.find('[data-test=compare-toggle]')
    await toggle.trigger('click')
    expect(wrapper.find('[data-test=compare-text]').text()).toContain('比珠峰高')
  })

  it('ShapeLab 面积：一格一格铺满（40 格），点"铺满"后全部点亮', async () => {
    const lab = findLabById('g4-c2-area-rect')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 8, b: 5 } } })
    expect(wrapper.findAll('.unit-cell')).toHaveLength(40)
    const btn = wrapper.find('[data-test=fill-next]')
    await btn.trigger('click') // 铺满后点一下回到第一排
    expect(wrapper.findAll('.unit-cell.on')).toHaveLength(8)
    await wrapper.find('[data-test=fill-all]').trigger('click')
    expect(wrapper.findAll('.unit-cell.on')).toHaveLength(40)
    expect(wrapper.find('[data-test=formula-result]').text()).toContain('40 平方厘米')
  })

  it('ShapeLab 周长：四条边拉直，长度与周长相等', async () => {
    const lab = findLabById('g4-c2-peri-rect')!
    const wrapper = mount(ShapeLab, { props: { lab, values: { a: 36, b: 24 } } })
    const btn = wrapper.find('[data-test=unfold-next]')
    await btn.trigger('click') // 4 → 1
    expect(wrapper.findAll('.strip')).toHaveLength(1)
    await wrapper.find('[data-test=unfold-all]').trigger('click')
    const segs = wrapper.findAll('.strip')
    expect(segs).toHaveLength(4)
    const total = segs.reduce((acc, s) => acc + Number(s.attributes('width')), 0)
    expect(Math.round(total)).toBeGreaterThan(200) // 36+24+36+24 厘米按比例画出来
    expect(wrapper.find('[data-test=formula-result]').text()).toContain('120 厘米')
  })

  it('QuantityLab 路程：走 1 分钟就多走一段（每段 = 速度 × 1 分钟）', async () => {
    const lab = findLabById('g4-c4-mul-distance')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { v: 70, t: 4 } } })
    const btn = wrapper.find('[data-test=walk-next]')
    await btn.trigger('click') // 4 → 1
    expect(wrapper.text()).toContain('已走 1 分钟 = 70 米')
    expect(wrapper.find('[data-test=dist-total]').text()).toContain('280 米')
    const marks = wrapper.findAll('.road-mark.on')
    expect(marks.length).toBe(2) // 0 分钟与 1 分钟两个刻度
  })

  it('SegmentLab：橘子不能是负数（梨 5、少 20 → 提示并按 4 算）', () => {
    const lab = findLabById('g4-c5-mix-segment')!
    const wrapper = mount(SegmentLab, { props: { lab, values: { pear: 5, less: 20, times: 3 } } })
    expect(wrapper.find('[data-test=seg-warn]').exists()).toBe(true)
    expect(wrapper.text()).toContain('少 4')
    const rects = wrapper.findAll('rect.seg-orange')
    expect(Number(rects[0]!.attributes('width'))).toBeGreaterThan(0)
    expect(wrapper.find('[data-test=seg-answer]').text()).toContain('18 箱')
  })

  it('NumberLab 四舍五入：385204 的千位是 5，约 39 万（旧实现读成百位 2，文字自相矛盾）', () => {
    const lab = findLabById('g4-c7-num-approx')!
    const wrapper = mount(NumberLab, { props: { lab, values: { v: 385204 } } })
    expect(wrapper.find('[data-test=wan-digit]').text()).toBe('5')
    expect(wrapper.text()).toContain('约 39 万')
    const w2 = mount(NumberLab, { props: { lab, values: { v: 384204 } } })
    expect(w2.text()).toContain('约 38 万')
  })

  it('NumberLab 计数单位：25000 说成"2 个万，还剩 5000"，不写成 2.5 个万', () => {
    const lab = findLabById('g4-c7-num-count')!
    const wrapper = mount(NumberLab, { props: { lab, values: { v: 25000 } } })
    const note = wrapper.find('[data-test=count-note]').text()
    expect(note).toContain('2 个万')
    expect(note).toContain('5,000')
    expect(note).not.toMatch(/\d\.\d/)
  })

  it('AreaUnitLab：一排一排铺满 100 个小正方形', async () => {
    const lab = findLabById('g4-c2-area-unit')!
    const wrapper = mount(AreaUnitLab, { props: { lab, values: { v: 3, pair: 0, dir: 0 } } })
    const btn = wrapper.find('[data-test=areaunit-next]')
    await btn.trigger('click') // 铺满后点一下回到第一排
    expect(wrapper.findAll('.mini-cell.on')).toHaveLength(10)
    expect(wrapper.text()).toContain('= 100 平方厘米')
  })

  it('PuzzleLab：换一种拼法，面积不变但周长变', async () => {
    const lab = findLabById('g4-c3-peri-area-change')!
    const wrapper = mount(PuzzleLab, { props: { lab, values: { rows: 4 } } })
    const before = wrapper.text()
    const btn = wrapper.find('[data-test=combo-next]')
    await btn.trigger('click')
    expect(wrapper.text()).not.toBe(before)
    expect(wrapper.text()).toContain('36')
  })
})

describe('第 4 轮补：静态图变真过程（-act 截图必须与初始态不同）', () => {
  it('QuantityLab 归一：先求单价，再求总价', async () => {
    const lab = findLabById('g4-c4-mul-solve')!
    const wrapper = mount(QuantityLab, { props: { lab, values: { price: 6, count: 5 } } })
    expect(wrapper.findAll('.chip.dim')).toHaveLength(0)
    const btn = wrapper.find('[data-test=solve-next]')
    await btn.trigger('click') // 2 → 1：第二步变淡
    expect(wrapper.findAll('.chip.dim')).toHaveLength(1)
    expect(wrapper.find('[data-test=solve-total]').classes()).toContain('dim')
    expect(btn.text()).toContain('第 1 / 2 步')
  })

  it('NumberLab 计数单位：从"一个也没数"开始，点一次数出一个', async () => {
    const lab = findLabById('g4-c7-num-count')!
    const wrapper = mount(NumberLab, { props: { lab, values: { v: 10000 } } })
    const btn = wrapper.find('[data-test=count-next]')
    expect(btn.text()).toContain('已数 0 / 1')
    await btn.trigger('click')
    expect(btn.text()).toContain('已数 1 / 1')
  })
})
})
