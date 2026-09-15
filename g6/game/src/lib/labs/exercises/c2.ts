import type { C2ExerciseKind, ParamValues } from '@data/schema/lab'
import type { LabResult } from '../types'
import { toFixed2 } from '@/lib/engine/math'

/** 与例题 compute 一致的数字格式化：先抹掉浮点尾差，再按整数/两位小数输出 */
function fmt(v: number): string {
  return toFixed2(Math.round(v * 100000) / 100000)
}

export function computeC2(kind: C2ExerciseKind, p: ParamValues): LabResult {
  switch (kind) {
    case 'ex-c2-overlap-club': {
      const total = p.total ?? 48
      const dn = Math.round(p.dn ?? 2)
      const sn = Math.round(p.sn ?? 3)
      const dance = (total * dn) / 3
      const sing = (total * sn) / 4
      const overlap = dance + sing - total
      return {
        value: overlap,
        text: `${fmt(total)} 人中有 ${fmt(overlap)} 人既喜欢跳舞又喜欢唱歌`,
        steps: [
          { expr: `喜欢跳舞 = ${fmt(total)} × ${dn}/3`, result: `${fmt(dance)} 人` },
          { expr: `喜欢唱歌 = ${fmt(total)} × ${sn}/4`, result: `${fmt(sing)} 人` },
          { expr: `重叠 = ${fmt(dance)} + ${fmt(sing)} − ${fmt(total)}`, result: `${fmt(overlap)} 人` },
        ],
        conclusion: `把全班看作单位“1”：喜欢跳舞的 ${fmt(dance)} 人与喜欢唱歌的 ${fmt(sing)} 人相加时，把“两样都喜欢”的 ${fmt(overlap)} 人算了两遍，所以重叠人数 = ${fmt(dance)} + ${fmt(sing)} − ${fmt(total)} = ${fmt(overlap)} 人。`,
      }
    }
    case 'ex-c2-egg-crate': {
      const crate = p.crate ?? 1
      const withEggs = p.withEggs ?? 8
      const price = p.price ?? 12.8
      const eggs = withEggs - crate
      const half = eggs / 2
      const after = crate + half
      const sold = withEggs - after
      const revenue = eggs * price
      return {
        value: revenue,
        text: `这筐鸡蛋一共能卖 ${fmt(revenue)} 元`,
        steps: [
          { expr: `${fmt(withEggs)} − ${fmt(after)}`, result: `${fmt(sold)} 千克（卖出的一半鸡蛋）` },
          { expr: `${fmt(sold)} × 2`, result: `${fmt(eggs)} 千克（全部鸡蛋）` },
          { expr: `${fmt(eggs)} × ${fmt(price)}`, result: `${fmt(revenue)} 元` },
        ],
        conclusion: `两次称重都含筐重，相减正好把筐重抵消：${fmt(withEggs)} − ${fmt(after)} = ${fmt(sold)} 千克是一半鸡蛋，一半 × 2 = 全部 ${fmt(eggs)} 千克，再乘单价 ${fmt(price)} 元，一共能卖 ${fmt(revenue)} 元。`,
      }
    }
  }
}
