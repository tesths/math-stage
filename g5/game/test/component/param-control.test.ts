import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ParamControl from '@/components/lab/ParamControl.vue'
import { allLabs } from '@data'
import type { LabParam } from '@data/schema/lab'

const slider: LabParam = { key: 'grid', label: '平移格数', min: 1, max: 12, step: 1, default: 9, unit: '格' }
const select: LabParam = {
  key: 'dir',
  label: '平移方向',
  min: 0,
  max: 3,
  step: 1,
  default: 0,
  options: [
    { label: '向右', value: 0 },
    { label: '向下', value: 1 },
    { label: '向左', value: 2 },
    { label: '向上', value: 3 },
  ],
}

describe('ParamControl：滑块与离散选项', () => {
  it('没有 options 时渲染滑块，并显示单位与范围', () => {
    const w = mount(ParamControl, { props: { param: slider, modelValue: 9 } })
    expect(w.find('input[type="range"]').exists()).toBe(true)
    expect(w.find('.param-options').exists()).toBe(false)
    expect(w.text()).toContain('格')
    const input = w.find('input[type="range"]')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('12')
    expect(input.attributes('step')).toBe('1')
  })

  it('滑块拖动会 emit 数值并触发 pick（用于播放点击音效）', async () => {
    const w = mount(ParamControl, { props: { param: slider, modelValue: 9 } })
    await w.find('input[type="range"]').setValue('5')
    expect(w.emitted('update:modelValue')?.[0]).toEqual([5])
    expect(w.emitted('pick')).toHaveLength(1)
  })

  it('有 options 时渲染按钮组、隐藏 unit，并把选项名显示在右上角', () => {
    const w = mount(ParamControl, { props: { param: select, modelValue: 1 } })
    expect(w.find('input[type="range"]').exists()).toBe(false)
    const btns = w.findAll('.param-option')
    expect(btns.map((b) => b.text())).toEqual(['向右', '向下', '向左', '向上'])
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['false', 'true', 'false', 'false'])
    expect(btns[1]!.classes()).toContain('active')
    // 右上角显示「向下」而不是数字 1
    expect(w.find('strong').text()).toBe('向下')
    expect(w.text()).not.toContain('0右 1下')
  })

  it('点击选项 emit 对应数值（学生不用理解 0/1/2 的含义）', async () => {
    const w = mount(ParamControl, { props: { param: select, modelValue: 0 } })
    await w.findAll('.param-option')[3]!.trigger('click')
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([3])
    expect(w.emitted('pick')).toHaveLength(1)
  })

  it('options 里没有当前值时右上角回退显示数字（防御分支）', () => {
    const w = mount(ParamControl, { props: { param: select, modelValue: 9 } })
    expect(w.find('strong').text()).toBe('9')
    expect(w.findAll('.param-option.active')).toHaveLength(0)
  })
})

describe('五年级所有含 options 的参数：选项合法且默认值可选中', () => {
  const withOptions = allLabs.flatMap((lab) =>
    lab.params.filter((p) => p.options?.length).map((p) => ({ lab, p })),
  )

  it('至少有一个参数用上了离散选项（图形运动方向 / 观察方向 / 多边形）', () => {
    expect(withOptions.length).toBeGreaterThanOrEqual(6)
    expect(withOptions.some((x) => x.p.key === 'dir' && x.lab.id === 'g5-c1-translate-boat')).toBe(true)
    expect(withOptions.some((x) => x.p.key === 'view')).toBe(true)
    expect(withOptions.some((x) => x.p.key === 'shape' && x.lab.id === 'g5-pinboard-area')).toBe(true)
  })

  it.each(withOptions.map((x) => [`${x.lab.id}.${x.p.key}`, x.p] as const))(
    '%s：选项值唯一、在 min~max 内、非空 label、默认值在选项中',
    (_name, p) => {
      const values = p.options!.map((o) => o.value)
      expect(new Set(values).size).toBe(values.length)
      for (const o of p.options!) {
        expect(o.label.trim().length).toBeGreaterThan(0)
        expect(o.value).toBeGreaterThanOrEqual(p.min)
        expect(o.value).toBeLessThanOrEqual(p.max)
      }
      expect(values).toContain(p.default)
    },
  )
})
