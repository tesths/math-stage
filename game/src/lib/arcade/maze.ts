export interface MazeLevel {
  /** 一维棋盘格（数值），null = 空地不显示 */
  grid: (number | null)[]
  width: number
  start: number
  goal: number
}

/** 预置 3 张迷宫：数字沿唯一路径每次 +1 */
export const MAZE_LEVELS: MazeLevel[] = [
  // 第 1 关：4 行 × 5 列蛇形 1~20
  {
    width: 5,
    start: 0,
    goal: 19,
    grid: [1, 2, 3, 4, 5, 10, 9, 8, 7, 6, 11, 12, 13, 14, 15, 20, 19, 18, 17, 16],
  },
  // 第 2 关：5 行 × 4 列蛇形 1~20
  {
    width: 4,
    start: 0,
    goal: 17,
    grid: [1, 2, 3, 4, 8, 7, 6, 5, 9, 10, 11, 12, 16, 15, 14, 13, 17, 18, 19, 20],
  },
  // 第 3 关：上下往返的阶梯 1~18（带一段折返）
  {
    width: 6,
    start: 0,
    goal: 17,
    grid: [1, 2, 3, 4, 5, 6, 12, 11, 10, 9, 8, 7, 13, 14, 15, 16, 17, 18, null, null, null, null, null, null],
  },
]

/** 返回当前格的上下左右相邻格索引 */
export function neighbors(cur: number, level: MazeLevel): number[] {
  const { width, grid } = level
  const out: number[] = []
  const row = Math.floor(cur / width)
  const col = cur % width
  const tryPush = (r: number, c: number) => {
    if (r < 0 || c < 0) return
    const i = r * width + c
    if (i < 0 || i >= grid.length) return
    if (grid[i] !== null) out.push(i)
  }
  tryPush(row - 1, col)
  tryPush(row + 1, col)
  tryPush(row, col - 1)
  tryPush(row, col + 1)
  return out
}

/** 能否从 cur 走向 next（相邻且值恰为 cur+1） */
export function isValidStep(cur: number, next: number, level: MazeLevel): boolean {
  const curVal = level.grid[cur]
  const nextVal = level.grid[next]
  if (curVal === null || curVal === undefined || nextVal === null || nextVal === undefined) return false
  if (!neighbors(cur, level).includes(next)) return false
  return nextVal === curVal + 1
}