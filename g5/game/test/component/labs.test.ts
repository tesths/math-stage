import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AreaLab from '@/components/labs/AreaLab.vue'
import FormulaLab from '@/components/labs/FormulaLab.vue'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import PinboardLab from '@/components/labs/PinboardLab.vue'
import Views3DLab from '@/components/labs/Views3DLab.vue'
import MotionLab from '@/components/labs/MotionLab.vue'
import { labsOfChapter, findLabById } from '@data'

vi.mock('three', () => {
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
    AmbientLight: class extends MockObject3D { constructor(_color: number, _intensity: number) { super() } },
    DirectionalLight: class extends MockObject3D { constructor(_color: number, _intensity: number) { super() } },
    GridHelper: class extends MockObject3D { constructor(_size: number, _divisions: number, _color1: number, _color2: number) { super() } },
    BoxGeometry: class { constructor(_width: number, _height: number, _depth: number) {} },
    MeshStandardMaterial: class { constructor(_opts: unknown) {} },
    Mesh: class extends MockObject3D { constructor(_geo: unknown, _mat: unknown) { super() } },
    EdgesGeometry: class { constructor(_geo: unknown) {} },
    LineSegments: class extends MockObject3D { constructor(_edges: unknown, _mat: unknown) { super() } },
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

describe('Lab 组件渲染', () => {
  it('AreaLab：平行四边形默认参数渲染网格与公式', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, shape: 0 } },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.area-wrap').exists()).toBe(true)
    expect(wrapper.text()).toContain('底')
    // 改变参数后面积变化
    await wrapper.setProps({ values: { a: 8, h: 4, shape: 0 } })
    expect(wrapper.find('.area-value strong').text()).toContain('32')
  })

  it('AreaLab：三角形剪拼按钮点击后显示拼合结果，可重置', async () => {
    const lab = findLabById('g5-c3-area-triangle')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 8, h: 5, shape: 1 } },
    })
    expect(wrapper.text()).toContain('拼一拼')
    expect(wrapper.text()).toContain('两个完全一样的三角形：8 × 5 = 40')
    expect(wrapper.text()).toContain('一个三角形：40 ÷ 2 = 20')
    const cutBtn = wrapper.findAll('button').find((b) => b.text().includes('拼一拼'))
    expect(cutBtn).toBeDefined()
    await cutBtn!.trigger('click')
    // 复位按钮出现，点击后恢复
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    expect(resetBtn).toBeDefined()
    await resetBtn!.trigger('click')
  })

  it('AreaLab：平行四边形剪拼（runCut 滑移）后显示完成态（复位按钮）', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, shape: 0 } },
    })
    const cutBtn = wrapper.findAll('button').find((b) => b.text().includes('剪一剪'))
    expect(cutBtn).toBeDefined()
    await cutBtn!.trigger('click')
    // 平行四边形完成态：出现复位按钮（placed=true）
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    expect(resetBtn).toBeDefined()
  })

  it('AreaLab：梯形渲染（shape 2）', () => {
    const lab = findLabById('g5-c3-area-trapezoid')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 4, b: 7, h: 5, shape: 2 } },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('梯')
    expect(wrapper.text()).toContain('两个完全一样的梯形：(4 + 7) × 5 = 55')
    expect(wrapper.text()).toContain('一个梯形：55 ÷ 2 = 27.5')
  })

  it('MeasureLab：公顷用 10×10 网格连接到平方千米', () => {
    const lab = findLabById('g5-c3-hectare-square')!
    const wrapper = mount(MeasureLab, { props: { lab, values: { side: 100 } } })
    expect(wrapper.find('.km-grid').exists()).toBe(true)
    expect(wrapper.findAll('.km-cell')).toHaveLength(100)
    expect(wrapper.findAll('.km-cell.active')).toHaveLength(1)
    expect(wrapper.text()).toContain('1 平方千米')
    expect(wrapper.text()).toContain('100 公顷')
    expect(wrapper.text()).toContain('当前正方形约占 1 格')
  })

  it('PinboardLab：区分边界点、内部点并显示 Pick 公式', () => {
    const lab = findLabById('g5-pinboard-area')!
    const wrapper = mount(PinboardLab, { props: { lab, values: { shape: 0 } } })
    expect(wrapper.find('.pin-legend').exists()).toBe(true)
    expect(wrapper.text()).toContain('边上钉子 n：在多边形边上')
    expect(wrapper.text()).toContain('内部钉子 b：在多边形内部')
    expect(wrapper.text()).toContain('不计入：在图形外部')
    expect(wrapper.findAll('.pin-plain.boundary')).toHaveLength(16)
    expect(wrapper.findAll('.pin-plain.inside')).toHaveLength(8)
    expect(wrapper.find('.pick-formula').text()).toBe('S = 16 ÷ 2 + 8 − 1 = 15')
  })

  it('Views3DLab：固定三视图网格并标出当前观察方向', async () => {
    stubBrowserRendering()
    const lab = findLabById('g5-c8-views3d-blocks')!
    const wrapper = mount(Views3DLab, { props: { lab, values: { view: 0 } } })
    expect(wrapper.find('.view-guide').text()).toContain('当前观察方向：前面')
    expect(wrapper.text()).toContain('三视图固定，不随拖拽旋转')
    expect(wrapper.text()).toContain('宽 x 高')
    expect(wrapper.text()).toContain('深 x 高')
    expect(wrapper.text()).toContain('宽 x 深')
    expect(wrapper.findAll('.proj-box')).toHaveLength(3)
    expect(wrapper.findAll('.proj-cell')).toHaveLength(48)
    expect(wrapper.findAll('.proj-cell.filled')).toHaveLength(11)
    expect(wrapper.find('.proj-box.active').text()).toContain('前面')
    await wrapper.setProps({ values: { view: 1 } })
    expect(wrapper.find('.proj-box.active').text()).toContain('右面')
    wrapper.unmount()
  })

  it('MotionLab：平移显示对应点箭头和格数标尺', () => {
    const lab = findLabById('g5-c1-translate-boat')!
    const wrapper = mount(MotionLab, { props: { lab, values: { dir: 0, grid: 6 } } })
    expect(wrapper.find('.shape-original').exists()).toBe(true)
    expect(wrapper.find('.shape-target').exists()).toBe(true)
    expect(wrapper.find('.corr-points').exists()).toBe(true)
    expect(wrapper.find('.ruler').exists()).toBe(true)
    expect(wrapper.text()).toContain('6格')
    expect(wrapper.text()).toContain('向右平移 6 格')
  })

  it('MotionLab：旋转显示中心、角度扇形和弧形箭头', () => {
    const lab = findLabById('g5-c1-rotate-lever')!
    const wrapper = mount(MotionLab, { props: { lab, values: { angle: 90, dir: 0 } } })
    expect(wrapper.find('.pivot').exists()).toBe(true)
    expect(wrapper.find('.sector').exists()).toBe(true)
    expect(wrapper.find('.arc').exists()).toBe(true)
    expect(wrapper.text()).toContain('绕 O 点顺时针旋转 90°')
  })

  it('DecimalLab：小数点右移显示原数与结果行', () => {
    const lab = findLabById('g5-c4-dmul-paper')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { power: 2, base: 0.001 } } })
    expect(wrapper.find('.place-table').exists()).toBe(true)
    expect(wrapper.text()).toContain('原数')
    expect(wrapper.text()).toContain('结果')
    expect(wrapper.text()).toContain('小数点向右移动 2 位')
    expect(wrapper.text()).toContain('结果 0.1')
  })

  it('DecimalLab：小数点左移显示除法方向', () => {
    const lab = findLabById('g5-c4-ddiv-sugarcane')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { power: 3, base: 135, divide: 1 } } })
    expect(wrapper.find('.place-table').exists()).toBe(true)
    expect(wrapper.text()).toContain('小数点向左移动 3 位')
    expect(wrapper.text()).toContain('结果 0.135')
  })

  it('FormulaLab：青蛙歌数量（≤20 只全部渲染）', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 3 } } })
    expect(wrapper.text()).toContain('张嘴')
    expect(wrapper.text()).toContain('6')
  })

  it('FormulaLab：青蛙歌超过 20 只显示省略与总数', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 25 } } })
    expect(wrapper.text()).toContain('…共 25 只')
    // 只渲染 20 只（frogs 截断）
    expect(wrapper.findAll('.frog-item').length).toBeLessThanOrEqual(20)
  })

  it('FormulaLab：正方形周长面积（square）', () => {
    const lab = findLabById('g5-c7-square-formula')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { a: 5 } } })
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('25')
  })

  it('FormulaLab：速度路程（speed）', () => {
    const lab = findLabById('g5-c7-speed-car')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { v: 15, t: 3 } } })
    expect(wrapper.text()).toContain('45')
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })
})
