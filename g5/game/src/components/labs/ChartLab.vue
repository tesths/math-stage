<script setup lang="ts">
/**
 * 统计 Lab：复式统计表 / 复式条形统计图（chart.js）
 *
 * 两个 Lab 都要有「学生自己动手」的环节（原来 ChartLab 一个操作按钮都没有）：
 * - stats-table：只看男生 / 只看女生 / 看全部（表格的列与条形图的数据集用同一份数据同步变化）；
 *   「验算合计」逐格给出 行合计（每班男生 + 女生）与 列合计（每一列从上往下加）的算式，并互证两种算法。
 * - stats-chart：先只看一组直条 → 再叠加第二组（分步揭示，配合 tip「看图时先看颜色对应的图例」）。
 *
 * chart.js 在 happy-dom 下拿不到 canvas context：它只 console.error 并提前 return，
 * 拿到的实例没有 `data` 字段（所以 watch 里必须判 `chart?.data`，否则滑块一拖就 TypeError）。
 * 因此这里把「图的图例与数据」同时渲染成 DOM（`.chart-legend`）：
 * ① 没有 canvas 时仍能核对「哪种颜色是哪一组」；② 测试可断言图例与数据集，不必碰 canvas 像素。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { LabDef, ParamValues } from '@data/schema/lab'

Chart.register(...registerables)

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const sum = (arr: number[]) => arr.reduce((acc, x) => acc + x, 0)

/* ---------- stats-table：复式统计表 ---------- */
const CLASSES = ['一班', '二班', '三班', '四班']
const boys = computed(() => [props.values.a1 ?? 0, props.values.a2 ?? 0, props.values.a3 ?? 0, props.values.a4 ?? 0])
const girls = computed(() => [props.values.b1 ?? 0, props.values.b2 ?? 0, props.values.b3 ?? 0, props.values.b4 ?? 0])
const classTotals = computed(() => boys.value.map((b, i) => b + girls.value[i]!))

type GroupKey = 'boys' | 'girls'
const GROUPS: { key: GroupKey; label: string; color: string }[] = [
  { key: 'boys', label: '男生', color: '#10b981' },
  { key: 'girls', label: '女生', color: '#f59e0b' },
]
const dataOf = (key: GroupKey) => (key === 'boys' ? boys.value : girls.value)

type TableView = 'all' | GroupKey
/** 只看哪一组：all / boys / girls */
const tableView = ref<TableView>('all')
const VIEW_OPTIONS: { key: TableView; label: string }[] = [
  { key: 'all', label: '看全部' },
  { key: 'boys', label: '只看男生' },
  { key: 'girls', label: '只看女生' },
]
const visibleGroups = computed(() => (tableView.value === 'all' ? GROUPS : GROUPS.filter((g) => g.key === tableView.value)))

type ColKey = GroupKey | 'total'
const tableColumns = computed<{ key: ColKey; label: string }[]>(() => {
  const cols: { key: ColKey; label: string }[] = visibleGroups.value.map((g) => ({ key: g.key, label: `${g.label}/人` }))
  if (tableView.value === 'all') cols.push({ key: 'total', label: '合计/人' })
  return cols
})
const cell = (i: number, key: ColKey) =>
  key === 'boys' ? boys.value[i]! : key === 'girls' ? girls.value[i]! : classTotals.value[i]!
const grandRow = computed(() => tableColumns.value.map((c) => (c.key === 'total' ? sum(classTotals.value) : sum(dataOf(c.key)))))

/* 验算合计：逐格给出行合计 / 列合计的算式，再用两种算法互证 */
const verifyOpen = ref(false)
const verifyRows = computed(() =>
  CLASSES.map((name, i) => ({
    name,
    expr: `${boys.value[i]} + ${girls.value[i]} = ${classTotals.value[i]}`,
    total: classTotals.value[i]!,
  })),
)
const verifyColumns = computed(() =>
  GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    expr: `${dataOf(g.key).join(' + ')} = ${sum(dataOf(g.key))}`,
    total: sum(dataOf(g.key)),
  })),
)
const rowSumExpr = computed(() => classTotals.value.join(' + '))
const colSumExpr = computed(() => verifyColumns.value.map((c) => c.total).join(' + '))
const grandTotal = computed(() => sum(classTotals.value))
/** 行合计之和 === 列合计之和（基础数据改错时会立刻暴露） */
const verifyOk = computed(() => sum(verifyColumns.value.map((c) => c.total)) === grandTotal.value)

/* ---------- stats-chart：复式条形统计图 ---------- */
const ACTIVITIES = ['做家务', '做作业', '体育锻炼', '课外阅读', '看电视']
const selfTime = computed(() => [props.values.s1 ?? 0, props.values.s2 ?? 0, props.values.s3 ?? 0, props.values.s4 ?? 0, props.values.s5 ?? 0])
const deskTime = computed(() => [props.values.d1 ?? 0, props.values.d2 ?? 0, props.values.d3 ?? 0, props.values.d4 ?? 0, props.values.d5 ?? 0])
const barGroups = computed(() => [
  { key: 'self', label: '自己', color: '#10b981', data: selfTime.value },
  { key: 'desk', label: '同桌', color: '#3b82f6', data: deskTime.value },
])
/** 分步揭示：第 1 步只有一组直条，第 2 步两组并列 */
const revealStep = ref(1)
const REVEAL_OPTIONS = [
  { step: 1, label: '只显示一组' },
  { step: 2, label: '叠加第二组' },
]
const revealText = computed(() =>
  revealStep.value === 1
    ? '图里现在只有「自己」这一组直条（绿色），先认出图例再看直条'
    : '叠加了「同桌」这一组（蓝色），两组直条并列才好比较',
)

/* ---------- 图：表格与条形图共用同一份数据 ---------- */
const chartLabels = computed(() => (kind.value === 'stats-table' ? CLASSES : ACTIVITIES))
const tableDatasets = computed(() =>
  visibleGroups.value.map((g) => ({ key: g.key as string, label: g.label, color: g.color, data: dataOf(g.key) })),
)
const chartDatasets = computed(() => {
  if (kind.value === 'stats-table') return tableDatasets.value
  return revealStep.value === 1 ? barGroups.value.slice(0, 1) : barGroups.value
})
const unitWord = computed(() => (kind.value === 'stats-table' ? '人' : '时'))

/* ---------- chart.js（无 canvas context 时静默降级到 DOM 图例） ---------- */
const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const chartUnavailable = ref(false)

function buildDatasets() {
  return chartDatasets.value.map((d) => ({
    label: d.label,
    data: [...d.data],
    backgroundColor: d.color,
    borderRadius: 6,
    maxBarThickness: 42,
  }))
}

function renderChart() {
  if (!chartRef.value) return
  if (chart) {
    try {
      chart.destroy()
    } catch {
      /* 未成功创建的实例 destroy 会抛错，忽略即可 */
    }
    chart = null
  }
  try {
    chart = new Chart(chartRef.value, {
      type: 'bar',
      data: { labels: chartLabels.value, datasets: buildDatasets() },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}：${ctx.parsed.y}${kind.value === 'stats-table' ? ' 人' : ' 时'}`,
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
  } catch {
    chart = null
  }
  // happy-dom 下 new Chart 只 console.error 后 return：实例在但 ctx / canvas 都是 null → 视为「画不出来」
  chartUnavailable.value = !isLive(chart)
}

/** 真正建成的图表：拿得到 2D context 才算（happy-dom 下失败的实例 data 仍在，不能用 data 判） */
function isLive(c: Chart | null): c is Chart {
  return !!c && !!(c as unknown as { ctx?: unknown }).ctx
}

function liveChart(): Chart | null {
  return isLive(chart) ? chart : null
}

onMounted(renderChart)
watch(
  () => JSON.stringify([chartLabels.value, chartDatasets.value]),
  () => {
    // 没有真正建成的图表实例时不要碰它（滑块联动、切筛选都会走到这里）
    const c = liveChart()
    if (!c) return
    c.data.labels = chartLabels.value
    // 数据集个数会随筛选 / 分步变化，必须整体替换而不是按下标改写
    c.data.datasets = buildDatasets() as never
    c.update()
  },
)
onBeforeUnmount(() => {
  try {
    chart?.destroy()
  } catch {
    /* 忽略：未成功创建的实例 */
  }
  chart = null
})
</script>

<template>
  <div class="chart-wrap">
    <!-- 复式统计表 -->
    <template v-if="kind === 'stats-table'">
      <div class="op-bar" role="group" aria-label="选择要比较的一组数据">
        <span class="op-label">比较哪一组：</span>
        <button
          v-for="opt in VIEW_OPTIONS"
          :key="opt.key"
          type="button"
          :data-act="opt.key === 'boys' ? '' : null"
          class="op-btn"
          :class="{ active: tableView === opt.key }"
          :aria-pressed="tableView === opt.key"
          @click="tableView = opt.key"
        >
          {{ opt.label }}
        </button>
      </div>

      <table class="stats-table" :data-view="tableView">
        <thead>
          <tr>
            <th>班级</th>
            <th v-for="col in tableColumns" :key="col.key">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in CLASSES" :key="c">
            <td>{{ c }}</td>
            <td v-for="col in tableColumns" :key="col.key" :class="{ 'total-cell': col.key === 'total' }">
              {{ cell(i, col.key) }}
            </td>
          </tr>
          <tr class="grand-row">
            <td>合计</td>
            <td v-for="(col, ci) in tableColumns" :key="col.key">{{ grandRow[ci] }}</td>
          </tr>
        </tbody>
      </table>

      <div class="op-bar">
        <button
          type="button"
          class="op-btn"
          :class="{ active: verifyOpen }"
          :aria-pressed="verifyOpen"
          @click="verifyOpen = !verifyOpen"
        >
          {{ verifyOpen ? '收起验算' : '验算合计' }}
        </button>
        <span class="op-label">点开逐格看 行合计 / 列合计 的算式</span>
      </div>

      <div v-if="verifyOpen" class="verify-panel">
        <p class="verify-title">行合计：每个班 男生 + 女生</p>
        <p v-for="r in verifyRows" :key="r.name" class="verify-item" data-kind="row">
          {{ r.name }}：{{ r.expr }}（人）
        </p>
        <p class="verify-title">列合计：每一列从上往下加</p>
        <p v-for="c in verifyColumns" :key="c.key" class="verify-item" data-kind="col">
          {{ c.label }}合计：{{ c.expr }}（人）
        </p>
        <p class="verify-title">两种算法互相验算</p>
        <p class="verify-item" data-kind="cross">行合计相加：{{ rowSumExpr }} = {{ grandTotal }}（人）</p>
        <p class="verify-item" data-kind="cross">列合计相加：{{ colSumExpr }} = {{ grandTotal }}（人）</p>
        <p class="verify-line" :data-ok="String(verifyOk)">
          ✓ 行合计与列合计都是 {{ grandTotal }} 人，两种算法结果相同
        </p>
      </div>
    </template>

    <!-- 复式条形统计图：分步揭示两组直条 -->
    <template v-else>
      <div class="op-bar" role="group" aria-label="分步显示两组直条">
        <span class="op-label">看图先看颜色对应的图例：</span>
        <button
          v-for="opt in REVEAL_OPTIONS"
          :key="opt.step"
          type="button"
          :data-act="opt.step === 2 ? '' : null"
          class="op-btn"
          :class="{ active: revealStep === opt.step }"
          :aria-pressed="revealStep === opt.step"
          @click="revealStep = opt.step"
        >
          {{ opt.label }}
        </button>
      </div>
      <p class="reveal-state" :data-step="revealStep" :data-groups="chartDatasets.length">
        第 {{ revealStep }} 步：{{ chartDatasets.length }} 组直条 —— {{ revealText }}
      </p>
    </template>

    <!-- 图例：颜色 ↔ 数据组（无 canvas 时唯一能看到的「图」） -->
    <div
      class="chart-legend"
      :data-dataset-count="chartDatasets.length"
      :data-dataset-labels="chartDatasets.map((d) => d.label).join(',')"
    >
      <span v-for="d in chartDatasets" :key="d.key" class="legend-item" :data-key="d.key">
        <i class="legend-swatch" :style="{ background: d.color }" />
        {{ d.label }}（{{ unitWord }}）
      </span>
    </div>

    <p v-if="chartUnavailable" class="chart-fallback" role="note">
      当前环境画不出条形图，请用上面的图例（和统计表）核对数据。
    </p>

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
.op-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.op-label {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.op-btn {
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  border-radius: 9999px;
  padding: 0.22rem 0.7rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.op-btn:hover {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.op-btn.active {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
  color: white;
  font-weight: 700;
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
.verify-panel {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg, 0.5rem);
  padding: 0.5rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-width: 40rem;
  width: 100%;
}
.verify-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  margin-top: 0.25rem;
}
.verify-item {
  font-size: 0.85rem;
  font-family: ui-monospace, monospace;
  color: var(--ui-text-toned);
}
.verify-line {
  margin-top: 0.35rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.84rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  text-align: center;
}
.reveal-state {
  font-size: 0.86rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 34rem;
}
.chart-legend {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
  justify-content: center;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.legend-swatch {
  display: inline-block;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 3px;
}
.chart-fallback {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.chart-box {
  width: 100%;
  height: 200px;
}
.chart-box.tall {
  height: 260px;
}
</style>
