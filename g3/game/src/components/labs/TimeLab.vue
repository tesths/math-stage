<script setup lang="ts">
/**
 * 一天的时间 Lab：24 时记时法、经过时间的计算
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* time24 */
const hour = computed(() => Math.round(props.values.hour ?? 0))
const min = computed(() => Math.round(props.values.min ?? 0))

const minAngle = computed(() => min.value * 6)

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MAJOR = [0, 3, 6, 9, 12, 15, 18, 21, 24]

/** 普通记时法时段：0-5 凌晨 / 6-11 上午 / 12-17 下午 / 18-23 晚上 */
const periodText = computed(() => {
  const h = hour.value
  if (h < 6) return '凌晨'
  if (h < 12) return '上午'
  if (h < 18) return '下午'
  return '晚上'
})
const hour12 = computed(() => {
  const h = hour.value % 12
  return h === 0 ? 12 : h
})

/* time24 双层钟面：外层 0-23 环形，内层 1-12 钟面；AM 0-11 / PM 12-23 */
/** 外层 24 时位置角度（0 时在正上方，顺时针） */
const hour24 = computed(() => hour.value % 24)
const longAngle = computed(() => hour24.value * 15 + (min.value / 60) * 15)
/** 内层短针（普通记时 1-12）角度（12 点上方为 0°，顺时针） */
const shortAngle = computed(() => ((hour.value % 12) + min.value / 60) * 30)
const H24 = Array.from({ length: 24 }, (_, i) => i)
/** 外层弧带：AM(0-11)/PM(12-23) */
const amArc = 'M 160 40 A 120 120 0 0 1 160 280'
const pmArc = 'M 160 280 A 120 120 0 0 1 160 40'

/* elapsed */
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
</script>

<template>
  <div class="time-wrap">
    <!-- 24 时记时法 -->
    <template v-if="kind === 'time24'">
      <svg viewBox="0 0 320 320" class="clock-svg">
        <!-- 外层 24 时环 -->
        <path :d="amArc" class="band-am" />
        <path :d="pmArc" class="band-pm" />
        <circle cx="160" cy="160" r="150" class="clock-outer" />
        <text
          v-for="h in H24"
          :key="'24' + h"
          :x="160 + 126 * Math.sin((h * 15 * Math.PI) / 180)"
          :y="160 - 126 * Math.cos((h * 15 * Math.PI) / 180)"
          class="clock-num24"
          :class="{ am: h < 12, pm: h >= 12 }"
          text-anchor="middle"
          dominant-baseline="central"
        >{{ h }}</text>
        <!-- 当前时刻在外环位置 -->
        <circle :cx="160 + 126 * Math.sin((longAngle * Math.PI) / 180)" :cy="160 - 126 * Math.cos((longAngle * Math.PI) / 180)" r="8" class="pos-dot" />
        <!-- 内层 12 时钟面 -->
        <circle cx="160" cy="160" r="108" class="clock-face" />
        <text
          v-for="h in HOURS"
          :key="h"
          :x="160 + 84 * Math.sin(((h * 30) * Math.PI) / 180)"
          :y="160 - 84 * Math.cos(((h * 30) * Math.PI) / 180)"
          class="clock-num"
          text-anchor="middle"
          dominant-baseline="central"
        >{{ h }}</text>
        <line :x1="160" :y1="160" :x2="160 + 52 * Math.sin((shortAngle * Math.PI) / 180)" :y2="160 - 52 * Math.cos((shortAngle * Math.PI) / 180)" class="hour-hand" />
        <line :x1="160" :y1="160" :x2="160 + 82 * Math.sin((minAngle * Math.PI) / 180)" :y2="160 - 82 * Math.cos((minAngle * Math.PI) / 180)" class="min-hand" />
        <circle cx="160" cy="160" r="6" class="clock-center" />
      </svg>
      <div class="convert-box">
        <div class="convert-cell">
          <p class="convert-big">{{ hour }}:{{ String(min).padStart(2, '0') }}</p>
          <p class="convert-label">24 时记时法</p>
        </div>
        <span class="convert-arrow">⇄</span>
        <div class="convert-cell">
          <p class="convert-big">{{ periodText }}{{ hour12 }} 时{{ min ? ` ${min} 分` : '' }}</p>
          <p class="convert-label">普通记时法</p>
        </div>
      </div>
      <p class="hint">一天有 24 小时：0-12 时为<b>上午</b>，12-24 时为<b>下午</b>。外圈是 24 时记时，内圈是普通记时，时针在钟面上转 2 圈。</p>
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
      <div class="step-line">
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
.clock-svg {
  width: 15rem;
}
.clock-outer {
  fill: none;
  stroke: var(--ui-border-accented);
  stroke-width: 1.5;
}
.clock-num24 {
  fill: var(--ui-text-muted);
  font-size: 9px;
  font-weight: 700;
}
.clock-num24.am {
  fill: var(--ui-primary);
}
.clock-num24.pm {
  fill: var(--ui-warning, #f59e0b);
}
.band-am,
.band-pm {
  fill: none;
  stroke-width: 12;
}
.band-am {
  stroke: color-mix(in srgb, var(--ui-primary) 25%, transparent);
}
.band-pm {
  stroke: color-mix(in srgb, var(--ui-warning, #f59e0b) 22%, transparent);
}
.pos-dot {
  fill: var(--ui-text-highlighted);
  stroke: white;
  stroke-width: 2;
}
.clock-face {
  fill: var(--ui-bg-muted);
  stroke: var(--ui-border-accented);
  stroke-width: 2;
}
.clock-num {
  fill: var(--ui-text-muted);
  font-size: 15px;
  font-weight: 600;
}
.clock-tick {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.hour-hand {
  stroke: var(--ui-primary);
  stroke-width: 6;
  stroke-linecap: round;
}
.min-hand {
  stroke: var(--ui-text-highlighted);
  stroke-width: 3;
  stroke-linecap: round;
}
.clock-center {
  fill: var(--ui-primary);
}
.convert-box {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}
.convert-cell {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 1rem;
  text-align: center;
  min-width: 8rem;
}
.convert-big {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.convert-label {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.convert-arrow {
  font-size: 1.3rem;
  color: var(--ui-text-muted);
}
.hint {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  max-width: 36rem;
  text-align: center;
}
.timeline {
  width: 100%;
  max-width: 36rem;
}
.tl-line {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
}
.tl-mark {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.tl-num {
  fill: var(--ui-text-muted);
  font-size: 9px;
}
.tl-range {
  fill: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.tl-elapsed {
  fill: var(--ui-primary);
  font-size: 12px;
  font-weight: 700;
}
.step-line {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.step-line b {
  color: var(--ui-primary);
}
.hour-chain {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.chain-node {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg-muted);
  padding: 0.15rem 0.5rem;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.chain-node.edge {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.chain-plus {
  color: var(--ui-warning, #f59e0b);
  font-weight: 800;
}
.chain-eq {
  font-weight: 800;
  color: var(--ui-text-muted);
}
.chain-result {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-primary);
}
</style>
