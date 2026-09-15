<script setup lang="ts">
/**
 * 练习题 Lab（三 数与运算的再认识）：
 * - ex-c3-div-to-mul  除法转化成乘法（单位矩形 + 同比例尺横条 + 数轴刻度）
 * - ex-c3-frac-split  和（差）是 7/12 的两个分数（12 格分数条）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- ex-c3-div-to-mul ---------- */
/** 练习六 第 9 题的六组除数：÷0.1 ÷2 ÷0.25 ÷10 ÷0.5 ÷4 */
const DIVISORS = [0.1, 2, 0.25, 10, 0.5, 4]
const divIdx = computed(() => Math.round(props.values.divIdx ?? 0))
const b = computed(() => DIVISORS[divIdx.value] ?? DIVISORS[0]!)
const a = computed(() => props.values.a ?? 4.8)
const recip = computed(() => 1 / b.value)
const quotient = computed(() => a.value / b.value)

/** 单位矩形：底 = 1/b、高 = b，面积恒为 1；按最大值封顶缩放，避免越出 viewBox */
const UNIT_CAP = 88
const unitScale = computed(() => UNIT_CAP / Math.max(recip.value, b.value))
const unitW = computed(() => recip.value * unitScale.value)
const unitH = computed(() => b.value * unitScale.value)

/** 同比例尺横条：以 a 与商中的较大值为满宽 */
const barMax = computed(() => Math.max(a.value, quotient.value, 0.0001))
const aPct = computed(() => (a.value / barMax.value) * 100)
const qPct = computed(() => (quotient.value / barMax.value) * 100)

/** 数轴分段：整数除数按除数分，小数除数按其倒数分 */
const segCount = computed(() => {
  const v = b.value
  return Number.isInteger(v) ? v : Math.round(1 / v)
})
const ticks = computed(() => Array.from({ length: segCount.value + 1 }, (_, i) => (i / segCount.value) * 100))

/* ---------- ex-c3-frac-split ---------- */
const FD = 12
const TARGET = 7
const mode = computed(() => Math.round(props.values.mode ?? 0))
const fracA = computed(() => Math.round(props.values.a ?? 3))
/** 和模式：第二个分数占几份 7 − a */
const fracB = computed(() => TARGET - fracA.value)
/** 差模式：被减数占几份 a + 7 */
const minuendParts = computed(() => fracA.value + TARGET)
const cells = computed(() => Array.from({ length: FD }, (_, i) => i))
const cellW = 320 / FD
/** 每格的高亮类别随模式变化 */
const fracCellClass = computed(() => {
  const aParts = fracA.value
  return (i: number) => {
    if (mode.value === 0) {
      if (i < aParts) return 'primary'
      if (i < TARGET) return 'light'
      return 'empty'
    }
    if (i < aParts) return 'removed'
    if (i < minuendParts.value) return 'primary'
    return 'empty'
  }
})
const fracExpr = computed(() =>
  mode.value === 0
    ? `${fracA.value}/${FD} + ${fracB.value}/${FD} = ${TARGET}/${FD}`
    : `${minuendParts.value}/${FD} − ${fracA.value}/${FD} = ${TARGET}/${FD}`,
)
const fracNote = computed(() =>
  mode.value === 0
    ? `把 ${TARGET} 个 1/${FD} 分成主色 ${fracA.value} 个与浅色 ${fracB.value} 个，加起来仍是 ${TARGET}/${FD}。`
    : `从 ${minuendParts.value} 个 1/${FD} 里去掉斜纹的 ${fracA.value} 个，剩下主色 ${TARGET} 个，差是 ${TARGET}/${FD}。`,
)
</script>

<template>
  <div class="ex-c3-wrap">
    <!-- 除法转化成乘法 -->
    <template v-if="kind === 'ex-c3-div-to-mul'">
      <div class="ex-c3-div-to-mul">
        <div class="ex-c3-unit">
          <p class="ex-c3-cap">单位矩形：底 = 1 ÷ b、高 = b，面积恒为 1</p>
          <svg class="ex-c3-unit-svg" width="220" height="150" viewBox="0 0 220 150">
            <rect
              :x="110 - unitW / 2"
              :y="75 - unitH / 2"
              :width="unitW"
              :height="unitH"
              fill="color-mix(in srgb, var(--ui-primary) 30%, white)"
              stroke="var(--ui-primary)"
              stroke-width="2"
            />
            <text x="110" y="16" text-anchor="middle" class="ex-c3-lbl">
              底 = 1 ÷ {{ toFixed2(b) }} = {{ toFixed2(recip) }}
            </text>
            <text :x="110 + unitW / 2 + 6" y="79" class="ex-c3-lbl sky">高 {{ toFixed2(b) }}</text>
            <text x="110" y="142" text-anchor="middle" class="ex-c3-lbl amber">
              面积 = {{ toFixed2(recip) }} × {{ toFixed2(b) }} = 1
            </text>
          </svg>
        </div>

        <div class="ex-c3-bars">
          <div class="ex-c3-bar-row">
            <span class="ex-c3-bar-label">被除数 a</span>
            <div class="ex-c3-track">
              <div class="ex-c3-fill dividend" :style="{ width: aPct + '%' }">{{ toFixed2(a) }}</div>
            </div>
          </div>
          <div class="ex-c3-bar-row">
            <span class="ex-c3-bar-label">商 a ÷ b</span>
            <div class="ex-c3-track">
              <div class="ex-c3-fill quotient" :style="{ width: qPct + '%' }"></div>
              <div class="ex-c3-overlay" :style="{ width: qPct + '%' }">× 1/b</div>
            </div>
          </div>
          <p class="ex-c3-eq">
            {{ toFixed2(a) }} ÷ {{ toFixed2(b) }} = {{ toFixed2(quotient) }} ＝
            {{ toFixed2(a) }} × {{ toFixed2(recip) }} = {{ toFixed2(quotient) }}
          </p>
        </div>

        <div class="ex-c3-numline">
          <svg class="ex-c3-numline-svg" width="340" height="64" viewBox="0 0 340 64">
            <line x1="20" y1="34" x2="320" y2="34" stroke="var(--ui-border)" stroke-width="2" />
            <line
              v-for="(t, i) in ticks"
              :key="i"
              :x1="20 + t * 3"
              y1="26"
              :x2="20 + t * 3"
              y2="42"
              stroke="var(--ui-primary)"
              stroke-width="2"
            />
            <text x="20" y="58" text-anchor="middle" class="ex-c3-lbl">0</text>
            <text x="320" y="58" text-anchor="middle" class="ex-c3-lbl">1</text>
          </svg>
          <p class="ex-c3-note">
            按除数 {{ toFixed2(b) }} 给数轴打刻度：把单位 1 平均分成 {{ segCount }} 段，每段
            {{ toFixed2(1 / segCount) }}。
          </p>
        </div>
      </div>
    </template>

    <!-- 和（差）是 7/12 的两个分数 -->
    <template v-else-if="kind === 'ex-c3-frac-split'">
      <div class="ex-c3-frac">
        <p class="ex-c3-cap">
          {{ mode === 0 ? `和是 ${TARGET}/${FD}：把 ${TARGET} 个 1/${FD} 分成两部分` : `差是 ${TARGET}/${FD}：从 ${minuendParts} 个 1/${FD} 里去掉 ${fracA} 个` }}
        </p>
        <svg class="ex-c3-frac-svg" width="360" height="72" viewBox="0 0 360 72">
          <rect
            v-for="i in cells"
            :key="i"
            :x="20 + i * cellW"
            y="14"
            :width="cellW"
            height="44"
            :class="['ex-c3-cell', fracCellClass(i)]"
          />
          <text
            v-for="i in cells"
            :key="'t' + i"
            :x="20 + i * cellW + cellW / 2"
            y="42"
            text-anchor="middle"
            class="ex-c3-cell-txt"
          >
            1/12
          </text>
          <line
            :x1="20 + fracA * cellW"
            y1="6"
            :x2="20 + fracA * cellW"
            y2="66"
            :stroke="mode === 0 ? 'var(--ui-primary)' : '#b45309'"
            stroke-width="2"
            stroke-dasharray="4 3"
          />
        </svg>
        <p class="ex-c3-eq">{{ fracExpr }}</p>
        <p class="ex-c3-note">{{ fracNote }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ex-c3-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.ex-c3-div-to-mul,
.ex-c3-frac {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  width: 100%;
  max-width: 616px;
}
.ex-c3-cap {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  text-align: center;
}
.ex-c3-unit-svg,
.ex-c3-numline-svg,
.ex-c3-frac-svg {
  max-width: 100%;
  height: auto;
}
.ex-c3-lbl {
  font-size: 12px;
  fill: var(--ui-text-toned);
  font-weight: 700;
}
.ex-c3-lbl.amber {
  fill: #b45309;
}
.ex-c3-lbl.sky {
  fill: #0369a1;
}
.ex-c3-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.ex-c3-bar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ex-c3-bar-label {
  width: 4.6rem;
  font-size: 0.82rem;
  color: var(--ui-text-muted);
  flex-shrink: 0;
}
.ex-c3-track {
  position: relative;
  flex: 1;
  height: 1.7rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  overflow: hidden;
}
.ex-c3-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  transition: width 0.3s;
}
.ex-c3-fill.dividend {
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  color: var(--ui-text-highlighted);
}
.ex-c3-fill.quotient {
  background: color-mix(in srgb, var(--ui-primary) 20%, white);
}
.ex-c3-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  white-space: nowrap;
  transition: width 0.3s;
}
.ex-c3-eq {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  text-align: center;
  line-height: 1.7;
  font-family: ui-monospace, monospace;
}
.ex-c3-numline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.ex-c3-note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
  line-height: 1.6;
}
.ex-c3-frac-svg {
  width: 100%;
  max-width: 360px;
}
.ex-c3-cell {
  stroke: var(--ui-bg-default);
  stroke-width: 1.5;
}
.ex-c3-cell.empty {
  fill: var(--ui-bg-muted);
}
.ex-c3-cell.light {
  fill: color-mix(in srgb, var(--ui-primary) 30%, white);
}
.ex-c3-cell.primary {
  fill: var(--ui-primary);
}
.ex-c3-cell.removed {
  fill: color-mix(in srgb, var(--ui-text-muted) 35%, white);
}
.ex-c3-cell-txt {
  font-size: 10px;
  fill: var(--ui-text-toned);
  font-weight: 700;
  pointer-events: none;
}
</style>
