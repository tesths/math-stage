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
const t = computed(() => time12Text(hour.value))

/** 钟面指针角度（12 点方向为 0°，顺时针） */
const hourAngle = computed(() => ((hour.value % 12) + min.value / 60) * 30)
const minAngle = computed(() => min.value * 6)

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MAJOR = [0, 3, 6, 9, 12, 15, 18, 21, 24]

/* elapsed */
const start = computed(() => Math.round(props.values.start ?? 9))
const end = computed(() => Math.round(props.values.end ?? 17))
const elapsed = computed(() => Math.max(0, end.value - start.value))
const ticks = computed(() => Array.from({ length: 25 }, (_, i) => i))
</script>

<template>
  <div class="time-wrap">
    <!-- 24 时记时法 -->
    <template v-if="kind === 'time24'">
      <svg viewBox="0 0 320 320" class="clock-svg">
        <circle cx="160" cy="160" r="140" class="clock-face" />
        <text
          v-for="h in HOURS"
          :key="h"
          :x="160 + 112 * Math.sin(((h * 30) * Math.PI) / 180)"
          :y="160 - 112 * Math.cos(((h * 30) * Math.PI) / 180)"
          class="clock-num"
          text-anchor="middle"
          dominant-baseline="central"
        >{{ h }}</text>
        <line x1="160" y1="160" x2="160" y2="40" class="clock-tick" />
        <line :x1="160" :y1="160" :x2="160 + 74 * Math.sin((hourAngle * Math.PI) / 180)" :y2="160 - 74 * Math.cos((hourAngle * Math.PI) / 180)" class="hour-hand" />
        <line :x1="160" :y1="160" :x2="160 + 100 * Math.sin((minAngle * Math.PI) / 180)" :y2="160 - 100 * Math.cos((minAngle * Math.PI) / 180)" class="min-hand" />
        <circle cx="160" cy="160" r="6" class="clock-center" />
      </svg>
      <div class="convert-box">
        <div class="convert-cell">
          <p class="convert-big">{{ hour }}:{{ String(min).padStart(2, '0') }}</p>
          <p class="convert-label">24 时记时法</p>
        </div>
        <span class="convert-arrow">⇄</span>
        <div class="convert-cell">
          <p class="convert-big">{{ t.period }}{{ t.display }} 时{{ min ? ` ${min} 分` : '' }}</p>
          <p class="convert-label">普通记时法</p>
        </div>
      </div>
      <p class="hint">一天有 24 小时，时针在钟面上转动 2 圈。20 时就是晚上 8 时。</p>
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
        <p>① 先算整点：<b>{{ end }} − {{ start }} = {{ elapsed }}</b> 时</p>
        <p>② 结束 − 开始 = 经过时间</p>
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
  width: 13rem;
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
  max-width: 26rem;
  text-align: center;
}
.timeline {
  width: 100%;
  max-width: 26rem;
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
</style>
