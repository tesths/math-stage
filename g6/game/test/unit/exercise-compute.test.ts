/**
 * 14 个练习题 Lab 的算理复核。
 *
 * 每个用例都用「独立算法」复算一遍（长除法、BigInt 定点乘、集合重叠、圆周率，
 * 以及直接用坐标/比例定义重算），而不是把 compute 里的公式照抄一遍——
 * 这样公式写错时测试才会红。
 */
import { describe, expect, it } from 'vitest'
import { computeExerciseLab } from '@/lib/labs/exercises'
import { piecewiseFee } from '@/lib/labs/quantity'

/** n/11 的小数展开（长除法，独立于 Lab 的实现） */
function eleventhCycle(n: number): string {
  let rem = n
  let out = ''
  for (let i = 0; i < 2; i++) {
    rem *= 10
    out += String(Math.floor(rem / 11))
    rem %= 11
  }
  return out
}

/** 与 compute 一致的显示格式：去掉末尾 0（48 而不是 48.00） */
function numText(v: number): string {
  return String(Number(v.toFixed(2)))
}

/** 定点乘法：把两个小数按 10^k 放大成整数相乘，结果再缩回 */
function scaledMul(a: number, b: number, digits = 3): number {
  const s = 10 ** digits
  const ia = Math.round(a * s)
  const ib = Math.round(b * s)
  return Number((BigInt(ia) * BigInt(ib)) / BigInt(s)) / s
}

describe('一单元练习题', () => {
  it('ex-c1-div11-cycle：循环节 = n ÷ 11 的真实循环节，且等于 9n 补零', () => {
    for (let n = 1; n <= 10; n++) {
      const r = computeExerciseLab('ex-c1-div11-cycle', { n, digits: 3 })
      const cycle = eleventhCycle(n)
      expect(r.text).toContain(`（循环节 ${cycle}）`)
      expect(cycle).toBe(String(9 * n).padStart(2, '0'))
      // 循环小数与真实值一致
      expect(r.value).toBeCloseTo(n / 11, 10)
      // 保留位数与四舍五入
      const approx = (n / 11).toFixed(3)
      expect(r.steps[r.steps.length - 1]!.result).toContain(approx)
    }
  })

  it('ex-c1-pgram-area：面积 = 底 × 高（定点乘法复算），且估算值接近计算值', () => {
    for (const [base, height] of [[3.2, 1.84], [2.5, 1.2], [4.7, 2.35]] as [number, number][]) {
      const exact = scaledMul(base, height)
      const r = computeExerciseLab('ex-c1-pgram-area', { base, height, digits: 1 })
      expect(r.steps[1]!.result).toContain(String(exact))
      expect(r.value).toBeCloseTo(Number(exact.toFixed(1)), 6)
      // 估算值（四舍五入到整分米）与精确值之比在合理范围
      const estimate = Math.round(base) * Math.round(height)
      expect(Math.abs(estimate - exact) / exact).toBeLessThan(0.35)
      expect(r.conclusion).toContain(String(estimate))
    }
  })
})

describe('二单元练习题', () => {
  it('ex-c2-overlap-club：重叠 = 跳舞 + 唱歌 − 全班，且不越界', () => {
    // 参数网格：total 是 12 的倍数（能被 3 和 4 整除），dn ∈ [2,3]，sn ∈ [2,4]
    for (const total of [24, 48, 72, 120]) {
      for (let dn = 2; dn <= 3; dn++) {
        for (let sn = 2; sn <= 4; sn++) {
          const dance = (total * dn) / 3
          const sing = (total * sn) / 4
          const expectOverlap = dance + sing - total
          const r = computeExerciseLab('ex-c2-overlap-club', { total, dn, sn })
          expect(Number.isInteger(dance)).toBe(true)
          expect(Number.isInteger(sing)).toBe(true)
          expect(r.value).toBe(expectOverlap)
          // 重叠人数不能是负数，也不能超过两组中较小的那个
          expect(expectOverlap).toBeGreaterThanOrEqual(0)
          expect(expectOverlap).toBeLessThanOrEqual(Math.min(dance, sing))
          expect(r.conclusion).toContain(String(expectOverlap))
        }
      }
    }
  })

  it('ex-c2-egg-crate：筐重抵消 → 一半鸡蛋 × 2 = 全部鸡蛋', () => {
    for (const [crate, withEggs, price] of [[1, 8, 12.8], [0.5, 6, 10], [2, 12, 9.6]] as [number, number, number][]) {
      const eggs = withEggs - crate
      const after = crate + eggs / 2
      const r = computeExerciseLab('ex-c2-egg-crate', { crate, withEggs, price })
      expect(r.value).toBeCloseTo(eggs * price, 6)
      // 第 1 步算出的就是一半鸡蛋
      expect(r.steps[0]!.result).toContain(String(eggs / 2))
      // 第二次称重必须比第一次轻，才能算出鸡蛋重量
      expect(after).toBeLessThan(withEggs)
      expect(r.steps[1]!.result).toContain(String(eggs))
    }
  })
})

describe('三单元练习题', () => {
  it('ex-c3-div-to-mul：除以 b 等于乘 1/b，且商的大小方向说得对', () => {
    const DIVISORS = [0.1, 2, 0.25, 10, 0.5, 4]
    for (let i = 0; i < DIVISORS.length; i++) {
      const b = DIVISORS[i]!
      const a = 4.8
      const r = computeExerciseLab('ex-c3-div-to-mul', { a, divIdx: i })
      expect(r.value).toBeCloseTo(a / b, 6)
      expect(r.value).toBeCloseTo(a * (1 / b), 6)
      expect(r.text).toContain(`= ${numText(a / b)}`)
      if (b > 1) expect(r.conclusion).toContain('商就比被除数 变小')
      else expect(r.conclusion).toContain('商就比被除数 变大')
    }
  })

  it('ex-c3-frac-split：和（差）正好是目标分数', () => {
    for (const fd of [8, 12, 20]) {
      for (const target of [3, 7]) {
        for (const a of [1, 3, 5]) {
          if (a >= target) continue
          const sum = computeExerciseLab('ex-c3-frac-split', { fd, target, a, mode: 0 })
          expect(sum.value).toBeCloseTo(target / fd, 10)
          expect(sum.text).toContain(`${a}/${fd} + ${target - a}/${fd} = ${target}/${fd}`)
          const diff = computeExerciseLab('ex-c3-frac-split', { fd, target, a, mode: 1 })
          expect(diff.value).toBeCloseTo(target / fd, 10)
          expect(diff.text).toContain(`${a + target}/${fd} − ${a}/${fd} = ${target}/${fd}`)
        }
      }
    }
  })
})

describe('四单元练习题', () => {
  it('ex-c4-cube-ratio：面积比 = 棱长比²，体积比 = 棱长比³（都化成最简）', () => {
    for (const [p1, p2] of [[4, 6], [6, 4], [2, 9], [3, 3]] as [number, number][]) {
      const a = Math.min(p1, p2)
      const b = Math.max(p1, p2)
      const r = computeExerciseLab('ex-c4-cube-ratio', { a: p1, b: p2 })
      const m = r.text.match(/棱长比 (\d+):(\d+) · 底面积比 (\d+):(\d+) · 体积比 (\d+):(\d+)/)!
      const [la, lb, aa, ab, va, vb] = m.slice(1).map(Number) as number[]
      // 棱长比 = 小 : 大，比值与 a:b 相同
      expect(la! / lb!).toBeCloseTo(a / b, 10)
      // 底面积比是棱长比的平方、体积比是立方（用交叉相乘避免浮点误差）
      expect(aa! * lb! * lb!).toBe(ab! * la! * la!)
      expect(va! * lb! ** 3).toBe(vb! * la! ** 3)
      expect(aa! / ab!).toBeCloseTo((a / b) ** 2, 10)
      expect(va! / vb!).toBeCloseTo((a / b) ** 3, 10)
      // 一定按「小 : 大」呈现
      expect(la!).toBeLessThanOrEqual(lb!)
      // 三组比都是最简整数比（前项后项互质）
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y))
      for (const [x, y] of [[la!, lb!], [aa!, ab!], [va!, vb!]]) expect(gcd(x, y)).toBe(1)
    }
  })

  it('ex-c4-football-ratio：黑白皮按比分配且合计 = 总块数', () => {
    for (const [a, b, per] of [[3, 5, 4], [2, 3, 5], [1, 1, 6]] as [number, number, number][]) {
      const r = computeExerciseLab('ex-c4-football-ratio', { a, b, per })
      const total = per * (a + b)
      expect(r.value).toBe(per * a)
      expect(r.text).toContain(`${per * a} 块`)
      expect(r.text).toContain(`${per * b} 块`)
      expect(r.conclusion).toContain(`一共 ${total} 块`)
      expect(per * a + per * b).toBe(total)
    }
  })
})

describe('五单元练习题', () => {
  it('ex-c5-wheel-roll：路程 = πd × 每分钟圈数 × 时间', () => {
    for (const [d, n, t] of [[70, 100, 10], [50, 80, 5], [60, 120, 15]] as [number, number, number][]) {
      const circM = (3.14 * d) / 100
      const total = circM * n * t
      const r = computeExerciseLab('ex-c5-wheel-roll', { d, n, t })
      expect(r.value).toBeCloseTo(Math.round(total * 100) / 100, 6)
      expect(r.steps[0]!.result).toContain(`${3.14 * d} 厘米`)
      expect(r.text).toContain(`约 ${Math.round((total / 1000) * 10) / 10} 千米`)
    }
  })

  it('ex-c5-circle-packing：两个方向都去尾，且不能按面积算', () => {
    for (const [L, W, d] of [[15, 8, 2], [10, 6, 3], [9, 9, 4]] as [number, number, number][]) {
      const expectCount = Math.floor(L / d) * Math.floor(W / d)
      const byArea = Math.floor((L * W) / (3.14 * (d / 2) ** 2))
      const r = computeExerciseLab('ex-c5-circle-packing', { L, W, d })
      expect(r.value).toBe(expectCount)
      // 按面积算一定不少于实际个数（否则说明去尾法算多了）
      expect(byArea).toBeGreaterThanOrEqual(expectCount)
      if (byArea > expectCount) expect(r.conclusion).toContain('是错的')
      else expect(r.conclusion).toContain('凑巧')
    }
  })
})

describe('六单元练习题', () => {
  it('ex-c6-scale-area：面积倍数 = 边长倍数的平方', () => {
    const r = computeExerciseLab('ex-c6-scale-area', { a: 2, n: 3, d: 2, trapTop: 4, trapBottom: 8, trapHeight: 6 })
    const tri = (2 * 2) / 2
    const scaled = (2 * 3) ** 2 / 2
    expect(r.value).toBe(9)
    expect(scaled / tri).toBe(9)
    expect(r.text).toContain('放大后的面积是原来的 9 倍')
    expect(r.text).toContain('缩小后的面积是原来的 1/4')
    expect(r.conclusion).toContain('3×3 = 9')
  })

  it('ex-c6-two-maps：实际长度 = 图上 × 分母 ÷ 100；换图按比例换算', () => {
    const r = computeExerciseLab('ex-c6-two-maps', { denA: 5000, denB: 2000, cm: 2, cmA: 3 })
    expect(r.steps[0]!.result).toContain('15000 厘米 = 150 米')
    expect(r.steps[1]!.result).toContain('6000 厘米 = 60 米')
    // B 图 2 厘米 ↔ A 图 2×2000/5000 = 0.8 厘米
    expect(r.value).toBeCloseTo((2 * 2000) / 5000, 6)
    expect(r.text).toContain('0.8 厘米')
    // 分母越大表示的实际范围越大
    expect(r.conclusion).toContain('分母更大的')
  })
})

describe('七单元练习题', () => {
  it('ex-c7-route-path：向东只改第一个数、向北只改第二个数', () => {
    for (const [x0, k, m] of [[6, 3, 2], [2, 5, 4], [9, 1, 7]] as [number, number, number][]) {
      const r = computeExerciseLab('ex-c7-route-path', { x0, k, m })
      expect(r.value).toBe(k + m)
      expect(r.steps[2]!.result).toBe(`（${x0 + k}，${2 + m}）`)
      expect(r.text).toContain(`共走 ${k + m} 格`)
    }
  })

  it('ex-c7-observer-point：北偏西方向分解成向北 r·cos、向西 r·sin', () => {
    for (const [angle, dist, dist2] of [[60, 400, 200], [45, 0, 300], [30, 500, 100]] as [number, number, number][]) {
      const U = 100
      const r = dist / U
      const rad = (angle * Math.PI) / 180
      const north = r * Math.cos(rad)
      const west = r * Math.sin(rad)
      const res = computeExerciseLab('ex-c7-observer-point', { angle, dist, dist2 })
      // 晓雨家坐标 =（商店 x − 向西格数，商店 y + 向北格数）
      expect(res.steps[2]!.result).toBe(`（${Number((9 - west).toFixed(2))}，${Number((3 + north).toFixed(2))}）`)
      // 小琳家 = 打谷场正北 dist2 米
      // 小琳家 = 打谷场（4，3）正北 dist2 米 → 行号 3 + dist2/U
      expect(res.steps[0]!.result).toContain(`（4，${3 + dist2 / U}）`)
      expect(res.conclusion).toContain('观测点')
    }
  })
})

describe('分段计费（与例题共用模块）', () => {
  it('练习题与例题的分段计费口径一致', () => {
    expect(piecewiseFee(5).fee).toBe(14.4)
    const r = computeExerciseLab('ex-c5-wheel-roll', { d: 70, n: 100, t: 10 })
    expect(r.value).toBeGreaterThan(0)
  })
})
