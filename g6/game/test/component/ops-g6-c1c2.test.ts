import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import { findLabById } from '@data'

/**
 * 六年级 c1 / c2 本轮新增的可操作环节：
 * ① round-life：三法（去尾 / 进一 / 四舍五入）并排对照，各自标注适用情境
 * ② piecewise：逐段计费步进（起步价段 → 超出段 → 进位提示与总额）
 * ③ work-together：效率条相加步进（最简分数，不出现小数近似）
 */

/** UButton 在测试环境被替换为 <button>，按文字找按钮 */
function stepBtn(wrapper: VueWrapper, label: string) {
  const btn = wrapper.findAll('button').find((b) => b.text() === label)
  expect(btn, `找不到按钮「${label}」`).toBeTruthy()
  return btn!
}

async function clickStep(wrapper: VueWrapper, label: string) {
  await stepBtn(wrapper, label).trigger('click')
}

describe('g6-c1-round-life：去尾 / 进一 / 四舍五入 三法并排对照', () => {
  const lab = findLabById('g6-c1-round-life')!

  it('去尾法情境（300 元买 3.5 元/支）：三行结果为 85 / 86 / 86，并标注各自适用情境', async () => {
    const w = mount(DecimalLab, { props: { lab, values: { method: 0, total: 300 } } })
    // 分步揭示：默认收起，先点击按钮才出现对照
    expect(w.find('.round-cmp-rows').exists()).toBe(false)
    expect(w.find('.round-cmp-toggle').text()).toContain('三法并排对照（去尾 / 进一 / 四舍五入）')

    await w.find('.round-cmp-toggle').trigger('click')
    const rows = w.findAll('.round-cmp-row')
    expect(rows).toHaveLength(3)
    expect(rows.map((r) => r.find('.round-cmp-name').text())).toEqual([
      '去尾法 → 85 支',
      '进一法 → 86 支',
      '四舍五入 → 86 支',
    ])
    // 同一数据下 去尾 85 ≤ 四舍五入 86 ≤ 进一 86，去尾与进一不同 → 不能见小数就四舍五入
    expect(85).toBeLessThan(86)
    // 适用情境各自标注
    expect(rows[0]!.find('.round-cmp-use').text()).toContain('求「最多买几支」：钱不能超，多一支就不够')
    expect(rows[1]!.find('.round-cmp-use').text()).toContain('求「至少准备几支」：要保证够用，少一支就不够')
    expect(rows[2]!.find('.round-cmp-use').text()).toContain('只求「大约是多少」')
    // 每行的算理说明
    expect(rows[0]!.find('.round-cmp-note').text()).toContain('只取整数部分 85，支数不能是小数')
    expect(rows[1]!.find('.round-cmp-note').text()).toContain('整数部分再加 1 得 86，85支装不下')
    expect(rows[2]!.find('.round-cmp-note').text()).toContain('看十分位「7」决定舍或入得 86')

    // 再点一次收起（同一按钮的两种文案）
    await w.find('.round-cmp-toggle').trigger('click')
    expect(w.find('.round-cmp-rows').exists()).toBe(false)
    expect(w.find('.round-cmp-toggle').text()).toContain('三法并排对照')
  })

  it('进一法情境（300 千克油，每壶 2.5 千克）：单位换成「个」，三法结果同显', async () => {
    const w = mount(DecimalLab, { props: { lab, values: { method: 1, total: 300 } } })
    await w.find('.round-cmp-toggle').trigger('click')
    const rows = w.findAll('.round-cmp-row')
    expect(rows.map((r) => r.find('.round-cmp-name').text())).toEqual([
      '去尾法 → 120 个',
      '进一法 → 120 个',
      '四舍五入 → 120 个',
    ])
    // 商正好是整数时三法一致，情境文案仍要区分
    expect(rows[0]!.find('.round-cmp-use').text()).toContain('最多买几个')
    expect(rows[1]!.find('.round-cmp-use').text()).toContain('至少准备几个')
    expect(rows[0]!.find('.round-cmp-note').text()).toContain('个数不能是小数')
    expect(rows[1]!.find('.round-cmp-note').text()).toContain('120个装不下')
  })
})

describe('g6-c2-piecewise：逐段计费步进', () => {
  const lab = findLabById('g6-c2-piecewise')!

  it('5 千米：第 1 步只给起步价段，第 2 步给超出段，第 3 步给总额', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { km: 5 } } })
    expect(w.find('.pw-step-count').text()).toContain('第 1 / 3 步')
    expect(w.findAll('.pw-step')).toHaveLength(1)
    expect(w.find('.pw-step-detail').text()).toContain('不超过 3 千米都收起步价 10 元')
    expect(stepBtn(w, '上一步').attributes('disabled')).toBeDefined()

    await clickStep(w, '下一步')
    expect(w.findAll('.pw-step')).toHaveLength(2)
    expect(w.findAll('.pw-step-detail')[1]!.text()).toBe('超出 2 千米 → 按 2 千米计费：2 × 2.2 = 4.4 元')
    expect(stepBtn(w, '下一步').attributes('disabled')).toBeUndefined()

    await clickStep(w, '下一步')
    expect(w.find('.pw-step-count').text()).toContain('第 3 / 3 步')
    const last = w.findAll('.pw-step')[2]!
    expect(last.find('.pw-step-title').text()).toBe('第 3 步 · 两段相加得总额')
    expect(last.find('.pw-step-detail').text()).toBe('车费 = 10 + 4.4 = 14.4 元')
    expect(w.find('.pw-step.current').text()).toContain('两段相加得总额')
    expect(stepBtn(w, '下一步').attributes('disabled')).toBeDefined()

    // 可以回退一步再看「超出段」
    await clickStep(w, '上一步')
    expect(w.find('.pw-step-count').text()).toContain('第 2 / 3 步')
    expect(w.findAll('.pw-step')).toHaveLength(2)
    expect(stepBtn(w, '上一步').attributes('disabled')).toBeUndefined()
  })

  it('5.5 千米：第 3 步给「不足 1 千米按 1 千米」的进位提示', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { km: 5.5 } } })
    await clickStep(w, '下一步')
    expect(w.findAll('.pw-step-detail')[1]!.text()).toBe('超出 2.5 千米 → 按 3 千米计费：3 × 2.2 = 6.6 元')
    await clickStep(w, '下一步')
    const last = w.findAll('.pw-step')[2]!
    expect(last.find('.pw-step-title').text()).toBe('第 3 步 · 不足 1 千米按 1 千米，算总额')
    expect(last.find('.pw-step-detail').text()).toBe(
      '超出 2.5 千米不足 1 千米，按 3 千米计算；车费 = 10 + 6.6 = 16.6 元',
    )
  })

  it('2 千米：起步价内没有超出段，总额就是起步价', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { km: 2 } } })
    expect(w.find('.pw-step-detail').text()).toContain('2 千米在起步段内，车费就是起步价')
    await clickStep(w, '下一步')
    await clickStep(w, '下一步')
    const steps = w.findAll('.pw-step')
    expect(steps[1]!.find('.pw-step-detail').text()).toBe('2 千米没有超出 3 千米，这一段是 0 元')
    expect(steps[2]!.find('.pw-step-title').text()).toBe('第 3 步 · 两段相加得总额')
    expect(steps[2]!.find('.pw-step-detail').text()).toContain('车费 = 10')
    expect(steps[2]!.find('.pw-step-detail').text()).toContain('= 10 元')
  })
})

describe('g6-c2-work-together：效率条相加步进（最简分数）', () => {
  const lab = findLabById('g6-c2-work-together')!

  it('1/6 + 1/3 = 1/2 → 1 ÷ 1/2 = 2 小时', async () => {
    const w = mount(SegmentLab, { props: { lab, values: { a: 6, b: 3 } } })
    expect(w.find('.work-step-count').text()).toContain('第 1 / 3 步')
    expect(w.find('.work-step-detail').text()).toContain(
      '把总工作量看作 1：志杰每小时完成 1/6，爸爸每小时完成 1/3',
    )
    expect(stepBtn(w, '上一步').attributes('disabled')).toBeDefined()

    await clickStep(w, '下一步')
    expect(w.findAll('.work-step-detail')[1]!.text()).toBe('通分：1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2')

    await clickStep(w, '下一步')
    const last = w.findAll('.work-step')[2]!
    expect(last.find('.work-step-title').text()).toBe('第 3 步 · 用效率和求合作时间')
    expect(last.find('.work-step-detail').text()).toBe('合作时间 = 1 ÷ 1/2 = 2 小时')
    expect(w.find('.work-step.current').text()).toContain('用效率和求合作时间')
    expect(stepBtn(w, '下一步').attributes('disabled')).toBeDefined()

    // 可以退回第 2 步（效率相加）再看
    await clickStep(w, '上一步')
    expect(w.find('.work-step-count').text()).toContain('第 2 / 3 步')
    expect(w.findAll('.work-step')).toHaveLength(2)
    expect(stepBtn(w, '上一步').attributes('disabled')).toBeUndefined()
  })

  it('a=5、b=7：通分后已是最简分数，也不写小数近似', async () => {
    const w = mount(SegmentLab, { props: { lab, values: { a: 5, b: 7 } } })
    await clickStep(w, '下一步')
    expect(w.findAll('.work-step-detail')[1]!.text()).toBe('通分：1/5 + 1/7 = 7/35 + 5/35 = 12/35')
    await clickStep(w, '下一步')
    const hours = w.findAll('.work-step-detail')[2]!.text()
    expect(hours).toBe('合作时间 = 1 ÷ 12/35 = 35/12 小时')
    expect(hours).not.toContain('≈')
    expect(hours).not.toContain('2.9')
  })
})
