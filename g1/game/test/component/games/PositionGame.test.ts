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
  it('渲染排布卡片与参照标记', () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    expect(w.findAll('.pos-card').length).toBe(3)
    expect(w.findAll('button.pos-card').length).toBe(3)
    expect(w.find('.pos-card[data-item="👦"]').classes()).toContain('target')
    expect(w.find('.reference-chip').text()).toContain('👦')
    expect(w.find('.axis-guide').text()).toContain('左')
    expect(w.find('.axis-guide').text()).toContain('右')
  })

  it('答对后高亮方位答案而不是参照物', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-card[data-item="🌙"]').trigger('click')
    expect(w.find('.pos-card[data-item="🌙"]').classes()).toContain('picked')
    expect(w.find('.pos-card[data-item="👦"]').classes()).not.toContain('picked')
    expect(w.find('.answer-badge').text()).toBe('左边')
  })

  it('上下题使用竖向参照轴', () => {
    const w = mount(PositionGame, {
      props: {
        question: q({
          prompt: '小猫在鸟的下面。小猫在鸟的哪一边？',
          config: { type: 'position', items: ['鸟', '猫'], target: '鸟', position: '下', answer: '猫' },
        }),
      },
    })
    expect(w.find('.pos-scene').classes()).toContain('axis-vertical')
    expect(w.find('.axis-guide').text()).toContain('上')
    expect(w.find('.axis-guide').text()).toContain('下')
    expect(w.find('.axis-arrow').classes()).toContain('down')
  })

  it('点击正确物品', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-card[data-item="🌙"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('点击错误物品可重试', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-card[data-item="🐟"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    await w.find('.pos-card[data-item="🌙"]').trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })
})

describe('PositionGame ordinal 类型', () => {
  it('渲染序数物品与数字选项并判对', async () => {
    const w = mount(PositionGame, {
      props: {
        question: {
          id: 't', chapter: 'c2', source: '例题', page: 16, title: '几和第几', prompt: '🐰排第几？',
          type: 'ordinal',
          config: { type: 'ordinal', items: ['🐵', '🐔', '🐰', '🐷', '🐱'], target: '🐰', answer: 3 },
        },
      },
    })
    expect(w.findAll('.ordinal-item').length).toBe(5)
    expect(w.findAll('.ordinal-rank').length).toBe(5)
    expect(w.find('.ordinal-item.target').text()).toContain('🐰')
    expect(w.find('.ordinal-target-label').text()).toBe('目标')
    expect(w.find('.ordinal-guide').text()).toContain('起点')
    expect(w.find('.ordinal-guide').text()).toContain('方向')
    const buttons = w.findAll('.answer-btn')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
    await buttons[2].trigger('click') // 3
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true })
  })

  it('答对后再点物品不产生新事件', async () => {
    const w = mount(PositionGame, { props: { question: q({}) } })
    await w.find('.pos-card[data-item="🌙"]').trigger('click')
    const n = w.emitted('answered')!.length
    await w.find('.pos-card[data-item="🐟"]').trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
