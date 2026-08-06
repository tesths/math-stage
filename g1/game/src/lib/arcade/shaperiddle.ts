import { shuffle } from '../engine/generator'

export type ShapeName = '长方体' | '正方体' | '圆柱' | '球'

export interface RiddleRound {
  target: ShapeName
  clue: string
  options: ShapeName[]
  art: string
}

export const SHAPE_INFO: Record<ShapeName, { art: string; clues: string[] }> = {
  长方体: {
    art: '📦',
    clues: ['6 个面平平的，像装快递的盒子', '长长方的，六个面都是长方形', '像粉笔盒、文具盒那样'],
  },
  正方体: {
    art: '🧊',
    clues: ['6 个面都平平的，而且每个面都一样大', '像魔方那样，不管哪面看都一模一样', '像小方糖、骰子'],
  },
  圆柱: {
    art: '🥫',
    clues: ['上下一样粗，两头都是圆的', '像易拉罐、电池，放倒可以滚', '上下两个平平的圆面'],
  },
  球: {
    art: '⚽',
    clues: ['圆滚滚的，放在地上到处都能滚', '从哪边看都是圆的，像皮球、足球'],
  },
}

const SHAPES: ShapeName[] = ['长方体', '正方体', '圆柱', '球']

/** 随机一题图形猜谜（target 轮换，选项随机） */
export function newRiddleRound(round: number): RiddleRound {
  const target = SHAPES[round % SHAPES.length]!
  const info = SHAPE_INFO[target]!
  const clue = info.clues[Math.floor(Math.random() * info.clues.length)]!
  const options = shuffle(SHAPES.filter((s) => s !== target)).slice(0, 3)
  return { target, clue, options: shuffle([target, ...options]), art: info.art }
}