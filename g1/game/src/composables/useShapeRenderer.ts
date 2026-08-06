import { type Ref, watch } from 'vue'
import * as THREE from 'three'

type ShapeName = '长方体' | '正方体' | '圆柱' | '球'

/**
 * 用 three.js 渲染立体图形（长方体/正方体/圆柱/球）
 * 通过容器 ref 挂载 canvas，负责创建、动画循环与销毁
 */
export function useShapeRenderer(container: Ref<HTMLElement | null>, shape: Ref<string>) {
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let mesh: THREE.Mesh | null = null
  let animId = 0

  function buildGeometry(name: ShapeName): THREE.BufferGeometry {
    switch (name) {
      case '正方体':
        return new THREE.BoxGeometry(2, 2, 2)
      case '长方体':
        return new THREE.BoxGeometry(2.6, 1.5, 1.5)
      case '圆柱':
        return new THREE.CylinderGeometry(1.1, 1.1, 2.4, 32)
      case '球':
        return new THREE.SphereGeometry(1.3, 32, 32)
    }
  }

  function mountCanvas() {
    if (!container.value || renderer) return
    const el = container.value
    const width = el.clientWidth || 256
    const height = el.clientHeight || 224

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)

    const canvas = renderer.domElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    el.appendChild(canvas)

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(3.2, 2.6, 3.6)
    camera.lookAt(0, 0, 0)

    const ambient = new THREE.AmbientLight(0xffffff, 0.65)
    const dir = new THREE.DirectionalLight(0xffffff, 0.9)
    dir.position.set(5, 6, 4)
    scene.add(ambient, dir)

    const shapeName = shape.value as ShapeName
    const geometry = buildGeometry(shapeName)
const material = new THREE.MeshLambertMaterial({
      color: shapeName === '球' ? 0xff8f8f : shapeName === '圆柱' ? 0x8fd3ff : 0xffd7a1,
    })
    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    animate()
  }

  function animate() {
    if (!renderer || !scene || !camera || !mesh) return
    animId = requestAnimationFrame(animate)
    mesh.rotation.y += 0.012
    renderer.render(scene, camera)
  }

  function dispose() {
    cancelAnimationFrame(animId)
    if (renderer) {
      renderer.dispose()
      renderer.domElement.remove()
    }
    renderer = null
    scene = null
    mesh = null
  }

  watch(shape, () => {
    if (mesh && scene) {
      scene.remove(mesh)
      mesh.geometry.dispose()
    }
  })

  return { mountCanvas, dispose, animate }
}