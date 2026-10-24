<script setup lang="ts">
/**
 * 因数与倍数 Lab：因数拼长方形 / 倍数数轴 / 质数筛 / 公因数公倍数
 *
 * 三处对齐课本的改动：
 * - 拼长方形：每种拼法都按**同一比例尺**真的画出 w×h 个小正方形（原来超 6 就截断成示意图），
 *   并给出「12 的因数有 6 个 → 能拼成 3 种长方形」。
 * - 倍数数轴：标出「每次加 n」的跳跃箭头，落点等距。
 * - 质数筛：按 2→3→5→7 逐轮划掉倍数（可点「筛一轮」），被划掉的数标出理由，
 *   并断言「筛完剩下的恰好是质数」。
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { factorsOf, lcm, primesUpTo } from '@/lib/engine/math'
import { SIEVE_PRIMES, axisTicks, factorPairs, multiples, sieveReasons, sieveRemaining } from '@/lib/labs/number'
import { playClick } from '@/lib/sound'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 因数 ---------- */
const n = computed(() => Math.round(props.values.n ?? 1))
const pairs = computed(() => factorPairs(n.value))
const allFactors = computed(() => factorsOf(n.value))
/** 同一比例尺：以最大的那条边（= n）为准，画框 128px */
const PAIR_BOX = 128
const pairCell = computed(() => PAIR_BOX / Math.max(1, Math.max(...pairs.value.map(([, h]) => h))))
const pairShapes = computed(() =>
  pairs.value.map(([w, h]) => ({
    w,
    h,
    px: w * pairCell.value,
    py: h * pairCell.value,
    cell: pairCell.value,
  })),
)

/* ---------- 成对找因数（一次找出一对；两个因数相同只算一个） ---------- */
const pairStep = ref(0)
const pairStepMax = computed(() => pairs.value.length)
const pairDone = computed(() => pairStep.value >= pairStepMax.value)
const revealedPairs = computed(() => pairs.value.slice(0, pairStep.value))
/** 已经找到的因数：同一对里两个因数相同时只算一个 */
const revealedFactors = computed(() => {
  const out: number[] = []
  for (const [x, y] of revealedPairs.value) {
    if (!out.includes(x)) out.push(x)
    if (!out.includes(y)) out.push(y)
  }
  return out.sort((p, q) => p - q)
})
const samePair = computed(() => revealedPairs.value.find(([x, y]) => x === y) ?? null)
const revealedPairsText = computed(() => revealedPairs.value.map(([x, y]) => `${x}×${y}`).join('、'))
function nextPair() {
  if (pairDone.value) return
  pairStep.value++
  playClick()
}
function resetPair() {
  pairStep.value = 0
  playClick()
}
watch(n, () => {
  pairStep.value = 0
})

/* ---------- 倍数 ---------- */
const mBase = computed(() => Math.round(props.values.n ?? 3))
const mCount = computed(() => Math.round(props.values.k ?? 10))
const mList = computed(() => multiples(mBase.value, mCount.value))
const lineMax = computed(() => Math.max(30, mList.value[mList.value.length - 1] ?? 30))
const lineStep = computed(() => Math.max(1, Math.ceil(lineMax.value / 12 / mBase.value) * mBase.value))
const lineTicks = computed(() => axisTicks(lineMax.value, lineStep.value))
const LINE_X0 = 26
const LINE_W = 408
const lineX = (v: number) => LINE_X0 + (v * LINE_W) / lineMax.value
/**
 * 逐次跳跃（第 4 轮 agent C 补的 L3 过程态）：
 * 初始把这条数轴上的倍数点全部画出来，但「跳了几次、每次从哪加到哪」需要学生自己点出来——
 * 每点一次就点亮一段跳跃弧、把落点放大，并给出「3 → 6（+3）：第 2 个倍数」这样的中间读数。
 * 原来这一页只有滑块，没有任何操作按钮（截图前后逐字节相同），属于静态图当过程。
 */
const mJump = ref(0)
const mJumpMax = computed(() => Math.max(0, mList.value.length - 1))
const mJumpFrom = computed(() => mList.value[Math.max(0, mJump.value - 1)] ?? 0)
const mJumpTo = computed(() => mList.value[Math.min(mJump.value, mList.value.length - 1)] ?? mBase.value)
const mJumpDone = computed(() => mJump.value >= mJumpMax.value)
const mJumpStatus = computed(() =>
  mJump.value === 0
    ? `还没开始跳：从 0 出发，第一步落到 ${mBase.value}`
    : `第 ${mJump.value} 次跳跃：${mJumpFrom.value} → ${mJumpTo.value}（+${mBase.value}），落在第 ${mJump.value + 1} 个倍数 ${mJumpTo.value}`,
)
function nextJump() {
  if (mJumpDone.value) return
  mJump.value++
  playClick()
}
function jumpAll() {
  mJump.value = mJumpMax.value
  playClick()
}
function resetJump() {
  mJump.value = 0
  playClick()
}
watch(mBase, () => {
  mJump.value = 0
})

/* ---------- 质数 ---------- */
const primeN = computed(() => Math.round(props.values.n ?? 50))
const primeStep = ref(0)
const primes = computed(() => primesUpTo(primeN.value))
const primeSet = computed(() => new Set(primes.value))
const remaining = computed(() => sieveRemaining(primeN.value, primeStep.value))
const remainingSet = computed(() => new Set(remaining.value))
const table = computed(() => {
  const rows: number[][] = []
  for (let i = 2; i <= primeN.value; i += 10) {
    rows.push(Array.from({ length: Math.min(10, primeN.value - i + 1) }, (_, j) => i + j))
  }
  return rows
})
const sieveLabel = computed(() =>
  primeStep.value === 0 ? '还没开始筛' : `已划掉 ${SIEVE_PRIMES.slice(0, primeStep.value).join('、')} 的倍数`,
)
const sieveDone = computed(() => primeStep.value >= SIEVE_PRIMES.length)
function nextSieveStep() {
  if (sieveDone.value) return
  primeStep.value++
  playClick()
}
function resetSieve() {
  primeStep.value = 0
  playClick()
}
function cellClass(v: number) {
  if (primeStep.value === 0) return primeSet.value.has(v) ? 'prime' : 'composite'
  return remainingSet.value.has(v) ? 'prime' : 'sifted'
}
function cellReason(v: number) {
  const reasons = sieveReasons(v)
  return reasons.length ? `${reasons.join('、')} 的倍数` : ''
}
/* ---------- 筛完看剩下的：已划掉个数 / 剩余个数 ---------- */
/** 2..n 一共 n-1 个数 */
const sieveTotal = computed(() => Math.max(0, primeN.value - 1))
const crossedCount = computed(() => sieveTotal.value - remaining.value.length)
watch(primeN, () => {
  primeStep.value = 0
})

/* ---------- 公因数公倍数 ---------- */
const a = computed(() => Math.round(props.values.a ?? 8))
const b = computed(() => Math.round(props.values.b ?? 12))
const fa = computed(() => factorsOf(a.value))
const fb = computed(() => factorsOf(b.value))
const common = computed(() => fa.value.filter((x) => fb.value.includes(x)))
const onlyA = computed(() => fa.value.filter((x) => !fb.value.includes(x)))
const onlyB = computed(() => fb.value.filter((x) => !fa.value.includes(x)))
const gcdVal = computed(() => Math.max(1, ...common.value))
const isLcmMode = computed(() => props.lab.kind === 'gcdlcm' && props.lab.title.includes('公倍数'))
const lcmVal = computed(() => lcm(a.value, b.value))
const lcmShow = computed(() => lcmVal.value <= 60)
const lcmLine = computed(() => {
  const ma = multiples(a.value, Math.floor(60 / a.value))
  const mb = multiples(b.value, Math.floor(60 / b.value))
  return { ma, mb, common: ma.filter((x) => mb.includes(x)) }
})

/* ---------- 只看公有的：分步揭示（先分别列举，再高亮交集） ---------- */
const revealStep = ref(0)
const revealListA = computed(() => (isLcmMode.value ? lcmLine.value.ma : fa.value))
const revealListB = computed(() => (isLcmMode.value ? lcmLine.value.mb : fb.value))
const commonList = computed(() => (isLcmMode.value ? lcmLine.value.common : common.value))
const commonExtreme = computed(() => (isLcmMode.value ? lcmVal.value : gcdVal.value))
function nextReveal() {
  if (revealStep.value >= 2) return
  revealStep.value++
  playClick()
}
function resetReveal() {
  revealStep.value = 0
  playClick()
}
watch([a, b], () => {
  revealStep.value = 0
})
</script>

<template>
  <div class="number-wrap">
    <!-- 因数：按同一比例尺真的拼出长方形 -->
    <template v-if="kind === 'factors'">
      <div class="pair-step-bar">
        <UButton size="sm" color="primary" variant="soft" :disabled="pairDone" @click="nextPair" data-act>
          {{ pairStep === 0 ? '成对找因数 · 一次找一对' : pairDone ? '因数找齐了' : '再找一对' }}
        </UButton>
        <UButton v-if="pairStep > 0" size="sm" variant="outline" color="neutral" @click="resetPair">复位</UButton>
        <span class="pair-step-status">已找到 <b>{{ revealedFactors.length }}</b> 个因数</span>
      </div>
      <div v-if="pairStep > 0" class="pair-step-panel" aria-label="成对找因数的过程">
        <span
          v-for="p in revealedPairs"
          :key="`${p[0]}x${p[1]}`"
          class="pair-step-chip"
          :class="{ same: p[0] === p[1] }"
        >
          {{ p[0] }} × {{ p[1] }} = {{ p[0] * p[1] }}{{ p[0] === p[1] ? '（两个因数相同，只算一个）' : '' }}
        </span>
        <span class="pair-step-chip result">因数：{{ revealedFactors.join('、') }}（{{ revealedFactors.length }} 个）</span>
      </div>
      <p v-if="pairDone" class="verify-line">
        ✓ 成对找因数：{{ revealedPairsText }} → {{ n }} 的因数有 <b>{{ revealedFactors.length }}</b> 个{{ samePair ? `（${samePair[0]} × ${samePair[1]} 两个因数相同，只算一个）` : '' }}：{{ revealedFactors.join('、') }}
      </p>
      <div class="pair-grids">
        <div v-for="p in pairShapes" :key="`${p.w}x${p.h}`" class="pair-box">
          <svg :viewBox="`0 0 ${p.px} ${p.py}`" :width="Math.min(140, Math.max(40, p.px))" class="pair-svg">
            <rect x="0" y="0" :width="p.px" :height="p.py" class="pair-rect" />
            <g v-if="p.cell >= 6" class="pair-grid">
              <line v-for="i in p.w - 1" :key="'v' + i" :x1="i * p.cell" :y1="0" :x2="i * p.cell" :y2="p.py" />
              <line v-for="j in p.h - 1" :key="'h' + j" :x1="0" :y1="j * p.cell" :x2="p.px" :y2="j * p.cell" />
            </g>
            <text :x="p.px / 2" :y="-3" text-anchor="middle" class="pair-dim">{{ p.w }}</text>
            <text :x="p.px + 4" :y="p.py / 2 + 4" class="pair-dim">{{ p.h }}</text>
          </svg>
          <p class="pair-label">{{ p.w }} × {{ p.h }} = {{ p.w * p.h }}</p>
        </div>
      </div>
      <div class="factor-chips">
        <span v-for="f in allFactors" :key="f" class="factor-chip">{{ f }}</span>
      </div>
      <p class="verify-line">
        ✓ {{ n }} 的因数有 {{ allFactors.length }} 个（成对出现），所以用 {{ n }} 个小正方形能拼成
        <b>{{ pairs.length }}</b> 种长方形
      </p>
      <p class="note">每排几个 × 排几排 = {{ n }}；能整除 {{ n }} 的数都是 {{ n }} 的因数</p>
    </template>

    <!-- 倍数：数轴 + 每次加 n 的跳跃 -->
    <template v-else-if="kind === 'multiples'">
      <div class="numline-wrap">
        <svg viewBox="0 0 460 150" class="w-full">
          <line :x1="LINE_X0" y1="96" :x2="LINE_X0 + LINE_W" y2="96" class="nl-line" />
          <g v-for="v in lineTicks" :key="v">
            <line :x1="lineX(v)" y1="96" :x2="lineX(v)" y2="106" class="nl-tick" />
            <text :x="lineX(v)" y="120" text-anchor="middle" class="nl-num">{{ v }}</text>
          </g>
          <!-- 每次加 n 的跳跃箭头：点一次点亮一段 -->
          <g v-for="(m, i) in mList.slice(0, -1)" :key="'j' + i">
            <path
              :d="`M ${lineX(m)} 88 Q ${lineX((m + mList[i + 1]!) / 2)} 56 ${lineX(mList[i + 1]!)} 88`"
              class="jump-arc"
              :class="{ on: i < mJump }"
              marker-end="url(#numarrow)"
            />
            <text
              v-if="i < mJump"
              :x="lineX((m + mList[i + 1]!) / 2)"
              y="52"
              text-anchor="middle"
              class="jump-step-label"
            >+{{ mBase }}</text>
          </g>
          <defs>
            <marker id="numarrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
          </defs>
          <g v-for="m in mList" :key="'m' + m">
            <circle :cx="lineX(m)" cy="96" r="5" class="nl-mark" :class="{ hit: mJump > 0 && m === mJumpTo }" />
            <text :x="lineX(m)" y="80" text-anchor="middle" class="nl-mark-num">{{ m }}</text>
          </g>
          <text :x="LINE_X0" y="24" class="jump-label">每次加 {{ mBase }}（箭头 = 跳一次）</text>
        </svg>
      </div>
      <div class="jump-controls">
        <UButton size="sm" color="primary" variant="soft" data-act data-test="jump-next" :disabled="mJumpDone" @click="nextJump">
          {{ mJumpDone ? '跳到头了' : `再跳一次（+${mBase}）` }}
        </UButton>
        <UButton size="sm" color="primary" variant="solid" data-test="jump-all" :disabled="mJumpDone" @click="jumpAll">
          跳到头（一共 {{ mJumpMax }} 次）
        </UButton>
        <UButton v-if="mJump > 0" size="sm" variant="outline" color="neutral" @click="resetJump">复位</UButton>
        <span class="jump-status" data-test="jump-status">{{ mJumpStatus }}</span>
      </div>
      <div class="factor-chips">
        <span
          v-for="(m, i) in mList"
          :key="m"
          class="factor-chip"
          :class="i <= mJump ? 'primary' : 'muted-chip'"
        >{{ m }}</span>
      </div>
      <p class="verify-line">✓ {{ mBase }} × 1 = {{ mBase }}，{{ mBase }} × 2 = {{ mBase * 2 }}，… 每次加 {{ mBase }}；最小的倍数是 {{ mBase }} 本身</p>
      <p class="note">{{ mBase }} 的倍数有无数个，所以没有最大的倍数</p>
    </template>

    <!-- 质数筛：逐轮划掉倍数 -->
    <template v-else-if="kind === 'prime'">
      <div class="sieve-controls">
        <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-scissors" :disabled="sieveDone" @click="nextSieveStep">
          {{ sieveDone ? '筛完了' : primeStep === 0 ? '开始筛 · 划掉 2 的倍数' : `再划掉 ${SIEVE_PRIMES[primeStep]} 的倍数` }}
        </UButton>
        <UButton v-if="primeStep > 0" size="sm" variant="outline" color="neutral" @click="resetSieve">复位</UButton>
        <span class="sieve-status">{{ sieveLabel }}；剩下 {{ remaining.length }} 个数</span>
      </div>
      <div class="sieve-table">
        <div v-for="(row, ri) in table" :key="ri" class="sieve-row">
          <span
            v-for="v in row"
            :key="v"
            class="sieve-cell"
            :class="cellClass(v)"
            :title="cellReason(v)"
          >
            {{ v }}
            <em v-if="cellClass(v) === 'sifted'" class="sieve-reason">{{ cellReason(v).replace(' 的倍数', '') }}</em>
          </span>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="dot prime" />质数（只剩 1 和它本身两个因数）</span>
        <span class="legend-item"><span class="dot composite" />合数</span>
        <span class="legend-item"><span class="dot sifted" />已被划掉（某个质数的倍数）</span>
      </div>
      <p v-if="sieveDone" class="verify-line">
        ✓ 划掉 2、3、5、7 的倍数后，剩下的恰好是质数：{{ primeSet.size }} 个（{{ primes.slice(0, 12).join('、') }}…）
      </p>
      <div v-if="sieveDone" class="sieve-summary" aria-label="筛法结果统计">
        <span class="sieve-sum-chip">已划掉 <b>{{ crossedCount }}</b> 个</span>
        <span class="sieve-sum-chip">剩下 <b>{{ remaining.length }}</b> 个</span>
        <span class="sieve-sum-chip result">
          剩下的恰好是质数（{{ primeSet.size }} 个）：{{ primes.join('、') }}
        </span>
      </div>
      <p class="note">1 既不是质数也不是合数（表里从 2 开始）；2 是最小的质数，也是唯一的偶数质数</p>
    </template>

    <!-- 公因数 / 公倍数 -->
    <template v-else>
      <div class="gcdlcm">
        <template v-if="!isLcmMode">
          <div class="venn-row">
            <div class="venn-box only-a">
              <p class="venn-title">{{ a }} 独有的因数</p>
              <div class="factor-chips">
                <span v-for="f in onlyA" :key="'oa' + f" class="factor-chip">{{ f }}</span>
              </div>
            </div>
            <div class="venn-box common">
              <p class="venn-title">公有的因数（交集）</p>
              <div class="factor-chips">
                <span v-for="f in common" :key="'c' + f" class="factor-chip common" :class="{ max: f === gcdVal }">{{ f }}</span>
              </div>
            </div>
            <div class="venn-box only-b">
              <p class="venn-title">{{ b }} 独有的因数</p>
              <div class="factor-chips">
                <span v-for="f in onlyB" :key="'ob' + f" class="factor-chip">{{ f }}</span>
              </div>
            </div>
          </div>
          <p class="verify-line">
            ✓ 公因数：{{ common.join('、') }}；其中最大的一个是 <b>{{ gcdVal }}</b
            >（最大公因数）
          </p>
          <p class="note">{{ gcdVal === 1 ? `${a} 和 ${b} 只有公因数 1，它们是互质的` : `列举法：先分别写出两个数的因数，再找出公有的因数` }}</p>
        </template>

        <template v-else>
          <p class="note">{{ a }} 的倍数和 {{ b }} 的倍数中，公有的最小一个是 {{ lcmVal }}</p>
          <svg v-if="lcmShow" viewBox="0 0 460 150" class="w-full">
            <line x1="20" y1="44" x2="440" y2="44" class="nl-line" />
            <line x1="20" y1="108" x2="440" y2="108" class="nl-line" />
            <text x="4" y="38" class="gc-label">{{ a }} 的倍数</text>
            <text x="4" y="102" class="gc-label">{{ b }} 的倍数</text>
            <g v-for="m in lcmLine.ma" :key="'a' + m">
              <line :x1="20 + (m * 420) / 60" y1="44" :x2="20 + (m * 420) / 60" y2="54" class="nl-tick" />
              <text :x="20 + (m * 420) / 60" y="34" text-anchor="middle" class="nl-num a">{{ m }}</text>
            </g>
            <g v-for="m in lcmLine.mb" :key="'b' + m">
              <line :x1="20 + (m * 420) / 60" y1="108" :x2="20 + (m * 420) / 60" y2="118" class="nl-tick" />
              <text :x="20 + (m * 420) / 60" y="134" text-anchor="middle" class="nl-num b">{{ m }}</text>
            </g>
            <g v-for="m in lcmLine.common" :key="'s' + m">
              <line :x1="20 + (m * 420) / 60" y1="44" :x2="20 + (m * 420) / 60" y2="108" class="common-line" />
              <text :x="20 + (m * 420) / 60" y="80" text-anchor="middle" class="star">★</text>
            </g>
          </svg>
          <p class="verify-line">
            ✓ 公倍数：{{ lcmLine.common.join('、') }}；最小的一个是 <b>{{ lcmVal }}</b
            >（最小公倍数 = 两数公有倍数中最小的）
          </p>
        </template>

        <!-- 只看公有的：分步揭示（先分别列举，再高亮交集） -->
        <div class="reveal-bar">
          <UButton size="sm" color="primary" variant="soft" :disabled="revealStep >= 2" @click="nextReveal" data-act>
            {{
              revealStep === 0
                ? '只看公有的 · 分步揭示'
                : revealStep === 1
                  ? '下一步：高亮公有部分'
                  : '已高亮公有部分'
            }}
          </UButton>
          <UButton v-if="revealStep > 0" size="sm" variant="outline" color="neutral" @click="resetReveal">复位</UButton>
        </div>
        <div v-if="revealStep >= 1" class="reveal-panel" aria-label="分步揭示">
          <div class="reveal-line">
            <span class="reveal-tag">{{ a }} 的{{ isLcmMode ? '倍数' : '因数' }}</span>
            <span
              v-for="v in revealListA"
              :key="'ra' + v"
              class="reveal-chip"
              :class="{ hit: revealStep >= 2 && commonList.includes(v) }"
            >{{ v }}</span>
          </div>
          <div class="reveal-line">
            <span class="reveal-tag">{{ b }} 的{{ isLcmMode ? '倍数' : '因数' }}</span>
            <span
              v-for="v in revealListB"
              :key="'rb' + v"
              class="reveal-chip"
              :class="{ hit: revealStep >= 2 && commonList.includes(v) }"
            >{{ v }}</span>
          </div>
          <div v-if="revealStep >= 2" class="reveal-common">
            <span class="reveal-tag">公有的（交集）</span>
            <span
              v-for="v in commonList"
              :key="'rc' + v"
              class="common-hit"
              :class="{ extreme: v === commonExtreme }"
            >{{ v }}</span>
            <span class="reveal-note">
              {{
                isLcmMode
                  ? `最小公倍数 ${commonExtreme} 就在交集里`
                  : `最大公因数 ${commonExtreme} 就在交集里`
              }}
            </span>
          </div>
          <p v-if="revealStep >= 2" class="reveal-verify">
            ✓ 两个数<template v-if="isLcmMode">公有的倍数</template><template v-else>公有的因数</template>就是交集里的
            {{ commonList.join('、') }}；{{ isLcmMode ? '最小公倍数' : '最大公因数' }}
            <b>{{ commonExtreme }}</b> 一定在交集中
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.number-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.pair-grids {
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
}
.pair-step-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pair-step-status {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.pair-step-status b {
  color: var(--ui-primary);
  font-size: 1rem;
}
.pair-step-panel {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 644px;
}
.pair-step-chip {
  border: 1px solid var(--ui-border-accented);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.2rem 0.6rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.pair-step-chip.same {
  border-color: var(--ui-warning, #f59e0b);
  color: #b45309;
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 14%, var(--ui-bg));
}
.pair-step-chip.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
  color: var(--ui-primary);
}
.reveal-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.reveal-panel {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.6rem;
}
.reveal-line {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.reveal-tag {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--ui-text-toned);
  min-width: 6.5rem;
}
.reveal-chip {
  border: 1px solid var(--ui-border-accented);
  border-radius: 9999px;
  background: var(--ui-bg);
  padding: 0.15rem 0.55rem;
  font-size: 0.8rem;
  color: var(--ui-text-highlighted);
}
.reveal-chip.hit {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 15%, var(--ui-bg));
  color: var(--ui-primary);
  font-weight: 800;
}
.reveal-common {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  border-top: 1px dashed var(--ui-border-accented);
  padding-top: 0.35rem;
}
.common-hit {
  border: 1px solid var(--ui-primary);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 25%, var(--ui-bg));
  color: var(--ui-primary);
  padding: 0.15rem 0.6rem;
  font-size: 0.82rem;
  font-weight: 800;
}
.common-hit.extreme {
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}
.reveal-note {
  font-size: 0.78rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.reveal-verify {
  margin: 0.1rem 0 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ui-success, #16a34a);
}
.reveal-verify b {
  color: var(--ui-primary);
}
.sieve-summary {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 644px;
}
.sieve-sum-chip {
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.84rem;
  padding: 0.2rem 0.6rem;
}
.sieve-sum-chip b {
  color: var(--ui-text-highlighted);
  font-size: 1rem;
}
.sieve-sum-chip.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
  color: var(--ui-primary);
  font-weight: 700;
}
.pair-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.pair-svg {
  overflow: visible;
  max-height: 150px;
}
.pair-rect {
  fill: color-mix(in srgb, var(--ui-primary) 40%, white);
  stroke: var(--ui-primary);
  stroke-width: 1.5;
}
.pair-grid line {
  stroke: color-mix(in srgb, var(--ui-primary) 55%, white);
  stroke-width: 0.8;
}
.pair-dim {
  font-size: 11px;
  fill: var(--ui-text-muted);
  font-weight: 700;
}
.pair-label {
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.factor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  align-items: center;
  max-width: 616px;
}
.factor-chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  padding: 0.2rem 0.6rem;
  font-size: 0.85rem;
  color: var(--ui-text-highlighted);
}
.factor-chip.primary {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
.factor-chip.common {
  background: color-mix(in srgb, var(--ui-primary) 25%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.factor-chip.common.max {
  outline: 2px solid var(--ui-primary);
  outline-offset: 1px;
}
.gc-label {
  font-size: 0.72rem;
  fill: var(--ui-text-muted);
  font-weight: 700;
}
.venn-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: stretch;
}
.venn-box {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.45rem 0.6rem;
  min-width: 8rem;
}
.venn-box.common {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
}
.venn-title {
  font-size: 0.76rem;
  font-weight: 800;
  color: var(--ui-text-toned);
  text-align: center;
  margin-bottom: 0.25rem;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  text-align: center;
}
.verify-line b {
  color: var(--ui-primary);
}
.nl-line {
  stroke: var(--ui-text-muted);
  stroke-width: 2;
}
.nl-tick {
  stroke: var(--ui-text-muted);
  stroke-width: 1.5;
}
.nl-num {
  font-size: 11px;
  fill: var(--ui-text-muted);
}
.nl-num.a {
  fill: var(--ui-primary);
}
.nl-num.b {
  fill: color-mix(in srgb, var(--ui-primary) 50%, var(--ui-text-muted));
}
.nl-mark {
  fill: var(--ui-primary);
}
.nl-mark-num {
  font-size: 12px;
  fill: var(--ui-primary);
  font-weight: 700;
}
.jump-arc {
  fill: none;
  stroke: color-mix(in srgb, var(--ui-warning, #f59e0b) 30%, transparent);
  stroke-width: 1.2;
}
/* 点过的那几段跳跃才点亮 */
.jump-arc.on {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 2.6;
}
.jump-step-label {
  font-size: 11px;
  fill: #b45309;
  font-weight: 700;
}
.nl-mark.hit {
  fill: #dc2626;
  r: 7;
}
.jump-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.jump-status {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.muted-chip {
  opacity: 0.45;
}
.jump-label {
  font-size: 12px;
  fill: #b45309;
  font-weight: 700;
}
.common-line {
  stroke: color-mix(in srgb, var(--ui-primary) 45%, transparent);
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.star {
  fill: var(--ui-primary);
  font-size: 15px;
}
.sieve-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.sieve-status {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.sieve-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sieve-row {
  display: flex;
  gap: 2px;
}
.sieve-cell {
  position: relative;
  width: 2.3rem;
  height: 2.3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.35rem;
  font-size: 0.85rem;
  transition: opacity 0.3s;
}
.sieve-cell.prime {
  background: color-mix(in srgb, var(--ui-primary) 30%, white);
  color: var(--ui-primary);
  font-weight: 800;
  border: 1px solid var(--ui-primary);
}
.sieve-cell.composite {
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
}
.sieve-cell.sifted {
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  text-decoration: line-through;
  opacity: 0.55;
}
.sieve-reason {
  font-size: 0.5rem;
  font-style: normal;
  text-decoration: none;
  color: var(--ui-warning, #f59e0b);
  font-weight: 800;
}
.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 9999px;
  display: inline-block;
}
.dot.prime {
  background: var(--ui-primary);
}
.dot.composite {
  background: var(--ui-text-muted);
}
.dot.sifted {
  background: color-mix(in srgb, var(--ui-text-muted) 50%, transparent);
  border: 1px solid var(--ui-warning, #f59e0b);
}
.gcdlcm {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 644px;
  align-items: center;
}
</style>
