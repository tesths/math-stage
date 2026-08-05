import type { Component } from 'vue'
import DivQuizGame from '@/components/games/DivQuizGame.vue'
import DivTryQuizGame from '@/components/games/DivTryQuizGame.vue'
import PerimeterQuizGame from '@/components/games/PerimeterQuizGame.vue'
import AreaQuizGame from '@/components/games/AreaQuizGame.vue'
import AreaUnitQuizGame from '@/components/games/AreaUnitQuizGame.vue'
import PriceQuizGame from '@/components/games/PriceQuizGame.vue'
import SpeedQuizGame from '@/components/games/SpeedQuizGame.vue'
import MixCalcQuizGame from '@/components/games/MixCalcQuizGame.vue'
import ApproxQuizGame from '@/components/games/ApproxQuizGame.vue'
import BigMulQuizGame from '@/components/games/BigMulQuizGame.vue'

/** 游戏 slug → 组件映射 */
export const GAME_COMPONENTS: Record<string, Component> = {
  'div-quiz': DivQuizGame,
  'div-try-quiz': DivTryQuizGame,
  'perimeter-quiz': PerimeterQuizGame,
  'area-quiz': AreaQuizGame,
  'area-unit-quiz': AreaUnitQuizGame,
  'price-quiz': PriceQuizGame,
  'speed-quiz': SpeedQuizGame,
  'mix-calc-quiz': MixCalcQuizGame,
  'approx-quiz': ApproxQuizGame,
  'big-mul-quiz': BigMulQuizGame,
}

export function gameComponentFor(slug: string): Component | undefined {
  return GAME_COMPONENTS[slug]
}
