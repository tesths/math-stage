import { describe, expect, it } from 'vitest'
import {
  SIEVE_PRIMES,
  axisTicks,
  distanceUnit,
  factorPairs,
  frogCounts,
  frogRows,
  multiples,
  segmentLayout,
  sieveReasons,
  sieveRemaining,
  sieveRemovedBy,
  speedSegments,
  squareCell,
  timeUnit,
} from '@/lib/labs/number'
import { primesUpTo } from '@/lib/engine/math'

describe('因数与倍数逻辑', () => {
  it('因数对必须真的铺满：长 × 宽 = n，且覆盖全部因数对', () => {
    for (const n of [1, 2, 4, 6, 12, 16, 24, 36, 48]) {
      const pairs = factorPairs(n)
      for (const [w, h] of pairs) {
        expect(w * h).toBe(n)
        expect(w).toBeLessThanOrEqual(h)
      }
      // 每一对互不相同，且 w 递增
      const ws = pairs.map(([w]) => w)
      expect(new Set(ws).size).toBe(ws.length)
      expect([...ws].sort((a, b) => a - b)).toEqual(ws)
      // 因数个数 = 2 × 因数对数（完全平方数要减 1）
      const total = n === Math.round(Math.sqrt(n)) ** 2 ? pairs.length * 2 - 1 : pairs.length * 2
      expect(total).toBe(
        Array.from({ length: n }, (_, i) => i + 1).filter((x) => n % x === 0).length,
      )
    }
  })

  it('12 有 3 种拼法，16 有 3 种拼法（含 4×4）', () => {
    expect(factorPairs(12)).toEqual([[1, 12], [2, 6], [3, 4]])
    expect(factorPairs(16)).toEqual([[1, 16], [2, 8], [4, 4]])
  })

  it('倍数：前 k 个倍数是 n, 2n, …，最小的是它本身', () => {
    expect(multiples(3, 5)).toEqual([3, 6, 9, 12, 15])
    expect(multiples(6, 3)).toEqual([6, 12, 18])
    expect(multiples(3, 0)).toEqual([])
  })

  it('数轴刻度覆盖 0 到 max（含 max）', () => {
    expect(axisTicks(30, 5)).toEqual([0, 5, 10, 15, 20, 25, 30])
    expect(axisTicks(0, 5)).toEqual([0])
  })
})

describe('埃拉托色尼筛', () => {
  it('依次划掉 2、3、5、7 的倍数后，剩下的恰好是质数（10~100 全量核对）', () => {
    for (let n = 10; n <= 100; n++) {
      expect(sieveRemaining(n, SIEVE_PRIMES.length)).toEqual(primesUpTo(n))
    }
  })

  it('每一轮的剩余集合逐轮缩小，且质数从不会被划掉', () => {
    const n = 50
    let prev = sieveRemaining(n, 0)
    for (let step = 1; step <= SIEVE_PRIMES.length; step++) {
      const cur = sieveRemaining(n, step)
      expect(cur.length).toBeLessThan(prev.length)
      for (const p of primesUpTo(n)) expect(cur).toContain(p)
      prev = cur
    }
    // 筛法从 2 开始列数（1 既不是质数也不是合数，先划掉，不出现在表里）
    expect(sieveRemaining(n, 0)).not.toContain(1)
    expect(sieveRemaining(n, 0)[0]).toBe(2)
  })

  it('被划掉的数记录了最小质因数与理由', () => {
    const removed = sieveRemovedBy(50)
    expect(removed.get(4)).toBe(2)
    expect(removed.get(9)).toBe(3)
    expect(removed.get(25)).toBe(5)
    expect(removed.get(49)).toBe(7)
    expect(removed.has(2)).toBe(false)
    expect(removed.has(1)).toBe(false)
    expect(sieveReasons(12)).toEqual([2, 3])
    expect(sieveReasons(30)).toEqual([2, 3, 5])
    expect(sieveReasons(7)).toEqual([])
  })
})

describe('路程与字母式', () => {
  it('速度单位拆出路程单位与时间单位', () => {
    expect(distanceUnit('米/分')).toBe('米')
    expect(distanceUnit('千米/时')).toBe('千米')
    expect(distanceUnit(undefined)).toBe('米')
    expect(timeUnit('米/分')).toBe('分')
    expect(timeUnit(undefined, '分')).toBe('分')
  })

  it('速度 × 时间 展开成 t 段累加，末段 = 总路程', () => {
    const s = speedSegments(15, 3)
    expect(s.ends).toEqual([15, 30, 45])
    expect(s.total).toBe(45)
    expect(s.ends[s.ends.length - 1]).toBe(s.total)
    // 动车组：250 × 3 = 750
    expect(speedSegments(250, 3).total).toBe(750)
    // 段数超过上限时只画前若干段，总数不变
    const many = speedSegments(250, 24, 12)
    expect(many.total).toBe(6000)
    expect(many.shownSegments).toBe(12)
  })

  it('分段布局：段太窄时减少实际画的段数并给出剩余段数', () => {
    const wide = segmentLayout(15, 3, 330)
    expect(wide.segPx).toBeCloseTo(110, 6)
    expect(wide.shownSegments).toBe(3)
    expect(wide.restSegments).toBe(0)
    const narrow = segmentLayout(250, 24, 330)
    expect(narrow.segPx).toBeGreaterThanOrEqual(26)
    expect(narrow.shownSegments).toBeLessThan(24)
    expect(narrow.shownSegments + narrow.restSegments).toBe(24)
  })

  it('正方形格子边长：随最大边长定比例，图形随 a 单调变化且不超过画框', () => {
    const box = 240
    const maxA = 20
    const c20 = squareCell(20, maxA, box)
    expect(c20 * 20).toBeCloseTo(box, 6)
    expect(squareCell(10, maxA, box)).toBeCloseTo(c20, 6)
    expect(squareCell(10, maxA, box) * 10).toBeLessThan(squareCell(20, maxA, box) * 20)
    expect(squareCell(5, maxA, box) * 5).toBeLessThan(squareCell(10, maxA, box) * 10)
  })

  it('青蛙歌：嘴 = n、眼睛 = 2n、腿 = 4n，规律表逐行成立', () => {
    expect(frogCounts(4)).toEqual({ mouths: 4, eyes: 8, legs: 16 })
    const rows = frogRows(5)
    expect(rows.map((r) => r.n)).toEqual([1, 2, 3, 4, 5])
    expect(rows[0]).toEqual({ n: 1, mouths: 1, eyes: 2, legs: 4 })
    expect(rows[4]).toEqual({ n: 5, mouths: 5, eyes: 10, legs: 20 })
    for (const r of rows) {
      expect(r.eyes).toBe(2 * r.n)
      expect(r.legs).toBe(4 * r.n)
    }
  })
})
