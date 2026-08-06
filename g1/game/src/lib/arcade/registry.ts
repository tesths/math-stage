import type { Component } from 'vue'
import MemoryGame from '@/components/arcade/MemoryGame.vue'
import FriendGame from '@/components/arcade/FriendGame.vue'
import GoFishGame from '@/components/arcade/GoFishGame.vue'
import GuessGame from '@/components/arcade/GuessGame.vue'
import BalanceGame from '@/components/arcade/BalanceGame.vue'
import BoardRaceGame from '@/components/arcade/BoardRaceGame.vue'
import FrogJumpGame from '@/components/arcade/FrogJumpGame.vue'
import MazeGame from '@/components/arcade/MazeGame.vue'
import RocketGame from '@/components/arcade/RocketGame.vue'
import PatternGame from '@/components/arcade/PatternGame.vue'
import RelayGame from '@/components/arcade/RelayGame.vue'
import PuzzleGame from '@/components/arcade/PuzzleGame.vue'
import WhackGame from '@/components/arcade/WhackGame.vue'
import CodeBreakGame from '@/components/arcade/CodeBreakGame.vue'
import PickingGame from '@/components/arcade/PickingGame.vue'
import ShapeRiddleGame from '@/components/arcade/ShapeRiddleGame.vue'
import ShapeBuildGame from '@/components/arcade/ShapeBuildGame.vue'
import WarBattleGame from '@/components/arcade/WarBattleGame.vue'
import SudokuGame from '@/components/arcade/SudokuGame.vue'
import MatchstickGame from '@/components/arcade/MatchstickGame.vue'

/** 游戏 slug → 组件映射 */
export const ARCADE_COMPONENTS: Record<string, Component> = {
  memory: MemoryGame,
  friend: FriendGame,
  gofish: GoFishGame,
  guess: GuessGame,
  balance: BalanceGame,
  boardrace: BoardRaceGame,
  frogjump: FrogJumpGame,
  maze: MazeGame,
  rocket: RocketGame,
  pattern: PatternGame,
  relay: RelayGame,
  puzzle: PuzzleGame,
  whack: WhackGame,
  codebreak: CodeBreakGame,
  picking: PickingGame,
  shaperiddle: ShapeRiddleGame,
  shapebuild: ShapeBuildGame,
  warbattle: WarBattleGame,
  sudoku: SudokuGame,
  matchstick: MatchstickGame,
}

export function arcadeComponentFor(slug: string): Component | undefined {
  return ARCADE_COMPONENTS[slug]
}
