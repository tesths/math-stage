import { describe, expect, it } from 'vitest'
import { GAMES, unitNoOf } from '@/lib/games'
import { gameComponentFor } from '@/lib/games/registry'
import { labComponentFor } from '@/lib/labs/registry'
import { allLabs } from '@data'

describe('注册表完整性', () => {
  it('每个游戏 slug 都有组件', () => {
    for (const m of GAMES) {
      expect(gameComponentFor(m.slug)).toBeDefined()
      expect(m.chapters.length).toBeGreaterThan(0)
    }
  })

  it('每个 Lab kind 都有组件', () => {
    const seen = new Set<string>()
    for (const l of allLabs) {
      if (seen.has(l.kind)) continue
      seen.add(l.kind)
      expect(labComponentFor(l.kind)).toBeDefined()
    }
    expect(seen.size).toBeGreaterThan(8)
  })

  it('unitNoOf 映射正确', () => {
    expect(unitNoOf('c1')).toBe(1)
    expect(unitNoOf('c8')).toBe(8)
  })

  it('游戏 slug 唯一', () => {
    const slugs = GAMES.map((m) => m.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
