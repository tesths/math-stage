import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import { findLabById } from '@data'
import { fixedN, roundTo, toFixed2 } from '@/lib/engine/math'
import { computeLab } from '@/lib/labs/compute'

/**
 * 六年级 一 小数乘法和除法（二）：本轮新增的操作（task-8）
 * 1. mul-compare：乘数 0.99 / 1 / 1.01 三档一键对照（符号方向由参数算出）
 * 2. div-decimal：一步一步转化步进（同时 ×10^n、商不变），终点算式与 computeLab 一致
 * 3. mul-approx：看下一位（高亮保留位的下一位，判据文案正确）
 * 4. div-approx：单位换算链（千米/时 → 米/时 ÷ 60 分）＋ 看下一位
 * 5. mul-decimal：为什么积比第一个乘数小（乘数↔1 与 积↔第一个乘数 同屏 + 方格同步）
 */

/** UButton 在测试环境被替换为 <button>，按文字找按钮 */
function stepBtn(wrapper: VueWrapper, label: string) {
  const btn = wrapper.findAll('button').find((b) => b.text() === label)
  expect(btn, `找不到按钮「${label}」`).toBeTruthy()
  return btn!
}

const cmpOf = (x: number, y: number) => (x > y ? '>' : x < y ? '<' : '=')
const factorCmp = (b: number) => (b > 1 ? '>' : b < 1 ? '<' : '=')

describe('g6-c1-mul-compare：乘数三档（0.99 / 1 / 1.01）一键对照', () => {
  const lab = findLabById('g6-c1-mul-compare')!

  it('默认收起；展开后三行同屏，每行符号与积都由参数算出且关系成立', async () => {
    const base = 4.9
    const w = mount(DecimalLab, { props: { lab, values: { base, factor: 1.01 } } })
    expect(w.find('.mul-cmp-rows').exists()).toBe(false)
    expect(w.find('.mul-cmp-toggle').text()).toContain('三档一键对照')

    await w.find('.mul-cmp-toggle').trigger('click')
    const rows = w.findAll('.mul-cmp-row')
    expect(rows).toHaveLength(3)

    const baseR = roundTo(base, 4)
    for (const [i, f] of [0.99, 1, 1.01].entries()) {
      const sym = factorCmp(f)
      const prod = roundTo(baseR * f, 4)
      const row = rows[i]!
      expect(row.find('.mul-cmp-expr').text()).toBe(`${toFixed2(base)} × ${toFixed2(f)} = ${toFixed2(prod)}`)
      expect(row.find('.mul-cmp-sym').text()).toBe(sym)
      // 只断言「关系成立」，符号方向是算出来的而不是写死的
      const shown = Number(row.find('.mul-cmp-prod').text())
      const holds = sym === '>' ? shown > base : sym === '<' ? shown < base : shown === base
      expect(holds, `${shown} ${sym} ${base} 应当成立`).toBe(true)
      expect(row.text()).toContain(`积 ${sym} 第一个乘数`)
    }
    // 三档恰好覆盖三种方向
    expect(rows.map((r) => r.find('.mul-cmp-sym').text())).toEqual(['<', '=', '>'])
    expect(rows.map((r) => r.find('.mul-cmp-why').text())).toEqual([
      '（乘数 < 1，积变小）',
      '（乘数 = 1，积不变）',
      '（乘数 > 1，积变大）',
    ])

    // 再点一次收起
    await w.find('.mul-cmp-toggle').trigger('click')
    expect(w.find('.mul-cmp-rows').exists()).toBe(false)
    expect(w.find('.mul-cmp-toggle').text()).toContain('三档一键对照')
  })

  it('换一个第一个乘数（0.5）：三行站在同一条「乘数 ? 1」的规律上', async () => {
    const base = 0.5
    const w = mount(DecimalLab, { props: { lab, values: { base, factor: 0.99 } } })
    await w.find('.mul-cmp-toggle').trigger('click')
    const rows = w.findAll('.mul-cmp-row')
    expect(rows.map((r) => r.find('.mul-cmp-sym').text())).toEqual(['<', '=', '>'])
    const baseR = roundTo(base, 4)
    const prods = [0.99, 1, 1.01].map((f) => roundTo(baseR * f, 4))
    expect(rows.map((r) => Number(r.find('.mul-cmp-prod').text()))).toEqual(prods.map((p) => Number(toFixed2(p))))
    expect(prods[0]!).toBeLessThan(base)
    expect(prods[1]!).toBe(base)
    expect(prods[2]!).toBeGreaterThan(base)
  })
})

describe('g6-c1-div-decimal：一步一步转化（同时 ×10^n、商不变）', () => {
  const lab = findLabById('g6-c1-div-decimal')!
  const cases = [
    { sel: 0, d: 0.6, v: 0.3, i1: 6, i2: 3, q: 2, scale: 10, shift: 1 },
    { sel: 1, d: 1.2, v: 0.24, i1: 120, i2: 24, q: 5, scale: 100, shift: 2 },
    { sel: 2, d: 0.34, v: 0.017, i1: 340, i2: 17, q: 20, scale: 1000, shift: 3 },
  ]

  for (const c of cases) {
    it(`sel=${c.sel}（${c.d} ÷ ${c.v}）：三步走到 ${c.i1} ÷ ${c.i2} = ${c.q}，与 computeLab 一致`, async () => {
      const w = mount(DecimalLab, { props: { lab, values: { sel: c.sel } } })
      expect(w.find('.div-step-count').text()).toContain('第 1 / 3 步')
      expect(w.findAll('.div-step')).toHaveLength(1)
      expect(w.findAll('.div-step-detail')[0]!.text()).toContain(`${toFixed2(c.d)} ÷ ${toFixed2(c.v)}`)
      expect(stepBtn(w, '上一步').attributes('disabled')).toBeDefined()

      await stepBtn(w, '下一步').trigger('click')
      expect(w.find('.div-step-count').text()).toContain('第 2 / 3 步')
      expect(w.findAll('.div-step')).toHaveLength(2)
      const scaleDetail = w.findAll('.div-step-detail')[1]!.text()
      expect(scaleDetail).toContain(`× ${c.scale}`)
      expect(scaleDetail).toContain(`小数点同时向右移 ${c.shift} 位`)
      expect(scaleDetail).toContain('商不变')

      await stepBtn(w, '下一步').trigger('click')
      expect(w.find('.div-step-count').text()).toContain('第 3 / 3 步')
      expect(w.findAll('.div-step')).toHaveLength(3)
      expect(stepBtn(w, '下一步').attributes('disabled')).toBeDefined()

      // 终点算式必须与 computeLab('div-decimal', …) 的整数除法步骤逐字一致
      const api = computeLab('div-decimal', { sel: c.sel })
      expect(api.value).toBe(c.q)
      const last = w.findAll('.div-step-detail')[2]!.text()
      expect(last).toContain(api.steps[1]!.result)
      expect(api.steps[1]!.result).toBe(`${c.i1} ÷ ${c.i2} = ${c.q}`)
      expect(last).toContain('商不变')
      expect(w.find('.div-step.current .div-step-title').text()).toContain('第 3 步')

      // 可以回退再看「同时 ×10^n」那一步
      await stepBtn(w, '上一步').trigger('click')
      expect(w.find('.div-step-count').text()).toContain('第 2 / 3 步')
      expect(w.findAll('.div-step')).toHaveLength(2)
      expect(stepBtn(w, '上一步').attributes('disabled')).toBeUndefined()
    })
  }
})

describe('g6-c1-mul-approx：看下一位（高亮下一位，说明舍 / 入）', () => {
  const lab = findLabById('g6-c1-mul-approx')!

  it('0.7 × 0.5 保留一位：下一位是 5 → 入，0.35 的半值取 0.4（不走二进制 toFixed）', async () => {
    const values = { price: 0.7, count: 0.5, digits: 1 }
    const w = mount(DecimalLab, { props: { lab, values } })
    expect(w.find('.next-digit-box').exists()).toBe(false)
    await w.find('.next-digit-toggle').trigger('click')

    const exact = roundTo(values.price * values.count, 6)
    const shown = fixedN(exact, values.digits)
    expect(shown).toBe('0.4')
    expect(w.find('.keep-digit').text()).toBe('0.3')
    expect(w.find('.next-digit').text()).toBe('5')
    expect(w.find('.next-decision').text()).toContain('≥ 5')
    expect(w.find('.next-decision').text()).toContain('加 1（入）')
    expect(w.find('.approx-final').text()).toBe(shown)
    expect(w.find('.approx-result').text()).toContain(shown)

    await w.find('.next-digit-toggle').trigger('click')
    expect(w.find('.next-digit-box').exists()).toBe(false)
  })

  it('6.25 × 1.5 保留一位：精确积 9.375，下一位是 7（不是 fixedN(exact,2) 的末位 8）→ 9.4', async () => {
    const w = mount(DecimalLab, { props: { lab, values: { price: 6.25, count: 1.5, digits: 1 } } })
    await w.find('.next-digit-toggle').trigger('click')
    const exact = roundTo(6.25 * 1.5, 6)
    expect(exact).toBe(9.375)
    expect(w.find('.next-digit').text()).toBe('7')
    // 若先把精确积四舍五入到两位再取末位，会误显示 8
    expect(fixedN(exact, 2).slice(-1)).toBe('8')
    expect(w.find('.next-digit').text()).not.toBe(fixedN(exact, 2).slice(-1))
    expect(w.find('.keep-digit').text()).toBe('9.3')
    expect(w.find('.next-decision').text()).toContain('≥ 5')
    expect(w.find('.approx-final').text()).toBe(fixedN(exact, 1))
    expect(w.find('.approx-final').text()).toBe('9.4')
    // 精确积显示去掉补零：9.375 而不是 9.375000
    expect(w.find('.next-digit-box').text()).toContain('= 9.375 ≈')
    expect(w.find('.next-digit-box').text()).not.toContain('9.375000')
  })

  it('1.5 × 1.5 保留两位：下一位补 0 → 舍，显示 2.25', async () => {
    const w = mount(DecimalLab, { props: { lab, values: { price: 1.5, count: 1.5, digits: 2 } } })
    await w.find('.next-digit-toggle').trigger('click')
    const exact = roundTo(1.5 * 1.5, 6)
    expect(exact).toBe(2.25)
    expect(w.find('.next-digit').text()).toBe('0')
    expect(w.find('.keep-digit').text()).toBe('2.25')
    expect(w.find('.next-decision').text()).toContain('< 5')
    expect(w.find('.next-decision').text()).toContain('不变（舍）')
    expect(w.find('.approx-final').text()).toBe('2.25')
  })

  it('2 × 1 = 2 保留一位：整数没有小数位，下一位按 0 处理（舍）', async () => {
    const w = mount(DecimalLab, { props: { lab, values: { price: 2, count: 1, digits: 1 } } })
    await w.find('.next-digit-toggle').trigger('click')
    expect(w.find('.keep-digit').text()).toBe('2.0')
    expect(w.find('.next-digit').text()).toBe('0')
    expect(w.find('.next-decision').text()).toContain('< 5')
    expect(w.find('.approx-final').text()).toBe('2.0')
  })
})

describe('g6-c1-div-approx：单位换算链（千米/时 → 米/时 ÷ 60 分）＋ 看下一位', () => {
  const lab = findLabById('g6-c1-div-approx')!

  /** 独立复算：把「多算一位」的商按整数长除截断到三位小数 */
  function trunc3(v: number): string {
    const t = Math.trunc(v * 1000) / 1000
    return String(t)
  }

  it('40 千米/时：40 千米 = 40000 米 → 40000 米/时 ÷ 60 分 ≈ 666.67 米/分', () => {
    const speed = 40
    const mph = speed * 1000
    const w = mount(DecimalLab, { props: { lab, values: { speed } } })

    const steps = w.findAll('.div-conv-step')
    expect(steps).toHaveLength(3)
    expect(steps[0]!.text()).toContain(`${speed} 千米 = ${speed} × 1000 = ${mph} 米`)
    expect(steps[0]!.text()).toContain(`${mph} 米/时`)
    expect(steps[1]!.text()).toContain('1 时 = 60 分')
    expect(steps[1]!.text()).toContain(`${mph} 米 ÷ 60 分`)
    expect(steps[2]!.text()).toContain(`${mph} ÷ 60`)
    // 换算链每一步数值正确
    expect(mph).toBe(40000)
    expect(steps[2]!.text()).toContain(`${trunc3(mph / 60)}…`)

    // 看下一位：截断到三位小数的判定位
    const judge = trunc3(mph / 60).split('.')[1]!.slice(2, 3)
    expect(judge).toBe('6')
    expect(w.find('.next-digit').text()).toBe(judge)
    expect(w.find('.next-decision').text()).toContain('≥ 5')
    expect(w.find('.next-decision').text()).toContain('进 1')

    // 结果 ≈ 666.67 米/分，且与 fixedN(商, 2) 一致
    const shown = w.find('.div-approx-final').text()
    expect(shown).toBe(fixedN(mph / 60, 2))
    expect(shown).toBe('666.67')
    expect(Math.abs(Number(shown) - mph / 60)).toBeLessThan(0.005)
    expect(w.find('.approx-result').text()).toContain('666.67')
    expect(w.find('.round-flow').text()).toContain('判定位 6')
  })

  it('35 千米/时：判定位 3 < 5 → 直接舍去，583.33 米/分', () => {
    const speed = 35
    const mph = speed * 1000
    const w = mount(DecimalLab, { props: { lab, values: { speed } } })
    const judge = trunc3(mph / 60).split('.')[1]!.slice(2, 3)
    expect(judge).toBe('3')
    expect(w.find('.next-digit').text()).toBe('3')
    expect(w.find('.next-decision').text()).toContain('< 5')
    expect(w.find('.next-decision').text()).toContain('舍去')
    expect(w.find('.round-flow').text()).toContain('第三位 < 5，直接舍去')
    expect(w.find('.div-approx-final').text()).toBe(fixedN(mph / 60, 2))
    expect(w.find('.div-approx-final').text()).toBe('583.33')
  })
})

describe('g6-c1-mul-decimal：为什么积比第一个乘数小（同屏对照 + 方格同步）', () => {
  const lab = findLabById('g6-c1-mul-decimal')!

  it('0.6 × 0.4：乘数 < 1、积 < 第一个乘数，格数 / 算式 / 积三者自洽', () => {
    const a = 0.6
    const b = 0.4
    const cols = Math.round(a * 10)
    const rows = Math.round(b * 10)
    const cells = cols * rows
    const w = mount(DecimalLab, { props: { lab, values: { a, b } } })

    expect(w.find('.grid-sync').text()).toContain(`${cols} 列 × ${rows} 行 = ${cells} 个格`)
    expect(w.find('.grid-sync').text()).toContain(`${cols}/10 × ${rows}/10 = ${cells}/100`)
    expect(w.findAll('.grid-cell.filled')).toHaveLength(cells)

    const ops = w.findAll('.why-op').map((o) => o.text())
    expect(ops).toEqual([factorCmp(b), cmpOf(a * b, a)])
    expect(ops).toEqual(['<', '<'])
    expect(w.find('.why-line').text().replace(/\s+/g, ' ')).toContain(`乘数 ${toFixed2(b)} < 1`)
    expect(w.find('.why-line').text().replace(/\s+/g, ' ')).toContain(`积 ${toFixed2(a * b)} < 第一个乘数 ${toFixed2(a)}`)
    expect(w.find('.why-prod').text()).toBe(toFixed2(a * b))
    // 三者互相自洽：积 = 格数 ÷ 100 = a × b
    const shown = Number(w.find('.sync-prod').text())
    expect(shown).toBeCloseTo(cells / 100, 10)
    expect(shown).toBeCloseTo(a * b, 10)
    expect(w.text()).toContain('所以积比 0.6 小')
  })

  it('0.3 × 0.5：15 个格、0.15，三者同步且互相自洽', () => {
    const a = 0.3
    const b = 0.5
    const cols = Math.round(a * 10)
    const rows = Math.round(b * 10)
    const cells = cols * rows
    const w = mount(DecimalLab, { props: { lab, values: { a, b } } })

    expect(cells).toBe(15)
    expect(w.findAll('.grid-cell.filled')).toHaveLength(cells)
    expect(w.find('.grid-sync').text()).toContain(`${cols} 列 × ${rows} 行 = ${cells} 个格`)
    expect(w.find('.grid-sync').text()).toContain(`${cells}/100`)
    expect(w.find('.sync-prod').text()).toBe('0.15')
    expect(w.find('.why-prod').text()).toBe(toFixed2(a * b))
    expect(Number(w.find('.sync-prod').text())).toBeCloseTo(cells / 100, 10)
    expect(w.findAll('.why-op').map((o) => o.text())).toEqual(['<', '<'])
  })

  it('乘数 = 1 与乘数 > 1 两档：符号与说理同步切换（滑块范围外的防御分支）', () => {
    const w1 = mount(DecimalLab, { props: { lab, values: { a: 0.6, b: 1 } } })
    expect(w1.findAll('.why-op').map((o) => o.text())).toEqual(['=', '='])
    expect(w1.text()).toContain('乘数正好是 1')
    expect(w1.find('.why-prod').text()).toBe('0.6')

    const w2 = mount(DecimalLab, { props: { lab, values: { a: 0.6, b: 1.2 } } })
    expect(w2.findAll('.why-op').map((o) => o.text())).toEqual(['>', '>'])
    expect(w2.text()).toContain('取得比 1 个 0.6 还多')
    expect(w2.find('.grid-sync').text()).toContain('72/100')
    expect(w2.find('.sync-prod').text()).toBe('0.72')
  })
})
