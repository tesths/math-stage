import { describe, expect, it } from 'vitest'
import { koujue } from '@/lib/engine/math'
import {
  abacusBeads,
  borrowSub,
  carryAdd,
  carryTen,
  changeOf,
  chunkGroups,
  comparePlaces,
  countOn,
  exchangeYuan,
  fromKoujue,
  packUp,
  placeReading,
  remainderCycle,
  shareRounds,
  surroundings,
  turnRight,
} from '@/lib/labs/process'

describe('过程态纯函数：一组一组地数（几个几 / 乘法口诀）', () => {
  it('4 个 2 相加：第 k 步点亮 k 组，连加式和和同步变', () => {
    const steps = countOn(2, 4)
    expect(steps.map((s) => s.state.sum)).toEqual([2, 4, 6, 8])
    expect(steps[3]!.state.expr).toBe('2 + 2 + 2 + 2')
    expect(steps[0]!.state.expr).toBe('2')
    expect(steps[3]!.state.rows).toBe(4)
  })

  it('5 的乘法口诀：逐组数下去，和正好是 5 的倍数', () => {
    const steps = countOn(5, 5)
    expect(steps.map((s) => s.state.sum)).toEqual([5, 10, 15, 20, 25])
    expect(koujue(5, 2)).toBe('二五一十')
  })
})

describe('过程态纯函数：平均分一轮一轮分（课本 p20）', () => {
  it('8 个平均分给 2 只松鼠：4 轮，每轮每份 +1，最后正好分完', () => {
    const steps = shareRounds(8, 2)
    expect(steps.map((s) => s.state.each)).toEqual([1, 2, 3, 4])
    expect(steps.map((s) => s.state.left)).toEqual([6, 4, 2, 0])
    expect(steps[3]!.state.placed).toBe(8)
  })

  it('分不完时保留余数，且每份个数不再增加', () => {
    const steps = shareRounds(9, 2)
    const last = steps.at(-1)!
    expect(last.state.left).toBe(1)
    expect(last.state.each).toBe(4)
    expect(last.say).toContain('不够再给每份分 1 个')
  })
})

describe('过程态纯函数：每几个一份地圈 / 一辆一辆地装', () => {
  it('10 个每 2 个一份 → 5 份，第 k 份圈住 2k 个', () => {
    const steps = chunkGroups(10, 2)
    expect(steps.length).toBe(5)
    expect(steps[2]!.state.groups).toBe(3)
    expect(steps[2]!.state.circled.length).toBe(6)
    expect(steps[4]!.state.left).toBe(0)
  })

  it('8 个车轮每辆 2 个：装到第 4 辆用光，口诀跟着变', () => {
    const steps = packUp(2, 4, koujue)
    expect(steps.map((s) => s.state.used)).toEqual([2, 4, 6, 8])
    expect(steps.map((s) => s.state.left)).toEqual([6, 4, 2, 0])
    expect(steps[3]!.state.koujue).toBe('二四得八')
    expect(steps[3]!.state.cars).toBe(4)
  })
})

describe('过程态纯函数：进位加法与退位减法', () => {
  it('34 + 28：个位 4+8=12 满十进 1，十位 3+2+1=6，结果 62', () => {
    const s = carryAdd(3, 4, 2, 8)
    expect(s.oSum).toBe(12)
    expect(s.carry).toBe(true)
    expect(s.oRes).toBe(2)
    expect(s.tRes).toBe(6)
    expect(s.value).toBe(62)
  })

  it('23 + 15：个位不满十，不进位', () => {
    const s = carryAdd(2, 3, 1, 5)
    expect(s.carry).toBe(false)
    expect(s.tRes).toBe(3)
    expect(s.value).toBe(38)
  })

  it('54 − 36：个位 4 不够减 6，退 1 当 10 → 14−6=8，十位 5−1−3=1', () => {
    const s = borrowSub(5, 4, 3, 6)
    expect(s.ok).toBe(true)
    expect(s.borrow).toBe(true)
    expect(s.oBorrowed).toBe(14)
    expect(s.oRes).toBe(8)
    expect(s.tRes).toBe(4) // 十位要减掉的数是 3+1=4
    expect(s.value).toBe(18)
  })

  it('被减数比减数小时明确判为不成立（旧实现偷偷调换两个数，算出来的差是错的）', () => {
    const s = borrowSub(3, 6, 5, 4)
    expect(s.ok).toBe(false)
    expect(s.value).toBe(-18) // 36 − 54 = −18，不是 18
    expect(s.value).not.toBe(18)
  })
})

describe('过程态纯函数：满十进一 / 逐位读数 / 算盘拨珠', () => {
  it('10 个一捆成 1 个十（进率 10）', () => {
    const s = carryTen(3, 10)
    expect(s.regrouped).toBe(true)
    expect(s.t).toBe(4)
    expect(s.o).toBe(0)
    expect(s.value).toBe(40)
  })

  it('9 个一不满十，不捆', () => {
    expect(carryTen(3, 9).regrouped).toBe(false)
    expect(carryTen(3, 9).t).toBe(3)
  })

  it('124 逐位读出：百位→十位→个位，累计到 124', () => {
    const rows = placeReading(124)
    expect(rows.map((r) => r.digit)).toEqual([1, 2, 4])
    expect(rows.map((r) => r.running)).toEqual([100, 120, 124])
  })

  it('算盘 234：2 个下珠在百位、3 个下珠在十位、4 个下珠在个位', () => {
    const beads = abacusBeads(234)
    expect(beads.map((b) => b.upper)).toEqual([0, 0, 0])
    expect(beads.map((b) => b.lower)).toEqual([2, 3, 4])
    expect(beads[2]!.running).toBe(234)
  })

  it('算盘 5：一颗上珠表示 5，不是 5 颗下珠', () => {
    const beads = abacusBeads(5)
    expect(beads[2]!.upper).toBe(1)
    expect(beads[2]!.lower).toBe(0)
    expect(beads[2]!.value).toBe(5)
  })

  it('算盘 999：每档都是 1 颗上珠 + 4 颗下珠', () => {
    const beads = abacusBeads(999)
    for (const b of beads) {
      expect(b.upper).toBe(1)
      expect(b.lower).toBe(4)
      expect(b.digit).toBe(9)
    }
  })
})

describe('过程态纯函数：换钱与找零', () => {
  it('找回 = 付出 − 价格（10 元买 6 元找回 4 元）', () => {
    const s = changeOf(6, 10)
    expect(s.enough).toBe(true)
    expect(s.change).toBe(4)
  })

  it('钱不够时没有找回，只有还差多少', () => {
    const s = changeOf(10, 6)
    expect(s.enough).toBe(false)
    expect(s.change).toBe(0)
    expect(s.short).toBe(4)
  })

  it('1 元换 10 角：换 3 张 = 30 角', () => {
    const e = exchangeYuan(3, 3)
    expect(e.jiao).toBe(30)
    expect(e.kept).toBe(0)
    expect(e.say).toContain('1 元 = 10 角')
  })
})

describe('过程态纯函数：余数一个一个地走（余数比除数小）', () => {
  it('除以 3：余数 0、1、2 循环，加到再满一组时商进 1、余数回到 0', () => {
    const rows = remainderCycle(3)
    expect(rows.map((r) => r.remainder)).toEqual([0, 1, 2, 0])
    expect(rows.map((r) => r.dividend)).toEqual([9, 10, 11, 12])
    expect(rows.map((r) => r.quotient)).toEqual([3, 3, 3, 4])
    expect(rows.at(-1)!.full).toBe(true)
  })

  it('除以 5：余数最大是 4，等于除数的那一步必须先满十进位', () => {
    const rows = remainderCycle(5)
    expect(Math.max(...rows.slice(0, 5).map((r) => r.remainder))).toBe(4)
    expect(rows[5]!.remainder).toBe(0)
    expect(rows[5]!.quotient).toBe(4)
  })
})

describe('过程态纯函数：三位数比大小 / 方向 / 一句口诀三道算式', () => {
  it('402 与 385：百位就分出大小，不用比后面', () => {
    const steps = comparePlaces(402, 385)
    expect(steps.length).toBe(1)
    expect(steps[0]).toMatchObject({ place: '百位', left: 4, right: 3, decided: true })
  })

  it('760 与 720：百位相同，比到十位才分出大小', () => {
    const steps = comparePlaces(760, 720)
    expect(steps.map((s) => s.place)).toEqual(['百位', '十位'])
    expect(steps[1]!.decided).toBe(true)
  })

  it('完全相同的两个数：三位都比，都没分出大小', () => {
    const steps = comparePlaces(456, 456)
    expect(steps.length).toBe(3)
    expect(steps.every((s) => !s.decided)).toBe(true)
  })

  it('向右转：东南西北顺时针走一圈回到原处', () => {
    expect(turnRight(0)).toBe(1)
    expect(turnRight(3)).toBe(0)
    expect(turnRight(turnRight(turnRight(turnRight(0))))).toBe(0)
  })

  it('面向东：前面东、后面西、左边北、右边南（课本 p57 原话）', () => {
    expect(surroundings(0)).toEqual({ front: 0, back: 2, left: 3, right: 1 })
  })

  it('面向南时左右互换：左边是东、右边是西', () => {
    expect(surroundings(1)).toEqual({ front: 1, back: 3, left: 0, right: 2 })
  })

  it('五七三十五：一句口诀写出 1 道乘法 + 2 道除法', () => {
    const f = fromKoujue(5, 7, koujue)
    expect(f.koujue).toBe('五七三十五')
    expect(f.multiply).toBe('5 × 7 = 35')
    expect(f.divideA).toBe('35 ÷ 5 = 7')
    expect(f.divideB).toBe('35 ÷ 7 = 5')
    expect(f.single).toBe(false)
  })

  it('四四十六：两个乘数相同，只能用一句口诀写一道除法', () => {
    expect(fromKoujue(4, 4, koujue).single).toBe(true)
  })
})
