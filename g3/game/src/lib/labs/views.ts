/**
 * 三年级「观察物体」的纯几何内核：小正方体的三视图投影。
 *
 * 抽出来的理由（本轮 L0）：三视图的"前面/右面/上面各几个方格"必须是**同一份
 * 方块坐标算出来的**。旧实现里 compute.ts 另写了一串手填的"前面 6 个方格一排"，
 * 而组件画的是 2×3×1 的长方体（前面只有 2 列），同一屏两套数据互相矛盾。
 */

/** 一个小正方体：x 向右、y 向上、z 向后 */
export type Cube = [number, number, number]

export interface ViewGrid {
  /** 列数（观察方向的横向格数） */
  cols: number
  /** 行数（观察方向的纵向格数） */
  rows: number
  /** 行优先的填充标记，cells[0] 是左上角 */
  cells: boolean[]
}

export interface ViewGrids {
  front: ViewGrid
  right: ViewGrid
  top: ViewGrid
}

/** 由方块集合生成三视图（同一份数据，组件与 compute 共用） */
export function viewGrids(cubes: Cube[]): ViewGrids {
  const front = new Set<string>()
  const right = new Set<string>()
  const top = new Set<string>()
  let maxX = 0
  let maxY = 0
  let maxZ = 0
  for (const [x, y, z] of cubes) {
    front.add(`${x},${y}`)
    right.add(`${z},${y}`)
    top.add(`${x},${z}`)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    maxZ = Math.max(maxZ, z)
  }
  const build = (set: Set<string>, cols: number, rows: number, key: (c: number, r: number) => string) => {
    const cells: boolean[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) cells.push(set.has(key(c, r)))
    }
    return { cols, rows, cells }
  }
  return {
    // 前面：横 x、竖 y（y 越大越靠上，所以行号反过来）
    front: build(front, maxX + 1, maxY + 1, (c, r) => `${c},${maxY - r}`),
    // 右面：横 z、竖 y
    right: build(right, maxZ + 1, maxY + 1, (c, r) => `${c},${maxY - r}`),
    // 上面：横 x、竖 z（z 越大越靠后，画在上方）
    top: build(top, maxX + 1, maxZ + 1, (c, r) => `${c},${maxZ - r}`),
  }
}

/** 某个视图的格数与"几列几行"文字（给 compute 的分步思考用） */
export function gridText(g: ViewGrid): string {
  const filled = g.cells.filter(Boolean).length
  return `${g.cols} 列 × ${g.rows} 行，共 ${filled} 个方格`
}

/** 课本里「用 n 个正方体摆成的四种摆法」 */
export interface ShapeDef {
  name: string
  cubes: Cube[]
}

export const VIEW_SHAPES: ShapeDef[] = [
  {
    name: '2 × 3 × 1 的长方体（6 块）',
    cubes: [
      [0, 0, 0],
      [1, 0, 0],
      [0, 0, 1],
      [1, 0, 1],
      [0, 0, 2],
      [1, 0, 2],
    ],
  },
  {
    name: 'L 形（5 块）',
    cubes: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [0, 1, 0],
      [0, 2, 0],
    ],
  },
  {
    name: '阶梯形（5 块）',
    cubes: [
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
  {
    name: '“田”字形（4 块）',
    cubes: [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
]

/** 投票箱（3 × 2 × 2 的长方体，12 块） */
export const BALLOT_BOX: Cube[] = [0, 1, 2].flatMap((x) =>
  [0, 1].flatMap((y) => [0, 1].map((z) => [x, y, z] as Cube)),
)
