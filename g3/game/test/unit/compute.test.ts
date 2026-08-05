import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'

describe('computeLab · 混合运算与数量关系', () => {
  it('mix-calc：除加（买钢笔）', () => {
    const r = computeLab('mix-calc', { box: 40, each: 5, stapler: 12 })
    expect(r.value).toBe(20)
    expect(r.text).toContain('20')
    expect(r.steps.length).toBeGreaterThanOrEqual(2)
  })

  it('mix-calc：乘加（买笔记本）', () => {
    const r = computeLab('mix-calc', { price: 5, count: 3, bag: 50 })
    expect(r.value).toBe(65)
    expect(r.text).toContain('65')
  })

  it('bracket：运算顺序对比', () => {
    const r = computeLab('bracket', { a: 12, b: 8, c: 5 })
    expect(r.value).toBe(48) // 100 - 52
    expect(r.text).toContain('52')
    expect(r.text).toContain('100')
  })

  it('bracket：小括号买笔记本', () => {
    const r = computeLab('bracket', { money: 100, bag: 50, notebook: 5 })
    expect(r.value).toBe(10)
    expect(r.conclusion).toContain('小括号')
  })
})

describe('computeLab · 一天的时间', () => {
  it('time24：晚上 20 时', () => {
    const r = computeLab('time24', { hour: 20, min: 0 })
    expect(r.text).toContain('晚上')
    expect(r.text).toContain('20:00')
  })

  it('time24：凌晨 0 时', () => {
    const r = computeLab('time24', { hour: 0, min: 30 })
    expect(r.text).toContain('凌晨')
    expect(r.text).toContain('12')
  })

  it('elapsed：经过时间', () => {
    const r = computeLab('elapsed', { start: 9, end: 17 })
    expect(r.value).toBe(8)
    expect(r.text).toContain('8')
  })
})

describe('computeLab · 乘法', () => {
  it('mul-oral：整十整百口算', () => {
    const r = computeLab('mul-oral', { base: 40, count: 3 })
    expect(r.value).toBe(120)
    expect(r.text).toContain('120')
  })

  it('mul-oral：估算（够买）', () => {
    const r = computeLab('mul-oral', { price: 28, count: 4, money: 120 })
    expect(r.value).toBe(120)
    expect(r.text).toContain('够买')
  })

  it('mul-oral：估算（不够买）', () => {
    const r = computeLab('mul-oral', { price: 28, count: 4, money: 100 })
    expect(r.text).toContain('不够')
  })

  it('mul-pen：两位数×一位数', () => {
    const r = computeLab('mul-pen', { tens: 1, ones: 4, multi: 3 })
    expect(r.value).toBe(42)
  })

  it('mul-pen：三位数连续进位', () => {
    const r = computeLab('mul-pen', { h: 2, t: 3, o: 4, multi: 3 })
    expect(r.value).toBe(702)
  })

  it('mul-zero：中间有 0', () => {
    const r = computeLab('mul-zero', { h: 1, o: 2, multi: 4 })
    expect(r.value).toBe(408)
    expect(r.conclusion).toContain('0')
  })
})

describe('computeLab · 曹冲称象', () => {
  it('weight：千克→克', () => {
    const r = computeLab('weight', { value: 3, unit: 0 })
    expect(r.value).toBe(3000)
    expect(r.text).toContain('3000')
  })

  it('equivalent：等量代换', () => {
    const r = computeLab('equivalent', { stones: 5, each: 40 })
    expect(r.value).toBe(200)
    expect(r.text).toContain('200')
  })
})

describe('computeLab · 数据收集与整理', () => {
  it('tally：正字统计总数', () => {
    const r = computeLab('tally', { apple: 7, orange: 10, banana: 12, grape: 5 })
    expect(r.value).toBe(34)
    expect(r.text).toContain('香蕉')
  })

  it('stat：统计表', () => {
    const r = computeLab('stat', { campus: 4, animal: 8, scifi: 3, detective: 5 })
    expect(r.value).toBe(20)
  })
})

describe('computeLab · 长度单位', () => {
  it('length-convert：米+厘米→分米', () => {
    const r = computeLab('length-convert', { m: 1, cm: 90, to: 1 })
    expect(r.value).toBe(19)
    expect(r.text).toContain('19')
  })

  it('length-convert：厘米+毫米→毫米', () => {
    const r = computeLab('length-convert', { cm: 18, mm: 6, to: 0 })
    expect(r.value).toBe(186)
  })

  it('length-convert：千米→米', () => {
    const r = computeLab('length-convert', { value: 3, to: 0 })
    expect(r.value).toBe(3000)
  })

  it('length-convert：综合换算（毫米→厘米）', () => {
    const r = computeLab('length-convert', { value: 45, from: 0, to: 1 })
    expect(r.value).toBe(4.5)
  })
})

describe('computeLab · 平移旋转轴对称', () => {
  it('translate：向右平移', () => {
    const r = computeLab('translate', { dir: 0, steps: 4 })
    expect(r.value).toBe(4)
    expect(r.text).toContain('右')
  })

  it('rotate：顺时针旋转', () => {
    const r = computeLab('rotate', { dir: 0, angle: 90 })
    expect(r.value).toBe(90)
    expect(r.text).toContain('顺时针')
  })

  it('axis：轴对称图形', () => {
    const r = computeLab('axis', { shape: 0 })
    expect(r.conclusion).toContain('轴对称')
  })
})

describe('computeLab · 除法', () => {
  it('div-oral：整百除以一位数', () => {
    const r = computeLab('div-oral', { base: 600, div: 2 })
    expect(r.value).toBe(300)
  })

  it('div-pen：两位数', () => {
    const r = computeLab('div-pen', { tens: 4, ones: 2, div: 3 })
    expect(r.value).toBe(14)
  })

  it('div-pen：三位数', () => {
    const r = computeLab('div-pen', { h: 5, t: 3, o: 2, div: 2 })
    expect(r.value).toBe(266)
  })

  it('remainder：有余数', () => {
    const r = computeLab('remainder', { total: 90, div: 4 })
    expect(r.value).toBe(22)
    expect(r.text).toContain('2')
  })

  it('div-zero：商中间有 0', () => {
    const r = computeLab('div-zero', { h: 3, o: 6, div: 3 })
    expect(r.value).toBe(102)
    expect(r.conclusion).toContain('0')
  })
})

describe('computeLab · 间隔排列', () => {
  it('interval：两端相同差 1', () => {
    const r = computeLab('interval', { count: 6, end: 0 })
    expect(r.value).toBe(5)
    expect(r.text).toContain('5')
  })

  it('interval：两端不同相等', () => {
    const r = computeLab('interval', { count: 6, end: 2 })
    expect(r.value).toBe(6)
  })
})

describe('computeLab · 数量关系', () => {
  it('segment：总量−运走', () => {
    const r = computeLab('segment', { total: 300, part1: 120, part2: 160 })
    expect(r.value).toBe(20)
  })

  it('segment：多几少几', () => {
    const r = computeLab('segment', { base: 25, more1: 15, more2: 20 })
    expect(r.value).toBe(60)
    expect(r.text).toContain('足球')
  })

  it('segment：变换队形', () => {
    const r = computeLab('segment', { total: 144, per: 6, more: 2 })
    expect(r.value).toBe(18)
  })

  it('segment：倍+少', () => {
    const r = computeLab('segment', { base: 39, times: 2, less: 13 })
    expect(r.value).toBe(65)
  })
})

describe('computeLab · 观察物体', () => {
  it('views：三视图描述', () => {
    const r = computeLab('views', { shape: 0 })
    expect(r.text).toContain('前面')
  })

  it('views3d：观察方向', () => {
    const r = computeLab('views3d', { view: 0 })
    expect(r.text).toContain('前面')
  })
})

describe('computeLab · 倍的认识', () => {
  it('times：几个几', () => {
    const r = computeLab('times', { each: 2, groups: 3 })
    expect(r.value).toBe(6)
    expect(r.text).toContain('6')
  })

  it('times-mul：求一个数的几倍', () => {
    const r = computeLab('times-mul', { base: 4, times: 2 })
    expect(r.value).toBe(8)
  })

  it('times-div：求几倍关系', () => {
    const r = computeLab('times-div', { total: 6, base: 3 })
    expect(r.value).toBe(2)
  })

  it('times-div：混合（爸爸/妈妈/小阳）', () => {
    const r = computeLab('times-div', { dad: 32, less: 3, son: 7 })
    expect(r.text).toContain('妈妈')
    expect(r.value).toBe(Math.round(32 / 7))
  })
})
