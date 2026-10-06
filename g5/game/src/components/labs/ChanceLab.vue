<script setup lang="ts">
/**
 * 可能性 Lab：转盘实验 / 摸球实验
 * 用加权随机模拟，统计结果逼近理论可能性
 */
import { computed, ref } from 'vue'
import { animate } from 'animejs'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { playClick, playCorrect } from '@/lib/sound'
import { ballProbability, normalizeFractions, pickSector, sectorKeyAt, spinTarget, tallyChars as tallyOf } from '@/lib/labs/chance'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 转盘 ---------- */
const red = computed(() => props.values.red ?? 50)
const blue = computed(() => props.values.blue ?? 30)
const yellow = computed(() => props.values.yellow ?? 20)
const sum = computed(() => red.value + blue.value + yellow.value)
const sectors = computed(() => {
  const fracs = normalizeFractions([red.value, blue.value, yellow.value])
  return [
    { key: 'red', label: '红', frac: fracs[0]!, color: '#ef4444' },
    { key: 'blue', label: '蓝', frac: fracs[1]!, color: '#3b82f6' },
    { key: 'yellow', label: '黄', frac: fracs[2]!, color: '#eab308' },
  ]
})
const needleAngle = ref(0)
/** 指针角度累加基准：每次转动在基准上加整圈，保证指针只会向前转 */
const spinBase = ref(0)
const spinning = ref(false)
const spinCounts = ref<Record<string, number>>({ red: 0, blue: 0, yellow: 0 })
const spinTotal = computed(() => spinCounts.value.red! + spinCounts.value.blue! + spinCounts.value.yellow!)

function spin() {
  if (spinning.value) return
  spinning.value = true
  playClick()
  // 加权随机选落点（扇区中心）
  const picked = pickSector(Math.random(), sectors.value)
  const turns = 4 + Math.floor(Math.random() * 3)
  // 目标 = 累加基准 + 整圈 + 扇区中心；指针永远向前转
  const next = spinTarget(spinBase.value, picked.centerFrac, turns)
  const landedKey = sectorKeyAt(sectors.value, next.target / 360)
  animate(needleAngle, {
    value: next.target,
    duration: 1600,
    easing: 'cubicOut',
    update: () => {
      needleAngle.value = Math.round(needleAngle.value)
    },
    complete: () => {
      needleAngle.value = next.target
      spinBase.value = next.base
      spinning.value = false
      spinCounts.value[landedKey] = (spinCounts.value[landedKey] ?? 0) + 1
      playCorrect()
    },
  })
}
function resetSpins() {
  spinCounts.value = { red: 0, blue: 0, yellow: 0 }
  playClick()
}

function sectorPath(cx: number, cy: number, r: number, startFrac: number, frac: number): string {
  if (frac <= 0) return ''
  if (frac >= 0.9999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
  }
  const a0 = startFrac * 2 * Math.PI - Math.PI / 2
  const a1 = a0 + frac * 2 * Math.PI
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = frac > 0.5 ? 1 : 0
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

/* ---------- 摸球 ---------- */
const redBalls = computed(() => Math.round(props.values.red ?? 4))
const yellowBalls = computed(() => Math.round(props.values.yellow ?? 6))
const ballTotal = computed(() => redBalls.value + yellowBalls.value)
const results = ref<('red' | 'yellow')[]>([])
const draws = computed(() => results.value.length)
const tally = computed(() => ({
  red: results.value.filter((x) => x === 'red').length,
  yellow: results.value.filter((x) => x === 'yellow').length,
}))

function drawOnce() {
  const r = Math.random() * ballTotal.value
  results.value.push(r < redBalls.value ? 'red' : 'yellow')
}
function drawTimes(k: number) {
  for (let i = 0; i < k; i++) drawOnce()
}
function resetDraws() {
  results.value = []
}

const tallyChars = tallyOf
/** 理论概率 */
const theory = computed(() => ballProbability(redBalls.value, yellowBalls.value))
</script>

<template>
  <div class="chance-wrap">
    <!-- 转盘 -->
    <template v-if="kind === 'spinner'">
      <div class="spinner-row">
        <svg viewBox="0 0 200 200" class="spinner">
          <g :style="{ transform: `rotate(${needleAngle}deg)`, transformOrigin: '100px 100px' }">
            <path
              v-for="(s, i) in sectors"
              :key="s.key"
              :d="sectorPath(100, 100, 82, sectors.slice(0, i).reduce((acc, x) => acc + x.frac, 0), s.frac)"
              :fill="s.color"
              class="sector"
            />
            <text
              v-for="(s, i) in sectors.filter((x) => x.frac > 0)"
              :key="'t' + s.key"
              :x="100 + 55 * Math.cos((sectors.slice(0, sectors.indexOf(s)).reduce((acc, x) => acc + x.frac, 0) + s.frac / 2) * 2 * Math.PI - Math.PI / 2)"
              :y="100 + 55 * Math.sin((sectors.slice(0, sectors.indexOf(s)).reduce((acc, x) => acc + x.frac, 0) + s.frac / 2) * 2 * Math.PI - Math.PI / 2)"
              text-anchor="middle"
              dominant-baseline="middle"
              class="sector-label"
            >
              {{ s.label }}{{ Math.round(s.frac * 100) }}%
            </text>
          </g>
          <circle cx="100" cy="100" r="6" class="pivot" />
          <path d="M 100 14 L 94 34 L 106 34 Z" class="needle" />
        </svg>
        <div class="spinner-side">
          <UButton color="primary" :disabled="spinning" @click="spin">转动转盘</UButton>
          <div class="spin-stats">
            <p
              v-for="s in sectors"
              :key="s.key"
              class="spin-stat"
              :style="{ color: s.color }"
            >
              {{ s.label }}：{{ spinCounts[s.key] }} 次{{
                spinTotal > 0 ? `（${((spinCounts[s.key]! / spinTotal) * 100).toFixed(0)}%，理论上 ${Math.round(s.frac * 100)}%）` : ''
              }}
            </p>
          </div>
          <UButton size="sm" variant="outline" color="neutral" :disabled="spinning || spinTotal === 0" @click="resetSpins">
            清零
          </UButton>
        </div>
      </div>
      <p v-if="spinTotal > 0" class="verify-line">
        ✓ 共转 {{ spinTotal }} 次：红 {{ spinCounts.red }} 次、蓝 {{ spinCounts.blue }} 次、黄 {{ spinCounts.yellow }} 次；
        与理论可能性（红 {{ Math.round(sectors[0]!.frac * 100) }}% / 蓝 {{ Math.round(sectors[1]!.frac * 100) }}% / 黄
        {{ Math.round(sectors[2]!.frac * 100) }}%）比较：转的次数越多，频率越接近它
      </p>
      <p class="note">
        各颜色区域占的面积越大，指针停在那里的可能性越大（当前红
        {{ Math.round((red / sum) * 100) }}% / 蓝 {{ Math.round((blue / sum) * 100) }}% / 黄
        {{ Math.round((yellow / sum) * 100) }}%）
      </p>
    </template>

    <!-- 摸球 -->
    <template v-else>
      <div class="marble-row">
        <div class="bag">
          <span
            v-for="i in redBalls"
            :key="'r' + i"
            class="ball red"
          />
          <span
            v-for="i in yellowBalls"
            :key="'y' + i"
            class="ball yellow"
          />
          <p class="bag-label">盒子里：{{ redBalls }} 红 + {{ yellowBalls }} 黄</p>
        </div>
        <div class="marble-side">
          <div class="marble-btns">
            <UButton size="sm" color="primary" variant="soft" @click="drawOnce">摸 1 次</UButton>
            <UButton size="sm" color="primary" variant="soft" @click="drawTimes(10)">摸 10 次</UButton>
            <UButton size="sm" color="primary" variant="soft" @click="drawTimes(30)">摸 30 次</UButton>
            <UButton size="sm" variant="outline" color="neutral" @click="resetDraws">清空</UButton>
          </div>
          <p class="draw-count">已摸 {{ draws }} 次</p>
        </div>
      </div>

      <div class="tally">
        <div class="tally-line">
          <span class="tally-name red-name">红球</span>
          <span class="tally-chars">{{ tallyChars(tally.red) }}</span>
          <span class="tally-num">{{ tally.red }}</span>
        </div>
        <div class="tally-line">
          <span class="tally-name yellow-name">黄球</span>
          <span class="tally-chars">{{ tallyChars(tally.yellow) }}</span>
          <span class="tally-num">{{ tally.yellow }}</span>
        </div>
        <div class="prob-bar">
          <div
            class="prob-fill red"
            :style="{ width: `${(tally.red / Math.max(1, draws)) * 100}%` }"
          />
          <div
            class="prob-fill yellow"
            :style="{ width: `${(tally.yellow / Math.max(1, draws)) * 100}%` }"
          />
        </div>
        <p class="note">
          摸到红球的可能性 ≈ {{ ((tally.red / Math.max(1, draws)) * 100).toFixed(1) }}%（理论上
          {{ ((redBalls / ballTotal) * 100).toFixed(1) }}%）· 摸的次数越多越接近
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chance-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  text-align: center;
  max-width: 44rem;
}
.spinner-row {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.spinner {
  width: 200px;
}
.sector {
  stroke: white;
  stroke-width: 2;
}
.sector-label {
  font-size: 13px;
  fill: white;
  font-weight: 700;
}
.pivot {
  fill: var(--ui-text-highlighted);
}
.needle {
  fill: var(--ui-primary);
}
.spinner-side {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.spin-stats {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.9rem;
  font-weight: 700;
}
.marble-row {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.bag {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  width: 15rem;
  min-height: 6rem;
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  padding: 0.8rem;
  align-content: flex-start;
}
.ball {
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  box-shadow: inset -2px -2px 3px rgba(0, 0, 0, 0.2);
}
.ball.red {
  background: #ef4444;
}
.ball.yellow {
  background: #eab308;
}
.bag-label {
  width: 100%;
  text-align: center;
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  align-self: flex-end;
}
.marble-side {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.marble-btns {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.draw-count {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.tally {
  width: 100%;
  max-width: 42rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.tally-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
}
.tally-name {
  width: 3rem;
  font-weight: 700;
}
.red-name {
  color: #ef4444;
}
.yellow-name {
  color: #b45309;
}
.tally-chars {
  letter-spacing: 0.2em;
  color: var(--ui-text-highlighted);
  flex: 1;
}
.tally-num {
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.prob-bar {
  display: flex;
  height: 1rem;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid var(--ui-border);
}
.prob-fill.red {
  background: #ef4444;
  transition: width 0.4s;
}
.prob-fill.yellow {
  background: #eab308;
  transition: width 0.4s;
}
.note {
  font-size: 0.82rem;
  color: var(--ui-text-muted);
  text-align: center;
}
</style>
