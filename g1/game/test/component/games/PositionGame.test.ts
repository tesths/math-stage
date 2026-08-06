import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PositionGame from '@/components/games/PositionGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c3', source: '例题', page: 32, title: '认识左右', prompt: '贝贝的左边是谁？',
    type: 'position',
    config: { type: 'position', items: ['🌙', '👦', '🐟'], target: '👦', position: '左', answer: '🌙' },
    ...over,
  } as GameQuestion
}

describe('PositionGame position 类型', () => {
  it('渲染物品排布', () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    expect(w.findAll('.pos-item').length).toBe(3)
    expect(w.find('.pos-item[data-item="👦"]').exists()).toBe(true)
  })

  it('点击正确物品', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-item[data-item="🌙"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('点击错误物品可重试', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-item[data-item="🐟"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    await w.find('.pos-item[data-item="🌙"]').trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })
})

describe('PositionGame ordinal 类型', () => {
  it('渲染序数数字选项并判对', async () => {
    const w = mount(PositionGame, {
      props: {
        question: {
          id: 't', chapter: 'c2', source: '例题', page: 16, title: '几和第几', prompt: '🐰排第几？',
          type: 'ordinal',
          config: { type: 'ordinal', items: ['🐵', '🐔', '🐰', '🐷', '🐱'], target: '🐰', answer: 3 },
        },
      },
    })
    expect(w.findAll('.pos-item').length).toBe(5)
    const buttons = w.findAll('.answer-btn')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    await buttons[2].trigger('click') // 3
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true })
  })

  it('答对后正确物品出现 picked 高亮', async () => {
    const w = mount(PositionGame, {
      props: {
        question: q({}),
      },
    })
    await w.find('.pos-item[data-item="🌙"]').trigger('click')
    expect(w.find('.pos-item.picked').attributes('data-item')).toBe('👦')
  })

  it('答对后再点物品不产生新事件', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-item[data-item="🌙"]').trigger('click')
    const n = w.emitted('answered')!.length
    await w.find('.pos-item[data-item="🐟"]').trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})