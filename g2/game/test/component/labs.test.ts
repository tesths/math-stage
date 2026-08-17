import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import MultLab from '@/components/labs/MultLab.vue'
import DivideLab from '@/components/labs/DivideLab.vue'
import CalcLab from '@/components/labs/CalcLab.vue'
import TangramLab from '@/components/labs/TangramLab.vue'
import DirectionLab from '@/components/labs/DirectionLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import TwodigitLab from '@/components/labs/TwodigitLab.vue'
import MoneyLab from '@/components/labs/MoneyLab.vue'
import { findLabById, labsOfChapter, allLabs } from '@data'
import { labComponentFor } from '@/lib/labs/registry'

describe('Lab 组件渲染', () => {
  it('MultLab：groups 渲染方块图与乘法算式', () => {
    const lab = findLabById('g2-c1-groups-mult')!
    const wrapper = mount(MultLab, { props: { lab, values: { each: 2, groups: 4 } } })
    expect(wrapper.findAll('.group-row').length).toBe(4)
    expect(wrapper.findAll('.group-cell').length).toBe(8)
    expect(wrapper.findAll('.row-sum').map((el) => el.text())).toEqual(['2 个', '2 个', '2 个', '2 个'])
    expect(wrapper.find('.addition-strip').text()).toContain('2+2+2+2=8')
    expect(wrapper.find('.factor-map').text()).toContain('2 是每组几个')
    expect(wrapper.find('.factor-map').text()).toContain('4 是有几组')
    expect(wrapper.text()).toContain('2 × 4 = 8')
  })

  it('MultLab：mult-table 渲染点阵与口诀', () => {
    const lab = findLabById('g2-c1-mult-table-5')!
    const wrapper = mount(MultLab, { props: { lab, values: { base: 5, n: 3 } } })
    expect(wrapper.find('.dot-grid').exists()).toBe(true)
    expect(wrapper.text()).toContain('5 × 3 = 15')
    expect(wrapper.text()).toContain('三五十五')
  })

  it('DivideLab：divide-share 渲染平均分', () => {
    const lab = findLabById('g2-c2-divide-share')!
    const wrapper = mount(DivideLab, { props: { lab, values: { total: 12, groups: 3 } } })
    expect(wrapper.findAll('.share-col').length).toBe(3)
    expect(wrapper.findAll('.share-item').length).toBe(12)
    expect(wrapper.text()).toContain('每份 4 个')
  })

  it('DivideLab：divide-share 有余数时高亮剩余', () => {
    const lab = findLabById('g2-c2-divide-share')!
    const wrapper = mount(DivideLab, { props: { lab, values: { total: 10, groups: 3 } } })
    expect(wrapper.text()).toContain('还剩 1 个')
    expect(wrapper.find('.lead.warn').exists()).toBe(true)
  })

  it('DivideLab：divide-group 渲染每几个一份', () => {
    const lab = findLabById('g2-c2-divide-group')!
    const wrapper = mount(DivideLab, { props: { lab, values: { total: 10, per: 3 } } })
    expect(wrapper.findAll('.pgroup').length).toBe(4)
    expect(wrapper.text()).toContain('分成 3 份')
  })

  it('DivideLab：quotient 显示口诀求商', () => {
    const lab = findLabById('g2-c2-quotient')!
    const wrapper = mount(DivideLab, { props: { lab, values: { a: 4, b: 2 } } })
    expect(wrapper.text()).toContain('8 ÷ 2 = 4')
    expect(wrapper.text()).toContain('二四得八')
  })

  it('CalcLab：table-calc 显示口诀算式族', () => {
    const lab = findLabById('g2-c4-table-calc')!
    const wrapper = mount(CalcLab, { props: { lab, values: { a: 6, b: 7, mode: 0 } } })
    expect(wrapper.find('.kj-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('6 × 7 = 42')
  })

  it('CalcLab：remainder 渲染分物余数', () => {
    const lab = findLabById('g2-c9-remainder')!
    const wrapper = mount(CalcLab, { props: { lab, values: { total: 10, per: 3 } } })
    expect(wrapper.findAll('.leftover').length).toBe(1)
    expect(wrapper.text()).toContain('10 ÷ 3 = 3')
  })

  it('CalcLab：remainder-rule 渲染余数表', () => {
    const lab = findLabById('g2-c9-remainder-rule')!
    const wrapper = mount(CalcLab, { props: { lab, values: { d: 3 } } })
    expect(wrapper.findAll('.rem-row').length).toBe(3)
    expect(wrapper.text()).toContain('最大余数是 2')
    expect(wrapper.find('.rem-r.max').exists()).toBe(true)
  })

  it('TangramLab：渲染七巧板 SVG 与图案说明', () => {
    const lab = findLabById('g2-c3-tangram')!
    const wrapper = mount(TangramLab, { props: { lab, values: { sel: 1 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.findAll('.tg-piece.on').length).toBe(3)
    expect(wrapper.text()).toContain('长方形')
  })

  it('DirectionLab：面向东时前后左右', () => {
    const lab = findLabById('g2-c5-direction')!
    const wrapper = mount(DirectionLab, { props: { lab, values: { face: 0 } } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.person').exists()).toBe(true)
    expect(wrapper.findAll('.relation-card').length).toBe(4)
    expect(wrapper.find('.relation-card.front').text()).toContain('前面东')
    expect(wrapper.find('.relation-card.back').text()).toContain('后面西')
    expect(wrapper.text()).toContain('面向东')
    expect(wrapper.text()).toContain('后西')
    expect(wrapper.text()).toContain('左北')
    expect(wrapper.text()).toContain('右南')
  })

  it('NumberLab：place-value 渲染计数器', () => {
    const lab = findLabById('g2-c6-place-value')!
    const wrapper = mount(NumberLab, { props: { lab, values: { h: 1, t: 2, o: 4 } } })
    expect(wrapper.findAll('.counter-bead').length).toBe(7)
    expect(wrapper.text()).toContain('124')
  })

  it('NumberLab：compare 显示比较符号', () => {
    const lab = findLabById('g2-c6-compare')!
    const wrapper = mount(NumberLab, { props: { lab, values: { a: 402, b: 385 } } })
    expect(wrapper.find('.cmp-sym').text()).toBe('>')
    expect(wrapper.findAll('.scan-row').length).toBe(3)
    expect(wrapper.find('.scan-row.hit').text()).toContain('百位 4 > 3')
    expect(wrapper.findAll('.scan-row.dim').length).toBe(2)
  })

  it('NumberLab：compare 百位相同则继续比较十位', () => {
    const lab = findLabById('g2-c6-compare')!
    const wrapper = mount(NumberLab, { props: { lab, values: { a: 760, b: 720 } } })
    expect(wrapper.find('.cmp-sym').text()).toBe('>')
    expect(wrapper.findAll('.scan-row')[0]!.text()).toContain('百位相同，继续比下一位')
    expect(wrapper.find('.scan-row.hit').text()).toContain('十位 6 > 2')
  })

  it('NumberLab：abacus 渲染算盘与上珠', () => {
    const lab = findLabById('g2-c6-abacus')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 0 } } })
    expect(wrapper.find('.abacus-svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('5')
  })

  it('TwodigitLab：twodigit-add 显示进位提示', () => {
    const lab = findLabById('g2-c7-twodigit-add')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 3, oa: 4, tb: 2, ob: 8 } } })
    expect(wrapper.text()).toContain('34')
    expect(wrapper.text()).toContain('62')
    expect(wrapper.text()).toContain('满十')
  })

  it('TwodigitLab：twodigit-sub 显示退位提示', () => {
    const lab = findLabById('g2-c7-twodigit-sub')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 5, oa: 4, tb: 3, ob: 6 } } })
    expect(wrapper.text()).toContain('54')
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('退 1')
  })

  it('TwodigitLab：退位说明随参数变化', () => {
    const lab = findLabById('g2-c7-twodigit-sub')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 7, oa: 4, tb: 3, ob: 6 } } })
    expect(wrapper.text()).toContain('74')
    expect(wrapper.text()).toContain('38')
    expect(wrapper.text()).toContain('十位 7 退 1')
    expect(wrapper.text()).toContain('个位变 14')
  })

  it('MoneyLab：money 渲染面额按钮与换算', () => {
    const lab = findLabById('g2-c8-money')!
    const wrapper = mount(MoneyLab, { props: { lab, values: { sel: 0 } } })
    expect(wrapper.findAll('.denom-btn').length).toBeGreaterThanOrEqual(4)
    expect(wrapper.text()).toContain('1 元 = 10 角')
  })

  it('MoneyLab：money-calc 显示找零', () => {
    const lab = findLabById('g2-c8-money-calc')!
    const wrapper = mount(MoneyLab, { props: { lab, values: { price: 6, paid: 10 } } })
    expect(wrapper.text()).toContain('应找回 4 元')
  })

  it('MoneyLab：money-calc 钱不够时提示差额', () => {
    const lab = findLabById('g2-c8-money-calc')!
    const wrapper = mount(MoneyLab, { props: { lab, values: { price: 10, paid: 6 } } })
    expect(wrapper.text()).toContain('钱不够')
    expect(wrapper.text()).toContain('还差 4 元')
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })

  it('全部 kind 以空参数挂载不抛错（覆盖 ?? 兜底分支）', () => {
    for (const l of allLabs) {
      const comp = labComponentFor(l.kind)!
      expect(() => mount(comp, { props: { lab: l, values: {} } })).not.toThrow()
    }
  })
})
