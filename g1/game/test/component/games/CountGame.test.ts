import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CountGame from '@/components/games/CountGame.vue'
import type { GameQuestion } from '@data/schema/example'

function q(over: object, page = 12): GameQuestion {
  return {
    id: 't', chapter: 'c2', source: '例题', page, title: '数一数', prompt: '数一数有几个？',
    type: 'count', config: { type: 'count', emoji: '🍎🍎🍎', answer: 3, options: [2, 3, 4, 5] },
    ...over,
  } as GameQuestion
}

describe('CountGame count 类型', () => {
  it('按物品数量显示对象（十框淡显可数）', () => {
    const w = mount(CountGame, { props: { question: q({}) } })
    expect(w.findAll('.source-item').length).toBe(3)
    expect(w.findAll('.tf-cell').length).toBe(10)
    expect(w.findAll('.tf-obj').length).toBe(3)
  })

  it('点击源物品同步十框计数轨迹', async () => {
    const w = mount(CountGame, { props: { question: q({}) } })
    await w.findAll('.source-item')[1].trigger('click')
    expect(w.findAll('.source-item.lit').length).toBe(2)
    expect(w.findAll('.tf-cell.lit').length).toBe(2)
    expect(w.text()).toContain('数到 2')
  })

  it('点击格子逐个点亮并显示计数轨迹', async () => {
    const w = mount(CountGame, { props: { question: q({}) } })
    expect(w.findAll('.tf-cell.lit').length).toBe(0)
    await w.findAll('.tf-cell')[2].trigger('click')
    expect(w.findAll('.tf-cell.lit').length).toBe(3)
    expect(w.text()).toContain('数到 3')
  })

  it('answer 为 0 时显示"一个也没有"', () => {
    const w = mount(CountGame, {
      props: { question: q({ config: { type: 'count', emoji: '', answer: 0, options: [0, 1, 2, 3] } }) },
    })
    expect(w.text()).toContain('一个也没有')
    expect(w.findAll('.tf-cell.lit').length).toBe(0)
  })

  it('点对选项 → 反馈正确并锁定', async () => {
    const w = mount(CountGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[1].trigger('click')
    expect(w.emitted('answered')?.[0]).toEqual([{ correct: true, attempts: 1 }])
    expect(w.find('.feedback.correct').exists()).toBe(true)
    expect(w.findAll('button').every((b) => b.attributes('disabled') !== undefined)).toBe(true)
  })

  it('点错选项 → 反馈错误并可重试', async () => {
    const w = mount(CountGame, { props: { question: q({}) } })
    await w.findAll('.answer-btn')[0].trigger('click')
    expect(w.emitted('answered')?.[0]).toEqual([{ correct: false, attempts: 1 }])
    expect(w.find('.feedback.wrong').exists()).toBe(true)
    expect(w.find('.wrong-count-note').text()).toContain('还少数 1 个')
    await w.findAll('.answer-btn')[1].trigger('click')
    expect(w.emitted('answered')?.[1]).toEqual([{ correct: true, attempts: 2 }])
  })

  it('write 类型渲染计数器', () => {
    const w = mount(CountGame, {
      props: {
        question: q({
          type: 'write',
          config: { type: 'write', number: 13, hint: '1个十和3个一', options: [12, 13, 14], answer: 13 },
        }, 13),
      },
    })
    expect(w.text()).toContain('个一')
    expect(w.findAll('.counter-bead').length).toBeGreaterThan(0)
  })

  it('count 0（一个也没有）渲染空提示，答 0 正确', () => {
    const w = mount(CountGame, {
      props: {
        question: q({
          type: 'count',
          config: { type: 'count', emoji: '', answer: 0, options: [0, 1, 2] },
        }, 0),
      },
    })
    expect(w.text()).toContain('一个也没有')
    const btns = w.findAll('.answer-btn')
    expect(btns.find((b) => b.text() === '0')).toBeTruthy()
  })

  it('write number 0 渲染空计数器', () => {
    const w = mount(CountGame, {
      props: {
        question: q({
          type: 'write',
          config: { type: 'write', number: 0, hint: '一个也没有', options: [0, 1], answer: 0 },
        }, 0),
      },
    })
    expect(w.text()).toContain('一个也没有')
    expect(w.findAll('.counter-bead').length).toBe(0)
    expect(w.find('.counter').exists()).toBe(true)
  })

  it('答对后再点击不产生新答案事件', async () => {
    const w = mount(CountGame, {
      props: {
        question: q({}),
      },
    })
    await w.findAll('.answer-btn')[1].trigger('click') // 正确答案
    const n = w.emitted('answered')!.length
    await w.findAll('.answer-btn')[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })

  it('答对后解除禁用再点击仍不产生新事件', async () => {
    const w = mount(CountGame, { props: { question: q({}) } }) 
    const btns = w.findAll('.answer-btn')
    await btns[1].trigger('click')
    const n = w.emitted('answered')!.length
    ;(btns[0].element as HTMLButtonElement).disabled = false
    await btns[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
  it('答对后解除禁用再点击仍不产生新事件', async () => {
    const w = mount(CountGame, { props: { question: q({}) } })
    const btns = w.findAll('.answer-btn')
    await btns[1].trigger('click')
    const n = w.emitted('answered')!.length
    ;(btns[0].element as HTMLButtonElement).disabled = false
    await btns[0].trigger('click')
    expect(w.emitted('answered')!.length).toBe(n)
  })
})
