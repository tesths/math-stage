import { describe, it, expect } from 'vitest'
import { isAnswerCorrect } from '@/lib/engine/checker'
import type { GameQuestion } from '@data/schema/example'

function makeQ(over: Partial<GameQuestion> & { type: GameQuestion['type'] }): GameQuestion {
  return {
    id: 't',
    chapter: 'c2', source: '例题',
    page: 12,
    title: 't',
    prompt: 'p',
    config: undefined as never,
    ...over,
  } as unknown as GameQuestion
}

describe('isAnswerCorrect', () => {
  it('count: 数字答案正确/错误', () => {
    const q = makeQ({ type: 'count', config: { type: 'count', emoji: '🍎🍎', answer: 2, options: [1, 2, 3] } })
    expect(isAnswerCorrect(q, 2)).toBe(true)
    expect(isAnswerCorrect(q, 3)).toBe(false)
    expect(isAnswerCorrect(q, '2')).toBe(true)
  })

  it('compare: 符号答案', () => {
    const q = makeQ({ type: 'compare', config: { type: 'compare', a: 5, b: 3, answer: '>' } })
    expect(isAnswerCorrect(q, '>')).toBe(true)
    expect(isAnswerCorrect(q, '<')).toBe(false)
  })

  it('split: 数字答案', () => {
    const q = makeQ({ type: 'split', config: { type: 'split', total: 6, given: 2, answer: 4 } })
    expect(isAnswerCorrect(q, 4)).toBe(true)
    expect(isAnswerCorrect(q, 3)).toBe(false)
  })

  it('addsub: 数字答案', () => {
    const q = makeQ({ type: 'addsub', config: { type: 'addsub', a: 3, b: 2, op: '+', answer: 5, emoji: '🍎', options: [4, 5, 6] } })
    expect(isAnswerCorrect(q, 5)).toBe(true)
    expect(isAnswerCorrect(q, 4)).toBe(false)
  })

  it('shape3d: 文本答案', () => {
    const q = makeQ({ type: 'shape3d', config: { type: 'shape3d', shape: '圆柱', options: ['长方体', '圆柱'], answer: '圆柱' } })
    expect(isAnswerCorrect(q, '圆柱')).toBe(true)
    expect(isAnswerCorrect(q, '球')).toBe(false)
  })

  it('ten: 数组答案与顺序无关', () => {
    const q = makeQ({ type: 'ten', config: { type: 'ten', target: 10, cards: [1, 3, 4, 6, 8], answer: [4, 6] } })
    expect(isAnswerCorrect(q, [4, 6])).toBe(true)
    expect(isAnswerCorrect(q, [6, 4])).toBe(true)
    expect(isAnswerCorrect(q, [4, 6, 1])).toBe(false)
    expect(isAnswerCorrect(q, [4, 7])).toBe(false)
    expect(isAnswerCorrect(q, [4])).toBe(false)
  })

  it('sequence: 数组必须按序相等', () => {
    const q = makeQ({ type: 'sequence', config: { type: 'sequence', from: 10, to: 12, answer: [10, 11, 12] } })
    expect(isAnswerCorrect(q, [10, 11, 12])).toBe(true)
    expect(isAnswerCorrect(q, [12, 11, 10])).toBe(false)
    expect(isAnswerCorrect(q, [10, 11])).toBe(false)
  })

  it('position: 物品名答案', () => {
    const q = makeQ({ type: 'position', config: { type: 'position', items: ['月月', '贝贝', '元元'], target: '贝贝', position: '左', answer: '月月' } })
    expect(isAnswerCorrect(q, '月月')).toBe(true)
    expect(isAnswerCorrect(q, '元元')).toBe(false)
  })

  it('未知答案类型返回 false', () => {
    const q = makeQ({ type: 'count', config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2] } })
    expect(isAnswerCorrect(q, {})).toBe(false)
  })

  it('数组答案用非数组作答 → false', () => {
    const q = makeQ({ type: 'ten', config: { type: 'ten', target: 10, cards: [1, 3, 4], answer: [4, 6] } })
    expect(isAnswerCorrect(q, 4)).toBe(false)
    expect(isAnswerCorrect(q, '4')).toBe(false)
  })

  it('非数组答案用数组作答 → false', () => {
    const q = makeQ({ type: 'count', config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2] } })
    expect(isAnswerCorrect(q, [1])).toBe(false)
  })

  it('字符串与数字混型：可转数字时按数值比较，否则 false', () => {
    const q = makeQ({ type: 'count', config: { type: 'count', emoji: '🍎🍎', answer: 2, options: [1, 2] } })
    expect(isAnswerCorrect(q, '2')).toBe(true)
    expect(isAnswerCorrect(q, 'a')).toBe(false)
    const q2 = makeQ({ type: 'count', config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2] } })
    expect(isAnswerCorrect(q2, 1)).toBe(true)
  })
})
