import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QuestionCard from '@/components/ui/QuestionCard.vue'

describe('QuestionCard', () => {
  it('渲染标题与题干', () => {
    const w = mount(QuestionCard, { props: { title: '数一数', prompt: '有几个苹果？' } })
    expect(w.text()).toContain('数一数')
    expect(w.text()).toContain('几个苹果')
  })

  it('显示书名页来源标签', () => {
    const w = mount(QuestionCard, { props: { title: 'x', prompt: 'y', page: 25 } })
    expect(w.text()).toContain('书页')
    expect(w.text()).toContain('25')
  })

  it('未提供 page 时不渲染页码', () => {
    const w = mount(QuestionCard, { props: { title: 'x', prompt: 'y' } })
    expect(w.text()).not.toContain('书页')
  })
})