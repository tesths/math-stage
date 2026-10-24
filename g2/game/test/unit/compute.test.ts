import { describe, expect, it } from 'vitest'
import { computeLab } from '@/lib/labs/compute'
import { allLabs } from '@data'

describe('computeLab 一/三 表内乘法与乘除法', () => {
  it('groups：4 个 2 相加 = 8', () => {
    const r = computeLab('groups', { each: 2, groups: 4 })
    expect(r.value).toBe(8)
    expect(r.text).toContain('4 个 2 相加')
    expect(r.text).toContain('2 × 4 = 8')
  })

  it('groups：单个参数缺省', () => {
    expect(computeLab('groups', {}).value).toBe(4)
    expect(computeLab('groups', { each: 3 }).value).toBe(6)
  })

  it('mult-table：5 × 3 口诀三五十五', () => {
    const r = computeLab('mult-table', { base: 5, n: 3 })
    expect(r.value).toBe(15)
    expect(r.steps[2]!.result).toContain('三五十五')
  })

  it('table-calc：乘法和除法两种模式', () => {
    const mul = computeLab('table-calc', { a: 6, b: 7, mode: 0 })
    expect(mul.value).toBe(42)
    expect(mul.text).toBe('6 × 7 = 42')
    const div = computeLab('table-calc', { a: 6, b: 7, mode: 1 })
    expect(div.value).toBe(7)
    expect(div.text).toBe('42 ÷ 6 = 7')
  })

  it('table-calc：mode 缺省默认乘法', () => {
    expect(computeLab('table-calc', {}).value).toBe(42)
  })
})

describe('computeLab 二 表内除法', () => {
  it('divide-share：12 平均分成 3 份，每份 4', () => {
    const r = computeLab('divide-share', { total: 12, groups: 3 })
    expect(r.value).toBe(4)
    expect(r.text).toContain('每份 4 个')
  })

  it('divide-share：有余数时提示剩余', () => {
    const r = computeLab('divide-share', { total: 10, groups: 3 })
    expect(r.value).toBe(3)
    expect(r.text).toContain('还剩 1 个')
    expect(r.conclusion).toContain('不能正好分完')
  })

  it('divide-group：每 3 个一份，10 个分成 3 份剩 1', () => {
    const r = computeLab('divide-group', { total: 10, per: 3 })
    expect(r.value).toBe(3)
    expect(r.text).toContain('还剩 1 个')
  })

  it('divide-group：12 每 3 个一份正好 4 份', () => {
    expect(computeLab('divide-group', { total: 12, per: 3 }).value).toBe(4)
  })

  it('quotient：8 ÷ 2 想口诀求商', () => {
    const r = computeLab('quotient', { a: 4, b: 2 })
    expect(r.value).toBe(4)
    expect(r.text).toBe('8 ÷ 2 = 4')
    expect(r.conclusion).toContain('二四得八')
  })
})

describe('computeLab 综合实践（七巧板 / 方向）', () => {
  it('tangram：六种拼法，用哪几块板与真实拼法一致', () => {
    expect(computeLab('tangram', { sel: 0 }).text).toBe('正方形（7 块）')
    expect(computeLab('tangram', { sel: 1 }).text).toBe('长方形（③⑤④）')
    expect(computeLab('tangram', { sel: 2 }).text).toBe('正方形（③⑤）')
    expect(computeLab('tangram', { sel: 3 }).text).toBe('平行四边形（③⑤）')
    expect(computeLab('tangram', { sel: 4 }).text).toBe('三角形（③⑤）')
    expect(computeLab('tangram', { sel: 5 }).text).toBe('三角形（③⑤⑦，和①一样大）')
    expect(computeLab('tangram', { sel: 0 }).steps[0]!.result).toContain('7 块板')
  })

  it('tangram：长方形与平行四边形不再用同一组板（旧实现两块都写 3、4、5 是错的）', () => {
    const rect = computeLab('tangram', { sel: 1 })
    const para = computeLab('tangram', { sel: 3 })
    expect(rect.steps[1]!.result).toContain('4号板')
    expect(para.steps[1]!.result).not.toContain('4号板')
    // 面积验算：长方形 4+4+8=16、平行四边形 4+4=8
    expect(rect.value).toBe(16)
    expect(para.value).toBe(8)
  })

  it('direction：面向东，后西左北右南', () => {
    const r = computeLab('direction', { face: 0 })
    expect(r.text).toContain('面向东')
    expect(r.text).toContain('后面是西')
    expect(r.text).toContain('左边是北')
    expect(r.text).toContain('右边是南')
  })

  it('direction：四个朝向循环取余', () => {
    expect(computeLab('direction', { face: 2 }).text).toContain('面向西')
    expect(computeLab('direction', { face: 5 }).text).toContain('面向南')
  })
})

describe('computeLab 四 认识三位数', () => {
  it('place-value：124 = 1个百 + 2个十 + 4个一', () => {
    const r = computeLab('place-value', { h: 1, t: 2, o: 4 })
    expect(r.value).toBe(124)
    expect(r.text).toContain('124')
    expect(r.steps[3]!.result).toContain('100 + 20 + 4')
  })

  it('compare：402 > 385（先比百位）', () => {
    const r = computeLab('compare', { a: 402, b: 385 })
    expect(r.value).toBe(1)
    expect(r.text).toBe('402 > 385')
    expect(r.steps[0]!.result).toContain('4 > 3')
  })

  it('compare：百位相同再比十位', () => {
    const r = computeLab('compare', { a: 402, b: 412 })
    expect(r.value).toBe(-1)
    expect(r.text).toBe('402 < 412')
    expect(r.steps[1]!.expr).toContain('十位')
  })

  it('abacus：五种拨珠示例', () => {
    expect(computeLab('abacus', { sel: 0 }).value).toBe(5)
    expect(computeLab('abacus', { sel: 1 }).value).toBe(105)
    expect(computeLab('abacus', { sel: 2 }).value).toBe(234)
    expect(computeLab('abacus', { sel: 4 }).value).toBe(999)
    expect(computeLab('abacus', { sel: 0 }).conclusion).toContain('上珠 1 颗表示 5')
  })
})

describe('computeLab 五 两位数加减', () => {
  it('twodigit-add：34 + 28 = 62（进位）', () => {
    const r = computeLab('twodigit-add', { ta: 3, oa: 4, tb: 2, ob: 8 })
    expect(r.value).toBe(62)
    expect(r.text).toBe('34 + 28 = 62')
    expect(r.steps[0]!.result).toContain('满十进 1')
    expect(r.conclusion).toContain('进 1')
  })

  it('twodigit-add：不进位', () => {
    const r = computeLab('twodigit-add', { ta: 1, oa: 2, tb: 2, ob: 3 })
    expect(r.value).toBe(35)
    expect(r.steps[0]!.result).not.toContain('满十')
  })

  it('twodigit-sub：54 - 36 = 18（退位）', () => {
    const r = computeLab('twodigit-sub', { ta: 5, oa: 4, tb: 3, ob: 6 })
    expect(r.value).toBe(18)
    expect(r.text).toBe('54 - 36 = 18')
    expect(r.steps[0]!.result).toContain('退 1')
  })

  it('twodigit-sub：被减数小于减数时给出真值并明确提示（不再偷偷调换两个数）', () => {
    // 旧实现把 36 − 54 换成 54 − 36 得出 18，那是另一道题的答案（P0）。
    const r = computeLab('twodigit-sub', { ta: 3, oa: 6, tb: 5, ob: 4 })
    expect(r.value).toBe(-18)
    expect(r.value).not.toBe(18)
    expect(r.conclusion).toContain('本册不学负数')
    expect(r.text).toContain('36 - 54')
    expect(r.steps.some((st) => st.result.includes('被减数要大于或等于减数'))).toBe(true)
  })

  it('twodigit-sub：被减数等于减数时差为 0，且走正常退位流程', () => {
    const r = computeLab('twodigit-sub', { ta: 5, oa: 4, tb: 5, ob: 4 })
    expect(r.value).toBe(0)
    expect(r.conclusion).toContain('54 - 54 = 0')
  })

  it('twodigit-sub：不退位', () => {
    const r = computeLab('twodigit-sub', { ta: 5, oa: 8, tb: 3, ob: 6 })
    expect(r.value).toBe(22)
    expect(r.steps[0]!.result).not.toContain('退')
  })
})

describe('computeLab 欢乐购物街', () => {
  it('money：认识面额与进率', () => {
    const r = computeLab('money', { sel: 0 })
    expect(r.text).toContain('1 元')
    expect(r.steps[1]!.result).toContain('1 元 = 10 角')
    expect(computeLab('money', { sel: 2 }).text).toContain('5 元')
  })

  it('money-calc：付 10 元找回 4 元', () => {
    const r = computeLab('money-calc', { price: 6, paid: 10 })
    expect(r.value).toBe(4)
    expect(r.text).toContain('找回 4 元')
  })

  it('money-calc：钱不够提示差额', () => {
    const r = computeLab('money-calc', { price: 10, paid: 6 })
    expect(r.value).toBe(0)
    expect(r.text).toContain('还差 4 元')
  })
})

describe('computeLab 六 有余数的除法', () => {
  it('remainder：10 ÷ 3 = 3 …… 1', () => {
    const r = computeLab('remainder', { total: 10, per: 3 })
    expect(r.value).toBe(3)
    expect(r.text).toBe('10 ÷ 3 = 3 …… 1')
    expect(r.conclusion).toContain('余数 1 比除数 3 小')
  })

  it('remainder：正好分完（余 0）', () => {
    const r = computeLab('remainder', { total: 12, per: 3 })
    expect(r.value).toBe(4)
    expect(r.text).toBe('12 ÷ 3 = 4 …… 0')
  })

  it('remainder-rule：除以 3 余数最大是 2', () => {
    const r = computeLab('remainder-rule', { d: 3 })
    expect(r.value).toBe(2)
    expect(r.text).toContain('余数最大是 2')
    expect(r.conclusion).toContain('比除数小')
  })

  it('remainder-rule：除以 9 余数最大是 8', () => {
    expect(computeLab('remainder-rule', { d: 9 }).value).toBe(8)
  })
})

describe('computeLab 分支覆盖', () => {
  it('参数缺失时走默认值兜底分支（全覆盖）', () => {
    for (const l of allLabs) {
      expect(() => computeLab(l.kind, {})).not.toThrow()
    }
  })

  it('place-value 全零时结论说明', () => {
    const r = computeLab('place-value', { h: 0, t: 0, o: 0 })
    expect(r.value).toBe(0)
    expect(r.conclusion).toContain('0 表示这一位上没有数')
  })

  it('compare 相等时输出 =', () => {
    const r = computeLab('compare', { a: 402, b: 402 })
    expect(r.value).toBe(0)
    expect(r.text).toBe('402 = 402')
  })
})
