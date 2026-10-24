import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CompareGame from '@/components/games/CompareGame.vue'
import CountGame from '@/components/games/CountGame.vue'
import NumberLineGame from '@/components/games/NumberLineGame.vue'
import Shape3DGame from '@/components/games/Shape3DGame.vue'
import ConceptTip from '@shared/components/ConceptTip.vue'
import { allExamples } from '@data'
import { tipOf } from '@/lib/engine/tips'
import type { GameQuestion } from '@data/schema/example'

vi.mock('@/composables/useShapeRenderer', () => ({
  useShapeRenderer: () => ({ mountCanvas: () => {}, dispose: () => {} }),
}))

function q(over: Partial<GameQuestion>): GameQuestion {
  return {
    id: 't', chapter: 'c2', source: '例题', page: 20, title: '题', prompt: '题干',
    type: 'compare', config: { type: 'compare', a: 5, b: 3, answer: '>' },
    ...over,
  } as GameQuestion
}

describe('一年级过程态：点一下，图形真的动', () => {
  it('CompareGame：点「配对」一对一对地配，连线跟着一条一条亮', async () => {
    const w = mount(CompareGame, { props: { question: q({}) } })
    // 初始：5 对 3 —— 能配上的是 3 对，多出的 2 个没有对象可配（这就是「一一配对」的关键）
    expect(w.findAll('.pair-line.on').length).toBe(3)
    await w.find('[data-test="pair-next"]').trigger('click')
    expect(w.findAll('.pair-line.on').length).toBe(1)
    expect(w.find('[data-test="pair-hint"]').text()).toContain('已经配了 1 对')
    await w.find('[data-test="pair-next"]').trigger('click')
    expect(w.findAll('.pair-line.on').length).toBe(2)
    expect(w.find('[data-test="pair-note"]').text()).toContain('还没配完')
  })

  it('CompareGame：配到最后，多出来的那一列才标「多」', async () => {
    const w = mount(CompareGame, { props: { question: q({}) } })
    await w.find('[data-test="pair-next"]').trigger('click')
    expect(w.findAll('.extra-badge').length).toBe(0)
    for (let i = 0; i < 4; i++) await w.find('[data-test="pair-next"]').trigger('click')
    expect(w.findAll('.extra-badge').length).toBe(2) // 5 对 3：多出 2 个
    expect(w.find('[data-test="pair-note"]').text()).toContain('5 > 3')
  })

  it('NumberLineGame：点「数一数」从 10 一格一格往右数', async () => {
    const w = mount(NumberLineGame, {
      props: {
        question: q({
          type: 'numberline',
          config: { type: 'numberline', value: 14, answer: 14, options: [13, 14, 15, 16] },
        }),
      },
    })
    expect(w.find('[data-test="numline-note"]').text()).toContain('停在 14')
    await w.find('[data-test="step-next"]').trigger('click')
    expect(w.find('[data-test="numline-note"]').text()).toContain('停在 11')
    expect(w.findAll('.num-line-tick.active').map((t) => t.text())).toEqual(['11'])
    expect(w.findAll('.one-unit.dim').length).toBe(3)
    await w.find('[data-test="step-next"]').trigger('click')
    expect(w.find('[data-test="numline-note"]').text()).toContain('停在 12')
  })

  it('Shape3DGame：点「数一数」一个面一个面地数，数完正好是 6 个面', async () => {
    const w = mount(Shape3DGame, {
      props: {
        question: q({
          type: 'shape3d',
          config: { type: 'shape3d', shape: '长方体', options: ['长方体', '正方体', '圆柱', '球'], answer: '长方体' },
        }),
      },
    })
    expect(w.find('[data-test="face-total"]').text()).toContain('一共 6 个面')
    expect(w.findAll('.face-row.dim').length).toBe(0)
    await w.find('[data-test="face-next"]').trigger('click')
    expect(w.find('[data-test="face-count"]').text()).toContain('上面')
    expect(w.findAll('.face-row.dim').length).toBe(5)
    for (let i = 0; i < 5; i++) await w.find('[data-test="face-next"]').trigger('click')
    expect(w.findAll('.face-row.dim').length).toBe(0)
  })

  it('Shape3DGame：圆柱数出 2 个圆面 + 1 个曲面，球只有 1 个曲面', () => {
    const cyl = mount(Shape3DGame, {
      props: {
        question: q({
          type: 'shape3d',
          config: { type: 'shape3d', shape: '圆柱', options: [], answer: '圆柱' },
        }),
      },
    })
    expect(cyl.findAll('.face-row').length).toBe(3)
    expect(cyl.findAll('.face-row.curved').length).toBe(1)
    expect(cyl.find('[data-test="face-total"]').text()).toContain('平面 2 个、曲面 1 个')

    const ball = mount(Shape3DGame, {
      props: {
        question: q({
          type: 'shape3d',
          config: { type: 'shape3d', shape: '球', options: [], answer: '球' },
        }),
      },
    })
    expect(ball.find('[data-test="face-total"]').text()).toContain('平面 0 个')
  })
})

describe('ConceptTip 接入一年级全部例题（L4）', () => {
  it('78 道例题都能展开看到「概念 + 易错点」，默认收起', async () => {
    for (const question of allExamples) {
      const tip = tipOf(question)
      const w = mount(ConceptTip, { props: { tip, page: question.page, source: question.source } })
      expect(w.find('[data-test="concept-tip"]').exists()).toBe(true)
      expect(w.find('[data-test="concept-text"]').exists()).toBe(false)
      await w.find('[data-test="concept-toggle"]').trigger('click')
      const body = w.find('[data-test="concept-text"]').text()
      expect(body.length).toBeGreaterThan(20)
      expect(body).toContain('易错点')
      expect(w.text()).toContain(`课本第 ${question.page} 页`)
    }
  })
})

describe('认识 0：一圈一圈扔，一个也没套中（原来看不出「0 是怎么来的」）', () => {
  it('点「套一圈」逐个扔出圈，套中数始终是 0', async () => {
    const w = mount(CountGame, {
      props: {
        question: {
          id: 'c2-count-03', chapter: 'c2', source: '例题', page: 18,
          title: '认识0', prompt: '一个也没有', type: 'count',
          config: { type: 'count', emoji: '', answer: 0, options: [0, 1, 2, 3] },
        } as GameQuestion,
      },
    })
    expect(w.find('[data-test="zero-say"]').text()).toContain('扔了 0 个圈')
    await w.find('[data-act]').trigger('click')
    expect(w.find('[data-test="zero-say"]').text()).toContain('扔了 1 个圈')
    expect(w.findAll('.ring.thrown').length).toBe(1)
    for (let i = 0; i < 4; i++) await w.find('[data-act]').trigger('click')
    expect(w.findAll('.ring.thrown').length).toBe(5)
    expect(w.find('[data-test="zero-say"]').text()).toContain('套中')
    expect(w.find('[data-test="zero-say"]').text()).toContain('0')
  })
})
