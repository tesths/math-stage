import { describe, it, expect } from 'vitest'
import { allExamples, chapters, byChapter } from '@data/index'
import { validateAll, validateChapters, validateQuestion } from '@data/schema/validate'
import type { GameType } from '@data/schema/example'

describe('例题数据完整性', () => {
  it('全部例题通过 schema 语义校验', () => {
    const result = validateAll(allExamples)
    expect(result.errors).toEqual([])
  })

  it('单元元数据通过校验', () => {
    const result = validateChapters(chapters)
    expect(result.errors).toEqual([])
  })

  it('例题 id 全局唯一', () => {
    const ids = allExamples.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThanOrEqual(55)
  })

  it('每个例题的书页码落在所属单元区间内', () => {
    const meta = new Map(chapters.map((c) => [c.id, c]))
    for (const e of allExamples) {
      const m = meta.get(e.chapter)
      expect(m, `${e.id} 的 chapter=业务${e.chapter} 无元数据`).toBeDefined()
      expect(e.page).toBeGreaterThanOrEqual(m!.pageStart)
      expect(e.page).toBeLessThanOrEqual(m!.pageEnd)
    }
  })

  it('每单元覆盖各类题型', () => {
    const typeByChapter: Record<string, Set<GameType>> = {}
    for (const c of byChapter) {
      typeByChapter[c.meta.id] = new Set(c.examples.map((e) => e.type))
    }
    expect(typeByChapter.c2).toContain('ordinal')
    expect(typeByChapter.c2).toContain('compare')
    expect(typeByChapter.c2).toContain('addsub')
    expect(typeByChapter.c2).toContain('write')
    expect(typeByChapter.c4).toContain('split')
    expect(typeByChapter.c4).toContain('ordinal')
    expect(typeByChapter.c4).toContain('addsub')
    expect(typeByChapter.c5).toContain('shape3d')
    expect(typeByChapter.c6).toContain('split')
    expect(typeByChapter.c8).toContain('numberline')
    expect(typeByChapter.c3).toContain('position')
    expect(typeByChapter.c6).toContain('ten') || expect(typeByChapter.c7).toContain('ten')
    expect(typeByChapter.c7).toContain('ten')
  })
})

describe('题型覆盖广度', () => {
  it('主要 8 种题型均有出现', () => {
    const types = new Set(allExamples.map((e) => e.type))
    for (const t of ['count', 'split', 'addsub', 'compare', 'position', 'shape3d', 'numberline', 'ten'] as GameType[]) {
      expect(types.has(t), `缺少题型 ${t}`).toBe(true)
    }
  })
})