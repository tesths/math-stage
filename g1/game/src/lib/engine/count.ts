const VARIATION_SELECTOR = /[\uFE0E\uFE0F]/g

/** 去除变体选择符后按码点拆分（保证 ⛹️ 等 emoji 计为 1 个） */
export function visibleUnits(emoji: string): string[] {
  return Array.from(emoji.replace(VARIATION_SELECTOR, ''))
}

/** emoji 串按可见单元计数（兼容变体选择符/多码位 emoji） */
export function countUnits(emoji: string): number {
  return visibleUnits(emoji).length
}

/** 十位数字（0~1） */
export function tensOf(n: number): number {
  return Math.floor(n / 10)
}

/** 个位数字 */
export function onesOf(n: number): number {
  return n % 10
}

/** 闭区间判断 */
export function isWithin(n: number, min: number, max: number): boolean {
  return Number.isInteger(n) && n >= min && n <= max
}
