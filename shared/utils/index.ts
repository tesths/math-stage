/**
 * 共享工具函数（纯函数，供四个应用复用；覆盖率的 95%+ 保证见 test/）。
 */

/** 把数值限制在 [min, max] 区间内 */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** 生成 [start, end) 的整数序列 */
export function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i < end; i++) out.push(i)
  return out
}

/** 用顿号连接展示列表（如单元序号 '2、6、7'） */
export function joinItems(items: string[]): string {
  return items.join('、')
}

/** 计数文案：5 个 / 1 道 */
export function countLabel(n: number, unit: string): string {
  return `${n} ${unit}`
}
