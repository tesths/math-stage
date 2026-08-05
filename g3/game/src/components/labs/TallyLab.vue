<script setup lang="ts">
/**
 * 数据收集与整理 Lab：画"正"字记录、统计表与统计图
 */
import { computed } from 'vue'
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

/** 生成"正"字与剩余笔画 */
function zheng(count: number): { full: string; left: number } {
  return { full: '正'.repeat(Math.floor(count / 5)), left: count % 5 }
}

/** 条形图高度（px） */
function barHeight(count: number): number {
  return Math.round((count / maxCount.value) * 120)
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
            <span class="zheng-full">{{ zheng(d.count).full }}</span>
            <span class="zheng-left">{{ '一'.repeat(zheng(d.count).left) }}</span>
          </span>
          <span class="zheng-num">{{ d.count }} 人</span>
        </div>
      </div>
      <p class="total-line">
        一个"正"字表示 5 人。合计调查 <b>{{ total }}</b> 人，最喜欢<b>{{ max.name }}</b>的人最多
      </p>
    </template>

    <!-- 统计表 + 条形图 -->
    <template v-else>
      <div class="chart">
        <div class="bar" v-for="d in data" :key="d.name">
          <span class="bar-value">{{ d.count }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: barHeight(d.count) + 'px' }" />
          </div>
          <span class="bar-label">{{ d.name }}</span>
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
      <p class="total-line">条形统计图的高矮能直观看出：<b>{{ max.name }}</b>的人数最多（{{ max.count }} 人）</p>
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
.zheng-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 24rem;
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
  max-width: 26rem;
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
  max-width: 28rem;
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
</style>
