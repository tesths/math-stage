import { randomOptions } from '../engine/generator'

export interface RaceQuestion {
  a: number
  b: number
  op: '+' | '-'
  answer: number
  options: number[]
  text: string
}

/** 掷骰子 1~6 */
export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6)
}

/** 生成一道 10 以内口算题 */
export function newRaceQuestion(max = 9): RaceQuestion {
  const op = Math.random() < 0.5 ? '+' : '-'
  let a: number
  let b: number
  let answer: number
  if (op === '+') {
    a = 1 + Math.floor(Math.random() * (max - 1))
    b = 1 + Math.floor(Math.random() * (max - a))
    answer = a + b
  } else {
    a = 2 + Math.floor(Math.random() * (max - 1))
    b = 1 + Math.floor(Math.random() * (a - 1))
    answer = a - b
  }
  const pool: number[] = []
  for (let i = 0; i <= max; i++) pool.push(i)
  return {
    a,
    b,
    op,
    answer,
    options: randomOptions(answer, pool, 4),
    text: `${a} ${op} ${b} = ?`,
  }
}

/** 赛道特殊格（问号格答题） */
export const RACE_GOAL = 20
export const RACE_QUESTION_CELLS = new Set([4, 7, 11, 14, 17])