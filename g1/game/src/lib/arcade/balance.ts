import { randomOptions } from '../engine/generator'

export interface BalanceRound {
  /** 左盘总数量 */
  left: number
  /** 右盘答案 */
  answer: number
  /** 模式：single 直接数 / expr 算式（连加） */
  mode: 'single' | 'expr'
  /** expr 模式的算式项（如 3、4 → 3+4） */
  leftParts: number[]
  options: number[]
}

/** 生成一局天平题（5 轮时交替 single / expr） */
export function newBalanceRound(round: number, max = 10): BalanceRound {
  const mode: BalanceRound['mode'] = round % 3 === 2 ? 'expr' : 'single'
  const pool: number[] = []
  for (let i = 0; i <= max; i++) pool.push(i)
  if (mode === 'single') {
    const answer = 2 + Math.floor(Math.random() * (max - 1))
    return { left: answer, answer, mode, leftParts: [answer], options: randomOptions(answer, pool, 4) }
  }
  const a = 1 + Math.floor(Math.random() * (max - 2))
  const b = 1 + Math.floor(Math.random() * (max - a))
  const answer = a + b
  return { left: answer, answer, mode, leftParts: [a, b], options: randomOptions(answer, pool, 4) }
}
