import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AddSubGame from '@/components/games/AddSubGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c2', source: '例题', page: 25, title: '加法', prompt: '3+2等于几？',
    type: 'addsub',
    config: { type: 'addsub', a: 3, b: 2, op: '+', answer: 5, emoji: '🍎', options: [4, 5, 6, 7] },
    ...over,
  } as GameQuestion
}

describe('AddSubGame', () => {
  it('渲染算式与实物', () => {
    const w = mount(AddSubGame, { props: { question: q({}) } })
    expect(w.text()).toContain('3')
    expect(w.text()).toContain('+')
    expect(w.text()).toContain('2')
    expect(w.findAll('.obj-item').length).toBe(5)
  })

  it('减法渲染划掉效果', () => {
    const w = mount(AddSubGame, {
      props: { question: q({ config: { type: 'addsub', a: 5, b: 2, op: '-', answer: 3, emoji: '🍎', options: [2, 3, 4, 5] } }) },
    })
    expect(w.text()).toContain('−')
    expect(w.findAll('.obj-item.removed').length).toBe(2)
    expect(w.findAll('.obj-item').length).toBe(5)
  })

  it('答对/答错交互', async () => {
    const w = mount(AddSubGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[1].trigger('click') // 5
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
    expect(w.find('.feedback.correct').exists()).toBe(true)
  })

  it('答对后再选不产生新事件', async () => {
    const w = mount(AddSubGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[1].trigger('click')
    const n = w.emitted('answered')!.length
    await w.findAll('.answer-btn')[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})