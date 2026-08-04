import { describe, it, expect } from 'vitest'
import { GAME_COMPONENTS, gameComponentFor } from '@/lib/engine/registry'
import type { GameType } from '@data/schema/example'
import CountGame from '@/components/games/CountGame.vue'
import SplitGame from '@/components/games/SplitGame.vue'
import AddSubGame from '@/components/games/AddSubGame.vue'
import CompareGame from '@/components/games/CompareGame.vue'
import PositionGame from '@/components/games/PositionGame.vue'
import Shape3DGame from '@/components/games/Shape3DGame.vue'
import NumberLineGame from '@/components/games/NumberLineGame.vue'
import TenGame from '@/components/games/TenGame.vue'

describe('engine/registry', () => {
  it('覆盖全部 11 种题型', () => {
    const types: GameType[] = [
      'count', 'write', 'split', 'addsub', 'compare', 'position',
      'ordinal', 'shape3d', 'numberline', 'sequence', 'ten',
    ]
    for (const t of types) {
      expect(GAME_COMPONENTS[t]).toBeDefined()
    }
    expect(Object.keys(GAME_COMPONENTS).length).toBe(11)
  })

  it('题型映射到正确组件', () => {
    expect(gameComponentFor('count')).toBe(CountGame)
    expect(gameComponentFor('write')).toBe(CountGame)
    expect(gameComponentFor('split')).toBe(SplitGame)
    expect(gameComponentFor('addsub')).toBe(AddSubGame)
    expect(gameComponentFor('compare')).toBe(CompareGame)
    expect(gameComponentFor('position')).toBe(PositionGame)
    expect(gameComponentFor('ordinal')).toBe(PositionGame)
    expect(gameComponentFor('shape3d')).toBe(Shape3DGame)
    expect(gameComponentFor('numberline')).toBe(NumberLineGame)
    expect(gameComponentFor('sequence')).toBe(NumberLineGame)
    expect(gameComponentFor('ten')).toBe(TenGame)
  })
})
