import { randomOptions } from '../engine/generator'

export interface PuzzleQuestion {
  text: string
  answer: number
  options: number[]
}

/** 随机一道拼图题（数数或加减） */
export function newPuzzleQuestion(max = 9): PuzzleQuestion {
  if (Math.random() < 0.35) {
    const answer = 1 + Math.floor(Math.random() * max)
    const pool: number[] = []
    for (let i = 0; i <= max; i++) pool.push(i)
    return {
      text: `数一数，有几个🍎？`,
      answer,
      options: randomOptions(answer, pool, 4),
    }
  }
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
  return { text: `${a} ${op} ${b} = ?`, answer, options: randomOptions(answer, pool, 4) }
}

/** 3×3 拼图底图（emoji 画） */
export const PUZZLE_ART: string[][] = [
  ['🐱', '🐱', '🐱'],
  ['🐱', '😺', '🐱'],
  ['🐱', '🐱', '🐱'],
]