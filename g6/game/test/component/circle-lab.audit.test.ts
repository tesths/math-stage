/**
 * CircleLab 审计附录 A 逐条销项测试
 *
 * 对应 `docs/audit/g6-circle-ratio-audit.md` 附录 A 中与 `CircleLab.vue` 有关的条目：
 * C1-1 / C1-2 / C2-2 / C2-3 / C3-2 / C3-3 / C3-4 / C4-2 / C4-3 / C4-4 / C4-5 /
 * C5-2 / C5-3 / C5-4 / C6-2 / C6-3 / C6-4。
 *
 * 断言的取向是「形变与数变同帧」：图形的坐标、份数、比例尺必须与同一帧的
 * 数值、单位一致，所以这里同时锁住几何量（圆的半径、楔形齿宽、锯齿幅度）
 * 与文案（分数、单位、比例尺说明）。
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CircleLab from '@/components/labs/CircleLab.vue'
import { findLabById } from '@data'
import type { LabDef } from '@data/schema/lab'

function labOf(id: string): LabDef {
  const lab = findLabById(id)
  if (!lab) throw new Error(`找不到 Lab：${id}`)
  return lab
}

function mountLab(id: string, values: Record<string, number>) {
  return mount(CircleLab, { props: { lab: labOf(id), values } })
}

/** 从楔形 path 里取几何量：apexY = 顶点 y，chordY = 弦的 y，leftX = 左侧点 x */
function wedgeGeometry(d: string) {
  const m = d.match(/^M ([-\d.]+) ([-\d.]+) L ([-\d.]+) ([-\d.]+) A ([\d.]+) ([\d.]+) 0 0 ([01])/)
  if (!m) throw new Error(`不是楔形路径：${d}`)
  return {
    cx: Number(m[1]),
    apexY: Number(m[2]),
    leftX: Number(m[3]),
    chordY: Number(m[4]),
    radius: Number(m[5]),
    sweep: Number(m[7]),
  }
}

/** 圆面积 Lab 右图（第二个 <g>）里拼合的楔形 */
function wedgesOf(slices: number, r = 5) {
  const w = mountLab('g6-c5-circle-area', { r, slices })
  const groups = w.findAll('svg g')
  expect(groups).toHaveLength(2) // 左：等分圆；右：剪拼
  return { wrapper: w, group: groups[1]!, paths: groups[1]!.findAll('path') }
}

describe('CircleLab 审计销项 · 认识圆', () => {
  it('C1-1：circle-feature 的圆按自适应比例尺绘制，r=8 也不再被上下裁切、箭头可见', () => {
    for (const r of [1, 2, 4, 8]) {
      const w = mountLab('g6-c5-circle-feature', { r })
      const circle = w.find('circle.circle-outline')
      const cy = Number(circle.attributes('cy'))
      const rr = Number(circle.attributes('r'))
      expect(cy).toBe(120)
      // 圆完整落在 0..240 的视口里（旧代码 r=8 → crPx=128 → 纵向 [-8,248] 被裁）
      expect(cy - rr).toBeGreaterThanOrEqual(0)
      expect(cy + rr).toBeLessThanOrEqual(240)
      // 三条半径线（含带箭头的竖直半径）两端也在视口内（视口 340×240）
      const radiusLines = w.findAll('line.line-radius')
      expect(radiusLines).toHaveLength(3)
      for (const l of radiusLines) {
        for (const attr of ['y1', 'y2']) {
          const v = Number(l.attributes(attr))
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(240)
        }
        for (const attr of ['x1', 'x2']) {
          const v = Number(l.attributes(attr))
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(340)
        }
      }
    }
    // r=8 → 比例尺收窄到 100/8=12.5，crPx=100（不再是 128）
    const w8 = mountLab('g6-c5-circle-feature', { r: 8 })
    expect(Number(w8.find('circle.circle-outline').attributes('r'))).toBeCloseTo(100, 5)
  })

  it('C1-2：circle-feature 画出过圆心的虚线对称轴，并说明“无数条对称轴”', () => {
    const w = mountLab('g6-c5-circle-feature', { r: 4 })
    const axes = w.findAll('line.line-axis')
    expect(axes.length).toBeGreaterThanOrEqual(2)
    for (const a of axes) {
      expect(a.attributes('stroke-dasharray')).toBeTruthy()
      // 每条都是过圆心的直线（中点 = 圆心）
      expect((Number(a.attributes('x1')) + Number(a.attributes('x2'))) / 2).toBeCloseTo(170, 5)
      expect((Number(a.attributes('y1')) + Number(a.attributes('y2'))) / 2).toBeCloseTo(120, 5)
      // 是圆的直径长度（两端落在圆上）
      const half = Math.hypot(
        (Number(a.attributes('x1')) - Number(a.attributes('x2'))) / 2,
        (Number(a.attributes('y1')) - Number(a.attributes('y2'))) / 2,
      )
      expect(half).toBeCloseTo(Number(w.find('circle.circle-outline').attributes('r')), 5)
    }
    expect(w.text()).toContain('无数条对称轴')
  })
})

describe('CircleLab 审计销项 · 扇形', () => {
  it('C2-2：sector 的占比显示约分分数（1/12、1/8），不再是 0.08/0.13', () => {
    const w30 = mountLab('g6-c5-sector', { angle: 30, r: 5 })
    const line30 = w30.find('.res-line').text()
    expect(line30).toContain('30 ÷ 360')
    expect(line30).toContain('1/12')
    expect(line30).toContain('0.083')
    expect(line30).not.toContain('= 0.08')

    const w45 = mountLab('g6-c5-sector', { angle: 45, r: 5 })
    expect(w45.find('.res-line').text()).toContain('1/8')
    expect(w45.find('.res-line').text()).toContain('0.125')
    expect(w45.find('.res-line').text()).not.toContain('= 0.13')

    const w90 = mountLab('g6-c5-sector', { angle: 90, r: 5 })
    expect(w90.find('.res-line').text()).toContain('1/4')

    // 360° 就是整个圆
    const w360 = mountLab('g6-c5-sector', { angle: 360, r: 5 })
    expect(w360.find('.res-line').text()).toContain('1/1')
  })

  it('C2-3：sector 带半径 r 参数，并给出弧长、面积两条公式的数值与单位', () => {
    const lab = labOf('g6-c5-sector')
    const rParam = lab.params.find((p) => p.key === 'r')
    expect(rParam).toBeDefined()
    expect(rParam!.unit).toBe('厘米')
    expect(rParam!.min).toBeLessThanOrEqual(5)
    expect(rParam!.max).toBeGreaterThanOrEqual(5)

    const w = mountLab('g6-c5-sector', { angle: 90, r: 5 })
    const line = w.find('.res-line').text()
    expect(line).toContain('弧长')
    expect(line).toContain('7.85') // 2×3.14×5×(90/360)
    expect(line).toContain('厘米')
    expect(line).toContain('面积')
    expect(line).toContain('19.63') // 3.14×5²×(90/360)
    expect(line).toContain('平方厘米')
    // r 变化时数值同步变化（形变与数变同帧）
    const w8 = mountLab('g6-c5-sector', { angle: 90, r: 8 })
    expect(w8.find('.res-line').text()).toContain('12.56') // 2×3.14×8×(1/4)
    expect(w8.find('.res-line').text()).toContain('50.24') // 3.14×8²×(1/4)
    expect(w8.text()).toContain('r = 8 厘米')
  })
})

describe('CircleLab 审计销项 · 圆的周长', () => {
  it('C3-2：circumference 给出比例尺说明，图内不再把 px 当长度标注', () => {
    const w = mountLab('g6-c5-circumference', { r: 14 })
    const scale = w.find('.scale-line').text()
    expect(scale).toContain('比例尺')
    expect(scale).toContain('1 米 ≈ 2.2')
    expect(scale).toContain('px')
    // SVG 图内的所有长度文字都用米，没有一处 px
    const svgTextsWithPx = w.findAll('svg text').filter((t) => t.text().includes('px'))
    expect(svgTextsWithPx).toHaveLength(0)
    // 比例尺与实际图形一致：图上周长 = 2π×图上半径
    const roll = w.find('circle.circle-roll')
    expect(Number(roll.attributes('r'))).toBeGreaterThan(0)
  })

  it('C3-3：circumference 有 3 行绕绳/滚圆测量表，三行 C ÷ d 都是 3.14', () => {
    const w = mountLab('g6-c5-circumference', { r: 14 })
    const table = w.find('.measure-table')
    expect(table.exists()).toBe(true)
    const rows = table.findAll('tbody tr')
    expect(rows).toHaveLength(3)
    expect(rows.map((row) => row.findAll('td').map((td) => td.text()))).toEqual([
      ['14', '28', '87.92', '3.14'],
      ['28', '56', '175.84', '3.14'],
      ['42', '84', '263.76', '3.14'],
    ])
    // 表头带单位
    expect(table.findAll('thead th').map((th) => th.text())).toEqual(['半径 r / 米', '直径 d / 米', '周长 C / 米', 'C ÷ d'])
    // 换一个半径，表格同步（仍是三个大小不同的圆，比值不变）
    const w6 = mountLab('g6-c5-circumference', { r: 6 })
    const rows6 = w6.find('.measure-table').findAll('tbody tr')
    expect(rows6.map((row) => row.findAll('td').map((td) => td.text()))).toEqual([
      ['6', '12', '37.68', '3.14'],
      ['12', '24', '75.36', '3.14'],
      ['18', '36', '113.04', '3.14'],
    ])
  })

  it('C3-4：circumference 任意 r（含 r≥17、r=30）滚动圆都不被顶部裁切', () => {
    for (const r of [1, 14, 17, 30]) {
      const w = mountLab('g6-c5-circumference', { r })
      const roll = w.find('circle.circle-roll')
      const cy = Number(roll.attributes('cy'))
      const rr = Number(roll.attributes('r'))
      expect(cy - rr).toBeGreaterThanOrEqual(0)
      expect(cy + rr).toBeLessThanOrEqual(220)
    }
  })
})

describe('CircleLab 审计销项 · 圆的面积', () => {
  it('C4-2：circle-area 右图是 n/2 组上下交错的扇形齿（真弧），齿宽 = 2·总宽/n', () => {
    const { group, paths } = wedgesOf(8)
    expect(paths).toHaveLength(8)
    const geometry = paths.map((p) => wedgeGeometry(p.attributes('d')!))
    // 上齿（弧在上，sweep=1）与下齿（弧在下，sweep=0）各 4 个，一一交错
    expect(geometry.filter((g) => g.sweep === 1)).toHaveLength(4)
    expect(geometry.filter((g) => g.sweep === 0)).toHaveLength(4)
    expect(geometry.map((g) => g.sweep)).toEqual([1, 0, 1, 0, 1, 0, 1, 0])
    // 每个齿都是扇形（顶点朝上/朝下 + 半径为 r 的圆弧），不是矩形砖块
    for (const g of geometry) expect(g.radius).toBeCloseTo(60, 5)
    expect(group.findAll('rect')).toHaveLength(1) // 只剩长方形的虚线参考框

    const ghost = group.find('rect.rect-ghost')
    const total = Number(ghost.attributes('width'))
    const n = 8
    // 齿宽 = 2·R·sin(π/n) = 2·总宽/n（旧代码只用总宽/n，齿宽差 2 倍）
    for (const g of geometry) {
      expect(2 * (g.cx - g.leftX)).toBeCloseTo((2 * total) / n, 1)
    }
    // 相邻齿的顶点交错半个齿宽
    expect(geometry[1]!.cx - geometry[0]!.cx).toBeCloseTo(total / n, 1)
  })

  it('C4-2 / C4-1：拼合图形的长宽用同一比例尺，64 份时长 ÷ 宽 ≈ π', () => {
    const { group } = wedgesOf(64)
    const ghost = group.find('rect.rect-ghost')
    const width = Number(ghost.attributes('width'))
    const height = Number(ghost.attributes('height'))
    expect(height).toBeCloseTo(60, 5) // 宽 = r
    expect(width / height).toBeCloseTo(Math.PI, 2) // 长 ≈ πr
  })

  it('C4-3：circle-area 的份数可取到课本的 64 份，并渲染 64 个齿', () => {
    const slicesParam = labOf('g6-c5-circle-area').params.find((p) => p.key === 'slices')!
    expect(slicesParam.max).toBeGreaterThanOrEqual(64)
    expect(slicesParam.default).toBeGreaterThanOrEqual(8)

    const { wrapper, paths } = wedgesOf(64)
    expect(paths).toHaveLength(64)
    expect(wrapper.text()).toContain('把圆平均分成 64 份')
    expect(wrapper.text()).toContain('份数 64')
    // 注：课本序列 8/16/32/64 的 min/step 由数据文件 c5.ts 的 slices 参数决定，
    // 组件侧只保证份数被正确取偶并渲染（见报告中的说明）。
  })

  it('C4-4：circle-area 锯齿幅度为 R(1−cos(π/n))，每翻倍约减到 1/4，不是写死的 6/3/1.5', () => {
    const radius = 60
    const sagitta = (n: number) => {
      const { paths } = wedgesOf(n)
      const g = wedgeGeometry(paths[0]!.attributes('d')!)
      return radius - (g.apexY - g.chordY) // R − R·cos(π/n)
    }
    for (const n of [8, 16, 32, 64]) {
      expect(sagitta(n)).toBeCloseTo(radius * (1 - Math.cos(Math.PI / n)), 1)
    }
    // 每翻一倍约减到 1/4（旧代码 6 → 3 → 1.5，只减半）
    expect(sagitta(8) / sagitta(16)).toBeCloseTo(4, 0)
    expect(sagitta(16) / sagitta(32)).toBeCloseTo(4, 0)
    expect(sagitta(16)).toBeLessThan(2) // 旧代码在 n=16 时是 3
    expect(sagitta(32)).toBeLessThan(0.5) // 旧代码在 n=32 时是 1.5
  })

  it('C4-5：circle-area“宽 = r”标签右对齐，不越出 360 宽的视口', () => {
    for (const n of [8, 32, 64]) {
      const { wrapper } = wedgesOf(n)
      const label = wrapper.findAll('text').find((t) => t.text().includes('宽 = r'))!
      expect(label.attributes('text-anchor')).toBe('end')
      const x = Number(label.attributes('x'))
      expect(x).toBeLessThanOrEqual(360)
      expect(x).toBeGreaterThan(300) // 贴在长方形右端，而不是被挤出视口
    }
  })
})

describe('CircleLab 审计销项 · 环形面积', () => {
  it('C5-2：annulus 内圆 ≥ 外圆时只给提示，不再打印负面积', () => {
    const bad = mountLab('g6-c5-annulus', { R: 5, r: 8 })
    expect(bad.text()).toContain('注意')
    expect(bad.text()).toContain('内圆半径 8 应小于外圆半径 5')
    expect(bad.find('.ring-stage').exists()).toBe(false)
    expect(bad.find('.res-line').exists()).toBe(false)
    expect(bad.text()).not.toContain('-122.46')
    expect(bad.text()).not.toContain('平方厘米')

    const eq = mountLab('g6-c5-annulus', { R: 6, r: 6 })
    expect(eq.find('.res-line').exists()).toBe(false)
    expect(eq.text()).not.toContain('S 环')

    // 合法参数下三张卡与结果行都在
    const good = mountLab('g6-c5-annulus', { R: 10, r: 6 })
    expect(good.findAll('.ring-card')).toHaveLength(3)
    expect(good.find('.res-line').text()).toContain('200.96')
    expect(good.find('.res-line').text()).toContain('环宽 R − r = 4 厘米')
  })

  it('C5-3：annulus 前两张卡假挖洞的填充色与卡片底色一致（--ui-bg-muted）', () => {
    const w = mountLab('g6-c5-annulus', { R: 10, r: 6 })
    const holes = w.findAll('circle.ring-hole')
    expect(holes).toHaveLength(2)
    for (const hole of holes) {
      expect(hole.attributes('fill')).toBe('var(--ui-bg-muted)')
      expect(hole.attributes('fill')).not.toBe('var(--ui-bg)')
    }
    // 内圆半径按 r/R 与挖空路径同比例（形变与数变同帧）
    const expected = (6 / 10) * 60
    for (const hole of holes) expect(Number(hole.attributes('r'))).toBeCloseTo(expected, 5)
  })

  it('C5-4：annulus 三张卡的面积都带单位“平方厘米”', () => {
    const w = mountLab('g6-c5-annulus', { R: 10, r: 6 })
    const tags = w.findAll('.ring-tag').map((t) => t.text())
    expect(tags).toHaveLength(3)
    for (const tag of tags) expect(tag).toContain('平方厘米')
    expect(tags[0]).toContain('S大 = πR² = 314')
    expect(tags[1]).toContain('S小 = πr² = 113.04')
    expect(tags[2]).toContain('S环 = 200.96 平方厘米')
  })
})

describe('CircleLab 审计销项 · 组合图形（窗户）', () => {
  it('C6-2：circle-composite 的半圆面积标注画在半圆内部，不在正方形里', () => {
    const w = mountLab('g6-c5-circle-composite', { side: 1.8 })
    const ty = 200 // <g transform="translate(170 200)">
    const sqPx = Number(w.find('rect').attributes('width'))
    const squareTop = ty - sqPx
    const semicircleTop = squareTop - sqPx / 2

    const semi = w.find('.semi-area-label')
    const semiY = ty + Number(semi.attributes('y'))
    expect(semi.attributes('text-anchor')).toBe('middle')
    expect(Number(semi.attributes('x'))).toBe(0)
    expect(semiY).toBeLessThan(squareTop) // 在正方形上边之上
    expect(semiY).toBeGreaterThan(semicircleTop) // 且落在半圆范围内
    expect(semi.text()).toContain('半圆 S = πr²÷2 = 1.27 平方米')

    // “半圆直径 = 正方形边长”标注在半圆上方
    const dia = w.findAll('text').find((t) => t.text().includes('半圆直径'))!
    expect(ty + Number(dia.attributes('y'))).toBeLessThan(semicircleTop)
    expect(dia.text()).toContain('半圆直径 = 正方形边长 = 1.8 米')
    expect(dia.text()).toContain('r = 0.9 米')
  })

  it('C6-3：circle-composite 任意 side（含 10）正方形与半圆都完整落在视口内', () => {
    for (const side of [1, 1.8, 5, 10]) {
      const w = mountLab('g6-c5-circle-composite', { side })
      const g = w.find('svg g')
      const ty = Number(g.attributes('transform')!.match(/translate\(([-\d.]+) ([-\d.]+)\)/)![2])
      const rect = w.find('rect')
      const sqPx = Number(rect.attributes('width'))
      const left = 170 + Number(rect.attributes('x'))
      const top = ty + Number(rect.attributes('y'))
      expect(sqPx).toBeGreaterThan(0)
      expect(top).toBeGreaterThanOrEqual(0) // 正方形顶部不被裁
      expect(top - sqPx / 2).toBeGreaterThanOrEqual(0) // 半圆顶也不被裁
      expect(left).toBeGreaterThanOrEqual(0)
      expect(left + sqPx).toBeLessThanOrEqual(340)
      // 半圆直径 = 正方形边长（弧两端就是正方形上边两端）
      const semi = w.find('path')
      const m = semi.attributes('d')!.match(/^M ([-\d.]+) [-\d.]+ A [\d.]+ [\d.]+ 0 0 1 ([-\d.]+) /)
      expect(Math.abs(Number(m![2]) - Number(m![1]))).toBeCloseTo(sqPx, 5)
    }
    // side=10 → 比例尺收窄到 120/10=12，sqPx=120（旧代码 46×10=460 远超视口）
    const w10 = mountLab('g6-c5-circle-composite', { side: 10 })
    expect(Number(w10.find('rect').attributes('width'))).toBeCloseTo(120, 5)
  })

  it('C6-4：circle-composite 面积标注不越界，并补出尺寸标注与周长式（带单位）', () => {
    const w = mountLab('g6-c5-circle-composite', { side: 1.8 })
    const ty = 200
    const sqPx = Number(w.find('rect').attributes('width'))

    // 正方形面积标注挪到图形下方居中，不再向右越出 340 宽的视口
    const sqArea = w.find('.sq-area-label')
    expect(sqArea.attributes('text-anchor')).toBe('middle')
    expect(Number(sqArea.attributes('x'))).toBe(0)
    expect(ty + Number(sqArea.attributes('y'))).toBeGreaterThan(ty)
    expect(sqArea.text()).toContain('正方形 1.8 × 1.8 = 3.24 平方米')

    // 边长尺寸标注在正方形右侧且不越界
    const sideLabel = w.find('.side-label')
    const sideRight = 170 + Number(sideLabel.attributes('x'))
    expect(sideRight + 8 * 8).toBeLessThanOrEqual(340) // “边长 1.8 米”约 8 字 × 8px
    expect(sideLabel.text()).toContain('边长 1.8 米')

    // 结果行补出周长式：3 条边 + 半圆弧 = 1.8 × (3 + π/2) = 8.226 米
    const line = w.find('.res-line').text()
    expect(line).toContain('4.51')
    expect(line).toContain('平方米')
    expect(line).toContain('周长')
    expect(line).toContain('8.226')
    expect(line).toContain('米')
    expect(sqPx).toBeCloseTo(1.8 * 46, 5)
    // side=2 时面积不变（回归保护：5.57 平方米）
    const w2 = mountLab('g6-c5-circle-composite', { side: 2 })
    expect(w2.find('.res-line').text()).toContain('5.57')
    expect(w2.find('.res-line').text()).toContain('9.14') // 2×(3+1.57)
  })
})
