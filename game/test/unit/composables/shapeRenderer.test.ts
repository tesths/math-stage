import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useShapeRenderer } from '@/composables/useShapeRenderer'

function fakeThree() {
  const three = {
    WebGLRenderer: vi.fn(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
      domElement: document.createElement('canvas'),
    })),
    Scene: vi.fn(() => ({ add: vi.fn(), remove: vi.fn() })),
    PerspectiveCamera: vi.fn(() => ({ position: { set: vi.fn() }, lookAt: vi.fn() })),
    BoxGeometry: vi.fn(),
    CylinderGeometry: vi.fn(),
    SphereGeometry: vi.fn(),
    Mesh: vi.fn(() => ({ rotation: { y: 0 }, geometry: { dispose: vi.fn() } })),
    MeshLambertMaterial: vi.fn(),
    AmbientLight: vi.fn(),
    DirectionalLight: vi.fn(() => ({ position: { set: vi.fn() } })),
    Color: vi.fn(),
  }
  return three
}

function makeContainer() {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('composables/useShapeRenderer', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('四种形状分别生成对应几何体', async () => {
    const three = fakeThree()
    vi.doMock('three', () => three)
    const { useShapeRenderer } = await import('@/composables/useShapeRenderer')
    const cases: Array<[string, string]> = [
      ['正方体', 'BoxGeometry'],
      ['长方体', 'BoxGeometry'],
      ['圆柱', 'CylinderGeometry'],
      ['球', 'SphereGeometry'],
    ]
    for (const [shape, ctor] of cases) {
      const container = ref<HTMLElement | null>(makeContainer())
      const shapeRef = ref(shape)
      const r = useShapeRenderer(container, shapeRef)
      r.mountCanvas()
      expect((three as Record<string, ReturnType<typeof vi.fn>>)[ctor]).toHaveBeenCalled()
      expect(container.value!.querySelector('canvas')).toBeTruthy()
      r.dispose()
      container.value!.remove()
    }
  })

  it('无容器时不挂载、容器复用不重复挂载', async () => {
    const three = fakeThree()
    vi.doMock('three', () => three)
    const { useShapeRenderer } = await import('@/composables/useShapeRenderer')
    const empty = ref<HTMLElement | null>(null)
    const r1 = useShapeRenderer(empty, ref('球'))
    r1.mountCanvas()
    expect(three.WebGLRenderer).not.toHaveBeenCalled()

    const el = makeContainer()
    const container = ref<HTMLElement | null>(el)
    const r2 = useShapeRenderer(container, ref('球'))
    r2.mountCanvas()
    const first = three.WebGLRenderer.mock.calls.length
    r2.mountCanvas() // 已挂载 → 不再创建
    expect(three.WebGLRenderer.mock.calls.length).toBe(first)
    r2.dispose()
    el.remove()
  })

  it('切换形状时移除旧网格', async () => {
    const three = fakeThree()
    vi.doMock('three', () => three)
    const { useShapeRenderer } = await import('@/composables/useShapeRenderer')
    const el = makeContainer()
    const container = ref<HTMLElement | null>(el)
    const shapeRef = ref('球')
    const r = useShapeRenderer(container, shapeRef)
    r.mountCanvas()
    const scene = (three.Scene as unknown as ReturnType<typeof vi.fn>).mock.results[0].value
    const sceneRemove = scene.remove as ReturnType<typeof vi.fn>
    shapeRef.value = '正方体'
    await vi.waitFor(() => expect(sceneRemove).toHaveBeenCalled())
    r.dispose()
    el.remove()
  })
})
