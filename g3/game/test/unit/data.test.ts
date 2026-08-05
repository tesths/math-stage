import { describe, expect, it } from 'vitest'
import { allLabs, byChapter, findLabById, totalLabs } from '@data'
import { validateLabs } from '@data/schema/validate'

describe('三年级 Lab 数据', () => {
  it('id 唯一、参数合法（validateLabs 无错误）', () => {
    expect(validateLabs()).toEqual([])
  })

  it('覆盖 12 个有 Lab 的单元，共 41 个 Lab', () => {
    expect(totalLabs).toBe(41)
    expect(byChapter.filter((c) => c.labs.length > 0).length).toBe(12)
  })

  it('findLabById 能取到每个 Lab', () => {
    for (const l of allLabs) {
      expect(findLabById(l.id)?.id).toBe(l.id)
    }
    expect(findLabById('no-such-id')).toBeUndefined()
  })

  it('每个 Lab 都有公式、提示与参数', () => {
    for (const l of allLabs) {
      expect(l.formula.length).toBeGreaterThan(0)
      expect(l.title.length).toBeGreaterThan(0)
      expect(l.params.length).toBeGreaterThan(0)
    }
  })

  it('每个 Lab id 带 g3- 前缀且 kind 合法', () => {
    for (const l of allLabs) {
      expect(l.id.startsWith('g3-')).toBe(true)
      expect(l.kind.length).toBeGreaterThan(0)
    }
  })

  it('单元书页区间合法（综合实践/探索单元无目录序号）', () => {
    for (const c of byChapter) {
      expect(c.meta.pageStart).toBeLessThanOrEqual(c.meta.pageEnd)
      expect(c.labs.length).toBeGreaterThan(0)
    }
    // 有 tocLabel 的单元序号递增（汉字序号不能直接比较，需映射为数字）
    const NUM = new Map([
      ['一', 1],
      ['二', 2],
      ['三', 3],
      ['四', 4],
      ['五', 5],
      ['六', 6],
      ['七', 7],
      ['八', 8],
    ])
    const numbered = byChapter.filter((c) => c.meta.tocLabel)
    for (let i = 1; i < numbered.length; i++) {
      const prev = NUM.get(numbered[i - 1]!.meta.tocLabel!)
      const cur = NUM.get(numbered[i]!.meta.tocLabel!)
      expect(prev).toBeDefined()
      expect(cur).toBeDefined()
      expect(cur! > prev!).toBe(true)
    }
  })

  it('综合实践/探索单元数量（c2/c4/c5/c9/c12 无 tocLabel）', () => {
    const noToc = byChapter.filter((c) => !c.meta.tocLabel).map((c) => c.meta.id)
    expect(noToc).toEqual(['c2', 'c4', 'c5', 'c9', 'c12'])
  })
})
