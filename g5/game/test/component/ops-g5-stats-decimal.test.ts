/**
 * task-2 新增操作的组件测试（只覆盖本次改动的两个组件）：
 * - ChartLab：统计表筛选（只看男生 / 只看女生 / 看全部）+ 验算合计；复式条形图分步揭示
 * - DecimalLab：一步一步算（部分积 → 求和 → 点小数点）、一步一步除（余数添 0）、移动一位
 *
 * chart.js 在 happy-dom 下拿不到 canvas context（只打印 `Failed to create chart` 并提前 return），
 * 所以这里一律断言 DOM（表格 / 数位表 / 图例 / 文案）与组件状态，不看 canvas 像素。
 */
import { describe, expect, it } from 'vitest'
import { mount, type DOMWrapper } from '@vue/test-utils'
import ChartLab from '@/components/labs/ChartLab.vue'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import { computeLab } from '@/lib/labs/compute'
import { findLabById } from '@data'

const STATS_TABLE_VALUES = { a1: 18, b1: 22, a2: 25, b2: 15, a3: 20, b3: 26, a4: 16, b4: 30 }
const STATS_BAR_VALUES = { s1: 1, d1: 0.5, s2: 2, d2: 3, s3: 1.5, d3: 1, s4: 1, d4: 0.5, s5: 0.5, d5: 1.5 }

function buttonByText(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(text))!
}

/**
 * v-show 的可见判断。
 * happy-dom 的 getComputedStyle 不返回 `display`，@vue/test-utils 的 isVisible() 恒为 true，
 * 所以这里直接看 v-show 写进元素的行内样式。
 */
function shown(el: DOMWrapper<Element> | undefined) {
  return !!el && !(el.attributes('style') ?? '').includes('display: none')
}

describe('ChartLab：复式统计表的操作（task-2）', () => {
  it('只看男生 / 只看女生 / 看全部：表格的列与条形图数据集同步变化', async () => {
    const lab = findLabById('g5-c2-stats-table')!
    const wrapper = mount(ChartLab, { props: { lab, values: STATS_TABLE_VALUES } })

    // 初始：看全部 —— 4 列 + 合计行，图上 2 组数据（男生 / 女生）
    expect(wrapper.find('.stats-table').attributes('data-view')).toBe('all')
    expect(wrapper.findAll('thead th').map((n) => n.text())).toEqual(['班级', '男生/人', '女生/人', '合计/人'])
    expect(wrapper.find('.chart-legend').attributes('data-dataset-count')).toBe('2')
    expect(wrapper.find('.chart-legend').attributes('data-dataset-labels')).toBe('男生,女生')
    expect(wrapper.findAll('.legend-item').map((n) => n.text())).toEqual(['男生（人）', '女生（人）'])

    // 只看男生：表格只剩「班级 + 男生」两列，条形图只剩男生这一组
    await buttonByText(wrapper, '只看男生').trigger('click')
    expect(wrapper.find('.stats-table').attributes('data-view')).toBe('boys')
    expect(wrapper.findAll('thead th').map((n) => n.text())).toEqual(['班级', '男生/人'])
    const boysRows = wrapper.findAll('tbody tr')
    expect(boysRows[0]!.findAll('td').map((n) => n.text())).toEqual(['一班', '18'])
    expect(boysRows[4]!.findAll('td').map((n) => n.text())).toEqual(['合计', '79'])
    expect(wrapper.find('.chart-legend').attributes('data-dataset-count')).toBe('1')
    expect(wrapper.find('.chart-legend').attributes('data-dataset-labels')).toBe('男生')
    expect(wrapper.findAll('.legend-item').map((n) => n.text())).toEqual(['男生（人）'])

    // 只看女生：列与合计行换成女生那一列
    await buttonByText(wrapper, '只看女生').trigger('click')
    expect(wrapper.find('.stats-table').attributes('data-view')).toBe('girls')
    expect(wrapper.findAll('thead th').map((n) => n.text())).toEqual(['班级', '女生/人'])
    expect(wrapper.findAll('tbody tr')[0]!.findAll('td').map((n) => n.text())).toEqual(['一班', '22'])
    expect(wrapper.findAll('tbody tr')[4]!.findAll('td').map((n) => n.text())).toEqual(['合计', '93'])
    expect(wrapper.find('.chart-legend').attributes('data-dataset-labels')).toBe('女生')

    // 点回看全部：恢复 3 列与两组数据
    await buttonByText(wrapper, '看全部').trigger('click')
    expect(wrapper.findAll('thead th').map((n) => n.text())).toEqual(['班级', '男生/人', '女生/人', '合计/人'])
    expect(wrapper.find('.chart-legend').attributes('data-dataset-count')).toBe('2')
  })

  it('验算合计：逐格给出行合计 / 列合计的算式，两种算法结果一致', async () => {
    const lab = findLabById('g5-c2-stats-table')!
    const wrapper = mount(ChartLab, { props: { lab, values: STATS_TABLE_VALUES } })
    expect(wrapper.find('.verify-panel').exists()).toBe(false)

    await buttonByText(wrapper, '验算合计').trigger('click')
    const panel = wrapper.find('.verify-panel')
    expect(panel.exists()).toBe(true)

    // 行合计：每班 男生 + 女生
    const rowLines = wrapper.findAll('.verify-item[data-kind="row"]').map((n) => n.text())
    expect(rowLines).toEqual([
      '一班：18 + 22 = 40（人）',
      '二班：25 + 15 = 40（人）',
      '三班：20 + 26 = 46（人）',
      '四班：16 + 30 = 46（人）',
    ])
    // 列合计：每一列从上往下加（合计值必须算准）
    const colLines = wrapper.findAll('.verify-item[data-kind="col"]').map((n) => n.text())
    expect(colLines).toEqual(['男生合计：18 + 25 + 20 + 16 = 79（人）', '女生合计：22 + 15 + 26 + 30 = 93（人）'])
    // 两种算法互相验算：40 + 40 + 46 + 46 = 172，79 + 93 = 172
    const crossLines = wrapper.findAll('.verify-item[data-kind="cross"]').map((n) => n.text())
    expect(crossLines).toEqual(['行合计相加：40 + 40 + 46 + 46 = 172（人）', '列合计相加：79 + 93 = 172（人）'])
    expect(wrapper.find('.verify-line').attributes('data-ok')).toBe('true')
    expect(wrapper.find('.verify-line').text()).toContain('172')
    // 与表格里合计行/列的数字对得上
    expect(wrapper.findAll('tbody tr')[4]!.findAll('td').map((n) => n.text())).toEqual(['合计', '79', '93', '172'])

    // 收起后算式不再渲染
    await buttonByText(wrapper, '收起验算').trigger('click')
    expect(wrapper.find('.verify-panel').exists()).toBe(false)
  })

  it('参数缺失时按 0 处理，不抛错（防御分支）', async () => {
    const lab = findLabById('g5-c2-stats-table')!
    const wrapper = mount(ChartLab, { props: { lab, values: {} } })
    expect(wrapper.findAll('tbody tr')[0]!.findAll('td').map((n) => n.text())).toEqual(['一班', '0', '0', '0'])
    await buttonByText(wrapper, '验算合计').trigger('click')
    expect(wrapper.find('.verify-line').attributes('data-ok')).toBe('true')
    expect(wrapper.find('.verify-line').text()).toContain('0 人')
  })
})

describe('ChartLab：复式条形统计图的分步揭示（task-2）', () => {
  it('第 1 步 1 组直条，第 2 步 2 组（图例跟着变）', async () => {
    const lab = findLabById('g5-c2-stats-bar')!
    const wrapper = mount(ChartLab, { props: { lab, values: STATS_BAR_VALUES } })

    // 第 1 步：只显示「自己」这一组
    expect(wrapper.find('.reveal-state').attributes('data-step')).toBe('1')
    expect(wrapper.find('.reveal-state').attributes('data-groups')).toBe('1')
    expect(wrapper.find('.chart-legend').attributes('data-dataset-count')).toBe('1')
    expect(wrapper.find('.chart-legend').attributes('data-dataset-labels')).toBe('自己')
    expect(wrapper.findAll('.legend-item').map((n) => n.text())).toEqual(['自己（时）'])
    expect(wrapper.find('.reveal-state').text()).toContain('第 1 步：1 组直条')

    // 第 2 步：叠加「同桌」，两组并列
    await buttonByText(wrapper, '叠加第二组').trigger('click')
    expect(wrapper.find('.reveal-state').attributes('data-step')).toBe('2')
    expect(wrapper.find('.reveal-state').attributes('data-groups')).toBe('2')
    expect(wrapper.find('.chart-legend').attributes('data-dataset-labels')).toBe('自己,同桌')
    expect(wrapper.findAll('.legend-item').map((n) => n.text())).toEqual(['自己（时）', '同桌（时）'])
    expect(wrapper.find('.reveal-state').text()).toContain('第 2 步：2 组直条')
    // 图例提示与直条数据同步（同桌·做家务 0.5 时）
    expect(wrapper.find('[data-key="desk"]').text()).toContain('同桌')

    // 退回第 1 步
    await buttonByText(wrapper, '只显示一组').trigger('click')
    expect(wrapper.find('.chart-legend').attributes('data-dataset-count')).toBe('1')
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})

describe('DecimalLab：小数乘整数「一步一步算」（task-2）', () => {
  it('部分积 → 求和 → 点小数点，逐步可见元素与文案变化，最终结果与 computeLab 一致', async () => {
    const lab = findLabById('g5-c4-dmul-ballpen')!
    const values = { price: 6.25, count: 12 }
    const wrapper = mount(DecimalLab, { props: { lab, values } })

    // 第 1 步：只有部分积（按位左移对齐），整数积与小数点都还没出现
    expect(wrapper.find('.vertical').attributes('data-step')).toBe('1')
    expect(wrapper.find('.step-state').text()).toContain('第 1 步：先按整数乘法算部分积')
    expect(wrapper.find('.step-state').text()).toContain('6250（左移 1 位） + 1250')
    expect(wrapper.findAll('.v-row.partial').map((n) => n.text())).toEqual(['6250', '1250'])
    expect(shown(wrapper.find('.v-row.partial'))).toBe(true)
    expect(shown(wrapper.find('.v-row.total'))).toBe(false)
    expect(shown(wrapper.find('.v-point'))).toBe(false)
    expect(shown(wrapper.find('.mul-result'))).toBe(false)

    // 第 2 步：部分积相加得整数积 7500，小数点仍未点
    await buttonByText(wrapper, '下一步').trigger('click')
    expect(wrapper.find('.vertical').attributes('data-step')).toBe('2')
    expect(wrapper.find('.step-state').text()).toContain('第 2 步：把部分积相加')
    expect(wrapper.find('.step-state').text()).toContain('= 7500')
    expect(shown(wrapper.find('.v-row.total'))).toBe(true)
    expect(wrapper.find('.v-row.total').text()).toBe('7500')
    expect(shown(wrapper.find('.v-point'))).toBe(false)

    // 第 3 步：从积的右边起数 2 位点上小数点 → 75（与 computeLab 一致）
    await buttonByText(wrapper, '下一步').trigger('click')
    expect(wrapper.find('.vertical').attributes('data-step')).toBe('3')
    expect(shown(wrapper.find('.v-point'))).toBe(true)
    expect(wrapper.find('.v-point').text()).toContain('向左点 2 位')
    expect(shown(wrapper.find('.mul-result'))).toBe(true)
    const expected = computeLab('decimal-mul', values, lab)
    expect(expected.text).toBe('75 元')
    expect(wrapper.find('.mul-result').text()).toBe(`竖式结果：6.25 × 12 = 75 元`)
    expect(wrapper.find('.mul-result').text()).toContain(expected.text)

    // 可回退
    await buttonByText(wrapper, '上一步').trigger('click')
    expect(wrapper.find('.vertical').attributes('data-step')).toBe('2')
    expect(shown(wrapper.find('.v-point'))).toBe(false)
    // 「看全部」一步到位
    await buttonByText(wrapper, '看全部').trigger('click')
    expect(shown(wrapper.find('.mul-result'))).toBe(true)
    expect(wrapper.find('.step-state').text()).toContain('第 3 步')
  })

  it('0.6 × 3：单步部分积 18 → 1.8，结果与 computeLab 一致', async () => {
    const lab = findLabById('g5-c4-dmul-pencil')!
    const values = { price: 0.6, count: 3 }
    const wrapper = mount(DecimalLab, { props: { lab, values } })
    expect(wrapper.find('.step-state').text()).toContain('部分积 —— 18')
    await buttonByText(wrapper, '看全部').trigger('click')
    expect(wrapper.find('.step-state').text()).toContain('因数共有 1 位小数')
    expect(wrapper.find('.mul-result').text()).toContain(computeLab('decimal-mul', values, lab).text)
  })

  it('参数缺失时按 0 处理（防御分支）', () => {
    const lab = findLabById('g5-c4-dmul-pencil')!
    const wrapper = mount(DecimalLab, { props: { lab, values: {} } })
    expect(wrapper.find('.vertical').attributes('data-step')).toBe('1')
    expect(wrapper.find('.step-state').text()).toContain('第 1 步')
  })
})

describe('DecimalLab：小数除以整数「余数添 0 继续除」（task-2）', () => {
  it('9.6 ÷ 4：第 1 步余 1 元，第 2 步添 0 变成 10 角再落下 6 角', async () => {
    const lab = findLabById('g5-c4-ddiv-eraser')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { total: 9.6, count: 4 } } })

    // 第 1 步：9 元 ÷ 4 = 2 元，余 1 元；还没出现「添 0」
    expect(wrapper.find('.step-state').attributes('data-step')).toBe('1')
    expect(wrapper.find('.step-state').attributes('data-total')).toBe('2')
    expect(wrapper.findAll('.div-step')[0]!.text()).toContain('9 元 ÷ 4 = 2 元，余 1 元')
    expect(shown(wrapper.findAll('.div-step')[0])).toBe(true)
    expect(shown(wrapper.findAll('.div-step')[1])).toBe(false)
    expect(shown(wrapper.find('.add-zero-line'))).toBe(false)

    // 第 2 步：余数添 0 后继续除
    await buttonByText(wrapper, '下一步（余数添 0）').trigger('click')
    const zeroLine = wrapper.find('.add-zero-line')
    expect(shown(zeroLine)).toBe(true)
    expect(zeroLine.attributes('data-add-zero')).toBe('true')
    expect(zeroLine.text()).toContain('余数添 0')
    expect(zeroLine.text()).toContain('余 1 元 添 0 → 10 角')
    expect(zeroLine.text()).toContain('再落下 6 角')
    expect(zeroLine.text()).toContain('得 16 角')
    expect(wrapper.findAll('.div-step')[1]!.text()).toContain('余下的换 16 角 ÷ 4 = 4 角')

    // 自检：每份 × 份数 + 余数 = 总数
    const check = wrapper.find('.remainder-check')
    expect(check.attributes('data-ok')).toBe('true')
    expect(check.attributes('data-remainder')).toBe('0')
    expect(check.text()).toContain('2.4 × 4 + 0 = 9.6（总数 9.6）')
  })

  it('9.6 ÷ 7 除不尽：余数 0.5 元也参与自检', async () => {
    const lab = findLabById('g5-c4-ddiv-eraser')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { total: 9.6, count: 7 } } })
    const check = wrapper.find('.remainder-check')
    expect(check.attributes('data-ok')).toBe('true')
    expect(check.attributes('data-remainder')).toBe('0.5')
    expect(check.text()).toContain('1.3 × 7 + 0.5 = 9.6（总数 9.6）')
    await buttonByText(wrapper, '看全部').trigger('click')
    expect(wrapper.find('.add-zero-line').text()).toContain('余 2 元 添 0 → 20 角')
  })

  it('本位没有余数时不编造「添 0」（9.6 ÷ 3）', async () => {
    const lab = findLabById('g5-c4-ddiv-eraser')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { total: 9.6, count: 3 } } })
    await buttonByText(wrapper, '看全部').trigger('click')
    const zeroLine = wrapper.find('.add-zero-line')
    expect(zeroLine.attributes('data-add-zero')).toBe('false')
    expect(zeroLine.text()).toContain('本位没有余数')
    expect(wrapper.find('.remainder-check').attributes('data-ok')).toBe('true')
  })

  it('参数缺失时按 0 ÷ 1 处理（防御分支）', () => {
    const lab = findLabById('g5-c4-ddiv-eraser')!
    const wrapper = mount(DecimalLab, { props: { lab, values: {} } })
    expect(wrapper.find('.remainder-check').attributes('data-ok')).toBe('true')
    expect(wrapper.find('.remainder-check').text()).toContain('总数 0')
  })
})

describe('DecimalLab：小数点「移动一位」（task-2）', () => {
  it('0.001 × 100：高亮与结果文案随步数滑动，走满后与 computeLab 一致', async () => {
    const lab = findLabById('g5-c4-dmul-paper')!
    const values = { power: 2, base: 0.001 }
    const wrapper = mount(DecimalLab, { props: { lab, values } })

    // 第 1 步：只移动一位 → 0.01，数位表高亮跟着滑
    const stepRow = () => wrapper.find('.step-row')
    expect(stepRow().attributes('data-step')).toBe('1')
    expect(stepRow().attributes('data-moved')).toBe('-2,1')
    expect(wrapper.find('.move-state').text()).toContain('第 1 步：小数点向右移动 1 位 → 0.01')
    expect(wrapper.find('.move-state').attributes('data-pad')).toBe('0')
    expect(wrapper.find('.pad-none').exists()).toBe(true)

    // 第 2 步：再移一位 → 0.1（与 computeLab 的结果一致）
    await buttonByText(wrapper, '下一步（再移一位）').trigger('click')
    expect(stepRow().attributes('data-step')).toBe('2')
    expect(stepRow().attributes('data-moved')).toBe('-1,2')
    expect(stepRow().attributes('data-moved')).not.toBe('-2,1')
    expect(wrapper.find('.move-state').text()).toContain('第 2 步：小数点向右移动 2 位 → 0.1')
    const expected = computeLab('decimal-point', values, lab)
    expect(expected.text).toBe('0.1')
    expect(wrapper.find('.move-state').text()).toContain(expected.text)
    expect(wrapper.find('.point-bridge').text()).toContain('落到结果 0.1')

    // 可回退
    await buttonByText(wrapper, '上一步').trigger('click')
    expect(stepRow().attributes('data-step')).toBe('1')
    expect(wrapper.find('.move-state').text()).toContain('0.01')
  })

  it('135 ÷ 1000：位数不够时显式补 0，走满后得 0.135', async () => {
    const lab = findLabById('g5-c4-ddiv-sugarcane')!
    const values = { power: 3, base: 135, divide: 1 }
    const wrapper = mount(DecimalLab, { props: { lab, values } })
    // 第 1 步 13.5：这一步数位够用
    expect(wrapper.find('.move-state').text()).toContain('小数点向左移动 1 位 → 13.5')
    expect(wrapper.find('.pad-zero').exists()).toBe(false)

    // 走满 3 位：整数部分空出来，用 0 补足
    await buttonByText(wrapper, '走满 3 位').trigger('click')
    expect(wrapper.find('.step-state').attributes('data-step')).toBe('3')
    expect(wrapper.find('.move-state').attributes('data-pad')).toBe('1')
    expect(wrapper.find('.pad-zero').text()).toContain('位数不够，用 1 个 0 补足')
    const expected = computeLab('decimal-point', values, lab)
    expect(expected.text).toBe('0.135')
    expect(wrapper.find('.move-state').text()).toContain('→ 0.135')
    expect(wrapper.find('.move-state').text()).toContain(expected.text)
    // 高亮搬过去的三位数字
    expect(wrapper.findAll('.step-row b.moved').length).toBeGreaterThan(0)
  })

  it('0.001 × 10000：右移超过小数位数时在末尾补 0', async () => {
    const lab = findLabById('g5-c4-dmul-paper')!
    const values = { power: 4, base: 0.001 }
    const wrapper = mount(DecimalLab, { props: { lab, values } })
    await buttonByText(wrapper, '走满 4 位').trigger('click')
    expect(wrapper.find('.move-state').attributes('data-pad')).toBe('1')
    expect(wrapper.find('.pad-zero').text()).toContain('1 个 0 补足')
    expect(wrapper.find('.move-state').text()).toContain('→ 10')
    expect(wrapper.find('.move-state').text()).toContain(computeLab('decimal-point', values, lab).text)
  })

  it('power 为 0（防御分支）时不移动，也不补 0', async () => {
    const lab = findLabById('g5-c4-dmul-paper')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { power: 0, base: 0.001 } } })
    expect(wrapper.find('.step-state').attributes('data-total')).toBe('1')
    expect(wrapper.find('.move-state').text()).toContain('移动 0 位 → 0.001')
    expect(wrapper.find('.move-state').attributes('data-pad')).toBe('0')
  })
})
