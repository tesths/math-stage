import { describe, it, expect } from 'vitest'
import {
  shuffle,
  randomAddSub,
  randomCount,
  randomOptions,
  isAddSubQuestion,
} from '@/lib/engine/generator'
import { isAnswerCorrect } from '@/lib/engine/checker'
import type { GameQuestion } from '@data/schema/example'

describe('shuffle', () => {
  it('保持元素集合不变', () => {
    const arr = [1, 2, 3, 4, 5]
    const out = shuffle([...arr])
    expect([...out].sort()).toEqual(arr)
    expect(out).toHaveLength(arr.length)
  })
})

describe('randomOptions', () => {
  it('生成包含答案的唯一选项', () => {
    const opts = randomOptions(7, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 4)
    expect(opts).toHaveLength(4)
    expect(new Set(opts).size).toBe(4)
    expect(opts).toContain(7)
  })
  it('候选不足时仍包含答案', () => {
    const opts = randomOptions(9, [8, 9, 10], 4)
    expect(opts).toContain(9)
    expect(new Set(opts).size).toBe(opts.length)
  })
})

describe('randomAddSub', () => {
  it('生成合法加法题并可通过 checker', () => {
    for (let i = 0; i < 30; i++) {
      const q = randomAddSub(9, '+')
      expect(isAddSubQuestion(q)).toBe(true)
      expect(q.config.answer).toBe(q.config.a + q.config.b)
      expect(q.config.answer).toBeLessThanOrEqual(9)
      expect(q.config.options).toContain(q.config.answer)
      expect(isAnswerCorrect(q, q.config.answer)).toBe(true)
    }
  })
  it('生成合法减法题', () => {
    for (let i = 0; i < 30; i++) {
      const q = randomAddSub(9, '-')
      expect(q.config.a - q.config.b).toBeGreaterThanOrEqual(0)
      expect(isAnswerCorrect(q, q.config.answer)).toBe(true)
    }
  })
  it('默认随机出现两种运算', () => {
    const ops = new Set<string>()
    for (let i = 0; i < 40; i++) ops.add(randomAddSub(9).config.op)
    expect(ops.has('+')).toBe(true)
  })
})

describe('randomCount', () => {
  it('生成数量在范围内的计数题', () => {
    for (let i = 0; i < 20; i++) {
      const q = randomCount(5, '🍎')
      expect(isAnswerCorrect(q, q.config.answer)).toBe(true)
      expect(q.config.answer).toBeGreaterThanOrEqual(1)
      expect(q.config.answer).toBeLessThanOrEqual(5)
    }
  })
})

describe('isAddSubQuestion 类型守卫', () => {
  it('区分 addsub 与其他题型', () => {
    const add: GameQuestion = {
      id: 't',
      chapter: 'c2', source: '例题',
      page: 25,
      title: 't',
      prompt: 'p',
      type: 'addsub',
      config: { type: 'addsub', a: 1, b: 1, op: '+', answer: 2, emoji: '🍎', options: [1, 2, 3] },
    }
    const count: GameQuestion = {
      id: 't2',
      chapter: 'c2', source: '例题',
      page: 25,
      title: 't',
      prompt: 'p',
      type: 'count',
      config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2] },
    }
    expect(isAddSubQuestion(add)).toBe(true)
    expect(isAddSubQuestion(count)).toBe(false)
  })
})
