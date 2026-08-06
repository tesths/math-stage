import { randomOptions } from '../engine/generator'

export interface FrogRound {
  from: number
  steps: number
  answer: number
  options: number[]
}

/** 生成一局青蛙跳（落点不超过 maxTarget） */
export function newFrogRound(maxTarget = 19): FrogRound {
  const from = 1 + Math.floor(Math.random() * (maxTarget - 3))
  const steps = 1 + Math.floor(Math.random() * 3)
  const answer = Math.min(maxTarget, from + steps)
  const pool: number[] = []
  for (let i = Math.max(0, from - 2); i <= maxTarget; i++) pool.push(i)
  return { from, steps, answer, options: randomOptions(answer, pool, 4) }
}