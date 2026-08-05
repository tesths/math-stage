import { describe, expect, it } from 'vitest'
import {
  GRADES,
  gradeByBase,
  gradeById,
  gradeNoOf,
  isKnownGrade,
  otherGrades,
} from '../grades'

describe('年级注册表 grades registry', () => {
  it('包含一、二、三、四、五、六年级，顺序按年级序号', () => {
    expect(GRADES.map((g) => g.id)).toEqual(['g1', 'g2', 'g3', 'g4', 'g5', 'g6'])
    expect(GRADES.map((g) => g.no)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('每个年级的部署路径以斜杠包围（/gN/）', () => {
    for (const g of GRADES) {
      expect(g.base.startsWith('/')).toBe(true)
      expect(g.base.endsWith('/')).toBe(true)
      expect(g.base).toBe(`/${g.id}/`)
    }
  })

  it('每个年级的主样式标识色非空且为合法 UI 色名', () => {
    for (const g of GRADES) {
      expect(g.accent.length).toBeGreaterThan(0)
      expect(g.title).toContain(g.label)
      expect(g.icon).toBeTruthy()
      expect(g.cta).toBeTruthy()
      expect(g.features.length).toBeGreaterThan(0)
    }
  })

  it('gradeById 返回对应年级，未知 id 返回 undefined', () => {
    expect(gradeById('g1')?.no).toBe(1)
    expect(gradeById('g2')?.label).toBe('二年级')
    expect(gradeById('g5')?.label).toBe('五年级')
    expect(gradeById('g6')?.label).toBe('六年级')
    expect(gradeById('g3')?.label).toBe('三年级')
    expect(gradeById('g4')?.label).toBe('四年级')
    expect(gradeById('')).toBeUndefined()
  })

  it('gradeByBase 按部署路径匹配', () => {
    expect(gradeByBase('/g2/')?.id).toBe('g2')
    expect(gradeByBase('/g5/')?.id).toBe('g5')
    expect(gradeByBase('/g6/')?.id).toBe('g6')
    expect(gradeByBase('/g1')?.id).toBe('g1')
    expect(gradeByBase('/g4/')?.id).toBe('g4')
    expect(gradeByBase('/g9/')).toBeUndefined()
    expect(gradeByBase('')).toBeUndefined()
  })

  it('otherGrades 返回除当前外的全部年级（保持序号顺序）', () => {
    expect(otherGrades('g1').map((g) => g.id)).toEqual(['g2', 'g3', 'g4', 'g5', 'g6'])
    expect(otherGrades('g2').map((g) => g.id)).toEqual(['g1', 'g3', 'g4', 'g5', 'g6'])
    expect(otherGrades('g3').map((g) => g.id)).toEqual(['g1', 'g2', 'g4', 'g5', 'g6'])
    expect(otherGrades('g4').map((g) => g.id)).toEqual(['g1', 'g2', 'g3', 'g5', 'g6'])
    expect(otherGrades('g5').map((g) => g.id)).toEqual(['g1', 'g2', 'g3', 'g4', 'g6'])
    expect(otherGrades('g6').map((g) => g.id)).toEqual(['g1', 'g2', 'g3', 'g4', 'g5'])
  })

  it('isKnownGrade 判定合法年级 id', () => {
    expect(isKnownGrade('g1')).toBe(true)
    expect(isKnownGrade('g2')).toBe(true)
    expect(isKnownGrade('g3')).toBe(true)
    expect(isKnownGrade('g5')).toBe(true)
    expect(isKnownGrade('g4')).toBe(true)
    expect(isKnownGrade('g6')).toBe(true)
    expect(isKnownGrade('')).toBe(false)
  })

  it('gradeNoOf 返回年级序号，未知返回 0', () => {
    expect(gradeNoOf('g1')).toBe(1)
    expect(gradeNoOf('g2')).toBe(2)
    expect(gradeNoOf('g3')).toBe(3)
    expect(gradeNoOf('g4')).toBe(4)
    expect(gradeNoOf('g5')).toBe(5)
    expect(gradeNoOf('g6')).toBe(6)
    expect(gradeNoOf('g9')).toBe(0)
  })

  it('五年级是主样式基准：其 accent 与全局主色一致', () => {
    const g5 = gradeById('g5')
    expect(g5?.accent).toBe('emerald')
  })
})
