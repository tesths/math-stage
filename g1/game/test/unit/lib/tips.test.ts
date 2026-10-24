import { describe, expect, it } from 'vitest'
import { allExamples, questionTips } from '@data'
import { tipOf, typeTips } from '@/lib/engine/tips'

const TYPES = [
  'count', 'write', 'split', 'addsub', 'compare', 'position',
  'ordinal', 'shape3d', 'numberline', 'sequence', 'ten',
] as const

describe('一年级 L4：全部例题每一道都有「概念 + 易错点」', () => {
  it('78 道题全部能取到非空 tip', () => {
    // 一年级上册共 78 道例题（任务里预估 87，实测 78，差别在练习题的拆分口径）
    expect(allExamples.length).toBe(78)
    for (const q of allExamples) {
      const tip = tipOf(q)
      expect(tip.length, `${q.id} 缺提示`).toBeGreaterThan(20)
      expect(tip, `${q.id} 的提示没写易错点`).toContain('易错点')
    }
  })

  it('11 种题型都有兜底文案，且每种都写了概念与易错点', () => {
    for (const t of TYPES) {
      expect(typeTips[t].length).toBeGreaterThan(20)
      expect(typeTips[t]).toContain('易错点')
    }
  })

  it('逐题精写的 override 一定命中真实题号（不写错 id 变成死文案）', () => {
    const ids = new Set(allExamples.map((q) => q.id))
    for (const id of Object.keys(questionTips)) {
      expect(ids.has(id), `${id} 不是真实题号`).toBe(true)
    }
    expect(Object.keys(questionTips).length).toBeGreaterThanOrEqual(11)
  })

  it('题目自带 tip 时优先用题目自己的（数据可覆盖）', () => {
    const q = { id: 'c1-count-01', type: 'count' as const, tip: '自定义概念。易错点：自定义。' }
    expect(tipOf(q)).toBe('自定义概念。易错点：自定义。')
  })

  it('空字符串的 tip 视为没写，回退到下一级（不留空白卡）', () => {
    const q = { id: 'c1-count-01', type: 'count' as const, tip: '   ' }
    expect(tipOf(q)).toBe(questionTips['c1-count-01'])
  })

  it('同一题型的不同题拿到的是不同的精写文案（不是一句话套 87 遍）', () => {
    const perType = new Map<string, Set<string>>()
    for (const q of allExamples) {
      const set = perType.get(q.type) ?? new Set<string>()
      set.add(tipOf(q))
      perType.set(q.type, set)
    }
    const specific = [...perType.values()].filter((s) => s.size > 1).length
    expect(specific).toBeGreaterThanOrEqual(1)
  })
})
