/**
 * 线段图（三步数量关系）的纯函数。
 *
 * 旧实现直接 `orange = pear − less`：当"橘比梨少"的箱数大于梨的箱数时，
 * 线段会长成**负数**（SVG 里直接画不出来），算式还写着负数箱。
 * 这里把"少"的取值做真实约束，并给出提示文案。
 */
export interface SegModel {
  pear: number
  less: number
  orange: number
  sum: number
  times: number
  apple: number
  clamped: boolean
  text: string[]
}

export function segModel(pearRaw: number, lessRaw: number, timesRaw: number): SegModel {
  const pear = Math.max(1, Math.round(pearRaw))
  const asked = Math.max(0, Math.round(lessRaw))
  const less = Math.min(asked, pear - 1)
  const clamped = asked !== less
  const orange = Math.max(0, pear - less)
  const sum = pear + orange
  const times = Math.max(0, Math.round(timesRaw))
  const apple = sum * times
  const text = [
    `橘子 = 梨 − 少 = ${pear} − ${less} = ${orange} 箱`,
    `梨 + 橘子 = ${pear} + ${orange} = ${sum} 箱`,
    `苹果 =（梨 + 橘子）× ${times} = ${sum} × ${times} = ${apple} 箱`,
  ]
  if (clamped) text.unshift(`橘子不能是负数：梨只有 ${pear} 箱，"少"最多按 ${less} 箱算`)
  return { pear, less, orange, sum, times, apple, clamped, text }
}
