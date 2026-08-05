import type { Component } from 'vue'
import MixQuizGame from '@/components/games/MixQuizGame.vue'
import Time24QuizGame from '@/components/games/Time24QuizGame.vue'
import ElapsedQuizGame from '@/components/games/ElapsedQuizGame.vue'
import MulOralGame from '@/components/games/MulOralGame.vue'
import MulPenQuizGame from '@/components/games/MulPenQuizGame.vue'
import WeightQuizGame from '@/components/games/WeightQuizGame.vue'
import TallyQuizGame from '@/components/games/TallyQuizGame.vue'
import LengthQuizGame from '@/components/games/LengthQuizGame.vue'
import MotionQuizGame from '@/components/games/MotionQuizGame.vue'
import AxisQuizGame from '@/components/games/AxisQuizGame.vue'
import DivOralGame from '@/components/games/DivOralGame.vue'
import DivPenQuizGame from '@/components/games/DivPenQuizGame.vue'
import IntervalQuizGame from '@/components/games/IntervalQuizGame.vue'
import SegmentQuizGame from '@/components/games/SegmentQuizGame.vue'
import ViewsQuizGame from '@/components/games/ViewsQuizGame.vue'
import TimesQuizGame from '@/components/games/TimesQuizGame.vue'

/** 游戏 slug → 组件映射 */
export const GAME_COMPONENTS: Record<string, Component> = {
  'mix-quiz': MixQuizGame,
  'time24-quiz': Time24QuizGame,
  'elapsed-quiz': ElapsedQuizGame,
  'mul-oral-game': MulOralGame,
  'mul-pen-quiz': MulPenQuizGame,
  'weight-quiz': WeightQuizGame,
  'tally-quiz': TallyQuizGame,
  'length-quiz': LengthQuizGame,
  'motion-quiz': MotionQuizGame,
  'axis-quiz': AxisQuizGame,
  'div-oral-game': DivOralGame,
  'div-pen-quiz': DivPenQuizGame,
  'interval-quiz': IntervalQuizGame,
  'segment-quiz': SegmentQuizGame,
  'views-quiz': ViewsQuizGame,
  'times-quiz': TimesQuizGame,
}

export function gameComponentFor(slug: string): Component | undefined {
  return GAME_COMPONENTS[slug]
}
