/**
 * RatioLab 审计附录 A 逐条销项测试
 *
 * 对应 `docs/audit/g6-circle-ratio-audit.md` 附录 A 中与 `RatioLab.vue` 有关的 5 条：
 * R1-2（水位基准来自 params.max）/ R1-1（倍数用分数 + 三位小数）/
 * R2-2（最简比文案 + 课本例题预设按钮）/ R3-2（最小公倍数措辞）/
 * R3-3（化简示例预设按钮 + 高亮）。
 *
 * 断言的取向是「接进模板、真的改变渲染」：每个条目都从组件**渲染出来的文字 / 行内样式 /
 * aria 属性**上取证据，并断言点击预设按钮后 DOM 同步变化，而不是只断言脚本里的变量。
 *
 * 范围说明：R3-3 的另一半「把说明从参数 unit 挪走」需要改 `g6/data/upper/chapters/c4.ts`
 * （`sel.unit` 里那串 "0=12:18 …"），本轮只允许改 RatioLab.vue + 本测试文件，因此组件侧
 * 只做到「说明改由按钮承载 + 高亮」；数据里的 unit 文案仍会由 `pages/labs/[id].vue:154`
 * 渲染在参数标签旁，留待数据文件的责任人清理。
 */
import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import RatioLab from '@/components/labs/RatioLab.vue'
import { findLabById } from '@data'
import type { LabDef, ParamValues } from '@data/schema/lab'

function labOf(id: string): LabDef {
  const lab = findLabById(id)
  if (!lab) throw new Error(`找不到 Lab：${id}`)
  return lab
}

/** 用响应式对象挂载（与 pages/labs/[id].vue 传 reactive(values) 的真实行为一致） */
function mountLab(id: string, values: ParamValues, lab?: LabDef) {
  const target = lab ?? labOf(id)
  return mount(RatioLab, { props: { lab: target, values: reactive<ParamValues>({ ...values }) } })
}

/** 另一组挂载：故意传**普通对象**，验证预设按钮即使入参不响应式也照样重渲染 */
function mountLabPlainValues(id: string, values: ParamValues) {
  return mount(RatioLab, { props: { lab: labOf(id), values: { ...values } } })
}

/** 读出两杯水位的行内高度百分比（渲染结果，不是脚本变量） */
function cupHeights(wrapper: VueWrapper) {
  const height = (sel: string) => parseFloat((wrapper.find(sel).element as HTMLElement).style.height)
  return { a: height('.cup-fill.juice-a'), b: height('.cup-fill.juice-b') }
}

/** 把 Lab 的 a/b 参数上限改掉，用来证明水位基准真的读的是 params.max */
function withCupMax(lab: LabDef, max: number): LabDef {
  return {
    ...lab,
    params: lab.params.map((p) => (p.key === 'a' || p.key === 'b' ? { ...p, max } : p)),
  }
}

function presetButtons(wrapper: VueWrapper, ariaLabel: string) {
  const row = wrapper.find(`[aria-label="${ariaLabel}"]`)
  expect(row.exists()).toBe(true)
  return row.findAll('button')
}

describe('RatioLab 审计销项 · 比的认识（R1-2 水位基准 / R1-1 倍数）', () => {
  it('R1-2：水位基准取自该 Lab 参数声明的 max，两杯同基准、高度比 = 份数比', () => {
    // 默认 c4 数据：a、b 的 max 都是 8 → 3:2 应为 37.5% / 25%（旧代码写死 /8 时"碰巧"对）
    const w = mountLab('g6-c4-ratio-intro', { a: 3, b: 2 })
    const h = cupHeights(w)
    expect(h.a).toBeCloseTo(37.5, 5)
    expect(h.b).toBeCloseTo(25, 5)
    expect(h.a / h.b).toBeCloseTo(3 / 2, 10)
    expect(w.findAll('.note')[1]!.text()).toContain('满杯 8 份')

    // 满格：8:4 → 100% / 50%（第一杯刚好满，不溢出）
    const full = cupHeights(mountLab('g6-c4-ratio-intro', { a: 8, b: 4 }))
    expect(full.a).toBeCloseTo(100, 5)
    expect(full.b).toBeCloseTo(50, 5)
    expect(full.a / full.b).toBeCloseTo(2, 10)

    // 1:3 → 12.5% / 37.5%
    const thin = cupHeights(mountLab('g6-c4-ratio-intro', { a: 1, b: 3 }))
    expect(thin.a).toBeCloseTo(12.5, 5)
    expect(thin.b).toBeCloseTo(37.5, 5)
    expect(thin.a / thin.b).toBeCloseTo(1 / 3, 10)
  })

  it('R1-2：把参数 max 改成 4 / 10，水位立刻跟着改（证明不是写死除以 8）', () => {
    const labMax4 = withCupMax(labOf('g6-c4-ratio-intro'), 4)
    const w4 = mountLab('g6-c4-ratio-intro', { a: 3, b: 2 }, labMax4)
    const h4 = cupHeights(w4)
    expect(h4.a).toBeCloseTo(75, 5) // 3/4，而不是 3/8 = 37.5
    expect(h4.b).toBeCloseTo(50, 5) // 2/4，而不是 2/8 = 25
    expect(h4.a / h4.b).toBeCloseTo(3 / 2, 10)
    expect(w4.findAll('.note')[1]!.text()).toContain('满杯 4 份')

    const labMax10 = withCupMax(labOf('g6-c4-ratio-intro'), 10)
    const h10 = cupHeights(mountLab('g6-c4-ratio-intro', { a: 5, b: 4 }, labMax10))
    expect(h10.a).toBeCloseTo(50, 5)
    expect(h10.b).toBeCloseTo(40, 5)
    expect(h10.a / h10.b).toBeCloseTo(5 / 4, 10)
  })

  it('R1-1：能除尽给精确小数（3:2 → 1.5、1:8 → 0.125），除不尽给最简分数 + 三位小数', () => {
    const noteOf = (values: ParamValues) => {
      const w = mountLab('g6-c4-ratio-intro', values)
      return w.findAll('.note')[0]!.text()
    }

    // 3:2 = 1.5 精确（旧代码 toFixed2 也是 1.5，但这里要确认没有退化成 3/2）
    expect(noteOf({ a: 3, b: 2 })).toBe('前项 3，后项 2；表示橙汁是水的 1.5 倍')
    // 1:3 除不尽 → 最简分数 + 三位小数（旧代码只给 "0.33"）
    expect(noteOf({ a: 1, b: 3 })).toBe('前项 1，后项 3；表示橙汁是水的 1/3 ≈ 0.333 倍')
    expect(noteOf({ a: 1, b: 3 })).not.toContain('0.33 倍')
    // 2:3、5:6 同理
    expect(noteOf({ a: 2, b: 3 })).toContain('2/3 ≈ 0.667')
    expect(noteOf({ a: 5, b: 6 })).toContain('5/6 ≈ 0.833')
    // 分母只有 2、5 的数都能精确表示，仍给小数
    expect(noteOf({ a: 1, b: 8 })).toContain('0.125')
    expect(noteOf({ a: 1, b: 4 })).toContain('0.25')
    expect(noteOf({ a: 6, b: 8 })).toContain('0.75') // 6:8 约分后 3/4
    expect(noteOf({ a: 6, b: 8 })).not.toContain('3/4')
  })
})

describe('RatioLab 审计销项 · 比值与形状（R2-2 文案 + 预设）', () => {
  it('R2-2①：5:3 被叫作「最简比」，不再叫「比值」', () => {
    const w = mountLab('g6-c4-ratio-value', { w: 90, h: 54 })
    const big = w.find('.ratio-big').text()
    expect(big).toContain('90 : 54')
    expect(big).toContain('1.67')
    expect(big).toContain('最简比 5:3')
    expect(big).not.toContain('比值 5:3')
    expect(big).not.toContain('（比值')
    // 比值这个词只留给"长 ÷ 宽"的说明
    expect(w.find('.note').text()).toBe('长 ÷ 宽 = 比值；比值相等的长方形形状相同')

    // 最简比是算出来的：100:30 → 10:3
    const w2 = mountLab('g6-c4-ratio-value', { w: 100, h: 30 })
    expect(w2.find('.ratio-big').text()).toContain('最简比 10:3')
  })

  it('R2-2②：宽 54 既在滑块网格上、也能用预设按钮一键取回课本数值', async () => {
    const lab = labOf('g6-c4-ratio-value')
    const hParam = lab.params.find((p) => p.key === 'h')!
    // 审计要求让 54 可达：step 改为 1 后 54 落在网格上（预设按钮是第二道保险）
    expect(hParam.step).toBe(1)
    expect((hParam.default - hParam.min) % hParam.step).toBe(0)

    const w = mountLab('g6-c4-ratio-value', { w: 100, h: 30 })
    const btns = presetButtons(w, '课本例题预设')
    expect(btns.map((b) => b.attributes('type'))).toEqual(['button', 'button', 'button'])
    expect(btns.map((b) => b.text())).toEqual(['90 : 54', '90 : 45', '80 : 40'])
    // 100:30 不命中任何预设
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['false', 'false', 'false'])
    expect(w.findAll('.preset-btn.active')).toHaveLength(0)

    // 点 90 : 54 → 参数写回，且渲染出来的文字/高亮同帧更新
    await btns[0]!.trigger('click')
    expect(w.props('values').w).toBe(90)
    expect(w.props('values').h).toBe(54)
    expect(w.find('.ratio-big').text()).toContain('90 : 54 = 1.67（最简比 5:3）')
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['true', 'false', 'false'])
    expect(btns[0]!.classes()).toContain('active')
    expect(btns[0]!.text()).toContain('✓ 当前')
    expect(w.findAll('.preset-btn.active')).toHaveLength(1)

    // 点 90 : 45 → 比值 2、最简比 2:1
    await btns[1]!.trigger('click')
    expect(w.props('values').h).toBe(45)
    expect(w.find('.ratio-big').text()).toContain('90 : 45 = 2（最简比 2:1）')
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['false', 'true', 'false'])

    // 点 80 : 40 → 比值 2、最简比 2:1
    await btns[2]!.trigger('click')
    expect(w.props('values').w).toBe(80)
    expect(w.props('values').h).toBe(40)
    expect(w.find('.ratio-big').text()).toContain('80 : 40 = 2（最简比 2:1）')
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['false', 'false', 'true'])

    // 回到 90 : 54，证明 54 可复现（滑块网格到不了）
    await btns[0]!.trigger('click')
    expect(w.find('.rect-ht').text()).toBe('54')
    expect(w.find('.ratio-big').text()).toContain('90 : 54')
  })

  it('R2-2②：父级传普通对象（非 reactive）时，预设点击也必须改变渲染结果', async () => {
    const w = mountLabPlainValues('g6-c4-ratio-value', { w: 100, h: 30 })
    expect(w.find('.ratio-big').text()).toContain('100 : 30 = 3.33（最简比 10:3）')

    await presetButtons(w, '课本例题预设')[0]!.trigger('click')
    await nextTick()

    expect(w.props('values').w).toBe(90)
    expect(w.props('values').h).toBe(54)
    // 渲染结果确实变了（不是只改了脚本里的对象）
    expect(w.find('.ratio-big').text()).toContain('90 : 54 = 1.67（最简比 5:3）')
    expect(w.findAll('.preset-btn.active')).toHaveLength(1)
  })
})

describe('RatioLab 审计销项 · 化简比（R3-2 措辞 / R3-3 预设按钮）', () => {
  it('R3-2：5/6 : 3/4 的说明写「最小公倍数」，不再写「公分母」', () => {
    const w = mountLab('g6-c4-ratio-simplify', { sel: 1 })
    const step = w.find('.sim-step').text()
    expect(step).toBe('同时乘 12（6 和 4 的最小公倍数）')
    expect(w.findAll('.flow-chip')[1]!.text()).toContain('两边同做：同时乘 12（6 和 4 的最小公倍数）')
    expect(w.find('.ratio-big').text()).toBe('5/6 : 3/4')
    expect(w.find('.sim-ans').text()).toContain('10 : 9')
    // 整个渲染结果里不再出现"公分母"
    expect(w.text()).not.toContain('公分母')
  })

  it('R3-3：4 个示例各一个预设按钮，点哪个就选中并高亮哪个', async () => {
    const w = mountLab('g6-c4-ratio-simplify', { sel: 0 })
    const btns = presetButtons(w, '化简示例预设')
    expect(btns).toHaveLength(4)
    expect(btns.map((b) => b.attributes('type'))).toEqual(['button', 'button', 'button', 'button'])
    expect(btns.map((b) => b.text())).toEqual([
      '12 : 18✓ 当前',
      '5/6 : 3/4',
      '1.8 : 0.09',
      '0.32 : 0.8',
    ])
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['true', 'false', 'false', 'false'])
    expect(w.findAll('.preset-btn.active')).toHaveLength(1)

    // 点 1.8 : 0.09（下标 2）
    await btns[2]!.trigger('click')
    expect(w.props('values').sel).toBe(2)
    expect(w.find('.ratio-big').text()).toBe('1.8 : 0.09')
    expect(w.find('.sim-step').text()).toContain('同时乘 100')
    expect(w.find('.sim-ans').text()).toContain('20 : 1')
    expect(w.find('.group-bars').exists()).toBe(false) // 只有整数示例才画分组量条
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['false', 'false', 'true', 'false'])
    expect(btns[2]!.classes()).toContain('active')
    expect(w.findAll('.preset-btn.active')).toHaveLength(1)

    // 点 5/6 : 3/4（下标 1）
    await btns[1]!.trigger('click')
    expect(w.props('values').sel).toBe(1)
    expect(w.find('.ratio-big').text()).toBe('5/6 : 3/4')
    expect(w.find('.sim-ans').text()).toContain('10 : 9')

    // 点 0.32 : 0.8（下标 3）
    await btns[3]!.trigger('click')
    expect(w.props('values').sel).toBe(3)
    expect(w.find('.ratio-big').text()).toBe('0.32 : 0.8')
    expect(w.find('.sim-ans').text()).toContain('2 : 5')

    // 回到 12 : 18（下标 0）：量条与分组照旧渲染
    await btns[0]!.trigger('click')
    expect(w.props('values').sel).toBe(0)
    expect(w.find('.ratio-big').text()).toBe('12 : 18')
    expect(w.find('.sim-ans').text()).toContain('2 : 3')
    expect(w.findAll('.gb-cell')).toHaveLength(5) // 12/6 = 2 格 + 18/6 = 3 格
    expect(btns.map((b) => b.attributes('aria-pressed'))).toEqual(['true', 'false', 'false', 'false'])
  })

  it('R3-3：父级传普通对象时，化简示例预设点击同样改变渲染结果', async () => {
    const w = mountLabPlainValues('g6-c4-ratio-simplify', { sel: 0 })
    await presetButtons(w, '化简示例预设')[3]!.trigger('click')
    await nextTick()
    expect(w.props('values').sel).toBe(3)
    expect(w.find('.ratio-big').text()).toBe('0.32 : 0.8')
    expect(w.find('.sim-ans').text()).toContain('2 : 5')
  })
})
