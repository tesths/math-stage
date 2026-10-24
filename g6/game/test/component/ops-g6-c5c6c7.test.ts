/**
 * g6 c5/c6/c7 新增「可操作环节」组件测试（task-7 缩小范围后的 3 条）。
 *
 * 覆盖：
 * 1. `g6-c5-circle-area`「逐级翻倍」8→16→32→64 + 「现在的长与 πr 的差」
 *    —— 长独立复算：n·R·sin(π/n)（R = 60px），不复用组件里的变量。
 * 2. `g6-c6-scale-shape`「逐个对应边量一量」—— 对应边比恒等、面积倍数 = (n/d)²。
 * 3. `g6-c7-coordinate`「按数对走一格」—— 向东只加第一个数、向北只加第二个数。
 */
import { describe, expect, it } from 'vitest'
import { mount, type DOMWrapper } from '@vue/test-utils'
import CircleLab from '@/components/labs/CircleLab.vue'
import ScaleLab from '@/components/labs/ScaleLab.vue'
import PositionLab from '@/components/labs/PositionLab.vue'
import { findLabById } from '@data'
import type { LabDef } from '@data/schema/lab'

function labOf(id: string): LabDef {
  const lab = findLabById(id)
  if (!lab) throw new Error(`找不到 Lab：${id}`)
  return lab
}

/** 独立复算：把圆平均分成 n 份后拼成图形的长（px），R 为图上半径 */
function longestSidePx(n: number, R: number): number {
  return n * R * Math.sin(Math.PI / n)
}

const cells = (row: DOMWrapper<Element>): string[] => row.findAll('td').map((td) => td.text())

describe('g6-c5-circle-area · 逐级翻倍 8→16→32→64', () => {
  it('每点一次份数翻一倍（8→16→32→64→8），拼图宽度与独立复算的 n·R·sin(π/n) 一致', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circle-area'), values: { r: 5, slices: 8 } } })
    const btn = () => w.find('[data-test="double-slices"]')
    expect(btn().exists()).toBe(true)
    expect(w.text()).toContain('份数 8')

    const R = 60 // 组件右侧拼图的图上半径（px）
    const ghost = () => w.find('rect.rect-ghost')
    expect(Number(ghost().attributes('width'))).toBeCloseTo(longestSidePx(8, R), 2)
    expect(Number(ghost().attributes('height'))).toBeCloseTo(R, 5)

    for (const n of [16, 32, 64]) {
      await btn().trigger('click')
      expect(w.text()).toContain(`份数 ${n}`)
      expect(w.text()).toContain(`把圆平均分成 ${n} 份`)
      // 齿数 = 份数（左图等分圆 + 右图剪拼）
      expect(w.findAll('svg g')[1]!.findAll('path')).toHaveLength(n)
      // 形变与数变同帧：画出的总宽 = 独立复算的 n·R·sin(π/n)
      expect(Number(ghost().attributes('width'))).toBeCloseTo(longestSidePx(n, R), 2)
    }
    // 64 份之后再点回到 8 份（课本序列循环）
    await btn().trigger('click')
    expect(w.text()).toContain('份数 8')
    expect(Number(ghost().attributes('width'))).toBeCloseTo(longestSidePx(8, R), 2)
  })

  it('显示的「长与 πr 的差」逐级变小且始终为正，数值用真 π 独立复算', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circle-area'), values: { r: 5, slices: 8 } } })
    const btn = () => w.find('[data-test="double-slices"]')
    const readGap = () => {
      const text = w.find('[data-test="len-gap"]').text()
      const m = text.match(/的差 = ([\d.]+) 米/)
      expect(m).toBeTruthy()
      return Number(m![1])
    }
    const gaps: number[] = []
    for (const n of [8, 16, 32, 64]) {
      if (n > 8) await btn().trigger('click')
      const shown = readGap()
      // 独立复算：πr − n·r·sin(π/n)（r = 5），页面显示保留 3 位小数
      const expected = Math.PI * 5 - longestSidePx(n, 5)
      expect(shown).toBeGreaterThan(0)
      expect(Math.abs(shown - expected)).toBeLessThan(0.0015)
      gaps.push(shown)
    }
    // 份数翻倍 → 差严格变小
    expect(gaps[0]!).toBeGreaterThan(gaps[1]!)
    expect(gaps[1]!).toBeGreaterThan(gaps[2]!)
    expect(gaps[2]!).toBeGreaterThan(gaps[3]!)

    // 差这一栏同时给出「现在的长」与 πr，学生能自己对照
    const text8 = mount(CircleLab, {
      props: { lab: labOf('g6-c5-circle-area'), values: { r: 5, slices: 8 } },
    })
      .find('[data-test="len-gap"]')
      .text()
    expect(text8).toContain('现在的长 15.31 米')
    expect(text8).toContain('πr = 15.71 米')
    expect(text8).toContain('份数越多差越小')
  })

  it('滑块不在课本序列上时第一次翻倍落到 8；「取消翻倍」可回到滑块读数', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circle-area'), values: { r: 5, slices: 24 } } })
    expect(w.text()).toContain('份数 24')
    // 未使用翻倍按钮时没有「跟随滑块」按钮
    expect(w.find('[data-test="follow-slider"]').exists()).toBe(false)

    await w.find('[data-test="double-slices"]').trigger('click')
    expect(w.text()).toContain('份数 8')

    const follow = w.find('[data-test="follow-slider"]')
    expect(follow.exists()).toBe(true)
    expect(follow.text()).toContain('跟随滑块 24 份')
    await follow.trigger('click')
    expect(w.text()).toContain('份数 24')
    expect(w.find('[data-test="follow-slider"]').exists()).toBe(false)
    // 回到滑块后，图形宽度仍是独立复算值（24 份）
    expect(Number(w.find('rect.rect-ghost').attributes('width'))).toBeCloseTo(longestSidePx(24, 60), 2)
  })
})

describe('g6-c6-scale-shape · 逐个对应边量一量', () => {
  it('长方形按 2:1 放大：两条对应边的比恒等，面积 8 → 32 格²（= ×2²）', async () => {
    const w = mount(ScaleLab, { props: { lab: labOf('g6-c6-scale-shape'), values: { n: 2, d: 1, shape: 0 } } })
    const next = () => w.find('[data-test="measure-next"]')
    // 初始态：还没开始量
    expect(w.find('[data-test="measure-table"]').exists()).toBe(false)
    expect(w.find('[data-test="measure-verify"]').exists()).toBe(false)
    expect(w.text()).toContain('已量 0 / 2 条边')

    await next().trigger('click')
    let rows = w.findAll('[data-test="measure-table"] tbody tr')
    expect(rows).toHaveLength(1)
    expect(cells(rows[0]!)).toEqual(['长', '4', '8', '2'])
    expect(w.find('[data-test="measure-verify"]').exists()).toBe(false)

    await next().trigger('click')
    rows = w.findAll('[data-test="measure-table"] tbody tr')
    expect(rows).toHaveLength(2)
    expect(cells(rows[1]!)).toEqual(['宽', '2', '4', '2'])
    // 两条对应边的比完全相同 → 形状不变
    const ratios = rows.map((r) => cells(r)[3])
    expect(new Set(ratios).size).toBe(1)
    expect(ratios[0]).toBe('2')

    const verify = w.find('[data-test="measure-verify"]')
    expect(verify.exists()).toBe(true)
    expect(verify.text()).toContain('每一条的比都是 2:1')
    expect(verify.text()).toContain('形状不变')
    // 面积倍数 = 边倍数² = 2² = 4
    expect(verify.text()).toContain('面积 = 8 → 32.00 格²')
    expect(verify.text()).toContain('×4 = （2/1）² 倍')
    // 独立复算：面积倍数 = (n/d)²
    expect(8 * (2 / 1) ** 2).toBe(32)
  })

  it('三角形按 1:2 缩小：三条对应边的比都是 0.5，面积 6 → 1.5 格²（= ×(1/2)²）', async () => {
    const w = mount(ScaleLab, { props: { lab: labOf('g6-c6-scale-shape'), values: { n: 1, d: 2, shape: 1 } } })
    const next = () => w.find('[data-test="measure-next"]')
    for (let i = 0; i < 3; i += 1) await next().trigger('click')

    const rows = w.findAll('[data-test="measure-table"] tbody tr')
    expect(rows).toHaveLength(3)
    expect(cells(rows[0]!)).toEqual(['底', '4', '2', '0.5'])
    expect(cells(rows[1]!)).toEqual(['高', '3', '1.5', '0.5'])
    expect(cells(rows[2]!)).toEqual(['斜边', '5', '2.5', '0.5'])
    expect(new Set(rows.map((r) => cells(r)[3])).size).toBe(1)

    const verify = w.find('[data-test="measure-verify"]').text()
    expect(verify).toContain('每一条的比都是 1:2')
    expect(verify).toContain('面积 = 6 → 1.50 格²')
    expect(verify).toContain('×0.25 = （1/2）² 倍')
    // 独立复算：面积倍数 = (1/2)²
    expect(6 * (1 / 2) ** 2).toBeCloseTo(1.5, 10)

    // 量完后再点「再量一遍」回到第 1 条边
    expect(next().text()).toContain('再量一遍')
    await next().trigger('click')
    expect(w.findAll('[data-test="measure-table"] tbody tr')).toHaveLength(1)
    expect(next().text()).toContain('量下一条对应边')
  })

  it('梯形按 4:1 放大：四条对应边（含 √5 的腰）比都相等，「清空」可复位', async () => {
    const w = mount(ScaleLab, { props: { lab: labOf('g6-c6-scale-shape'), values: { n: 4, d: 1, shape: 2 } } })
    const next = () => w.find('[data-test="measure-next"]')
    expect(w.find('[data-test="measure-reset"]').exists()).toBe(false)
    for (let i = 0; i < 4; i += 1) await next().trigger('click')

    const rows = w.findAll('[data-test="measure-table"] tbody tr')
    expect(rows).toHaveLength(4)
    expect(cells(rows[0]!)).toEqual(['上底', '2', '8', '4'])
    expect(cells(rows[1]!)).toEqual(['下底', '4', '16', '4'])
    expect(cells(rows[2]!)).toEqual(['左腰', '2.24', '8.94', '4'])
    expect(cells(rows[3]!)).toEqual(['右腰', '2.24', '8.94', '4'])
    expect(new Set(rows.map((r) => cells(r)[3])).size).toBe(1)
    // 面积倍数 = 4² = 16（梯形原面积 6 格²）
    expect(w.find('[data-test="measure-verify"]').text()).toContain('面积 = 6 → 96.00 格²')

    const reset = w.find('[data-test="measure-reset"]')
    expect(reset.exists()).toBe(true)
    await reset.trigger('click')
    expect(w.find('[data-test="measure-table"]').exists()).toBe(false)
    expect(w.find('[data-test="measure-verify"]').exists()).toBe(false)
    expect(w.text()).toContain('已量 0 / 4 条边')
  })
})

describe('g6-c7-coordinate · 按数对走一格', () => {
  it('向东只加第一个数、向北只加第二个数，数对逐个变化，座位高亮同步', async () => {
    const w = mount(PositionLab, { props: { lab: labOf('g6-c7-coordinate'), values: { col: 3, row: 4 } } })
    const log = () => w.find('[data-test="walk-log"]').text()
    expect(log()).toBe('（3，4）')
    expect(w.find('[data-test="walk-reset"]').exists()).toBe(false)

    // 向东走一格 → 只有第一个数 3 → 4，行仍是 4
    await w.find('[data-test="walk-east"]').trigger('click')
    expect(log()).toBe('（3，4） → （4，4）')
    expect(w.find('.res-line').text()).toContain('第 4 列第 4 行')
    expect(w.find('.res-line').text()).toContain('（4，4）')
    // 第 4 行第 4 列是 active；同一列的其他行是 col-hl，同一行的其他列是 row-hl
    let rows = w.findAll('.seat-row')
    expect(rows[3]!.findAll('.seat')[3]!.classes()).toContain('active')
    // 第 3 行第 4 列：只有列高亮（行不是 4）
    expect(rows[2]!.findAll('.seat')[3]!.classes()).toContain('col-hl')
    expect(rows[2]!.findAll('.seat')[3]!.classes()).not.toContain('row-hl')
    // 第 4 行第 1 列：只有行高亮（列不是 4）
    expect(rows[3]!.findAll('.seat')[0]!.classes()).toContain('row-hl')
    expect(rows[3]!.findAll('.seat')[0]!.classes()).not.toContain('col-hl')

    // 向北走一格 → 只有第二个数 4 → 5，列仍是 4
    await w.find('[data-test="walk-north"]').trigger('click')
    expect(log()).toBe('（3，4） → （4，4） → （4，5）')
    expect(w.find('.res-line').text()).toContain('第 4 列第 5 行')
    rows = w.findAll('.seat-row')
    expect(rows[4]!.findAll('.seat')[3]!.classes()).toContain('active')
    // 座位图里的「严军」跟着数对走
    expect(rows[4]!.findAll('.seat')[3]!.find('.seat-pin').exists()).toBe(true)

    // 回到起点
    const reset = w.find('[data-test="walk-reset"]')
    expect(reset.exists()).toBe(true)
    await reset.trigger('click')
    expect(log()).toBe('（3，4）')
    expect(w.find('[data-test="walk-reset"]').exists()).toBe(false)
    expect(w.find('.res-line').text()).toContain('（3，4）')
  })

  it('走到座位图边界（第 8 列 / 第 6 行）后按钮禁用，数对不再越界', async () => {
    const w = mount(PositionLab, { props: { lab: labOf('g6-c7-coordinate'), values: { col: 8, row: 6 } } })
    const east = w.find('[data-test="walk-east"]')
    const north = w.find('[data-test="walk-north"]')
    expect(east.element.hasAttribute('disabled')).toBe(true)
    expect(north.element.hasAttribute('disabled')).toBe(true)

    await east.trigger('click')
    await north.trigger('click')
    expect(w.find('[data-test="walk-log"]').text()).toBe('（8，6）')
    expect(w.find('.res-line').text()).toContain('第 8 列第 6 行')
    expect(w.find('[data-test="walk-reset"]').exists()).toBe(false)

    // 起点离边界还有空间时按钮可用
    const w2 = mount(PositionLab, { props: { lab: labOf('g6-c7-coordinate'), values: { col: 1, row: 1 } } })
    expect(w2.find('[data-test="walk-east"]').element.hasAttribute('disabled')).toBe(false)
    expect(w2.find('[data-test="walk-north"]').element.hasAttribute('disabled')).toBe(false)
    await w2.find('[data-test="walk-east"]').trigger('click')
    expect(w2.find('[data-test="walk-log"]').text()).toBe('（1，1） → （2，1）')
  })
})
