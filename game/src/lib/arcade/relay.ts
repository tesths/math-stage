import { randomOptions } from '../engine/generator'

export interface RelayLink {
  a: number
  b: number
  op: '+' | '-'
  answer: number
  text: string
}

/** 随机一道题（10 以内加减） */
export function randomCalc(max = 9): { a: number; b: number; op: '+' | '-'; answer: number } {
  const op = Math.random() < 0.5 ? '+' : '-'
  if (op === '+') {
    const a = 1 + Math.floor(Math.random() * (max - 1))
    const b = 1 + Math.floor(Math.random() * (max - a))
    return { a, b, op, answer: a + b }
  }
  const a = 2 + Math.floor(Math.random() * (max - 1))
  const b = 1 + Math.floor(Math.random() * (a - 1))
  return { a, b, op, answer: a - b }
}

/**
 * 生成口算接龙：上一题得数作为下一题已知数
 */
export function generateChain(length = 5, max = 9): RelayLink[] {
  const links: RelayLink[] = []
  for (let i = 0; i < length; i++) {
    const isFirst = i === 0
    let q: { a: number; b: number; op: '+' | '-'; answer: number }
    if (isFirst) {
      q = randomCalc(max)
    } else {
      const a = links[i - 1]!.answer
      if (Math.random() < 0.5 || a === 0) {
        const b = 1 + Math.floor(Math.random() * (max - a))
        q = { a, b, op: '+', answer: a + b }
      } else {
        const b = 1 + Math.floor(Math.random() * a)
        q = { a, b, op: '-', answer: a - b }
      }
    }
    links.push({ ...q, text: `${q.a} ${q.op} ${q.b} = ?` })
  }
  return links
}

/** 为答案生成 4 个选项 */
export function optionsFor(answer: number, max = 9): number[] {
  const pool: number[] = []
  for (let i = 0; i <= max + 2; i++) pool.push(i)
  return randomOptions(answer, pool, 4)
}