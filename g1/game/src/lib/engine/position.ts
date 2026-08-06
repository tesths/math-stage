export type PositionWord = '上' | '下' | '左' | '右' | '前' | '后'

/**
 * 计算 target 在某方位上的物品
 * 约定：items 按"左→右"（或"上→下"）排列
 * - 左/前/上 → 前一项；右/后/下 → 后一项
 * 越界或不存在返回 undefined
 */
export function positionOf(items: string[], target: string, position: PositionWord): string | undefined {
  const i = items.indexOf(target)
  if (i === -1) return undefined
  const dir = ['左', '上', '前'].includes(position) ? -1 : 1
  return items[i + dir]
}
