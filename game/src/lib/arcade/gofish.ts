import { shuffle } from '../engine/generator'

/** 生成一局数字钓鱼的鱼群（互补成 target 的 3 对，6 条） */
export function buildFishPool(target = 10): number[] {
  const halves = shuffle([1, 2, 3, 4, 5, 6, 7].filter((a) => a < target && target - a !== a))
  const chosen = halves.slice(0, 3)
  const pool: number[] = []
  for (const a of chosen) pool.push(a, target - a)
  return shuffle(pool)
}
