<script setup lang="ts">
/**
 * 观察物体（三）Lab：three.js 三维积木 + 前/右/上三视图
 * - 3D 场景可拖拽旋转（OrbitControls）
 * - 切换观察方向时相机自动移动到对应方位
 * - 下方实时显示三个方向的投影图
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { animate } from 'animejs'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/** 预置模型（每个 lab 一个），方块坐标 (x, y, z) */
const MODELS: Record<string, [number, number, number][]> = {
  'g5-c8-views3d-blocks': [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [2, 0, 1],
    [2, 1, 1],
  ],
  'g5-c8-views3d-move': [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [0, 0, 1],
    [2, 0, 1],
  ],
}
const cubes = computed(() => MODELS[props.lab.id] ?? MODELS['g5-c8-views3d-blocks']!)

/* ---------- 过程态：一块一块地搭，三视图同步长出来 ---------- */
const shown = ref(cubes.value.length)
const visibleCubes = computed(() => cubes.value.slice(0, shown.value))
const newestIndex = computed(() => shown.value - 1)

const views = [
  { key: 0, name: '前面', dir: 'front', rule: '看宽和高', axis: '宽 x 高' },
  { key: 1, name: '右面', dir: 'right', rule: '看深和高', axis: '深 x 高' },
  { key: 2, name: '上面', dir: 'top', rule: '看宽和深', axis: '宽 x 深' },
] as const
const view = computed(() => Math.round(props.values.view ?? 0))
const currentView = computed(() => views.find((v) => v.key === view.value) ?? views[0]!)

/** 三个方向的投影（2D 网格点集） */
const projections = computed(() => {
  const cs = visibleCubes.value
  const front = new Set<string>()
  const right = new Set<string>()
  const top = new Set<string>()
  for (const [x, y, z] of cs) {
    front.add(`${x},${y}`) // 前面：x 横、y 竖
    right.add(`${z},${y}`) // 右面：z 横、y 竖
    top.add(`${x},${z}`) // 上面：x 横、z 竖
  }
  return { front, right, top }
})

function renderProjection(set: Set<string>): { filled: boolean; c: number; r: number }[] {
  const cells: { filled: boolean; c: number; r: number }[] = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      cells.push({ filled: set.has(`${col},${3 - row}`), c: col, r: row })
    }
  }
  return cells
}

const projFront = computed(() => renderProjection(projections.value.front))
const projRight = computed(() => renderProjection(projections.value.right))
const projTop = computed(() => renderProjection(projections.value.top))
const projectionCards = computed(() => [
  { ...views[0]!, cells: projFront.value },
  { ...views[1]!, cells: projRight.value },
  { ...views[2]!, cells: projTop.value },
])
/** 刚刚放上那块之前的三视图（用于高亮"这一块新占了哪几格"） */
const prevProjections = computed(() => {
  const cs = cubes.value.slice(0, Math.max(0, shown.value - 1))
  const front = new Set<string>()
  const right = new Set<string>()
  const top = new Set<string>()
  for (const [x, y, z] of cs) {
    front.add(`${x},${y}`)
    right.add(`${z},${y}`)
    top.add(`${x},${z}`)
  }
  return { front, right, top }
})
const isNewCell = (key: 'front' | 'right' | 'top', c: number, r: number) =>
  projections.value[key].has(`${c},${3 - r}`) && !prevProjections.value[key].has(`${c},${3 - r}`)

/* ---------- three.js 场景 ---------- */
const mountRef = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let cubeGroup: THREE.Group | null = null

const CUBE_COLORS = [0x10b981, 0x34d399, 0x059669, 0x6ee7b7, 0x14b8a6]
/** 按当前 shown 重建方块（搭积木过程态：三视图与三维模型同步） */
function fillCubeGroup() {
  if (!cubeGroup) return
  cubeGroup.clear()
  for (const [i, [x, y, z]] of visibleCubes.value.entries()) {
    const geo = new THREE.BoxGeometry(0.98, 0.98, 0.98)
    const mat = new THREE.MeshStandardMaterial({
      color: CUBE_COLORS[i % CUBE_COLORS.length]!,
      roughness: 0.45,
      metalness: 0.05,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    const edges = new THREE.EdgesGeometry(geo)
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0f172a }))
    mesh.add(line)
    cubeGroup.add(mesh)
  }
}

function placeOne() {
  if (shown.value >= cubes.value.length) return
  shown.value += 1
  fillCubeGroup()
  const c = centerOf()
  controls?.target.copy(c)
  playClick()
}
function resetBuild() {
  shown.value = 1
  fillCubeGroup()
  const c = centerOf()
  controls?.target.copy(c)
  playClick()
}
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let raf = 0
let resizeObs: ResizeObserver | null = null

function centerOf(): THREE.Vector3 {
  const cs = visibleCubes.value.length ? visibleCubes.value : cubes.value
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
  // animejs 补间：相机平滑飞到目标方位
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

  // 灯光
  const amb = new THREE.AmbientLight(0xffffff, 0.7)
  const dir = new THREE.DirectionalLight(0xffffff, 1.2)
  dir.position.set(5, 8, 6)
  scene.add(amb, dir)

  // 地面网格
  const grid = new THREE.GridHelper(10, 10, 0x94a3b8, 0xcbd5e1)
  grid.position.y = -0.51
  scene.add(grid)

  // 方块（放进一个 Group，搭积木时可以整组重建）
  cubeGroup = new THREE.Group()
  scene.add(cubeGroup)
  fillCubeGroup()

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
// 换模型时重置搭建进度
watch(cubes, () => {
  shown.value = cubes.value.length
  fillCubeGroup()
})

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

    <div class="view-guide">
      <span class="guide-label">当前观察方向：{{ currentView.name }}</span>
      <span>{{ currentView.rule }}，下方三视图固定，不随拖拽旋转</span>
    </div>

    <div class="proj-row">
      <div
        v-for="card in projectionCards"
        :key="card.key"
        class="proj-box"
        :class="{ active: view === card.key }"
      >
        <p class="proj-name">{{ card.name }}</p>
        <svg viewBox="0 0 110 110" class="proj-svg">
          <rect
            v-for="cell in card.cells"
            :key="`${card.dir}-${cell.c}-${cell.r}`"
            :x="cell.c * 26 + 7"
            :y="cell.r * 26 + 7"
            width="24"
            height="24"
            class="proj-cell"
            :class="{ filled: cell.filled, fresh: cell.filled && isNewCell(card.key === 0 ? 'front' : card.key === 1 ? 'right' : 'top', cell.c, cell.r) }"
          />
        </svg>
        <p class="proj-rule">{{ card.axis }} · {{ card.rule }}</p>
      </div>
    </div>
    <div class="build-bar">
      <UButton size="sm" color="primary" :disabled="shown >= cubes.length" @click="placeOne">
        再放一块
      </UButton>
      <UButton size="sm" variant="outline" color="neutral" :disabled="shown <= 1" @click="resetBuild">
        只剩一块
      </UButton>
      <span class="build-note">
        已放 <b>{{ shown }}</b> / {{ cubes.length }} 块{{ shown < cubes.length ? '：再放一块，看哪几个视图会多出格子' : '：模型搭好了，橙色格子是最后一块新占的位置' }}
      </span>
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
  flex-wrap: wrap;
  justify-content: center;
}
.view-guide {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem 0.6rem;
  max-width: 36rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.45rem 0.7rem;
  text-align: center;
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.guide-label {
  color: var(--ui-primary);
  font-weight: 800;
}
.build-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.build-note {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.build-note b {
  color: var(--ui-primary);
}
.proj-cell.fresh {
  fill: #f59e0b;
  stroke: #b45309;
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
.proj-rule {
  margin-top: 0.1rem;
  text-align: center;
  font-size: 0.68rem;
  color: var(--ui-text-muted);
}
.proj-svg {
  width: 92px;
  height: 92px;
}
.proj-cell {
  fill: var(--ui-bg);
  stroke: var(--ui-border);
  stroke-width: 1;
}
.proj-cell.filled {
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
