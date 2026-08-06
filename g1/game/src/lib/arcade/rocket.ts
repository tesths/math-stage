import { shuffle } from '../engine/generator'

/** 生成 1 到 count 的倒序打乱按钮（如 10..0） */
export function buildCountdown(count = 10): number[] {
  const nums: number[] = []
  for (let i = count; i >= 0; i--) nums.push(i)
  return shuffle(nums)
}