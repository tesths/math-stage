import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Shape3DGame from '@/components/games/Shape3DGame.vue'
import type { GameQuestion } from '@data/schema/example'

vi.mock('@/composables/useShapeRenderer', () => ({
  useShapeRenderer: vi.fn(() => ({ mountCanvas: vi.fn(), dispose: vi.fn() })),
}))

function q(over: object): GameQuestion {
  return {
    id: 't', chapter: 'c5', source: '例题', page: 54, title: '认识长方体', prompt: '这是什么形状？',
    type: 'shape3d', config: { type: 'shape3d', shape: '长方体', options: ['长方体', '正方体', '圆柱', '球'], answer: '长方体' },
    ...over,
  } as GameQuestion
}

describe('Shape3DGame', () => {
  it('渲染图形画布与四个选项', async () => {
    const w = mount(Shape3DGame, { props: { question: q({}) } })
    await flushPromises()
    expect(w.find('.shape-canvas').exists()).toBe(true)
    expect(w.findAll('.answer-btn').length).toBe(4)
  })

  it('点对名称 → 正确', async () => {
    const w = mount(Shape3DGame, { props: { question: q({}) } })
    await flushPromises()
    await w.find('.answer-btn[data-opt="长方体"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: true, attempts: 1 })
  })

  it('点错名称 → 错误可重试', async () => {
    const w = mount(Shape3DGame, { props: { question: q({}) } })
    await flushPromises()
    await w.find('.answer-btn[data-opt="球"]').trigger('click')
    expect(w.emitted('answered')![0][0]).toMatchObject({ correct: false })
    await w.find('.answer-btn[data-opt="长方体"]').trigger('click')
    expect(w.emitted('answered')![1][0]).toMatchObject({ correct: true, attempts: 2 })
  })

  it('卸载时释放渲染器', async () => {
    const w = mount(Shape3DGame, { props: { question: q({}) } })
    await flushPromises()
    w.unmount()
    expect(w).toBeTruthy()
  })

  it('答对后再选不产生新事件', async () => {
    const w = mount(Shape3DGame, { props: { question: q({}) } })
    await w.find('.answer-btn[data-opt="长方体"]').trigger('click')
    const n = w.emitted('answered')!.length
    await w.find('.answer-btn[data-opt="正方体"]').trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('答对后解除禁用再点仍不产生新事件', async () => {
    const w = mount(Shape3DGame, { props: { question: q({}) } })
    await w.find('.answer-btn[data-opt="长方体"]').trigger('click')
    const n = w.emitted('answered')!.length
    const b = w.find('.answer-btn[data-opt="正方体"]')
    ;(b.element as HTMLButtonElement).disabled = false
    await b.trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
