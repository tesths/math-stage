import { describe, expect, it } from 'vitest'
import { allLabs, byChapter, findLabById, totalLabs } from '@data'
import { validateLabs } from '@data/schema/validate'

describe('五年级 Lab 数据', () => {
  it('id 唯一、参数合法（validateLabs 无错误）', () => {
    expect(validateLabs()).toEqual([])
  })

  it('覆盖 8 个有 Lab 的单元，共 33 个 Lab', () => {
    expect(totalLabs).toBe(33)
    expect(byChapter.filter((c) => c.labs.length > 0).length).toBe(8)
  })

  it('findLabById 能取到每个 Lab', () => {
    for (const l of allLabs) {
      expect(findLabById(l.id)?.id).toBe(l.id)
    }
  })

  it('每个 Lab 都有公式、标题与「重点概念」提示（页面 ConceptTip 卡的数据来源）', () => {
    for (const l of allLabs) {
      expect(l.formula.length).toBeGreaterThan(0)
      expect(l.title.length).toBeGreaterThan(0)
      expect((l.tip ?? '').trim().length).toBeGreaterThan(0)
      expect(l.page).toBeGreaterThan(0)
      expect(l.source.length).toBeGreaterThan(0)
    }
  })

  it('单元书页区间合法', () => {
    for (const c of byChapter) {
      expect(c.meta.pageStart).toBeLessThanOrEqual(c.meta.pageEnd)
      expect(c.meta.tocLabel.length).toBeGreaterThan(0)
    }
  })
})
