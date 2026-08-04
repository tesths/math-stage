import type { Component } from 'vue'
import type { GameType } from '@data/schema/example'
import CountGame from '@/components/games/CountGame.vue'
import SplitGame from '@/components/games/SplitGame.vue'
import AddSubGame from '@/components/games/AddSubGame.vue'
import CompareGame from '@/components/games/CompareGame.vue'
import PositionGame from '@/components/games/PositionGame.vue'
import OrdinalGame from '@/components/games/PositionGame.vue'
import Shape3DGame from '@/components/games/Shape3DGame.vue'
import NumberLineGame from '@/components/games/NumberLineGame.vue'
import TenGame from '@/components/games/TenGame.vue'

/** 题型 → 游戏组件 映射（页面路由用 <component :is> 动态渲染） */
export const GAME_COMPONENTS: Record<GameType, Component> = {
  count: CountGame,
  write: CountGame, // write 复用 CountGame（计数器模式）
  split: SplitGame,
  addsub: AddSubGame,
  compare: CompareGame,
  position: PositionGame,
  ordinal: OrdinalGame,
  shape3d: Shape3DGame,
  numberline: NumberLineGame,
  sequence: NumberLineGame, // sequence 复用 NumberLineGame（顺数接龙）
  ten: TenGame,
}

export function gameComponentFor(type: GameType): Component {
  return GAME_COMPONENTS[type]
}