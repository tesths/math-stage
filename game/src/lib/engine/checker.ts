import type { GameQuestion } from '@data/schema/example'

export type AnswerValue = number | string | boolean

function arraysEqualOrdered(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

function arraysEqualUnordered(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  const copy = [...a]
  for (const v of b) {
    const i = copy.indexOf(v)
    if (i === -1) return false
    copy.splice(i, 1)
  }
  return true
}

/**
 * 判定用户答案是否正确（所有题型通用入口）
 * - 数组类答案：ten 顺序无关；sequence 必须按序
 */
export function isAnswerCorrect(question: GameQuestion, userAnswer: AnswerValue | AnswerValue[]): boolean {
  const expected = question.config.answer
  if (Array.isArray(expected)) {
    if (!Array.isArray(userAnswer)) return false
    return question.type === 'ten'
      ? arraysEqualUnordered(expected, userAnswer)
      : arraysEqualOrdered(expected, userAnswer)
  }
  if (Array.isArray(userAnswer)) return false
  if (typeof userAnswer === 'number' && typeof expected === 'number') {
    return userAnswer === expected
  }
  if (typeof userAnswer === 'string' && typeof expected === 'string') {
    return userAnswer === expected
  }
  if (
    (typeof userAnswer === 'string' && typeof expected === 'number') ||
    (typeof userAnswer === 'number' && typeof expected === 'string')
  ) {
    const a = Number(userAnswer)
    const b = Number(expected)
    if (Number.isNaN(a) || Number.isNaN(b)) return false
    return a === b
  }
  return false
}
