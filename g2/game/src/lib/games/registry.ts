import type { Component } from 'vue'
import MultTableGame from '@/components/games/MultTableGame.vue'
import DivideQuizGame from '@/components/games/DivideQuizGame.vue'
import MixCalcGame from '@/components/games/MixCalcGame.vue'
import DivideShareGame from '@/components/games/DivideShareGame.vue'
import PlaceValueGame from '@/components/games/PlaceValueGame.vue'
import CompareQuizGame from '@/components/games/CompareQuizGame.vue'
import AbacusGame from '@/components/games/AbacusGame.vue'
import TwodigitCalcGame from '@/components/games/TwodigitCalcGame.vue'
import MoneyChangeGame from '@/components/games/MoneyChangeGame.vue'
import RemainderQuizGame from '@/components/games/RemainderQuizGame.vue'
import DirectionQuizGame from '@/components/games/DirectionQuizGame.vue'
import TangramQuizGame from '@/components/games/TangramQuizGame.vue'

/** 游戏 slug → 组件映射 */
export const GAME_COMPONENTS: Record<string, Component> = {
  'mult-table': MultTableGame,
  'divide-quiz': DivideQuizGame,
  'mix-calc': MixCalcGame,
  'divide-share': DivideShareGame,
  'place-value': PlaceValueGame,
  'compare-quiz': CompareQuizGame,
  abacus: AbacusGame,
  'twodigit-calc': TwodigitCalcGame,
  'money-change': MoneyChangeGame,
  'remainder-quiz': RemainderQuizGame,
  'direction-quiz': DirectionQuizGame,
  'tangram-quiz': TangramQuizGame,
}

export function gameComponentFor(slug: string): Component | undefined {
  return GAME_COMPONENTS[slug]
}
