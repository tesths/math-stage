import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SplitGame from '@/components/games/SplitGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c4', source: '例题', page: 39, title: '分一分', prompt: '6分成2和几？',
    type: 'split', config: { type: 'split', total: 6, given: 2, answer: 4 },
    ...over,
  } as GameQuestion
}

describe('SplitGame', () => {
  it('渲染总数、已分部分与空位', () => {
    const w = mount(SplitGame, { props: { question: q({}) } })
    expect(w.text()).toContain('6')
    expect(w.findAll('.split-item').length).toBe(6)
    expect(w.text()).toContain('2')
    expect(w.text()).toContain('?')
  })

  it('答对发出 answered', async () => {
    const w = mount(SplitGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[1].trigger('click') // 4
    expect(w.emitted('answered')).toBeTruthy()
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('答错可重试', async () => {
    const w = mount(SplitGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[0].trigger('click') // 3 (wrong)
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    await w.findAll('.answer-btn')[1].trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })

  it('答对后再选不产生新事件', async () => {
    const w = mount(SplitGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[1].trigger('click')
    const n = w.emitted('answered')!.length
    await w.findAll('.answer-btn')[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('答对后解除禁用再点仍不产生新事件', async () => {
    const w = mount(SplitGame, { props: { question: q({}) } })
    const btns = w.findAll('.answer-btn')
    await btns[1].trigger('click')
    const n = w.emitted('answered')!.length
    ;(btns[0].element as HTMLButtonElement).disabled = false
    await btns[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
