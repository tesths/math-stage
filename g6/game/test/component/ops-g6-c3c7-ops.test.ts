/**
 * 六年级 c3（数与运算的再认识）+ c7（确定位置）：本轮新增 4 个例题的可操作环节。
 *
 * 1) `g6-c3-compare-unit`：统一计数单位步进 —— 两个数化成同一个计数单位的个数再比符号。
 * 2) `g6-c3-op-consistency`：换一个计数单位看同一个运算 —— 个数 × 单位值 = 结果，结果恒等。
 * 3) `g6-c3-binary`：逐位改写 —— ÷2 取余逐步揭示，余数倒序拼出二进制。
 * 4) `g6-c7-direction`：换观测点再描述同一位置 + 只说方向不够。
 *
 * 断言的取向与仓库既有约定一致：数值结论全部用**独立算法**复算
 * （自己写的精确比值/通分、反复除 2 取余、atan2/hypot），不复抄组件里的表达式；
 * 分数一律走精确分子分母（绝不用 Number('2/3')）。
 */
import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import NumberLab from '@/components/labs/NumberLab.vue'
import PositionLab from '@/components/labs/PositionLab.vue'
import { findLabById } from '@data'
import type { ParamValues } from '@data/schema/lab'
import { toBinary } from '@/lib/engine/math'
import { greaterThan } from '@/lib/labs/numberSys'

const CMP_ID = 'g6-c3-compare-unit'
const OP_ID = 'g6-c3-op-consistency'
const BIN_ID = 'g6-c3-binary'
const DIR_ID = 'g6-c7-direction'

/* ==================== 独立复算工具（不使用组件里的表达式） ==================== */

interface Rat {
  n: number
  d: number
}

/** 把「整数 / 小数 / 分数」解析成精确比值：字符串拆位，不经过浮点 */
function ratOf(text: string): Rat {
  const t = text.trim()
  const frac = t.match(/^(-?\d+)\s*\/\s*(\d+)$/)
  if (frac) return { n: Number(frac[1]), d: Number(frac[2]) }
  const neg = t.startsWith('-')
  const body = neg ? t.slice(1) : t
  const [i = '0', f = ''] = body.split('.')
  return { n: Number(i + f) * (neg ? -1 : 1), d: 10 ** f.length }
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
  return (a / gcdOwn(a, b)) * b
}

/** 计数单位的文字写法：1 → 1；10/100 → 0.1/0.01；15 → 1/15 */
function unitTextOwn(L: number): string {
  if (L === 1) return '1'
  return /^10+$/.test(String(L)) ? `0.${'0'.repeat(String(L).length - 2)}1` : `1/${L}`
}

/** 反复 ÷2 取余（自己写一遍）：被除数 v、商 q、余数 r */
function divisionStepsOwn(n: number): { v: number; q: number; r: number }[] {
  if (n <= 0) return [{ v: 0, q: 0, r: 0 }]
  const out: { v: number; q: number; r: number }[] = []
  let v = n
  while (v > 0) {
    out.push({ v, q: Math.floor(v / 2), r: v % 2 })
    v = Math.floor(v / 2)
  }
  return out
}

/** 渲染文本的空白压平版（模板里的换行/缩进不该影响断言） */
function flat(text: string): string {
  return text.replace(/\s+/g, ' ')
}

function mountLab(component: typeof NumberLab, id: string, values: ParamValues): VueWrapper {
  const lab = findLabById(id)!
  return mount(component, { props: { lab, values } })
}

/** 从渲染出来的船上读观测点原点（舰艇顶点），不硬编码组件内部常量 */
function shipOrigin(wrapper: VueWrapper): { x: number; y: number } {
  const pts = wrapper.find('polygon').attributes('points')!.split(' ')
  const [x, y] = pts[0]!.split(',').map(Number)
  return { x: x!, y: y! }
}

/* ==================== 1. 统一计数单位 ==================== */

describe('g6-c3-compare-unit · 统一计数单位再比较', () => {
  const PAIRS: [number, string, string][] = [
    [0, '1000', '923'],
    [1, '3.34', '3.4'],
    [2, '4.7', '4.05'],
    [3, '2/3', '3/5'],
    [4, '0.78', '0.87'],
  ]

  it('5 组数都化成同一个计数单位的个数：单位相同、个数是整数、符号与精确比值一致', async () => {
    for (const [sel, aText, bText] of PAIRS) {
      const w = mountLab(NumberLab, CMP_ID, { sel })
      // 点开之前没有统一计数单位面板
      expect(w.find('[data-test="cmp-unified"]').exists()).toBe(false)

      await w.find('[data-test="cmp-step"]').trigger('click')
      const panel = w.find('[data-test="cmp-unified"]')

      // 独立复算：统一到 1/lcm(分母)，个数 = 分子 × lcm/分母
      const a = ratOf(aText)
      const b = ratOf(bText)
      const L = lcmOwn(a.d, b.d)
      const ca = (a.n * L) / a.d
      const cb = (b.n * L) / b.d
      expect(Number.isInteger(ca)).toBe(true)
      expect(Number.isInteger(cb)).toBe(true)

      expect(panel.attributes('data-unit')).toBe(unitTextOwn(L))
      expect(Number(panel.attributes('data-count-a'))).toBe(ca)
      expect(Number(panel.attributes('data-count-b'))).toBe(cb)

      // 两行用的是同一个计数单位
      const rows = w.findAll('.cmp-count-text').map((n) => n.text())
      expect(rows).toHaveLength(2)
      expect(rows[0]).toContain(`个 ${unitTextOwn(L)}`)
      expect(rows[1]).toContain(`个 ${unitTextOwn(L)}`)

      // 个数 × 单位值 = 原数（精确交叉相乘，不用浮点）
      expect(ca * a.d).toBe(a.n * L)
      expect(cb * b.d).toBe(b.n * L)

      // 符号：独立比个数 + 与 numberSys 的精确比较一致（2/3 → 分子分母，不是 Number('2/3')）
      const mySym = ca > cb ? '>' : '<'
      expect(panel.attributes('data-symbol')).toBe(mySym)
      expect(panel.attributes('data-symbol')).toBe(greaterThan(aText, bText) ? '>' : '<')
      expect(w.find('.cmp-sym').text()).toBe(mySym)
      // 面板文字里也给出同一个单位与个数结论
      const conclude = flat(w.find('[data-test="cmp-conclude"]').text())
      expect(conclude).toContain(`都是 ${unitTextOwn(L)}`)
      expect(conclude).toContain(`比个数：${ca} ${mySym} ${cb}`)
    }
  })

  it('2/3 与 3/5 通分到 1/15：10 个 与 9 个，符号是 >', async () => {
    const w = mountLab(NumberLab, CMP_ID, { sel: 3 })
    await w.find('[data-test="cmp-step"]').trigger('click')
    const panel = w.find('[data-test="cmp-unified"]')
    expect(panel.attributes('data-unit')).toBe('1/15')
    expect(panel.attributes('data-count-a')).toBe('10')
    expect(panel.attributes('data-count-b')).toBe('9')
    expect(panel.attributes('data-symbol')).toBe('>')
    // 10 个 1/15 = 10/15 = 2/3；9 个 1/15 = 9/15 = 3/5
    expect(10 * 3).toBe(2 * 15)
    expect(9 * 5).toBe(3 * 15)
    expect(flat(w.find('[data-test="cmp-conclude"]').text())).toContain('10 > 9 → 2/3 > 3/5')
  })

  it('3.34 与 3.4 对齐到 0.01：334 个 与 340 个，符号是 <', async () => {
    const w = mountLab(NumberLab, CMP_ID, { sel: 1 })
    await w.find('[data-test="cmp-step"]').trigger('click')
    const panel = w.find('[data-test="cmp-unified"]')
    expect(panel.attributes('data-unit')).toBe('0.01')
    expect(panel.attributes('data-count-a')).toBe('334')
    expect(panel.attributes('data-count-b')).toBe('340')
    expect(panel.attributes('data-symbol')).toBe('<')
  })

  it('换一组数后统一计数单位自动复位（不会拿新数配旧单位）', async () => {
    const w = mountLab(NumberLab, CMP_ID, { sel: 3 })
    await w.find('[data-test="cmp-step"]').trigger('click')
    expect(w.find('[data-test="cmp-unified"]').exists()).toBe(true)
    await w.setProps({ lab: findLabById(CMP_ID)!, values: { sel: 4 } })
    expect(w.find('[data-test="cmp-unified"]').exists()).toBe(false)
    // 再点开时是新的一组数：0.78 与 0.87 → 78 个 0.01、87 个 0.01
    await w.find('[data-test="cmp-step"]').trigger('click')
    const panel = w.find('[data-test="cmp-unified"]')
    expect(panel.attributes('data-count-a')).toBe('78')
    expect(panel.attributes('data-count-b')).toBe('87')
    expect(panel.attributes('data-unit')).toBe('0.01')
    expect(panel.attributes('data-symbol')).toBe('<')
  })
})

/* ==================== 2. 换一个计数单位看同一个运算 ==================== */

describe('g6-c3-op-consistency · 换一个计数单位看同一个运算', () => {
  const CASES: [number, string][] = [
    [0, '60'],
    [1, '6/5'],
    [2, '400'],
    [3, '3'],
    [4, '159'],
    [5, '4.65'],
  ]

  it('6 个示例：轮换计数单位后结果恒等，且「单位个数 × 单位值 = 结果」（精确比值）', async () => {
    for (const [sel, ansText] of CASES) {
      const w = mountLab(NumberLab, OP_ID, { sel })
      const panel = w.find('[data-test="op-unit-panel"]')
      const viewCount = Number(panel.attributes('data-views'))
      expect(viewCount).toBeGreaterThanOrEqual(2)

      const target = ratOf(ansText)
      const seen = new Set<string>()
      for (let i = 0; i < viewCount; i++) {
        const line = w.find('[data-test="op-unit-line"]')
        const unit = line.attributes('data-unit')!
        const count = Number(line.attributes('data-count'))
        const value = Number(line.attributes('data-value'))

        // 结果恒等（同例换单位，值不变）
        expect(value).toBeCloseTo(target.n / target.d, 10)
        // 个数是正整数
        expect(Number.isInteger(count)).toBe(true)
        expect(count).toBeGreaterThan(0)
        // 单位个数 × 单位值 = 结果（精确交叉相乘）
        const u = ratOf(unit)
        expect(count * u.n * target.d).toBe(target.n * u.d)
        // 面板上的算式也写着这一条
        expect(w.find('[data-test="op-unit-check"]').text()).toContain(`${count} × ${unit} = ${ansText}`)

        seen.add(unit)
        await w.find('[data-test="op-unit-cycle"]').trigger('click')
      }
      // 换过至少两个不同的计数单位（说法确实变了）
      expect(seen.size).toBeGreaterThanOrEqual(2)
      // 轮换一圈回到第一种说法
      expect(w.find('[data-test="op-unit-line"]').attributes('data-unit')).toBe([...seen][0])
      expect(panel.attributes('data-view')).toBe('0')
    }
  })

  it('3.4 + 1.25 = 4.65：465 个 0.01 → 4650 个 0.001 → 46500 个 0.0001', async () => {
    const w = mountLab(NumberLab, OP_ID, { sel: 5 })
    const unit = () => w.find('[data-test="op-unit-line"]').attributes('data-unit')
    const count = () => Number(w.find('[data-test="op-unit-line"]').attributes('data-count'))
    expect(unit()).toBe('0.01')
    expect(count()).toBe(465)
    expect(465 * 0.01).toBeCloseTo(4.65, 10)
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    expect(unit()).toBe('0.001')
    expect(count()).toBe(4650)
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    expect(unit()).toBe('0.0001')
    expect(count()).toBe(46500)
    // 三种说法的值都是 4.65
    expect(465 * 0.01).toBeCloseTo(4.65, 10)
    expect(4650 * 0.001).toBeCloseTo(4.65, 10)
    expect(46500 * 0.0001).toBeCloseTo(4.65, 10)
  })

  it('2/5 × 3 = 6/5：分数单位继续平均分 → 6 个 1/5、12 个 1/10、24 个 1/20', async () => {
    const w = mountLab(NumberLab, OP_ID, { sel: 1 })
    const line = () => w.find('[data-test="op-unit-line"]')
    expect(line().attributes('data-unit')).toBe('1/5')
    expect(line().attributes('data-count')).toBe('6')
    expect(w.find('[data-test="op-unit-check"]').text()).toContain('6 × 1/5 = 6/5')
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    expect(line().attributes('data-unit')).toBe('1/10')
    expect(line().attributes('data-count')).toBe('12')
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    expect(line().attributes('data-unit')).toBe('1/20')
    expect(line().attributes('data-count')).toBe('24')
    // 6/5 = 12/10 = 24/20（精确比值相等）
    expect(6 * 10).toBe(12 * 5)
    expect(12 * 20).toBe(24 * 10)
  })

  it('20 × 3 用「十」和「一」两种单位说，结果都是 60', async () => {
    const w = mountLab(NumberLab, OP_ID, { sel: 0 })
    const line = () => w.find('[data-test="op-unit-line"]')
    expect(line().attributes('data-unit')).toBe('10')
    expect(line().attributes('data-count')).toBe('6')
    expect(w.find('[data-test="op-unit-line"]').text()).toContain('6 个 十')
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    expect(line().attributes('data-unit')).toBe('1')
    expect(line().attributes('data-count')).toBe('60')
    expect(line().attributes('data-value')).toBe('60')
  })

  it('换一个示例后计数单位说法回到第 1 种（不会停在上一题的档位）', async () => {
    const w = mountLab(NumberLab, OP_ID, { sel: 0 })
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    await w.find('[data-test="op-unit-cycle"]').trigger('click')
    expect(w.find('[data-test="op-unit-panel"]').attributes('data-view')).toBe('2')
    await w.setProps({ lab: findLabById(OP_ID)!, values: { sel: 2 } })
    const panel = w.find('[data-test="op-unit-panel"]')
    expect(panel.attributes('data-view')).toBe('0')
    // 1200 ÷ 3 = 400 → 4 个百
    expect(w.find('[data-test="op-unit-line"]').attributes('data-unit')).toBe('100')
    expect(w.find('[data-test="op-unit-line"]').attributes('data-count')).toBe('4')
  })
})

/* ==================== 3. 二进制逐位改写 ==================== */

describe('g6-c3-binary · 逐位改写（÷2 取余，余数倒序）', () => {
  it('0~31 全量：每步商/余数独立复算，余数倒序 == toString(2) == toBinary(n)', async () => {
    for (let n = 0; n <= 31; n++) {
      const w = mountLab(NumberLab, BIN_ID, { dec: n })
      const own = divisionStepsOwn(n)
      const ownBin = own.map((s) => s.r).reverse().join('')
      expect(ownBin).toBe(n.toString(2))
      expect(ownBin).toBe(toBinary(n))

      // 还没点开时只有按钮
      expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(0)
      expect(w.find('[data-test="bin-rewrite-result"]').exists()).toBe(false)

      for (let i = 0; i < own.length; i++) {
        await w.find('[data-test="bin-step"]').trigger('click')
        const item = w.findAll('[data-test="bin-step-item"]')[i]!
        expect(Number(item.attributes('data-quotient'))).toBe(own[i]!.q)
        expect(Number(item.attributes('data-remainder'))).toBe(own[i]!.r)
        // 每一步显示的被除数、商、余数都自洽：v = 2q + r
        expect(flat(item.text())).toContain(`${own[i]!.v} ÷ 2 → 商 ${own[i]!.q} 余 ${own[i]!.r}`)
        expect(own[i]!.v).toBe(2 * own[i]!.q + own[i]!.r)
      }
      expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(own.length)

      const result = w.find('[data-test="bin-rewrite-result"]')
      expect(result.attributes('data-from-remainders')).toBe(ownBin)
      expect(result.attributes('data-binary')).toBe(toBinary(n))
      expect(result.text()).toContain(`（${ownBin}）₂`)
      // 改写完成后按钮禁用
      expect(w.find('[data-test="bin-step"]').attributes('disabled')).toBeDefined()

      // 复位
      await w.find('[data-test="bin-reset"]').trigger('click')
      expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(0)
      expect(w.find('[data-test="bin-rewrite-result"]').exists()).toBe(false)
    }
  })

  it('5：三步分别是 5÷2 商2余1、2÷2 商1余0、1÷2 商0余1 → 倒序 101', async () => {
    const w = mountLab(NumberLab, BIN_ID, { dec: 5 })
    await w.find('[data-test="bin-step"]').trigger('click')
    let item = w.findAll('[data-test="bin-step-item"]')[0]!
    expect(item.attributes('data-quotient')).toBe('2')
    expect(item.attributes('data-remainder')).toBe('1')
    expect(item.text()).toContain('5 ÷ 2')

    await w.find('[data-test="bin-step"]').trigger('click')
    item = w.findAll('[data-test="bin-step-item"]')[1]!
    expect(item.attributes('data-quotient')).toBe('1')
    expect(item.attributes('data-remainder')).toBe('0')

    await w.find('[data-test="bin-step"]').trigger('click')
    item = w.findAll('[data-test="bin-step-item"]')[2]!
    expect(item.attributes('data-quotient')).toBe('0')
    expect(item.attributes('data-remainder')).toBe('1')

    const result = w.find('[data-test="bin-rewrite-result"]')
    expect(result.attributes('data-from-remainders')).toBe('101')
    expect(result.attributes('data-binary')).toBe('101')
    expect(result.text()).toContain('余数倒着拼：1 0 1')
    // 改十进制数后步进自动复位
    await w.setProps({ lab: findLabById(BIN_ID)!, values: { dec: 4 } })
    expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(0)
    expect(w.find('[data-test="bin-step"]').attributes('disabled')).toBeUndefined()
  })

  it('31（5 位全 1）：改写完成后再点「下一步」不会多出步骤', async () => {
    const w = mountLab(NumberLab, BIN_ID, { dec: 31 })
    for (let i = 0; i < 5; i++) await w.find('[data-test="bin-step"]').trigger('click')
    expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(5)
    expect(w.find('[data-test="bin-rewrite-result"]').attributes('data-binary')).toBe('11111')
    // 已完成后按钮禁用；即使再触发点击也不会多出步骤
    expect(w.find('[data-test="bin-step"]').attributes('disabled')).toBeDefined()
    await w.find('[data-test="bin-step"]').trigger('click')
    expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(5)
    await w.find('[data-test="bin-reset"]').trigger('click')
    expect(w.findAll('[data-test="bin-step-item"]')).toHaveLength(0)
  })
})

/* ==================== 4. 换一个观测点 / 只说方向不够 ==================== */

describe('g6-c7-direction · 换一个观测点 + 只说方向不够', () => {
  async function shiftObserver(w: VueWrapper): Promise<void> {
    await w.find('[data-test="obs-toggle"]').trigger('click')
  }

  it('换观测点后浮雷的坐标不变，但方向与距离描述改变（独立 atan2/hypot 复算）', async () => {
    const w = mountLab(PositionLab, DIR_ID, { angle: 30, dist: 2, dir: 0 })
    // 比例尺与画布原点都从渲染结果里读（不硬编码组件内部常量）
    expect(w.text()).toContain('比例尺：1 千米 = 20 个画布单位')
    const S = 20
    const origin = shipOrigin(w)
    const rad = (30 * Math.PI) / 180
    const ownMarker = { x: origin.x + Math.sin(rad) * 2 * S, y: origin.y - Math.cos(rad) * 2 * S }

    const line0 = w.find('[data-test="dir-line"]')
    // 换观测点前先把描述快照下来（元素 wrapper 的 attributes() 读的是**当前** DOM）
    const before0 = {
      observer: line0.attributes('data-observer'),
      base: line0.attributes('data-base'),
      side: line0.attributes('data-side'),
      angle: Number(line0.attributes('data-angle')),
      dist: Number(line0.attributes('data-dist')),
      mx: Number(line0.attributes('data-marker-x')),
      my: Number(line0.attributes('data-marker-y')),
    }
    expect(before0.observer).toBe('舰艇')
    expect(before0.mx).toBeCloseTo(ownMarker.x, 9)
    expect(before0.my).toBeCloseTo(ownMarker.y, 9)
    expect(before0.base).toBe('北')
    expect(before0.side).toBe('东')
    expect(before0.angle).toBe(30)
    expect(before0.dist).toBe(2)

    await shiftObserver(w)
    const line1 = w.find('[data-test="dir-line"]')
    expect(line1.attributes('data-observer')).toBe('灯塔')
    // 位置（坐标）不变
    expect(Number(line1.attributes('data-marker-x'))).toBeCloseTo(ownMarker.x, 9)
    expect(Number(line1.attributes('data-marker-y'))).toBeCloseTo(ownMarker.y, 9)
    // 描述改变
    const desc0 = `${before0.base}${before0.side}${before0.angle}`
    const desc1 = `${line1.attributes('data-base')}${line1.attributes('data-side')}${line1.attributes('data-angle')}`
    expect(desc1).not.toBe(desc0)
    expect(Number(line1.attributes('data-dist'))).not.toBe(before0.dist)

    // 独立复算：以灯塔为观测点
    const obsLine = w.find('[data-test="obs-line"]')
    expect(obsLine.attributes('data-observer')).toBe('灯塔')
    const obs = { x: Number(obsLine.attributes('data-obs-x')), y: Number(obsLine.attributes('data-obs-y')) }
    const dx = ownMarker.x - obs.x
    const dy = ownMarker.y - obs.y
    expect(line1.attributes('data-base')).toBe(dy <= 0 ? '北' : '南')
    expect(line1.attributes('data-side')).toBe(dx >= 0 ? '东' : '西')
    expect(Number(line1.attributes('data-angle'))).toBe(Math.round((Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI))
    expect(Number(line1.attributes('data-dist'))).toBeCloseTo(Math.round((Math.hypot(dx, dy) / S) * 100) / 100, 9)
    // 灯塔画出来了，观测点说明写着「浮雷的位置没有变」
    expect(w.find('circle[fill="#7c3aed"]').exists()).toBe(true)
    expect(obsLine.text()).toContain('位置没有变')

    // 换回舰艇：描述恢复
    await shiftObserver(w)
    expect(w.find('[data-test="dir-line"]').attributes('data-observer')).toBe('舰艇')
    expect(Number(w.find('[data-test="dir-line"]').attributes('data-angle'))).toBe(30)
  })

  it('dir=3（南偏西）时以灯塔为观测点落在南偏西象限，浮雷坐标仍不变', async () => {
    const w = mountLab(PositionLab, DIR_ID, { angle: 45, dist: 6, dir: 3 })
    const origin = shipOrigin(w)
    const rad = (45 * Math.PI) / 180
    const own = { x: origin.x - Math.sin(rad) * 6 * 20, y: origin.y + Math.cos(rad) * 6 * 20 }
    const line0 = w.find('[data-test="dir-line"]')
    expect(line0.attributes('data-base')).toBe('南')
    expect(line0.attributes('data-side')).toBe('西')

    await shiftObserver(w)
    const line1 = w.find('[data-test="dir-line"]')
    expect(Number(line1.attributes('data-marker-x'))).toBeCloseTo(own.x, 9)
    expect(Number(line1.attributes('data-marker-y'))).toBeCloseTo(own.y, 9)
    const obsLine = w.find('[data-test="obs-line"]')
    const ox = Number(obsLine.attributes('data-obs-x'))
    const oy = Number(obsLine.attributes('data-obs-y'))
    expect(line1.attributes('data-base')).toBe(own.y - oy <= 0 ? '北' : '南')
    expect(line1.attributes('data-side')).toBe(own.x - ox >= 0 ? '东' : '西')
    expect(line1.attributes('data-base')).toBe('南')
    expect(line1.attributes('data-side')).toBe('西')
  })

  it('只说方向不给距离：画出 3 个候选位置并提示「还不能确定位置」，补上距离后恢复', async () => {
    const w = mountLab(PositionLab, DIR_ID, { angle: 30, dist: 2, dir: 0 })
    expect(w.findAll('.cand-dot')).toHaveLength(0)
    expect(w.find('[data-test="nodist-ok"]').exists()).toBe(true)
    expect(w.find('[data-test="nodist-ok"]').text()).toContain('唯一确定')

    await w.find('[data-test="nodist-toggle"]').trigger('click')
    const dots = w.findAll('.cand-dot')
    expect(dots).toHaveLength(3)
    // 候选点在同一条射线上、距离分别是 2/4/6 千米（独立用 sin/cos 复算）
    const origin = shipOrigin(w)
    const rad = (30 * Math.PI) / 180
    const ownXs = [2, 4, 6].map((km) => origin.x + Math.sin(rad) * km * 20)
    const ownYs = [2, 4, 6].map((km) => origin.y - Math.cos(rad) * km * 20)
    dots.forEach((d, i) => {
      expect(Number(d.attributes('cx'))).toBeCloseTo(ownXs[i]!, 9)
      expect(Number(d.attributes('cy'))).toBeCloseTo(ownYs[i]!, 9)
    })
    const hint = w.find('[data-test="nodist-hint"]')
    expect(hint.text()).toContain('还不能确定位置')
    expect(hint.text()).toContain('3 个候选位置')
    expect(hint.text()).toContain('2 千米、4 千米、6 千米')
    expect(hint.text()).toContain('必须再给距离')
    // 真浮雷（红点）此时被隐藏，说明位置并未唯一
    expect(w.find('circle[fill="#ef4444"]').exists()).toBe(false)

    await w.find('[data-test="nodist-toggle"]').trigger('click')
    expect(w.findAll('.cand-dot')).toHaveLength(0)
    expect(w.find('circle[fill="#ef4444"]').exists()).toBe(true)
  })

  it('「东北方向」也叫北偏东：dir=0 的说明里同时出现两种叫法', () => {
    const w = mountLab(PositionLab, DIR_ID, { angle: 30, dist: 3, dir: 0 })
    const note = w.find('[data-test="alias-note"]').text()
    expect(note).toContain('东北方向也叫北偏东方向')
    expect(note).toContain('从正北向东偏 30°')
    expect(note).toContain('不是从正东量起')
    // 方向切换后说明跟着换（不再是「东北」的说法）
    const w2 = mountLab(PositionLab, DIR_ID, { angle: 30, dist: 3, dir: 1 })
    const note2 = w2.find('[data-test="alias-note"]').text()
    expect(note2).not.toContain('东北方向也叫')
    expect(note2).toContain('北偏西 30°')
  })
})
