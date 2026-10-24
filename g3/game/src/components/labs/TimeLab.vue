<script setup lang="ts">
/**
 * 一天的时间 Lab：24 时记时法、经过时间的计算
 *
 * 本轮（第 4 轮）改动：
 * - 24 时记时法改成**一个双圈钟面**：内圈 1~12、外圈 13~24，同一角度上的两个读数
 *   用一条连线连起来，学生能看见“20 时就是晚上 8 时”是怎么对上的（L2 形数同帧）。
 * - 指针角度按真实比例：分针 1 分钟 6°，时针 1 小时 30° 且随分钟连续走（L0）。
 * - 新增「转动一圈（+12 时）」等真操作：时针再走 12 小时，内圈回到同一读数、
 *   外圈却前进 12，过程态真的改变图形（L3），不是只换一句话。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { dialPairs, handAngles, hour12Of, isAfternoon, periodOf } from '@/lib/labs/time'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 24 时记时法 ---------- */
const baseHour = computed(() => Math.round(props.values.hour ?? 0))
const min = computed(() => Math.round(props.values.min ?? 0))

/** 「时针再走几小时」的过程态偏移：钟面真的转过去，不是把参数滑到别的值 */
const walk = ref(0)
const hour = computed(() => ((baseHour.value + walk.value) % 24 + 24) % 24)
const turns = computed(() => Math.floor(walk.value / 12))

const angles = computed(() => handAngles(hour.value, min.value))
const hourAngle = computed(() => angles.value.hour)
const minAngle = computed(() => angles.value.minute)

/** 60 条分钟刻度和 12 条小时刻度：钟面必须有刻度可读 */
const MIN_TICKS = Array.from({ length: 60 }, (_, i) => i)
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const PAIRS = dialPairs()

const periodText = computed(() => periodOf(hour.value))
const hour12 = computed(() => hour12Of(hour.value))
const hour24 = computed(() => hour.value)
const minuteText = computed(() => (min.value ? `${min.value}分` : ''))
const reading12 = computed(() => `${hour12.value}时${minuteText.value}`)
const reading24 = computed(() => `${hour24.value}时${minuteText.value}`)
const display12 = computed(() => `${hour12.value}:${String(min.value).padStart(2, '0')}`)
const display24 = computed(() => `${hour24.value}:${String(min.value).padStart(2, '0')}`)
const readableTime = computed(() => `${periodText.value}${reading12.value}`)
/** 内外圈的对应关系：过了中午要减 12，前半个上午两个读数相同 */
const mappingText = computed(() =>
  isAfternoon(hour.value)
    ? `${hour24.value} 时 − 12 = ${hour12.value} 时，所以 ${hour24.value} 时就是${periodText.value}${hour12.value} 时`
    : `还没过中午，两个读数相同：都是 ${hour12.value} 时`,
)

/** 极坐标：12 点方向为 0°，顺时针 */
function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [160 + r * Math.sin(rad), 160 - r * Math.cos(rad)]
}
function px(r: number, deg: number): number {
  return polar(r, deg)[0]
}
function py(r: number, deg: number): number {
  return polar(r, deg)[1]
}
/** 内外圈同一角度上的映射连线（8 时 ↔ 20 时） */
const mapArc = computed(() => {
  const [x1, y1] = polar(74, hour24.value * 30)
  const [x2, y2] = polar(108, hour24.value * 30)
  return `M ${x1} ${y1} L ${x2} ${y2}`
})

function walkOne() {
  walk.value = (walk.value + 1) % 24
}
function walkTurn() {
  walk.value = (walk.value + 12) % 24
}
function resetWalk() {
  walk.value = 0
}

/* ---------- 经过时间 ---------- */
const start = computed(() => Math.round(props.values.start ?? 9))
const end = computed(() => Math.round(props.values.end ?? 17))
const elapsed = computed(() => Math.max(0, end.value - start.value))
const ticks = computed(() => Array.from({ length: 25 }, (_, i) => i))
/** 逐时链：start → start+1 → … → end */
const chain = computed(() => {
  const out: number[] = []
  for (let h = start.value; h <= end.value; h++) out.push(h)
  return out
})
/** 过程态：先在时间轴上数一数，再列减法算式 */
const revealed = ref(false)
function revealElapsed() {
  revealed.value = true
}
</script>

<template>
  <div class="time-wrap">
    <!-- 24 时记时法 -->
    <template v-if="kind === 'time24'">
      <div class="clock-pair">
        <section class="clock-card clock-card-12">
          <div class="clock-card-head">
            <div>
              <h2 class="clock-card-title">12 时记时法</h2>
              <p class="clock-card-subtitle">普通钟面：只看内圈 1～12</p>
            </div>
            <span class="clock-card-current">{{ reading12 }}</span>
          </div>
          <svg viewBox="0 0 320 320" class="clock-svg" aria-label="12 时记时法钟面">
            <circle cx="160" cy="160" r="136" class="clock-face" />
            <circle cx="160" cy="160" r="120" class="clock-body" />
            <line
              v-for="t in MIN_TICKS"
              :key="'mt' + t"
              :x1="px(t % 5 === 0 ? 112 : 116, t * 6)"
              :y1="py(t % 5 === 0 ? 112 : 116, t * 6)"
              :x2="px(120, t * 6)"
              :y2="py(120, t * 6)"
              :class="t % 5 === 0 ? 'tick-major' : 'tick-minor'"
            />
            <text
              v-for="h in HOURS"
              :key="h"
              :x="px(94, h * 30)"
              :y="py(94, h * 30)"
              class="clock-num"
              :class="{ active: h === hour12 }"
              text-anchor="middle"
              dominant-baseline="central"
            >{{ h }}</text>
            <line :x1="160" :y1="160" :x2="px(70, hourAngle)" :y2="py(70, hourAngle)" class="hour-hand" />
            <line :x1="160" :y1="160" :x2="px(104, minAngle)" :y2="py(104, minAngle)" class="min-hand" />
            <circle cx="160" cy="160" r="7" class="clock-center" />
          </svg>
          <p class="clock-card-caption">时针指向 {{ hour12 }} 与下一格之间，分针走了 {{ min }} 分</p>
        </section>

        <span class="sync-arrow" aria-label="两个钟面同步">⇄</span>

        <section class="clock-card clock-card-24">
          <div class="clock-card-head">
            <div>
              <h2 class="clock-card-title">24 时记时法</h2>
              <p class="clock-card-subtitle">同一个钟面：内圈 1～12，外圈 13～24</p>
            </div>
            <span class="clock-card-current">{{ reading24 }}</span>
          </div>
          <svg viewBox="0 0 320 320" class="clock-svg" aria-label="24 时记时法双圈钟面">
            <circle cx="160" cy="160" r="138" class="clock-face" />
            <circle cx="160" cy="160" r="132" class="ring-24" />
            <circle cx="160" cy="160" r="104" class="ring-12" />
            <text
              v-for="p in PAIRS"
              :key="'o' + p.index"
              :x="px(118, p.angle)"
              :y="py(118, p.angle)"
              class="clock-num24"
              :class="{ active: p.outer === hour24 }"
              text-anchor="middle"
              dominant-baseline="central"
            >{{ p.outer }}</text>
            <text
              v-for="h in HOURS"
              :key="'i' + h"
              :x="px(88, h * 30)"
              :y="py(88, h * 30)"
              class="clock-num"
              :class="{ active: h === hour12 }"
              text-anchor="middle"
              dominant-baseline="central"
            >{{ h }}</text>
            <!-- 内外圈的映射连线：同一角度上的 8 与 20 -->
            <path :d="mapArc" class="map-link" />
            <line :x1="160" :y1="160" :x2="px(66, hourAngle)" :y2="py(66, hourAngle)" class="hour-hand" />
            <line :x1="160" :y1="160" :x2="px(100, minAngle)" :y2="py(100, minAngle)" class="min-hand" />
            <circle cx="160" cy="160" r="7" class="clock-center" />
          </svg>
          <p class="clock-card-caption">{{ mappingText }}</p>
        </section>
      </div>

      <div class="walk-bar">
        <button type="button" class="walk-btn primary" data-test="walk-turn" @click="walkTurn">
          转动一圈（时针再走 12 小时）
        </button>
        <button type="button" class="walk-btn" data-test="walk-hour" @click="walkOne">转动 1 小时</button>
        <span class="walk-state" data-test="walk-state">
          时针已经走了 {{ walk }} 小时{{ turns > 0 ? `（转过 ${turns} 圈）` : '' }}
        </span>
        <button type="button" class="walk-btn ghost" data-test="walk-reset" @click="resetWalk">重来</button>
      </div>

      <div class="reading-compare">
        <p class="reading-title">同一时刻的三种读法</p>
        <div class="reading-grid">
          <div class="reading-row">
            <span class="reading-label">12 时记时法</span>
            <strong class="reading-value">{{ reading12 }}</strong>
          </div>
          <div class="reading-row">
            <span class="reading-label">带时段的读法</span>
            <strong class="reading-value">{{ readableTime }}</strong>
          </div>
          <div class="reading-row">
            <span class="reading-label">数字表示</span>
            <strong class="reading-value">{{ display12 }} = {{ display24 }}</strong>
          </div>
          <div class="reading-row">
            <span class="reading-label">24 时记时法</span>
            <strong class="reading-value">{{ reading24 }}</strong>
          </div>
        </div>
      </div>
      <p class="hint">
        两个钟面表示的是同一个时刻，指针完全相同；改变的是读法。教材还会用 {{ display12 }}、{{ display24 }} 这样的数字表示时间。
      </p>
    </template>

    <!-- 经过时间 -->
    <template v-else>
      <div class="timeline">
        <svg viewBox="0 0 360 120" class="w-full">
          <line x1="20" y1="60" x2="340" y2="60" class="tl-line" />
          <g v-for="h in ticks" :key="h">
            <line
              :x1="20 + (h * 320) / 24"
              :y1="60"
              :x2="20 + (h * 320) / 24"
              :y2="h % 6 === 0 ? 48 : 55"
              class="tl-mark"
            />
            <text
              :x="20 + (h * 320) / 24"
              :y="h % 6 === 0 ? 42 : 76"
              class="tl-num"
              text-anchor="middle"
            >{{ h }}</text>
          </g>
          <!-- 开放区间 -->
          <rect
            :x="20 + (start * 320) / 24"
            :y="58"
            :width="((elapsed) * 320) / 24"
            height="6"
            rx="3"
            class="tl-range"
          />
          <text :x="20 + ((start + elapsed / 2) * 320) / 24" :y="30" text-anchor="middle" class="tl-elapsed">
            经过 {{ elapsed }} 时
          </text>
        </svg>
      </div>
      <div class="convert-box">
        <div class="convert-cell">
          <p class="convert-big">{{ start }}:00</p>
          <p class="convert-label">开门</p>
        </div>
        <span class="convert-arrow">→</span>
        <div class="convert-cell">
          <p class="convert-big">{{ end }}:00</p>
          <p class="convert-label">关门</p>
        </div>
      </div>
      <button v-if="!revealed" type="button" class="walk-btn primary" data-test="reveal-elapsed" @click="revealElapsed">
        试一试：从 {{ start }} 时数到 {{ end }} 时
      </button>
      <div v-else class="step-line" data-test="elapsed-steps">
        <p>① 先补整点，逐时累加：</p>
        <div class="hour-chain">
          <template v-for="(h, i) in chain" :key="h">
            <span class="chain-node" :class="{ edge: i === 0 || i === chain.length - 1 }">{{ h }} 时</span>
            <span v-if="i < chain.length - 1" class="chain-plus">+1</span>
          </template>
          <span class="chain-eq">=</span>
          <span class="chain-result">{{ elapsed }} 时</span>
        </div>
        <p>② 结束 − 开始 = 经过时间：<b>{{ end }} − {{ start }} = {{ elapsed }}</b> 时</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.time-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.clock-pair {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}
.clock-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.7rem;
  width: 21rem;
  max-width: 100%;
}
.clock-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.clock-card-title {
  color: var(--ui-text-highlighted);
  font-size: 0.95rem;
  font-weight: 800;
}
.clock-card-subtitle {
  margin-top: 0.15rem;
  color: var(--ui-text-muted);
  font-size: 0.72rem;
}
.clock-card-current {
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.clock-svg {
  width: 100%;
  max-width: 19rem;
  display: block;
  margin: 0 auto;
}
.clock-face {
  fill: white;
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.clock-body {
  fill: none;
  stroke: var(--ui-border);
  stroke-width: 1;
}
.ring-24 {
  fill: none;
  stroke: color-mix(in srgb, var(--ui-primary) 35%, transparent);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.ring-12 {
  fill: none;
  stroke: var(--ui-border);
  stroke-width: 1;
}
.tick-minor {
  stroke: var(--ui-text-muted);
  stroke-width: 0.8;
}
.tick-major {
  stroke: var(--ui-text-highlighted);
  stroke-width: 1.6;
}
.clock-num {
  font-size: 13px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.clock-num.active {
  fill: var(--ui-primary);
  font-size: 17px;
}
.clock-num24 {
  font-size: 11px;
  fill: var(--ui-text-muted);
}
.clock-num24.active {
  fill: var(--ui-error, #dc2626);
  font-size: 15px;
  font-weight: 800;
}
.map-link {
  stroke: var(--ui-error, #dc2626);
  stroke-width: 2;
  stroke-dasharray: 3 2;
}
.hour-hand {
  stroke: var(--ui-text-highlighted);
  stroke-width: 5;
  stroke-linecap: round;
}
.min-hand {
  stroke: var(--ui-primary);
  stroke-width: 3;
  stroke-linecap: round;
}
.clock-center {
  fill: var(--ui-text-highlighted);
}
.clock-card-caption {
  margin-top: 0.3rem;
  text-align: center;
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  min-height: 2rem;
}
.sync-arrow {
  font-size: 1.4rem;
  color: var(--ui-text-muted);
}
.walk-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.walk-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
}
.walk-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.walk-btn.ghost {
  color: var(--ui-text-muted);
}
.walk-state {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.reading-compare {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
}
.reading-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.reading-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
  max-width: 34rem;
}
.reading-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.85rem;
}
.reading-label {
  color: var(--ui-text-muted);
}
.reading-value {
  color: var(--ui-primary);
}
.timeline {
  width: 100%;
  max-width: 34rem;
}
.tl-line,
.tl-mark {
  stroke: var(--ui-text-muted);
  stroke-width: 1.4;
}
.tl-range {
  fill: color-mix(in srgb, var(--ui-primary) 55%, transparent);
}
.tl-num {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.tl-elapsed {
  fill: var(--ui-primary);
  font-size: 12px;
  font-weight: 700;
}
.convert-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.convert-cell {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.4rem 0.9rem;
  text-align: center;
  background: var(--ui-bg-muted);
}
.convert-big {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.convert-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.convert-arrow {
  color: var(--ui-text-muted);
}
.step-line {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.hour-chain {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex-wrap: wrap;
  justify-content: center;
}
.chain-node {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  padding: 0.1rem 0.45rem;
  font-size: 0.78rem;
}
.chain-node.edge {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.chain-plus,
.chain-eq {
  color: var(--ui-text-muted);
  font-size: 0.75rem;
}
.chain-result {
  color: var(--ui-primary);
  font-weight: 800;
}
.hint {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  text-align: center;
  max-width: 40rem;
}
</style>
