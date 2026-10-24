import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ChanceLab from '@/components/labs/ChanceLab.vue'
import FormulaLab from '@/components/labs/FormulaLab.vue'
import { findLabById } from '@data'
import { frogCounts } from '@/lib/labs/number'

const frog = findLabById('g5-c7-frog-song')!
const square = findLabById('g5-c7-square-formula')!
const car = findLabById('g5-c7-speed-car')!
const train = findLabById('g5-c7-speed-train')!
const marble = findLabById('g5-c5-marble-bag')!

/** 把 Math.random 固定成一个可预期的序列，保证随机相关断言不 flaky */
function stubRandom(values: number[]) {
  let i = 0
  return vi.spyOn(Math, 'random').mockImplementation(() => values[i++ % values.length]!)
}

describe('FormulaLab：把「用字母表示关系」变成可操作（task-4）', () => {
  it('青蛙歌：代入求值分三步（关系式 2n → 代入 2×n → 结果），结果与独立算的 2n/4n 一致', async () => {
    const w = mount(FormulaLab, { props: { lab: frog, values: { n: 3 } } })
    expect(w.find('[data-test="frog-subst"]').exists()).toBe(false)

    const next = () => w.find('[data-test="frog-subst-next"]')
    const subst = () => w.find('[data-test="frog-subst"]')
    await next().trigger('click')
    expect(subst().attributes('data-step')).toBe('1')
    expect(subst().text()).toContain('眼睛 = 2n')
    // 第 1 步只给关系式，还没把 n 代进去
    expect(subst().text()).not.toContain('2 × 3')

    await next().trigger('click')
    expect(subst().attributes('data-step')).toBe('2')
    expect(subst().text()).toContain('2 × 3')

    await next().trigger('click')
    expect(subst().attributes('data-step')).toBe('3')
    // 独立算法：眼睛 = 2n、腿 = 4n
    expect(subst().text()).toContain('= 6 只')
    expect(subst().text()).toContain('腿 = 4 × 3 = 12 条')
    expect(frogCounts(3)).toEqual({ mouths: 3, eyes: 6, legs: 12 })

    // 算完后按钮禁用；重来后回到收起态
    expect(next().attributes('disabled')).toBeDefined()
    await w.findAll('button').find((b) => b.text() === '重来')!.trigger('click')
    expect(w.find('[data-test="frog-subst"]').exists()).toBe(false)
  })

  it('正方形：a² 与 2a 对照随 a 同步，且区分「a×a 不是 2×a」', async () => {
    const w = mount(FormulaLab, { props: { lab: square, values: { a: 3 } } })
    expect(w.find('[data-test="square-compare"]').exists()).toBe(false)
    await w.find('[data-test="square-compare-toggle"]').trigger('click')
    const box = () => w.find('[data-test="square-compare"]')
    expect(box().attributes('data-equal')).toBe('false')
    expect(box().text()).toContain('= 3 × 3 = 9')
    expect(box().text()).toContain('= 2 × 3 = 6')
    expect(box().text()).toContain('不是 2 × a')

    // a = 4：16 vs 8
    await w.setProps({ values: { a: 4 } })
    expect(box().text()).toContain('= 4 × 4 = 16')
    expect(box().text()).toContain('= 2 × 4 = 8')
  })

  it('正方形：a = 2 时两个值都是 4，要说清「数值相等但含义不同」而不是硬说 ≠', async () => {
    const w = mount(FormulaLab, { props: { lab: square, values: { a: 2 } } })
    await w.find('[data-test="square-compare-toggle"]').trigger('click')
    const box = w.find('[data-test="square-compare"]')
    expect(box.attributes('data-equal')).toBe('true')
    expect(box.text()).toContain('数值恰好都是 4')
    expect(box.text()).toContain('含义不同')
    expect(box.text()).not.toContain('≠')
    // 再点一次收起
    await w.find('[data-test="square-compare-toggle"]').trigger('click')
    expect(w.find('[data-test="square-compare"]').exists()).toBe(false)
  })

  it('路程：知二求一（求路程 / 求速度 / 求时间）三种问法算式与结果自洽', async () => {
    const w = mount(FormulaLab, { props: { lab: car, values: { v: 15, t: 3 } } })
    const ask = w.find('[data-test="speed-ask"]')
    const expr = () => w.find('[data-test="speed-ask-expr"]').text()
    const btns = () => ask.findAll('button')

    expect(expr()).toContain('s = v × t = 15 × 3 = 45 米')

    await btns()[1]!.trigger('click')
    expect(expr()).toContain('v = s ÷ t = 45 ÷ 3 = 15 米/分')

    await btns()[2]!.trigger('click')
    expect(expr()).toContain('t = s ÷ v = 45 ÷ 15 = 3 分')

    // 三个结果代入 s = v × t 必须自洽
    expect(15 * 3).toBe(45)
    expect(45 / 3).toBe(15)
    expect(45 / 15).toBe(3)
  })

  it('路程（动车组）：单位取千米/时与时，知二求一也跟着换单位', async () => {
    const w = mount(FormulaLab, { props: { lab: train, values: { v: 250, t: 3 } } })
    const expr = () => w.find('[data-test="speed-ask-expr"]').text()
    expect(expr()).toContain('s = v × t = 250 × 3 = 750 千米')
    await w.findAll('[data-test="speed-ask"] button')[2]!.trigger('click')
    expect(expr()).toContain('t = s ÷ v = 750 ÷ 250 = 3 时')
  })

  it('路程：走一走 / 复位两个按钮可操作，段数太多时如实说明「只画了前几段」', async () => {
    vi.useFakeTimers()
    try {
      // v 小、t 大 → 图上画不下 30 段，应出现「还有 N 段同样长」
      const w = mount(FormulaLab, { props: { lab: car, values: { v: 15, t: 30 } } })
      expect(w.text()).toContain('还有')

      const run = w.findAll('button').find((b) => b.text().includes('走一走'))!
      await run.trigger('click')
      expect(run.text()).toContain('行驶中…')
      // 定时器到点后回到可点状态
      vi.advanceTimersByTime(900)
      await w.vm.$nextTick()
      expect(run.text()).toContain('走一走')

      const reset = w.findAll('button').find((b) => b.text() === '复位')
      expect(reset).toBeDefined()
      await reset!.trigger('click')
      await w.vm.$nextTick()
      expect(w.findAll('button').some((b) => b.text() === '复位')).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('ChanceLab：摸球的配比与多轮对照（task-4）', () => {
  it('配比按钮写回参数并清空记录；球数与理论可能性同步变化', async () => {
    const values = { red: 4, yellow: 6 }
    const w = mount(ChanceLab, { props: { lab: marble, values } })
    const ratioBtns = () => w.find('[data-test="marble-ratios"]').findAll('button')
    expect(ratioBtns().map((b) => b.text())).toEqual(['1 : 9', '5 : 5', '9 : 1'])
    expect(w.findAll('.ball.red')).toHaveLength(4)
    expect(w.findAll('.ball.yellow')).toHaveLength(6)

    await ratioBtns()[0]!.trigger('click')
    expect(values).toEqual({ red: 1, yellow: 9 })
    expect(w.findAll('.ball.red')).toHaveLength(1)
    expect(w.findAll('.ball.yellow')).toHaveLength(9)
    expect(ratioBtns()[0]!.attributes('aria-pressed')).toBe('true')
    // 理论可能性 1/10 = 10.0%
    expect(w.text()).toContain('10.0%')

    await ratioBtns()[2]!.trigger('click')
    expect(values).toEqual({ red: 9, yellow: 1 })
    expect(w.text()).toContain('90.0%')
  })

  it('「再摸一轮（50 次）」累计轮数，并给出实验频率与理论可能性之差', async () => {
    const values = { red: 5, yellow: 5 }
    // 固定随机序列：前 50 次里 0.0/0.2/0.4 → 红，0.6/0.8 → 黄（各 30/20 次）
    const spy = stubRandom([0, 0.2, 0.4, 0.6, 0.8])
    try {
      const w = mount(ChanceLab, { props: { lab: marble, values } })
      expect(w.find('[data-test="marble-gap"]').exists()).toBe(false)

      await w.find('[data-test="draw-round"]').trigger('click')
      expect(w.text()).toContain('已摸 50 次 · 已完成 1 轮')
      const gap = w.find('[data-test="marble-gap"]')
      expect(gap.exists()).toBe(true)
      // 实验频率 = 30/50 = 60%，理论 = 50% → 差 10.0 个百分点（独立算）
      expect(w.text()).toContain('已摸 50 次')
      expect(gap.text()).toContain('已完成 1 轮')
      expect(gap.text()).toContain('10.0 个百分点')
      expect(Math.abs((30 / 50) * 100 - 50)).toBeCloseTo(10, 5)

      await w.find('[data-test="draw-round"]').trigger('click')
      expect(w.text()).toContain('已完成 2 轮')

      // 清空后轮数与差值行一起消失
      await w.findAll('button').find((b) => b.text() === '清空')!.trigger('click')
      expect(w.find('[data-test="marble-gap"]').exists()).toBe(false)
    } finally {
      spy.mockRestore()
    }
  })
})
