/**
 * 六年级四 比和比例：c4 剩余 6 个例题的「可操作环节」回归（`golden-ratio` 已在 ops-g6-c3c4 覆盖）。
 *
 * 1) `g6-c4-ratio-intro`     —— 「前项与后项互换」对照：两个比、比值互为倒数、意义变了。
 * 2) `g6-c4-ratio-value`     —— 「比值相等的比 → 形状相同」缩放对照（×1/×2/×3 同一形状）。
 * 3) `g6-c4-ratio-simplify`  —— 「同乘 / 同除同一个数」分步高亮：每步比值恒等，终点是最简整数比。
 * 4) `g6-c4-ratio-distribute`—— 显式三层步进（总份数 → 每份 → 各部分），保留除不尽自检。
 * 5) `g6-c4-proportion-basic`—— 「交叉相乘」两条对角线高亮 + 两个积。
 * 6) `g6-c4-solve-proportion`—— 「代入 → 交叉相乘 → 求解」步进，能除尽写 `=`、除不尽写 `≈` 并附最简分数。
 *
 * 断言取向：数值型结论都从**渲染出来的文字 / 行内样式 / SVG 属性**上取证据，再用独立算法复算
 * （比值解析、外项积/内项积分别相乘、与 `computeLab` 的 value 对照），不复抄组件里的表达式。
 */
import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { reactive } from 'vue'
import RatioLab from '@/components/labs/RatioLab.vue'
import { findLabById } from '@data'
import { computeLab } from '@/lib/labs/compute'
import type { ParamValues } from '@data/schema/lab'

function mountRatio(id: string, values: ParamValues): VueWrapper {
  const lab = findLabById(id)
  if (!lab) throw new Error(`找不到 Lab：${id}`)
  return mount(RatioLab, { props: { lab, values: reactive<ParamValues>({ ...values }) } })
}

/** 折叠空白，便于对整句文案做断言 */
function norm(text: string): string {
  return text.replace(/\s+/g, '')
}

/** 把 '12 : 18'、'5/6 : 3/4'、'1.8 : 0.09' 这类比文本解析成精确数值比（独立算法） */
function ratioValueOf(label: string): number {
  const part = (t: string): number => {
    const p = t.trim().split('/')
    return Number(p[0]) / Number(p[1] ?? 1)
  }
  const [x, y] = label.split(':')
  return part(x!) / part(y!)
}

function boxOf(w: VueWrapper, ariaLabel: string): VueWrapper {
  const box = w.find(`[aria-label="${ariaLabel}"]`)
  expect(box.exists(), `缺少 ${ariaLabel}`).toBe(true)
  return box
}

describe('g6-c4-ratio-intro · 前项与后项互换', () => {
  it('互换后比值 = 1/原比值，但「谁与谁比」变了', async () => {
    const w = mountRatio('g6-c4-ratio-intro', { a: 4, b: 2 })
    const box = boxOf(w, '前项后项互换对照')
    // 初始收起：没有对照行
    expect(box.findAll('.swap-line')).toHaveLength(0)
    const btn = () => box.find('.step-btn')
    expect(btn().attributes('aria-pressed')).toBe('false')

    await btn().trigger('click')
    expect(btn().attributes('aria-pressed')).toBe('true')
    expect(norm(btn().text())).toBe('收起互换对照')

    const lines = box.findAll('.swap-line').map((n) => norm(n.text()))
    expect(lines[0]).toBe('原来：纯橙汁:水=4:2，比值=4÷2=2，表示橙汁是水的2倍')
    expect(lines[1]).toBe('互换：水:纯橙汁=2:4，比值=2÷4=0.5，表示水是橙汁的0.5倍')
    expect(lines[2]).toContain('互为倒数')
    expect(lines[2]).toContain('意义也就变了')

    // 数值独立复算：互换前后两个比值互为倒数
    const before = 4 / 2
    const after = 2 / 4
    expect(before * after).toBe(1)
    expect(after).toBeCloseTo(1 / before, 12)

    // 再点一次收起
    await btn().trigger('click')
    expect(box.findAll('.swap-line')).toHaveLength(0)
    expect(btn().attributes('aria-pressed')).toBe('false')
  })

  it('除不尽的一方给最简分数 + 近似值（3:2 ↔ 2:3）', async () => {
    const w = mountRatio('g6-c4-ratio-intro', { a: 3, b: 2 })
    await boxOf(w, '前项后项互换对照').find('.step-btn').trigger('click')
    const lines = boxOf(w, '前项后项互换对照').findAll('.swap-line').map((n) => norm(n.text()))
    expect(lines[0]).toBe('原来：纯橙汁:水=3:2，比值=3÷2=1.5，表示橙汁是水的1.5倍')
    expect(lines[1]).toBe('互换：水:纯橙汁=2:3，比值=2÷3=2/3≈0.667，表示水是橙汁的2/3≈0.667倍')
    // 1.5 的倒数是 2/3 ≈ 0.667
    expect(1 / 1.5).toBeCloseTo(2 / 3, 12)
    expect(Number('0.667')).toBeCloseTo(2 / 3, 3)
  })

  it('后项为 0（无效的比）时不报错，比值显示「—」', async () => {
    const w = mountRatio('g6-c4-ratio-intro', { a: 0, b: 0 })
    await boxOf(w, '前项后项互换对照').find('.step-btn').trigger('click')
    const lines = boxOf(w, '前项后项互换对照').findAll('.swap-line').map((n) => norm(n.text()))
    expect(lines[0]).toContain('0÷0=—')
    expect(lines[1]).toContain('0÷0=—')
  })
})

describe('g6-c4-ratio-value · 比值相等的比 → 形状相同', () => {
  it('×1/×2/×3 三个等值比形状相同、比值相等，只差大小', async () => {
    const w = mountRatio('g6-c4-ratio-value', { w: 90, h: 54 })
    const box = boxOf(w, '等值比与形状对照')

    // 标签 = 最简比 5:3 的整数倍
    expect(box.findAll('.scale-label').map((n) => norm(n.text()))).toEqual([
      '×1→5:3',
      '×2→10:6',
      '×3→15:9',
    ])
    // 每个比的比值（独立解析）都相等，且等于长÷宽的比值
    const labels = box.findAll('.scale-label').map((n) => norm(n.text()).split('→')[1]!)
    for (const l of labels) expect(ratioValueOf(l)).toBeCloseTo(90 / 54, 12)
    expect(new Set(labels.map((l) => ratioValueOf(l).toFixed(12))).size).toBe(1)

    // 画出的长宽比 = 比值；三档只是按 k 放大
    const dims = box.findAll('.scale-rect').map((n) => {
      const el = n.element as HTMLElement
      return { w: parseFloat(el.style.width), h: parseFloat(el.style.height) }
    })
    for (const d of dims) expect(d.w / d.h).toBeCloseTo(90 / 54, 6)
    expect(dims[1]!.w).toBeCloseTo(dims[0]!.w * 2, 4)
    expect(dims[2]!.w).toBeCloseTo(dims[0]!.w * 3, 4)
    expect(box.findAll('.scale-value').map((n) => norm(n.text()))).toEqual([
      '比值1.67',
      '比值1.67',
      '比值1.67',
    ])
  })

  it('「换一档大小」在 ×1 → ×2 → ×3 → ×1 间循环并高亮当前档', async () => {
    const w = mountRatio('g6-c4-ratio-value', { w: 90, h: 54 })
    const box = boxOf(w, '等值比与形状对照')
    const boxes = () => box.findAll('.scale-box')
    const btn = () => box.find('.step-btn')

    expect(boxes()[0]!.classes()).toContain('on')
    expect(norm(btn().text())).toBe('换一档大小：×1→×2')

    await btn().trigger('click')
    expect(boxes()[1]!.classes()).toContain('on')
    expect(boxes()[0]!.classes()).not.toContain('on')
    expect(norm(btn().text())).toBe('换一档大小：×2→×3')

    await btn().trigger('click')
    expect(boxes()[2]!.classes()).toContain('on')
    expect(norm(btn().text())).toBe('换一档大小：×3→×1')

    await btn().trigger('click')
    expect(boxes()[0]!.classes()).toContain('on')
  })

  it('换一组参数（100:30 → 10:3）后对照跟着变，形状比仍等于比值', async () => {
    const w = mountRatio('g6-c4-ratio-value', { w: 100, h: 30 })
    const box = boxOf(w, '等值比与形状对照')
    expect(box.findAll('.scale-label').map((n) => norm(n.text()))).toEqual([
      '×1→10:3',
      '×2→20:6',
      '×3→30:9',
    ])
    const dims = box.findAll('.scale-rect').map((n) => {
      const el = n.element as HTMLElement
      return parseFloat(el.style.width) / parseFloat(el.style.height)
    })
    for (const r of dims) expect(r).toBeCloseTo(100 / 30, 6)
  })
})

describe('g6-c4-ratio-simplify · 同乘 / 同除的分步轨迹', () => {
  it('12:18 → 6:9 → 2:3：每步比值恒等，终点是最简整数比', async () => {
    const w = mountRatio('g6-c4-ratio-simplify', { sel: 0 })
    const box = boxOf(w, '同乘同除的步进')
    const btn = box.find('.step-btn')
    const shownValue = (): string =>
      box.findAll('.trace-line')[1]!.text().match(/比值\s*=\s*([\d.]+)/)![1]!

    expect(box.findAll('.trace-chip').map((n) => n.text())).toEqual(['12 : 18', '6 : 9', '2 : 3'])
    expect(box.findAll('.trace-chip.on')).toHaveLength(1)
    expect(shownValue()).toBe('0.67')
    expect(norm(box.findAll('.trace-line')[0]!.text())).toBe('第1步：原来的比')

    // 独立复算：每一步改写后的比值都等于 12/18
    const labels = box.findAll('.trace-chip').map((n) => n.text())
    for (const l of labels) expect(ratioValueOf(l)).toBeCloseTo(12 / 18, 12)
    expect(new Set(labels.map((l) => ratioValueOf(l).toFixed(12))).size).toBe(1)

    // 逐步前进：高亮与文案同步，比值始终不变
    await btn.trigger('click')
    expect(box.findAll('.trace-chip.on')[0]!.text()).toBe('6 : 9')
    expect(norm(box.findAll('.trace-line')[0]!.text())).toBe('第2步：前项、后项同时除以2')
    expect(shownValue()).toBe('0.67')

    await btn.trigger('click')
    expect(box.findAll('.trace-chip.on')[0]!.text()).toBe('2 : 3')
    expect(shownValue()).toBe('0.67')
    // 终点 = 最简整数比（与答案行一致）
    expect(box.findAll('.trace-chip').at(-1)!.text()).toBe('2 : 3')
    expect(norm(w.find('.sim-ans').text())).toContain('2:3')

    // 走完回到第一步
    await btn.trigger('click')
    expect(box.findAll('.trace-chip.on')[0]!.text()).toBe('12 : 18')
    expect(shownValue()).toBe('0.67')
  })

  it('分数比 5/6 : 3/4 → ×12 → 10 : 9（两步，比值不变）', async () => {
    const w = mountRatio('g6-c4-ratio-simplify', { sel: 1 })
    const box = boxOf(w, '同乘同除的步进')
    const chips = box.findAll('.trace-chip').map((n) => n.text())
    expect(chips).toEqual(['5/6 : 3/4', '10 : 9'])
    // 独立复算：(5/6) ÷ (3/4) == 10 ÷ 9
    expect(ratioValueOf(chips[0]!)).toBeCloseTo((5 / 6) / (3 / 4), 12)
    expect(ratioValueOf(chips[0]!)).toBeCloseTo(ratioValueOf(chips[1]!), 12)
    // 比值显示：10/9 ≈ 1.11，两步相同
    expect(norm(box.findAll('.trace-line')[1]!.text())).toContain('比值=1.11')
    // 只有两步：点一次到终点，再点回到起点
    const btn = box.find('.step-btn')
    await btn.trigger('click')
    expect(box.findAll('.trace-chip.on')[0]!.text()).toBe('10 : 9')
    expect(norm(box.findAll('.trace-line')[1]!.text())).toContain('比值=1.11')
    await btn.trigger('click')
    expect(box.findAll('.trace-chip.on')[0]!.text()).toBe('5/6 : 3/4')

    // 切到小数比示例，轨迹整体替换（1.8 : 0.09 → 180 : 9 → 20 : 1）
    const w2 = mountRatio('g6-c4-ratio-simplify', { sel: 2 })
    const box2 = boxOf(w2, '同乘同除的步进')
    expect(box2.findAll('.trace-chip').map((n) => n.text())).toEqual([
      '1.8 : 0.09',
      '180 : 9',
      '20 : 1',
    ])
    expect(ratioValueOf('1.8 : 0.09')).toBeCloseTo(20, 9)
    expect(box2.findAll('.trace-line')[1]!.text()).toMatch(/比值\s*=\s*20/)
  })
})

describe('g6-c4-ratio-distribute · 显式三层步进', () => {
  it('总份数 → 每份 → 各部分逐层出现，合计数 = 总数', async () => {
    const w = mountRatio('g6-c4-ratio-distribute', { a: 3, b: 2, total: 500 })
    const box = boxOf(w, '按比例分配的三层步进')
    const layers = () => box.findAll('.dist-layer').map((n) => norm(n.text()))
    const btn = () => box.find('.step-btn')

    // 初始还没揭示（分步揭示：先不给结论）
    expect(layers()).toEqual([])
    expect(norm(btn().text())).toBe('下一步：总份数')

    await btn().trigger('click')
    expect(layers()).toEqual(['第1步·总份数=3+2=5份'])
    expect(norm(btn().text())).toBe('下一步：每份')

    await btn().trigger('click')
    expect(layers()).toEqual(['第1步·总份数=3+2=5份', '第2步·每份=500÷5=100克'])
    expect(norm(btn().text())).toBe('下一步：各部分')

    await btn().trigger('click')
    expect(layers()[2]).toBe('第3步·糯米粉=100×3=300克；鼠曲草浆=100×2=200克')
    expect(layers()[3]).toBe('合计数=500克=总数500克✓（正好分完）')
    // 递进：第 3 层沿用第 2 层算出的「每份 100」
    expect(layers()[2]).toContain('100×3=300')
    expect(layers()[2]).toContain('100×2=200')
    // 独立复算：两部分相加 = 总数
    expect(100 * 3 + 100 * 2).toBe(500)

    // 走完回到「还没揭示」
    await btn().trigger('click')
    expect(layers()).toEqual([])
    expect(norm(btn().text())).toBe('下一步：总份数')
  })

  it('除不尽（500 按 1:2）时第 3 层改用「总数 × 几分之几」，自检行保留', async () => {
    const w = mountRatio('g6-c4-ratio-distribute', { a: 1, b: 2, total: 500 })
    const box = boxOf(w, '按比例分配的三层步进')
    const layers = () => box.findAll('.dist-layer').map((n) => norm(n.text()))

    for (let i = 0; i < 3; i++) await box.find('.step-btn').trigger('click')
    const third = layers()[2]!
    expect(third).toContain('每份除不尽，改用「总数×几分之几」')
    expect(third).toContain('500×1/3=166.67')
    expect(third).toContain('500×2/3=333.33')
    // 合计数仍 = 总数
    expect(layers()[3]).toBe('合计数=500克=总数500克✓（正好分完）')
    // 原有的自检行仍在（本轮保留，未替换）
    expect(norm(w.find('.dist-check').text())).toContain('合计500克')
    expect(norm(w.find('.sim-ans').text())).toContain('166.67')
  })
})

describe('g6-c4-proportion-basic · 交叉相乘的连线', () => {
  it('两条对角线分别连起外项与内项，两个积相等且与四个数独立相乘一致', async () => {
    const w = mountRatio('g6-c4-proportion-basic', { a: 4, b: 2, k: 3 })
    // a=4: b=2 = 12 : 6，外项积 4×6、内项积 2×12
    expect(norm(w.find('.cross-note').text())).toBe('两条对角线的积始终相等：4×6=2×12=24')
    expect(w.findAll('.cross-product').map((n) => norm(n.text()))).toEqual([
      '外项积：4×6=24',
      '内项积：2×12=24',
    ])
    // 独立复算：四个数分别相乘
    expect(4 * 6).toBe(24)
    expect(2 * 12).toBe(24)
    expect(4 * 6).toBe(2 * 12)

    // 连线：两条对角线 + 四个端点（外项在两端、内项在中间）
    const svg = w.find('[aria-label="交叉相乘的连线"]')
    expect(svg.findAll('line')).toHaveLength(2)
    expect(svg.findAll('text').map((n) => norm(n.text()))).toEqual([
      '外项4',
      '内项2',
      '内项12',
      '外项6',
    ])
  })

  it('「高亮」在外项积 / 内项积之间切换，连线与积同步高亮', async () => {
    const w = mountRatio('g6-c4-proportion-basic', { a: 4, b: 2, k: 3 })
    const svg = w.find('[aria-label="交叉相乘的连线"]')
    const btn = w.find('.step-btn')

    // 默认高亮外项积（a 与 d 那条对角线）
    expect(svg.find('line.outer').classes()).toContain('on')
    expect(svg.find('line.inner').classes()).not.toContain('on')
    expect(w.findAll('.cross-product')[0]!.classes()).toContain('on')
    expect(norm(btn.text())).toBe('高亮内项积')

    await btn.trigger('click')
    expect(svg.find('line.outer').classes()).not.toContain('on')
    expect(svg.find('line.inner').classes()).toContain('on')
    expect(w.findAll('.cross-product')[1]!.classes()).toContain('on')
    expect(norm(btn.text())).toBe('高亮外项积')

    await btn.trigger('click')
    expect(svg.find('line.outer').classes()).toContain('on')
    expect(svg.find('line.inner').classes()).not.toContain('on')
  })

  it('多组参数下外项积恒等于内项积（独立复算）', () => {
    for (const v of [
      { a: 5, b: 3, k: 2 },
      { a: 7, b: 2, k: 6 },
      { a: 4, b: 2, k: 2 },
    ]) {
      const w = mountRatio('g6-c4-proportion-basic', v)
      const pd = v.b * v.k
      const pc = v.a * v.k
      expect(v.a * pd).toBe(v.b * pc)
      expect(norm(w.find('.cross-note').text())).toBe(
        `两条对角线的积始终相等：${v.a}×${pd}=${v.b}×${pc}=${v.a * pd}`,
      )
    }
  })
})

describe('g6-c4-solve-proportion · 代入 → 交叉相乘 → 求解', () => {
  it('能除尽（25:200 = x:300）写「=」，数值与 computeLab 一致', async () => {
    const w = mountRatio('g6-c4-solve-proportion', { a: 25, b: 200, c: 300 })
    const box = boxOf(w, '解比例的代入步进')
    const layers = () => box.findAll('.solve-layer').map((n) => norm(n.text()))
    const btn = () => box.find('.step-btn')

    // 初始还没揭示
    expect(layers()).toEqual([])
    expect(norm(btn().text())).toBe('下一步：代入')

    await btn().trigger('click')
    expect(layers()).toEqual(['第1步·代入：设应加x克糖，列出比例25:200=x:300'])
    expect(norm(btn().text())).toBe('下一步：交叉相乘')

    await btn().trigger('click')
    expect(layers()[1]).toBe('第2步·交叉相乘（外项积=内项积）：200×x=25×300，即200x=7500')

    await btn().trigger('click')
    expect(layers()[2]).toBe('第3步·求解：x=7500÷200=37.5克')
    expect(layers()[2]).not.toContain('≈')

    // 与 compute 同一结果
    const computed = computeLab('solve-proportion', { a: 25, b: 200, c: 300 })
    expect(computed.value).toBeCloseTo(37.5, 6)
    expect(layers()[2]).toContain(String(computed.value))
    // 交叉相乘这一步的两个积确实相等
    expect(200 * 37.5).toBe(25 * 300)

    // 走完回到「还没揭示」
    await btn().trigger('click')
    expect(layers()).toEqual([])
    expect(norm(btn().text())).toBe('下一步：代入')
  })

  it('除不尽（15:70 = x:100 → 150/7）写「≈」并附最简分数', async () => {
    const w = mountRatio('g6-c4-solve-proportion', { a: 15, b: 70, c: 100 })
    const box = boxOf(w, '解比例的代入步进')
    for (let i = 0; i < 3; i++) await box.find('.step-btn').trigger('click')
    const last = norm(box.findAll('.solve-layer').at(-1)!.text())

    expect(last).toContain('÷70≈21.43克')
    expect(last).toContain('除不尽')
    expect(last).toContain('精确值150/7')
    expect(last).toContain('约等号')

    const computed = computeLab('solve-proportion', { a: 15, b: 70, c: 100 })
    expect(computed.value).toBeCloseTo(21.43, 2)
    expect(last).toContain(String(computed.value))
    expect(computed.conclusion).toContain('≈')
    // 独立复算：1500 ÷ 70 = 150/7
    expect(1500 / 70).toBeCloseTo(150 / 7, 12)
    expect(Number('21.43')).toBeCloseTo(150 / 7, 2)
  })
})
