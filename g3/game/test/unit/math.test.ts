import { describe, expect, it } from 'vitest'
import {
  KIND_LABELS,
  LENGTH_MM,
  LENGTH_UNITS,
  OP_SYMBOL,
  WEIGHT_G,
  WEIGHT_UNITS,
  applyOp,
  divideWithRemainder,
  splitDigits2,
  splitDigits3,
  time12Text,
  timesOf,
  toFixed2,
  zhengCount,
} from '@/lib/engine/math'

describe('math 工具（三年级）', () => {
  it('applyOp 四则运算', () => {
    expect(applyOp(3, 'add', 4)).toBe(7)
    expect(applyOp(9, 'sub', 4)).toBe(5)
    expect(applyOp(3, 'mul', 4)).toBe(12)
    expect(applyOp(12, 'div', 4)).toBe(3)
  })

  it('OP_SYMBOL 符号映射', () => {
    expect(OP_SYMBOL).toEqual({ add: '+', sub: '−', mul: '×', div: '÷' })
  })

  it('time12Text 时段边界', () => {
    // 课本 p11：一天从「晚上 12:00」开始，所以 0 时读作晚上 12 时（不是"凌晨 12 时"）
    expect(time12Text(0)).toEqual({ period: '晚上', display: 12 })
    expect(time12Text(5)).toEqual({ period: '凌晨', display: 5 })
    expect(time12Text(6)).toEqual({ period: '上午', display: 6 })
    expect(time12Text(11)).toEqual({ period: '上午', display: 11 })
    expect(time12Text(12)).toEqual({ period: '中午', display: 12 })
    expect(time12Text(13)).toEqual({ period: '下午', display: 1 })
    expect(time12Text(17)).toEqual({ period: '下午', display: 5 })
    expect(time12Text(18)).toEqual({ period: '晚上', display: 6 })
    expect(time12Text(23)).toEqual({ period: '晚上', display: 11 })
  })

  it('长度单位与进率', () => {
    expect(LENGTH_UNITS).toEqual(['毫米', '厘米', '分米', '米', '千米'])
    expect(LENGTH_MM['毫米']).toBe(1)
    expect(LENGTH_MM['厘米']).toBe(10)
    expect(LENGTH_MM['分米']).toBe(100)
    expect(LENGTH_MM['米']).toBe(1000)
    expect(LENGTH_MM['千米']).toBe(1_000_000)
  })

  it('质量单位与进率', () => {
    expect(WEIGHT_UNITS).toEqual(['克', '千克', '吨'])
    expect(WEIGHT_G['克']).toBe(1)
    expect(WEIGHT_G['千克']).toBe(1000)
    expect(WEIGHT_G['吨']).toBe(1_000_000)
  })

  it('divideWithRemainder：商与余数', () => {
    expect(divideWithRemainder(90, 4)).toEqual({ q: 22, r: 2 })
    expect(divideWithRemainder(12, 3)).toEqual({ q: 4, r: 0 })
  })

  it('zhengCount：画正字', () => {
    expect(zhengCount(5)).toEqual({ chars: 1, strokes: 0 })
    expect(zhengCount(7)).toEqual({ chars: 1, strokes: 2 })
    expect(zhengCount(0)).toEqual({ chars: 0, strokes: 0 })
  })

  it('timesOf：倍数与整除', () => {
    expect(timesOf(6, 3)).toEqual({ times: 2, exact: true })
    expect(timesOf(32, 7).exact).toBe(false)
    expect(timesOf(32, 7).times).toBeCloseTo(4.57)
  })

  it('toFixed2：整数去尾、小数截断', () => {
    expect(toFixed2(4)).toBe('4')
    expect(toFixed2(4.5)).toBe('4.5')
    expect(toFixed2(4.57)).toBe('4.57')
    expect(toFixed2(4.571)).toBe('4.57')
  })

  it('splitDigits3 / splitDigits2', () => {
    expect(splitDigits3(532)).toEqual([5, 3, 2])
    expect(splitDigits2(42)).toEqual([4, 2])
  })

  it('KIND_LABELS 覆盖全部 LabKind', () => {
    expect(KIND_LABELS['mix-calc']).toBe('混合运算')
    expect(KIND_LABELS['times-div']).toBe('求一个数是另一个数的几倍')
    expect(Object.keys(KIND_LABELS).length).toBeGreaterThanOrEqual(20)
  })
})
