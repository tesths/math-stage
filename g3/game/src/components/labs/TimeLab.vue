<script setup lang="ts">
/**
 * 一天的时间 Lab：24 时记时法、经过时间的计算
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { time12Text } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* time24 */
const hour = computed(() => Math.round(props.values.hour ?? 0))
const min = computed(() => Math.round(props.values.min ?? 0))

const minAngle = computed(() => min.value * 6)

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
/** 普通记时法文本与计算结果共用同一套教材口径。 */
const time12 = computed(() => time12Text(hour.value))
const periodText = computed(() => time12.value.period)
const hour12 = computed(() => time12.value.display)

/* 两个钟面使用同一组指针，区别只放在读法上。 */
const hour24 = computed(() => hour.value % 24)
/** 内层短针（普通记时 1-12）角度（12 点上方为 0°，顺时针） */
const shortAngle = computed(() => ((hour.value % 12) + min.value / 60) * 30)
const minuteText = computed(() => (min.value ? `${min.value}分` : ''))
const reading12 = computed(() => `${hour12.value}时${minuteText.value}`)
const reading24 = computed(() => `${hour24.value}时${minuteText.value}`)
const display12 = computed(() => `${hour12.value}:${String(min.value).padStart(2, '0')}`)
const display24 = computed(() => `${hour24.value}:${String(min.value).padStart(2, '0')}`)
const readableTime = computed(() => `${periodText.value}${reading12.value}`)

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
      <div class="clock-pair">
        <section class="clock-card clock-card-12">
          <div class="clock-card-head">
            <div>
              <h2 class="clock-card-title">12 时记时法</h2>
              <p class="clock-card-subtitle">普通钟面：1～12 时</p>
            </div>
            <span class="clock-card-current">{{ reading12 }}</span>
          </div>
          <svg viewBox="0 0 320 320" class="clock-svg" aria-label="12 时记时法钟面">
            <circle cx="160" cy="160" r="136" class="clock-face" />
            <text
              v-for="h in HOURS"
              :key="h"
              :x="160 + 102 * Math.sin(((h * 30) * Math.PI) / 180)"
              :y="160 - 102 * Math.cos((h * 30 * Math.PI) / 180)"
              class="clock-num"
              :class="{ active: h === hour12 }"
              text-anchor="middle"
              dominant-baseline="central"
            >{{ h }}</text>
            <line :x1="160" :y1="160" :x2="160 + 76 * Math.sin((shortAngle * Math.PI) / 180)" :y2="160 - 76 * Math.cos((shortAngle * Math.PI) / 180)" class="hour-hand" />
            <line :x1="160" :y1="160" :x2="160 + 108 * Math.sin((minAngle * Math.PI) / 180)" :y2="160 - 108 * Math.cos((minAngle * Math.PI) / 180)" class="min-hand" />
            <circle cx="160" cy="160" r="7" class="clock-center" />
          </svg>
          <p class="clock-card-caption">{{ reading12 }}</p>
        </section>

        <span class="sync-arrow" aria-label="两个钟面同步">⇄</span>

        <section class="clock-card clock-card-24">
          <div class="clock-card-head">
            <div>
              <h2 class="clock-card-title">24 时记时法</h2>
              <p class="clock-card-subtitle">同一个钟面，换一种读法</p>
            </div>
            <span class="clock-card-current">{{ reading24 }}</span>
          </div>
          <svg viewBox="0 0 320 320" class="clock-svg" aria-label="24 时记时法钟面">
            <circle cx="160" cy="160" r="136" class="clock-face" />
            <text
              v-for="h in HOURS"
              :key="'24-clock' + h"
              :x="160 + 102 * Math.sin(((h * 30) * Math.PI) / 180)"
              :y="160 - 102 * Math.cos((h * 30 * Math.PI) / 180)"
              class="clock-num"
              :class="{ active: h === hour12 }"
              text-anchor="middle"
              dominant-baseline="central"
            >{{ h }}</text>
            <line :x1="160" :y1="160" :x2="160 + 76 * Math.sin((shortAngle * Math.PI) / 180)" :y2="160 - 76 * Math.cos((shortAngle * Math.PI) / 180)" class="hour-hand" />
            <line :x1="160" :y1="160" :x2="160 + 108 * Math.sin((minAngle * Math.PI) / 180)" :y2="160 - 108 * Math.cos((minAngle * Math.PI) / 180)" class="min-hand" />
            <circle cx="160" cy="160" r="7" class="clock-center" />
          </svg>
          <p class="clock-card-caption">{{ reading24 }}</p>
        </section>
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
      <p class="hint">两个钟面表示的是同一个时刻，指针完全相同；改变的是读法。教材还会用 8:00、20:00 这样的数字表示时间。</p>
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
.clock-pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}
.clock-card {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.75rem 0.7rem 0.65rem;
}
.clock-card-head {
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.clock-card-title {
  color: var(--ui-text-highlighted);
  font-size: 1rem;
  font-weight: 800;
}
.clock-card-subtitle {
  margin-top: 0.15rem;
  color: var(--ui-text-muted);
  font-size: 0.72rem;
}
.clock-card-current {
  flex: 0 0 auto;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  padding: 0.15rem 0.45rem;
  color: var(--ui-primary);
  font-size: 0.78rem;
  font-weight: 800;
}
.clock-card-caption {
  min-height: 1.2rem;
  color: var(--ui-text-toned);
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}
.sync-arrow {
  color: var(--ui-text-muted);
  font-size: 1.6rem;
  font-weight: 700;
}
.clock-svg {
  width: min(100%, 20rem);
  height: auto;
}
.clock-num.active {
  fill: var(--ui-text-highlighted);
  font-weight: 900;
}
.clock-num.active {
  font-size: 17px;
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
.reading-compare {
  width: 100%;
  max-width: 36rem;
}
.reading-title {
  margin-bottom: 0.45rem;
  color: var(--ui-text-highlighted);
  font-size: 0.9rem;
  font-weight: 800;
  text-align: center;
}
.reading-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
}
.reading-row {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.65rem;
  text-align: center;
}
.reading-label {
  color: var(--ui-text-muted);
  font-size: 0.76rem;
}
.reading-value {
  color: var(--ui-primary);
  font-size: 1.08rem;
}
.convert-box {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.convert-cell {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 1rem;
  text-align: center;
  min-width: 8rem;
  flex: 1 1 8rem;
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
@media (max-width: 720px) {
  .clock-pair {
    grid-template-columns: 1fr;
  }
  .sync-arrow {
    transform: rotate(90deg);
  }
  .reading-grid {
    grid-template-columns: 1fr;
  }
}
</style>
