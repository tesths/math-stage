import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TenGame from '@/components/games/TenGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c7', source: '例题', page: 75, title: '抢10', prompt: '选两张相加等于10',
    type: 'ten', config: { type: 'ten', target: 10, cards: [1, 2, 3, 6, 7], answer: [3, 7] },
    ...over,
  } as GameQuestion
}

describe('TenGame', () => {
  it('渲染卡片与和提示', () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    expect(w.findAll('.card').length).toBe(5)
    expect(w.findAll('.tf-cell').length).toBe(10)
    expect(w.text()).toContain('10')
  })

  it('选择卡片后十框和差量提示同步更新', async () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    await w.find('.card[data-card="3"]').trigger('click')
    expect(w.findAll('.tf-cell.lit').length).toBe(3)
    expect(w.text()).toContain('还差 7')
    await w.find('.card[data-card="7"]').trigger('click')
    expect(w.findAll('.tf-cell.lit').length).toBe(10)
    expect(w.text()).toContain('十框正好填满')
  })

  it('点选两张恰好等于10 → 正确', async () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    await w.find('.card[data-card="3"]').trigger('click')
    await w.find('.card[data-card="7"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('和不对 → 错误，可取消换选重试', async () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    await w.find('.card[data-card="1"]').trigger('click')
    await w.find('.card[data-card="2"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    // 取消 2 和 1，重新选 3 和 7
    await w.find('.card[data-card="2"]').trigger('click')
    await w.find('.card[data-card="3"]').trigger('click')
    await w.find('.card[data-card="1"]').trigger('click')
    await w.find('.card[data-card="7"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })

  it('选中三张恰好等于10 也可判定（c6 题）', async () => {
    const w = mount(TenGame, {
      props: {
        question: q({ config: { type: 'ten', target: 10, cards: [1, 2, 3, 5, 6, 8], answer: [1, 3, 6] } }),
      },
    })
    await w.find('.card[data-card="1"]').trigger('click')
    await w.find('.card[data-card="3"]').trigger('click')
    await w.find('.card[data-card="6"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('未选卡片时确定按钮禁用', () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    expect(w.find('.confirm-btn').attributes('disabled')).toBeDefined()
  })

  it('答对后卡片与确定按钮禁用', async () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    await w.find('.card[data-card="3"]').trigger('click')
    await w.find('.card[data-card="7"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
    for (const c of w.findAll('.card')) expect(c.attributes('disabled')).toBeDefined()
    expect(w.find('.confirm-btn').attributes('disabled')).toBeDefined()
  })

  it('答对后再点卡片与确定均不产生新事件', async () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    await w.find('.card[data-card="3"]').trigger('click')
    await w.find('.card[data-card="7"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    const n = w.emitted('answered')!.length
    await w.find('.card[data-card="1"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('答对后解除禁用再点卡片与确定仍不产生新事件', async () => {
    const w = mount(TenGame, { props: { question: q({}) } })
    await w.find('.card[data-card="3"]').trigger('click')
    await w.find('.card[data-card="7"]').trigger('click')
    await w.find('.confirm-btn').trigger('click')
    const n = w.emitted('answered')!.length
    const card = w.find('.card[data-card="1"]')
    ;(card.element as HTMLButtonElement).disabled = false
    await card.trigger('click')
    const conf = w.find('.confirm-btn')
    ;(conf.element as HTMLButtonElement).disabled = false
    await conf.trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
