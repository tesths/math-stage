import { randomOptions } from '../engine/generator'

export interface CodeQuestion {
  text: string
  answer: number
  options: number[]
}

/** 随机一道密码题（10 以内加减） */
export function newCodeQuestion(max = 9): CodeQuestion {
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