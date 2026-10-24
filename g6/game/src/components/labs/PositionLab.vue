<script setup lang="ts">
/**
 * 确定位置 Lab：用数对确定位置 / 用方向和距离确定位置
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 数对 ---------- */
const col = computed(() => Math.round(props.values.col ?? 3))
const row = computed(() => Math.round(props.values.row ?? 4))
const COLS = 8
const ROWS = 6
/**
 * 「按数对走一格」：向东走一格 → 只有第一个数（列）加 1；
 * 向北走一格 → 只有第二个数（行）加 1。数对逐个变化，先列后行。
 */
const eastSteps = ref(0)
const northSteps = ref(0)
const walkCol = computed(() => col.value + eastSteps.value)
const walkRow = computed(() => row.value + northSteps.value)
const canEast = computed(() => walkCol.value < COLS)
const canNorth = computed(() => walkRow.value < ROWS)
/** 走过的数对序列：从起点开始逐个变化 */
const walkPoints = computed(() => {
  const pts: string[] = [`（${col.value}，${row.value}）`]
  let c = col.value
  let r = row.value
  for (let i = 0; i < eastSteps.value; i += 1) {
    c += 1
    pts.push(`（${c}，${r}）`)
  }
  for (let i = 0; i < northSteps.value; i += 1) {
    r += 1
    pts.push(`（${c}，${r}）`)
  }
  return pts
})
function stepEast() {
  playClick()
  eastSteps.value = Math.min(eastSteps.value + 1, COLS - col.value)
}
function stepNorth() {
  playClick()
  northSteps.value = Math.min(northSteps.value + 1, ROWS - row.value)
}
function resetWalk() {
  playClick()
  eastSteps.value = 0
  northSteps.value = 0
}

/* ---------- 方向 + 距离 ---------- */
const angle = computed(() => Math.round(props.values.angle ?? 30))
const dist = computed(() => Math.round(props.values.dist ?? 3))
const dir = computed(() => Math.round(props.values.dir ?? 0))
const DIRS = ['北偏东', '北偏西', '南偏东', '南偏西']
const baseName = computed(() => (dir.value <= 1 ? '正北' : '正南'))
const sideName = computed(() => (dir.value % 2 === 0 ? '东' : '西'))
const CX = 190
const CY = 215
const S = 20
/** 角度弧的 sweep：北偏东 / 南偏西 顺时针（1），北偏西 / 南偏东 逆时针（0） */
const SWEEP = [1, 0, 0, 1]
const COMPASS_R = 168
/** 方向的单位向量（画布坐标，y 向下）：北为负 y、东为正 x */
const dirVec = computed(() => {
  const rad = (angle.value * Math.PI) / 180
  let x = 0
  let y = 0
  switch (dir.value) {
    case 0:
      x = Math.sin(rad)
      y = -Math.cos(rad)
      break
    case 1:
      x = -Math.sin(rad)
      y = -Math.cos(rad)
      break
    case 2:
      x = Math.sin(rad)
      y = Math.cos(rad)
      break
    default:
      x = -Math.sin(rad)
      y = Math.cos(rad)
  }
  return { x, y }
})
/** 浮雷的绝对位置：只由「舰艇 + 方向 + 距离」决定，换观测点不会让它移动 */
const marker = computed(() => ({
  x: CX + dirVec.value.x * dist.value * S,
  y: CY + dirVec.value.y * dist.value * S,
}))
/** 只报方向时的候选位置：同一条射线上、距离不同的若干点 */
const candidates = computed(() => [2, 4, 6].map((km) => ({ km, x: CX + dirVec.value.x * km * S, y: CY + dirVec.value.y * km * S })))
const baseEnd = computed(() => ({ x: CX, y: CY + (dir.value <= 1 ? -1 : 1) * dist.value * S }))
const angleLabelY = computed(() => CY + (dir.value <= 1 ? -1 : 1) * dist.value * S / 2 + 4)

/* ---------- 换一个观测点再描述同一位置 ---------- */
/** 第二个观测点（灯塔）固定在图上；浮雷的位置不变，但描述变了 */
const LIGHTHOUSE = { x: CX + 140, y: CY + 40 }
const observer = ref(0)
const obsPoint = computed(() => (observer.value === 1 ? LIGHTHOUSE : { x: CX, y: CY }))
const obsName = computed(() => (observer.value === 1 ? '灯塔' : '舰艇'))
/** 观测点 → 浮雷 的向量（画布坐标） */
const obsVec = computed(() => ({ dx: marker.value.x - obsPoint.value.x, dy: marker.value.y - obsPoint.value.y }))
const obsDistPx = computed(() => Math.hypot(obsVec.value.dx, obsVec.value.dy))
/** 从正北/正南量起的偏角（0~90） */
const obsAngle = computed(() => Math.round((Math.atan2(Math.abs(obsVec.value.dx), Math.abs(obsVec.value.dy)) * 180) / Math.PI))
const obsBase = computed(() => (obsVec.value.dy <= 0 ? '北' : '南'))
const obsSide = computed(() => (obsVec.value.dx >= 0 ? '东' : '西'))
const obsDistKm = computed(() => Math.round((obsDistPx.value / S) * 100) / 100)
const obsDesc = computed(() => `${obsBase.value}偏${obsSide.value} ${obsAngle.value}°，${toFixed2(obsDistKm.value)} 千米`)
/** 东北方向也叫北偏东方向（一律用「北偏东」这种规范说法，从正北量角） */
const dirAlias = computed(() =>
  dir.value === 0
    ? `东北方向也叫北偏东方向：从正北向东偏 ${angle.value}° 就叫北偏东 ${angle.value}°（不是从正东量起）`
    : `方位角统一从正北（或正南）量起：这里是${DIRS[dir.value]} ${angle.value}°`,
)
function toggleObserver() {
  playClick()
  observer.value = observer.value === 1 ? 0 : 1
}

/* ---------- 只说方向够不够 ---------- */
const noDist = ref(false)
function toggleNoDist() {
  playClick()
  noDist.value = !noDist.value
}
</script>

<template>
  <div class="pos-wrap">
    <!-- 数对确定位置 -->
    <template v-if="kind === 'coordinate'">
      <div class="seat-block">
        <div class="seat-grid">
          <div class="seat-head">
            <!-- 与左侧行号等宽的空位：没有它列号会逐列错位（第 8 列偏近 90px） -->
            <span class="seat-label spacer" aria-hidden="true" />
            <span
              v-for="c in COLS"
              :key="'h' + c"
              class="seat-label"
              :class="{ axis: c === walkCol }"
            >{{ c }}</span>
          </div>
          <div v-for="r in ROWS" :key="r" class="seat-row">
            <span class="seat-label" :class="{ axis: r === walkRow }">{{ r }}</span>
            <button
              v-for="c in COLS"
              :key="c"
              class="seat"
              :class="{ 'col-hl': c === walkCol, 'row-hl': r === walkRow, active: c === walkCol && r === walkRow }"
              :disabled="true"
            >
              <span v-if="c === walkCol && r === walkRow" class="seat-pin">严军</span>
            </button>
          </div>
        </div>
        <p class="res-line">
          现在的位置：第 {{ walkCol }} 列第 {{ walkRow }} 行 → 数对 <b>（{{ walkCol }}，{{ walkRow }}）</b>
        </p>
        <!-- 按数对走一格：数对逐个变化 -->
        <div class="walk-panel" aria-label="按数对走一格">
          <div class="walk-btns">
            <UButton size="sm" color="primary" variant="soft" data-test="walk-east" :disabled="!canEast" @click="stepEast" data-act>
              向东走一格：第一个数 +1
            </UButton>
            <UButton size="sm" color="primary" variant="soft" data-test="walk-north" :disabled="!canNorth" @click="stepNorth">
              向北走一格：第二个数 +1
            </UButton>
            <UButton
              v-if="eastSteps > 0 || northSteps > 0"
              size="sm"
              variant="outline"
              color="neutral"
              data-test="walk-reset"
              @click="resetWalk"
            >
              回到起点
            </UButton>
          </div>
          <p class="walk-log" data-test="walk-log">{{ walkPoints.join(' → ') }}</p>
          <p class="walk-hint">
            向东走一格，只加第一个数（列）；向北走一格，只加第二个数（行）——先列后行，两个数不能对调。
          </p>
        </div>
        <p class="note">先列后行：竖排是列（从左往右数），横排是行（从前往后数）</p>
      </div>
    </template>

    <!-- 方向 + 距离 -->
    <template v-else>
      <div class="map-block">
        <svg :width="380" :height="460" viewBox="0 0 380 460">
          <circle :cx="CX" :cy="CY" :r="COMPASS_R" fill="none" stroke="var(--ui-border-accented)" stroke-width="1" stroke-dasharray="4 4" />
          <line :x1="CX" :y1="CY - COMPASS_R" :x2="CX" :y2="CY + COMPASS_R" stroke="var(--ui-border-accented)" stroke-width="1" stroke-dasharray="4 4" />
          <line :x1="CX - COMPASS_R" :y1="CY" :x2="CX + COMPASS_R" :y2="CY" stroke="var(--ui-border-accented)" stroke-width="1" stroke-dasharray="4 4" />
          <text :x="CX" :y="CY - COMPASS_R - 8" text-anchor="middle" class="t-lbl north">北</text>
          <text :x="CX" :y="CY + COMPASS_R + 22" text-anchor="middle" class="t-lbl">南</text>
          <text :x="CX + COMPASS_R + 16" :y="CY + 5" text-anchor="middle" class="t-lbl">东</text>
          <text :x="CX - COMPASS_R - 16" :y="CY + 5" text-anchor="middle" class="t-lbl">西</text>
          <line class="base-ray" :x1="CX" :y1="CY" :x2="baseEnd.x" :y2="baseEnd.y" stroke="var(--ui-border-accented)" stroke-width="1.5" stroke-dasharray="3 3" />
          <line class="target-ray" :x1="CX" :y1="CY" :x2="marker.x" :y2="marker.y" stroke="var(--ui-primary)" stroke-width="2.5" />
          <path
            :d="`M ${CX} ${CY} L ${baseEnd.x} ${baseEnd.y} A ${dist * S} ${dist * S} 0 0 ${SWEEP[dir]} ${marker.x} ${marker.y} Z`"
            fill="color-mix(in srgb, var(--ui-primary) 20%, transparent)"
            stroke="var(--ui-primary)"
            stroke-width="1"
          />
          <text :x="CX + 8" :y="baseEnd.y + (dir <= 1 ? 16 : -10)" class="t-lbl">{{ baseName }}基准</text>
          <text :x="CX + 8" :y="angleLabelY" class="t-lbl">{{ DIRS[dir] }} {{ angle }}°</text>
          <polygon :points="`${CX},${CY} ${CX - 12},${CY + 14} ${CX + 12},${CY + 14}`" fill="#0369a1" />
          <text :x="CX + 18" :y="CY + 20" class="t-lbl ship">舰艇</text>
          <!-- 换一个观测点：灯塔固定在图上，浮雷的红点不动 -->
          <template v-if="observer === 1">
            <line :x1="LIGHTHOUSE.x" :y1="LIGHTHOUSE.y" :x2="marker.x" :y2="marker.y" class="obs-ray" stroke="#7c3aed" stroke-width="2" stroke-dasharray="5 4" />
            <circle :cx="LIGHTHOUSE.x" :cy="LIGHTHOUSE.y" r="8" fill="#7c3aed" stroke="white" stroke-width="2" />
            <text :x="LIGHTHOUSE.x + 12" :y="LIGHTHOUSE.y + 5" class="t-lbl obs">灯塔（观测点）</text>
          </template>
          <!-- 只说方向：同一条射线上有无数个点，位置不能唯一确定 -->
          <g v-if="noDist">
            <circle
              v-for="c in candidates"
              :key="c.km"
              class="cand-dot"
              :cx="c.x"
              :cy="c.y"
              r="6"
              fill="#f59e0b"
              stroke="white"
              stroke-width="1.5"
            />
          </g>
          <template v-else>
            <circle :cx="marker.x" :cy="marker.y" r="9" fill="#ef4444" stroke="white" stroke-width="2" />
            <text :x="marker.x" :y="marker.y - 14" text-anchor="middle" class="t-lbl danger">浮雷 {{ toFixed2(dist) }} 千米</text>
          </template>
        </svg>
        <p
          class="res-line"
          data-test="dir-line"
          :data-observer="obsName"
          :data-base="obsBase"
          :data-side="obsSide"
          :data-angle="obsAngle"
          :data-dist="obsDistKm"
          :data-marker-x="marker.x"
          :data-marker-y="marker.y"
        >
          浮雷在<b>{{ obsName }}</b>的<b> {{ obsDesc }}</b>处
        </p>
        <div class="obs-panel" aria-label="换一个观测点">
          <button
            type="button"
            class="dir-btn"
            :class="{ active: observer === 1 }"
            :aria-pressed="observer === 1"
            data-test="obs-toggle"
            @click="toggleObserver"
 data-act>
            {{ observer === 1 ? '换回以舰艇为观测点' : '换一个观测点：以灯塔为准' }}
          </button>
          <p
            class="obs-line"
            data-test="obs-line"
            :data-observer="obsName"
            :data-obs-x="obsPoint.x"
            :data-obs-y="obsPoint.y"
            :data-marker-x="marker.x"
            :data-marker-y="marker.y"
          >
            以<b>{{ obsName }}</b>为观测点：浮雷在 {{ obsDesc }}；浮雷还是图上那一个红点，位置没有变，只是观测点换了、描述就跟着换
          </p>
        </div>
        <div class="nodist-panel" aria-label="只说方向够不够">
          <button
            type="button"
            class="dir-btn"
            :class="{ active: noDist }"
            :aria-pressed="noDist"
            data-test="nodist-toggle"
            @click="toggleNoDist"
          >
            {{ noDist ? '补上距离：位置就唯一了' : '只说方向、不说距离试试' }}
          </button>
          <p v-if="noDist" class="nodist-hint" data-test="nodist-hint">
            只报「{{ DIRS[dir] }} {{ angle }}°」还不够：从{{ obsName }}出发的这条射线上有无数个点，
            图上画出的 {{ candidates.length }} 个候选位置分别在 {{ candidates.map((c) => c.km).join(' 千米、') }} 千米处 —— <b>还不能确定位置</b>，必须再给距离。
          </p>
          <p v-else class="nodist-ok" data-test="nodist-ok">
            ✓ 有了方向 + 角度 + 距离，位置才能唯一确定：{{ obsName }}的 {{ obsDesc }}
          </p>
          <p class="alias-note" data-test="alias-note">{{ dirAlias }}</p>
        </div>
        <div class="direction-steps" aria-label="方向和距离定位步骤">
          <span>1 从{{ baseName }}开始</span>
          <span>2 向{{ sideName }}偏 {{ angle }}°</span>
          <span>3 沿射线量 {{ dist }} 千米</span>
        </div>
        <p class="scale-note">比例尺：1 千米 = {{ S }} 个画布单位，{{ dist }} 千米 = {{ dist * S }} 个画布单位</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pos-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.seat-block,
.map-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.map-block svg {
  max-width: 100%;
  height: auto;
}
.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem;
}
.seat-head,
.seat-row {
  display: flex;
  gap: 3px;
  align-items: center;
}
.seat-label {
  width: 1.1rem;
  flex: 0 0 1.1rem;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.seat-label.axis {
  color: var(--ui-primary);
  font-weight: 800;
}
.seat {
  width: 1.9rem;
  height: 1.7rem;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  border: 1px solid var(--ui-border-accented);
  padding: 0;
  position: relative;
  transition: all 0.25s;
}
.seat.col-hl {
  background: color-mix(in srgb, var(--ui-primary) 34%, white);
  border-color: color-mix(in srgb, var(--ui-primary) 60%, white);
}
.seat.row-hl {
  border-color: color-mix(in srgb, var(--ui-primary) 45%, white);
}
.seat.active {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
}
.seat-pin {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: white;
}
.res-line {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.res-line b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 34rem;
}
.walk-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  max-width: 34rem;
}
.walk-btns {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.walk-log {
  margin: 0;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--ui-primary);
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.walk-hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 34rem;
}
.direction-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  max-width: 34rem;
}
.dir-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.28rem 0.8rem;
  cursor: pointer;
}
.dir-btn:hover {
  border-color: var(--ui-primary);
}
.dir-btn.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
}
.obs-panel,
.nodist-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  max-width: 36rem;
}
.obs-line,
.nodist-ok {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.obs-line b,
.nodist-ok b {
  color: var(--ui-primary);
}
.nodist-hint {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 14%, var(--ui-bg));
  color: #b45309;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  text-align: center;
}
.nodist-hint b {
  color: #92400e;
}
.nodist-ok {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-weight: 700;
  padding: 0.3rem 0.7rem;
}
.nodist-ok b {
  color: var(--ui-primary);
}
.alias-note {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 34rem;
}
.t-lbl.obs {
  fill: #7c3aed;
}
.direction-steps span {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.scale-note {
  margin: 0;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.t-lbl {
  font-size: 12px;
  fill: var(--ui-text-toned);
  font-weight: 700;
}
.t-lbl.north {
  fill: #b45309;
}
.t-lbl.ship {
  font-size: 11px;
  fill: #0369a1;
}
.t-lbl.danger {
  fill: #dc2626;
  font-size: 11px;
}
</style>
