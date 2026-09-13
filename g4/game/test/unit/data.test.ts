import { describe, expect, it } from 'vitest'
import { allLabs, byChapter, findLabById, totalLabs } from '@data'
import { validateLabs } from '@data/schema/validate'

describe('四年级 Lab 数据', () => {
  it('id 唯一、参数合法（validateLabs 无错误）', () => {
    expect(validateLabs()).toEqual([])

    const areaUnitLab = findLabById('g4-c2-area-unit')!
    const invalidDefaultLab = {
      ...areaUnitLab,
      params: areaUnitLab.params.map((p) => (p.key === 'dir' ? { ...p, default: 3 } : p)),
    }
    expect(validateLabs([invalidDefaultLab])).toContain('g4-c2-area-unit: 参数 dir 默认值超出范围')
    expect(validateLabs([invalidDefaultLab])).toContain('g4-c2-area-unit: 参数 dir 默认值不在 choices 中')

    const duplicateChoiceLab = {
      ...areaUnitLab,
      params: areaUnitLab.params.map((p) =>
        p.key === 'pair'
          ? { ...p, choices: [...p.choices!, { value: 1, label: '重复单位组' }] }
          : p,
      ),
    }
    expect(validateLabs([duplicateChoiceLab])).toContain('g4-c2-area-unit: 参数 pair choice 1 重复')
  })

  it('覆盖 9 个有 Lab 的单元，共 28 个 Lab', () => {
    expect(totalLabs).toBe(28)
    expect(byChapter.filter((c) => c.labs.length > 0).length).toBe(9)
  })

  it('findLabById 能取到每个 Lab', () => {
    for (const l of allLabs) {
      expect(findLabById(l.id)?.id).toBe(l.id)
    }
  })

  it('每个 Lab 都有公式与提示', () => {
    for (const l of allLabs) {
      expect(l.formula.length).toBeGreaterThan(0)
      expect(l.title.length).toBeGreaterThan(0)
      expect(l.prompt.length).toBeGreaterThan(0)
    }
  })

  it('单元书页区间合法', () => {
    for (const c of byChapter) {
      expect(c.meta.pageStart).toBeLessThanOrEqual(c.meta.pageEnd)
      expect(c.meta.tocLabel.length).toBeGreaterThan(0)
    }
  })
})
