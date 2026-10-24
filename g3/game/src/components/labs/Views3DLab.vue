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
import { BALLOT_BOX, viewGrids } from '@/lib/labs/views'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

/** 投票箱模型：长方体 + 顶部投票口 */
/** 投票箱模型：3 × 2 × 2 的长方体（12 块），与三视图共用同一份坐标 */
const cubes = computed<[number, number, number][]>(() => BALLOT_BOX)

const views = [
  { key: 0, name: '前面', dir: 'front' },
  { key: 1, name: '右面', dir: 'right' },
  { key: 2, name: '上面', dir: 'top' },
] as const
const view = computed(() => Math.round(props.values.view ?? 0))

/** 三视图与 3D 模型同源：格数、行列数都由 viewGrids 算出（旧实现写死 3×3 会多画空行） */
const grids = computed(() => viewGrids(cubes.value))
function asRows(g: { cols: number; rows: number; cells: boolean[] }): boolean[][] {
  return Array.from({ length: g.rows }, (_, r) => g.cells.slice(r * g.cols, r * g.cols + g.cols))
}
const projFront = computed(() => ({ filled: asRows(grids.value.front), cols: grids.value.front.cols, rows: grids.value.front.rows }))
const projRight = computed(() => ({ filled: asRows(grids.value.right), cols: grids.value.right.cols, rows: grids.value.right.rows }))
const projTop = computed(() => ({ filled: asRows(grids.value.top), cols: grids.value.top.cols, rows: grids.value.top.rows }))
const CELL = 24
function cellScale(g: { cols: number; rows: number }): number {
  return Math.min(CELL, Math.floor(96 / Math.max(g.cols, g.rows)))
}

/* ---------- 过程态：绕物体转一圈 ---------- */
const orbitDeg = ref(0)
const orbiting = ref(false)
function orbitOnce() {
  if (!camera || !controls) return
  const c = centerOf()
  const radius = camera.position.distanceTo(c)
  const start = Math.atan2(camera.position.x - c.x, camera.position.z - c.z)
  const state = { t: 0 }
  orbiting.value = true
  camTween?.cancel()
  camTween = animate(state, {
    t: [0, 1],
    duration: 1600,
    easing: 'easeInOutQuad',
    update: () => {
      const ang = start + state.t * Math.PI * 2
      camera!.position.set(c.x + radius * Math.sin(ang), camera!.position.y, c.z + radius * Math.cos(ang))
      camera!.lookAt(c)
      controls!.update()
      orbitDeg.value = Math.round(state.t * 360)
    },
    complete: () => {
      orbiting.value = false
      orbitDeg.value = 0
    },
  })
}

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
      <UButton size="sm" color="warning" variant="soft" :disabled="orbiting" @click="orbitOnce">
        试一试：绕物体转一圈{{ orbitDeg ? `（${orbitDeg}°）` : '' }}
      </UButton>
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
              <rect
                v-if="on"
                :x="c * cellScale(projFront) + 16"
                :y="r * cellScale(projFront) + 16"
                :width="cellScale(projFront) - 2"
                :height="cellScale(projFront) - 2"
                class="proj-cell"
              />
            </template>
          </rect>
        </svg>
        <p class="proj-rule">{{ projFront.cols }} 列 × {{ projFront.rows }} 行</p>
      </div>
      <div class="proj-box" :class="{ active: view === 1 }">
        <p class="proj-name">右面</p>
        <svg viewBox="0 0 110 110" class="proj-svg">
          <rect v-for="(row, r) in projRight.filled" :key="r">
            <template v-for="(on, c) in row" :key="c">
              <rect
                v-if="on"
                :x="c * cellScale(projRight) + 16"
                :y="r * cellScale(projRight) + 16"
                :width="cellScale(projRight) - 2"
                :height="cellScale(projRight) - 2"
                class="proj-cell"
              />
            </template>
          </rect>
        </svg>
        <p class="proj-rule">{{ projRight.cols }} 列 × {{ projRight.rows }} 行</p>
      </div>
      <div class="proj-box" :class="{ active: view === 2 }">
        <p class="proj-name">上面</p>
        <svg viewBox="0 0 110 110" class="proj-svg">
          <rect v-for="(row, r) in projTop.filled" :key="r">
            <template v-for="(on, c) in row" :key="c">
              <rect
                v-if="on"
                :x="c * cellScale(projTop) + 16"
                :y="r * cellScale(projTop) + 16"
                :width="cellScale(projTop) - 2"
                :height="cellScale(projTop) - 2"
                class="proj-cell"
              />
            </template>
          </rect>
        </svg>
        <p class="proj-rule">{{ projTop.cols }} 列 × {{ projTop.rows }} 行</p>
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
.proj-rule {
  text-align: center;
  font-size: 0.7rem;
  color: var(--ui-text-muted);
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
