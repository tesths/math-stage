import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NumberLineGame from '@/components/games/NumberLineGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c8', source: '例题', page: 79, title: '认识11', prompt: '1个十和1个一合起来是几？',
    type: 'numberline', config: { type: 'numberline', value: 11, answer: 11, options: [10, 11, 12, 13] },
    ...over,
  } as GameQuestion
}

describe('NumberLineGame numberline 类型', () => {
  it('渲染数轴与选项', () => {
    const w = mount(NumberLineGame, { props: { question: q({}) } })
    expect(w.findAll('.num-line-tick').length).toBeGreaterThanOrEqual(20)
    expect(w.findAll('.answer-btn').length).toBe(4)
  })

  it('答对', async () => {
    const w = mount(NumberLineGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[1].trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })
})

describe('NumberLineGame sequence 类型', () => {
  function seqBtns(w: ReturnType<typeof mount>) {
    return w.findAll('.seq-btn') as Array<{ text(): string }>
  }
  function byValue(w: ReturnType<typeof mount>, v: number) {
    return w.findAll('.seq-btn').find((b) => b.text() === String(v))
  }

  it('按从小到大的顺序点选数字', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: {
          id: 't', chapter: 'c8', source: '例题', page: 80, title: '顺数游戏', prompt: '按顺序点一点',
          type: 'sequence',
          config: { type: 'sequence', from: 10, to: 12, answer: [10, 11, 12] },
        },
      },
    })
    expect(seqBtns(w).length).toBe(3)
    await byValue(w, 10)!.trigger('click')
    await byValue(w, 11)!.trigger('click')
    await byValue(w, 12)!.trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('顺序错误则答错', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: {
          id: 't', chapter: 'c8', source: '例题', page: 80, title: '顺数游戏', prompt: '按顺序点一点',
          type: 'sequence',
          config: { type: 'sequence', from: 10, to: 12, answer: [10, 11, 12] },
        },
      },
    })
    await byValue(w, 12)!.trigger('click')
    await byValue(w, 11)!.trigger('click')
    await byValue(w, 10)!.trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
  })

  it('答错后重置已选，可重试成功', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: {
          id: 't', chapter: 'c8', source: '例题', page: 80, title: '顺数游戏', prompt: '按顺序点一点',
          type: 'sequence',
          config: { type: 'sequence', from: 10, to: 12, answer: [10, 11, 12] },
        },
      },
    })
    await byValue(w, 12)!.trigger('click')
    await byValue(w, 11)!.trigger('click')
    await byValue(w, 10)!.trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    expect(w.findAll('.seq-btn.picked').length).toBe(0)
    await byValue(w, 10)!.trigger('click')
    await byValue(w, 11)!.trigger('click')
    await byValue(w, 12)!.trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })

  it('numberline 答错后重试成功，答对后 guard', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: {
          id: 't', chapter: 'c8', source: '例题', page: 79, title: '认识11', prompt: '1个十和1个一合起来是几？',
          type: 'numberline',
          config: { type: 'numberline', value: 11, answer: 11, options: [10, 11, 12, 13] },
        },
      },
    })
    const btns = w.findAll('.answer-btn')
    await btns[0].trigger('click') // 10 → 错
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    await btns[1].trigger('click') // 11 → 对
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
    const n = w.emitted('answered')!.length
    await btns[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('numberline 答对后解除禁用再点仍不产生新事件', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: {
          id: 't', chapter: 'c8', source: '例题', page: 79, title: '认识11', prompt: '1个十和1个一合起来是几？',
          type: 'numberline',
          config: { type: 'numberline', value: 11, answer: 11, options: [10, 11, 12, 13] },
        },
      },
    })
    const btns = w.findAll('.answer-btn')
    await btns[1].trigger('click')
    const n = w.emitted('answered')!.length
    ;(btns[0].element as HTMLButtonElement).disabled = false
    await btns[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('sequence 答对后解除禁用再点仍不产生新事件', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: {
          id: 't', chapter: 'c8', source: '例题', page: 80, title: '顺数游戏', prompt: '按顺序点一点',
          type: 'sequence',
          config: { type: 'sequence', from: 10, to: 12, answer: [10, 11, 12] },
        },
      },
    })
    await byValue(w, 10)!.trigger('click')
    await byValue(w, 11)!.trigger('click')
    await byValue(w, 12)!.trigger('click')
    const n = w.emitted('answered')!.length
    const b = byValue(w, 10)!
    ;(b.element as HTMLButtonElement).disabled = false
    await b.trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
