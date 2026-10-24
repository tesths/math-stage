/**
 * 六年级 c3 / c4「可操作环节」回归（本轮新增两条，其余按要求只核对不重复实现）。
 *
 * 1) `g6-c3-place-value`（概念：相邻计数单位进率 10）——新增「满十进一」现场：
 *    把最接近满十的那一位加到 10 个该计数单位，这一位写 0、向前一位进 1，
 *    进率条同步滑到正在演示的那一对计数单位（如 231 的十位 3 个十 ＋ 7 个十 = 10 个十 = 1 个百 → 301）。
 * 2) `g6-c4-golden-ratio`（概念：黄金比 ≈ 0.618）——新增「一键吸附到黄金比」按钮，
 *    并实时显示「当前比值 与 0.618 的差」；吸附后 goldW/goldH 画出的长宽比真的是 1.618 : 1。
 *
 * 断言的取向与仓库既有约定一致：证据取自**渲染出来的文字 / 行内样式 / aria 属性**，
 * 数值结论另用独立算法复算一遍（不进位就用字符串拆位算、长宽比按 1/0.618 复算），
 * 而不是复抄组件里的表达式。
 */
import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import RatioLab from '@/components/labs/RatioLab.vue'
import { findLabById } from '@data'
import type { ParamValues } from '@data/schema/lab'

const PLACE_ID = 'g6-c3-place-value'
const GOLDEN_ID = 'g6-c4-golden-ratio'
/** 0.618（黄金比的近似值），与数据层 / compute 同一取值 */
const GOLDEN = 0.618

function mountPlace(values: ParamValues = {}): VueWrapper {
  const lab = findLabById(PLACE_ID)!
  return mount(NumberLab, { props: { lab, values: reactive<ParamValues>({ ...values }) } })
}

/** 用响应式对象挂载（与页面传 reactive(values) 的真实行为一致） */
function mountGolden(values: ParamValues): VueWrapper {
  const lab = findLabById(GOLDEN_ID)!
  return mount(RatioLab, { props: { lab, values: reactive<ParamValues>({ ...values }) } })
}

/** 故意传普通对象（非 reactive），验证预设写回也能重渲染（paramRev 模式） */
function mountGoldenPlain(values: ParamValues): VueWrapper {
  const lab = findLabById(GOLDEN_ID)!
  return mount(RatioLab, { props: { lab, values: { ...values } } })
}

/* ---------------- 读数小工具：只从渲染结果里取数 ---------------- */

function norm(text: string): string {
  return text.replace(/\s+/g, '')
}

/** 「满十进一的现场」整块文字（空白折叠） */
function carryText(w: VueWrapper): string {
  return norm(w.find('[aria-label="满十进一的现场"]').text())
}

/** 现场里第 i 行（0 = 计数单位行、1 = 算式行、2 = 数位行） */
function carryRow(w: VueWrapper, i: number): string {
  const rows = w.findAll('.carry-live-row')
  if (!rows[i]) throw new Error(`现场缺少第 ${i} 行：${carryText(w)}`)
  return norm(rows[i]!.text())
}

/** 现场里的算式：得到 [被加前的数, 加上的量, 进位后的数] */
function carrySum(w: VueWrapper): number[] {
  const m = carryRow(w, 1).match(/^(\d+(?:\.\d+)?)＋(\d+(?:\.\d+)?)=(\d+(?:\.\d+)?)$/)
  if (!m) throw new Error(`没找到进位算式：${carryRow(w, 1)}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** 现场里的「第几位的个数 ＋ 几个」：得到 [该位的个数, 还要加几个] */
function carryAddends(w: VueWrapper): number[] {
  const m = carryRow(w, 0).match(/^(\d+)个(.+?)＋(\d+)个/)
  if (!m) throw new Error(`没找到进位加数：${carryRow(w, 0)}`)
  return [Number(m[1]), Number(m[3])]
}

const UNIT_POW: Record<string, number> = {
  千位: 1000,
  百位: 100,
  十位: 10,
  个位: 1,
  十分位: 0.1,
  百分位: 0.01,
}

/** 把「进位后数位：百位 3、十位 0、个位 1（共 301）」解析成 [数位名, 个数][] */
function carryDigits(w: VueWrapper): { name: string; val: number }[] {
  const m = carryRow(w, 2).match(/^进位后数位：([^（]+)（共(\d+(?:\.\d+)?)）$/)
  if (!m) throw new Error(`没找到进位后的数位：${carryRow(w, 2)}`)
  return m[1]!.split('、').map((seg) => {
    const mm = seg.match(/^(.+?)(\d+)$/)
    if (!mm) throw new Error(`数位片段无法解析：${seg}`)
    return { name: mm[1]!, val: Number(mm[2]) }
  })
}

/** 画出的长方形行内宽高（px） */
function rectSize(w: VueWrapper): { w: number; h: number } {
  const el = w.find('.gold-rect').element as HTMLElement
  return { w: parseFloat(el.style.width), h: parseFloat(el.style.height) }
}

function goldDiffText(w: VueWrapper): string {
  return norm(w.find('.gold-diff').text())
}

function snapButton(w: VueWrapper) {
  return w.find('[aria-label="黄金比预设"] button')
}

describe('g6-c3-place-value · 满十进一的现场', () => {
  it('初始收起；点开后把十位的 3 个十加到 10 个，本位写 0、向前一位进 1（231 → 301）', async () => {
    const w = mountPlace({ sel: 0 })
    const btn = () => w.find('.carry-btn')

    // 初始态：现场不出现，按钮未按下；进率条是默认的前 4 条
    expect(w.find('[aria-label="满十进一的现场"]').exists()).toBe(false)
    expect(btn().attributes('aria-pressed')).toBe('false')
    expect(btn().text()).toBe('满十进一：把最接近满十的那一位加到 10')
    expect(w.findAll('.carry-chip.hot')).toHaveLength(0)

    await btn().trigger('click')
    expect(btn().attributes('aria-pressed')).toBe('true')
    expect(btn().text()).toBe('收起满十进一的现场')

    const text = carryText(w)
    // 满十：3 个十 + 7 个十 = 10 个十 = 1 个百
    expect(text).toContain('3个十＋7个十＝10个十＝1个百')
    expect(text).toContain('这一位写0，向前一位进1')
    // 231 的位值 + 70 → 301，屏幕上的算式成立
    expect(text).toContain('231＋70=301')
    const [have, need] = carryAddends(w)
    expect(have).toBe(3)
    expect(need).toBe(7)
    expect(have + need).toBe(10)
    const [from, add, to] = carrySum(w)
    expect(from).toBe(231)
    expect(add).toBe(70)
    expect(from + add).toBe(to)
    // 进位后的数位：百位 3、十位 0、个位 1（本位归零、前一位 +1）
    expect(carryDigits(w).map((d) => [d.name, d.val])).toEqual([
      ['百位', 3],
      ['十位', 0],
      ['个位', 1],
    ])
    // 进率条同步：只有「10 个十 = 1 个百」这一条高亮
    const hot = w.findAll('.carry-chip.hot')
    expect(hot).toHaveLength(1)
    expect(hot[0]!.text()).toBe('10 个十 = 1 个百')

    await btn().trigger('click')
    expect(w.find('[aria-label="满十进一的现场"]').exists()).toBe(false)
    expect(w.findAll('.carry-chip.hot')).toHaveLength(0)
  })

  it('5 个数的进位结果都能被独立复算（值 + 数位两处自洽）', async () => {
    // 单位 → 值（用来把「几个某计数单位」换算回数值）
    const UNIT_VALUE: Record<string, number> = {
      千: 1000,
      百: 100,
      十: 10,
      一: 1,
      十分之一: 0.1,
      百分之一: 0.01,
    }
    const cases = [
      { sel: 0, n: 231, low: '十', high: '百', need: 7, to: 301 },
      { sel: 1, n: 2000, low: '一', high: '十', need: 10, to: 2010 },
      { sel: 2, n: 3.36, low: '百分之一', high: '十分之一', need: 4, to: 3.4 },
      { sel: 3, n: 4.05, low: '百分之一', high: '十分之一', need: 5, to: 4.1 },
      { sel: 4, n: 0.24, low: '百分之一', high: '十分之一', need: 6, to: 0.3 },
    ]

    for (const c of cases) {
      const w = mountPlace({ sel: c.sel })
      await w.find('.carry-btn').trigger('click')
      const text = carryText(w)

      // ① 被加的位与「还要加几个」都对：个数 + 加数 = 10
      expect(text, `sel=${c.sel}`).toContain(`个${c.low}＋${c.need}个${c.low}＝10个${c.low}＝1个${c.high}`)
      const [have, need] = carryAddends(w)
      expect(have + need, `sel=${c.sel}`).toBe(10)
      expect(need).toBe(c.need)

      // ② 数值：原数 + （need 个 low）= 结果（独立复算）
      const [from, add, to] = carrySum(w)
      expect(from).toBe(c.n)
      expect(add).toBeCloseTo(c.need * UNIT_VALUE[c.low]!, 6)
      expect(to).toBeCloseTo(c.n + c.need * UNIT_VALUE[c.low]!, 6)
      expect(to).toBeCloseTo(c.to, 6)

      // ③ 数位：每一位「个数 × 计数单位的值」相加必须等于结果
      const digits = carryDigits(w)
      const sum = digits.reduce((acc, d) => acc + d.val * (UNIT_POW[d.name] ?? 0), 0)
      for (const d of digits) expect(UNIT_POW[d.name], `未知数位 ${d.name}`).toBeDefined()
      expect(sum, `sel=${c.sel}`).toBeCloseTo(c.to, 6)

      // ④ 进率条上高亮的正是这一对（低 → 高）
      expect(w.findAll('.carry-chip.hot').map((n) => n.text())).toEqual([`10 个${c.low} = 1 个${c.high}`])
    }
  })

  it('进率条随所选数滑动到正在演示的那一对计数单位（仍是 4 条）', () => {
    // 231 演示「十 → 百」：落在默认的前 4 条里
    const w0 = mountPlace({ sel: 0 })
    expect(w0.findAll('.carry-chip').map((n) => n.text())).toEqual([
      '10 个一 = 1 个十',
      '10 个十 = 1 个百',
      '10 个百 = 1 个千',
      '10 个十分之一 = 1 个一',
    ])

    // 3.36 演示「百分之一 → 十分之一」：最后一条不在前 4 条里 → 窗口滑动
    const w2 = mountPlace({ sel: 2 })
    const chips = w2.findAll('.carry-chip').map((n) => n.text())
    expect(chips).toHaveLength(4)
    expect(chips).not.toContain('10 个一 = 1 个十')
    expect(chips).toContain('10 个百分之一 = 1 个十分之一')
  })
})

describe('g6-c4-golden-ratio · 一键吸附到黄金比', () => {
  it('实时显示当前比值与 0.618 的差；吸附后「长」写成 宽 ÷ 0.618、差归零', async () => {
    const w = mountGolden({ w: 200, l: 250 })

    // 200 : 250 = 0.8，与 0.618 相差 0.182，未到达
    expect(goldDiffText(w)).toBe('当前比值0.800，黄金比0.618，相差0.182')
    expect(w.find('.gold-diff').classes()).not.toContain('hit')
    expect(snapButton(w).text()).toBe('一键吸附到黄金比')
    expect(snapButton(w).attributes('aria-pressed')).toBe('false')
    // 没吸附时画的就是"现在这个长方形"：长 250 × 宽 200
    expect(rectSize(w)).toEqual({ w: 250, h: 200 })

    await snapButton(w).trigger('click')

    // 写回参数：200 ÷ 0.618 ≈ 323.62
    expect(w.props('values').l).toBeCloseTo(200 / GOLDEN, 2)
    expect(w.props('values').l).toBe(323.62)
    // 渲染同帧更新：比值 0.618，差 0.000，打勾 + 按钮高亮
    expect(goldDiffText(w)).toBe('当前比值0.618，黄金比0.618，相差0.000✓已到达黄金比')
    expect(w.find('.gold-diff').classes()).toContain('hit')
    expect(snapButton(w).attributes('aria-pressed')).toBe('true')
    expect(snapButton(w).text()).toBe('一键吸附到黄金比✓ 当前')
  })

  it('吸附后 goldW/goldH 画出的长宽比真的是 1.618 : 1（多组宽都成立）', async () => {
    for (const values of [
      { w: 200, l: 250 }, // 吸附后长 323.62 > 320 → 走"封顶"分支
      { w: 150, l: 400 }, // 吸附后长 242.72 < 320 → 不封顶
      { w: 90, l: 110 },
    ]) {
      const w = mountGolden(values)
      await snapButton(w).trigger('click')
      const { w: rw, h: rh } = rectSize(w)
      expect(rw / rh, `w=${values.w}`).toBeCloseTo(1 / GOLDEN, 6)
      // 参数里的长宽比也真的接近 1.618 : 1
      expect(w.props('values').l / w.props('values').w).toBeCloseTo(1 / GOLDEN, 2)
      expect(goldDiffText(w)).toContain('✓已到达黄金比')
    }
  })

  it('偏离黄金比时画真实长宽比（不美化）；差 < 0.005 才算到达', () => {
    // 200 : 250 = 0.8 → 画 250 × 200，长宽比 1.25，如实反映"现在这个长方形"
    const off = mountGolden({ w: 200, l: 250 })
    expect(rectSize(off)).toEqual({ w: 250, h: 200 })
    expect(rectSize(off).w / rectSize(off).h).toBeCloseTo(1.25, 6)
    expect(off.find('.gold-diff').classes()).not.toContain('hit')

    // 200 : 324 = 0.617（与 0.618 只差 0.0007 < 0.005）→ 视为到达；差仍照实显示
    const near = mountGolden({ w: 200, l: 324 })
    expect(goldDiffText(near)).toBe('当前比值0.617，黄金比0.618，相差0.001✓已到达黄金比')
    expect(near.find('.gold-diff').classes()).toContain('hit')
    const { w: rw, h: rh } = rectSize(near)
    expect(rw / rh).toBeCloseTo(1 / GOLDEN, 6)
  })

  it('父级传普通对象（非 reactive）时，吸附点击也必须改变渲染结果', async () => {
    const w = mountGoldenPlain({ w: 200, l: 250 })
    expect(goldDiffText(w)).toContain('相差0.182')
    await snapButton(w).trigger('click')
    await nextTick()
    expect(w.props('values').l).toBe(323.62)
    expect(w.find('.gold-diff').classes()).toContain('hit')
    expect(rectSize(w).w / rectSize(w).h).toBeCloseTo(1 / GOLDEN, 6)
  })

  it('数据层新增的「长」参数合法、默认值落在滑块网格上，且默认不是黄金比', () => {
    const lab = findLabById(GOLDEN_ID)!
    const l = lab.params.find((p) => p.key === 'l')
    expect(l, 'golden-ratio 需要「长」参数').toBeTruthy()
    expect(l!.label).toBe('长')
    expect(l!.default).toBeGreaterThanOrEqual(l!.min)
    expect(l!.default).toBeLessThanOrEqual(l!.max)
    expect((l!.default - l!.min) / l!.step).toBeCloseTo(15000, 6)
    // 默认 200 : 250 = 0.8，故意留出"差多少"的探索空间
    expect(200 / l!.default).not.toBeCloseTo(GOLDEN, 3)
    // 一键吸附写回的值（两位小数）也在可达网格上
    expect((323.62 - l!.min) / l!.step).toBeCloseTo(22362, 6)
  })
})
