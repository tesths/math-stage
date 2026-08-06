import { describe, it, expect } from 'vitest'
import {
  validateQuestion,
  validateAll,
  validateChapters,
} from '@data/schema/validate'
import type { GameQuestion, ChapterMeta } from '@data/schema/example'

function base(): Omit<GameQuestion, 'type' | 'config'> {
  return { id: 't-1', chapter: 'c2', source: '例题', page: 12, title: '测试', prompt: '测试题干' }
}

describe('validateQuestion 结构校验', () => {
  it('拒绝非法 id', () => {
    const q = { ...base(), id: 'A_B', type: 'count' as const, config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2, 3] } }
    expect(validateQuestion(q).join()).toContain('id 非法')
  })
  it('拒绝非法 chapter', () => {
    const q = { ...base(), chapter: 'c10' as never, type: 'count' as const, config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2, 3] } }
    expect(validateQuestion(q).join()).toContain('chapter 非法')
  })
  it('拒绝空 title/prompt', () => {
    const q = { ...base(), title: '', prompt: '', type: 'count' as const, config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2, 3] } }
    const errs = validateQuestion(q)
    expect(errs.join()).toContain('title/prompt')
  })
  it('拒绝非法 source', () => {
    const q = { ...base(), source: '附录' as never, type: 'count' as const, config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2, 3] } }
    expect(validateQuestion(q).join()).toContain('source 非法')
  })
})

describe('validateQuestion 语义校验', () => {
  it('count: answer 必须等于物品数', () => {
    const q = { ...base(), type: 'count' as const, config: { type: 'count', emoji: '🍎🍎🍎', answer: 4, options: [3, 4, 5] } }
    expect(validateQuestion(q).join()).toContain('不一致')
  })
  it('count: options 必须包含答案', () => {
    const q = { ...base(), type: 'count' as const, config: { type: 'count', emoji: '🍎🍎', answer: 2, options: [1, 3, 4] } }
    expect(validateQuestion(q).join()).toContain('未包含')
  })
  it('split: answer 必须等于 total-given', () => {
    const q = { ...base(), type: 'split' as const, config: { type: 'split', total: 5, given: 2, answer: 4 } }
    expect(validateQuestion(q).join()).toContain('total-given')
  })
  it('addsub: 加法答案= a+b', () => {
    const q = { ...base(), type: 'addsub' as const, config: { type: 'addsub', a: 3, b: 2, op: '+', answer: 4, emoji: '🍎', options: [4, 5, 6] } }
    expect(validateQuestion(q).join()).toContain('应等于')
  })
  it('addsub: 减法结果为负时拒绝', () => {
    const q = { ...base(), type: 'addsub' as const, config: { type: 'addsub', a: 2, b: 5, op: '-', answer: -3, emoji: '🍎', options: [1, 2, 3] } }
    expect(validateQuestion(q).join()).toContain('不能为负')
  })
  it('compare: 答案与大小关系一致', () => {
    const bad = { ...base(), type: 'compare' as const, config: { type: 'compare', a: 5, b: 3, answer: '<' as const } }
    expect(validateQuestion(bad).join()).toContain('不一致')
    const good = { ...base(), type: 'compare' as const, config: { type: 'compare', a: 5, b: 3, answer: '>' as const } }
    expect(validateQuestion(good)).toEqual([])
  })
  it('position: target 必须在 items 中', () => {
    const q = { ...base(), type: 'position' as const, config: { type: 'position', items: ['🐱', '🐶'], target: '🐷', position: '左', answer: '左' } }
    expect(validateQuestion(q).join()).toContain('不在 items')
  })
  it('ordinal: answer 为 target 的序数位置', () => {
    const q = { ...base(), type: 'ordinal' as const, config: { type: 'ordinal', items: ['🐱', '🐶', '🐷'], target: '🐶', answer: 3 } }
    expect(validateQuestion(q).join()).toContain('序数')
  })
  it('shape3d: shape 合法且 answer 一致', () => {
    const q = { ...base(), type: 'shape3d' as const, config: { type: 'shape3d', shape: '五边形' as never, options: ['长方体', '正方体', '圆柱', '球'], answer: '球' } }
    expect(validateQuestion(q).join()).toContain('立体图形')
  })
  it('numberline: value 限 11~19', () => {
    const q = { ...base(), type: 'numberline' as const, config: { type: 'numberline', value: 9, answer: 9, options: [8, 9, 10] } }
    expect(validateQuestion(q).join()).toContain('11~19')
  })
  it('sequence: answer 等于 from~to', () => {
    const q = { ...base(), type: 'sequence' as const, config: { type: 'sequence', from: 1, to: 5, answer: [1, 2, 3, 4] } }
    expect(validateQuestion(q).join()).toContain('不一致')
  })
  it('ten: 所挑卡片之和必须等于 target', () => {
    const q = { ...base(), type: 'ten' as const, config: { type: 'ten', target: 10, cards: [1, 2, 3, 4, 5, 6], answer: [1, 2] } }
    expect(validateQuestion(q).join()).toContain('之和')
  })
})

describe('validateAll 汇总', () => {
  it('报告重复 id', () => {
    const q1: GameQuestion = { ...base(), type: 'count', config: { type: 'count', emoji: '🍎', answer: 1, options: [1, 2, 3] } }
    const q2 = { ...q1 }
    const r = validateAll([q1, q2])
    expect(r.ok).toBe(false)
    expect(r.errors.join()).toContain('重复')
  })
})

describe('validateChapters', () => {
  it('拒绝非法页码区间', () => {
    const c: ChapterMeta[] = [{ id: 'c1', no: 1, title: 'x', pageStart: 30, pageEnd: 10, icon: '🎈', summary: 's' }]
    expect(validateChapters(c).errors.join()).toContain('页码')
  })
})