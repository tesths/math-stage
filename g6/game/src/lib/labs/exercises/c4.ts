import type { C4ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { simplifyRatio, toFixed2 } from '@/lib/engine/math'

/** 四 比和比例 · 练习题求值 */
export function computeC4(kind: C4ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c4-cube-ratio': {
      // 两个棱长独立可调，统一按「小 : 大 = min : max」呈现，避免出现“小正方体比大正方体还大”
      const a0 = Math.round(p.a ?? 4)
      const b0 = Math.round(p.b ?? 6)
      const a = Math.min(a0, b0)
      const b = Math.max(a0, b0)
      const [ra, rb] = simplifyRatio(a, b)
      const [aa, ab] = simplifyRatio(a * a, b * b)
      const [va, vb] = simplifyRatio(a * a * a, b * b * b)
      return {
        value: a / b,
        text: `棱长比 ${ra}:${rb} · 底面积比 ${aa}:${ab} · 体积比 ${va}:${vb}`,
        steps: [
          { expr: `棱长比 ${a}:${b}（前后项同时除以最大公因数）`, result: `${ra}:${rb}` },
          { expr: `底面积比 ${a}²:${b}² = ${a * a}:${b * b}`, result: `${aa}:${ab}（棱长比的平方）` },
          { expr: `体积比 ${a}³:${b}³ = ${a * a * a}:${b * b * b}`, result: `${va}:${vb}（棱长比的立方）` },
        ],
        conclusion: `棱长比 ${a}:${b} 化简为 ${ra}:${rb}；底面积比 ${aa}:${ab} 正好是 ${ra}:${rb} 的平方，体积比 ${va}:${vb} 正好是 ${ra}:${rb} 的立方。面积比是棱长比的平方，体积比是棱长比的立方。`,
      }
    }
    case 'ex-c4-football-ratio': {
      const a = Math.round(p.a ?? 3)
      const b = Math.round(p.b ?? 5)
      const per = Math.round(p.per ?? 4)
      const parts = a + b
      const total = per * parts
      const black = per * a
      const white = per * b
      return {
        value: black,
        text: `黑色皮 ${toFixed2(black)} 块 · 白色皮 ${toFixed2(white)} 块`,
        steps: [
          { expr: `总份数 = ${a} + ${b}`, result: `${parts} 份` },
          { expr: `总块数 = 每份 ${per} 块 × ${parts} 份`, result: `${total} 块` },
          { expr: `黑色皮 = ${per} × ${a}`, result: `${toFixed2(black)} 块` },
          { expr: `白色皮 = ${per} × ${b}`, result: `${toFixed2(white)} 块` },
        ],
        conclusion: `按 ${a}:${b} 分配：总份数 ${parts} 份，每份 ${per} 块（一共 ${total} 块），再分别乘份数。黑色皮 ${toFixed2(black)} 块、白色皮 ${toFixed2(white)} 块，${toFixed2(black)} + ${toFixed2(white)} = ${toFixed2(black + white)} 块，正好是总数。`,
      }
    }
  }
}
