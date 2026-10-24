/**
 * task-10 · g6 五 圆：c5 剩余 5 个例题 Lab 的新增可操作环节。
 *
 * 覆盖：
 * 1. `g6-c5-circle-feature`「多画几条半径」——半径条数随操作增加、各条长度相等、d = 2r
 * 2. `g6-c5-sector`「对折成四分之一」——占比 1/4、圆心角 90°
 * 3. `g6-c5-circumference`「不同直径对照表」——每组 C ÷ d 与 π 容差内相等
 * 4. `g6-c5-annulus`「外圆减内圆」扣减步进——环 = 外圆 − 内圆，且与 computeLab 一致
 * 5. `g6-c5-circle-composite` 分块高亮 + 累加步进——各部分之和 = computeLab 结果
 *
 * 圆的几何量一律用独立算法复算（2πR / πR² / π(R²−r²) / 边长²+πr²÷2），
 * 不复用组件里的变量；`circle-lab.audit.test.ts` 锁定的既有行为另有一套 18 例回归。
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CircleLab from '@/components/labs/CircleLab.vue'
import { findLabById } from '@data'
import { computeLab } from '@/lib/labs/compute'
import type { LabDef } from '@data/schema/lab'

function labOf(id: string): LabDef {
  const lab = findLabById(id)
  if (!lab) throw new Error(`找不到 Lab：${id}`)
  return lab
}

describe('g6-c5-circle-feature · 多画几条半径', () => {
  it('每按一次多画一条半径并标注长度，画满 6 条给出「无数条、都相等」+ d = 2r', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circle-feature'), values: { r: 4 } } })
    // 既有 3 条 .line-radius 语义不变（审计 C1-1 锁定 3 条）
    expect(w.findAll('line.line-radius')).toHaveLength(3)
    expect(w.findAll('line.line-radius-extra')).toHaveLength(0)
    expect(w.find('[data-test="radius-done"]').exists()).toBe(false)

    const btn = () => w.find('[data-test="draw-radius"]')
    expect(btn().text()).toContain('已画 3 条')
    for (const k of [1, 2, 3, 4, 5, 6]) {
      await btn().trigger('click')
      expect(w.findAll('line.line-radius-extra')).toHaveLength(k)
      expect(w.text()).toContain(`已画 ${3 + k} 条`)
    }
    // 每条新增半径都标注长度，且各条长度文本完全相等
    const lens = w.findAll('text.radius-len').map((t) => t.text())
    expect(lens).toHaveLength(6)
    expect(new Set(lens).size).toBe(1)
    expect(lens[0]).toBe('4 厘米')

    // 完成态：无数条 + 都相等 + d = 2r
    const done = w.find('[data-test="radius-done"]')
    expect(done.exists()).toBe(true)
    expect(done.text()).toContain('有无数条')
    expect(done.text()).toContain('全部相等')
    expect(done.text()).toContain('每条都是 4 厘米')
    expect(done.text()).toContain('d = 2r = 2 × 4 = 8 厘米')
    // 独立复算：d = 2r
    const m = done.text().match(/2 × (\d+) = (\d+) 厘米/)
    expect(m).toBeTruthy()
    expect(Number(m![2])).toBe(2 * Number(m![1]))

    // 再按一次重置回 3 条
    expect(btn().text()).toContain('再画一遍')
    await btn().trigger('click')
    expect(w.findAll('line.line-radius-extra')).toHaveLength(0)
    expect(w.find('[data-test="radius-done"]').exists()).toBe(false)
    expect(btn().text()).toContain('再画一条半径')
  })
})

describe('g6-c5-sector · 对折成四分之一', () => {
  it('对折后显示四分之一扇形：占比 1/4、圆心角 90°，取消后恢复滑块角度', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-sector'), values: { angle: 240, r: 5 } } })
    expect(w.find('[data-test="quarter-line"]').exists()).toBe(false)
    expect(w.findAll('line.fold-line')).toHaveLength(0)
    expect(w.find('.res-line').text()).toContain('240 ÷ 360')

    await w.find('[data-test="fold-quarter"]').trigger('click')
    // 两条对折线（竖直 + 水平直径）把圆平均分成 4 份
    expect(w.findAll('line.fold-line')).toHaveLength(2)
    for (const l of w.findAll('line.fold-line')) {
      // 每条都是过圆心的直径：中点为圆心 (170, 120)
      expect((Number(l.attributes('x1')) + Number(l.attributes('x2'))) / 2).toBeCloseTo(170, 5)
      expect((Number(l.attributes('y1')) + Number(l.attributes('y2'))) / 2).toBeCloseTo(120, 5)
    }
    const line = w.find('.res-line').text()
    expect(line).toContain('90 ÷ 360')
    expect(line).toContain('1/4')
    const q = w.find('[data-test="quarter-line"]')
    expect(q.exists()).toBe(true)
    expect(q.text()).toContain('平均分成 4 份')
    expect(q.text()).toContain('90°')
    expect(q.text()).toContain('1/4')
    // 独立复算：四分之一圆的圆心角 = 360 ÷ 4，占比 = 90 ÷ 360
    expect(360 / 4).toBe(90)
    expect(90 / 360).toBe(0.25)

    // 取消对折 → 回到滑块角度
    expect(w.find('[data-test="fold-quarter"]').text()).toContain('取消对折')
    await w.find('[data-test="fold-quarter"]').trigger('click')
    expect(w.find('.res-line').text()).toContain('240 ÷ 360')
    expect(w.find('[data-test="quarter-line"]').exists()).toBe(false)
    expect(w.findAll('line.fold-line')).toHaveLength(0)
  })
})

describe('g6-c5-circumference · 不同直径对照表', () => {
  it('至少 3 组直径下 C ÷ d 都等于 π（独立用 2πR ÷ 2R 复算），并说明「都是 3 倍多一些」', () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circumference'), values: { r: 14 } } })
    const table = w.find('[data-test="diameter-table"]')
    expect(table.exists()).toBe(true)
    expect(table.findAll('thead th').map((th) => th.text())).toEqual(['直径 d / 米', '周长 C / 米', 'C ÷ d', '比 3 多'])

    const rows = table.findAll('tbody tr')
    expect(rows.length).toBeGreaterThanOrEqual(3)
    const data = rows.map((r) => r.findAll('td').map((td) => td.text()))
    expect(data.map((d) => d[0])).toEqual(['1', '2', '4', '8'])

    for (const [dText, cText, ratioText, overText] of data) {
      const d = Number(dText)
      // 独立复算：R = d/2，C = 2πR，因此 C ÷ d = 2πR ÷ 2R = π
      const R = d / 2
      const cTrue = 2 * Math.PI * R
      const ratioTrue = cTrue / d
      // 容差 0.02：课本按 π ≈ 3.14 取周长，与真 π 的差最多 d×(π−3.14) ≤ 8×0.0016 ≈ 0.013
      expect(Math.abs(Number(cText) - cTrue)).toBeLessThan(0.02)
      expect(Math.abs(Number(ratioText) - ratioTrue)).toBeLessThan(0.005)
      expect(Number(ratioText)).toBeGreaterThan(3) // 都是 3 倍多一些
      expect(Math.abs(Number(overText) - (ratioTrue - 3))).toBeLessThan(0.005)
      expect(Number(ratioText)).toBeCloseTo(Math.PI, 2)
    }
    expect(w.find('[data-test="diameter-note"]').text()).toContain('都是 3 倍多一些')
    // 新表与原有绕绳测量表并存（后者被审计 C3-3 锁定为 3 行）
    expect(w.findAll('.measure-table')).toHaveLength(2)
    expect(w.findAll('.measure-table')[0]!.findAll('tbody tr')).toHaveLength(3)
  })
})

describe('g6-c5-annulus · 外圆减内圆扣减步进', () => {
  it('三步扣减：外圆 → 挖内圆 → 剩环，环面积 = 外圆 − 内圆且与 computeLab 一致', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-annulus'), values: { R: 10, r: 6 } } })
    const btn = () => w.find('[data-test="ring-step"]')
    expect(w.findAll('[data-test="deduct-line"]')).toHaveLength(0)
    expect(w.find('[data-test="ring-done"]').exists()).toBe(false)

    await btn().trigger('click')
    let lines = w.findAll('[data-test="deduct-line"]')
    expect(lines).toHaveLength(1)
    expect(lines[0]!.text()).toContain('① 画外圆')
    expect(lines[0]!.text()).toContain('314.00')

    await btn().trigger('click')
    lines = w.findAll('[data-test="deduct-line"]')
    expect(lines).toHaveLength(2)
    expect(lines[1]!.text()).toContain('② 挖掉内圆')
    expect(lines[1]!.text()).toContain('113.04')
    expect(w.find('[data-test="ring-done"]').exists()).toBe(false)

    await btn().trigger('click')
    lines = w.findAll('[data-test="deduct-line"]')
    expect(lines).toHaveLength(3)
    expect(lines[2]!.text()).toContain('③ 剩下环')
    expect(lines[2]!.text()).toContain('π(R² − r²)')
    expect(lines[2]!.text()).toContain('200.96')

    // 独立复算：环面积 = π(R²−r²) = π×(100−36) = 64π
    // 课本按 π ≈ 3.14 取值：3.14 × 64 = 200.96；真 π 为 201.062，差 0.10 完全来自 π 的近似
    expect(3.14 * (10 * 10 - 6 * 6)).toBeCloseTo(200.96, 2)
    const trueRing = Math.PI * 10 * 10 - Math.PI * 6 * 6
    expect(Math.abs(trueRing - 200.96)).toBeLessThan(0.11)
    // 同一 π 取值下，环面积严格等于「外圆 − 内圆」
    expect(314 - 113.04).toBeCloseTo(200.96, 5)
    const done = w.find('[data-test="ring-done"]').text()
    expect(done).toContain('314.00 − 113.04 = 200.96')
    expect(done).toContain('R² − r² = 64')
    // 与 computeLab 一致
    const computed = computeLab('annulus', { R: 10, r: 6 })
    expect(computed.value).toBeCloseTo(200.96, 2)
    expect(done).toContain(`${computed.value}`)

    // 重看一遍 → 清空
    expect(btn().text()).toContain('重看一遍')
    await btn().trigger('click')
    expect(w.findAll('[data-test="deduct-line"]')).toHaveLength(0)
    expect(w.find('[data-test="ring-done"]').exists()).toBe(false)
  })

  it('R ≤ r 时只给提示，不渲染扣减步进、不静默夹取', () => {
    const bad = mount(CircleLab, { props: { lab: labOf('g6-c5-annulus'), values: { R: 5, r: 8 } } })
    expect(bad.text()).toContain('注意')
    expect(bad.find('[data-test="ring-step"]').exists()).toBe(false)
    expect(bad.find('[data-test="ring-done"]').exists()).toBe(false)
    expect(bad.findAll('[data-test="deduct-line"]')).toHaveLength(0)
    expect(bad.text()).not.toContain('平方厘米')
    expect(computeLab('annulus', { R: 5, r: 8 }).value).toBe(0)
  })
})

describe('g6-c5-circle-composite · 分块高亮 + 累加步进', () => {
  it('先高亮正方形、再高亮半圆，最后两部分相加 = computeLab 的总面积', async () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circle-composite'), values: { side: 1.8 } } })
    const btn = () => w.find('[data-test="comp-step"]')
    expect(w.findAll('[data-test="comp-chip"]')).toHaveLength(2)
    expect(w.find('[data-test="comp-done"]').exists()).toBe(false)
    expect(btn().text()).toContain('第 1 步：先算正方形')
    // 初始：两块都不高亮
    expect(w.findAll('[data-test="comp-chip"].on')).toHaveLength(0)
    expect(w.find('rect').classes()).not.toContain('part-hl')
    expect(w.find('path').classes()).not.toContain('part-hl')

    await btn().trigger('click')
    expect(w.find('rect').classes()).toContain('part-hl')
    expect(w.find('path').classes()).not.toContain('part-hl')
    expect(w.findAll('[data-test="comp-chip"].on')).toHaveLength(1)
    expect(btn().text()).toContain('第 2 步：再算半圆')

    await btn().trigger('click')
    expect(w.find('path').classes()).toContain('part-hl')
    expect(w.find('rect').classes()).not.toContain('part-hl')
    expect(w.findAll('[data-test="comp-chip"].on')).toHaveLength(2)
    expect(btn().text()).toContain('第 3 步：两部分相加')

    await btn().trigger('click')
    const done = w.find('[data-test="comp-done"]').text()
    expect(done).toContain('3.24 + 1.27 = 4.51 平方米')
    expect(done).toContain('半圆直径 = 正方形边长 = 1.8 米')
    // 独立复算：1.8² + π×(1.8÷2)²÷2
    expect(1.8 * 1.8 + (3.14 * 0.9 * 0.9) / 2).toBeCloseTo(4.51, 2)
    // 与 computeLab（默认 1.8 米）一致
    const computed = computeLab('circle-composite', { side: 1.8 })
    expect(computed.value).toBeCloseTo(4.51, 2)
    expect(done).toContain(`${computed.value}`)

    // 重看一遍 → 复位
    expect(btn().text()).toContain('重看一遍')
    await btn().trigger('click')
    expect(w.find('[data-test="comp-done"]').exists()).toBe(false)
    expect(w.findAll('[data-test="comp-chip"].on')).toHaveLength(0)
  })

  it('空参数时边长取默认 1.8 米，累加结果仍是 computeLab 的 4.51', () => {
    const w = mount(CircleLab, { props: { lab: labOf('g6-c5-circle-composite'), values: {} } })
    expect(w.find('.res-line').text()).toContain('4.51')
    expect(w.text()).toContain('正方形 1.8 × 1.8 = 3.24')
    expect(computeLab('circle-composite', { side: 1.8 }).value).toBeCloseTo(4.51, 2)
  })
})
