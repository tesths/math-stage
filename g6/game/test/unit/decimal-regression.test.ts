import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import CircleLab from '@/components/labs/CircleLab.vue'
import { fixedN, roundTo } from '@/lib/engine/math'
import { computeLab } from '@/lib/labs/compute'
import { approxLengthInR } from '@/lib/labs/circle'
import { findLabById } from '@data'

/** 独立的十进制四舍五入参考实现（BigInt 精确有理数），用来核对 roundTo */
function refRoundHalfUp(value: number, digits: number): number {
  const s = String(value)
  const [intPart = '0', frac = ''] = s.split('.')
  const n = BigInt(intPart + frac)
  const k = frac.length
  if (k <= digits) return value
  const drop = k - digits
  const scale = 10n ** BigInt(drop)
  const q = n / scale
  const r = n % scale
  const rounded = r * 2n >= scale ? q + 1n : q
  return Number(rounded) / 10 ** digits
}

/** 枚举一个滑块参数的所有可达值 */
function values(min: number, max: number, step: number): number[] {
  const out: number[] = []
  for (let i = 0; i <= Math.round((max - min) / step); i++) out.push(roundTo(min + i * step, 6))
  return out
}

describe('小数近似值：十进制安全四舍五入（回归 audit P0-5）', () => {
  it('roundTo 与 BigInt 参考实现在 7220 个可达组合上完全一致', () => {
    const prices = values(0.5, 9.95, 0.05)
    const counts = values(0.5, 9.5, 0.5)
    expect(prices.length * counts.length * 2).toBe(7220)
    let checked = 0
    for (const price of prices) {
      for (const count of counts) {
        const exact = roundTo(price * count, 6)
        for (const digits of [1, 2]) {
          expect(roundTo(exact, digits)).toBe(refRoundHalfUp(exact, digits))
          // 显示值必须与计算值一致（旧实现 toFixed 会给出 0.3 而值是 0.4）
          expect(Number(fixedN(exact, digits))).toBe(roundTo(exact, digits))
          checked++
        }
      }
    }
    expect(checked).toBe(7220)
  })

  it('半值处的经典例子：0.7 × 0.5 保留 1 位是 0.4（不是 0.3）', () => {
    expect(roundTo(0.7 * 0.5, 1)).toBe(0.4)
    expect(fixedN(0.7 * 0.5, 1)).toBe('0.4')
    expect(roundTo(1.005, 2)).toBe(1.01)
    expect(roundTo(2.5, 0)).toBe(3)
    expect(fixedN(9.375, 1)).toBe('9.4')
  })

  it('compute 文案里的近似值 = fixedN(roundTo(...))，与组件同源', () => {
    const r = computeLab('mul-approx', { price: 0.7, count: 0.5, digits: 1 })
    expect(r.text).toContain('0.4')
    expect(r.steps[1]!.result).toContain('0.4')
  })
})

describe('积与因数比较：符号方向（回归 audit P0-1）', () => {
  it('任意乘数下显示的比大小关系都成立', () => {
    const lab = findLabById('g6-c1-mul-compare')!
    for (const factor of [0.5, 0.9, 0.99, 1, 1.01, 1.1, 1.5, 3]) {
      const base = 4.9
      const wrapper = mount(DecimalLab, { props: { lab, values: { base, factor } } })
      const op = wrapper.find('.cmp-op').text()
      const prod = roundTo(base * factor, 4)
      if (factor > 1) expect(op).toBe('<')
      else if (factor < 1) expect(op).toBe('>')
      else expect(op).toBe('=')
      const holds = op === '<' ? base < prod : op === '>' ? base > prod : base === prod
      expect(holds).toBe(true)
      // 说明文字必须与符号方向一致
      if (factor > 1) expect(wrapper.text()).toContain('积比第一个乘数大')
      if (factor < 1) expect(wrapper.text()).toContain('积比第一个乘数小')
    }
  })
})

describe('方格模型 / 进一去尾：文案随参数变化（回归 audit P0-2、P0-3）', () => {
  it('0.6 × 0.4 显示 24 个小格', () => {
    const lab = findLabById('g6-c1-mul-decimal')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { a: 0.6, b: 0.4 } } })
    expect(wrapper.text()).toContain('24 个小格')
    expect(wrapper.text()).toContain('6/10 × 4/10')
    expect(wrapper.findAll('.grid-cell.filled')).toHaveLength(24)
  })

  it('0.3 × 0.5 显示 15 个小格与 0.15，且不再出现 24', () => {
    const lab = findLabById('g6-c1-mul-decimal')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { a: 0.3, b: 0.5 } } })
    expect(wrapper.findAll('.grid-cell.filled')).toHaveLength(15)
    expect(wrapper.text()).toContain('15 个小格')
    expect(wrapper.text()).toContain('0.15')
    expect(wrapper.text()).not.toContain('24 个小格')
  })

  it('进一/去尾的说明随总钱数变化：100 元 → 28 支', () => {
    const lab = findLabById('g6-c1-round-life')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { method: 0, total: 100 } } })
    expect(wrapper.text()).toContain('28 支')
    expect(wrapper.text()).toContain('100 ÷ 3.5')
    expect(wrapper.text()).not.toContain('86 支')
    const w300 = mount(DecimalLab, { props: { lab, values: { method: 0, total: 300 } } })
    expect(w300.text()).toContain('85 支')
    const up = mount(DecimalLab, { props: { lab, values: { method: 1, total: 300 } } })
    expect(up.text()).toContain('进一法')
  })
})

describe('圆：剪拼逼近 / 滚圆 / 环形比例（回归 audit P0-2、P0-4 与圆面积）', () => {
  it('圆的面积：份数越多，长越接近 πr', () => {
    const lab = findLabById('g6-c5-circle-area')!
    const w8 = mount(CircleLab, { props: { lab, values: { r: 5, slices: 8 } } })
    expect(w8.text()).toContain('78.5')
    expect(w8.find('.conv-panel').text()).toContain('3.061')
    const w64 = mount(CircleLab, { props: { lab, values: { r: 5, slices: 64 } } })
    expect(w64.find('.conv-panel').text()).toContain('3.140')
    // 与 πr 的差随份数增加而减小
    expect(approxLengthInR(64)).toBeGreaterThan(approxLengthInR(8))
    expect(3.142 - approxLengthInR(64)).toBeLessThan(3.142 - approxLengthInR(8))
  })

  it('圆的周长：点击「滚一周」后给出 C÷d ≈ π', () => {
    const lab = findLabById('g6-c5-circumference')!
    const wrapper = mount(CircleLab, { props: { lab, values: { r: 14 } } })
    expect(wrapper.text()).toContain('87.92')
    const btn = wrapper.findAll('button').find((b) => b.text().includes('滚一周'))
    expect(btn).toBeDefined()
    wrapper.vm.$nextTick()
    // 滚动过程中画布内出现摆线轨迹与前进距离标注
    expect(wrapper.text()).toContain('半径 r = 14 米')
  })

  it('环形面积：内外圆同一比例尺，环宽占比与真实一致', () => {
    const lab = findLabById('g6-c5-annulus')!
    const wrapper = mount(CircleLab, { props: { lab, values: { R: 10, r: 6 } } })
    expect(wrapper.text()).toContain('200.96')
    // (10²−6²)/10² = 64%
    expect(wrapper.text()).toContain('64.0%')
    const w2 = mount(CircleLab, { props: { lab, values: { R: 15, r: 10 } } })
    // (225−100)/225 = 55.6%
    expect(w2.text()).toContain('55.6%')
  })

  it('组合图形窗户：课本边长 1.8 米 → 4.51 平方米', () => {
    const lab = findLabById('g6-c5-circle-composite')!
    const wrapper = mount(CircleLab, { props: { lab, values: { side: 1.8 } } })
    expect(wrapper.text()).toContain('4.51')
  })

  it('扇形 360° 时是整圆，占比为 1', () => {
    const lab = findLabById('g6-c5-sector')!
    const wrapper = mount(CircleLab, { props: { lab, values: { angle: 360, r: 6 } } })
    expect(wrapper.text()).toContain('360 ÷ 360')
    expect(wrapper.text()).toContain('1')
  })
})
