/**
 * 五年级 c1（图形的运动）+ c8（观察物体）新增可操作环节的组件测试。
 *
 * 对应重点概念（`docs/research/五六年级例题重点概念清单.md`）：
 * - 平移：每一组对应点之间的距离都相等 → 「换一组对应点」轮换高亮，读数恒等于平移格数；
 * - 旋转：OA′ = OA、对应点转过同一个角度 → 「一步一步转（+15°）」与「量一量 OA 与 OA′」；
 * - 轴对称：对应点到对称轴的距离相等 → 「标出对应点到对称轴的距离」（左右成对，换轴自动重算）；
 * - 观察物体：三视图与摆法相互确定、同一视图可由不同摆法得到 → 「换一种摆法」与「只看当前方向」。
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import MotionLab from '@/components/labs/MotionLab.vue'
import Views3DLab from '@/components/labs/Views3DLab.vue'
import { findLabById } from '@data'

vi.mock('three', () => {
  class MockGroup {
    children: unknown[] = []
    add(o: unknown) {
      this.children.push(o)
    }
    clear() {
      this.children = []
    }
  }
  class MockVector3 {
    x: number
    y: number
    z: number

    constructor(x = 0, y = 0, z = 0) {
      this.x = x
      this.y = y
      this.z = z
    }

    clone() {
      return new MockVector3(this.x, this.y, this.z)
    }

    copy(v: { x: number; y: number; z: number }) {
      this.x = v.x
      this.y = v.y
      this.z = v.z
      return this
    }

    set(x: number, y: number, z: number) {
      this.x = x
      this.y = y
      this.z = z
      return this
    }
  }

  class MockObject3D {
    position = new MockVector3()
    add(..._items: unknown[]) {}
  }

  return {
    Vector3: MockVector3,
    Group: MockGroup,
    Scene: class extends MockObject3D { background: unknown = null },
    Color: class { constructor(_value: number) {} },
    PerspectiveCamera: class extends MockObject3D {
      aspect: number

      constructor(_fov: number, aspect: number, _near: number, _far: number) {
        super()
        this.aspect = aspect
      }

      updateProjectionMatrix() {}
      lookAt(_target: unknown) {}
    },
    WebGLRenderer: class {
      domElement = document.createElement('canvas')

      constructor(_opts?: unknown) {}
      setPixelRatio(_ratio: number) {}
      setSize(_width: number, _height: number) {}
      render(_scene: unknown, _camera: unknown) {}
      dispose() {}
    },
    AmbientLight: class extends MockObject3D { constructor(_c: number, _i: number) { super() } },
    DirectionalLight: class extends MockObject3D { constructor(_c: number, _i: number) { super() } },
    GridHelper: class extends MockObject3D { constructor(_s: number, _d: number, _c1: number, _c2: number) { super() } },
    BoxGeometry: class { constructor(_w: number, _h: number, _d: number) {} },
    MeshStandardMaterial: class { constructor(_opts: unknown) {} },
    Mesh: class extends MockObject3D { constructor(_geo: unknown, _mat: unknown) { super() } },
    EdgesGeometry: class { constructor(_geo: unknown) {} },
    LineSegments: class extends MockObject3D { constructor(_e: unknown, _m: unknown) { super() } },
    LineBasicMaterial: class { constructor(_opts: unknown) {} },
  }
})

vi.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    target = new (class {
      copy(_target: unknown) { return this }
    })()
    enableDamping = false
    dampingFactor = 0

    constructor(_camera: unknown, _domElement: unknown) {}
    update() {}
    dispose() {}
  },
}))

// 动画立即完成，便于断言动画结束态
vi.mock('animejs', () => ({
  animate: vi.fn((_target: unknown, cfg: { complete?: () => void; update?: () => void }) => {
    cfg.update?.()
    cfg.complete?.()
    return { cancel: vi.fn() }
  }),
}))

function stubBrowserRendering() {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
}

const btnWith = (wrapper: ReturnType<typeof mount>, text: string) =>
  wrapper.findAll('button').find((b) => b.text().includes(text))

/* ==================== 1. 平移：换一组对应点 ==================== */

describe('MotionLab 平移：「换一组对应点」轮换高亮，格数恒等于平移格数', () => {
  it('小船：A→A′ / B→B′ / C→C′ 轮换，读数等于 values.grid', async () => {
    const lab = findLabById('g5-c1-translate-boat')!
    const values = reactive<Record<string, number>>({ dir: 0, grid: 9, figure: 0 })
    const wrapper = mount(MotionLab, { props: { lab, values } })
    const readout = () => wrapper.find('.pair-readout').text()
    const btn = btnWith(wrapper, '换一组对应点')!

    // 初始高亮第 1 组 A→A′，读数 = 当前平移格数 9
    expect(readout()).toContain('A → A′')
    expect(readout()).toContain('相距 9 格')
    expect(wrapper.findAll('.pair-active')).toHaveLength(1)
    expect(wrapper.find('.pair-active').text()).toContain('A′')

    // 点一次换到第 2 组
    await btn.trigger('click')
    expect(readout()).toContain('B → B′')
    expect(readout()).toContain('相距 9 格')
    expect(wrapper.findAll('.pair-active')).toHaveLength(1)
    expect(wrapper.find('.pair-active').text()).toContain('B′')

    // 再点一次换到第 3 组
    await btn.trigger('click')
    expect(readout()).toContain('C → C′')
    expect(readout()).toContain('相距 9 格')
    expect(wrapper.find('.pair-active').text()).toContain('C′')

    // 三组循环：第 4 次回到 A→A′
    await btn.trigger('click')
    expect(readout()).toContain('A → A′')

    // 改平移格数后读数同步，仍等于当前格数
    values.grid = 3
    await nextTick()
    expect(readout()).toContain('相距 3 格')
    values.grid = 12
    await nextTick()
    expect(readout()).toContain('相距 12 格')
    expect(wrapper.text()).toContain('对应点 A → A′ 相距 12 格')
  })

  it('小鱼：同样是 3 组对应点，读数等于 values.grid', async () => {
    const lab = findLabById('g5-c1-translate-fish')!
    const values = reactive<Record<string, number>>({ dir: 0, grid: 4, figure: 1 })
    const wrapper = mount(MotionLab, { props: { lab, values } })
    expect(wrapper.findAll('.pt-original')).toHaveLength(3)
    expect(wrapper.find('.pair-readout').text()).toContain('相距 4 格')
    await btnWith(wrapper, '换一组对应点')!.trigger('click')
    expect(wrapper.find('.pair-readout').text()).toContain('B → B′')
    values.grid = 7
    await nextTick()
    expect(wrapper.find('.pair-readout').text()).toContain('相距 7 格')
  })

  it('空参数挂载：格数为 0 时不渲染读数，点按钮也不越界（防御分支）', async () => {
    const lab = findLabById('g5-c1-translate-boat')!
    const wrapper = mount(MotionLab, { props: { lab, values: {} } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.pair-readout').exists()).toBe(false)
    await btnWith(wrapper, '换一组对应点')!.trigger('click')
    await btnWith(wrapper, '换一组对应点')!.trigger('click')
    expect(wrapper.find('.pair-readout').exists()).toBe(false)
  })

  it('四个平移方向的图形都落在画布内（向左 / 向下不会画出格）', () => {
    const lab = findLabById('g5-c1-translate-boat')!
    for (const dir of [0, 1, 2, 3]) {
      const wrapper = mount(MotionLab, { props: { lab, values: { dir, grid: 9, figure: 0 } } })
      const [, , w, h] = wrapper
        .find('svg')
        .attributes('viewBox')!
        .split(' ')
        .map((s) => Number(s))
      expect(w).toBeGreaterThan(0)
      expect(h).toBeGreaterThan(0)
      for (const sel of ['.pt-original', '.pt-target']) {
        const circles = wrapper.findAll(sel)
        expect(circles.length, `dir=${dir} ${sel}`).toBe(3)
        for (const c of circles) {
          const cx = Number(c.attributes('cx'))
          const cy = Number(c.attributes('cy'))
          expect(cx, `dir=${dir} ${sel} cx`).toBeGreaterThanOrEqual(0)
          expect(cx, `dir=${dir} ${sel} cx`).toBeLessThanOrEqual(w!)
          expect(cy, `dir=${dir} ${sel} cy`).toBeGreaterThanOrEqual(0)
          expect(cy, `dir=${dir} ${sel} cy`).toBeLessThanOrEqual(h!)
        }
      }
    }
  })
})

/* ==================== 2. 旋转：一步一步转 + 量一量 ==================== */

describe('MotionLab 旋转：「一步一步转（每次 +15°）」与「量一量 OA 与 OA′」', () => {
  it('闸杆：每次步进严格 +15°，写回参数并同步角标签', async () => {
    const lab = findLabById('g5-c1-rotate-lever')!
    const values = reactive<Record<string, number>>({ angle: 90, dir: 0, figure: 2 })
    const wrapper = mount(MotionLab, { props: { lab, values } })
    expect(wrapper.find('.angle-label').text()).toContain('90°')

    for (let i = 1; i <= 4; i++) {
      const before = values.angle
      await btnWith(wrapper, '一步一步转')!.trigger('click')
      expect(values.angle).toBe(before + 15)
      expect(wrapper.find('.angle-label').text()).toContain(`${before + 15}°`)
      expect(wrapper.text()).toContain(`顺时针旋转 ${before + 15}°`)
    }
    expect(values.angle).toBe(150)

    // 到 360° 后按钮禁用，再点不再变化（避免转出范围）
    values.angle = 360
    await nextTick()
    const stepBtn = btnWith(wrapper, '一步一步转')!
    expect(stepBtn.attributes('disabled')).toBeDefined()
    await stepBtn.trigger('click')
    expect(values.angle).toBe(360)
  })

  it('闸杆：量一量 OA 与 OA′，两条线段长度文本相等且旋转后保持相等', async () => {
    const lab = findLabById('g5-c1-rotate-lever')!
    const values = reactive<Record<string, number>>({ angle: 90, dir: 0, figure: 2 })
    const wrapper = mount(MotionLab, { props: { lab, values } })

    // 按钮文案按旋转中心命名
    expect(btnWith(wrapper, '量一量 OA 与 OA′')).toBeDefined()
    expect(wrapper.find('.measure-panel').exists()).toBe(false)

    await btnWith(wrapper, '量一量 OA 与 OA′')!.trigger('click')
    expect(wrapper.find('.measure-panel').exists()).toBe(true)

    const rows = wrapper.findAll('.measure-row')
    expect(rows).toHaveLength(2) // OA、OB
    const pairsEqual = () =>
      wrapper
        .findAll('.measure-row')
        .map((row) => [parseFloat(row.find('.measure-from').text()), parseFloat(row.find('.measure-to').text())])
    expect(pairsEqual()).toEqual([
      [4, 4], // OA = OA′ = 4 格
      [2, 2], // OB = OB′ = 2 格
    ])
    expect(rows[0]!.text()).toContain('OA′')
    expect(rows[0]!.text()).toContain('4.0 格') // OA = 4 格
    expect(wrapper.find('.measure-conclusion').text()).toContain('都相等')
    // 图上同步描出 2 组 × 2 条线段
    expect(wrapper.findAll('.measure-seg')).toHaveLength(4)

    // 转过一个角度后仍然相等（旋转保距）
    await btnWith(wrapper, '一步一步转')!.trigger('click')
    expect(values.angle).toBe(105)
    for (const [from, to] of pairsEqual()) expect(from).toBe(to)

    // 收起后面板消失
    await btnWith(wrapper, '收起测量')!.trigger('click')
    expect(wrapper.find('.measure-panel').exists()).toBe(false)
  })

  it('三角形绕点 A：量一量的线名是 AB / AC，长度仍成对相等', async () => {
    const lab = findLabById('g5-c1-rotate-triangle')!
    const values = reactive<Record<string, number>>({ angle: 90, dir: 0, figure: 3 })
    const wrapper = mount(MotionLab, { props: { lab, values } })
    await btnWith(wrapper, '量一量 AB 与 AB′')!.trigger('click')
    expect(wrapper.findAll('.measure-row .measure-name').map((n) => n.text())).toEqual([
      'AB',
      'AB′',
      'AC',
      'AC′',
    ])
    for (const row of wrapper.findAll('.measure-row')) {
      expect(parseFloat(row.find('.measure-from').text())).toBe(parseFloat(row.find('.measure-to').text()))
    }
  })

  it('空参数挂载：默认 0°，步进一次到 15°（防御分支）', async () => {
    const lab = findLabById('g5-c1-rotate-lever')!
    const values = reactive<Record<string, number>>({})
    const wrapper = mount(MotionLab, { props: { lab, values } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.angle-label').exists()).toBe(false) // 0° 不画扇形
    await btnWith(wrapper, '一步一步转')!.trigger('click')
    expect(values.angle).toBe(15)
    expect(wrapper.find('.angle-label').text()).toContain('15°')
  })
})

/* ==================== 3. 轴对称：标出对应点到对称轴的距离 ==================== */

describe('MotionLab 轴对称：「标出对应点到对称轴的距离」左右成对且相等', () => {
  it('三个对称轴位置下距离都成对且相等，换位置自动重算', async () => {
    const lab = findLabById('g5-c1-axis-polygon')!
    const values = reactive<Record<string, number>>({ sym: 0, figure: 0 })
    const wrapper = mount(MotionLab, { props: { lab, values } })

    expect(btnWith(wrapper, '标出对应点到对称轴的距离')).toBeDefined()
    expect(wrapper.findAll('.axis-pair-left')).toHaveLength(0)
    await btnWith(wrapper, '标出对应点到对称轴的距离')!.trigger('click')
    // 开着距离标注时，改用成对标注（原来的单个距离标注让位）
    expect(wrapper.findAll('.axis-pair-left')).toHaveLength(2)
    expect(wrapper.findAll('.axis-pair-right')).toHaveLength(2)
    expect(wrapper.findAll('.corr-label')).toHaveLength(0)

    // 对称轴在 x=6 / 7 / 8：已画的一半顶点在 x=2.4 / 3.2
    const expected: Record<number, number[]> = { 0: [3.6, 2.8], 1: [4.6, 3.8], 2: [5.6, 4.8] }
    for (const sym of [0, 1, 2]) {
      values.sym = sym
      await nextTick()
      const left = wrapper.findAll('.axis-pair-left').map((n) => parseFloat(n.text()))
      const right = wrapper.findAll('.axis-pair-right').map((n) => parseFloat(n.text()))
      expect(left).toEqual(expected[sym])
      expect(right).toEqual(expected[sym]) // 左右成对相等
    }

    // 验证语同步写成对的距离
    expect(wrapper.find('.verify-line').text()).toContain('距离成对相等')
    expect(wrapper.find('.verify-line').text()).toContain('A/A′ 5.6 = 5.6 格')
    expect(wrapper.find('.verify-line').text()).toContain('B/B′ 4.8 = 4.8 格')

    // 开着距离标注时对折动画仍然可用（保留对折验证）
    await btnWith(wrapper, '对折验证')!.trigger('click')
    expect(wrapper.findAll('.pt-target')).toHaveLength(2)
    expect(wrapper.findAll('.axis-pair-right')).toHaveLength(2)

    // 收起后回到原来的单个距离标注（已对折 → 左右各 2 个）
    await btnWith(wrapper, '收起距离标注')!.trigger('click')
    expect(wrapper.findAll('.axis-pair-left')).toHaveLength(0)
    expect(wrapper.findAll('.corr-label')).toHaveLength(4)
  })

  it('空参数挂载：对称轴取默认位置，距离仍成对相等（防御分支）', async () => {
    const lab = findLabById('g5-c1-axis-polygon')!
    const wrapper = mount(MotionLab, { props: { lab, values: {} } })
    await btnWith(wrapper, '标出对应点到对称轴的距离')!.trigger('click')
    const left = wrapper.findAll('.axis-pair-left').map((n) => parseFloat(n.text()))
    const right = wrapper.findAll('.axis-pair-right').map((n) => parseFloat(n.text()))
    expect(left).toEqual([4.6, 3.8]) // sym 缺省 = 1 → 轴在 x=7
    expect(left).toEqual(right)
  })
})

/* ==================== 4. 观察物体：换一种摆法 / 单方向看 ==================== */

describe('Views3DLab：「换一种摆法」与「只看当前方向」', () => {
  it('三视图 Lab：换一种摆法后前面视图不变，右面 / 上面视图变了', async () => {
    stubBrowserRendering()
    const lab = findLabById('g5-c8-views3d-blocks')!
    const values = reactive<Record<string, number>>({ view: 0 })
    const wrapper = mount(Views3DLab, { props: { lab, values } })
    const cardFilled = (i: number) => wrapper.findAll('.proj-box')[i]!.findAll('.proj-cell.filled').length
    const frontBefore = cardFilled(0)
    const totalBefore = wrapper.findAll('.proj-cell.filled').length
    expect(frontBefore).toBe(4)
    expect(wrapper.find('.arrange-note').text()).toContain('基本摆法')

    await btnWith(wrapper, '换一种摆法')!.trigger('click')
    // 前面视图的格子完全没变（这就是「同一视图可由不同摆法得到」）
    expect(cardFilled(0)).toBe(frontBefore)
    // 右面 / 上面视图的格子变了
    expect(wrapper.findAll('.proj-cell.filled').length).not.toBe(totalBefore)
    const note = wrapper.find('.arrange-note').text()
    expect(note).toContain('换了一种摆法')
    expect(note).toContain('前面看到的图形不变')
    expect(note).toContain('右面、上面看到的图形变了')
    expect(wrapper.find('.arrange-tag').text()).toContain('2 / 2')
    wrapper.unmount()
  })

  it('移动正方体 Lab：换一种摆法后右面视图不变，上面视图变了', async () => {
    stubBrowserRendering()
    const lab = findLabById('g5-c8-views3d-move')!
    const values = reactive<Record<string, number>>({ view: 1 })
    const wrapper = mount(Views3DLab, { props: { lab, values } })
    const cellsOf = (i: number) =>
      wrapper
        .findAll('.proj-box')[i]!
        .findAll('.proj-cell.filled')
        .map((c) => `${c.attributes('x')},${c.attributes('y')}`)
        .join('|')
    const frontBefore = cellsOf(0)
    const rightBefore = cellsOf(1)
    const topBefore = cellsOf(2)

    await btnWith(wrapper, '换一种摆法')!.trigger('click')
    expect(cellsOf(0)).toBe(frontBefore) // 前面视图不变
    expect(cellsOf(1)).toBe(rightBefore) // 右面视图不变（课本要求"使从右面看到的图形不变"）
    expect(cellsOf(2)).not.toBe(topBefore) // 上面视图变了
    const note = wrapper.find('.arrange-note').text()
    expect(note).toContain('前面、右面看到的图形不变')
    expect(note).toContain('上面看到的图形变了')
    wrapper.unmount()
  })

  it('「只看当前方向」与「三方向同屏对照」切换', async () => {
    stubBrowserRendering()
    const lab = findLabById('g5-c8-views3d-blocks')!
    const values = reactive<Record<string, number>>({ view: 0 })
    const wrapper = mount(Views3DLab, { props: { lab, values } })
    expect(wrapper.findAll('.proj-box')).toHaveLength(3)

    await btnWith(wrapper, '只看当前方向')!.trigger('click')
    expect(wrapper.findAll('.proj-box')).toHaveLength(1)
    expect(wrapper.find('.proj-box.active').text()).toContain('前面')

    await btnWith(wrapper, '三方向同屏对照')!.trigger('click')
    expect(wrapper.findAll('.proj-box')).toHaveLength(3)
    expect(wrapper.findAll('.proj-cell')).toHaveLength(48)
    wrapper.unmount()
  })

  it('空参数挂载：默认从前面看、三方向对照（防御分支）', () => {
    stubBrowserRendering()
    const lab = findLabById('g5-c8-views3d-blocks')!
    const wrapper = mount(Views3DLab, { props: { lab, values: {} } })
    expect(wrapper.findAll('.proj-box')).toHaveLength(3)
    expect(wrapper.find('.view-guide').text()).toContain('当前观察方向：前面')
    wrapper.unmount()
  })
})
