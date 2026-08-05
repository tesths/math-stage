<script setup lang="ts">
/**
 * 观察物体 Lab（three.js）：投票箱三维模型 + 前面/右面/上面三视图
 * - 3D 场景可拖拽旋转（OrbitControls）
 * - 切换观察方向时相机自动移动到对应方位
 * - 下方实时显示三个方向的投影图
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { animate } from 'animejs'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/** 投票箱模型：长方体 + 顶部投票口 */
const cubes = computed<[number, number, number][]>(() => [
  [0, 0, 0],
  [1, 0, 0],
  [2, 0, 0],
  [0, 0, 1],
  [1, 0, 1],
  [2, 0, 1],
  [0, 1, 0],
  [1, 1, 0],
  [2, 1, 0],
  [0, 1, 1],
  [1, 1, 1],
  [2, 1, 1],
])

const views = [
  { key: 0, name: '前面', dir: 'front' },
  { key: 1, name: '右面', dir: 'right' },
  { key: 2, name: '上面', dir: 'top' },
] as const
const view = computed(() => Math.round(props.values.view ?? 0))

const projections = computed(() => {
  const front = new Set<string>()
  const right = new Set<string>()
  const top = new Set<string>()
  for (const [x, y, z] of cubes.value) {
    front.add(`${x},${y}`)
    right.add(`${z},${y}`)
    top.add(`${x},${z}`)
  }
  return { front, right, top }
})

function renderProjection(set: Set<string>): { filled: boolean[][] } {
  const filled: boolean[][] = []
  for (let row = 0; row < 3; row++) {
    const r: boolean[] = []
    for (let col = 0; col < 3; col++) r.push(set.has(`${col},${2 - row}`))
    filled.push(r)
  }
  return { filled }
}

const projFront = computed(() => renderProjection(projections.value.front))
const projRight = computed(() => renderProjection(projections.value.right))
const projTop = computed(() => renderProjection(projections.value.top))

/* ---------- three.js 场景 ---------- */
const mountRef = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let raf = 0
let resizeObs: ResizeObserver | null = null

function centerOf(): THREE.Vector3 {
  const cs = cubes.value
  let cx = 0
  let cy = 0
  let cz = 0
  for (const [x, y, z] of cs) {
    cx += x
    cy += y
    cz += z
  }
  const n = cs.length
  return new THREE.Vector3(cx / n, cy / n, cz / n)
}

let camTween: { cancel: () => void } | null = null

function setCameraFor(v: number) {
  if (!camera || !controls) return
  const c = centerOf()
  const dist = 7
  let pos: THREE.Vector3
  if (v === 0) pos = new THREE.Vector3(c.x, c.y, c.z + dist) // 前面
  else if (v === 1) pos = new THREE.Vector3(c.x + dist, c.y, c.z) // 右面
  else pos = new THREE.Vector3(c.x, c.y + dist, c.z) // 上面
  controls.target.copy(c)
  const from = camera.position.clone()
  camTween?.cancel()
  const cam = { x: from.x, y: from.y, z: from.z }
  camTween = animate(cam, {
    x: [from.x, pos.x],
    y: [from.y, pos.y],
    z: [from.z, pos.z],
    duration: 900,
    easing: 'easeInOutQuad',
    update: () => {
      camera!.position.set(cam.x, cam.y, cam.z)
      camera!.lookAt(c)
      controls!.update()
    },
  })
}

function renderLoop() {
  raf = requestAnimationFrame(renderLoop)
  if (renderer && scene && camera) renderer.render(scene, camera)
}

onMounted(() => {
  const el = mountRef.value
  if (!el) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8fafc)

  camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100)
  camera.position.set(8, 6, 8)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, el.clientHeight)
  el.appendChild(renderer.domElement)

  const amb = new THREE.AmbientLight(0xffffff, 0.7)
  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(5, 8, 6)
  scene.add(amb, dir)

  const grid = new THREE.GridHelper(10, 10, 0x94a3b8, 0xcbd5e1)
  grid.position.y = -0.51
  scene.add(grid)

  const colors = [0x10b981, 0x34d399, 0x059669, 0x6ee7b7, 0x14b8a6]
  for (const [i, [x, y, z]] of cubes.value.entries()) {
    const geo = new THREE.BoxGeometry(0.98, 0.98, 0.98)
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length]!,
      roughness: 0.45,
      metalness: 0.05,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    const edges = new THREE.EdgesGeometry(geo)
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0f172a }))
    mesh.add(line)
    scene.add(mesh)
  }

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08

  const c = centerOf()
  controls.target.copy(c)
  setCameraFor(view.value)

  resizeObs = new ResizeObserver(() => {
    if (!renderer || !camera || !el) return
    const w = el.clientWidth
    const h = el.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  resizeObs.observe(el)
  renderLoop()
})

watch(view, (v) => setCameraFor(v))

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  camTween?.cancel()
  resizeObs?.disconnect()
  controls?.dispose()
  renderer?.dispose()
  if (renderer && mountRef.value) {
    mountRef.value.removeChild(renderer.domElement)
  }
  renderer = null
  scene = null
  camera = null
  controls = null
})
</script>

<template>
  <div class="views-wrap">
    <div ref="mountRef" class="three-mount" />

    <div class="view-buttons">
      <UButton
        v-for="v in views"
        :key="v.key"
        size="sm"
        :color="view === v.key ? 'primary' : 'neutral'"
        :variant="view === v.key ? 'solid' : 'outline'"
        @click="values.view = v.key"
      >
        {{ v.name }}
      </UButton>
    </div>

    <div class="proj-row">
      <div class="proj-box" :class="{ active: view === 0 }">
        <p class="proj-name">前面</p>
        <svg viewBox="0 0 110 110" class="proj-svg">
          <rect v-for="(row, r) in projFront.filled" :key="r">
            <template v-for="(on, c) in row" :key="c">
              <rect v-if="on" :x="c * 26 + 16" :y="r * 26 + 16" width="24" height="24" class="proj-cell" />
            </template>
          </rect>
        </svg>
      </div>
      <div class="proj-box" :class="{ active: view === 1 }">
        <p class="proj-name">右面</p>
        <svg viewBox="0 0 110 110" class="proj-svg">
          <rect v-for="(row, r) in projRight.filled" :key="r">
            <template v-for="(on, c) in row" :key="c">
              <rect v-if="on" :x="c * 26 + 16" :y="r * 26 + 16" width="24" height="24" class="proj-cell" />
            </template>
          </rect>
        </svg>
      </div>
      <div class="proj-box" :class="{ active: view === 2 }">
        <p class="proj-name">上面</p>
        <svg viewBox="0 0 110 110" class="proj-svg">
          <rect v-for="(row, r) in projTop.filled" :key="r">
            <template v-for="(on, c) in row" :key="c">
              <rect v-if="on" :x="c * 26 + 16" :y="r * 26 + 16" width="24" height="24" class="proj-cell" />
            </template>
          </rect>
        </svg>
      </div>
    </div>
    <p class="note">🖱️ 拖拽旋转 3D 场景 · 点击按钮切换观察方向 · 从不同方向看，看到的图形可能不同</p>
  </div>
</template>

<style scoped>
.views-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
}
.three-mount {
  width: 100%;
  height: 300px;
  border-radius: var(--ui-radius-xl);
  border: 1px solid var(--ui-border);
  overflow: hidden;
  background: #f8fafc;
}
.view-buttons {
  display: flex;
  gap: 0.5rem;
}
.proj-row {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.proj-box {
  border: 2px solid transparent;
  border-radius: var(--ui-radius-lg);
  padding: 0.3rem 0.5rem;
  transition: border-color 0.3s;
}
.proj-box.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
}
.proj-name {
  text-align: center;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  font-weight: 700;
}
.proj-svg {
  width: 92px;
  height: 92px;
}
.proj-cell {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
}
.note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
}
</style>
