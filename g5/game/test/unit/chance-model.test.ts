import { describe, expect, it } from 'vitest'
import { ballProbability, normalizeFractions, pickSector, sectorKeyAt, spinTarget, tallyChars } from '@/lib/labs/chance'
import { allLabs } from '@data'

const sectors = normalizeFractions([50, 30, 20]).map((frac, i) => ({
  key: ['red', 'blue', 'yellow'][i]!,
  label: ['红', '蓝', '黄'][i]!,
  frac,
}))

describe('转盘逻辑', () => {
  it('份额归一化：给 50/30/20 → 0.5/0.3/0.2；给 2/1/1 → 0.5/0.25/0.25', () => {
    expect(normalizeFractions([50, 30, 20])).toEqual([0.5, 0.3, 0.2])
    expect(normalizeFractions([2, 1, 1])).toEqual([0.5, 0.25, 0.25])
    expect(normalizeFractions([0, 0])).toEqual([0.5, 0.5])
  })

  it('随机落点按面积摊派到扇区中心', () => {
    expect(pickSector(0.1, sectors)).toEqual({ key: 'red', centerFrac: 0.25 })
    expect(pickSector(0.6, sectors)).toEqual({ key: 'blue', centerFrac: 0.65 })
    expect(pickSector(0.95, sectors)).toEqual({ key: 'yellow', centerFrac: 0.9 })
    expect(pickSector(0.5, sectors).key).toBe('red')
    expect(pickSector(0.5001, sectors).key).toBe('blue')
  })

  it('扇区中心份额反查扇区一致', () => {
    for (const s of sectors) {
      const r = sectors.slice(0, sectors.indexOf(s)).reduce((a, x) => a + x.frac, 0) + s.frac / 2
      expect(sectorKeyAt(sectors, r)).toBe(s.key)
    }
    expect(sectorKeyAt(sectors, 0)).toBe('red')
    expect(sectorKeyAt(sectors, 0.999)).toBe('yellow')
  })

  it('指针只会向前转：第二次转动的目标一定大于当前角度', () => {
    let base = 0
    let angle = 0
    for (const [r, turns] of [[0.1, 4], [0.95, 5], [0.6, 4], [0.1, 6]] as [number, number][]) {
      const picked = pickSector(r, sectors)
      const next = spinTarget(base, picked.centerFrac, turns)
      expect(next.target).toBeGreaterThan(angle)
      expect(next.target - angle).toBeGreaterThan(360)
      // 落点方向与所选的扇区一致
      expect(sectorKeyAt(sectors, (next.target % 360) / 360)).toBe(picked.key)
      base = next.base
      angle = next.target
    }
  })
})

describe('摸球与统计', () => {
  it('理论概率 = 各自个数 ÷ 总数', () => {
    expect(ballProbability(4, 6)).toEqual({ red: 0.4, yellow: 0.6 })
    expect(ballProbability(0, 0)).toEqual({ red: 0, yellow: 0 })
    expect(ballProbability(1, 1).red).toBe(0.5)
  })

  it('数据层转盘例题的百分比之和为 100', () => {
    const lab = allLabs.find((l) => l.kind === 'spinner')!
    const vals = ['red', 'blue', 'yellow'].map((k) => lab.params.find((p) => p.key === k)?.default ?? 0)
    expect(vals.reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('正字计数', () => {
    expect(tallyChars(0)).toBe('—')
    expect(tallyChars(3)).toBe('下')
    expect(tallyChars(5)).toBe('正')
    expect(tallyChars(7)).toBe('正丅')
    expect(tallyChars(13)).toBe('正正下')
  })
})
