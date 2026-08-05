import { describe, expect, it } from 'vitest'
import { allLabs, byChapter, findLabById, totalLabs, labsOfChapter, firstLabOf } from '@data'
import { validateLabs } from '@data/schema/validate'
import { KIND_LABELS } from '@/lib/engine/math'

describe('六年级 Lab 数据', () => {
  it('id 唯一、参数合法（validateLabs 无错误）', () => {
    expect(validateLabs()).toEqual([])
  })

  it('覆盖 7 个有 Lab 的单元，共 33 个 Lab', () => {
    expect(totalLabs).toBe(33)
    expect(byChapter.filter((c) => c.labs.length > 0).length).toBe(7)
  })

  it('findLabById 能取到每个 Lab', () => {
    for (const l of allLabs) {
      expect(findLabById(l.id)?.id).toBe(l.id)
    }
  })

  it('每个 Lab 都有公式、标题与提示', () => {
    for (const l of allLabs) {
      expect(l.title.length).toBeGreaterThan(0)
      expect(l.formula.length).toBeGreaterThan(0)
      expect(l.tip.length).toBeGreaterThan(0)
    }
  })

  it('每个 Lab 的 kind 都能在 KIND_LABELS 中找到中文标签', () => {
    for (const l of allLabs) {
      expect(KIND_LABELS[l.kind]).toBeTruthy()
    }
  })

  it('每个 Lab 都有对应的 Lab 组件（registry 非空）', async () => {
    const { labComponentFor } = await import('@/lib/labs/registry')
    for (const l of allLabs) {
      expect(labComponentFor(l.kind)).toBeTruthy()
    }
  })

  it('单元书页区间合法', () => {
    for (const c of byChapter) {
      expect(c.meta.pageStart).toBeLessThanOrEqual(c.meta.pageEnd)
      expect(c.meta.tocLabel.length).toBeGreaterThan(0)
      expect(c.meta.icon.length).toBeGreaterThan(0)
    }
  })

  it('labsOfChapter / firstLabOf', () => {
    expect(labsOfChapter('c1').length).toBe(6)
    expect(firstLabOf('c1')).toBe('g6-c1-mul-decimal')
    expect(labsOfChapter('c7').length).toBe(2)
  })
})
