import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ConceptTip from '@shared/components/ConceptTip.vue'

const tip = '平均分的份数越多，拼成的图形越接近长方形；圆的面积 = πr × r = πr²。'

describe('ConceptTip：每道例题的「重点概念」提示卡', () => {
  it('默认收起：先给思考提示，不直接抛结论', () => {
    const w = mount(ConceptTip, { props: { tip, page: 82, source: '例题' } })
    expect(w.find('[data-test="concept-tip"]').exists()).toBe(true)
    expect(w.text()).toContain('重点概念')
    expect(w.text()).toContain('课本第 82 页 · 例题')
    expect(w.find('[data-test="concept-text"]').exists()).toBe(false)
    expect(w.text()).toContain('这道例题要建立什么概念')
    expect(w.find('[data-test="concept-toggle"]').text()).toBe('先想一想，再看提示')
    expect(w.find('[data-test="concept-toggle"]').attributes('aria-expanded')).toBe('false')
  })

  it('点一下展开 tip 正文，再点收起', async () => {
    const w = mount(ConceptTip, { props: { tip, page: 47, source: '练一练' } })
    const btn = w.find('[data-test="concept-toggle"]')
    await btn.trigger('click')
    expect(w.find('[data-test="concept-text"]').text()).toBe(tip)
    expect(btn.attributes('aria-expanded')).toBe('true')
    expect(btn.text()).toBe('收起')

    await btn.trigger('click')
    expect(w.find('[data-test="concept-text"]').exists()).toBe(false)
    expect(btn.attributes('aria-expanded')).toBe('false')
  })

  it('tip 全是空白字符时整卡不渲染（数据层缺失不留空壳）', () => {
    const w = mount(ConceptTip, { props: { tip: '   ', page: 1, source: '例题' } })
    expect(w.find('[data-test="concept-tip"]').exists()).toBe(false)
    expect(w.html()).not.toContain('重点概念')
  })

  it('未传 tip（undefined）时整卡不渲染', () => {
    const w = mount(ConceptTip, { props: { page: 1, source: '例题' } })
    expect(w.find('[data-test="concept-tip"]').exists()).toBe(false)
  })
})
