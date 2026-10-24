import { describe, expect, it } from 'vitest'
import { BALLOT_BOX, VIEW_SHAPES, gridText, viewGrids } from '@/lib/labs/views'

describe('viewGrids · 三视图格数由方块坐标算出', () => {
  it('2×3×1 的长方体：前面 2 列 1 行共 2 格，上面 2 列 3 行共 6 格', () => {
    const g = viewGrids(VIEW_SHAPES[0]!.cubes)
    expect(g.front.cols).toBe(2)
    expect(g.front.rows).toBe(1)
    expect(g.front.cells.filter(Boolean)).toHaveLength(2)
    expect(g.top.cols).toBe(2)
    expect(g.top.rows).toBe(3)
    expect(g.top.cells.filter(Boolean)).toHaveLength(6)
  })

  it('L 形（5 块）：前面是 3 列 3 行的"L"', () => {
    const g = viewGrids(VIEW_SHAPES[1]!.cubes)
    expect(g.front.cols).toBe(3)
    expect(g.front.rows).toBe(3)
    // 行优先：最上面一行只有最左边一格
    expect(g.front.cells.slice(0, 3)).toEqual([true, false, false])
    expect(g.front.cells.filter(Boolean)).toHaveLength(5)
  })

  it('投票箱 3×2×2：前面 3 列 2 行 6 格，右面 2 列 2 行 4 格', () => {
    const g = viewGrids(BALLOT_BOX)
    expect(BALLOT_BOX).toHaveLength(12)
    expect(g.front.cols * g.front.rows).toBe(6)
    expect(g.right.cols * g.right.rows).toBe(4)
    expect(g.top.cols * g.top.rows).toBe(6)
  })

  it('gridText 给出"几列几行、共几格"', () => {
    const g = viewGrids(VIEW_SHAPES[1]!.cubes)
    expect(gridText(g.front)).toBe('3 列 × 3 行，共 5 个方格')
  })
})
