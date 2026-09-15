import type { C3ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { toFixed2 } from '@/lib/engine/math'

/** 练习六 第 9 题的六组除数：÷0.1 ÷2 ÷0.25 ÷10 ÷0.5 ÷4 */
const DIVISORS = [0.1, 2, 0.25, 10, 0.5, 4]

/** 三 数与运算的再认识 · 练习题求值 */
export function computeC3(kind: C3ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c3-div-to-mul': {
      const idx = Math.min(DIVISORS.length - 1, Math.max(0, Math.round(p.divIdx ?? 0)))
      const b = DIVISORS[idx]!
      const a = p.a ?? 4.8
      const recip = 1 / b
      const q = a / b
      return {
        value: q,
        text: `${toFixed2(a)} ÷ ${toFixed2(b)} = ${toFixed2(a)} × ${toFixed2(recip)} = ${toFixed2(q)}`,
        steps: [
          { expr: `除数的倒数：${toFixed2(b)} × ${toFixed2(recip)}`, result: '1' },
          { expr: `${toFixed2(a)} ÷ ${toFixed2(b)}`, result: `${toFixed2(q)}` },
          { expr: `${toFixed2(a)} × ${toFixed2(recip)}`, result: `${toFixed2(q)}（两条路结果相同）` },
        ],
        conclusion: `除以 ${toFixed2(b)} 就是乘 ${toFixed2(recip)}；除数 ${toFixed2(b)} ${b > 1 ? '大于 1' : '小于 1'}，商就比被除数 ${b > 1 ? '变小' : '变大'}：${toFixed2(a)} ÷ ${toFixed2(b)} = ${toFixed2(q)}。`,
      }
    }
    case 'ex-c3-frac-split': {
      const fd = p.fd ?? 12
      const target = p.target ?? 7
      const mode = Math.round(p.mode ?? 0)
      const a = Math.round(p.a ?? 3)
      const value = target / fd
      if (mode === 0) {
        const second = target - a
        return {
          value,
          text: `${a}/${fd} + ${second}/${fd} = ${target}/${fd}`,
          steps: [
            { expr: `${target}/${fd} 就是 ${target} 个 1/${fd}`, result: `${target} 个 1/${fd}` },
            { expr: `把 ${target} 个 1/${fd} 分成 ${a} 个与 ${second} 个`, result: `${a}/${fd} 和 ${second}/${fd}` },
            { expr: `${a}/${fd} + ${second}/${fd}`, result: `${target}/${fd}` },
          ],
          conclusion: `和是 ${target}/${fd} 的两个分数不止一组：把 ${target} 个 1/${fd} 分成 ${a} 个和 ${second} 个，就得到 ${a}/${fd} + ${second}/${fd} = ${target}/${fd}。`,
        }
      }
      const minuend = a + target
      return {
        value,
        text: `${minuend}/${fd} − ${a}/${fd} = ${target}/${fd}`,
        steps: [
          { expr: `差是 ${target} 个 1/${fd}`, result: `${target}/${fd}` },
          { expr: `被减数 = 减数 + 差 = ${a} + ${target} 个 1/${fd}`, result: `${minuend}/${fd}` },
          { expr: `${minuend}/${fd} − ${a}/${fd}`, result: `${target}/${fd}` },
        ],
        conclusion: `差是 ${target}/${fd} 的两个分数也不止一组：被减数比减数多 ${target} 个 1/${fd}，得到 ${minuend}/${fd} − ${a}/${fd} = ${target}/${fd}。`,
      }
    }
  }
}
