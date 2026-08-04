import { shuffle } from '../engine/generator'

export interface WhackQuestion {
  text: string
  answer: number
}

export function newWhackQuestion(max = 9): WhackQuestion {
  const op = Math.random() < 0.5 ? '+' : '-'
  if (op === '+') {
    const a = 1 + Math.floor(Math.random() * (max - 1))
    const b = 1 + Math.floor(Math.random() * (max - a))
    return { text: `${a} + ${b}`, answer: a + b }
  }
  const a = 2 + Math.floor(Math.random() * (max - 1))
  const b = 1 + Math.floor(Math.random() * (a - 1))
  return { text: `${a} − ${b}`, answer: a - b }
}

/** 生成一轮 9 个洞的答案面板：2 个正确 + 其余干扰 */
export function pickWhackAnswers(answer: number, holes = 9, max = 9): number[] {
  const correct = [answer, answer]
  const pool: number[] = []
  for (let i = 0; i <= max; i++) pool.push(i)
  const dist = pool.filter((n) => n !== answer)
  const rest = shuffle(dist).slice(0, holes - 2)
  return shuffle([...correct, ...rest])
}