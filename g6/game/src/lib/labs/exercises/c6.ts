import type { C6ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { toFixed2 } from '@/lib/engine/math'

export function computeC6(kind: C6ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c6-scale-area': {
      const a = p.a ?? 2
      const n = Math.round(p.n ?? 3)
      const d = Math.round(p.d ?? 2)
      const trapTop = p.trapTop ?? 4
      const trapBottom = p.trapBottom ?? 8
      const trapHeight = p.trapHeight ?? 6
      const triArea = (a * a) / 2
      const scaledArea = (a * a * n * n) / 2
      const times = n * n
      const trapArea = ((trapTop + trapBottom) * trapHeight) / 2
      const fracDen = d * d
      const trapScaled = trapArea / fracDen
      return {
        value: times,
        text: `放大后的面积是原来的 ${times} 倍；缩小后的面积是原来的 1/${fracDen}`,
        steps: [
          {
            expr: `原等腰直角三角形面积 = 直角边 × 直角边 ÷ 2`,
            result: `${toFixed2(a)} × ${toFixed2(a)} ÷ 2 = ${toFixed2(triArea)} 格²`,
          },
          {
            expr: `按 ${n}:1 放大，直角边 = ${toFixed2(a)} × ${n} = ${toFixed2(a * n)}`,
            result: `${toFixed2(a * n)} × ${toFixed2(a * n)} ÷ 2 = ${toFixed2(scaledArea)} 格²`,
          },
          {
            expr: `面积倍数 = 边长倍数 × 边长倍数 = ${n} × ${n}`,
            result: `${times} 倍（${toFixed2(triArea)} → ${toFixed2(scaledArea)} 格²）`,
          },
          {
            expr: `直角梯形面积 = (上底 + 下底) × 高 ÷ 2，再按 1:${d} 缩小`,
            result: `(${toFixed2(trapTop)} + ${toFixed2(trapBottom)}) × ${toFixed2(trapHeight)} ÷ 2 = ${toFixed2(trapArea)} 格² → ${toFixed2(trapScaled)} 格²，是原来的 1/${fracDen}`,
          },
        ],
        conclusion: `按 ${n}:1 放大，每条边都变成原来的 ${n} 倍，面积就变成原来的 ${n}×${n} = ${times} 倍；按 1:${d} 缩小，每条边只有原来的 1/${d}，面积就是原来的 1/${fracDen}。放大、缩小只改变图形的大小，形状（各个角的大小）不变。`,
      }
    }
    case 'ex-c6-two-maps': {
      const denA = Math.round(p.denA ?? 5000)
      const denB = Math.round(p.denB ?? 2000)
      const cm = p.cm ?? 2
      const cmA = p.cmA ?? 3
      const actualACm = cmA * denA
      const actualAM = actualACm / 100
      const actualBCm = cmA * denB
      const actualBM = actualBCm / 100
      const actualCmCm = cm * denB
      const actualCmM = actualCmCm / 100
      const newCm = (cm * denB) / denA
      // 方向性措辞按实际大小关系生成，避免 denA ≤ denB 时自相矛盾
      const cmp = denA > denB ? '分母更大的' : denA < denB ? '分母更小的' : '分母相同的'
      return {
        value: newCm,
        text: `A 图 ${toFixed2(cmA)} 厘米 → ${toFixed2(actualAM)} 米；B 图 ${toFixed2(cmA)} 厘米 → ${toFixed2(actualBM)} 米；${toFixed2(cm)} 厘米改画到 A 图应画 ${toFixed2(newCm)} 厘米`,
        steps: [
          {
            expr: `A 图（1:${denA}）上 ${toFixed2(cmA)} 厘米表示的实际长度`,
            result: `${toFixed2(cmA)} × ${denA} = ${toFixed2(actualACm)} 厘米 = ${toFixed2(actualAM)} 米`,
          },
          {
            expr: `B 图（1:${denB}）上 ${toFixed2(cmA)} 厘米表示的实际长度`,
            result: `${toFixed2(cmA)} × ${denB} = ${toFixed2(actualBCm)} 厘米 = ${toFixed2(actualBM)} 米`,
          },
          {
            expr: `B 图上 ${toFixed2(cm)} 厘米对应的实际长度`,
            result: `${toFixed2(cm)} × ${denB} = ${toFixed2(actualCmCm)} 厘米 = ${toFixed2(actualCmM)} 米`,
          },
          {
            expr: `改画到 A 图：实际长度 ÷ A 图分母`,
            result: `${toFixed2(actualCmCm)} ÷ ${denA} = ${toFixed2(newCm)} 厘米`,
          },
        ],
        conclusion: `实际距离 = 图上距离 × 比例尺分母，图上距离 = 实际距离 ÷ 比例尺分母。同一段实际距离（${toFixed2(actualCmM)} 米），画在分母 ${denB} 的 B 图上是 ${toFixed2(cm)} 厘米；改画到${cmp} ${denA} 的 A 图上是 ${toFixed2(newCm)} 厘米——比例尺分母越大，同样的实际距离在图上画得越短。`,
      }
    }
  }
}
