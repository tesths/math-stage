<script setup lang="ts">
/**
 * 曹冲称象 Lab：质量单位换算（克/千克/吨）、等量代换
 *
 * 本轮（第 4 轮）改动：
 * - 等量代换原来把"大象质量"直接定义成"每块 × 块数"，再用它去验证"每块 × 块数 = 大象质量"，
 *   是**循环论证**（结论自己证自己）。现在象重是给定条件，学生一块一块加石头去逼近刻线（L0 + L3）。
 * - 质量单位换算补上 1 千克 = 10 行 × 10 个 10 克 = 1000 克的方格，并把换算做成可点的两步（L2 + L3）。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { stonesToMatch } from '@/lib/labs/arith'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 质量单位换算 ---------- */
const value = computed(() => Math.round(props.values.value ?? 3))
const unitIdx = computed(() => Math.round(props.values.unit ?? 0))
const grams = computed(() => value.value * 1000)
const tons = computed(() => value.value / 1000)
const targetUnit = computed(() => (unitIdx.value === 0 ? '克' : unitIdx.value === 1 ? '千克' : '吨'))
const targetValue = computed(() => (unitIdx.value === 0 ? grams.value : unitIdx.value === 1 ? value.value : tons.value))
const convertStep = ref(-1)
const convertLines = computed(() => [
  { label: '1 千克 = 1000 克', text: `${value.value} 千克 × 1000 = ${grams.value} 克` },
  { label: '1 吨 = 1000 千克', text: `${value.value} 千克 ÷ 1000 = ${tons.value} 吨` },
])
function nextWeightStep() {
  convertStep.value = Math.min(convertStep.value + 1, convertLines.value.length - 1)
}
function resetWeightStep() {
  convertStep.value = -1
}
/** 1 千克 = 1000 克：10 行 × 10 列，每小格 10 克 */
const KILO_CELLS = Array.from({ length: 100 }, (_, i) => i + 1)

/* ---------- 等量代换（曹冲称象） ---------- */
const mass = computed(() => Math.round(props.values.mass ?? 2000))
const each = computed(() => Math.round(props.values.each ?? 200))
const target = computed(() => stonesToMatch(mass.value, each.value))

/** 已经放上船的石头块数（真操作：一块一块放） */
const placed = ref(0)
const placedTotal = computed(() => placed.value * each.value)
/** 水面下沉深度（像素），按质量真实比例：象重 → 满刻度 */
const MAX_DROP = 46
const elephantDrop = computed(() => MAX_DROP)
const stoneDrop = computed(() => (Math.min(placedTotal.value, mass.value) / mass.value) * MAX_DROP)
const reached = computed(() => placedTotal.value >= mass.value)
const diff = computed(() => mass.value - placedTotal.value)

function addStone() {
  if (placed.value < target.value.count + 1) placed.value += 1
}
function resetStones() {
  placed.value = 0
}
function fillAll() {
  placed.value = target.value.count
}
</script>

<template>
  <div class="weight-wrap">
    <!-- 质量单位换算 -->
    <template v-if="kind === 'weight'">
      <div class="scale-visual">
        <div class="scale-item" :class="{ active: unitIdx === 2 }">
          <span class="scale-icon">🚚</span>
          <p class="scale-name">吨（t）</p>
          <p class="scale-val">{{ tons }} 吨</p>
        </div>
        <span class="scale-arrow">←÷1000</span>
        <div class="scale-item" :class="{ active: unitIdx === 1 }">
          <span class="scale-icon">🍎</span>
          <p class="scale-name">千克（kg）</p>
          <p class="scale-val">{{ value }} 千克</p>
        </div>
        <span class="scale-arrow">→×1000</span>
        <div class="scale-item" :class="{ active: unitIdx === 0 }">
          <span class="scale-icon">⚖️</span>
          <p class="scale-name">克（g）</p>
          <p class="scale-val">{{ grams }} 克</p>
        </div>
      </div>
      <div class="kilo-grid-block">
        <p class="kilo-title">1 千克 = 1000 克：10 行 × 10 个 10 克</p>
        <div class="kilo-grid">
          <span v-for="i in KILO_CELLS" :key="i" class="kilo-cell" />
        </div>
        <p class="kilo-note">每一小格表示 10 克，100 格 = 1000 克 = 1 千克</p>
      </div>
      <div class="len-buttons">
        <button type="button" class="w-btn primary" data-test="weight-next" @click="nextWeightStep">开始换算</button>
        <button type="button" class="w-btn ghost" data-test="weight-reset" @click="resetWeightStep">重来</button>
      </div>
      <div class="convert-lines">
        <p
          v-for="(line, i) in convertLines"
          :key="i"
          class="convert-line"
          :class="{ on: i <= convertStep }"
        >
          {{ line.label }} → {{ line.text }}
        </p>
      </div>
      <div class="rate-line">
        <span class="rate-chip">1 千克 = 1000 克</span>
        <span class="rate-chip">1 吨 = 1000 千克</span>
        <span class="rate-chip">1 吨 = 1000000 克</span>
      </div>
      <p class="unit-tip">
        称比较轻的物体用克，称多数物体用千克，称大宗重物用吨。要换算成{{ targetUnit }}：<b>{{ value }} 千克 = {{ targetValue }} {{ targetUnit }}</b>
      </p>
    </template>

    <!-- 等量代换：曹冲称象 -->
    <template v-else>
      <svg viewBox="0 0 420 200" class="boat-svg" aria-label="曹冲称象：石块一块一块加到同一刻线">
        <!-- 左：大象上船，刻下水面线 -->
        <g transform="translate(20,0)">
          <text x="80" y="16" text-anchor="middle" class="boat-title">① 大象上船 → 刻线</text>
          <rect x="10" y="120" width="140" height="60" class="water" />
          <g :style="{ transform: `translate(0, ${elephantDrop}px)` }">
            <path d="M 20 40 L 140 40 L 125 100 L 35 100 Z" class="boat" />
            <text x="80" y="78" text-anchor="middle" class="boat-emoji">🐘</text>
          </g>
          <line x1="4" :y1="120" x2="156" :y2="120" class="mark-line" />
          <text x="80" y="150" text-anchor="middle" class="boat-caption">大象 {{ mass }} 千克</text>
        </g>
        <!-- 右：换石头，一块一块加到刻线 -->
        <g transform="translate(240,0)">
          <text x="80" y="16" text-anchor="middle" class="boat-title">② 换成石头，加到同一刻线</text>
          <rect x="10" y="120" width="140" height="60" class="water" />
          <g :style="{ transform: `translate(0, ${stoneDrop}px)` }">
            <path d="M 20 40 L 140 40 L 125 100 L 35 100 Z" class="boat" />
            <text
              v-for="i in Math.min(placed, 12)"
              :key="i"
              :x="46 + ((i - 1) % 6) * 14"
              :y="88 - Math.floor((i - 1) / 6) * 12"
              text-anchor="middle"
              class="stone"
            >🪨</text>
          </g>
          <line x1="4" :y1="120" x2="156" :y2="120" class="mark-line" />
          <text x="80" y="150" text-anchor="middle" class="boat-caption">
            {{ placed }} 块 × {{ each }} 千克 = {{ placedTotal }} 千克
          </text>
        </g>
      </svg>
      <div class="formula-row">
        <span class="chip">每块 {{ each }} 千克</span>
        <span class="chip op">×</span>
        <span class="chip">已放 {{ placed }} 块</span>
        <span class="chip result" :class="{ ok: reached }">= {{ placedTotal }} 千克</span>
      </div>
      <div class="w-buttons">
        <button type="button" class="w-btn primary" data-test="stone-add" @click="addStone">试一试：再放一块石头</button>
        <button type="button" class="w-btn" data-test="stone-fill" @click="fillAll">一次放够</button>
        <button type="button" class="w-btn ghost" data-test="stone-reset" @click="resetStones">重来</button>
      </div>
      <p class="unit-tip" data-test="stone-status">
        <template v-if="reached">
          水面回到刻线！石块总质量 {{ placedTotal }} 千克 = 大象质量 {{ mass }} 千克，所以大象重 <b>{{ mass }} 千克</b>。
        </template>
        <template v-else>
          水面还没到刻线，还差 <b>{{ diff }}</b> 千克，需要 {{ target.count }} 块 {{ each }} 千克的石头。
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>
.weight-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.scale-visual {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.scale-item {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 1rem;
  text-align: center;
  min-width: 6rem;
}
.scale-item.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.scale-icon {
  font-size: 1.3rem;
}
.scale-name {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.scale-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.scale-arrow {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.kilo-grid-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.kilo-title {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
}
.kilo-grid {
  display: grid;
  grid-template-columns: repeat(10, 10px);
  gap: 1px;
}
.kilo-cell {
  width: 10px;
  height: 10px;
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  border-radius: 1px;
}
.kilo-note {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.len-buttons,
.w-buttons {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.w-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.w-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.w-btn.ghost {
  color: var(--ui-text-muted);
}
.convert-lines {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  align-items: center;
}
.convert-line {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  opacity: 0.4;
}
.convert-line.on {
  opacity: 1;
  color: var(--ui-primary);
  font-weight: 700;
}
.rate-line {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}
.rate-chip {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
  border: 1px dashed var(--ui-border);
  border-radius: 9999px;
  padding: 0.1rem 0.5rem;
}
.unit-tip {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 38rem;
}
.unit-tip b {
  color: var(--ui-primary);
}
.boat-svg {
  width: 100%;
  max-width: 40rem;
}
.boat-title {
  font-size: 10px;
  fill: var(--ui-text-muted);
}
.water {
  fill: color-mix(in srgb, var(--ui-primary) 22%, white);
}
.boat {
  fill: color-mix(in srgb, var(--ui-warning, #f59e0b) 45%, white);
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2;
  transition: transform 0.35s ease;
}
.boat-emoji {
  font-size: 26px;
}
.stone {
  font-size: 12px;
}
.mark-line {
  stroke: var(--ui-error, #dc2626);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.boat-caption {
  font-size: 10px;
  fill: var(--ui-text-toned);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.28rem 0.75rem;
  font-size: 0.86rem;
  color: var(--ui-text-toned);
}
.chip.op {
  border-color: var(--ui-warning, #f59e0b);
  color: var(--ui-warning, #f59e0b);
  font-weight: 700;
}
.chip.result {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.chip.result.ok {
  border-color: var(--ui-success, #16a34a);
  color: var(--ui-success, #16a34a);
}
</style>
