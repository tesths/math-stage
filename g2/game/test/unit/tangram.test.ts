import { describe, expect, it } from 'vitest'
import {
  ASSEMBLIES,
  PIECES,
  SQUARE_SIDE,
  assemblyByKey,
  coversExactly,
  outlineVerticesCovered,
  piecesAt,
  piecesInsideOutline,
  placementsOf,
  polygonArea,
  sameVertexSet,
  shapeSignature,
  solveRigid,
} from '@/lib/labs/tangram'

describe('七巧板几何：7 块板拼成正方形（课本 p34 原图）', () => {
  it('7 块板面积之和 = 正方形面积 64（16+16+4+8+4+8+8）', () => {
    const total = PIECES.reduce((s, p) => s + polygonArea(p.points), 0)
    expect(total).toBeCloseTo(SQUARE_SIDE * SQUARE_SIDE, 6)
    const byNo = Object.fromEntries(PIECES.map((p) => [p.no, polygonArea(p.points)]))
    expect(byNo).toEqual({ 1: 16, 2: 16, 3: 4, 4: 8, 5: 4, 6: 8, 7: 8 })
  })

  it('①号板和②号板形状、大小完全一样（课本原话）', () => {
    expect(shapeSignature(PIECES[0]!.points)).toBe(shapeSignature(PIECES[1]!.points))
  })

  it('③号板和⑤号板形状、大小完全一样；④⑥⑦各自与它们不同', () => {
    const sig3 = shapeSignature(PIECES[2]!.points)
    expect(sig3).toBe(shapeSignature(PIECES[4]!.points))
    expect(sig3).not.toBe(shapeSignature(PIECES[3]!.points))
  })

  it('①号板的大小相当于 4 块③号板（课本 p34 的追问）', () => {
    expect(polygonArea(PIECES[0]!.points) / polygonArea(PIECES[2]!.points)).toBe(4)
  })

  it('原始拼法：正方形内每个采样点恰好被 1 块板覆盖（不重叠、不留空）', () => {
    const square = ASSEMBLIES[0]!
    const cover = coversExactly(
      PIECES.map((p) => ({ points: p.points })),
      square.outline,
      0.2,
    )
    expect(cover).toEqual({ ok: true, overlaps: 0, holes: 0, leaks: 0 })
  })

  it('每块板都能由原位置刚性变换到拼合位置（拼合不改变板的形状与大小）', () => {
    const placements = placementsOf(ASSEMBLIES[0]!)
    expect(placements.length).toBe(7)
    for (const pl of placements) {
      const base = PIECES.find((p) => p.no === pl.no)!.points
      const target = ASSEMBLIES[0]!.targets.find((t) => t.no === pl.no)!.points
      expect(shapeSignature(base)).toBe(shapeSignature(target))
      expect(solveRigid(base, target)).not.toBeNull()
    }
  })
})

describe('七巧板拼法：③⑤两块板能拼成正方形 / 平行四边形 / 三角形（课本 p34）', () => {
  const keys = ['square2', 'parallelogram2', 'triangle2']
  for (const key of keys) {
    it(`${key}：用的两块板面积之和 = 目标图形面积（4+4=8）`, () => {
      const a = assemblyByKey(key)
      const sum = a.targets.reduce((s, t) => {
        const base = PIECES.find((p) => p.no === t.no)!.points
        expect(shapeSignature(base)).toBe(shapeSignature(t.points))
        return s + polygonArea(t.points)
      }, 0)
      expect(sum).toBeCloseTo(polygonArea(a.outline), 6)
      expect(sum).toBeCloseTo(8, 6)
    })

    it(`${key}：拼合后所有板的顶点都落在目标轮廓内或轮廓上；轮廓顶点都是某块板的顶点`, () => {
      const a = assemblyByKey(key)
      expect(piecesInsideOutline(a.targets, a.outline)).toBe(true)
      expect(outlineVerticesCovered(a.targets, a.outline)).toBe(true)
    })

    it(`${key}：拼合后既不重叠也不留空`, () => {
      const a = assemblyByKey(key)
      expect(coversExactly(a.targets, a.outline, 0.1).ok).toBe(true)
    })
  }

  it('③⑤拼成的正方形与④号板全等；平行四边形与⑥号板全等；三角形与⑦号板全等', () => {
    const sq = assemblyByKey('square2')
    const para = assemblyByKey('parallelogram2')
    const tri = assemblyByKey('triangle2')
    expect(polygonArea(sq.outline)).toBeCloseTo(polygonArea(PIECES[3]!.points), 6)
    expect(shapeSignature(para.outline)).toBe(shapeSignature(PIECES[5]!.points))
    expect(shapeSignature(tri.outline)).toBe(shapeSignature(PIECES[6]!.points))
  })
})

describe('七巧板拼法：长方形（③⑤④）与和①一样大的三角形（③⑤⑦）', () => {
  it('长方形：三块板面积 4+4+8 = 目标面积 16，且拼合后轮廓顶点集合一致', () => {
    const a = assemblyByKey('rectangle345')
    const sum = a.targets.reduce((s, t) => s + polygonArea(t.points), 0)
    expect(sum).toBeCloseTo(polygonArea(a.outline), 6)
    expect(sum).toBeCloseTo(16, 6)
    expect(piecesInsideOutline(a.targets, a.outline)).toBe(true)
    expect(outlineVerticesCovered(a.targets, a.outline)).toBe(true)
    expect(coversExactly(a.targets, a.outline, 0.1).ok).toBe(true)
    // 长方形不是正方形：长宽比 2:1
    const [bl, br, tr, tl] = a.outline as [[number, number], [number, number], [number, number], [number, number]]
    const w = br[0] - bl[0]
    const h = tl[1] - bl[1]
    expect(w / h).toBeCloseTo(2, 6)
  })

  it('③⑤⑦ 拼成的三角形与①号板全等（面积 16、边长集合一致）', () => {
    const a = assemblyByKey('triangle357')
    const sum = a.targets.reduce((s, t) => s + polygonArea(t.points), 0)
    expect(sum).toBeCloseTo(polygonArea(a.outline), 6)
    expect(shapeSignature(a.outline)).toBe(shapeSignature(PIECES[0]!.points))
    expect(piecesInsideOutline(a.targets, a.outline)).toBe(true)
    expect(outlineVerticesCovered(a.targets, a.outline)).toBe(true)
    expect(coversExactly(a.targets, a.outline, 0.1).ok).toBe(true)
  })
})

describe('七巧板过程态：板子真的从原位置移动到了拼合位置', () => {
  it('t=0 时每块板都在原正方形位置', () => {
    const start = piecesAt(assemblyByKey('rectangle345'), 0)
    for (const pc of start) {
      expect(sameVertexSet(pc.points, PIECES.find((p) => p.no === pc.no)!.points)).toBe(true)
    }
  })

  it('t=1 时每块板都在目标位置，且与 t=0 明显不同（不是只换一句话）', () => {
    const asm = assemblyByKey('rectangle345')
    const start = piecesAt(asm, 0)
    const end = piecesAt(asm, 1)
    for (const pc of end) {
      expect(sameVertexSet(pc.points, asm.targets.find((t) => t.no === pc.no)!.points)).toBe(true)
    }
    const moved = end.filter((pc, i) => !sameVertexSet(pc.points, start[i]!.points))
    expect(moved.length).toBe(3)
  })

  it('t=0.5 处于中间状态：既不在原位也不在目标位（过程可见）', () => {
    const asm = assemblyByKey('square2')
    const mid = piecesAt(asm, 0.5)
    const start = piecesAt(asm, 0)
    const end = piecesAt(asm, 1)
    for (let i = 0; i < mid.length; i++) {
      expect(sameVertexSet(mid[i]!.points, start[i]!.points)).toBe(false)
      expect(sameVertexSet(mid[i]!.points, end[i]!.points)).toBe(false)
    }
    // 中间态仍是刚性变换：面积不变
    for (let i = 0; i < mid.length; i++) {
      expect(polygonArea(mid[i]!.points)).toBeCloseTo(polygonArea(start[i]!.points), 6)
    }
  })
})
