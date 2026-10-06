import { describe, expect, it } from 'vitest'
import {
  CARRY_DEMO,
  COMPARE_PAIRS,
  OP_EXAMPLES,
  PLACE_EXAMPLES,
  binaryBits,
  binaryDivisionSteps,
  binaryReading,
  carryBoundary,
  comparePair,
  greaterThan,
  opExample,
  parseValue,
  placeExample,
  placeRows,
} from '@/lib/labs/numberSys'
import { computeLab } from '@/lib/labs/compute'
import { toBinary } from '@/lib/engine/math'

describe('数位与计数单位', () => {
  it('任意数都能拆成「几个计数单位」，且各部分之和等于原数', () => {
    for (const v of [231, 2000, 3.36, 4.05, 0.24, 45.7, 1000, 0.001, 90]) {
      const rows = placeRows(v)
      const sum = rows.reduce((acc, r) => acc + r.val * r.pow, 0)
      expect(sum).toBeCloseTo(v, 6)
      // 从高频到低位排列
      const weights = rows.map((r) => r.pow)
      expect([...weights].sort((a, b) => b - a)).toEqual(weights)
    }
    expect(placeRows(231)).toEqual([
      { unit: '百', val: 2, pow: 100 },
      { unit: '十', val: 3, pow: 10 },
      { unit: '一', val: 1, pow: 1 },
    ])
    expect(placeRows(4.05)).toEqual([
      { unit: '一', val: 4, pow: 1 },
      { unit: '十分之一', val: 0, pow: 0.1 },
      { unit: '百分之一', val: 5, pow: 0.01 },
    ])
    expect(placeRows(0.24)).toEqual([
      { unit: '十分之一', val: 2, pow: 0.1 },
      { unit: '百分之一', val: 4, pow: 0.01 },
    ])
  })

  it('数据层的 5 个数位例题与共用模块一致（组件与 compute 不再各写一份）', () => {
    expect([...PLACE_EXAMPLES]).toEqual([231, 2000, 3.36, 4.05, 0.24])
    for (let i = 0; i < PLACE_EXAMPLES.length; i++) {
      const ex = placeExample(i)
      expect(ex.v).toBe(PLACE_EXAMPLES[i])
      expect(ex.text).toContain('个')
      // compute 的文案必须与它一致
      const r = computeLab('place-value', { sel: i })
      expect(r.text).toBe(ex.text)
    }
  })

  it('相邻计数单位的进率都是 10', () => {
    for (const d of CARRY_DEMO) expect(d.lowCount).toBe(10)
  })
})

describe('数的大小比较', () => {
  it('每一组声明的大小关系都与精确计算一致（不再用 Number("2/3") → NaN 特判）', () => {
    for (const p of COMPARE_PAIRS) {
      expect(greaterThan(p.a, p.b)).toBe(p.gt)
    }
    expect(greaterThan('2/3', '3/5')).toBe(true)
    expect(greaterThan('3/5', '2/3')).toBe(false)
    expect(greaterThan('3.34', '3.4')).toBe(false)
    expect(greaterThan('4.7', '4.05')).toBe(true)
    expect(parseValue('2/3')).toEqual({ n: 2, d: 3 })
    expect(parseValue('3.34')).toEqual({ n: 334, d: 100 })
  })

  it('compute 的比较符号与共用模块一致', () => {
    for (let i = 0; i < COMPARE_PAIRS.length; i++) {
      const p = comparePair(i)
      const r = computeLab('compare-unit', { sel: i })
      expect(r.text).toBe(`${p.a} ${p.gt ? '>' : '<'} ${p.b}`)
    }
  })
})

describe('运算意义一致性', () => {
  it('每个示例的答案都由算式复算得到', () => {
    const values: Record<string, number> = {
      '20 × 3': 20 * 3,
      '2/5 × 3': (2 / 5) * 3,
      '1200 ÷ 3': 1200 / 3,
      '1200 ÷ 400': 1200 / 400,
      '135 + 24': 135 + 24,
      '3.4 + 1.25': 3.4 + 1.25,
    }
    for (const op of OP_EXAMPLES) {
      expect(op.value).toBeCloseTo(values[op.expr]!, 6)
      // 计数单位的个数 × 单位 = 结果（能对上才算"计数单位"的说法成立）
      const unitValue: Record<string, number> = { '个十': 10, '1/5': 1 / 5, '个百': 100, '（同单位）': 1, '个一': 1, '0.01': 0.01 }
      if (op.expr !== '135 + 24') {
        expect(op.n * unitValue[op.unit]!).toBeCloseTo(op.value, 6)
      }
    }
    expect(OP_EXAMPLES.find((o) => o.expr === '3.4 + 1.25')!.n).toBe(465)
  })

  it('compute 的答案与共用模块一致', () => {
    for (let i = 0; i < OP_EXAMPLES.length; i++) {
      const op = opExample(i)
      const r = computeLab('op-consistency', { sel: i })
      expect(r.text).toBe(`${op.expr} = ${op.ans === '6/5' ? '1.2' : op.ans}`)
    }
  })
})

describe('二进制', () => {
  it('各位权重按实际位数计算（31 → 16/8/4/2/1）', () => {
    expect(binaryBits(31).map((b) => b.weight)).toEqual([16, 8, 4, 2, 1])
    expect(binaryBits(5).map((b) => b.bit)).toEqual([1, 0, 1])
    expect(binaryBits(5).map((b) => b.weight)).toEqual([4, 2, 1])
    expect(binaryBits(0).map((b) => b.bit)).toEqual([0])
    // 位权 × 位 之和 = 原数
    for (const dec of [0, 1, 2, 5, 23, 31]) {
      expect(binaryBits(dec).reduce((a, b) => a + b.count, 0)).toBe(dec)
      expect(binaryBits(dec).map((b) => b.bit).join('')).toBe(toBinary(dec))
    }
  })

  it('二进制要逐位读：101 → 一零一', () => {
    expect(binaryReading('101')).toBe('一零一')
    expect(binaryReading('11111')).toBe('一一一一一')
    expect(binaryReading('1000')).toBe('一零零零')
  })

  it('除以 2 取余的过程与二进制一致', () => {
    for (const dec of [0, 1, 2, 5, 23, 31]) {
      const steps = binaryDivisionSteps(dec)
      const rems = steps
        .map((s) => s.result.match(/余 (\d)/)?.[1])
        .filter(Boolean)
        .reverse()
        .join('')
      expect(rems === '' ? '0' : rems).toBe(toBinary(dec))
    }
  })

  it('满二进一的现场：找到 dec 之前最近的进位处', () => {
    expect(carryBoundary(4)).toEqual({ from: 3, to: 4, fromBin: '11', toBin: '100' })
    expect(carryBoundary(5)).toEqual({ from: 3, to: 4, fromBin: '11', toBin: '100' })
    expect(carryBoundary(8)).toEqual({ from: 7, to: 8, fromBin: '111', toBin: '1000' })
    expect(carryBoundary(31)).toEqual({ from: 15, to: 16, fromBin: '1111', toBin: '10000' })
    // 进位处两个数的二进制位数刚好差 1，且都是 1 后跟 0
    for (const dec of [2, 4, 8, 16, 31]) {
      const b = carryBoundary(dec)
      expect(b.toBin).toBe('1' + '0'.repeat(b.toBin.length - 1))
      expect(b.fromBin).toBe('1'.repeat(b.fromBin.length))
    }
  })

  it('compute 的结论逐位读二进制', () => {
    const r = computeLab('binary', { dec: 5 })
    expect(r.text).toContain('（101）₂')
    expect(r.conclusion).toContain('一零一')
  })
})
