<script setup lang="ts">
/**
 * 统计 Lab：复式统计表 / 复式条形统计图（chart.js）
 * - stats-table：HTML 统计表（含合计行/列）+ 男女生分组条形图
 * - stats-chart：自己 vs 同桌 复式条形统计图
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { LabDef, ParamValues } from '@data/schema/lab'

Chart.register(...registerables)

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- stats-table ---------- */
const CLASSES = ['一班', '二班', '三班', '四班']
const boys = computed(() => [props.values.a1 ?? 0, props.values.a2 ?? 0, props.values.a3 ?? 0, props.values.a4 ?? 0])
const girls = computed(() => [props.values.b1 ?? 0, props.values.b2 ?? 0, props.values.b3 ?? 0, props.values.b4 ?? 0])
const classTotals = computed(() => boys.value.map((b, i) => b + girls.value[i]!))
const sum = (arr: number[]) => arr.reduce((acc, x) => acc + x, 0)

/* ---------- stats-chart ---------- */
const ACTIVITIES = ['做家务', '做作业', '体育锻炼', '课外阅读', '看电视']
const selfTime = computed(() => [props.values.s1 ?? 0, props.values.s2 ?? 0, props.values.s3 ?? 0, props.values.s4 ?? 0, props.values.s5 ?? 0])
const deskTime = computed(() => [props.values.d1 ?? 0, props.values.d2 ?? 0, props.values.d3 ?? 0, props.values.d4 ?? 0, props.values.d5 ?? 0])

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const chartLabels = computed(() => (kind.value === 'stats-table' ? CLASSES : ACTIVITIES))
const datasets = computed(() => {
  if (kind.value === 'stats-table') {
    return [
      { label: '男生', data: boys.value, color: '#10b981' },
      { label: '女生', data: girls.value, color: '#f59e0b' },
    ]
  }
  return [
    { label: '自己', data: selfTime.value, color: '#10b981' },
    { label: '同桌', data: deskTime.value, color: '#3b82f6' },
  ]
})

function renderChart() {
  if (!chartRef.value) return
  if (chart) {
    chart.destroy()
    chart = null
  }
  chart = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: chartLabels.value,
      datasets: datasets.value.map((d) => ({
        label: d.label,
        data: [...d.data],
        backgroundColor: d.color,
        borderRadius: 6,
        maxBarThickness: 42,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y
              return `${ctx.dataset.label}：${v}${kind.value === 'stats-table' ? ' 人' : ' 时'}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          title: { display: true, text: kind.value === 'stats-table' ? '人数' : '小时' },
        },
      },
    },
  })
}

onMounted(renderChart)
watch(
  () => JSON.stringify(datasets.value),
  () => {
    if (!chart) return
    chart.data.labels = chartLabels.value
    chart.data.datasets.forEach((ds, i) => {
      ds.data = datasets.value[i]!.data
      ds.label = datasets.value[i]!.label
    })
    chart.update()
  },
)
onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="chart-wrap">
    <!-- 复式统计表 -->
    <template v-if="kind === 'stats-table'">
      <table class="stats-table">
        <thead>
          <tr>
            <th>班级</th>
            <th>男生/人</th>
            <th>女生/人</th>
            <th>合计/人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in CLASSES" :key="c">
            <td>{{ c }}</td>
            <td>{{ boys[i] }}</td>
            <td>{{ girls[i] }}</td>
            <td class="total-cell">{{ classTotals[i] }}</td>
          </tr>
          <tr class="grand-row">
            <td>合计</td>
            <td>{{ sum(boys) }}</td>
            <td>{{ sum(girls) }}</td>
            <td>{{ sum(classTotals) }}</td>
          </tr>
        </tbody>
      </table>
    </template>

    <div class="chart-box" :class="{ tall: kind === 'stats-chart' }">
      <canvas ref="chartRef" />
    </div>
  </div>
</template>

<style scoped>
.chart-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  width: 100%;
}
.stats-table {
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 20rem;
}
.stats-table th,
.stats-table td {
  border: 1px solid var(--ui-border-accented);
  padding: 0.35rem 0.8rem;
  text-align: center;
}
.stats-table th {
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  color: var(--ui-text-highlighted);
  font-weight: 700;
}
.total-cell {
  font-weight: 700;
  color: var(--ui-primary);
}
.grand-row td {
  background: var(--ui-bg-muted);
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.chart-box {
  width: 100%;
  height: 200px;
}
.chart-box.tall {
  height: 260px;
}
</style>
