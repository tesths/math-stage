import type { Component } from 'vue'
import AreaRaceGame from '@/components/games/AreaRaceGame.vue'
import DecimalQuizGame from '@/components/games/DecimalQuizGame.vue'
import DecimalPointGame from '@/components/games/DecimalPointGame.vue'
import FactorHuntGame from '@/components/games/FactorHuntGame.vue'
import PrimeDashGame from '@/components/games/PrimeDashGame.vue'
import GcdLcmQuizGame from '@/components/games/GcdLcmQuizGame.vue'
import MoveQuizGame from '@/components/games/MoveQuizGame.vue'
import CoinFlipGame from '@/components/games/CoinFlipGame.vue'
import UnitConvertGame from '@/components/games/UnitConvertGame.vue'
import ViewsQuizGame from '@/components/games/ViewsQuizGame.vue'

/** 游戏 slug → 组件映射 */
export const GAME_COMPONENTS: Record<string, Component> = {
  'area-race': AreaRaceGame,
  'decimal-quiz': DecimalQuizGame,
  'decimal-point': DecimalPointGame,
  'factor-hunt': FactorHuntGame,
  'prime-dash': PrimeDashGame,
  'gcdlcm-quiz': GcdLcmQuizGame,
  'move-quiz': MoveQuizGame,
  'coin-flip': CoinFlipGame,
  'unit-convert': UnitConvertGame,
  'views-quiz': ViewsQuizGame,
}

export function gameComponentFor(slug: string): Component | undefined {
  return GAME_COMPONENTS[slug]
}
