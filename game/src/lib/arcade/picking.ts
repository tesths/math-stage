import { randomOptions } from '../engine/generator'

export interface PickingRound {
  /** total: 一共摘了几个 / left: 还剩几个 */
  mode: 'total' | 'left'
  initial: number
  /** 每次摘的数量 */
  picks: number[]
  answer: number
  options: number[]
}

/** 生成一局摘果子（5 轮里 total/left 交替） */
export function newPickingRound(round: number, max = 12): PickingRound {
  const mode: PickingRound['mode'] = round % 2 === 1 ? 'total' : 'left'
  const pickCount = 1 + Math.floor(Math.random() * 2)
  const picks: number[] = []
  let sum = 0
  for (let i = 0; i < pickCount; i++) {
    const p = 1 + Math.floor(Math.random() * 4)
    picks.push(p)
    sum += p
  }
  const initial = Math.min(max, sum + 2 + Math.floor(Math.random() * 4))
  const answer = mode === 'total' ? sum : initial - sum
  const pool: number[] = []
  for (let i = 0; i <= max; i++) pool.push(i)
  return { mode, initial, picks, answer, options: randomOptions(answer, pool, 4) }
}