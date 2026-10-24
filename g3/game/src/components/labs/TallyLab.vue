<script setup lang="ts">
/**
 * 数据收集与整理 Lab：画"正"字记录、统计表与统计图
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

const isTally = computed(() => props.lab.kind === 'tally')

const data = computed(() =>
  isTally.value
    ? [
        { name: '苹果', count: props.values.apple ?? 0, emoji: '🍎' },
        { name: '橘子', count: props.values.orange ?? 0, emoji: '🍊' },
        { name: '香蕉', count: props.values.banana ?? 0, emoji: '🍌' },
        { name: '葡萄', count: props.values.grape ?? 0, emoji: '🍇' },
      ]
    : [
        { name: '校园童话', count: props.values.campus ?? 0, emoji: '🏫' },
        { name: '动物童话', count: props.values.animal ?? 0, emoji: '🐰' },
        { name: '科幻童话', count: props.values.scifi ?? 0, emoji: '🚀' },
        { name: '侦探童话', count: props.values.detective ?? 0, emoji: '🔍' },
      ],
)

const total = computed(() => data.value.reduce((acc, d) => acc + d.count, 0))
const maxCount = computed(() => Math.max(1, ...data.value.map((d) => d.count)))
const max = computed(() => data.value.reduce((best, d) => (d.count > best.count ? d : best)))
const chartScale = computed(() => Math.max(5, Math.ceil(maxCount.value / 5) * 5))

/** 生成"正"字与剩余笔画 */
function zheng(count: number): { full: string; left: number } {
  return { full: '正'.repeat(Math.floor(count / 5)), left: count % 5 }
}

/** 条形图高度（px） */
function barHeight(count: number): number {
  return Math.round((count / chartScale.value) * 120)
}

/**
 * 过程态 1（画正字）：一笔一笔地画。
 * 原来一次就把所有"正"字摆出来，学生看不到"5 画一个正字、边数边记"的过程。
 */
const strokes = ref(total.value)
const allocated = computed(() => {
  let rest = strokes.value
  return data.value.map((d) => {
    const show = Math.min(d.count, Math.max(0, rest))
    rest -= show
    return show
  })
})
function nextStroke() {
  strokes.value = strokes.value >= total.value ? 0 : strokes.value + 1
}
function resetStrokes() {
  strokes.value = total.value
}

/** 过程态 2（统计图）：一格一格把人数涂成条形 */
const paint = ref(1)
function nextPaint() {
  paint.value = paint.value >= 1 ? 0.25 : Math.min(1, Math.round((paint.value + 0.25) * 100) / 100)
}
function resetPaint() {
  paint.value = 1
}
</script>

<template>
  <div class="tally-wrap">
    <!-- 画正字记录 -->
    <template v-if="isTally">
      <div class="zheng-grid">
        <div v-for="d in data" :key="d.name" class="zheng-row">
          <span class="zheng-emoji">{{ d.emoji }}</span>
          <span class="zheng-name">{{ d.name }}</span>
          <span class="zheng-chars">
            <span class="zheng-full">{{ zheng(allocated[data.indexOf(d)] ?? d.count).full }}</span>
            <span class="zheng-left">{{ '一'.repeat(zheng(allocated[data.indexOf(d)] ?? d.count).left) }}</span>
          </span>
          <span class="zheng-num">{{ d.count }} 人</span>
        </div>
      </div>
      <div class="tally-bar">
        <button type="button" class="tl-btn primary" data-test="tally-next" @click="nextStroke">
          数一数：一笔一笔画正字（{{ strokes }} / {{ total }} 画）
        </button>
        <button type="button" class="tl-btn ghost" data-test="tally-reset" @click="resetStrokes">重来</button>
      </div>
      <p class="total-line">
        一个"正"字表示 5 人。合计调查 <b>{{ total }}</b> 人，最喜欢<b>{{ max.name }}</b>的人最多
      </p>
    </template>

    <!-- 统计表 + 条形图 -->
    <template v-else>
      <div class="stat-flow" aria-label="统计过程">
        <span class="flow-step active">1 调查记录</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step active">2 统计表</span>
        <span class="flow-arrow">→</span>
        <span class="flow-step active">3 条形图</span>
      </div>
      <div class="record-panel">
        <div v-for="d in data" :key="'record-' + d.name" class="record-row">
          <span class="record-name">{{ d.emoji }} {{ d.name }}</span>
          <span class="record-dots" :aria-label="`${d.name} ${d.count} 人的调查记录`">
            <span v-for="n in d.count" :key="n" class="record-dot" />
          </span>
          <span class="record-count">{{ d.count }} 人</span>
        </div>
      </div>
      <table class="stat-table">
        <thead>
          <tr>
            <th>种类</th>
            <th v-for="d in data" :key="d.name">{{ d.emoji }} {{ d.name }}</th>
            <th>合计</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>人数</td>
            <td v-for="d in data" :key="d.name">{{ d.count }}</td>
            <td class="total-cell">{{ total }}</td>
          </tr>
        </tbody>
      </table>
      <div class="chart">
        <div class="chart-axis">
          <span>{{ chartScale }}</span>
          <span>0</span>
        </div>
        <div class="bar" v-for="d in data" :key="d.name">
          <span class="bar-value">{{ d.count }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{ height: Math.round(barHeight(d.count) * paint) + 'px' }"
              :data-test="'bar-' + d.name"
            />
          </div>
          <span class="bar-label">{{ d.name }}</span>
        </div>
      </div>
      <div class="tally-bar">
        <button type="button" class="tl-btn primary" data-test="paint-next" @click="nextPaint">
          试一试：一格一格涂条形图（{{ Math.round(paint * 100) }}%）
        </button>
        <button type="button" class="tl-btn ghost" data-test="paint-reset" @click="resetPaint">重来</button>
      </div>
      <p class="total-line">每个小圆点表示 1 人，统计表中的人数直接决定条形高度：<b>{{ max.name }}</b>的人数最多（{{ max.count }} 人）</p>
    </template>
  </div>
</template>

<style scoped>
.tally-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.tally-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.tl-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.tl-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.tl-btn.ghost {
  color: var(--ui-text-muted);
}
.bar-fill {
  transition: height 0.25s ease;
}
.zheng-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 34rem;
}
.zheng-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.4rem 0.8rem;
}
.zheng-emoji {
  font-size: 1.3rem;
}
.zheng-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  width: 3.4rem;
}
.zheng-chars {
  flex: 1;
  font-size: 1.15rem;
  line-height: 1.2;
}
.zheng-full {
  color: var(--ui-primary);
  font-weight: 800;
}
.zheng-left {
  color: var(--ui-text-muted);
}
.zheng-num {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-toned);
}
.total-line {
  font-size: 0.92rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
.total-line b {
  color: var(--ui-primary);
}
.chart {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  max-width: 39rem;
}
.chart-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: stretch;
  height: 130px;
  padding-top: 1.1rem;
  color: var(--ui-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
}
.bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  flex: 1;
}
.bar-value {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.bar-track {
  display: flex;
  align-items: flex-end;
  height: 130px;
  width: 2rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  overflow: hidden;
}
.bar-fill {
  width: 100%;
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
  border-radius: var(--ui-radius-md) var(--ui-radius-md) 0 0;
  transition: height 0.4s;
}
.bar-label {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.stat-table {
  border-collapse: collapse;
  font-size: 0.9rem;
  max-width: 100%;
}
.stat-table th,
.stat-table td {
  border: 1px solid var(--ui-border-accented);
  padding: 0.35rem 0.7rem;
  text-align: center;
}
.stat-table th {
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
  font-weight: 700;
}
.total-cell {
  color: var(--ui-primary);
  font-weight: 800;
}
.stat-flow {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.flow-step {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.28rem 0.72rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--ui-text-toned);
}
.flow-step.active {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-primary);
}
.flow-arrow {
  color: var(--ui-text-muted);
  font-weight: 800;
}
.record-panel {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  width: min(100%, 39rem);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: color-mix(in srgb, var(--ui-bg-muted) 70%, transparent);
  padding: 0.65rem;
}
.record-row {
  display: grid;
  grid-template-columns: 6.2rem 1fr 3.5rem;
  align-items: center;
  gap: 0.5rem;
}
.record-name,
.record-count {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--ui-text-toned);
}
.record-count {
  text-align: right;
  color: var(--ui-primary);
}
.record-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.18rem;
  min-height: 1.2rem;
  align-items: center;
}
.record-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 70%, white);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 60%, var(--ui-border));
}
@media (max-width: 520px) {
  .record-row {
    grid-template-columns: 1fr auto;
  }
  .record-dots {
    grid-column: 1 / -1;
    order: 3;
  }
  .chart {
    gap: 0.5rem;
  }
  .bar-track {
    width: 1.55rem;
  }
}
</style>
