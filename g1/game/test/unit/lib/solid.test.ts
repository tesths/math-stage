import { describe, expect, it } from 'vitest'
import { SOLID_FACTS, faceSteps, totalFaces } from '@/lib/engine/solid'

describe('立体图形事实与「数面」过程', () => {
  it('长方体：6 个平面、0 曲面、8 个顶点，一个一个数正好数 6 步', () => {
    const f = SOLID_FACTS['长方体']
    expect(f.flatFaces).toBe(6)
    expect(f.curvedFaces).toBe(0)
    expect(f.corners).toBe(8)
    expect(faceSteps('长方体').length).toBe(6)
    expect(totalFaces('长方体')).toBe(6)
  })

  it('正方体：6 个面一样大、8 个顶点', () => {
    expect(SOLID_FACTS['正方体'].flatFaces).toBe(6)
    expect(SOLID_FACTS['正方体'].corners).toBe(8)
    expect(faceSteps('正方体').every((s) => s.kind === '平面')).toBe(true)
  })

  it('圆柱：2 个圆面 + 1 个曲面（曲面不能算成平面）', () => {
    const f = SOLID_FACTS['圆柱']
    expect(f.flatFaces).toBe(2)
    expect(f.curvedFaces).toBe(1)
    expect(totalFaces('圆柱')).toBe(3)
    const kinds = faceSteps('圆柱').map((s) => s.kind)
    expect(kinds).toEqual(['平面', '平面', '曲面'])
  })

  it('球：没有平面，只有 1 个曲面', () => {
    const f = SOLID_FACTS['球']
    expect(f.flatFaces).toBe(0)
    expect(f.curvedFaces).toBe(1)
    expect(totalFaces('球')).toBe(1)
    expect(faceSteps('球')[0]!.kind).toBe('曲面')
  })

  it('滚动方式写对了：球任意方向、圆柱只顺一个方向、长方体推着走', () => {
    expect(SOLID_FACTS['球'].roll).toContain('哪个方向都能滚')
    expect(SOLID_FACTS['圆柱'].roll).toContain('只能顺着一个方向')
    expect(SOLID_FACTS['长方体'].roll).toContain('不能滚')
  })

  it('每个面的编号从 1 连续排到 n（数面的过程不能跳号）', () => {
    for (const name of ['长方体', '正方体', '圆柱', '球']) {
      expect(faceSteps(name).map((s) => s.no)).toEqual(
        Array.from({ length: totalFaces(name) }, (_, i) => i + 1),
      )
    }
  })
})
