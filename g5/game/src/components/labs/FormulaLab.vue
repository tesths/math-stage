<script setup lang="ts">
/**
 * 用字母表示数量关系 Lab：青蛙歌 / 正方形 / 路程
 *
 * 三处对齐课本与量纲的改动：
 * - 青蛙歌：把 emoji 换成「能看到 2 只眼睛、4 条腿」的青蛙图形（n ≤ 12），并给出 1…5 的规律表，
 *   让学生自己看出「眼睛 = 2n、腿 = 4n」。
 * - 正方形：格子边长按**最大边长**定比例（原来 a>8 后图形被卡在 260px 不再变化），
 *   并把周长画成 4 条边、面积画成 a×a 个单位格，C = 4a、S = a² 都能从图上读出来。
 * - 路程：修掉「s = 45 米/分」的单位错误（路程单位应从速度单位里取出），并把 s = v × t
 *   画成 t 段、每段 v 的分段累加轨迹。
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { distanceUnit, frogCounts, frogRows, segmentLayout, speedSegments, squareCell, timeUnit } from '@/lib/labs/number'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 青蛙歌 ---------- */
const n = computed(() => Math.max(1, Math.round(props.values.n ?? 1)))
const counts = computed(() => frogCounts(n.value))
const MAX_DRAWN = 12
const drawnFrogs = computed(() => Array.from({ length: Math.min(n.value, MAX_DRAWN) }, (_, i) => i + 1))
const patternRows = computed(() => frogRows(5))
const showNRow = computed(() => n.value > 5)

/**
 * 「代入求值」步进：0 收起 → 1 关系式(2n) → 2 代入(2×n) → 3 结果。
 * 课本要建立的概念是「字母式既能表示关系、也能代入求值」，一步一步走比直接给结果更能看出这两件事。
 */
const frogStep = ref(0)
function nextFrogStep() {
  frogStep.value = Math.min(3, frogStep.value + 1)
  playClick()
}
function resetFrogStep() {
  frogStep.value = 0
  playClick()
}

/* ---------- 正方形 ---------- */
const a = computed(() => Math.max(1, Math.round(props.values.a ?? 1)))
const maxA = computed(() => Math.max(...props.lab.params.filter((p) => p.key === 'a').map((p) => p.max), a.value))
const SQ_BOX = 236
const cell = computed(() => squareCell(a.value, maxA.value, SQ_BOX))
const sidePx = computed(() => a.value * cell.value)
const sqX = computed(() => (300 - sidePx.value) / 2)
const sqY = computed(() => (300 - sidePx.value) / 2 + 8)
const perimeter = computed(() => 4 * a.value)
const squareArea = computed(() => a.value * a.value)
const gridLines = computed(() => Array.from({ length: Math.max(0, a.value - 1) }, (_, i) => (i + 1) * cell.value))

/**
 * a² 与 2a 对照（易错点：把 a² 读成 2×a）。
 * a = 2 时两个值恰好都是 4，这时更要讲清「数值碰巧相等、含义不同」，不能笼统说"不相等"。
 */
const showCompare = ref(false)
const doubleA = computed(() => 2 * a.value)
const compareEqual = computed(() => squareArea.value === doubleA.value)

/* ---------- 路程 ---------- */
const v = computed(() => props.values.v ?? 0)
const t = computed(() => Math.max(1, Math.round(props.values.t ?? 1)))
const s = computed(() => v.value * t.value)
const vUnit = computed(() => props.lab.params.find((p) => p.key === 'v')?.unit ?? '米/分')
const dUnit = computed(() => distanceUnit(vUnit.value))
const tUnit = computed(() => props.lab.params.find((p) => p.key === 't')?.unit ?? timeUnit(vUnit.value))
const TRACK_X0 = 30
const TRACK_W = 400
const layout = computed(() => segmentLayout(v.value, t.value, TRACK_W))
const seg = computed(() => speedSegments(v.value, t.value, layout.value.shownSegments))
const carX = ref(0)
const moving = ref(false)
function runMove() {
  moving.value = true
  carX.value = TRACK_W
  playClick()
  setTimeout(() => {
    moving.value = false
  }, 900)
}
function resetMove() {
  carX.value = 0
  moving.value = false
  playClick()
}

/**
 * 「知二求一」：s = v × t 是一个模型，三个量知道任意两个就能求第三个。
 * 三种问法各自给出算式与单位（这也是课本反复强调的"用字母表示数量关系"的用处）。
 */
const ASK_LABELS = ['求路程', '求速度', '求时间'] as const
const speedAsk = ref(0)
function pickAsk(i: number) {
  speedAsk.value = i
  playClick()
}
const askExpr = computed(() => {
  if (speedAsk.value === 0) return `s = v × t = ${v.value} × ${t.value} = ${s.value} ${dUnit.value}`
  if (speedAsk.value === 1) return `v = s ÷ t = ${s.value} ÷ ${t.value} = ${v.value} ${vUnit.value}`
  return `t = s ÷ v = ${s.value} ÷ ${v.value} = ${t.value} ${tUnit.value}`
})
</script>

<template>
  <div class="formula-wrap">
    <!-- 青蛙歌 -->
    <template v-if="kind === 'frog'">
      <div class="frog-area">
        <svg v-for="i in drawnFrogs" :key="i" viewBox="0 0 40 38" class="frog">
          <ellipse cx="20" cy="22" rx="13" ry="10" class="frog-body" />
          <circle cx="13" cy="10" r="5" class="frog-eye" />
          <circle cx="27" cy="10" r="5" class="frog-eye" />
          <circle cx="13" cy="10" r="2.2" class="frog-pupil" />
          <circle cx="27" cy="10" r="2.2" class="frog-pupil" />
          <path d="M 14 24 Q 20 29 26 24" class="frog-mouth" />
          <path d="M 9 29 L 4 35" class="frog-leg" />
          <path d="M 31 29 L 36 35" class="frog-leg" />
          <path d="M 15 32 L 14 37" class="frog-leg" />
          <path d="M 25 32 L 26 37" class="frog-leg" />
        </svg>
        <span v-if="n > MAX_DRAWN" class="frog-more">…共 {{ n }} 只</span>
      </div>
      <div class="frog-counts">
        <div class="count-box">
          <p class="count-num">{{ counts.mouths }}</p>
          <p class="count-label">张嘴（n）</p>
        </div>
        <div class="count-box">
          <p class="count-num">{{ counts.eyes }}</p>
          <p class="count-label">只眼睛（2 × {{ n }}）</p>
        </div>
        <div class="count-box">
          <p class="count-num">{{ counts.legs }}</p>
          <p class="count-label">条腿（4 × {{ n }}）</p>
        </div>
      </div>
      <table class="pattern-table" aria-label="青蛙歌规律表">
        <thead>
          <tr><th>只数</th><th>嘴</th><th>眼睛</th><th>腿</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in patternRows" :key="r.n" :class="{ active: r.n === n }">
            <td>{{ r.n }}</td><td>{{ r.mouths }}</td><td>{{ r.eyes }}</td><td>{{ r.legs }}</td>
          </tr>
          <tr v-if="showNRow" class="active">
            <td>n = {{ n }}</td><td>{{ counts.mouths }}</td><td>{{ counts.eyes }}</td><td>{{ counts.legs }}</td>
          </tr>
        </tbody>
      </table>
      <p class="formula-line">n 只青蛙 → n 张嘴，<b>2n</b> 只眼睛，<b>4n</b> 条腿</p>
      <div class="controls">
        <UButton
          size="sm"
          variant="outline"
          color="neutral"
          :disabled="frogStep >= 3"
          data-act
          data-test="frog-subst-next"
          @click="nextFrogStep"
        >
          {{ frogStep >= 3 ? '已算完' : '代入求值 · 一步一步算' }}
        </UButton>
        <UButton v-if="frogStep > 0" size="sm" variant="outline" color="neutral" @click="resetFrogStep">重来</UButton>
      </div>
      <div v-if="frogStep >= 1" class="subst-row" data-test="frog-subst" :data-step="frogStep">
        <span class="formula-chip">眼睛 = 2n（先用字母表示关系）</span>
        <span v-if="frogStep >= 2" class="formula-chip">= 2 × {{ n }}（把 n 代入 {{ n }}）</span>
        <span v-if="frogStep >= 3" class="formula-chip primary">= {{ counts.eyes }} 只；腿 = 4 × {{ n }} = {{ counts.legs }} 条</span>
      </div>
    </template>

    <!-- 正方形 -->
    <template v-else-if="kind === 'square'">
      <svg viewBox="0 0 300 300" class="w-full">
        <rect :x="sqX" :y="sqY" :width="sidePx" :height="sidePx" class="square-fill" rx="2" />
        <!-- 面积：a × a 个单位格 -->
        <g v-if="cell >= 8" class="square-grid">
          <line v-for="i in gridLines" :key="'v' + i" :x1="sqX + i" :y1="sqY" :x2="sqX + i" :y2="sqY + sidePx" />
          <line v-for="j in gridLines" :key="'h' + j" :x1="sqX" :y1="sqY + j" :x2="sqX + sidePx" :y2="sqY + j" />
        </g>
        <!-- 周长：4 条边分别标出 -->
        <rect :x="sqX" :y="sqY" :width="sidePx" :height="sidePx" class="square-outline" rx="2" />
        <text :x="sqX + sidePx / 2" :y="sqY - 8" text-anchor="middle" class="dim-label">上边 a = {{ a }}</text>
        <text :x="sqX + sidePx / 2" :y="sqY + sidePx + 18" text-anchor="middle" class="dim-label">下边 a = {{ a }}</text>
        <text :x="sqX - 8" :y="sqY + sidePx / 2" text-anchor="end" class="dim-label">a = {{ a }}</text>
        <text :x="sqX + sidePx + 8" :y="sqY + sidePx / 2" class="dim-label">a = {{ a }}</text>
        <text :x="sqX + sidePx / 2" :y="sqY + sidePx / 2 + 5" text-anchor="middle" class="area-label">
          a × a = {{ squareArea }}
        </text>
      </svg>
      <div class="formula-row">
        <span class="formula-chip">周长 C = a+a+a+a = 4a = {{ perimeter }} 厘米</span>
        <span class="formula-chip primary">面积 S = a × a = a² = {{ squareArea }} 平方厘米</span>
      </div>
      <p class="verify-line">
        ✓ 边长为 {{ a }} 厘米：周长 = 4 × {{ a }} = {{ perimeter }} 厘米；面积 = {{ a }} × {{ a }} = {{ squareArea }} 平方厘米（图上有 {{ squareArea }} 个单位格）
      </p>
      <div class="controls">
        <UButton
          size="sm"
          variant="outline"
          color="neutral"
          :aria-pressed="showCompare"
          data-test="square-compare-toggle"
          @click="showCompare = !showCompare" data-act>
          {{ showCompare ? '收起 a² 与 2a 对照' : '对比 a² 与 2a' }}
        </UButton>
      </div>
      <div v-if="showCompare" class="subst-row" data-test="square-compare" :data-equal="compareEqual">
        <span class="formula-chip">a² = a × a = {{ a }} × {{ a }} = {{ squareArea }}（面积，单位是平方厘米）</span>
        <span class="formula-chip">2a = a + a = 2 × {{ a }} = {{ doubleA }}（长度，单位是厘米）</span>
        <span v-if="compareEqual" class="formula-chip">
          a = {{ a }} 时两者数值恰好都是 {{ squareArea }}，但含义不同：a² 是 a×a 个单位格，2a 是 2 条边长相加
        </span>
        <span v-else class="formula-chip primary">
          a² = {{ squareArea }} ≠ 2a = {{ doubleA }}：所以 a² 表示 a × a，不是 2 × a
        </span>
      </div>
    </template>

    <!-- 路程 -->
    <template v-else>
      <svg viewBox="0 0 460 200" class="w-full">
        <!-- 分段轨迹：t 段，每段 v -->
        <line :x1="TRACK_X0" y1="130" :x2="TRACK_X0 + TRACK_W" y2="130" class="road" />
        <g v-for="k in layout.shownSegments" :key="'sg' + k">
          <line
            :x1="TRACK_X0 + (k - 1) * layout.segPx"
            y1="130"
            :x2="TRACK_X0 + k * layout.segPx"
            y2="130"
            class="seg-line"
            :class="{ alt: k % 2 === 0 }"
          />
          <line :x1="TRACK_X0 + (k - 1) * layout.segPx" y1="122" :x2="TRACK_X0 + (k - 1) * layout.segPx" y2="138" class="seg-tick" />
          <text
            :x="TRACK_X0 + (k - 0.5) * layout.segPx"
            y="118"
            text-anchor="middle"
            class="seg-label"
          >
            {{ v }} {{ dUnit }}
          </text>
          <text :x="TRACK_X0 + k * layout.segPx" y="152" text-anchor="middle" class="seg-cum">{{ k * v }}</text>
        </g>
        <line :x1="TRACK_X0 + layout.shownSegments * layout.segPx" y1="122" :x2="TRACK_X0 + layout.shownSegments * layout.segPx" y2="138" class="seg-tick" />
        <text :x="TRACK_X0" y="170" class="road-label">0</text>
        <text :x="TRACK_X0 + TRACK_W" y="170" text-anchor="end" class="road-label">
          共 {{ t }} 段 × {{ v }} {{ dUnit }} = s = {{ s }} {{ dUnit }}
        </text>
        <text v-if="layout.restSegments > 0" :x="TRACK_X0 + TRACK_W" y="186" text-anchor="end" class="road-label">
          （图上只画了前 {{ layout.shownSegments }} 段，还有 {{ layout.restSegments }} 段同样长）
        </text>
        <!-- 车 -->
        <g :style="{ transform: `translate(${carX}px, 0)`, transition: 'transform .8s ease-out' }">
          <text :x="TRACK_X0 - 12" y="124" font-size="26">🚗</text>
        </g>
      </svg>
      <div class="formula-row">
        <span class="formula-chip">速度 v = {{ v }} {{ vUnit }}</span>
        <span class="formula-chip">时间 t = {{ t }} {{ tUnit }}</span>
        <span class="formula-chip primary">路程 s = v × t = {{ s }} {{ dUnit }}</span>
      </div>
      <div class="controls">
        <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-arrow-right" @click="runMove" data-act>
          {{ moving ? '行驶中…' : '走一走 · 看路程累加' }}
        </UButton>
        <UButton v-if="carX > 0" size="sm" variant="outline" color="neutral" @click="resetMove">复位</UButton>
        <span class="verify-line">
          ✓ 每{{ tUnit }}行 {{ v }} {{ dUnit }}，行 {{ t }} {{ tUnit }} 就是 {{ t }} 个 {{ v }} 相加：
          {{ Array.from({ length: Math.min(t, 8) }, () => v).join(' + ') }}{{ t > 8 ? ' + …' : '' }} = {{ s }} {{ dUnit }}
        </span>
      </div>
      <p class="note">路程 = 速度 × 时间，用字母表示：s = v × t</p>
      <div class="controls" data-test="speed-ask">
        <UButton
          v-for="(lb, i) in ASK_LABELS"
          :key="lb"
          size="sm"
          :variant="speedAsk === i ? 'solid' : 'outline'"
          :color="speedAsk === i ? 'primary' : 'neutral'"
          :aria-pressed="speedAsk === i"
          @click="pickAsk(i)"
        >
          {{ lb }}
        </UButton>
        <span class="formula-chip primary" data-test="speed-ask-expr">{{ askExpr }}</span>
      </div>
      <p class="note">知道速度、时间、路程中的任意两个，就能求出第三个——这就是 s = v × t 这个模型的用处。</p>
    </template>
  </div>
</template>

<style scoped>
.formula-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.formula-wrap svg {
  max-width: 560px;
  height: auto;
}
.frog-area {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  max-width: 588px;
  justify-content: center;
  align-items: flex-end;
}
.frog {
  width: 44px;
  height: 42px;
}
.frog-body {
  fill: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.6;
}
.frog-eye {
  fill: white;
  stroke: var(--ui-primary);
  stroke-width: 1.2;
}
.frog-pupil {
  fill: var(--ui-text-highlighted);
}
.frog-mouth {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 1.2;
}
.frog-leg {
  stroke: var(--ui-primary);
  stroke-width: 1.8;
  stroke-linecap: round;
}
.frog-more {
  font-size: 1.1rem;
  color: var(--ui-text-muted);
  align-self: center;
}
.frog-counts {
  display: flex;
  gap: 1rem;
}
.count-box {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 1rem;
  text-align: center;
}
.count-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.count-label {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.pattern-table {
  border-collapse: collapse;
  font-size: 0.84rem;
}
.pattern-table th,
.pattern-table td {
  border: 1px solid var(--ui-border);
  padding: 0.15rem 0.7rem;
  text-align: center;
  color: var(--ui-text-toned);
}
.pattern-table th {
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-weight: 700;
}
.pattern-table tr.active td {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  color: var(--ui-primary);
  font-weight: 800;
}
.formula-line {
  font-size: 1.05rem;
  color: var(--ui-text-highlighted);
}
.formula-line b {
  color: var(--ui-primary);
}
.square-fill {
  fill: color-mix(in srgb, var(--ui-primary) 40%, white);
  transition: all 0.35s;
}
.square-outline {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 2.4;
}
.square-grid line {
  stroke: color-mix(in srgb, var(--ui-primary) 45%, white);
  stroke-width: 0.8;
}
.area-label {
  font-size: 0.95rem;
  font-weight: 700;
  fill: var(--ui-text-highlighted);
}
.dim-label,
.road-label {
  font-size: 12px;
  fill: var(--ui-text-muted);
  font-weight: 600;
}
.formula-row,
.controls,
.subst-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.formula-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.formula-chip.primary {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.road {
  stroke: var(--ui-text-muted);
  stroke-width: 3;
}
.seg-line {
  stroke: var(--ui-primary);
  stroke-width: 6;
}
.seg-line.alt {
  stroke: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.seg-tick {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.seg-label {
  font-size: 11px;
  fill: #b45309;
  font-weight: 700;
}
.seg-cum {
  font-size: 11px;
  fill: var(--ui-primary);
  font-weight: 800;
}
</style>
