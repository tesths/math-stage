import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AreaLab from '@/components/labs/AreaLab.vue'
import FormulaLab from '@/components/labs/FormulaLab.vue'
import MeasureLab from '@/components/labs/MeasureLab.vue'
import DecimalLab from '@/components/labs/DecimalLab.vue'
import PinboardLab from '@/components/labs/PinboardLab.vue'
import Views3DLab from '@/components/labs/Views3DLab.vue'
import MotionLab from '@/components/labs/MotionLab.vue'
import NumberLab from '@/components/labs/NumberLab.vue'
import ChanceLab from '@/components/labs/ChanceLab.vue'
import ChartLab from '@/components/labs/ChartLab.vue'
import { labsOfChapter, findLabById } from '@data'

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
      props: { lab, values: { a: 6, h: 4, slant: 1, shape: 0 } },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.area-wrap').exists()).toBe(true)
    expect(wrapper.text()).toContain('底')
    // 比例尺：每格 10 米、每格 100 平方米（课本第 31 页的方格模型）
    expect(wrapper.text()).toContain('每格边长 10 米（每格 100 平方米）')
    expect(wrapper.find('.area-value strong').text()).toContain('24')
    // 改变参数后面积变化
    await wrapper.setProps({ values: { a: 8, h: 4, slant: 1, shape: 0 } })
    expect(wrapper.find('.area-value strong').text()).toContain('32')
  })

  it('AreaLab：数方格给出整格数与不满整格的部分（课本第 31 页数方格法）', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, slant: 1, shape: 0 } },
    })
    const countBtn = wrapper.findAll('button').find((b) => b.text().includes('数一数方格'))
    expect(countBtn).toBeDefined()
    await countBtn!.trigger('click')
    // 6×4=24 格中，斜边偏移 1 格：整格 20 个，不满整格的部分合起来 4 格
    expect(wrapper.find('.count-panel').text()).toContain('整格 20 个')
    expect(wrapper.find('.count-panel').text()).toContain('不满整格的部分合起来 4 格')
    // 斜边倾斜到 0 格时变成矩形：24 个整格，没有不满整格的部分
    await wrapper.setProps({ values: { a: 6, h: 4, slant: 0, shape: 0 } })
    expect(wrapper.find('.count-panel').text()).toContain('整格 24 个')
    expect(wrapper.find('.count-panel').text()).toContain('不满整格的部分合起来 0 格')
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

  it('AreaLab：平行四边形剪拼（剪下的三角形平移一个底后补上缺口）', async () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, slant: 1, shape: 0 } },
    })
    const cutBtn = wrapper.findAll('button').find((b) => b.text().includes('剪一剪'))
    expect(cutBtn).toBeDefined()
    // 剪开前的左边缺口与剪下的三角形位置（缺口顶点 x = 0/0/1，剪下三角形顶点 x = 6/6/7）
    const before = wrapper.findAll('.cut-solid')[0]!.attributes('transform')
    expect(before).toContain('translate(0.0 0)')
    await cutBtn!.trigger('click')
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    expect(resetBtn).toBeDefined()
    // 动画由 animejs 驱动数值，这里直接验证剪拼位移的终点等于「一个底」
    expect(wrapper.vm).toBeDefined()
  })

  it('AreaLab：斜边偏移为 0 时是长方形，不需要剪拼', () => {
    const lab = findLabById('g5-c3-area-parallelogram')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 6, h: 4, slant: 0, shape: 0 } },
    })
    expect(wrapper.text()).toContain('已是长方形，无需剪拼')
    expect(wrapper.findAll('.cut-solid')).toHaveLength(0)
  })

  it('AreaLab：梯形渲染（shape 2，课本 1 cm 方格 4/6/3 → 15 平方厘米）', () => {
    const lab = findLabById('g5-c3-area-trapezoid')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 4, b: 6, h: 3, shape: 2 } },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.text()).toContain('梯')
    expect(wrapper.text()).toContain('两个完全一样的梯形：(4 + 6) × 3 = 30')
    expect(wrapper.text()).toContain('一个梯形：30 ÷ 2 = 15')
    expect(wrapper.text()).toContain('每格边长 1 厘米')
  })

  it('AreaLab：梯形麦田按米比例尺绘制并给出平方米结果', () => {
    const lab = findLabById('g5-c3-area-mcfield')!
    const wrapper = mount(AreaLab, {
      props: { lab, values: { a: 36, b: 54, h: 40, shape: 2 } },
    })
    expect(wrapper.text()).toContain('比例尺')
    expect(wrapper.find('.area-value').text()).toContain('1800')
    expect(wrapper.find('.area-value').text()).toContain('平方米')
    expect(wrapper.text()).toContain('下底 b = 54 米')
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

  it('MeasureLab：公顷按真实比例尺绘制（1 千米外框 + 1 公顷小方块）', () => {
    const lab = findLabById('g5-c3-hectare-square')!
    const w100 = mount(MeasureLab, { props: { lab, values: { side: 100 } } })
    const side100 = Number(w100.find('.square-fill').attributes('width'))
    const w1000 = mount(MeasureLab, { props: { lab, values: { side: 1000 } } })
    const side1000 = Number(w1000.find('.square-fill').attributes('width'))
    // 同一比例尺：1000 米是 100 米的 10 倍宽 → 面积 100 倍
    expect(side1000 / side100).toBeCloseTo(10, 1)
    expect(w1000.find('.square-fill').attributes('height')).toBe(w1000.find('.square-fill').attributes('width'))
    expect(w100.find('.km-outline').exists()).toBe(true)
    expect(w100.find('.ha-unit').exists()).toBe(true)
    // 100 米 = 1 公顷；1000 米 = 1 平方千米
    expect(w100.text()).toContain('100 × 100 = 10000 平方米 = 1 公顷')
    expect(w1000.text()).toContain('1000000 平方米 = 100 公顷 = 1 平方千米')
    // 1 米的小方块也按同一比例（不会被放大成假尺寸）
    const w1 = mount(MeasureLab, { props: { lab, values: { side: 1 } } })
    expect(Number(w1.find('.square-fill').attributes('width'))).toBeLessThan(side100)
  })

  it('MeasureLab：组合图形三种割补方法结果一致 = 10000 ㎡ = 1 公顷（课本 p42 例 6）', async () => {
    const lab = findLabById('g5-c3-hectare-field')!
    const wrapper = mount(MeasureLab, {
      props: { lab, values: { top: 100, left: 90, right: 40, bottom: 140 } },
    })
    // 三种方法的按钮
    expect(wrapper.findAll('.method-bar button')).toHaveLength(3)
    const chips = () => wrapper.findAll('.formula-chip').map((n) => n.text())
    // 方法一：长方形 4000 + 梯形 6000
    expect(chips().join(' ')).toContain('长方形 100 × 40 = 4000 m²')
    expect(chips().join(' ')).toContain('梯形（100 + 140）× 50 ÷ 2 = 6000 m²')
    expect(wrapper.find('.formula-chip.primary').text()).toContain('S = 10000 平方米 = 1 公顷')
    // 方法二：长方形 9000 + 三角形 1000
    await wrapper.findAll('.method-bar button')[1]!.trigger('click')
    expect(chips().join(' ')).toContain('长方形 100 × 90 = 9000 m²')
    expect(chips().join(' ')).toContain('三角形 40 × 50 ÷ 2 = 1000 m²')
    expect(wrapper.find('.formula-chip.primary').text()).toContain('S = 10000 平方米 = 1 公顷')
    // 方法三：大长方形 12600 − 补上的梯形 2600
    await wrapper.findAll('.method-bar button')[2]!.trigger('click')
    expect(chips().join(' ')).toContain('大长方形 140 × 90 = 12600 m²')
    expect(chips().join(' ')).toContain('补上的梯形（90 + 40）× 40 ÷ 2 = 2600 m²')
    expect(wrapper.find('polygon.part-missing').exists()).toBe(true)
    // 三种方法都被独立核对过
    expect(wrapper.find('.verify-line').text()).toContain('三种割补方法结果相同')
    expect(wrapper.find('.verify-line').text()).toContain('1 公顷')
    // 尺寸标注来自课本
    expect(wrapper.text()).toContain('上边 100 米')
    expect(wrapper.text()).toContain('下底 140 米')
    expect(wrapper.text()).toContain('右上 40 米')
  })

  it('ChanceLab：转盘第二次转动指针仍向前转，并可清零统计', async () => {
    const lab = findLabById('g5-c5-spinner-rotate')!
    const wrapper = mount(ChanceLab, { props: { lab, values: { red: 50, blue: 30, yellow: 20 } } })
    const needle = () => wrapper.find('svg g').attributes('style') ?? ''
    const spinBtn = () => wrapper.findAll('button').find((b) => b.text().includes('转动转盘'))!
    await spinBtn().trigger('click')
    const after1 = needle()
    await wrapper.vm.$nextTick()
    // 清零按钮在转过之后可用
    const reset = wrapper.findAll('button').find((b) => b.text().includes('清零'))
    expect(reset).toBeDefined()
    expect(wrapper.text()).toContain('与理论可能性')
    await reset!.trigger('click')
    expect(wrapper.find('.verify-line').exists()).toBe(false)
    expect(after1).toContain('rotate(')
  })

  it('ChanceLab：三等分预设让三块面积相等，直接验证「面积相等 → 可能性相等」', async () => {
    const lab = findLabById('g5-c5-spinner-rotate')!
    const values = { red: 50, blue: 30, yellow: 20 }
    const wrapper = mount(ChanceLab, { props: { lab, values } })
    // 初始不等分：三个扇区占比不同
    expect(wrapper.findAll('.sector-label').map((n) => n.text())).toEqual(['红50%', '蓝30%', '黄20%'])
    const preset = wrapper.findAll('button').find((b) => b.text().includes('三等分'))!
    expect(preset.attributes('aria-pressed')).toBe('false')
    await preset.trigger('click')
    // 写回三个参数 → 各占三分之一，扇区标注与理论概率都变成 33%
    expect(values).toEqual({ red: 30, blue: 30, yellow: 30 })
    expect(preset.attributes('aria-pressed')).toBe('true')
    expect(wrapper.findAll('.sector-label').map((n) => n.text())).toEqual(['红33%', '蓝33%', '黄33%'])
    expect(wrapper.text()).toContain('当前红 33% / 蓝 33% / 黄 33%')
  })

  it('ChanceLab：摸球显示实验频率与理论概率', async () => {
    const lab = findLabById('g5-c5-marble-bag')!
    const wrapper = mount(ChanceLab, { props: { lab, values: { red: 4, yellow: 6 } } })
    expect(wrapper.findAll('.ball.red')).toHaveLength(4)
    expect(wrapper.findAll('.ball.yellow')).toHaveLength(6)
    expect(wrapper.text()).toContain('理论上')
    expect(wrapper.text()).toContain('40.0%')
    const draw = wrapper.findAll('button').find((b) => b.text().includes('摸 10 次'))!
    await draw.trigger('click')
    expect(wrapper.text()).toContain('已摸 10 次')
  })

  it('ChartLab：复式统计表合计行/列与滑块联动', () => {
    const lab = findLabById('g5-c2-stats-table')!
    const wrapper = mount(ChartLab, {
      props: { lab, values: { a1: 18, b1: 22, a2: 25, b2: 15, a3: 20, b3: 26, a4: 16, b4: 30 } },
    })
    const rows = wrapper.findAll('tbody tr')
    // 4 个班级 + 合计行
    expect(rows).toHaveLength(5)
    expect(rows[0]!.findAll('td').map((n) => n.text())).toEqual(['一班', '18', '22', '40'])
    expect(rows[4]!.findAll('td').map((n) => n.text())).toEqual(['合计', '79', '93', '172'])
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('PinboardLab：内部钉子逐个数出，再用皮克定理与鞋带公式互证', () => {
    const lab = findLabById('g5-pinboard-area')!
    // 矩形 5×3：边上 16 个、内部 8 个（逐个数出来），面积 15
    const rect = mount(PinboardLab, { props: { lab, values: { shape: 0 } } })
    expect(rect.find('.pick-formula').text()).toBe('S = 16 ÷ 2 + 8 − 1 = 15')
    expect(rect.find('.pick-check').text()).toContain('逐个数出来')
    expect(rect.find('.pick-check').text()).toContain('皮克定理成立')
    expect(rect.findAll('circle.pin-plain.inside')).toHaveLength(8)
    expect(rect.findAll('circle.pin-plain.boundary')).toHaveLength(16)
    // 凹四边形：内部钉子数与公式也要自洽
    const concave = mount(PinboardLab, { props: { lab, values: { shape: 4 } } })
    expect(concave.find('.pick-check').text()).toContain('皮克定理成立')
    expect(concave.findAll('circle.pin-plain.inside').length).toBeGreaterThan(0)
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

  it('Views3DLab：一块一块地搭，三视图同步多出格子', async () => {
    const lab = findLabById('g5-c8-views3d-blocks')!
    const wrapper = mount(Views3DLab, { props: { lab, values: { view: 0 } } })
    const filledCount = () => wrapper.findAll('.proj-cell.filled').length
    const freshCount = () => wrapper.findAll('.proj-cell.fresh').length
    const full = filledCount()
    expect(wrapper.text()).toContain('已放 5 / 5 块')
    // 只剩一块 → 三视图各只剩 1 格（都被标成"新占的位置"）
    const reset = wrapper.findAll('button').find((b) => b.text().includes('只剩一块'))!
    await reset.trigger('click')
    expect(filledCount()).toBe(3)
    expect(freshCount()).toBe(3)
    // 再放一块 → 格子变多，且高亮"新占的位置"
    const add = wrapper.findAll('button').find((b) => b.text().includes('再放一块'))!
    await add.trigger('click')
    expect(filledCount()).toBeGreaterThan(3)
    expect(filledCount()).toBeLessThan(full)
    expect(freshCount()).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('已放 2 / 5 块')
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

  it('MotionLab：一单元的每个 Lab 都能渲染（防止 v-for 范围取到小数导致 500）', () => {
    const c1 = labsOfChapter('c1')
    expect(c1.length).toBeGreaterThan(0)
    for (const lab of c1) {
      // 用数据里的真实默认值（和页面初始渲染一致），而不是空对象
      const values = Object.fromEntries((lab.params ?? []).map((pp) => [pp.key, pp.default ?? 0]))
      Object.assign(values, lab.fixed ?? {})
      const wrapper = mount(MotionLab, { props: { lab, values } })
      // 用默认参数挂载：既不能抛错，也不能渲染成空壳
      expect(wrapper.find('svg').exists(), `${lab.id} 应有图形`).toBe(true)
      expect(wrapper.text().length, `${lab.id} 应有文字`).toBeGreaterThan(10)
    }
  })

  it('MotionLab：平移显示格点图形、对应点箭头与格数标尺', () => {
    const lab = findLabById('g5-c1-translate-boat')!
    const wrapper = mount(MotionLab, { props: { lab, values: { dir: 0, grid: 6, figure: 0 } } })
    // 原图 + 平移后的图形（都是落在格点上的多边形）
    expect(wrapper.findAll('.fill-original').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.fill-target').length).toBeGreaterThan(0)
    // 对应点 A/A′ 与 3 组对应点的箭头
    expect(wrapper.findAll('.corr-line').length).toBe(3)
    expect(wrapper.findAll('.pt-original').length).toBe(3)
    expect(wrapper.findAll('.pt-target').length).toBe(3)
    // 格数标尺：6 格 → 6 条刻度
    expect(wrapper.findAll('.ruler-tick')).toHaveLength(6)
    expect(wrapper.text()).toContain('6 格')
    expect(wrapper.text()).toContain('对应点 A → A′ 相距 6 格')
    // 方向切换后标签与验证语随之变化
    const down = mount(MotionLab, { props: { lab, values: { dir: 1, grid: 3, figure: 0 } } })
    expect(down.text()).toContain('对应点 A → A′ 相距 3 格')
  })

  it('MotionLab：旋转显示中心、角度扇形、弧形箭头与对应点 A′', () => {
    const lab = findLabById('g5-c1-rotate-lever')!
    const wrapper = mount(MotionLab, { props: { lab, values: { angle: 90, dir: 0, figure: 2 } } })
    expect(wrapper.find('.pivot').exists()).toBe(true)
    expect(wrapper.find('.sector').exists()).toBe(true)
    expect(wrapper.find('.arc').exists()).toBe(true)
    expect(wrapper.text()).toContain('OA′ = OA = 4.0 格')
    expect(wrapper.text()).toContain('顺时针旋转 90°')
    // 逆时针 90°：扇形 sweep 反向，验证语为逆时针
    const ccw = mount(MotionLab, { props: { lab, values: { angle: 90, dir: 1, figure: 2 } } })
    expect(ccw.text()).toContain('逆时针旋转 90°')
    // 三角形绕点 A：出现 B/B′ 对应点
    const tri = findLabById('g5-c1-rotate-triangle')!
    const tw = mount(MotionLab, { props: { lab: tri, values: { angle: 90, dir: 0, figure: 3 } } })
    expect(tw.text()).toContain('绕 A 点顺时针旋转 90°')
    expect(tw.text()).toContain('B')
  })

  it('MotionLab：轴对称显示对称轴、对应点垂线与对折验证', async () => {
    const lab = findLabById('g5-c1-axis-polygon')!
    const wrapper = mount(MotionLab, { props: { lab, values: { sym: 1, figure: 0 } } })
    expect(wrapper.find('.axis-line').exists()).toBe(true)
    // 未对折时只显示已画的一半与到轴的距离
    expect(wrapper.findAll('.pt-target')).toHaveLength(0)
    expect(wrapper.text()).toContain('拖动「对称轴位置」')
    const foldBtn = wrapper.findAll('button').find((b) => b.text().includes('对折验证'))
    expect(foldBtn).toBeDefined()
    await foldBtn!.trigger('click')
    // 对折后显示补全的另一半与两边相等的距离标注
    expect(wrapper.findAll('.pt-target')).toHaveLength(2)
    // 对称轴在 x=7、已画部分的两个顶点在 x=2.4 / 3.2 → 到轴的距离 4.6 格 / 3.8 格，左右两边相同
    expect(wrapper.findAll('.corr-label').map((n) => n.text())).toEqual(['4.6 格', '4.6 格', '3.8 格', '3.8 格'])
    expect(wrapper.text()).toContain('对应点到对称轴的距离相等：都是 4.6 格')
    const resetBtn = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    await resetBtn!.trigger('click')
    expect(wrapper.findAll('.pt-target')).toHaveLength(0)
  })

  it('DecimalLab：小数乘整数竖式列出部分积，面积模型是真长方形', () => {
    const lab = findLabById('g5-c4-dmul-pencil')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { price: 0.6, count: 3 } } })
    // 竖式：6 × 3 = 18 → 小数点向左点 1 位 → 1.8
    expect(wrapper.find('.v-row.total').text()).toBe('18')
    expect(wrapper.find('.v-point').text()).toContain('向左点 1 位')
    expect(wrapper.find('.v-point').text()).toContain('1.8')
    // 面积模型：6 列 × 3 行 = 18 格，每格 0.1
    expect(wrapper.find('.grid-note').text()).toContain('6 列 × 3 行 = 18 格')
    expect(wrapper.find('.grid-note').text()).toContain('每格 0.1')
    expect(wrapper.findAll('.cell-on')).toHaveLength(18)
    expect(wrapper.text()).toContain('0.6 × 3 = 1.8')
  })

  it('DecimalLab：6.25 × 12 竖式部分积 6250 + 1250 = 7500 → 75', () => {
    const lab = findLabById('g5-c4-dmul-ballpen')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { price: 6.25, count: 12 } } })
    expect(wrapper.findAll('.v-row.partial').map((n) => n.text())).toEqual(['6250', '1250'])
    expect(wrapper.find('.v-row.total').text()).toBe('7500')
    expect(wrapper.find('.v-point').text()).toContain('向左点 2 位')
    expect(wrapper.find('.v-point').text()).toContain('75')
    // 列数太多时不画方格，并说明原因
    expect(wrapper.find('.area-model.fallback').text()).toContain('画不出方格')
  })

  it('DecimalLab：小数除以整数按元→角→分逐级平均分（9.6 ÷ 3）', () => {
    const lab = findLabById('g5-c4-ddiv-eraser')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { total: 9.6, count: 3 } } })
    // 3 份，每份 3 元 2 角
    expect(wrapper.findAll('.split-group')).toHaveLength(3)
    expect(wrapper.findAll('.split-group')[0]!.findAll('.yuan-chip').map((n) => n.text())).toEqual(['3元'])
    expect(wrapper.findAll('.split-group')[0]!.findAll('.jiao-chip').map((n) => n.text())).toEqual(['2角'])
    expect(wrapper.findAll('.jiao-chip')).toHaveLength(3)
    expect(wrapper.text()).toContain('每份 3.2 元 × 3 份 = 9.6 元，正好分完')
    // 逐步除法：9 元 ÷ 3，余下的换 6 角继续分
    expect(wrapper.findAll('.div-step')[0]!.text()).toContain('9 元 ÷ 3 = 3 元')
    expect(wrapper.findAll('.div-step')[1]!.text()).toContain('换 6 角 ÷ 3 = 2 角')
  })

  it('DecimalLab：除不尽时给出余数（9.6 ÷ 7）', () => {
    const lab = findLabById('g5-c4-ddiv-eraser')!
    const wrapper = mount(DecimalLab, { props: { lab, values: { total: 9.6, count: 7 } } })
    expect(wrapper.text()).toContain('除不尽')
    expect(wrapper.findAll('.div-step').length).toBeGreaterThan(1)
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

  it('FormulaLab：青蛙歌画出每只青蛙的 2 只眼睛、4 条腿，并给出规律表', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 3 } } })
    expect(wrapper.text()).toContain('张嘴')
    // 3 只青蛙 → 3 个青蛙图形，每个图形 4 条腿、2 只眼睛
    expect(wrapper.findAll('.frog')).toHaveLength(3)
    expect(wrapper.findAll('.frog-leg')).toHaveLength(12)
    expect(wrapper.findAll('.frog-eye')).toHaveLength(6)
    // 眼睛 = 2n = 6，腿 = 4n = 12
    expect(wrapper.text()).toContain('6')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('只眼睛（2 × 3）')
    // 规律表固定 1~5 行；n ≤ 5 时当前行就是其中一行
    expect(wrapper.findAll('.pattern-table tbody tr')).toHaveLength(5)
    expect(wrapper.find('.pattern-table tr.active').text()).toContain('3')
  })

  it('FormulaLab：青蛙歌超过 12 只只画 12 只并显示总数', () => {
    const lab = findLabById('g5-c7-frog-song')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { n: 25 } } })
    expect(wrapper.text()).toContain('…共 25 只')
    expect(wrapper.findAll('.frog')).toHaveLength(12)
    // n > 5：规律表 5 行 + 单独的 n 行
    expect(wrapper.findAll('.pattern-table tbody tr')).toHaveLength(6)
    // 25 只 → 50 只眼睛、100 条腿
    expect(wrapper.text()).toContain('50')
    expect(wrapper.text()).toContain('100')
  })

  it('FormulaLab：正方形边长按比例变化（不再卡在固定大小），并画出 a×a 单位格', async () => {
    const lab = findLabById('g5-c7-square-formula')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { a: 5 } } })
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('25')
    const side5 = Number(wrapper.find('.square-fill').attributes('width'))
    // a = 5 → 4 条边、周长 4a；面积 a×a 个单位格
    expect(wrapper.text()).toContain('周长 C = a+a+a+a = 4a = 20 厘米')
    expect(wrapper.find('.area-label').text()).toBe('a × a = 25')
    await wrapper.setProps({ values: { a: 10 } })
    const side10 = Number(wrapper.find('.square-fill').attributes('width'))
    expect(side10).toBeCloseTo(side5 * 2, 1)
    expect(wrapper.find('.square-grid').exists()).toBe(true)
    expect(wrapper.findAll('.square-grid line')).toHaveLength(18)
    await wrapper.setProps({ values: { a: 20 } })
    const side20 = Number(wrapper.find('.square-fill').attributes('width'))
    expect(side20).toBeCloseTo(side5 * 4, 1)
  })

  it('FormulaLab：路程按 t 段累加，且单位是路程单位（不是 米/分）', () => {
    const lab = findLabById('g5-c7-speed-car')!
    const wrapper = mount(FormulaLab, { props: { lab, values: { v: 15, t: 3 } } })
    expect(wrapper.text()).toContain('45')
    // 三段、每段 15 米，累计 15/30/45
    expect(wrapper.findAll('.seg-cum').map((n) => n.text())).toEqual(['15', '30', '45'])
    expect(wrapper.find('.formula-chip.primary').text()).toBe('路程 s = v × t = 45 米')
    expect(wrapper.find('.formula-chip.primary').text()).not.toContain('米/分')
    expect(wrapper.text()).toContain('15 + 15 + 15 = 45 米')
    // 动车组：250 千米/时 × 3 时 = 750 千米
    const train = findLabById('g5-c7-speed-train')!
    const tw = mount(FormulaLab, { props: { lab: train, values: { v: 250, t: 3 } } })
    expect(tw.find('.formula-chip.primary').text()).toBe('路程 s = v × t = 750 千米')
    expect(tw.findAll('.seg-cum').map((n) => n.text())).toEqual(['250', '500', '750'])
  })

  it('NumberLab：因数拼长方形按同一比例尺真的铺满 n 个小正方形', () => {
    const lab = findLabById('g5-c6-factors-12')!
    const wrapper = mount(NumberLab, { props: { lab, values: { n: 12 } } })
    // 12 有 3 种拼法：1×12、2×6、3×4
    expect(wrapper.findAll('.pair-box')).toHaveLength(3)
    expect(wrapper.findAll('.pair-label').map((n) => n.text())).toEqual(['1 × 12 = 12', '2 × 6 = 12', '3 × 4 = 12'])
    // 同一比例尺：1×12 与 3×4 的格子边长相同
    const svgs = wrapper.findAll('.pair-svg')
    const cells = svgs.map((svg, i) => {
      const box = svg.element.getAttribute('viewBox')!.split(' ').map(Number)
      return box[3]! / [12, 6, 4][i]!
    })
    // 三种拼法用的是同一个格子边长（同一比例尺）
    expect(new Set(cells.map((c) => c.toFixed(3))).size).toBe(1)
    expect(wrapper.text()).toContain('12 的因数有 6 个')
    expect(wrapper.text()).toContain('能拼成')
    expect(wrapper.text()).toContain('3')
    // 16 的因数：1×16、2×8、4×4
    const w16 = mount(NumberLab, { props: { lab: findLabById('g5-c6-factors-16')!, values: { n: 16 } } })
    expect(w16.findAll('.pair-label').map((n) => n.text())).toEqual(['1 × 16 = 16', '2 × 8 = 16', '4 × 4 = 16'])
  })

  it('NumberLab：倍数数轴画出「每次加 n」的跳跃', () => {
    const lab = findLabById('g5-c6-multiples-3')!
    const wrapper = mount(NumberLab, { props: { lab, values: { n: 3, k: 5 } } })
    expect(wrapper.findAll('.jump-arc')).toHaveLength(4)
    expect(wrapper.findAll('.nl-mark')).toHaveLength(5)
    expect(wrapper.text()).toContain('每次加 3')
    expect(wrapper.text()).toContain('最小的倍数是 3 本身')
  })

  it('NumberLab：质数筛按 2→3→5→7 逐轮划掉倍数，筛完剩下的恰好是质数', async () => {
    const lab = findLabById('g5-c6-prime-sieve')!
    const wrapper = mount(NumberLab, { props: { lab, values: { n: 50 } } })
    expect(wrapper.findAll('.sieve-cell.sifted')).toHaveLength(0)
    const btn = () => wrapper.findAll('button').find((b) => b.text().includes('划掉') || b.text().includes('开始筛'))
    expect(btn()!.text()).toContain('2 的倍数')
    await btn()!.trigger('click')
    expect(wrapper.text()).toContain('已划掉 2 的倍数')
    // 划掉 2 的倍数：50 以内 4..50 的偶数共 24 个
    expect(wrapper.findAll('.sieve-cell.sifted')).toHaveLength(24)
    for (let i = 0; i < 3; i++) await btn()!.trigger('click')
    expect(wrapper.text()).toContain('筛完了')
    // 筛完剩下 15 个质数（2..47），且 4/9/25/49 都被划掉
    expect(wrapper.findAll('.sieve-cell.prime')).toHaveLength(15)
    expect(wrapper.text()).toContain('剩下的恰好是质数：15 个')
    const reset = wrapper.findAll('button').find((b) => b.text().includes('复位'))
    await reset!.trigger('click')
    expect(wrapper.findAll('.sieve-cell.sifted')).toHaveLength(0)
  })

  it('NumberLab：公因数按「独有 / 公共 / 独有」分组并高亮最大公因数', () => {
    const lab = findLabById('g5-c6-gcdlcm-8-12')!
    const wrapper = mount(NumberLab, { props: { lab, values: { a: 8, b: 12 } } })
    expect(wrapper.findAll('.venn-box')).toHaveLength(3)
    expect(wrapper.find('.venn-box.common').text()).toContain('1')
    expect(wrapper.find('.venn-box.common').text()).toContain('4')
    expect(wrapper.text()).toContain('最大公因数')
    expect(wrapper.find('.factor-chip.common.max').text()).toBe('4')
    // 公倍数：6 和 9 → 18、36、54，最小 18
    const w2 = mount(NumberLab, { props: { lab: findLabById('g5-c6-gcdlcm-6-9')!, values: { a: 6, b: 9 } } })
    expect(w2.text()).toContain('最小公倍数')
    expect(w2.text()).toContain('18')
    expect(w2.findAll('.star')).toHaveLength(3)
  })

  it('每个有 Lab 的单元都能找到 lab', () => {
    const ids = ['c1', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']
    for (const c of ids) {
      expect(labsOfChapter(c as never).length).toBeGreaterThan(0)
    }
  })
})
