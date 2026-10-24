/**
 * 五年级 c3（多边形面积）+ c6（因数与倍数）+ 钉子板：本轮新增「操作环节」的组件断言。
 *
 * 数学正确性约定：本文件里的面积/因数/质数/钉子计数**全部用独立算法复算**
 * （自己实现的鞋带公式、试除法、gcd、射线法），只把组件的输出拿来对，不复抄组件里的公式。
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AreaLab from '@/components/labs/AreaLab.vue'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import PinboardLab from '@/components/labs/PinboardLab.vue'
import { findLabById } from '@data'
import { computeLab } from '@/lib/labs/compute'

// 动画立即完成（与 labs.test.ts 的约定一致），便于断言动画结束态
vi.mock('animejs', () => ({
  animate: vi.fn((_target: unknown, cfg: { complete?: () => void; update?: () => void }) => {
    cfg.update?.()
    cfg.complete?.()
    return { cancel: vi.fn() }
  }),
}))

type Pt = [number, number]

/* ==================== 独立复算工具（与组件实现无关） ==================== */

/** 自己实现的鞋带公式 */
function shoelace(pts: Pt[]): number {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}

/** 两点的欧氏距离（用来独立核对「拼成图形的底」） */
function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1])
}

/** 试除法求因数（升序） */
function factorsOwn(n: number): number[] {
  const out: number[] = []
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d)
  return out
}

function gcdOwn(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

function lcmOwn(a: number, b: number): number {
  return (a * b) / gcdOwn(a, b)
}

function isPrimeOwn(n: number): boolean {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

/** 边上钉子：每条边的 gcd(|dx|,|dy|) 之和 */
function boundaryOwn(pts: Pt[]): number {
  let n = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!
    const [x2, y2] = pts[(i + 1) % pts.length]!
    n += gcdOwn(x2 - x1, y2 - y1)
  }
  return n
}

/** 内部钉子：自己写「边上判定 + 射线法」逐个格点数 */
function insideOwn(pts: Pt[]): number {
  const maxX = Math.max(...pts.map((p) => p[0]))
  const maxY = Math.max(...pts.map((p) => p[1]))
  const onEdge = (x: number, y: number) =>
    pts.some(([x1, y1], i) => {
      const [x2, y2] = pts[(i + 1) % pts.length]!
      const cross = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
      return (
        cross === 0 &&
        x >= Math.min(x1, x2) &&
        x <= Math.max(x1, x2) &&
        y >= Math.min(y1, y2) &&
        y <= Math.max(y1, y2)
      )
    })
  const inPoly = (x: number, y: number) => {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i]!
      const [xj, yj] = pts[j]!
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
    }
    return inside
  }
  let b = 0
  for (let y = 1; y < maxY; y++) {
    for (let x = 1; x < maxX; x++) if (!onEdge(x, y) && inPoly(x, y)) b++
  }
  return b
}

/** 组合图形（池塘）顶点：上边 top、左边高 left、右上竖边 right、下底 bottom */
function compositeOutlineOwn(top: number, left: number, right: number, bottom: number): Pt[] {
  return [
    [0, 0],
    [bottom, 0],
    [top, left - right],
    [top, left],
    [0, left],
  ]
}

function buttonWith(wrapper: ReturnType<typeof mount>, text: string) {
  return wrapper.findAll('button').find((b) => b.text().includes(text))
}

/* ==================== 1. 多边形的面积：找对应关系 + 倍拼两步 ==================== */

describe('AreaLab：找对应关系与倍拼两步', () => {
  it('梯形：标出「上底+下底」，倍拼后底 = 上底+下底、面积 = 2×单图形面积', async () => {
    const lab = findLabById('g5-c3-area-trapezoid')!
    const wrapper = mount(AreaLab, { props: { lab, values: { a: 4, b: 6, h: 3, shape: 2 } } })

    // 独立复算：梯形顶点（上底 4、下底 6、高 3，等腰）
    const trap: Pt[] = [
      [0, 0],
      [6, 0],
      [5, 3],
      [1, 3],
    ]
    // 两个完全一样的梯形拼成的平行四边形：底 = 4+6 = 10、高 3
    const joined: Pt[] = [
      [0, 0],
      [10, 0],
      [11, 3],
      [1, 3],
    ]
    expect(shoelace(trap)).toBe(15)
    expect(shoelace(joined)).toBe(30)
    expect(dist(joined[0]!, joined[1]!)).toBe(10)
    expect(shoelace(joined)).toBeCloseTo(2 * shoelace(trap), 9)

    // 未点开时没有对应标注
    expect(wrapper.find('.corr-verify').exists()).toBe(false)
    expect(wrapper.findAll('.corr-src')).toHaveLength(0)

    await buttonWith(wrapper, '显示对应关系')!.trigger('click')

    // 底、高两条对应关系 + 梯形的「上底」那一段
    expect(wrapper.findAll('.corr-src')).toHaveLength(3)
    expect(wrapper.findAll('.corr-tgt')).toHaveLength(2)
    expect(wrapper.findAll('.corr-link')).toHaveLength(2)
    expect(wrapper.find('.corr-label[data-pair="base"]').text()).toBe('下底 6 + 上底 4 = 10')
    expect(wrapper.find('.corr-label[data-pair="height"]').text()).toBe('高 3 = 高 3')
    expect(wrapper.find('.corr-label[data-pair="base-add"]').text()).toBe('上底 4')

    const corr = wrapper.find('.corr-verify')
    expect(corr.text()).toContain('平行四边形的底 = 上底 + 下底 = 4 + 6 = 10')
    expect(corr.text()).toContain('拼成图形的面积 30 = 2 × 梯形面积 15')
    // 组件给出的三个数与独立鞋带公式复算的结果一致
    expect(Number(corr.attributes('data-join-base'))).toBe(10)
    expect(Number(corr.attributes('data-join-height'))).toBe(3)
    expect(Number(corr.attributes('data-join-area'))).toBe(shoelace(joined))
    expect(Number(corr.attributes('data-single-area'))).toBe(shoelace(trap))
    expect(Number(corr.attributes('data-join-area'))).toBe(2 * Number(corr.attributes('data-single-area')))

    // 倍拼第一步：先放第二个图形（未对齐）
    await buttonWith(wrapper, '拼一拼')!.trigger('click')
    expect(wrapper.find('polygon.cut-solid').attributes('data-copy-step')).toBe('1')
    expect(wrapper.find('.copy-step-hint').exists()).toBe(true)
    expect(wrapper.findAll('.piece-no.copy')).toHaveLength(1)

    // 倍拼第二步：旋转平移对齐
    await buttonWith(wrapper, '旋转平移')!.trigger('click')
    expect(wrapper.find('polygon.cut-solid').attributes('data-copy-step')).toBe('2')
    expect(wrapper.find('.copy-step-hint').exists()).toBe(false)
    const verify = wrapper.find('.verify-line')
    expect(verify.text()).toContain('底 = 上底 + 下底 = 4 + 6 = 10')
    expect(verify.text()).toContain('高 = 3')
    expect(verify.text()).toContain('面积 = 30 = 2 × 15')
  })

  it('三角形：底↔平行四边形的底、高↔高，倍拼后底 = 底、面积 = 2×三角形面积', async () => {
    const lab = findLabById('g5-c3-area-triangle')!
    const wrapper = mount(AreaLab, { props: { lab, values: { a: 7, h: 6, shape: 1 } } })

    // 独立复算：三角形顶点（底 7、高 6，顶点偏移 0.35×7 = 2.45）
    const tri: Pt[] = [
      [0, 0],
      [7, 0],
      [2.45, 6],
    ]
    // 关于边 BC 中点中心对称得到的平行四边形
    const joined: Pt[] = [
      [0, 0],
      [7, 0],
      [9.45, 6],
      [2.45, 6],
    ]
    expect(shoelace(tri)).toBe(21)
    expect(shoelace(joined)).toBeCloseTo(42, 9)
    expect(dist(joined[0]!, joined[1]!)).toBe(7)

    await buttonWith(wrapper, '显示对应关系')!.trigger('click')
    expect(wrapper.findAll('.corr-src')).toHaveLength(2)
    expect(wrapper.findAll('.corr-tgt')).toHaveLength(2)
    expect(wrapper.findAll('.corr-link')).toHaveLength(2)
    expect(wrapper.find('.corr-label[data-pair="base"]').text()).toBe('底 7 = 底 7')
    expect(wrapper.find('.corr-label[data-pair="height"]').text()).toBe('高 6 = 高 6')

    const corr = wrapper.find('.corr-verify')
    expect(corr.text()).toContain('平行四边形的底 = 三角形的底 = 7 分米')
    expect(corr.text()).toContain('平行四边形的高 = 三角形的高 = 6 分米')
    expect(corr.text()).toContain('拼成图形的面积 42 = 2 × 三角形面积 21')
    expect(Number(corr.attributes('data-join-base'))).toBe(7)
    expect(Number(corr.attributes('data-join-area'))).toBe(shoelace(joined))
    expect(Number(corr.attributes('data-single-area'))).toBe(shoelace(tri))

    await buttonWith(wrapper, '拼一拼')!.trigger('click')
    expect(wrapper.find('polygon.cut-solid').attributes('data-copy-step')).toBe('1')
    await buttonWith(wrapper, '旋转平移')!.trigger('click')
    expect(wrapper.find('polygon.cut-solid').attributes('data-copy-step')).toBe('2')
    const verify = wrapper.find('.verify-line')
    expect(verify.text()).toContain('底 = 三角形的底 = 7')
    expect(verify.text()).toContain('面积 = 42 = 2 × 21')
  })

  it('平行四边形：长方形的长 = 底、宽 = 高（复位后标注消失）', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, { props: { lab, values: { a: 6, h: 4, slant: 1, shape: 0 } } })

    // 独立复算：平行四边形顶点 (0,0)(6,0)(7,4)(1,4)，面积恒为 6×4 = 24
    expect(shoelace([[0, 0], [6, 0], [7, 4], [1, 4]])).toBe(24)

    await buttonWith(wrapper, '显示对应关系')!.trigger('click')
    expect(wrapper.find('.corr-label[data-pair="base"]').text()).toBe('底 6 = 长 6')
    expect(wrapper.find('.corr-label[data-pair="height"]').text()).toBe('高 4 = 宽 4')
    const corr = wrapper.find('.corr-verify')
    expect(corr.text()).toContain('长方形的长 = 平行四边形的底 = 6 米')
    expect(corr.text()).toContain('长方形的宽 = 平行四边形的高 = 4 米')
    expect(Number(corr.attributes('data-join-base'))).toBe(6)
    expect(Number(corr.attributes('data-join-area'))).toBe(24)
    expect(Number(corr.attributes('data-single-area'))).toBe(24)
    expect(wrapper.find('.derive-chip.corr').text()).toContain('长方形的长 = 底 6')

    await buttonWith(wrapper, '隐藏对应关系')!.trigger('click')
    expect(wrapper.find('.corr-verify').exists()).toBe(false)
  })

  it('梯形麦田：面积换算到公顷（1 公顷 = 10000 平方米）', () => {
    const lab = findLabById('g5-c3-area-mcfield')!
    const wrapper = mount(AreaLab, { props: { lab, values: { a: 36, b: 54, h: 40, shape: 2 } } })
    // 独立复算：上底 36、下底 54、高 40 的梯形
    const trap: Pt[] = [
      [0, 0],
      [54, 0],
      [45, 40],
      [9, 40],
    ]
    expect(shoelace(trap)).toBe(1800)
    expect(1800 / 10000).toBe(0.18)
    expect(wrapper.find('.unit-rate').text()).toContain('1800 平方米 = 0.18 公顷')
    expect(wrapper.find('.unit-rate').text()).toContain('1 公顷 = 10000 平方米')
  })
})

/* ==================== 2. 组合图形：换一种割法 ==================== */

describe('MeasureLab：组合图形换一种割法', () => {
  it('三种割法轮流切换，总面积都等于 computeLab 与鞋带公式复算的结果（p42 例 6）', async () => {
    const lab = findLabById('g5-c3-hectare-field')!
    const values = { top: 100, left: 90, right: 40, bottom: 140 }
    const wrapper = mount(MeasureLab, { props: { lab, values } })

    // 独立复算：图形顶点 + 自己的鞋带公式
    const outline = compositeOutlineOwn(100, 90, 40, 140)
    expect(shoelace(outline)).toBe(10000)
    // 与 computeLab 的结果互证
    expect(computeLab('composite', values, lab).value).toBe(shoelace(outline))

    const totalChips = () => wrapper.findAll('.method-total-chip').map((n) => Number(n.find('b').text()))
    const cycle = () => buttonWith(wrapper, '换一种割法')!
    expect(totalChips()).toEqual([10000, 10000, 10000])
    expect(wrapper.find('.cycle-bar').text()).toContain('第 1/3 种')

    // 轮换三圈：每次都显示所选方法的各部分面积 + 尺寸标注，且总面积不变
    for (let i = 0; i < 3; i++) {
      await cycle().trigger('click')
      expect(wrapper.find('.cycle-bar').text()).toContain(`第 ${((i + 1) % 3) + 1}/3 种`)
      expect(wrapper.find('.formula-chip.primary').text()).toContain('S = 10000 平方米 = 1 公顷')
      expect(wrapper.findAll('.part-label').length).toBeGreaterThanOrEqual(2)
      expect(wrapper.findAll('.formula-chip').length).toBe(3)
      expect(wrapper.text()).toContain('上边 100 米')
      expect(wrapper.text()).toContain('下底 140 米')
      // 每种方法的总面积都等于独立复算值
      for (const t of totalChips()) expect(t).toBe(shoelace(outline))
    }
    // 方法三（添补法）的分部：大长方形 − 补上的梯形 = 10000
    expect(12600 - 2600).toBe(10000)
    expect(wrapper.find('.verify-line').text()).toContain('三种割补方法结果相同')
  })
})

/* ==================== 3. 公顷与平方千米：铺满看进率 ==================== */

describe('MeasureLab：公顷铺满看进率', () => {
  it('逐行铺满 1 平方千米：计数 = 100，1 平方千米 = 100 公顷', async () => {
    const lab = findLabById('g5-c3-hectare-square')!
    const wrapper = mount(MeasureLab, { props: { lab, values: { side: 100 } } })

    // 独立复算：外框 10×10 = 100 个 1 公顷；1 公顷 = 10000 m² → 1 km² = 1000000 m² = 100 公顷
    const rows = 10
    const cols = 10
    expect(rows * cols).toBe(100)
    expect(100 * 10000).toBe(1_000_000)

    expect(wrapper.findAll('.fill-tile')).toHaveLength(0)
    // 先铺一行 → 10 个
    await buttonWith(wrapper, '再铺一行')!.trigger('click')
    expect(wrapper.findAll('.fill-tile')).toHaveLength(cols)
    expect(wrapper.find('.fill-count').text()).toContain('10')
    expect(wrapper.find('.fill-verify').exists()).toBe(false)

    // 铺满 → 100 个
    await buttonWith(wrapper, '铺满看进率')!.trigger('click')
    expect(wrapper.findAll('.fill-tile')).toHaveLength(rows * cols)
    expect(wrapper.find('.fill-count').text()).toContain('100')
    const verify = wrapper.find('.fill-verify')
    expect(verify.text()).toContain('10 × 10 = 100')
    expect(verify.text()).toContain('100 公顷 = 1 平方千米')

    // 复位后清空
    await buttonWith(wrapper, '复位')!.trigger('click')
    expect(wrapper.findAll('.fill-tile')).toHaveLength(0)
  })
})

/* ==================== 4. 因数与倍数 ==================== */

describe('NumberLab：成对找因数', () => {
  it('16：一次找一对，覆盖全部因数且无重复（4×4 只算一个）', async () => {
    const lab = findLabById('g5-c6-factors-16')!
    const wrapper = mount(NumberLab, { props: { lab, values: { n: 16 } } })
    const own = factorsOwn(16)
    expect(own).toEqual([1, 2, 4, 8, 16])

    const next = () => wrapper.findAll('button').find((b) => b.text().includes('成对找因数') || b.text().includes('再找一对'))!
    expect(wrapper.find('.pair-step-panel').exists()).toBe(false)

    await next().trigger('click')
    expect(wrapper.find('.pair-step-panel').text()).toContain('1 × 16 = 16')
    await next().trigger('click')
    expect(wrapper.find('.pair-step-panel').text()).toContain('2 × 8 = 16')
    await next().trigger('click')
    expect(wrapper.find('.pair-step-panel').text()).toContain('4 × 4 = 16')
    expect(wrapper.find('.pair-step-panel').text()).toContain('两个因数相同，只算一个')

    // 步进覆盖全部因数、无重复，且个数与因数表一致
    const resultText = wrapper.find('.pair-step-chip.result').text()
    const listed = resultText.split('：')[1]!.split('（')[0]!.split('、').map(Number)
    expect(listed).toEqual(own)
    expect(new Set(listed).size).toBe(listed.length)
    expect(resultText).toContain(`${own.length} 个`)
    expect(wrapper.find('.pair-step-status').text()).toContain(`${own.length}`)
    expect(wrapper.find('.verify-line').text()).toContain('1×16、2×8、4×4')
    expect(wrapper.find('.verify-line').text()).toContain('两个因数相同，只算一个')
  })

  it('12：3 对 → 6 个因数，与试除法复算一致', async () => {
    const lab = findLabById('g5-c6-factors-12')!
    const wrapper = mount(NumberLab, { props: { lab, values: { n: 12 } } })
    const own = factorsOwn(12)
    expect(own).toHaveLength(6)

    const next = () => wrapper.findAll('button').find((b) => b.text().includes('成对找因数') || b.text().includes('再找一对'))!
    for (let i = 0; i < 3; i++) await next().trigger('click')

    const listed = wrapper.find('.pair-step-chip.result').text().split('：')[1]!.split('（')[0]!.split('、').map(Number)
    expect(listed).toEqual(own)
    expect(new Set(listed).size).toBe(own.length)
    expect(wrapper.findAll('.pair-step-chip.same')).toHaveLength(0)
    // 参数变化后步进自动复位
    await wrapper.setProps({ values: { n: 20 } })
    expect(wrapper.find('.pair-step-panel').exists()).toBe(false)
  })
})

describe('NumberLab：筛完看剩下的', () => {
  it('50 以内：已划掉数与剩余数之和 = 49，剩余个数 = 质数个数', async () => {
    const lab = findLabById('g5-c6-prime-sieve')!
    const wrapper = mount(NumberLab, { props: { lab, values: { n: 50 } } })
    const ownPrimes = Array.from({ length: 49 }, (_, i) => i + 2).filter(isPrimeOwn)
    expect(ownPrimes).toHaveLength(15)

    const next = () => wrapper.findAll('button').find((b) => b.text().includes('划掉') || b.text().includes('开始筛'))!
    for (let i = 0; i < 4; i++) await next().trigger('click')

    const summary = wrapper.find('.sieve-summary')
    expect(summary.exists()).toBe(true)
    const crossed = 49 - ownPrimes.length
    expect(summary.text()).toContain(`已划掉 ${crossed} 个`)
    expect(summary.text()).toContain(`剩下 ${ownPrimes.length} 个`)
    expect(summary.text()).toContain('剩下的恰好是质数')
    expect(summary.find('.sieve-sum-chip.result').text()).toContain(`${ownPrimes.length} 个`)
    // 剩余的数正好就是独立算出的质数
    const listed = summary
      .find('.sieve-sum-chip.result')
      .text()
      .split('：')[1]!
      .split('、')
      .map(Number)
    expect(listed).toEqual(ownPrimes)
  })
})

describe('NumberLab：只看公有的（交集）', () => {
  it('8 和 12：交集 = 公因数集合，最大公因数 4 落在交集里', async () => {
    const lab = findLabById('g5-c6-gcdlcm-8-12')!
    const wrapper = mount(NumberLab, { props: { lab, values: { a: 8, b: 12 } } })
    const ownCommon = factorsOwn(8).filter((f) => 12 % f === 0)
    expect(ownCommon).toEqual([1, 2, 4])
    expect(gcdOwn(8, 12)).toBe(4)

    const next = () =>
      wrapper.findAll('button').find((b) => b.text().includes('只看公有的') || b.text().includes('高亮公有'))!
    expect(wrapper.find('.reveal-panel').exists()).toBe(false)

    // 第一步：先分别列出两个数的因数
    await next().trigger('click')
    expect(wrapper.findAll('.reveal-line')).toHaveLength(2)
    expect(wrapper.findAll('.common-hit')).toHaveLength(0)
    const firstLine = wrapper.findAll('.reveal-line')[0]!.findAll('.reveal-chip').map((n) => Number(n.text()))
    expect(firstLine).toEqual(factorsOwn(8))

    // 第二步：高亮公共部分
    await next().trigger('click')
    const hits = wrapper.findAll('.common-hit').map((n) => Number(n.text()))
    expect(hits).toEqual(ownCommon)
    expect(hits).toContain(gcdOwn(8, 12))
    expect(wrapper.find('.common-hit.extreme').text()).toBe(String(gcdOwn(8, 12)))
    expect(wrapper.find('.reveal-verify').text()).toContain(`最大公因数 ${gcdOwn(8, 12)}`)
    // 交集里的每个数确实是两个数公有的因数
    for (const h of hits) {
      expect(8 % h).toBe(0)
      expect(12 % h).toBe(0)
    }
  })

  it('6 和 9：交集 = 公倍数集合（18、36、54），最小公倍数 18 落在交集里', async () => {
    const lab = findLabById('g5-c6-gcdlcm-6-9')!
    const wrapper = mount(NumberLab, { props: { lab, values: { a: 6, b: 9 } } })
    const ownCommon = Array.from({ length: 60 }, (_, i) => i + 1).filter((v) => v % 6 === 0 && v % 9 === 0)
    expect(ownCommon).toEqual([18, 36, 54])
    expect(lcmOwn(6, 9)).toBe(18)

    const next = () =>
      wrapper.findAll('button').find((b) => b.text().includes('只看公有的') || b.text().includes('高亮公有'))!
    await next().trigger('click')
    expect(wrapper.findAll('.common-hit')).toHaveLength(0)
    await next().trigger('click')

    const hits = wrapper.findAll('.common-hit').map((n) => Number(n.text()))
    expect(hits).toEqual(ownCommon)
    expect(Math.min(...hits)).toBe(lcmOwn(6, 9))
    expect(hits).toContain(lcmOwn(6, 9))
    expect(wrapper.find('.common-hit.extreme').text()).toBe('18')
    expect(wrapper.find('.reveal-verify').text()).toContain('最小公倍数 18')
    for (const h of hits) {
      expect(h % 6).toBe(0)
      expect(h % 9).toBe(0)
    }
  })
})

/* ==================== 5. 钉子板：两步数钉子 ==================== */

describe('PinboardLab：两步数钉子', () => {
  it('长方形 5×3：两步计数与独立复算一致，代入公式 = 鞋带公式面积', async () => {
    const lab = findLabById('g5-pinboard-area')!
    const wrapper = mount(PinboardLab, { props: { lab, values: { shape: 0 } } })
    const rect: Pt[] = [
      [0, 0],
      [5, 0],
      [5, 3],
      [0, 3],
    ]
    const ownN = boundaryOwn(rect)
    const ownB = insideOwn(rect)
    const ownArea = shoelace(rect)
    expect(ownN).toBe(16)
    expect(ownB).toBe(8)
    expect(ownArea).toBe(15)
    expect(ownN / 2 + ownB - 1).toBe(ownArea)

    expect(wrapper.find('.step-chip').exists()).toBe(false)
    // 第一步：只数边上钉子
    await buttonWith(wrapper, '只数边上钉子')!.trigger('click')
    expect(wrapper.find('.step-chip[data-count="n"]').text()).toContain(String(ownN))
    expect(wrapper.find('.step-chip[data-count="b"]').exists()).toBe(false)
    expect(wrapper.findAll('circle.pin-plain.lit')).toHaveLength(ownN)

    // 第二步：再数内部钉子，然后代入公式
    await buttonWith(wrapper, '再数内部钉子')!.trigger('click')
    expect(wrapper.find('.step-chip[data-count="b"]').text()).toContain(String(ownB))
    expect(wrapper.findAll('circle.pin-plain.lit')).toHaveLength(ownN + ownB)
    const step = wrapper.find('.step-formula')
    expect(Number(step.attributes('data-n'))).toBe(ownN)
    expect(Number(step.attributes('data-b'))).toBe(ownB)
    expect(Number(step.attributes('data-area'))).toBe(ownArea)
    expect(step.text()).toContain('S = n ÷ 2 + b − 1')
    // 代入公式 = 鞋带公式面积
    expect(Number(step.attributes('data-n')) / 2 + Number(step.attributes('data-b')) - 1).toBe(
      Number(step.attributes('data-area')),
    )
  })

  it('凹四边形：两步计数同样与独立复算一致', async () => {
    const lab = findLabById('g5-pinboard-area')!
    const wrapper = mount(PinboardLab, { props: { lab, values: { shape: 4 } } })
    const concave: Pt[] = [
      [0, 0],
      [5, 0],
      [5, 4],
      [2, 2],
      [0, 4],
    ]
    const ownN = boundaryOwn(concave)
    const ownB = insideOwn(concave)
    const ownArea = shoelace(concave)

    await buttonWith(wrapper, '只数边上钉子')!.trigger('click')
    await buttonWith(wrapper, '再数内部钉子')!.trigger('click')
    const step = wrapper.find('.step-formula')
    expect(Number(step.attributes('data-n'))).toBe(ownN)
    expect(Number(step.attributes('data-b'))).toBe(ownB)
    expect(Number(step.attributes('data-area'))).toBe(ownArea)
    expect(ownN / 2 + ownB - 1).toBe(ownArea)
    expect(wrapper.find('.pick-check').text()).toContain('皮克定理成立')
  })
})
