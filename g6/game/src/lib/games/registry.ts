import type { Component } from 'vue'
import DecimalMulGame from '@/components/games/DecimalMulGame.vue'
import DecimalDivGame from '@/components/games/DecimalDivGame.vue'
import DecimalPointsGame from '@/components/games/DecimalPointsGame.vue'
import MixCalcGame from '@/components/games/MixCalcGame.vue'
import FracFindGame from '@/components/games/FracFindGame.vue'
import TaxiFareGame from '@/components/games/TaxiFareGame.vue'
import BinaryQuizGame from '@/components/games/BinaryQuizGame.vue'
import CompareQuizGame from '@/components/games/CompareQuizGame.vue'
import RatioSimplifyGame from '@/components/games/RatioSimplifyGame.vue'
import SolveRatioGame from '@/components/games/SolveRatioGame.vue'
import CircleCalcGame from '@/components/games/CircleCalcGame.vue'
import ScaleMapGame from '@/components/games/ScaleMapGame.vue'

/** 游戏 slug → 组件映射 */
export const GAME_COMPONENTS: Record<string, Component> = {
  'decimal-mul': DecimalMulGame,
  'decimal-div': DecimalDivGame,
  'decimal-points': DecimalPointsGame,
  'mix-calc': MixCalcGame,
  'frac-find': FracFindGame,
  'taxi-fare': TaxiFareGame,
  'binary-quiz': BinaryQuizGame,
  'compare-quiz': CompareQuizGame,
  'ratio-simplify': RatioSimplifyGame,
  'solve-ratio': SolveRatioGame,
  'circle-calc': CircleCalcGame,
  'scale-map': ScaleMapGame,
}

export function gameComponentFor(slug: string): Component | undefined {
  return GAME_COMPONENTS[slug]
}
