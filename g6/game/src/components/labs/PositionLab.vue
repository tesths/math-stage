<script setup lang="ts">
/**
 * 确定位置 Lab：用数对确定位置 / 用方向和距离确定位置
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 数对 ---------- */
const col = computed(() => Math.round(props.values.col ?? 3))
const row = computed(() => Math.round(props.values.row ?? 4))
const COLS = 8
const ROWS = 6

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
const marker = computed(() => {
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
  return { x: CX + x * dist.value * S, y: CY + y * dist.value * S }
})
const baseEnd = computed(() => ({ x: CX, y: CY + (dir.value <= 1 ? -1 : 1) * dist.value * S }))
const angleLabelY = computed(() => CY + (dir.value <= 1 ? -1 : 1) * dist.value * S / 2 + 4)
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
              :class="{ axis: c === col }"
            >{{ c }}</span>
          </div>
          <div v-for="r in ROWS" :key="r" class="seat-row">
            <span class="seat-label" :class="{ axis: r === row }">{{ r }}</span>
            <button
              v-for="c in COLS"
              :key="c"
              class="seat"
              :class="{ 'col-hl': c === col, 'row-hl': r === row, active: c === col && r === row }"
              :disabled="true"
            >
              <span v-if="c === col && r === row" class="seat-pin">严军</span>
            </button>
          </div>
        </div>
        <p class="res-line">
          第 {{ col }} 列第 {{ row }} 行 → 数对 <b>（{{ col }}，{{ row }}）</b>
        </p>
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
          <circle :cx="marker.x" :cy="marker.y" r="9" fill="#ef4444" stroke="white" stroke-width="2" />
          <text :x="marker.x" :y="marker.y - 14" text-anchor="middle" class="t-lbl danger">浮雷 {{ toFixed2(dist) }} 千米</text>
        </svg>
        <p class="res-line">
          浮雷在舰艇的<b> {{ DIRS[dir] }} {{ angle }}°</b> 方向 <b>{{ dist }} 千米</b>处
        </p>
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
.direction-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  max-width: 34rem;
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
