<script setup lang="ts">
/**
 * 训练游戏：三视图配对（three.js 三维积木 + 选出正确投影）
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { LabDef } from '@data/schema/lab'
import { playCorrect, playWin } from '@/lib/sound'

type Cube = [number, number, number]

interface Round {
  cubes: Cube[]
  view: 0 | 1 | 2 // 0前面 1右面 2上面
  correctKey: string
  options: string[] // 投影网格 key 列表
}

const SHAPES: Cube[][] = [
  [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 0, 1]],
  [[0, 0, 0], [1, 0, 0], [1, 0, 1], [1, 1, 1]],
  [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [2, 0, 1]],
  [[0, 0, 0], [1, 0, 0], [2, 0, 0], [2, 0, 1], [2, 1, 1]],
  [[0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1], [1, 1, 0]],
]
const VIEW_NAMES = ['前面', '右面', '上面']
const VIEW_DIRS = ['front', 'right', 'top'] as const

function project(cubes: Cube[], view: 0 | 1 | 2): Set<string> {
  const out = new Set<string>()
  for (const [x, y, z] of cubes) {
    if (view === 0) out.add(`${x},${y}`)
    else if (view === 1) out.add(`${z},${y}`)
    else out.add(`${x},${z}`)
  }
  return out
}

function gridKey(set: Set<string>): string {
  // 固定 4×4 网格，转字符串
  let s = ''
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      s += set.has(`${c},${3 - r}`) ? '1' : '0'
    }
  }
  return s
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeDistractors(cubes: Cube[], view: 0 | 1 | 2): string[] {
  const correct = gridKey(project(cubes, view))
  const out = new Set<string>()
  let guard = 0
  while (out.size < 3 && guard++ < 200) {
    const copy = cubes.map((c) => [...c] as Cube)
    // 改动：加一个相邻格 或 移除一个已有格
    if (Math.random() < 0.6 || copy.length >= 6) {
      const [x, y, z] = copy[randInt(0, copy.length - 1)]!
      const dirs: Cube[] = [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
      ]
      const d = dirs[randInt(0, 5)]!
      const nc: Cube = [x + d[0], Math.max(0, y + d[1]), z + d[2]]
      if (nc[0] < 0 || nc[0] > 2 || nc[2] < 0 || nc[2] > 2 || nc[1] > 2) continue
      if (!copy.some((c) => c[0] === nc[0] && c[1] === nc[1] && c[2] === nc[2])) {
        copy.push(nc)
      }
    } else {
      const i = randInt(0, copy.length - 1)
      if (copy.length > 2) copy.splice(i, 1)
    }
    const key = gridKey(project(copy, view))
    if (key !== correct) out.add(key)
  }
  return [...out]
}

function makeRound(): Round {
  const cubes = SHAPES[randInt(0, SHAPES.length - 1)]!
  const view = randInt(0, 2) as 0 | 1 | 2
  const correctKey = gridKey(project(cubes, view))
  const distractors = makeDistractors(cubes, view)
  const options = [correctKey, ...distractors].sort(() => Math.random() - 0.5)
  return { cubes, view, correctKey, options }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

function cellAt(key: string, r: number, c: number): boolean {
  return key[r * 4 + c] === '1'
}

/** 每个选项 key 的填充格子坐标（用于 SVG 渲染） */
function cellsOf(key: string): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (key[r * 4 + c] === '1') out.push({ x: c * 26 + 7, y: r * 26 + 7 })
    }
  }
  return out
}

/* ---------- three.js 场景 ---------- */
const mountRef = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let raf = 0

function centerOf(cs: Cube[]): THREE.Vector3 {
  let x = 0
  let y = 0
  let z = 0
  for (const [a, b, c] of cs) {
    x += a
    y += b
    z += c
  }
  const n = cs.length
  return new THREE.Vector3(x / n, y / n, z / n)
}

function setCamera(v: 0 | 1 | 2, cs: Cube[]) {
  if (!camera) return
  const c = centerOf(cs)
  const dist = 6.5
  if (v === 0) camera.position.set(c.x, c.y, c.z + dist)
  else if (v === 1) camera.position.set(c.x + dist, c.y, c.z)
  else camera.position.set(c.x, c.y + dist, c.z)
  camera.lookAt(c)
}

function buildScene(cs: Cube[]) {
  const el = mountRef.value
  if (!el || !scene || !renderer || !camera) return
  scene.clear()
  const amb = new THREE.AmbientLight(0xffffff, 0.75)
  const dir = new THREE.DirectionalLight(0xffffff, 1.3)
  dir.position.set(5, 8, 6)
  scene.add(amb, dir)
  const grid = new THREE.GridHelper(6, 6, 0x94a3b8, 0xcbd5e1)
  grid.position.y = -0.51
  scene.add(grid)
  const colors = [0x10b981, 0x34d399, 0x059669, 0x6ee7b7, 0x14b8a6]
  for (const [i, [x, y, z]] of cs.entries()) {
    const geo = new THREE.BoxGeometry(0.96, 0.96, 0.96)
    const mat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length]!, roughness: 0.45 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    const edges = new THREE.EdgesGeometry(geo)
    mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0f172a })))
    scene.add(mesh)
  }
  setCamera(rd.value.view, cs)
}

function animate() {
  raf = requestAnimationFrame(animate)
  if (renderer && scene && camera) renderer.render(scene, camera)
}

onMounted(() => {
  const el = mountRef.value
  if (!el) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf8fafc)
  camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(el.clientWidth, el.clientHeight)
  el.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.1
  controls.minDistance = 3
  controls.maxDistance = 14
  buildScene(rd.value.cubes)
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  controls?.dispose()
  renderer?.dispose()
  if (renderer && mountRef.value) mountRef.value.removeChild(renderer.domElement)
  renderer = null
  scene = null
  camera = null
  controls = null
})

function onPick(key: string) {
  if (done.value) return
  done.value = true
  const ok = key === rd.value.correctKey
  if (ok) {
    score.value++
    playCorrect()
  }
  pickedKey.value = key
}
const pickedKey = ref('')

function next() {
  if (roundNo.value >= 5) {
    finished.value = true
    playWin()
    return
  }
  roundNo.value++
  rd.value = makeRound()
  done.value = false
  pickedKey.value = ''
  buildScene(rd.value.cubes)
  setCamera(rd.value.view, rd.value.cubes)
}
function restart() {
  roundNo.value = 1
  score.value = 0
  done.value = false
  pickedKey.value = ''
  finished.value = false
  rd.value = makeRound()
  buildScene(rd.value.cubes)
  setCamera(rd.value.view, rd.value.cubes)
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">🧊 观察高手！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <p class="ask">从<b>{{ VIEW_NAMES[rd.view] }}</b>看这个物体，看到的是哪个图形？</p>
      <p class="hint">🖱️ 可拖拽旋转 3D 模型，从不同角度观察</p>

      <div ref="mountRef" class="three-mount" />

      <div class="proj-options">
        <button
          v-for="(key, i) in rd.options"
          :key="i"
          class="proj-opt"
          :class="{
            chosen: done && key === rd.correctKey,
            wrongPick: done && pickedKey === key && key !== rd.correctKey,
            dim: done && pickedKey !== key && key !== rd.correctKey,
          }"
          :disabled="done"
          @click="onPick(key)"
        >
          <svg viewBox="0 0 110 110" class="proj-svg">
            <rect
              v-for="(cell, i) in cellsOf(key)"
              :key="i"
              :x="cell.x"
              :y="cell.y"
              width="24"
              height="24"
              class="proj-cell"
            />
          </svg>
        </button>
      </div>

      <UButton v-if="done" color="primary" size="lg" @click="next">
        {{ roundNo >= 5 ? '查看成绩' : '下一题' }}
      </UButton>
    </template>
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.ask {
  font-size: 1.1rem;
  color: var(--ui-text-highlighted);
}
.ask b {
  color: var(--ui-primary);
}
.hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.three-mount {
  width: 100%;
  max-width: 420px;
  height: 260px;
  border-radius: var(--ui-radius-xl);
  border: 1px solid var(--ui-border);
  overflow: hidden;
  background: #f8fafc;
}
.proj-options {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
  justify-content: center;
}
.proj-opt {
  border: 2px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.2rem;
  cursor: pointer;
  transition: all 0.2s;
}
.proj-opt:hover:not(:disabled) {
  border-color: var(--ui-primary);
}
.proj-opt.chosen {
  border-color: var(--ui-success, #16a34a);
  background: color-mix(in srgb, #16a34a 15%, transparent);
}
.proj-opt.wrongPick {
  border-color: var(--ui-error, #dc2626);
  background: color-mix(in srgb, #dc2626 12%, transparent);
}
.proj-opt.dim {
  opacity: 0.45;
}
.proj-svg {
  width: 78px;
  height: 78px;
}
.proj-cell {
  fill: color-mix(in srgb, var(--ui-primary) 60%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
}
.finish {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2rem 0;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
}
</style>
