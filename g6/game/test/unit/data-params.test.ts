import { describe, expect, it } from 'vitest'
import { c1Labs } from '@data/chapters/c1'
import { c2Labs } from '@data/chapters/c2'
import { c3Labs } from '@data/chapters/c3'
import { c5Labs } from '@data/chapters/c5'
import { c6Labs } from '@data/chapters/c6'
import { c7Labs } from '@data/chapters/c7'
import type { LabDef, LabParam } from '@data/schema/lab'
import { binaryBits } from '@/lib/labs/numberSys'
import { roundTo } from '@/lib/engine/math'

/**
 * 数据 / 参数层回归（audit：docs/audit/g6-scale-position-number-audit.md §3）。
 *
 * 1) 通用断言：对 c1 / c2 / c3 / c5 / c6 / c7 六个数据文件的**全部参数**跑一遍，
 *    保证 参数齐全、default ∈ [min,max]、default 落在 step 网格上、可达值不越界。
 * 2) 针对性断言：审计表里逐条要求的数据层结论（factor step、budget 下限、c5 份数
 *    课本序列、c6 教材比例尺、c7 角度/距离）。
 *
 * 说明：审计条 7/8（segment 人数、segment-more 天数出现小数）属交叉参数组合问题，
 * 仓库既有约定（如环形内圆 r > 外圆 R）由组件侧给出提示，已由 compute.ts /
 * SegmentLab.vue 实现；本文件只守住"默认例必须整除"这条数据层底线。
 */

const CHAPTER_FILES: { file: string; labs: LabDef[] }[] = [
  { file: 'c1.ts', labs: c1Labs },
  { file: 'c2.ts', labs: c2Labs },
  { file: 'c3.ts', labs: c3Labs },
  { file: 'c5.ts', labs: c5Labs },
  { file: 'c6.ts', labs: c6Labs },
  { file: 'c7.ts', labs: c7Labs },
]

const ALL_LABS = CHAPTER_FILES.flatMap(({ labs }) => labs)
const EPS = 1e-9

/** 滑块可达值（原生 input[type=range] 的取值集合） */
function legalValues(p: LabParam): number[] {
  const steps = Math.round((p.max - p.min) / p.step)
  return Array.from({ length: steps + 1 }, (_, i) => roundTo(p.min + i * p.step, 6))
}

/** v 是否落在 step 网格上（避免浮点误差；1.01 / 0.05 这类小数也必须通过） */
function onStepGrid(p: LabParam, v: number): boolean {
  const k = (v - p.min) / p.step
  return Math.abs(k - Math.round(k)) < 1e-9
}

function pick(labs: LabDef[], id: string): LabDef {
  const lab = labs.find((l) => l.id === id)
  if (!lab) throw new Error(`缺少 Lab：${id}`)
  return lab
}

function param(lab: LabDef, key: string): LabParam {
  const p = lab.params.find((x) => x.key === key)
  if (!p) throw new Error(`${lab.id} 缺少参数：${key}`)
  return p
}

function expectReachable(p: LabParam, ...values: number[]): void {
  const set = legalValues(p)
  for (const v of values) {
    expect(
      set.some((x) => Math.abs(x - v) < EPS),
      `${p.key} 期望可达 ${v}，实际可达集 ${set.slice(0, 12).join(',')}…`,
    ).toBe(true)
  }
}

describe('数据参数通用约束（c1/c2/c3/c5/c6/c7 全部参数）', () => {
  it('六个数据文件都导出了预期数量的 Lab（共 26 个例题）', () => {
    const expected: Record<string, number> = { 'c1.ts': 6, 'c2.ts': 6, 'c3.ts': 4, 'c5.ts': 6, 'c6.ts': 2, 'c7.ts': 2 }
    for (const { file, labs } of CHAPTER_FILES) {
      expect(labs.length, `${file} 导出的 Lab 数量`).toBe(expected[file])
    }
    expect(ALL_LABS.length).toBe(26)
    expect(ALL_LABS.every((l) => !l.kind.startsWith('ex-'))).toBe(true)
  })

  it('每个 Lab 的标题 / 题干 / 公式 / 参数齐全', () => {
    for (const lab of ALL_LABS) {
      expect(lab.title.trim().length, `${lab.id} title`).toBeGreaterThan(0)
      expect(lab.prompt.trim().length, `${lab.id} prompt`).toBeGreaterThan(0)
      expect(lab.formula.trim().length, `${lab.id} formula`).toBeGreaterThan(0)
      expect(lab.params.length, `${lab.id} params`).toBeGreaterThan(0)
    }
  })

  it('每个参数：key/label 非空、unit（若声明）非空、step > 0', () => {
    for (const lab of ALL_LABS) {
      const keys = new Set<string>()
      for (const p of lab.params) {
        expect(p.key.trim().length, `${lab.id} 参数 key`).toBeGreaterThan(0)
        expect(keys.has(p.key), `${lab.id} 参数 ${p.key} 重复`).toBe(false)
        keys.add(p.key)
        expect(p.label.trim().length, `${lab.id}.${p.key} label`).toBeGreaterThan(0)
        if (p.unit !== undefined) {
          expect(p.unit.trim().length, `${lab.id}.${p.key} unit`).toBeGreaterThan(0)
        }
        expect(p.step, `${lab.id}.${p.key} step`).toBeGreaterThan(0)
        expect(Number.isFinite(p.min), `${lab.id}.${p.key} min`).toBe(true)
        expect(Number.isFinite(p.max), `${lab.id}.${p.key} max`).toBe(true)
        expect(p.min, `${lab.id}.${p.key} min<=max`).toBeLessThanOrEqual(p.max)
      }
    }
  })

  it('每个参数：default ∈ [min,max] 且落在 step 网格上（= 默认值可达）', () => {
    for (const lab of ALL_LABS) {
      for (const p of lab.params) {
        expect(p.default, `${lab.id}.${p.key} default >= min`).toBeGreaterThanOrEqual(p.min - EPS)
        expect(p.default, `${lab.id}.${p.key} default <= max`).toBeLessThanOrEqual(p.max + EPS)
        expect(
          onStepGrid(p, p.default),
          `${lab.id}.${p.key} default=${p.default} 不在 min=${p.min} step=${p.step} 的网格上`,
        ).toBe(true)
      }
    }
  })

  it('每个参数：可达值不越界，且默认值确实出现在可达集合里', () => {
    for (const lab of ALL_LABS) {
      for (const p of lab.params) {
        const set = legalValues(p)
        expect(set.length, `${lab.id}.${p.key} 可达值`).toBeGreaterThan(0)
        expect(set[0]!, `${lab.id}.${p.key} 首个可达值 = min`).toBeCloseTo(p.min, 9)
        expect(set[set.length - 1]!, `${lab.id}.${p.key} 末个可达值 <= max`).toBeLessThanOrEqual(
          p.max + EPS,
        )
        expectReachable(p, p.default)
      }
    }
  })

  it('每个 Lab 的 fixed 常量不覆盖同名滑块参数（只做健全性检查）', () => {
    for (const lab of ALL_LABS) {
      if (!lab.fixed) continue
      for (const k of Object.keys(lab.fixed)) {
        expect(Number.isFinite(lab.fixed[k]), `${lab.id}.fixed.${k}`).toBe(true)
      }
    }
  })
})

describe('审计条 1 · c1 mul-compare：factor 教材档位 0.99 / 1 / 1.01 必须可达', () => {
  const lab = pick(c1Labs, 'g6-c1-mul-compare')
  const factor = param(lab, 'factor')

  it('step 已细化到 0.01，默认 1.01 落在合法集合内', () => {
    expect(factor.step).toBeCloseTo(0.01, 9)
    expect(factor.default).toBeCloseTo(1.01, 9)
    expect(onStepGrid(factor, factor.default)).toBe(true)
  })

  it('教材 p008 第 10 题的 4.9×1.01、4.9×1、4.9×0.99 都能拖出来', () => {
    expectReachable(factor, 0.99, 1, 1.01)
  })
})

describe('审计条 2 · c1 mul-approx：题干不再写死保留位数', () => {
  const lab = pick(c1Labs, 'g6-c1-mul-approx')

  it('题干按教材问法"得数应保留几位小数？"，由右侧滑块决定位数', () => {
    expect(lab.prompt).not.toContain('得数保留一位小数')
    expect(lab.prompt).toContain('保留几位小数')
    const digits = param(lab, 'digits')
    expectReachable(digits, 1, 2)
    expect(digits.default).toBeGreaterThanOrEqual(1)
    expect(digits.default).toBeLessThanOrEqual(2)
  })
})

describe('审计条 3 · c1 mul-approx：可达组合数与十进制安全舍入的回归范围一致', () => {
  const lab = pick(c1Labs, 'g6-c1-mul-approx')

  it('price × count × digits 的可达组合 = 7220（与 decimal-regression.test.ts 同一包络）', () => {
    const prices = legalValues(param(lab, 'price'))
    const counts = legalValues(param(lab, 'count'))
    const digits = legalValues(param(lab, 'digits'))
    expect(prices.length).toBe(190) // 0.5 ~ 9.95 step 0.05
    expect(counts.length).toBe(19) // 0.5 ~ 9.5 step 0.5
    expect(digits).toEqual([1, 2])
    expect(prices.length * counts.length * digits.length).toBe(7220)
  })
})

describe('审计条 4 · c1 div-decimal：第 3 组 0.34÷0.017 溯源为书页 8（练习/验证）', () => {
  const lab = pick(c1Labs, 'g6-c1-div-decimal')
  const sel = param(lab, 'sel')

  it('选择器标注了题源，tip 说明第 3 组不是例题', () => {
    expect(sel.unit).toContain('书页7例')
    expect(sel.unit).toContain('书页8')
    expect(lab.tip).toContain('0.34÷0.017')
    expect(lab.tip).toContain('书页 8')
    expect(lab.tip).toContain('不是例题')
  })

  it('三组例题都可达', () => {
    expectReachable(sel, 0, 1, 2)
  })
})

describe('审计条 6 · c2 estimate-shop：budget 下限必须覆盖已购商品成本 80.4 元', () => {
  const lab = pick(c2Labs, 'g6-c2-estimate-shop')
  const budget = param(lab, 'budget')
  const PURCHASED = 19.6 + 30.4 * 2 // 1 盒鸡蛋 + 2 箱牛奶

  it('min >= 81 且 >= 80.4，默认 100 仍合法', () => {
    expect(budget.min).toBeGreaterThanOrEqual(81)
    expect(budget.min).toBeGreaterThanOrEqual(PURCHASED)
    expect(budget.default).toBeGreaterThanOrEqual(budget.min)
    expectReachable(budget, 100)
    expect(budget.min).toBeLessThanOrEqual(budget.default)
  })

  it('可达的任意预算都 ≥ 已购成本（不会出现"剩 -2 元"）', () => {
    for (const v of legalValues(budget)) {
      expect(v).toBeGreaterThanOrEqual(PURCHASED)
    }
  })
})

describe('审计条 7/8 · c2 segment / segment-more：默认例人数、天数必须是整数', () => {
  it('segment 默认例 45 × 2/5 = 18（整数）', () => {
    const lab = pick(c2Labs, 'g6-c2-segment')
    const total = param(lab, 'total')
    const fn = param(lab, 'fn')
    const fd = param(lab, 'fd')
    expect((total.default * fn.default) % fd.default).toBe(0)
    expect((total.default * fn.default) / fd.default).toBe(18)
  })

  it('segment-more 默认例 14 × 2/7 = 4（整数）', () => {
    const lab = pick(c2Labs, 'g6-c2-segment-more')
    const base = param(lab, 'base')
    const fn = param(lab, 'fn')
    const fd = param(lab, 'fd')
    expect((base.default * fn.default) % fd.default).toBe(0)
    expect((base.default * fn.default) / fd.default).toBe(4)
  })
})

describe('审计条 13/28 · c3 binary：dec 上限与组件位权算法自洽', () => {
  const lab = pick(c3Labs, 'g6-c3-binary')
  const dec = param(lab, 'dec')

  it('dec ∈ [0,31] 整数档位', () => {
    expect(dec.min).toBe(0)
    expect(dec.max).toBe(31)
    expect(dec.step).toBe(1)
    const set = legalValues(dec)
    expect(set.length).toBe(32)
    for (const v of set) expect(Number.isInteger(v)).toBe(true)
  })

  it('对每个可达 dec：位权是 2 的整数次幂、位权从高到低、计数之和 = dec', () => {
    for (const v of legalValues(dec)) {
      const bits = binaryBits(v)
      let sum = 0
      bits.forEach((b, i) => {
        expect(Number.isInteger(Math.log2(b.weight)), `dec=${v} weight=${b.weight}`).toBe(true)
        if (i > 0) expect(b.weight).toBeLessThan(bits[i - 1]!.weight)
        sum += b.count
      })
      if (bits.length > 0) expect(bits[bits.length - 1]!.weight).toBe(1)
      if (v === 0) expect(bits).toEqual([{ bit: 0, weight: 1, count: 0 }])
      else expect(sum).toBe(v)
    }
  })
})

describe('审计条 14 · c5 circle-area：份数只保留课本序列（8 的倍数）', () => {
  const lab = pick(c5Labs, 'g6-c5-circle-area')
  const slices = param(lab, 'slices')

  it('min === 8、step === 8、max === 64、default === 8（合法）', () => {
    expect(slices.min).toBe(8)
    expect(slices.step).toBe(8)
    expect(slices.max).toBe(64)
    expect(slices.default).toBe(8)
    expect(onStepGrid(slices, slices.default)).toBe(true)
  })

  it('课本序列外的 4 / 12 / 20 不再可达，8 / 16 / 64 可达', () => {
    const set = legalValues(slices)
    for (const bad of [4, 12, 20]) {
      expect(set.some((x) => Math.abs(x - bad) < EPS), `${bad} 不应可达`).toBe(false)
    }
    expectReachable(slices, 8, 16, 64)
    expect(set.length).toBe(8)
  })
})

describe('审计条 10 · c6 map-scale：教材比例尺可达性', () => {
  const lab = pick(c6Labs, 'g6-c6-map-scale')
  const scaleDen = param(lab, 'scaleDen')

  it('1:1000（课本例）与 1:1500 都可达（1500 = 500 + 2×500，审计误判为不可达）', () => {
    expectReachable(scaleDen, 1000, 1500)
  })

  it('所有可达分母都是 100 的倍数 → 厘米/米换算恒为整数', () => {
    for (const v of legalValues(scaleDen)) {
      expect(v % 100, `scaleDen=${v}`).toBe(0)
    }
  })

  it('1:2200000 这类跨数量级的教材比例尺超出线性滑块范围（需 schema 侧预设列表）', () => {
    expect(scaleDen.max).toBeLessThan(2200000)
  })

  it('求实际 / 求图上 / 求比例尺三种问法都可达', () => {
    expectReachable(param(lab, 'ask'), 0, 1, 2)
  })
})

describe('审计条 11/12 · c7 direction：角度上限与距离默认值', () => {
  const lab = pick(c7Labs, 'g6-c7-direction')
  const angle = param(lab, 'angle')
  const dist = param(lab, 'dist')

  it('angle 上限 ≥ 75°，教材"北偏东 75°"可复现', () => {
    expect(angle.max).toBeGreaterThanOrEqual(75)
    expectReachable(angle, 30, 75)
    expect(dist.default).toBeGreaterThanOrEqual(dist.min)
  })

  it('题干写的 2 千米与 dist 默认值一致（不再出现题干 2 / 默认 3 的冲突）', () => {
    expect(lab.prompt).toContain('2 千米')
    expect(dist.default).toBe(2)
    expect(lab.tip).toContain('2 千米')
    expect(lab.tip).not.toContain('3 千米')
  })
})
