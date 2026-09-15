import type { C5ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'

const PI = 3.14

/** 数值文案：最多保留 3 位小数并去掉末尾 0（整数不带小数点），保住 2.198 这类三位小数 */
function fmt(v: number): string {
  return String(Number(v.toFixed(3)))
}

export function computeC5(kind: C5ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c5-wheel-roll': {
      const d = p.d ?? 70
      const n = Math.round(p.n ?? 100)
      const t = Math.round(p.t ?? 10)
      const circCm = PI * d
      const circM = circCm / 100
      const perMin = circM * n
      const total = circM * n * t
      const value = Math.round(total * 100) / 100
      const km = Math.round((total / 1000) * 10) / 10
      return {
        value,
        text: `从小浩家到学校大约 ${fmt(value)} 米（约 ${fmt(km)} 千米）`,
        steps: [
          { expr: `车轮周长 C = π × d`, result: `${PI} × ${fmt(d)} = ${fmt(circCm)} 厘米 = ${fmt(circM)} 米` },
          { expr: `每分钟路程 = 周长 × 每分钟圈数`, result: `${fmt(circM)} × ${n} = ${fmt(perMin)} 米` },
          { expr: `总路程 = 每分钟路程 × 时间`, result: `${fmt(perMin)} × ${t} = ${fmt(total)} 米（约 ${fmt(km)} 千米）` },
        ],
        conclusion: `车轮转一圈车就前进一个周长 C=πd=${fmt(circCm)} 厘米=${fmt(circM)} 米；再用“周长 × 总圈数”求路程：${fmt(circM)} × ${n} × ${t} = ${fmt(total)} 米，大约 ${fmt(km)} 千米。`,
      }
    }
    case 'ex-c5-circle-packing': {
      const L = p.L ?? 15
      const W = p.W ?? 8
      const d = p.d ?? 2
      const a = Math.floor(L / d)
      const b = Math.floor(W / d)
      const count = a * b
      const remL = L - a * d
      const remW = W - b * d
      const circleArea = PI * (d / 2) ** 2
      const byArea = Math.floor((L * W) / circleArea)
      const hasRem = remL > 0 || remW > 0
      const areaMore = byArea > count
      return {
        value: count,
        text: `最多能剪 ${count} 个圆片`,
        steps: [
          { expr: `长 ÷ 直径（去尾法）`, result: `${fmt(L)} ÷ ${fmt(d)} = ${a}${remL > 0 ? ` …${fmt(remL)}` : ''}，每行 ${a} 个` },
          { expr: `宽 ÷ 直径（去尾法）`, result: `${fmt(W)} ÷ ${fmt(d)} = ${b}${remW > 0 ? ` …${fmt(remW)}` : ''}，共 ${b} 行` },
          { expr: `总数 = 每行个数 × 行数`, result: `${a} × ${b} = ${count} 个` },
        ],
        conclusion: `两个方向都要用去尾法：每行 ${a} 个、${b} 行，最多剪 ${a} × ${b} = ${count} 个。${hasRem ? '剩下的边角料拼不出整圆，' : '两个方向正好排满，'}${areaMore ? `所以不能按面积算（${fmt(L * W)} ÷ ${fmt(circleArea)} ≈ ${byArea} 个，比实际多，是错的）。` : `也不能只看面积（${fmt(L * W)} ÷ ${fmt(circleArea)} ≈ ${byArea} 个，这组数据凑巧与去尾法相同，换一组就会偏大）。`}`,
      }
    }
  }
}
