import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import MixCalcLab from '@/components/labs/MixCalcLab.vue'
import SegmentLab from '@/components/labs/SegmentLab.vue'
import { findLabById } from '@data'

/**
 * 六年级 c2「混合运算与数量关系（三）」本轮补的 4 条操作：
 * ① frac-mix：「1 米彩绳从哪来」——两条分率拼成整根 1 米
 * ② estimate-shop：推到临界值看三值结论翻转（一定够 / 一定不够 / 无法确定）
 * ③ segment：线段图分率刻度 + 两种解法同步高亮
 * ④ segment-more：两步步进（先算增减量，再 ±）+ 小数天数的实际意义提示
 */

/** UButton 在测试环境被替换为 <button>，按文字找按钮 */
function btn(wrapper: VueWrapper, label: string) {
  const found = wrapper.findAll('button').find((b) => b.text() === label)
  expect(found, `找不到按钮「${label}」`).toBeTruthy()
  return found!
}

/** 从 :style 里取出百分比宽度/位置 */
function pct(style: string | undefined, prop: 'width' | 'left'): number {
  const m = style?.match(new RegExp(`${prop}:\\s*([\\d.]+)%`))
  expect(m, `style 里没有 ${prop}%：${style}`).toBeTruthy()
  return parseFloat(m![1]!)
}

describe('g6-c2-frac-mix：「1 米彩绳从哪来」', () => {
  const lab = findLabById('g6-c2-frac-mix')!

  it('两条分率拼成整根 1 米：宽度之和 = 100%，并给出 (2/5 + 3/5) × 18 = 1 × 18', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { a: 2, b: 3, n: 18 } } })
    // 分步揭示：默认收起
    expect(w.find('.rope-track.join').exists()).toBe(false)
    expect(w.find('.rope-join-toggle').text()).toContain('1 米彩绳从哪来')

    await w.find('.rope-join-toggle').trigger('click')
    const parts = w.findAll('.rope-track.join .rope-fill')
    expect(parts).toHaveLength(2)
    const first = pct(parts[0]!.attributes('style'), 'width')
    const second = pct(parts[1]!.attributes('style'), 'width')
    expect(first).toBeCloseTo(40, 6) // 2/5
    expect(second).toBeCloseTo(60, 6) // 3/5
    expect(first + second).toBeCloseTo(100, 6)
    expect(w.find('.rope-fill.seg-first').text()).toContain('2/5 米')
    expect(w.find('.rope-fill.seg-second').text()).toContain('3/5 米')

    const note = w.find('.join-note').text()
    expect(note).toContain('2/5 + 3/5 = 1')
    expect(note).toContain('(2/5 + 3/5) × 18 = 1 × 18 = 18 米')

    // 两种解法并列且结果一致
    const methods = w.findAll('.method').map((m) => m.text())
    expect(methods).toHaveLength(2)
    expect(methods[0]!).toContain('2/5×18 + 3/5×18')
    expect(methods[0]!).toContain('= 18')
    expect(methods[1]!).toContain('(2/5 + 3/5) × 18')
    expect(methods[1]!).toContain('= 18')

    // 再点一次收起
    await w.find('.rope-join-toggle').trigger('click')
    expect(w.find('.rope-track.join').exists()).toBe(false)
    expect(w.find('.rope-join-toggle').text()).toContain('把两条分率拼成整根 1 米')
  })

  it('换一组数据（a=1、b=2）宽度仍合计 100%，分率和仍是 1', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { a: 1, b: 2, n: 9 } } })
    await w.find('.rope-join-toggle').trigger('click')
    const parts = w.findAll('.rope-track.join .rope-fill')
    const first = pct(parts[0]!.attributes('style'), 'width')
    const second = pct(parts[1]!.attributes('style'), 'width')
    expect(first).toBeCloseTo(100 / 3, 6)
    expect(first + second).toBeCloseTo(100, 6)
    expect(w.find('.join-note').text()).toContain('1/3 + 2/3 = 1')
    expect(w.find('.join-note').text()).toContain('(1/3 + 2/3) × 9 = 1 × 9 = 9 米')
  })
})

describe('g6-c2-estimate-shop：三值结论与临界值翻转', () => {
  const lab = findLabById('g6-c2-estimate-shop')!

  it('一定不够（90 元）／无法确定（96 元）／一定够（150 元）三值都能命中，判定依据与数值一致', () => {
    // 90 元：最少剩 8、最多剩 11 → 两样都一定不够
    const poor = mount(MixCalcLab, { props: { lab, values: { budget: 90 } } })
    expect(poor.findAll('.verdict-card.never')).toHaveLength(2)
    expect(poor.findAll('.verdict-why')[0]!.text()).toBe('最多剩 11 < 16.8')
    expect(poor.findAll('.verdict-why')[1]!.text()).toBe('最多剩 11 < 21.6')

    // 96 元：面粉「无法确定」（最少剩 14 < 16.8 ≤ 最多剩 17）、大米一定不够
    const mid = mount(MixCalcLab, { props: { lab, values: { budget: 96 } } })
    expect(mid.findAll('.verdict-card.maybe')).toHaveLength(1)
    expect(mid.find('.verdict-card.maybe .verdict-text').text()).toBe('无法确定')
    expect(mid.findAll('.verdict-why')[0]!.text()).toBe('14 ~ 17 之间')
    expect(mid.findAll('.verdict-card.never')).toHaveLength(1)

    // 150 元：最少剩 68 → 两样都一定够
    const rich = mount(MixCalcLab, { props: { lab, values: { budget: 150 } } })
    expect(rich.findAll('.verdict-card.definitely')).toHaveLength(2)
    expect(rich.findAll('.verdict-why')[0]!.text()).toBe('最少剩 68 ≥ 16.8')
    expect(rich.findAll('.verdict-why')[1]!.text()).toBe('最少剩 68 ≥ 21.6')
    expect(rich.find('.crit-note').text()).toContain('当前预算 150 元')
  })

  it('推到临界值：面粉 99 元 → 一定够，再少 1 元（98）→ 结论翻到无法确定', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { budget: 100 } } })
    expect(w.find('.crit-note').text()).toContain('当前预算 100 元：最少剩 18 元、最多剩 21 元')

    // 面粉临界值 99：最少剩刚好 17 ≥ 16.8 → 一定够
    await w.find('.crit-btn.flour-def').trigger('click')
    expect(w.props('values').budget).toBe(99)
    expect(w.findAll('.verdict-card.definitely')).toHaveLength(1)
    expect(w.findAll('.verdict-why')[0]!.text()).toBe('最少剩 17 ≥ 16.8')

    // 再少 1 元 → 翻到「无法确定」
    await w.find('.crit-btn.flour-maybe').trigger('click')
    expect(w.props('values').budget).toBe(98)
    expect(w.findAll('.verdict-card.maybe')).toHaveLength(1)
    expect(w.findAll('.verdict-why')[0]!.text()).toBe('16 ~ 19 之间')
  })

  it('大米临界值 104 → 一定够；103 → 无法确定', async () => {
    const w = mount(MixCalcLab, { props: { lab, values: { budget: 100 } } })
    await w.find('.crit-btn.rice-def').trigger('click')
    expect(w.props('values').budget).toBe(104)
    expect(w.findAll('.verdict-card.definitely')).toHaveLength(2)
    expect(w.findAll('.verdict-why')[1]!.text()).toBe('最少剩 22 ≥ 21.6')

    await w.find('.crit-btn.rice-maybe').trigger('click')
    expect(w.props('values').budget).toBe(103)
    expect(w.findAll('.verdict-card.maybe')).toHaveLength(1)
    expect(w.findAll('.verdict-why')[1]!.text()).toBe('21 ~ 24 之间')
  })
})

describe('g6-c2-segment：线段图分率刻度 + 两种解法同步高亮', () => {
  const lab = findLabById('g6-c2-segment')!

  it('刻度位置 = 分率（2/5 → 40%），两段合成整条线段（100%）', () => {
    const w = mount(SegmentLab, { props: { lab, values: { total: 45, fn: 2, fd: 5 } } })
    expect(w.findAll('.seg-tick')).toHaveLength(3)
    expect(pct(w.find('.seg-tick.frac').attributes('style'), 'left')).toBeCloseTo(40, 6)
    expect(w.find('.seg-tick.frac').text()).toBe('2/5')
    expect(w.find('.seg-tick.start').text()).toBe('0')
    expect(w.find('.seg-tick.end').text()).toContain('单位「1」')

    const boysPct = pct(w.find('.seg-part.boys').attributes('style'), 'width')
    const girlsPct = pct(w.find('.seg-part.girls').attributes('style'), 'width')
    expect(boysPct).toBeCloseTo((2 / 5) * 100, 6)
    expect(girlsPct).toBeCloseTo((3 / 5) * 100, 6)
    expect(boysPct + girlsPct).toBeCloseTo(100, 6)
    expect(boysPct).toBeCloseTo(pct(w.find('.seg-tick.frac').attributes('style'), 'left'), 6)
  })

  it('两种解法结果一致（27 人），切换时对应线段部分高亮', async () => {
    const w = mount(SegmentLab, { props: { lab, values: { total: 45, fn: 2, fd: 5 } } })
    // 看法一：先算男生再减
    expect(w.find('.seg-part.boys').classes()).toContain('hl')
    expect(w.find('.seg-part.girls').classes()).not.toContain('hl')
    expect(w.find('.seg-method-line').text()).toContain('45 × 2/5 = 18 人')
    expect(w.find('.seg-method-line').text()).toContain('45 - 18 = 27 人')

    // 看法二：先算女生占 1 − 2/5 = 3/5
    await w.find('.seg-method-btn.m2').trigger('click')
    expect(w.find('.seg-method-btn.m2').classes()).toContain('active')
    expect(w.find('.seg-part.girls').classes()).toContain('hl')
    expect(w.find('.seg-part.boys').classes()).not.toContain('hl')
    const line2 = w.find('.seg-method-line').text()
    expect(line2).toContain('1 - 2/5 = 3/5')
    expect(line2).toContain('45 × 3/5 = 27 人')

    // 切回看法一
    await w.find('.seg-method-btn.m1').trigger('click')
    expect(w.find('.seg-part.boys').classes()).toContain('hl')

    // 换一组数据：刻度随分率走
    const w2 = mount(SegmentLab, { props: { lab, values: { total: 49, fn: 3, fd: 7 } } })
    expect(pct(w2.find('.seg-tick.frac').attributes('style'), 'left')).toBeCloseTo((3 / 7) * 100, 6)
    expect(w2.find('.seg-method-line').text()).toContain('49 × 3/7 = 21 人')
    expect(w2.find('.seg-method-line').text()).toContain('49 - 21 = 28 人')
  })
})

describe('g6-c2-segment-more：先算增减量再加减（两步）', () => {
  const lab = findLabById('g6-c2-segment-more')!

  it('增加：第 1 步 14 × 2/7 = 4 天，第 2 步 14 + 4 = 18 天（并联排 14 × (1 + 2/7)）', async () => {
    const w = mount(SegmentLab, { props: { lab, values: { base: 14, fn: 2, fd: 7, mode: 0 } } })
    expect(w.find('.more-step-count').text()).toContain('第 1 / 2 步')
    expect(w.findAll('.more-step')).toHaveLength(1)
    expect(w.find('.more-step-title').text()).toBe('第 1 步 · 先算增加的量')
    expect(w.find('.more-step-detail').text()).toBe('14 × 2/7 = 4 天')
    expect(btn(w, '上一步').attributes('disabled')).toBeDefined()

    await btn(w, '下一步').trigger('click')
    expect(w.find('.more-step-count').text()).toContain('第 2 / 2 步')
    const steps = w.findAll('.more-step')
    expect(steps).toHaveLength(2)
    expect(steps[1]!.find('.more-step-title').text()).toBe('第 2 步 · 再加')
    expect(steps[1]!.find('.more-step-detail').text()).toBe(
      '14 + 4 = 18 天；也可以写成 14 × (1 + 2/7) = 18 天',
    )
    expect(btn(w, '下一步').attributes('disabled')).toBeDefined()
    // 整数天数 → 不出现实际意义提示
    expect(w.find('.seg-warn').exists()).toBe(false)

    // 回退一步
    await btn(w, '上一步').trigger('click')
    expect(w.find('.more-step-count').text()).toContain('第 1 / 2 步')
    expect(w.findAll('.more-step')).toHaveLength(1)
  })

  it('减少：21 - 7 = 14 天；分率仍用最简分数 1/3', async () => {
    const w = mount(SegmentLab, { props: { lab, values: { base: 21, fn: 1, fd: 3, mode: 1 } } })
    expect(w.find('.more-step-title').text()).toBe('第 1 步 · 先算减少的量')
    expect(w.find('.more-step-detail').text()).toBe('21 × 1/3 = 7 天')
    await btn(w, '下一步').trigger('click')
    expect(w.findAll('.more-step')[1]!.find('.more-step-title').text()).toBe('第 2 步 · 再减')
    expect(w.findAll('.more-step')[1]!.find('.more-step-detail').text()).toBe(
      '21 - 7 = 14 天；也可以写成 21 × (1 - 1/3) = 14 天',
    )
    expect(w.find('.seg-warn').exists()).toBe(false)
  })

  it('天数出现小数时给出「注意实际意义」提示（10 × 1/3 = 3.33 天 → 建议 12 天）', () => {
    const w = mount(SegmentLab, { props: { lab, values: { base: 10, fn: 1, fd: 3, mode: 0 } } })
    expect(w.find('.more-step-detail').text()).toBe('10 × 1/3 = 3.33 天')
    const warn = w.find('.seg-warn')
    expect(warn.exists()).toBe(true)
    expect(warn.text()).toContain('注意实际意义')
    expect(warn.text()).toContain('10 × 1/3 = 3.33 天不是整数')
    expect(warn.text()).toContain('12 天') // snapUpToMultiple(10, 3)
  })
})
