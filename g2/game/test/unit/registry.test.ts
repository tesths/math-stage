import { describe, expect, it } from 'vitest'
import { allLabs } from '@data'
import { labComponentFor } from '@/lib/labs/registry'
import { gameComponentFor } from '@/lib/games/registry'
import { GAMES, unitNoOf } from '@/lib/games'

describe('Lab 组件注册表', () => {
  it('全部 17 个 kind 都映射到组件', () => {
    const kinds = new Set(allLabs.map((l) => l.kind))
    expect(kinds.size).toBe(17)
    for (const k of kinds) {
      expect(labComponentFor(k)).toBeTruthy()
    }
  })

  it('未知 kind 返回 undefined', () => {
    expect(labComponentFor('unknown' as never)).toBeUndefined()
  })
})

describe('游戏注册表', () => {
  it('12 个游戏全部映射到组件', () => {
    expect(GAMES.length).toBe(12)
    const slugs = new Set(GAMES.map((m) => m.slug))
    expect(slugs.size).toBe(12)
    for (const s of slugs) {
      expect(gameComponentFor(s)).toBeTruthy()
    }
  })

  it('游戏 slug 唯一且 chapters 引用存在的单元', () => {
    for (const m of GAMES) {
      expect(m.summary.length).toBeGreaterThan(0)
      expect(m.howTo.length).toBeGreaterThan(0)
      expect(m.chapters.length).toBeGreaterThan(0)
    }
  })

  it('未知 slug 返回 undefined', () => {
    expect(gameComponentFor('nope')).toBeUndefined()
  })

  it('unitNoOf 返回单元序号', () => {
    expect(unitNoOf('c1')).toBe(1)
    expect(unitNoOf('c3')).toBe(3)
    expect(unitNoOf('c10')).toBe(10)
  })
})
