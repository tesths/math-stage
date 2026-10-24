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

describe('过程态：点一下按钮，图形和数据一起变（不是换一句话）', () => {
  it('七巧板：点「拼一拼」后 ③④⑤ 三块板真的搬到目标位置，面积验算同屏出现', async () => {
    const lab = findLabById('g2-c3-tangram')!
    const wrapper = mount(TangramLab, { props: { lab, values: { sel: 1 } } })
    const before = wrapper.findAll('.tg-piece').map((p) => p.attributes('points'))
    expect(wrapper.find('[data-test="tg-check"]').exists()).toBe(false)

    await wrapper.find('[data-test="tg-assemble"]').trigger('click')
    // 动画结束态（组件暴露 settle：把进度一步推到 1）
    ;(wrapper.vm as unknown as { settle: () => void }).settle()
    await wrapper.vm.$nextTick()

    const after = wrapper.findAll('.tg-piece').map((p) => p.attributes('points'))
    const movedIdx = after.filter((p, i) => p !== before[i])
    expect(movedIdx.length).toBeGreaterThanOrEqual(3)

    const check = wrapper.find('[data-test="tg-check"]')
    expect(check.exists()).toBe(true)
    expect(check.text()).toContain('4 + 8 + 4')
    expect(check.text()).toContain('16')
    expect(wrapper.find('[data-test="tg-progress"]').text()).toContain('100')
  })

  it('七巧板：切到平行四边形时用的是 ③⑤ 两块板（不再和长方形混用同一组板）', () => {
    const lab = findLabById('g2-c3-tangram')!
    const wrapper = mount(TangramLab, { props: { lab, values: { sel: 3 } } })
    expect(wrapper.findAll('.tg-piece.on').length).toBe(2)
    expect(wrapper.text()).toContain('平行四边形')
    expect(wrapper.text()).toContain('③⑤')
  })

  it('MultLab：点「数一数」后只亮已经数过的组，其余变暗', async () => {
    const lab = findLabById('g2-c1-groups-mult')!
    const wrapper = mount(MultLab, { props: { lab, values: { each: 2, groups: 4 } } })
    expect(wrapper.findAll('.group-row.dim').length).toBe(0)
    await wrapper.find('[data-test="count-next"]').trigger('click')
    expect(wrapper.findAll('.group-row.dim').length).toBe(3)
    expect(wrapper.find('[data-test="count-say"]').text()).toContain('第 1 组')
    await wrapper.find('[data-test="count-next"]').trigger('click')
    expect(wrapper.findAll('.group-row.dim').length).toBe(2)
  })

  it('DivideLab：点「分一分」后每份个数从 0 开始一轮一轮加上去', async () => {
    const lab = findLabById('g2-c2-divide-share')!
    const wrapper = mount(DivideLab, { props: { lab, values: { total: 12, groups: 3 } } })
    expect(wrapper.findAll('.share-item').length).toBe(12)
    expect(wrapper.findAll('.share-item.dim').length).toBe(0)
    await wrapper.find('[data-test="step-next"]').trigger('click')
    // 第 1 轮：每份 1 个，剩下 9 个没分
    expect(wrapper.findAll('.share-item.dim').length).toBe(9)
    expect(wrapper.text()).toContain('每份 1 个')
    expect(wrapper.text()).toContain('还剩 9 个')
  })

  it('CalcLab：余数规则点「再加 1」，余数一个一个走', async () => {
    const lab = findLabById('g2-c9-remainder-rule')!
    const wrapper = mount(CalcLab, { props: { lab, values: { d: 3 } } })
    await wrapper.find('[data-test="step-next"]').trigger('click')
    expect(wrapper.find('[data-test="step-say"]').text()).toContain('9 ÷ 3 = 3 …… 0')
    await wrapper.find('[data-test="step-next"]').trigger('click')
    expect(wrapper.find('[data-test="step-say"]').text()).toContain('10 ÷ 3 = 3 …… 1')
    expect(wrapper.findAll('.rem-row.dim').length).toBe(1)
  })

  it('NumberLab 算盘：点「拨一拨」一档一档拨珠，累计数同时变', async () => {
    const lab = findLabById('g2-c6-abacus')!
    const wrapper = mount(NumberLab, { props: { lab, values: { sel: 2 } } }) // 234
    await wrapper.find('[data-test="step-next"]').trigger('click')
    expect(wrapper.find('[data-test="step-say"]').text()).toContain('拨好百位')
    expect(wrapper.find('.strong').text()).toBe('200')
    await wrapper.find('[data-test="step-next"]').trigger('click')
    expect(wrapper.find('.strong').text()).toBe('230')
  })

  it('NumberLab 比大小：点「比一位」逐位比到分出大小为止', async () => {
    const lab = findLabById('g2-c6-compare')!
    const wrapper = mount(NumberLab, { props: { lab, values: { a: 760, b: 720 } } })
    await wrapper.find('[data-test="step-next"]').trigger('click')
    expect(wrapper.find('[data-test="step-say"]').text()).toContain('百位')
    expect(wrapper.findAll('.scan-row.dim').length).toBe(2)
    await wrapper.find('[data-test="step-next"]').trigger('click')
    expect(wrapper.find('[data-test="step-say"]').text()).toContain('十位')
    expect(wrapper.findAll('.scan-row.dim').length).toBe(1)
  })

  it('TwodigitLab 减法：被减数比减数小时明确提示，不给出偷偷调换后的答案', async () => {
    const lab = findLabById('g2-c7-twodigit-sub')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 3, oa: 6, tb: 5, ob: 4 } } })
    expect(wrapper.find('[data-test="proc-warn"]').text()).toContain('本册还不学')
    expect(wrapper.find('[data-test="proc-warn"]').text()).toContain('36')
    expect(wrapper.findAll('.borrow-zone').length).toBe(0)
  })

  it('MoneyLab：点「付钱」按 看价格 → 数付出 → 找零 三步来', async () => {
    const lab = findLabById('g2-c8-money-calc')!
    const wrapper = mount(MoneyLab, { props: { lab, values: { price: 6, paid: 10 } } })
    await wrapper.find('[data-test="money-next"]').trigger('click')
    expect(wrapper.find('[data-test="money-say"]').text()).toContain('先看价格')
    await wrapper.find('[data-test="money-next"]').trigger('click')
    await wrapper.find('[data-test="money-next"]').trigger('click')
    expect(wrapper.find('[data-test="money-say"]').text()).toContain('6')
    expect(wrapper.find('.shop-result').text()).toContain('应找回 4 元')
  })
})

describe('TwodigitLab 数位模型：十连棒 + 单珠（1 个十 = 10 个一 必须看得见）', () => {
  /** 一张卡片上：棒的根数、珠的颗数、棒×10+珠 的总数 */
  function placeValue(wrapper: ReturnType<typeof mount>, card: string) {
    const box = wrapper.find(`[data-test="${card}"]`)
    const rods = box.findAll('[data-test="tens"] [data-test="rod"]').length
    const beads = box.findAll('[data-test="ones"] [data-test="one-bead"]').length
    return { rods, beads, total: rods * 10 + beads, box }
  }

  it('十位是十连棒（每根画满 10 个点）、个位是单珠，且总数守恒', () => {
    const lab = findLabById('g2-c7-twodigit-sub')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 5, oa: 4, tb: 3, ob: 6 } } })

    const min = placeValue(wrapper, 'minuend')
    expect(min.rods).toBe(5) // 54：十位 5 根棒
    expect(min.beads).toBe(4) // 个位 4 颗珠
    expect(min.total).toBe(54) // 棒×10 + 珠 == 原数
    // 一根棒上必须能数出 10 个点，否则「1 个十 = 10 个一」又成了空话
    expect(min.box.findAll('[data-test="rod"]')[0]!.findAll('.rod-dot').length).toBe(10)

    const sub = placeValue(wrapper, 'subtrahend')
    expect(sub.rods).toBe(3)
    expect(sub.beads).toBe(6)
    expect(sub.total).toBe(36)

    const res = placeValue(wrapper, 'sub-result')
    expect(res.rods).toBe(1)
    expect(res.beads).toBe(8)
    expect(res.total).toBe(18)
  })

  it('退位第 2 步：十位少 1 根、个位变 oa+10，图上总数仍然守恒（54 → 4 根 + 14 颗）', async () => {
    const lab = findLabById('g2-c7-twodigit-sub')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 5, oa: 4, tb: 3, ob: 6 } } })

    expect(placeValue(wrapper, 'minuend').rods).toBe(5)
    await wrapper.find('[data-test="step-next"]').trigger('click') // 第 1 步：个位
    expect(placeValue(wrapper, 'minuend').rods).toBe(5)
    await wrapper.find('[data-test="step-next"]').trigger('click') // 第 2 步：十位退 1、拆 10

    const after = placeValue(wrapper, 'minuend')
    expect(after.rods).toBe(4) // 十位少 1 根
    expect(after.beads).toBe(14) // 个位变 4 + 10
    expect(after.total).toBe(54) // 总数守恒：4×10 + 14 == 54
    // 拆的过程必须画出来：一根棒「撕开」+ 10 颗散珠亮起
    expect(wrapper.find('[data-test="split-stage"]').classes()).toContain('open')
    expect(wrapper.find('[data-test="split-rod"]').classes()).toContain('tearing')
    expect(wrapper.findAll('[data-test="borrow-bead"]').length).toBe(10)
    expect(wrapper.find('[data-test="pv-total"]').text()).toContain('拆开后的摆法')
  })

  it('不退位时不拆棒：十位、个位保持 oa / sob 原样', async () => {
    const lab = findLabById('g2-c7-twodigit-sub')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 5, oa: 8, tb: 3, ob: 6 } } })
    await wrapper.find('[data-test="step-next"]').trigger('click')
    await wrapper.find('[data-test="step-next"]').trigger('click')
    const min = placeValue(wrapper, 'minuend')
    expect(min.rods).toBe(5)
    expect(min.beads).toBe(8)
    expect(min.total).toBe(58)
    expect(wrapper.find('[data-test="split-stage"]').exists()).toBe(false)
  })

  it('加法进位：12 颗散珠里 10 颗捆成 1 根十连棒，个位剩 2 颗，三张卡的总数各自守恒', async () => {
    const lab = findLabById('g2-c7-twodigit-add')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 3, oa: 4, tb: 2, ob: 8 } } })

    const a0 = placeValue(wrapper, 'addend-a')
    const b0 = placeValue(wrapper, 'addend-b')
    expect([a0.rods, a0.beads, a0.total]).toEqual([3, 4, 34])
    expect([b0.rods, b0.beads, b0.total]).toEqual([2, 8, 28])

    await wrapper.find('[data-test="step-next"]').trigger('click') // 个位
    await wrapper.find('[data-test="step-next"]').trigger('click') // 满十进 1

    // 加数本身不改（仍是 28），捆棒发生在进位区：10 颗散珠 → 1 根十连棒
    const b1 = placeValue(wrapper, 'addend-b')
    expect([b1.rods, b1.beads, b1.total]).toEqual([2, 8, 28])
    expect(wrapper.find('[data-test="carry-rod"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="carry-loose"]').length).toBe(10)
    expect(wrapper.text()).toContain('个位还剩 2 颗')

    const res = placeValue(wrapper, 'add-result')
    expect([res.rods, res.beads, res.total]).toEqual([6, 2, 62])
    // 三个数位模型加起来必须闭合：34 + 28 = 62
    expect(a0.total + b0.total).toBe(res.total)
    // 任何一张卡都不能出现负数颗珠（旧草稿里加数卡曾算出「−2 颗珠」）
    for (const card of ['addend-a', 'addend-b', 'add-result']) {
      const pv = wrapper.find(`[data-test="${card}"] [data-test="pv-total"]`).text()
      expect(pv, `${card} 出现负数`).not.toContain('−')
      expect(pv).not.toMatch(/-\d/)
    }
  })

  it('十连棒的根数与个位珠数始终等于「十位数字 / 个位数字」而不是等于同一个数', () => {
    const lab = findLabById('g2-c7-twodigit-add')!
    const wrapper = mount(TwodigitLab, { props: { lab, values: { ta: 4, oa: 7, tb: 1, ob: 6 } } })
    const a = placeValue(wrapper, 'addend-a')
    expect(a.rods).toBe(4)
    expect(a.beads).toBe(7)
    expect(a.rods).not.toBe(a.beads) // 旧实现两列珠子一样多，看不出 47 是 4 个十 + 7 个一
    expect(a.box.find('[data-test="pv-total"]').text()).toContain('4 根十连棒 + 7 颗珠 = 47')
  })
})
