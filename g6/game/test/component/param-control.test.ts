import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ParamControl from '@/components/lab/ParamControl.vue'
import type { LabParam } from '@data/schema/lab'

const slider: LabParam = { key: 'cm', label: '图上距离', min: 1, max: 10, step: 0.5, default: 5, unit: '厘米' }
const select: LabParam = {
  key: 'sel',
  label: '化简示例',
  min: 0,
  max: 3,
  step: 1,
  default: 0,
  options: [
    { label: '12 : 18', value: 0 },
    { label: '5/6 : 3/4', value: 1 },
    { label: '1.8 : 0.09', value: 2 },
  ],
}

describe('ParamControl：滑块与离散选项', () => {
  it('没有 options 时渲染滑块，并显示单位与范围', () => {
    const w = mount(ParamControl, { props: { param: slider, modelValue: 5 } })
    expect(w.find('input[type="range"]').exists()).toBe(true)
    expect(w.find('.param-options').exists()).toBe(false)
    expect(w.text()).toContain('厘米')
    expect(w.text()).toContain('1')
    expect(w.text()).toContain('10')
    const input = w.find('input[type="range"]')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('10')
    expect(input.attributes('step')).toBe('0.5')
  })

  it('滑块拖动会 emit 数值并触发 pick（用于播放点击音效）', async () => {
    const w = mount(ParamControl, { props: { param: slider, modelValue: 5 } })
    const input = w.find('input[type="range"]')
    await input.setValue('7.5')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([7.5])
    expect(w.emitted('pick')).toHaveLength(1)
  })

  it('有 options 时渲染按钮组、隐藏 unit 说明，并把选项名显示在右上角', () => {
    const w = mount(ParamControl, { props: { param: select, modelValue: 1 } })
    expect(w.find('input[type="range"]').exists()).toBe(false)
    const btns = w.findAll('.param-option')
    expect(btns.map((b) => b.text())).toEqual(['12 : 18', '5/6 : 3/4', '1.8 : 0.09'])
    // 当前值对应的选项高亮，其余不高亮
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['false', 'true', 'false'])
    expect(btns[1]!.classes()).toContain('active')
    // 右上角显示选项名而不是数字 1
    expect(w.find('strong').text()).toBe('5/6 : 3/4')
  })

  it('点击选项 emit 对应数值（学生不用理解 0/1/2 的含义）', async () => {
    const w = mount(ParamControl, { props: { param: select, modelValue: 0 } })
    await w.findAll('.param-option')[2]!.trigger('click')
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([2])
    expect(w.emitted('pick')).toHaveLength(1)
  })

  it('数据里有 options 的参数都满足：唯一、在范围内、默认值在其中', async () => {
    const { allLabs } = await import('@data')
    let checked = 0
    for (const lab of allLabs) {
      for (const p of lab.params) {
        if (!p.options?.length) continue
        checked++
        const values = p.options.map((o) => o.value)
        expect(new Set(values).size, `${lab.id}.${p.key} 选项值重复`).toBe(values.length)
        expect(new Set(p.options.map((o) => o.label)).size, `${lab.id}.${p.key} 选项名重复`).toBe(p.options.length)
        for (const v of values) {
          expect(v, `${lab.id}.${p.key} 选项越界`).toBeGreaterThanOrEqual(p.min)
          expect(v, `${lab.id}.${p.key} 选项越界`).toBeLessThanOrEqual(p.max)
        }
        expect(values, `${lab.id}.${p.key} 默认值不在选项里`).toContain(p.default)
        for (const o of p.options) expect(o.label.trim().length, `${lab.id}.${p.key} 选项名空`).toBeGreaterThan(0)
      }
    }
    // 本轮给 7 个参数加了 options：c1 sel、c3 sel×3、c4 sel、c6 scaleDen、c6 ask
    expect(checked).toBe(7)
  })
})
