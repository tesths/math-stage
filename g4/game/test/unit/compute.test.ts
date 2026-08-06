import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { allLabs } from '@data'
import { digitsOf, factorsOf, formatBig, roundTo, toFixed2 } from '@/lib/engine/math'

describe('math 工具', () => {
  it('digitsOf 拆分整数', () => {
    expect(digitsOf(156)).toEqual([1, 5, 6])
    expect(digitsOf(0)).toEqual([0])
  })

  it('roundTo 四舍五入到万位', () => {
    expect(roundTo(384204, 4)).toBe(380000)
    expect(roundTo(386685, 4)).toBe(390000)
  })

  it('formatBig 千分位', () => {
    expect(formatBig(1560000)).toBe('1,560,000')
  })

  it('toFixed2 去除多余 0', () => {
    expect(toFixed2(4)).toBe('4')
    expect(toFixed2(3.5)).toBe('3.5')
  })

  it('factorsOf', () => {
    expect(factorsOf(24)).toEqual([1, 2, 3, 4, 6, 8, 12, 24])
  })
})

describe('computeLab 各 kind', () => {
  it('div-oral：60 ÷ 20 = 3', () => {
    const r = computeLab('div-oral', { base: 60, div: 20 })
    expect(r.value).toBe(3)
    expect(r.text).toContain('60')
  })

  it('div-try：96 ÷ 24 = 4', () => {
    const r = computeLab('div-try', { num: 96, div: 24 })
    expect(r.value).toBe(4)
    expect(r.text).toContain('96')
  })

  it('div-try 有余数', () => {
    const r = computeLab('div-try', { num: 100, div: 24 })
    expect(r.value).toBe(4)
    expect(r.text).toContain('…… 4')
  })

  it('div-pen：156 ÷ 12 = 13', () => {
    const r = computeLab('div-pen', { num: 156, div: 12 })
    expect(r.value).toBe(13)
    expect(r.steps[0]!.expr).toContain('两位数')
  })

  it('div-route：224 ÷ 2 ÷ 4 = 28', () => {
    const r = computeLab('div-route', { total: 224, shelf: 2, floor: 4 })
    expect(r.value).toBe(28)
    expect(r.text).toContain('28')
  })

  it('peri-rect：(12+8)×2 = 40', () => {
    const r = computeLab('peri-rect', { a: 12, b: 8 })
    expect(r.value).toBe(40)
    expect(r.text).toContain('40')
  })

  it('peri-square：6×4 = 24', () => {
    const r = computeLab('peri-square', { a: 6 })
    expect(r.value).toBe(24)
  })

  it('area-grid：8×5 = 40 平方厘米', () => {
    const r = computeLab('area-grid', { a: 8, b: 5 })
    expect(r.value).toBe(40)
  })

  it('area-rect：8×5 = 40', () => {
    const r = computeLab('area-rect', { a: 8, b: 5 })
    expect(r.value).toBe(40)
  })

  it('area-square：6×6 = 36', () => {
    const r = computeLab('area-square', { a: 6 })
    expect(r.value).toBe(36)
  })

  it('area-unit：300 平方厘米 = 3 平方分米', () => {
    const r = computeLab('area-unit', { v: 300, dir: 0 })
    expect(r.value).toBe(3)
    expect(r.text).toContain('3 平方分米')
  })

  it('area-unit：3 平方分米 = 300 平方厘米', () => {
    const r = computeLab('area-unit', { v: 3, dir: 1 })
    expect(r.value).toBe(300)
  })

  it('peri-area-change：36 个小正方形 4 行', () => {
    const r = computeLab('peri-area-change', { rows: 4 })
    expect(r.text).toContain('36')
    expect(r.text).toContain('周长 26')
    expect(r.conclusion).toContain('周长越短')
    expect(r.conclusion).toContain('24 厘米')
  })

  it('mul-meaning：4×3 = 12', () => {
    const r = computeLab('mul-meaning', { groups: 3, per: 4 })
    expect(r.value).toBe(12)
  })

  it('mul-total：8×3 = 24 元', () => {
    const r = computeLab('mul-total', { price: 8, count: 3 })
    expect(r.value).toBe(24)
  })

  it('mul-distance：70×4 = 280 米', () => {
    const r = computeLab('mul-distance', { v: 70, t: 4 })
    expect(r.value).toBe(280)
  })

  it('mul-solve：6×5 = 30 元', () => {
    const r = computeLab('mul-solve', { price: 6, count: 5 })
    expect(r.value).toBe(30)
  })

  it('travel-plan：3 人 2 天费用合计', () => {
    const r = computeLab('travel-plan', { person: 3, transport: 400, ticket: 150, hotel: 300, days: 2 })
    expect(r.value).toBe(400 * 3 + 150 * 3 + 300 * 2 + 80 * 3 * 2)
  })

  it('mix-three：18+18×2−6 = 48', () => {
    const r = computeLab('mix-three', { calligraphy: 18, times: 2, less: 6 })
    expect(r.value).toBe(48)
  })

  it('mix-bracket：（600−126×4）÷48 = 2', () => {
    const r = computeLab('mix-bracket', { money: 600, plane: 126, pcount: 4, ship: 48 })
    expect(r.value).toBe(2)
  })

  it('mix-segment：（20+8）×3 = 84', () => {
    const r = computeLab('mix-segment', { pear: 20, less: 12, times: 3 })
    expect(r.value).toBe(84)
  })

  it('num-count：10000 是 1 个万', () => {
    const r = computeLab('num-count', { v: 10000 })
    expect(r.text).toBe('10,000')
    expect(r.conclusion).toContain('万')
  })

  it('num-place：3 在第 4 位是千位', () => {
    const r = computeLab('num-place', { digit: 3, place: 4 })
    expect(r.text).toContain('千位')
    expect(r.conclusion).toContain('3 个千')
  })

  it('num-multidigit：1600 万', () => {
    const r = computeLab('num-multidigit', { wan: 1600, yi: 0 })
    expect(r.value).toBe(16000000)
  })

  it('num-approx：384204 ≈ 38 万', () => {
    const r = computeLab('num-approx', { v: 384204 })
    expect(r.text).toContain('38 万')
  })

  it('num-idcode：2016年2月18日 → 20160218', () => {
    const r = computeLab('num-idcode', { year: 2016, month: 2, day: 18 })
    expect(r.text).toContain('20160218')
  })

  it('measure-story：5 尺 ≈ 115 厘米', () => {
    const r = computeLab('measure-story', { chi: 5, sheng: 3, jin: 4 })
    expect(r.text).toContain('115 厘米')
  })

  it('big-mul：128×16 = 2048', () => {
    const r = computeLab('big-mul', { num: 128, mult: 16 })
    expect(r.value).toBe(2048)
  })

  it('big-calc：35×35 = 1225', () => {
    const r = computeLab('big-calc', { tens: 3 })
    expect(r.value).toBe(1225)
    expect(r.text).toContain('1225')
  })

  it('big-1yi：1 亿张纸摞起来高于珠峰', () => {
    const r = computeLab('big-1yi', { sheets: 100000000, thick: 1 })
    expect(r.value).toBe(10000)
    expect(r.conclusion).toContain('还高')
  })
})

describe('computeLab 分支覆盖', () => {
  it('参数缺失时走 ?? 默认值兜底分支（全覆盖）', () => {
    for (const l of allLabs) {
      expect(() => computeLab(l.kind, {})).not.toThrow()
    }
    expect(computeLab('peri-rect', {}).value).toBe(40)
    expect(computeLab('num-count', {}).text).toBe('10,000')
    expect(computeLab('big-calc', {}).value).toBe(1225)
  })

  it('num-count 各数量级单位', () => {
    expect(computeLab('num-count', { v: 100 }).conclusion).toContain('百')
    expect(computeLab('num-count', { v: 1000 }).conclusion).toContain('千')
    expect(computeLab('num-count', { v: 100000 }).conclusion).toContain('十万')
    expect(computeLab('num-count', { v: 100000000 }).conclusion).toContain('亿')
  })

  it('num-multidigit 含亿级', () => {
    const r = computeLab('num-multidigit', { wan: 300, yi: 12 })
    expect(r.value).toBe(1203000000)
    expect(r.conclusion).toContain('12 个亿')
  })

  it('big-1yi 低于珠峰时结论', () => {
    const r = computeLab('big-1yi', { sheets: 10000, thick: 1 })
    expect(r.conclusion).toContain('矮')
  })
})
