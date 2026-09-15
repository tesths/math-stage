import type { C1ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { roundTo, toFixed2 } from '@/lib/engine/math'

/** 精确乘积：底 1 位小数 × 高 2 位小数，最多 3 位小数；去掉末尾 0，整数不带小数点 */
function fmtProduct(v: number): string {
  return String(Number(v.toFixed(3)))
}

export function computeC1(kind: C1ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c1-div11-cycle': {
      const n = Math.round(p.n ?? 3)
      const digits = Math.round(p.digits ?? 2)
      const divisor = 11
      // 长除法：n < 11，个位余数即 n；逐位求商与余数，直到余数重复
      const t1 = n * 10
      const d1 = Math.floor(t1 / divisor)
      const rem1 = t1 % divisor
      const t2 = rem1 * 10
      const d2 = Math.floor(t2 / divisor)
      const rem2 = t2 % divisor
      const cycle = `${d1}${d2}`
      const exact = n / divisor
      const approx = roundTo(exact, digits)
      return {
        value: exact,
        text: `${n} ÷ ${divisor} = 0.${cycle}${cycle}…（循环节 ${cycle}）`,
        steps: [
          { expr: `${t1} ÷ ${divisor} 的商和余数`, result: `商 ${d1} 余 ${rem1}` },
          { expr: `${t2} ÷ ${divisor}`, result: `商 ${d2} 余 ${rem2}，余数 ${rem2} 又出现，开始循环` },
          { expr: `循环节 = 9n（一位数时前面补 0）`, result: `9 × ${n} = ${cycle}` },
          {
            expr: `保留 ${digits} 位小数（四舍五入）`,
            result: `${n} ÷ ${divisor} ≈ ${approx.toFixed(digits)}`,
          },
        ],
        conclusion: `${n} ÷ ${divisor} 的小数部分每两位“${cycle}”重复一次（循环节是 ${cycle}）：除到小数部分后余数重复出现，商就重复出现，这样的小数叫循环小数。保留 ${digits} 位小数约是 ${approx.toFixed(digits)}。`,
      }
    }
    case 'ex-c1-pgram-area': {
      const base = p.base ?? 3.2
      const height = p.height ?? 1.84
      const digits = Math.round(p.digits ?? 1)
      const exact = base * height
      const approx = roundTo(exact, digits)
      const estimate = Math.round(base) * Math.round(height)
      return {
        value: approx,
        text: `${toFixed2(base)} × ${toFixed2(height)} ≈ ${approx.toFixed(digits)} 平方分米`,
        steps: [
          {
            expr: `估计：${toFixed2(base)} ≈ ${Math.round(base)}、${toFixed2(height)} ≈ ${Math.round(height)}`,
            result: `面积 ≈ ${Math.round(base)} × ${Math.round(height)} = ${estimate} 平方分米`,
          },
          {
            expr: `面积 = 底 × 高`,
            result: `${toFixed2(base)} × ${toFixed2(height)} = ${fmtProduct(exact)} 平方分米`,
          },
          {
            expr: `保留 ${digits} 位小数（四舍五入）`,
            result: `≈ ${approx.toFixed(digits)} 平方分米`,
          },
        ],
        conclusion: `先估计：${toFixed2(base)} ≈ ${Math.round(base)}、${toFixed2(height)} ≈ ${Math.round(height)}，面积约 ${estimate} 平方分米；再计算 ${toFixed2(base)} × ${toFixed2(height)} = ${fmtProduct(exact)}，保留 ${digits} 位小数约是 ${approx.toFixed(digits)} 平方分米。估算值 ${estimate} 与计算值 ${fmtProduct(exact)} 接近，结果合理。`,
      }
    }
  }
}
