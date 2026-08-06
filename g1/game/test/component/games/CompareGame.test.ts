import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompareGame from '@/components/games/CompareGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c2', source: '例题', page: 20, title: '比一比', prompt: '3○3',
    type: 'compare', config: { type: 'compare', a: 3, b: 3, answer: '=', emoji: '⛹️' },
    ...over,
  } as GameQuestion
}

describe('CompareGame', () => {
  it('渲染两组与三个符号', () => {
    const w = mount(CompareGame, { props: { question: q({}) } })
    expect(w.findAll('.side-item').length).toBe(6)
    const symbols = w.findAll('.sym-btn').map((b) => b.text())
    expect(symbols).toEqual(['>', '<', '='])
  })

  it('选择正确符号', async () => {
    const w = mount(CompareGame, { props: { question: q({}) } })
    await w.find('.sym-btn[data-sym="="]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('选错符号可重试', async () => {
    const w = mount(CompareGame, { props: { question: q({}) } })
    await w.find('.sym-btn[data-sym=">"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    await w.find('.sym-btn[data-sym="="]').trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })

  it('无 emoji 时使用默认 ● 渲染', () => {
    const w = mount(CompareGame, {
      props: {
        question: q({
          type: 'compare',
          config: { type: 'compare', a: 2, b: 2, answer: '=' },
        }),
      },
    })
    expect(w.findAll('.side-item').length).toBe(4)
    expect(w.findAll('.side-item')[0]!.text()).toBe('●')
  })

  it('答错后可再选，答对后符号禁用', async () => {
    const w = mount(CompareGame, {
      props: {
        question: q({
          type: 'compare',
          config: { type: 'compare', a: 5, b: 3, answer: '>' },
        }),
      },
    })
    await w.find('.sym-btn[data-sym="<"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false, attempts: 1 })
    await w.find('.sym-btn[data-sym=">"]').trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
    const btns = w.findAll('.sym-btn')
    for (const b of btns) expect(b.attributes('disabled')).toBeDefined()
  })

  it('答对后再点符号不产生新事件', async () => {
    const w = mount(CompareGame, {
      props: { question: q({ type: 'compare', config: { type: 'compare', a: 5, b: 3, answer: '>' } }) },
    })
    await w.find('.sym-btn[data-sym=">"]').trigger('click')
    const n = w.emitted('answered')!.length
    await w.find('.sym-btn[data-sym="<"]').trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('答对后解除禁用再点符号仍不产生新事件', async () => {
    const w = mount(CompareGame, {
      props: { question: q({ type: 'compare', config: { type: 'compare', a: 5, b: 3, answer: '>' } }) },
    })
    await w.find('.sym-btn[data-sym=">"]').trigger('click')
    const n = w.emitted('answered')!.length
    const b = w.find('.sym-btn[data-sym="<"]')
    ;(b.element as HTMLButtonElement).disabled = false
    await b.trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
