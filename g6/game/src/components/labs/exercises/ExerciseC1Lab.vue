<script setup lang="ts">
/**
 * 练习题 Lab · 一 小数乘法和除法（二）
 * ex-c1-div11-cycle  除以 11 的循环小数（长除法 / 循环节 / 规律表 / 放大数轴）
 * ex-c1-pgram-area   平行四边形面积估算（估算值与计算值对比）
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { roundTo, toFixed2 } from '@/lib/engine/math'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ================= 除以 11 的循环小数 ================= */
const DIVISOR = 11
const n = computed(() => {
  const v = Math.round(props.values.n ?? 3)
  return Math.min(10, Math.max(1, v))
})
const digits = computed(() => {
  const v = Math.round(props.values.digits ?? 2)
  return Math.min(3, Math.max(1, v))
})

/** 长除法：n < 11，个位余数即 n；逐位求商与余数，直到余数重复 */
const division = computed(() => {
  const t1 = n.value * 10
  const d1 = Math.floor(t1 / DIVISOR)
  const rem1 = t1 % DIVISOR
  const t2 = rem1 * 10
  const d2 = Math.floor(t2 / DIVISOR)
  const rem2 = t2 % DIVISOR
  return { t1, d1, rem1, t2, d2, rem2, p1: d1 * DIVISOR, p2: d2 * DIVISOR }
})
const cycle = computed(() => `${division.value.d1}${division.value.d2}`)
const exact = computed(() => n.value / DIVISOR)
const approx = computed(() => roundTo(exact.value, digits.value))
const approxText = computed(() => approx.value.toFixed(digits.value))
const exactText = computed(() => `0.${(cycle.value + cycle.value).slice(0, 4)}`)
const cycleFormula = computed(() => `9 × ${n.value} = ${9 * n.value}`)

/** 商的小数展示：0.2727… */
/** 过程态：一位一位地算，直到看出"同样的两位又出现" */
const allDigits = computed(() => ['0', '.', ...`${cycle.value}${cycle.value}`.split(''), '…'])
const shownDigits = ref(allDigits.value.length)
const quotientDigits = computed(() => allDigits.value.slice(0, shownDigits.value))
const digitsLeft = computed(() => allDigits.value.length - shownDigits.value)
function nextDigit() {
  if (digitsLeft.value <= 0) return
  shownDigits.value += 1
  playClick()
}
function resetDigits() {
  shownDigits.value = 2
  playClick()
}
const ARC_CHAR_W = 24
const ARC_START_X = 40
const arcPath = computed(() => {
  const x1 = ARC_START_X + 2 * ARC_CHAR_W - 4
  const x2 = ARC_START_X + 4 * ARC_CHAR_W - 4
  const mid = (x1 + x2) / 2
  return `M ${x1} 38 Q ${mid} 8 ${x2} 38`
})

/** 规律表 1÷11 … 10÷11 */
const ruleRows = computed(() =>
  Array.from({ length: 10 }, (_, i) => {
    const k = i + 1
    const c = String(9 * k).padStart(2, '0')
    return { k, text: `${k} ÷ 11 = 0.${c}${c}…`, active: k === n.value }
  }),
)

/** 放大数轴窗口：始终包含精确值与近似值，最小跨度 0.05 */
const zoom = computed(() => {
  let lo = Math.min(exact.value, approx.value) - 0.01
  let hi = Math.max(exact.value, approx.value) + 0.01
  const span = 0.05
  if (hi - lo < span) {
    const mid = (lo + hi) / 2
    lo = mid - span / 2
    hi = mid + span / 2
  }
  return { lo, hi }
})
const ZX0 = 24
const ZX1 = 296
function zx(v: number): number {
  const { lo, hi } = zoom.value
  const t = (v - lo) / (hi - lo)
  return ZX0 + Math.min(1, Math.max(0, t)) * (ZX1 - ZX0)
}
const zExactX = computed(() => zx(exact.value))
const zApproxX = computed(() => zx(approx.value))
const zoomLoText = computed(() => zoom.value.lo.toFixed(4))
const zoomHiText = computed(() => zoom.value.hi.toFixed(4))

/* ================= 平行四边形面积估算 ================= */
const base = computed(() => props.values.base ?? 3.2)
const height = computed(() => props.values.height ?? 1.84)
const digits2 = computed(() => Math.min(2, Math.max(1, Math.round(props.values.digits ?? 1))))
const exactArea = computed(() => base.value * height.value)
const approxArea = computed(() => roundTo(exactArea.value, digits2.value))
const approxAreaText = computed(() => approxArea.value.toFixed(digits2.value))
const estimateArea = computed(() => Math.round(base.value) * Math.round(height.value))
const exactAreaText = computed(() => String(Number(exactArea.value.toFixed(3))))

/** 过程态：默认 true 保持"估算 + 精确"同屏；切到 false 时先只看估算，弱化精确值直条 */
const revealExact = ref(true)
function toggleExact() {
  revealExact.value = !revealExact.value
  playClick()
}
const pgramNote = computed(() =>
  revealExact.value
    ? `先估一估：把 ${toFixed2(base.value)} 和 ${toFixed2(height.value)} 都看成整数，${Math.round(base.value)} × ${Math.round(height.value)} = ${estimateArea.value} 平方分米，再和精确计算做对照`
    : `现在只看估算：${Math.round(base.value)} × ${Math.round(height.value)} = ${estimateArea.value} 平方分米，精确值那一根先弱化，估完再回来对照`,
)

const BASE_K = 44
const HEIGHT_K = 42
const SHEAR = 26
const PG_X0 = 55
const PG_Y0 = 190
const basePx = computed(() => Math.min(base.value * BASE_K, 220))
const heightPx = computed(() => Math.min(height.value * HEIGHT_K, 126))
const pgram = computed(() => {
  const x0 = PG_X0
  const y0 = PG_Y0
  const b = basePx.value
  const h = heightPx.value
  return {
    bl: { x: x0, y: y0 },
    br: { x: x0 + b, y: y0 },
    tl: { x: x0 + SHEAR, y: y0 - h },
    tr: { x: x0 + b + SHEAR, y: y0 - h },
    foot: { x: x0 + SHEAR, y: y0 },
    baseMid: { x: x0 + b / 2, y: y0 + 20 },
    heightMid: { x: x0 + SHEAR + 12, y: y0 - h / 2 },
    center: { x: x0 + b / 2 + SHEAR / 2, y: y0 - h / 2 },
  }
})
const polygonPoints = computed(() => {
  const g = pgram.value
  return `${g.bl.x},${g.bl.y} ${g.br.x},${g.br.y} ${g.tr.x},${g.tr.y} ${g.tl.x},${g.tl.y}`
})
const rightAngle = computed(() => {
  const f = pgram.value.foot
  return `M ${f.x} ${f.y - 12} L ${f.x + 12} ${f.y - 12} L ${f.x + 12} ${f.y}`
})

/** 估算值 / 计算值 并排竖条 */
const BAR_H = 130
const BAR_Y = 170
const barMax = computed(() => Math.max(estimateArea.value, exactArea.value) * 1.15)
const bars = computed(() => {
  const hi = (estimateArea.value / barMax.value) * BAR_H
  const hx = (exactArea.value / barMax.value) * BAR_H
  return {
    estimate: { x: 36, y: BAR_Y - hi, h: hi },
    exact: { x: 114, y: BAR_Y - hx, h: hx },
  }
})
</script>

<template>
  <div class="ex-c1-wrap">
    <!-- 除以 11 的循环小数 -->
    <template v-if="kind === 'ex-c1-div11-cycle'">
      <div class="cycle-grid">
        <div class="cycle-card">
          <h4 class="card-title">长除法竖式</h4>
          <svg class="long-div" width="340" height="210" viewBox="0 0 340 210">
            <text x="86" y="34" class="ld-q">0.{{ division.d1 }}{{ division.d2 }}…</text>
            <path d="M 74 44 L 300 44" stroke="var(--ui-text-muted)" stroke-width="1.5" />
            <path d="M 74 44 L 74 172" stroke="var(--ui-text-muted)" stroke-width="1.5" />
            <text x="64" y="70" text-anchor="end" class="ld-divisor">11</text>
            <text x="86" y="70" class="ld-num">{{ n }}.0000</text>
            <text x="86" y="96" class="ld-work">{{ division.t1 }}</text>
            <text x="86" y="114" class="ld-work">−{{ division.p1 }}</text>
            <path d="M 82 120 L 150 120" stroke="var(--ui-text-muted)" stroke-width="1" />
            <text x="86" y="138" class="ld-work">{{ division.t2 }}</text>
            <text x="86" y="156" class="ld-work">−{{ division.p2 }}</text>
            <path d="M 82 162 L 150 162" stroke="var(--ui-text-muted)" stroke-width="1" />
            <text x="86" y="182" class="ld-work ld-repeat">{{ division.t1 }}</text>
            <text x="170" y="182" class="ld-note">← 余数 {{ division.rem2 }} 又出现，开始循环</text>
          </svg>
        </div>

        <div class="cycle-card">
          <h4 class="card-title">循环节</h4>
          <svg class="cycle-arc" width="340" height="104" viewBox="0 0 340 104">
            <text
              v-for="(ch, i) in quotientDigits"
              :key="i"
              :x="ARC_START_X + i * ARC_CHAR_W"
              y="62"
              class="ca-digit"
              :class="{ 'ca-cycle': i >= 2 && i <= 3 }"
            >{{ ch }}</text>
            <path :d="arcPath" class="ca-arc" />
            <text x="40" y="94" class="ca-lbl">循环节 {{ cycle }}</text>
            <text x="200" y="94" class="ca-lbl">{{ cycleFormula }}</text>
          </svg>
          <div class="digit-steps">
            <UButton size="sm" color="primary" :disabled="digitsLeft <= 0" @click="nextDigit">
              再多算一位
            </UButton>
            <UButton size="sm" variant="outline" color="neutral" :disabled="shownDigits <= 2" @click="resetDigits" data-act>
              重来
            </UButton>
            <span class="digit-note">
              {{ digitsLeft > 0
                ? `才算出 ${shownDigits - 2} 位小数，再算一位看数字有没有重复`
                : `算到 "${cycle}${cycle}" 又出现了——余数重复，商就跟着重复，循环节就是 ${cycle}` }}
            </span>
          </div>
        </div>

        <div class="cycle-card">
          <h4 class="card-title">规律表</h4>
          <ul class="rule-table">
            <li v-for="row in ruleRows" :key="row.k" class="rule-row" :class="{ active: row.active }">
              {{ row.text }}
            </li>
          </ul>
        </div>

        <div class="cycle-card">
          <h4 class="card-title">放大数轴（{{ exactText }}… 附近）</h4>
          <svg class="zoom-line" width="340" height="84" viewBox="0 0 340 84">
            <line :x1="ZX0" y1="42" :x2="ZX1" y2="42" stroke="var(--ui-border-accented)" stroke-width="2" />
            <line :x1="ZX0" y1="36" :x2="ZX0" y2="48" stroke="var(--ui-text-muted)" stroke-width="1.5" />
            <line :x1="ZX1" y1="36" :x2="ZX1" y2="48" stroke="var(--ui-text-muted)" stroke-width="1.5" />
            <text :x="ZX0" y="64" text-anchor="middle" class="zl-tick">{{ zoomLoText }}</text>
            <text :x="ZX1" y="64" text-anchor="middle" class="zl-tick">{{ zoomHiText }}</text>
            <line :x1="zExactX" y1="24" :x2="zExactX" y2="42" stroke="#b45309" stroke-width="2" />
            <circle :cx="zExactX" cy="42" r="3.5" fill="#b45309" />
            <text :x="zExactX" y="18" text-anchor="middle" class="zl-mark amber">{{ exactText }}…</text>
            <line :x1="zApproxX" y1="42" :x2="zApproxX" y2="60" stroke="var(--ui-primary)" stroke-width="2" />
            <circle :cx="zApproxX" cy="42" r="3.5" fill="var(--ui-primary)" />
            <text :x="zApproxX" y="76" text-anchor="middle" class="zl-mark primary">{{ approxText }}</text>
          </svg>
        </div>
      </div>
      <p class="cycle-sum">
        {{ n }} ÷ 11 = 0.{{ cycle }}{{ cycle }}…（循环节 {{ cycle }}），保留 {{ digits }} 位小数 ≈
        <b>{{ approxText }}</b>
      </p>
    </template>

    <!-- 平行四边形面积估算 -->
    <template v-else-if="kind === 'ex-c1-pgram-area'">
      <div class="pgram-stage">
        <div class="pgram-card">
          <svg class="pgram-svg" width="360" height="250" viewBox="0 0 360 250">
            <polygon :points="polygonPoints" class="pg-shape" />
            <line
              :x1="pgram.bl.x" :y1="pgram.bl.y" :x2="pgram.br.x" :y2="pgram.br.y"
              stroke="var(--ui-primary)" stroke-width="2.5"
            />
            <line
              :x1="pgram.tl.x" :y1="pgram.tl.y" :x2="pgram.foot.x" :y2="pgram.foot.y"
              stroke="#b45309" stroke-width="1.8" stroke-dasharray="5 4"
            />
            <path :d="rightAngle" fill="none" stroke="#b45309" stroke-width="1.5" />
            <text :x="pgram.baseMid.x" :y="pgram.baseMid.y" text-anchor="middle" class="pg-lbl">
              底 {{ toFixed2(base) }} 分米
            </text>
            <text :x="pgram.heightMid.x" :y="pgram.heightMid.y" class="pg-lbl amber">
              高 {{ toFixed2(height) }} 分米
            </text>
            <text :x="pgram.center.x" :y="pgram.center.y" text-anchor="middle" class="pg-area">
              面积 ≈ {{ approxAreaText }} 平方分米
            </text>
          </svg>
        </div>

        <div class="pgram-card" :class="{ 'hide-exact': !revealExact }">
          <h4 class="card-title">估算 vs 计算</h4>
          <svg class="pgram-bars" width="200" height="210" viewBox="0 0 200 210">
            <line x1="20" y1="170" x2="180" y2="170" stroke="var(--ui-border-accented)" stroke-width="2" />
            <rect
              class="bar estimate" :x="bars.estimate.x" :y="bars.estimate.y"
              width="46" :height="bars.estimate.h" rx="4"
            />
            <rect
              class="bar exact" :x="bars.exact.x" :y="bars.exact.y"
              width="46" :height="bars.exact.h" rx="4"
            />
            <text
              :x="bars.estimate.x + 23" :y="bars.estimate.y - 8" text-anchor="middle" class="pg-lbl"
            >
              估算 {{ estimateArea }}
            </text>
            <text :x="bars.exact.x + 23" :y="bars.exact.y - 8" text-anchor="middle" class="pg-lbl exact-lbl">
              计算 {{ exactAreaText }}
            </text>
            <text x="59" y="190" text-anchor="middle" class="pg-sub">≈{{ Math.round(base) }}×{{ Math.round(height) }}</text>
            <text x="137" y="190" text-anchor="middle" class="pg-sub">{{ toFixed2(base) }}×{{ toFixed2(height) }}</text>
          </svg>
          <div class="pgram-steps">
            <UButton size="sm" variant="outline" color="neutral" @click="toggleExact" data-act>
              {{ revealExact ? '先只看估算' : '再看精确计算' }}
            </UButton>
            <span class="pgram-note">{{ pgramNote }}</span>
          </div>
        </div>
      </div>
      <p class="pgram-sum">
        面积 = 底 × 高 = {{ toFixed2(base) }} × {{ toFixed2(height) }} = {{ exactAreaText }}，保留
        {{ digits2 }} 位小数 ≈ <b>{{ approxAreaText }}</b> 平方分米
      </p>
    </template>
  </div>
</template>

<style scoped>
.ex-c1-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 320px;
}
.card-title {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--ui-text-toned);
}

/* ---------- 除以 11 的循环小数 ---------- */
.digit-steps {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.digit-note {
  font-size: 0.74rem;
  color: var(--ui-text-muted);
  max-width: 20rem;
}
.cycle-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
}
.cycle-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.45rem 0.6rem;
}
.cycle-card svg {
  max-width: 100%;
  height: auto;
}
.ld-q {
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 800;
  fill: var(--ui-primary);
}
.ld-num {
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.ld-divisor {
  font-family: ui-monospace, monospace;
  font-size: 15px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.ld-work {
  font-family: ui-monospace, monospace;
  font-size: 13px;
  fill: var(--ui-text-muted);
}
.ld-repeat {
  fill: #b45309;
  font-weight: 800;
}
.ld-note {
  font-size: 11px;
  fill: #b45309;
  font-weight: 700;
}
.ca-digit {
  font-family: ui-monospace, monospace;
  font-size: 22px;
  font-weight: 700;
  fill: var(--ui-text-muted);
}
.ca-cycle {
  fill: var(--ui-primary);
  font-weight: 800;
}
.ca-arc {
  fill: none;
  stroke: var(--ui-primary);
  stroke-width: 2;
}
.ca-lbl {
  font-size: 12px;
  font-weight: 800;
  fill: #b45309;
}
.rule-table {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.15rem 0.6rem;
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: ui-monospace, monospace;
  font-size: 0.76rem;
  color: var(--ui-text-toned);
}
.rule-row {
  padding: 0.08rem 0.3rem;
  border-radius: 0.35rem;
  white-space: nowrap;
}
.rule-row.active {
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
  font-weight: 800;
}
.zl-tick {
  font-size: 10px;
  fill: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
.zl-mark {
  font-size: 11px;
  font-weight: 800;
}
.zl-mark.amber {
  fill: #b45309;
}
.zl-mark.primary {
  fill: var(--ui-primary);
}
.cycle-sum,
.pgram-sum {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
  text-align: center;
}
.cycle-sum b,
.pgram-sum b {
  color: var(--ui-primary);
  font-size: 1.05rem;
}

/* ---------- 平行四边形面积估算 ---------- */
.pgram-stage {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}
.pgram-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  padding: 0.45rem 0.6rem;
}
.pgram-card svg {
  max-width: 100%;
  height: auto;
}
.pg-shape {
  fill: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  stroke: var(--ui-primary);
  stroke-width: 2.5;
}
.pg-lbl {
  font-size: 12px;
  font-weight: 700;
  fill: var(--ui-text-toned);
}
.pg-lbl.amber {
  fill: #b45309;
}
.pg-area {
  font-size: 13px;
  font-weight: 800;
  fill: var(--ui-primary);
}
.pg-sub {
  font-size: 10px;
  fill: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
.bar.estimate {
  fill: color-mix(in srgb, var(--ui-primary) 30%, var(--ui-bg-muted));
  stroke: var(--ui-border-accented);
  stroke-width: 1;
}
.bar.exact {
  fill: var(--ui-primary);
}
/* 过程态：先只看估算时弱化精确值直条与其标注 */
.hide-exact .bar.exact,
.hide-exact .exact-lbl {
  opacity: 0.15;
}
.pgram-steps {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 15rem;
}
.pgram-note {
  font-size: 0.74rem;
  color: var(--ui-text-muted);
}
</style>
