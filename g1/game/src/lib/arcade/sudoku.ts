export type SudokuCell = number | null
export type SudokuGrid = SudokuCell[][]

/** 基础有效盘面（每行/列/2×2 宫都是 1~4） */
const BASE: SudokuGrid = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
]

function shuffle4(arr: number[]): number[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

/**
 * 生成一局 4×4 数独。
 * 数字置换 + 2×2 宫内行/列重排保持有效性；挖 holes 个空格。
 */
export function generateBoard(holes = 5): { board: SudokuGrid; solution: SudokuGrid } {
  const perm = shuffle4([1, 2, 3, 4])
  const rowSwap = [shuffle4([0, 1]), shuffle4([2, 3])]
  const colSwap = [shuffle4([0, 1]), shuffle4([2, 3])]
  const solution: SudokuGrid = []
  for (let r = 0; r < 4; r++) {
    const row: SudokuCell[] = []
    for (let c = 0; c < 4; c++) {
      const sr = rowSwap[Math.floor(r / 2)]![r % 2]!
      const sc = colSwap[Math.floor(c / 2)]![c % 2]!
      row.push(perm[BASE[sr]![sc]! - 1]!)
    }
    solution.push(row)
  }
  const board: SudokuGrid = solution.map((row) => [...row])
  const idx = shuffle4([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
  for (const pos of idx.slice(0, Math.min(holes, 16))) {
    board[Math.floor(pos / 4)]![pos % 4] = null
  }
  return { board, solution }
}

/** 空格可用的候选数 */
export function candidates(grid: SudokuGrid, r: number, c: number): number[] {
  const row = grid[r]!
  if (row[c] !== null) return []
  const rowSet = new Set(row.filter((v) => v !== null) as number[])
  const colSet = new Set(grid.map((r2) => r2[c]!).filter((v) => v !== null) as number[])
  const br = Math.floor(r / 2) * 2
  const bc = Math.floor(c / 2) * 2
  const boxSet = new Set<number>()
  for (let i = br; i < br + 2; i++) {
    const boxRow = grid[i]!
    for (let j = bc; j < bc + 2; j++) {
      const cell = boxRow[j]!
      if (cell !== null) boxSet.add(cell)
    }
  }
  return [1, 2, 3, 4].filter((n) => !rowSet.has(n) && !colSet.has(n) && !boxSet.has(n))
}

/** 答案与预期解一致 */
export function checkSolved(grid: SudokuGrid, solution: SudokuGrid): boolean {
  for (let r = 0; r < 4; r++) {
    const row = grid[r]!
    const solRow = solution[r]!
    for (let c = 0; c < 4; c++) {
      if (row[c] !== solRow[c]) return false
    }
  }
  return true
}