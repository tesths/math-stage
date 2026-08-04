import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

describe('FeedbackOverlay', () => {
  it('idle 时不渲染', () => {
    const w = mount(FeedbackOverlay, { props: { state: 'idle', correctAnswer: 5 } })
    expect(w.find('.feedback').exists()).toBe(false)
  })

  it('correct 显示鼓励文案', () => {
    const w = mount(FeedbackOverlay, { props: { state: 'correct', correctAnswer: 5 } })
    expect(w.find('.feedback').exists()).toBe(true)
    expect(w.find('.feedback').classes()).toContain('correct')
    expect(w.text()).toContain('正确')
  })

  it('wrong 显示正确答案提示', () => {
    const w = mount(FeedbackOverlay, { props: { state: 'wrong', correctAnswer: 5 } })
    expect(w.find('.feedback').classes()).toContain('wrong')
    expect(w.text()).toContain('5')
  })

  it('answerText 自定义展示文案', () => {
    const w = mount(FeedbackOverlay, { props: { state: 'wrong', correctAnswer: 5, answerText: '5颗糖' } })
    expect(w.text()).toContain('5颗糖')
  })
})
