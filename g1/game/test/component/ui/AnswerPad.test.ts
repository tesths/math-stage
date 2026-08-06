import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnswerPad from '@/components/ui/AnswerPad.vue'

describe('AnswerPad', () => {
  it('渲染全部选项', () => {
    const w = mount(AnswerPad, { props: { options: [1, 2, 3, 4] } })
    expect(w.findAll('button').length).toBe(4)
    expect(w.text()).toContain('1')
    expect(w.text()).toContain('4')
  })

  it('点击选项发出 select 事件', async () => {
    const w = mount(AnswerPad, { props: { options: [1, 2, 3] } })
    await w.findAll('button')[1].trigger('click')
    expect(w.emitted('select')?.[0]).toEqual([2])
  })

  it('disabled 时不响应点击', async () => {
    const w = mount(AnswerPad, { props: { options: [1, 2, 3], disabled: true } })
    await w.findAll('button')[0].trigger('click')
    expect(w.emitted('select')).toBeUndefined()
  })

  it('选中项高亮', () => {
    const w = mount(AnswerPad, { props: { options: [1, 2, 3], selected: 2 } })
    const btn = w.findAll('button')[1]
    expect(btn.classes()).toContain('selected')
  })

  it('标记为正确/错误的选项显示状态类', () => {
    const w = mount(AnswerPad, {
      props: { options: [1, 2, 3], selected: 1, correctValue: 2, showResult: true },
    })
    expect(w.findAll('button')[0].classes()).toContain('wrong')
    expect(w.findAll('button')[1].classes()).toContain('correct')
  })
})
