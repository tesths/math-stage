<script setup lang="ts">
/**
 * 小数乘法和除法 Lab：一个数乘小数（方格模型）/ 积与因数比较 /
 * 积的近似值 / 一个数除以小数 / 商的近似值 / 进一去尾
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { roundTo, fixedN, toFixed2 } from '@/lib/engine/math'
import { roundLife } from '@/lib/labs/quantity'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 一个数乘小数：10×10 方格模型 ---------- */
const a = computed(() => props.values.a ?? 0.6)
const b = computed(() => props.values.b ?? 0.4)
const cols = computed(() => Math.round(a.value * 10))
const rows = computed(() => Math.round(b.value * 10))
const gridCells = computed(() => Array.from({ length: 100 }, (_, i) => i))
const inRect = (i: number) => i % 10 < cols.value && Math.floor(i / 10) < rows.value
/**
 * 逐行数格（第 4 轮收尾 agent C 补的 L3 过程态）：
 * 原来这一页只有 a、b 两个滑块，重截的 `<id>-act.png` 与初始态逐字节相同（静态图当过程）。
 * 现在可以一行一行地数阴影部分：每点一次多点亮一行、并给出「3 行 × 6 格 = 18 格 = 18/100」的中间读数，
 * 数完 4 行才得出 24/100 = 0.24——积不是背出来的，是一格一格数出来的。
 * 阴影格本身仍然一开始就画满（基线断言 `.grid-cell.filled` = 24 不能被破坏）。
 */
const mulRow = ref(0)
const mulRowDone = computed(() => mulRow.value >= rows.value)
const mulRowStatus = computed(() =>
  mulRow.value === 0
    ? `还没开始数：阴影部分是 ${cols.value} 列 × ${rows.value} 行`
    : `已数 ${mulRow.value} 行：每行 ${cols.value} 格 → ${mulRow.value * cols.value} 格 = ${mulRow.value * cols.value}/100 = ${fixedN((mulRow.value * cols.value) / 100, 2)}`,
)
function nextMulRow() {
  if (mulRowDone.value) return
  mulRow.value++
}
function allMulRows() {
  mulRow.value = rows.value
}
function resetMulRow() {
  mulRow.value = 0
}
watch([a, b], () => {
  mulRow.value = 0
})

/* ---------- 一个数乘小数：为什么积比第一个乘数小（同屏对照） ---------- */
/** 乘数与 1 的关系、积与第一个乘数的关系：两个方向必须一致（乘数 < 1 → 积变小） */
const mulDecCells = computed(() => cols.value * rows.value)
const mulDecFactorCmp = computed(() => (b.value > 1 ? '>' : b.value < 1 ? '<' : '='))
const mulDecProdCmp = computed(() => {
  const prod = a.value * b.value
  return prod > a.value ? '>' : prod < a.value ? '<' : '='
})
const mulDecReason = computed(() => {
  const fa = toFixed2(a.value)
  const fb = toFixed2(b.value)
  if (b.value < 1) return `乘数 ${fb} 小于 1：取不到 1 个 ${fa}（只有它的 ${fb}），所以积比 ${fa} 小`
  if (b.value > 1) return `乘数 ${fb} 大于 1：取得比 1 个 ${fa} 还多，所以积比 ${fa} 大`
  return `乘数正好是 1：取 ${fa} 的 1 倍，积与 ${fa} 相等`
})

/* ---------- 积与因数比较 ---------- */
const mulBase = computed(() => props.values.base ?? 4.9)
const mulFactor = computed(() => props.values.factor ?? 1.01)
const mulProd = computed(() => mulBase.value * mulFactor.value)
/**
 * 书写顺序是「第一个乘数 ? 积」，所以符号方向要与乘数与 1 的大小关系相反：
 * 乘数 > 1 → 积变大 → 第一个乘数 < 积；乘数 < 1 → 积变小 → 第一个乘数 > 积。
 * 比较用十进制安全四舍五入后的值，避免 4.9×1.01 的显示值（4.95）与精确值（4.949）不一致。
 */
const mulBaseR = computed(() => roundTo(mulBase.value, 4))
const mulFactorR = computed(() => roundTo(mulFactor.value, 4))
const mulProdR = computed(() => roundTo(mulBaseR.value * mulFactorR.value, 4))
const mulCmp = computed(() => (mulFactorR.value > 1 ? '<' : mulFactorR.value < 1 ? '>' : '='))
const mulReason = computed(() =>
  mulFactorR.value > 1
    ? `另一个乘数 ${toFixed2(mulFactorR.value)} 大于 1，积比第一个乘数大`
    : mulFactorR.value < 1
      ? `另一个乘数 ${toFixed2(mulFactorR.value)} 小于 1，积比第一个乘数小`
      : '另一个乘数等于 1，积与第一个乘数相等',
)

/* ---------- 积与因数比较：0.99 / 1 / 1.01 三档一键对照 ---------- */
const mulCmpOpen = ref(false)
/**
 * 三档同屏：乘数取 0.99（<1）、1（=1）、1.01（>1），
 * 每行给「积」与「积 ? 第一个乘数」的符号。符号方向一律由「乘数 ? 1」算出，不写死。
 */
const mulCmpRows = computed(() =>
  [0.99, 1, 1.01].map((f) => {
    const sym = f > 1 ? '>' : f < 1 ? '<' : '='
    const prod = roundTo(mulBaseR.value * f, 4)
    return {
      f,
      sym,
      fText: toFixed2(f),
      prodText: toFixed2(prod),
      why: f > 1 ? '（乘数 > 1，积变大）' : f < 1 ? '（乘数 < 1，积变小）' : '（乘数 = 1，积不变）',
    }
  }),
)

/* ---------- 一个数除以小数 ---------- */
const divExamples = [
  { d: 0.6, v: 0.3, i1: 6, i2: 3, q: 2, name: '红彩带剪小段' },
  { d: 1.2, v: 0.24, i1: 120, i2: 24, q: 5, name: '绿彩带剪小段' },
  { d: 0.34, v: 0.017, i1: 340, i2: 17, q: 20, name: '书页 8 验证题' },
]
const divSel = computed(() => divExamples[Math.round(props.values.sel ?? 0) % 3]!)

/** 除以小数：转化动画用的位权数字（统一放大到整数后） */
const divMove = computed(() => {
  const d = divSel.value
  // 除数的小数位数即需要右移的位数
  const shift = String(d.v).includes('.') ? String(d.v).split('.')[1]!.length : 0
  return { shift, scale: 10 ** shift, d1: d.i1, d2: d.i2, q: d.q }
})

/* ---------- 除以小数：一步一步转化（商不变） ---------- */
const DIV_STEP_COUNT = 3
const divStep = ref(0)
const divStepList = computed(() => {
  const d = divSel.value
  const mv = divMove.value
  const original = `${toFixed2(d.d)} ÷ ${toFixed2(d.v)}`
  return [
    {
      key: 'original',
      title: '第 1 步 · 写出原式',
      detail: `${original}：除数是小数，先想办法把它变成整数`,
    },
    {
      key: 'scale',
      title: `第 2 步 · 被除数和除数同时 ×${mv.scale}`,
      detail: `${original} = (${toFixed2(d.d)} × ${mv.scale}) ÷ (${toFixed2(d.v)} × ${mv.scale})：小数点同时向右移 ${mv.shift} 位，商不变`,
    },
    {
      key: 'result',
      title: '第 3 步 · 算出商',
      detail: `除数是整数了：${d.i1} ÷ ${d.i2} = ${d.q}；商不变，所以 ${original} = ${d.q}`,
    },
  ]
})

/* ---------- 积的近似值 ---------- */
const approxPrice = computed(() => props.values.price ?? 16.8)
const approxCount = computed(() => props.values.count ?? 2.4)
const approxDigits = computed(() => Math.round(props.values.digits ?? 1))
/** 精确积（十进制安全）与保留位结果：toFixed 会在 0.35 这类半值处出错，统一走 fixedN */
const approxExact = computed(() => roundTo(approxPrice.value * approxCount.value, 6))
const approxShown = computed(() => fixedN(approxExact.value, approxDigits.value))
/** 精确积的显示：最多 6 位小数，去掉末尾补零（9.375000 → 9.375） */
const approxExactText = computed(() => fixedN(approxExact.value, 6).replace(/\.?0+$/, ''))

/* ---------- 积的近似值：看下一位（截断取位，不预先四舍五入） ---------- */
const approxCheckOpen = ref(false)
/**
 * 把精确积的小数位逐位拆开：保留 digits 位，单独取出「下一位」判断舍还是入。
 * 注意不能先用 fixedN(exact, digits + 1) 再取末位——那一位已经被四舍五入过
 * （如 9.375 会被写成 9.38，下一位误显示 8，实际是 7）。
 */
const approxParts = computed(() => {
  const s = String(approxExact.value)
  const dot = s.indexOf('.')
  const intPart = dot < 0 ? s : s.slice(0, dot)
  const frac = dot < 0 ? '' : s.slice(dot + 1)
  const padded = frac.padEnd(approxDigits.value + 1, '0')
  return {
    intPart,
    keep: padded.slice(0, approxDigits.value),
    next: padded.slice(approxDigits.value, approxDigits.value + 1),
  }
})
const approxNext = computed(() => approxParts.value.next)
const approxDecision = computed(() =>
  Number(approxNext.value) >= 5
    ? `下一位「${approxNext.value}」≥ 5，保留的最后一位要加 1（入）`
    : `下一位「${approxNext.value}」< 5，保留的最后一位不变（舍）`,
)

/* ---------- 商的近似值 ---------- */
const divSpeed = computed(() => props.values.speed ?? 40)
const divApproxRaw = computed(() => (divSpeed.value * 1000) / 60)
/**
 * 逐步长除：整数运算算出「整数部分 + 小数点后三位」（多算一位），
 * 避免 String(40000/60) 这类浮点表示的噪声，也让「看下一位」的判定位真正是截断位。
 */
const divApproxLong = computed(() => {
  const mph = divSpeed.value * 1000
  const intPart = Math.floor(mph / 60)
  let rem = mph % 60
  const digits: number[] = []
  for (let i = 0; i < 3; i += 1) {
    rem *= 10
    digits.push(Math.floor(rem / 60))
    rem %= 60
  }
  return { mph, intPart, frac: digits.join('') }
})
const divApproxShown = computed(() => fixedN(divApproxRaw.value, 2))
const divApproxKeep = computed(() => divApproxLong.value.frac.slice(0, 2))
const divApproxJudge = computed(() => divApproxLong.value.frac.slice(2, 3))
const divApproxDecision = computed(() =>
  Number(divApproxJudge.value) >= 5 ? '第三位 ≥ 5，第二位进 1' : '第三位 < 5，直接舍去',
)
const divApproxNextText = computed(() =>
  Number(divApproxJudge.value) >= 5 ? '看下一位：「第三位」≥ 5，进 1' : '看下一位：「第三位」< 5，舍去',
)
/**
 * 逐位试商（第 4 轮收尾 agent C 补的 L3 过程态）：
 * 原来这一页只有 speed 滑块，重截的 `<id>-act.png` 与初始态逐字节相同。
 * 现在可以一位一位地试商：每点一次多除一位，并给出「这一位是怎么试出来的、还剩多少」。
 */
const divDigitStep = ref(0)
const DIV_DIGIT_STEPS = 3
const divDigitDone = computed(() => divDigitStep.value >= DIV_DIGIT_STEPS)
/** 逐步长除的每一步：余数 ×10 ÷ 60 → 本位商、新余数 */
const divDigitRows = computed(() => {
  const rowsOut: { k: number; div: number; digit: number; rem: number }[] = []
  let rem = divApproxLong.value.mph % 60
  for (let k = 1; k <= DIV_DIGIT_STEPS; k += 1) {
    const div = rem * 10
    const digit = Math.floor(div / 60)
    rem = div % 60
    rowsOut.push({ k, div, digit, rem })
  }
  return rowsOut
})
const divStepQuot = computed(() => {
  const intPart = divApproxLong.value.intPart
  if (divDigitStep.value === 0) return `${intPart}…`
  const frac = divApproxLong.value.frac.slice(0, divDigitStep.value)
  return `${intPart}.${frac}${divDigitDone.value ? '' : '…'}`
})
function nextDivDigit() {
  if (divDigitDone.value) return
  divDigitStep.value++
}
function resetDivDigit() {
  divDigitStep.value = 0
}
watch(divSpeed, () => {
  divDigitStep.value = 0
})

/** 单位换算链：千米/时 → 米/时 → ÷ 60 分 */
const divConvSteps = computed(() => {
  const mph = divApproxLong.value.mph
  return [
    {
      key: 'km-to-m',
      expr: `单位换算：${divSpeed.value} 千米 = ${divSpeed.value} × 1000 = ${mph} 米`,
      result: `${mph} 米/时`,
    },
    { key: 'hour-to-min', expr: '时间换算：1 时 = 60 分', result: `每分走的米数 = ${mph} 米 ÷ 60 分` },
    {
      key: 'divide',
      expr: `计算：${mph} ÷ 60`,
      result: `${divApproxLong.value.intPart}.${divApproxLong.value.frac}… 米/分`,
    },
  ]
})

/* ---------- 进一去尾 ---------- */
const roundMethod = computed(() => Math.round(props.values.method ?? 0))
const roundTotal = computed(() => props.values.total ?? 300)
/** 去尾法用「元/支」、进一法用「千克/个」，两种情境各用各的除数 */
const roundLifeResult = computed(() => roundLife(roundTotal.value, roundMethod.value))
const roundResult = computed(() => roundLifeResult.value.result)
const roundExact = computed(() => roundLifeResult.value.quotient)
const roundExplain = computed(() => {
  const q = roundExact.value
  const r = roundLifeResult.value
  if (roundMethod.value === 0) {
    return `${roundTotal.value} ÷ 3.5 = ${toFixed2(q)}，买到的支数必须是整数，用去尾法只能买 ${r.result} 支：${r.result} 支要 ${toFixed2(r.usedValue)} 元，再买 1 支要 ${toFixed2(r.nextValue)} 元，钱不够。`
  }
  return `${roundTotal.value} ÷ 2.5 = ${toFixed2(q)}，油要全部装下，用进一法至少需要 ${r.result} 个油壶：${r.result - 1} 个只能装 ${toFixed2(r.usedValue)} 千克，不够；${r.result} 个能装 ${toFixed2(r.nextValue)} 千克。`
})

/**
 * 三法并排对照：同一组数据（同一个总钱数/总量、同一个除数）下，
 * 去尾法、进一法、四舍五入的结果并排，各自标注适用情境。
 * 关键概念：取近似值的方法由实际意义决定，不能见小数就四舍五入。
 */
const roundCompareOpen = ref(false)
const roundUnit = computed(() => (roundMethod.value === 0 ? '支' : '个'))
const roundCompareRows = computed(() => {
  const q = roundExact.value
  // 与 quantity.ts 的取整口径一致：先抹掉浮点尾差再取整
  const floor = Math.floor(q + 1e-9)
  const ceilRes = Math.ceil(q - 1e-9)
  const halfUp = Math.round(q)
  return [
    {
      key: 'floor',
      name: '去尾法',
      result: floor,
      use: `求「最多买几${roundUnit.value}」：钱不能超，多一${roundUnit.value}就不够`,
      note: `只取整数部分 ${floor}，${roundUnit.value}数不能是小数`,
    },
    {
      key: 'ceil',
      name: '进一法',
      result: ceilRes,
      use: `求「至少准备几${roundUnit.value}」：要保证够用，少一${roundUnit.value}就不够`,
      note: `整数部分再加 1 得 ${ceilRes}，${floor}${roundUnit.value}装不下`,
    },
    {
      key: 'half-up',
      name: '四舍五入',
      result: halfUp,
      use: '只求「大约是多少」，没有「必须够」或「不能超」的要求',
      note: `看十分位「${fixedN(q, 1).slice(-1)}」决定舍或入得 ${halfUp}`,
    },
  ]
})
</script>

<template>
  <div class="decimal-wrap">
    <!-- 一个数乘小数：方格模型 -->
    <template v-if="kind === 'mul-decimal'">
      <div class="grid-model">
        <div class="grid-100">
          <span
            v-for="(cell, i) in gridCells"
            :key="cell"
            class="grid-cell"
            :class="{ filled: inRect(i), 'row-on': inRect(i) && Math.floor(i / 10) < mulRow }"
          />
        </div>
        <div class="grid-label">
          阴影部分 = {{ toFixed2(a) }} × {{ toFixed2(b) }} = {{ fixedN(a * b, 2) }}（{{ cols }} 列 × {{ rows }} 行 =
          {{ cols * rows }} 个小格，即 {{ cols * rows }}/100）
        </div>
      </div>
      <div class="row-count-bar">
        <UButton size="sm" color="primary" variant="soft" data-act data-test="row-next" :disabled="mulRowDone" @click="nextMulRow">
          {{ mulRowDone ? '数完了' : `再数一行（每行 ${cols} 格）` }}
        </UButton>
        <UButton size="sm" color="primary" variant="solid" data-test="row-all" :disabled="mulRowDone" @click="allMulRows">
          数完 {{ rows }} 行
        </UButton>
        <UButton v-if="mulRow > 0" size="sm" variant="outline" color="neutral" @click="resetMulRow">复位</UButton>
        <span class="row-count-status" data-test="row-status">{{ mulRowStatus }}</span>
      </div>
      <p class="note">
        {{ toFixed2(a) }} × {{ toFixed2(b) }} = {{ cols }}/10 × {{ rows }}/10 = ({{ cols }}×{{ rows }})/100 =
        {{ fixedN(a * b, 2) }}
      </p>
      <div class="why-smaller" aria-label="为什么积比第一个乘数小">
        <p class="why-line">
          乘数 {{ toFixed2(b) }} <b class="why-op">{{ mulDecFactorCmp }}</b> 1
          <span class="why-arrow">→</span>
          积 <b class="why-prod">{{ toFixed2(a * b) }}</b> <b class="why-op">{{ mulDecProdCmp }}</b> 第一个乘数
          {{ toFixed2(a) }}
        </p>
        <p class="grid-sync">
          方格同步：{{ cols }} 列 × {{ rows }} 行 = {{ mulDecCells }} 个格 → {{ cols }}/10 × {{ rows }}/10 =
          {{ mulDecCells }}/100 = <b class="sync-prod">{{ toFixed2(a * b) }}</b>
        </p>
        <p class="note">{{ mulDecReason }}</p>
      </div>
    </template>

    <!-- 积与因数比较 -->
    <template v-else-if="kind === 'mul-compare'">
      <div class="compare-card">
        <p class="big-expr">{{ toFixed2(mulBase) }} × {{ toFixed2(mulFactor) }} = {{ toFixed2(mulProd) }}</p>
        <p class="cmp-line">
          {{ toFixed2(mulBase) }} <span class="cmp-op">{{ mulCmp }}</span> {{ toFixed2(mulProd) }}
        </p>
        <p class="note">{{ mulReason }}</p>
        <div class="mul-cmp">
          <UButton
            size="xs"
            color="primary"
            variant="soft"
            class="mul-cmp-toggle"
            @click="mulCmpOpen = !mulCmpOpen" data-act>
            {{ mulCmpOpen ? '收起三档对照' : '三档一键对照（乘数 0.99 / 1 / 1.01）' }}
          </UButton>
          <div v-if="mulCmpOpen" class="mul-cmp-rows" aria-label="乘数三档与积的大小关系">
            <div v-for="row in mulCmpRows" :key="row.fText" class="mul-cmp-row">
              <span class="mul-cmp-expr">
                {{ toFixed2(mulBase) }} × {{ row.fText }} = <b class="mul-cmp-prod">{{ row.prodText }}</b>
              </span>
              <span class="mul-cmp-cmp">
                积 <b class="mul-cmp-sym">{{ row.sym }}</b> 第一个乘数 {{ toFixed2(mulBase) }}
                <span class="mul-cmp-why">{{ row.why }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 积的近似值 -->
    <template v-else-if="kind === 'mul-approx'">
      <div class="approx-card">
        <p class="big-expr">
          {{ toFixed2(approxPrice) }} × {{ toFixed2(approxCount) }} = {{ toFixed2(approxPrice * approxCount) }}
        </p>
        <p class="approx-result">
          保留 {{ approxDigits }} 位小数 → {{ approxShown }}
          <span class="note">（精确积 {{ approxExactText }}，看第 {{ approxDigits + 1 }} 位小数「{{ approxNext }}」）</span>
        </p>
        <div class="money-line">
          <span>💵 苹果单价 {{ toFixed2(approxPrice) }} 元/千克</span>
          <span>购买 {{ toFixed2(approxCount) }} 千克</span>
        </div>
        <div class="next-digit-panel">
          <UButton
            size="xs"
            color="primary"
            variant="soft"
            class="next-digit-toggle"
            @click="approxCheckOpen = !approxCheckOpen" data-act>
            {{ approxCheckOpen ? '收起「看下一位」' : '看下一位（判断舍还是入）' }}
          </UButton>
          <div v-if="approxCheckOpen" class="next-digit-box" aria-label="积的四舍五入看下一位">
            <p class="next-digit-digits">
              <span class="keep-digit">{{ approxParts.intPart }}.{{ approxParts.keep }}</span><span class="next-digit">{{ approxNext }}</span>
              <span class="next-digit-tag">← 保留 {{ approxDigits }} 位，这一位是「{{ approxNext }}」</span>
            </p>
            <p class="next-decision">{{ approxDecision }}</p>
            <p class="note">
              {{ toFixed2(approxPrice) }} × {{ toFixed2(approxCount) }} = {{ approxExactText }} ≈
              <b class="approx-final">{{ approxShown }}</b>（保留 {{ approxDigits }} 位小数）
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- 一个数除以小数 -->
    <template v-else-if="kind === 'div-decimal'">
      <div class="div-card">
        <p class="div-title">{{ divSel.name }}</p>
        <p class="big-expr">{{ toFixed2(divSel.d) }} ÷ {{ toFixed2(divSel.v) }} = {{ divSel.q }}</p>
        <div class="decimal-rule" aria-label="除以小数转化目标">
          <span>目标：把除数 {{ toFixed2(divSel.v) }} 变成整数 {{ divSel.i2 }}</span>
          <span>两数同乘 {{ divMove.scale }}，商不变</span>
        </div>
        <div class="dp-track">
          <div class="dp-row">
            <span class="dp-tag">被除数</span>
            <span class="dp-chips">
              <span
                v-for="(c, i) in String(toFixed2(divSel.d)).split('')"
                :key="'a' + i"
                class="dp-chip"
                :class="{ dot: c === '.' }"
              >{{ c }}</span>
            </span>
            <span class="dp-arrow">右移 {{ divMove.shift }} 位 →</span>
            <span class="dp-chips">
              <span v-for="(c, i) in String(divSel.i1).split('')" :key="'a1' + i" class="dp-chip int">{{ c }}</span>
            </span>
          </div>
          <div class="dp-row">
            <span class="dp-tag">除数</span>
            <span class="dp-chips">
              <span
                v-for="(c, i) in String(toFixed2(divSel.v)).split('')"
                :key="'b' + i"
                class="dp-chip"
                :class="{ dot: c === '.' }"
              >{{ c }}</span>
            </span>
            <span class="dp-arrow">右移 {{ divMove.shift }} 位 →</span>
            <span class="dp-chips">
              <span v-for="(c, i) in String(divSel.i2).split('')" :key="'b1' + i" class="dp-chip int">{{ c }}</span>
            </span>
          </div>
        </div>
        <div class="align-note">
          <span>小数点同时右移 <b>{{ divMove.shift }}</b> 位</span>
          <span class="eq-sym">=</span>
          <span>{{ divSel.i1 }} ÷ {{ divSel.i2 }} = {{ divSel.q }}</span>
        </div>
        <p class="note">把除数变成整数：被除数和除数的小数点<b>同时</b>向右移动相同位数，商不变</p>
        <div class="div-steps">
          <p class="div-step-count">一步一步转化：第 {{ divStep + 1 }} / {{ DIV_STEP_COUNT }} 步</p>
          <template v-for="(st, i) in divStepList" :key="st.key">
            <div v-if="i <= divStep" class="div-step" :class="{ current: i === divStep }">
              <span class="div-step-title">{{ st.title }}</span>
              <span class="div-step-detail">{{ st.detail }}</span>
            </div>
          </template>
          <div class="div-step-btns">
            <UButton
              size="xs"
              variant="soft"
              class="div-step-prev"
              :disabled="divStep === 0"
              @click="divStep = Math.max(0, divStep - 1)"
            >
              上一步
            </UButton>
            <UButton
              size="xs"
              color="primary"
              variant="soft"
              class="div-step-next"
              :disabled="divStep >= DIV_STEP_COUNT - 1"
              @click="divStep = Math.min(DIV_STEP_COUNT - 1, divStep + 1)"
            >
              下一步
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <!-- 商的近似值 -->
    <template v-else-if="kind === 'div-approx'">
      <div class="approx-card">
        <p class="div-title">海狮游速 {{ divSpeed }} 千米/时 = {{ divSpeed * 1000 }} 米/时</p>
        <p class="long-div">{{ divSpeed * 1000 }} ÷ 60</p>
        <div class="div-conv" aria-label="单位换算过程">
          <div v-for="st in divConvSteps" :key="st.key" class="div-conv-step">
            <span class="div-conv-expr">{{ st.expr }}</span>
            <span class="div-conv-result">{{ st.result }}</span>
          </div>
        </div>
        <div class="round-flow" aria-label="商的近似值判定流程">
          <span>精确商 {{ divApproxLong.intPart }}.{{ divApproxKeep }}{{ divApproxJudge }}</span>
          <span>保留两位</span>
          <span>判定位 {{ divApproxJudge }}</span>
          <span>{{ divApproxDecision }}</span>
        </div>
        <div class="long-box">
          <span class="lb-quot">{{ divApproxLong.intPart }}.<span class="lb-extra">{{ divApproxKeep }}</span><span class="lb-cut">{{ divApproxJudge }}</span></span>
          <span class="lb-note">先除到小数点后第三位（<span class="lb-cut">淡色</span>），再四舍五入</span>
        </div>
        <div class="digit-trial" aria-label="逐位试商">
          <div class="digit-trial-bar">
            <UButton size="sm" color="primary" variant="soft" data-act data-test="digit-next" :disabled="divDigitDone" @click="nextDivDigit">
              {{ divDigitDone ? '三位都试完了' : '再试一位商（余数 ×10 ÷ 60）' }}
            </UButton>
            <UButton v-if="divDigitStep > 0" size="sm" variant="outline" color="neutral" @click="resetDivDigit">复位</UButton>
            <span class="digit-trial-quot" data-test="digit-quot">现在的商：{{ divStepQuot }}</span>
          </div>
          <div v-if="divDigitStep > 0" class="digit-trial-rows">
            <p v-for="row in divDigitRows.slice(0, divDigitStep)" :key="row.k" class="digit-trial-row" data-test="digit-row">
              第 {{ row.k }} 位：{{ row.div }} ÷ 60 = <b>{{ row.digit }}</b>
              <span class="digit-trial-rem">…… 余 {{ row.rem }}</span>
            </p>
            <p v-if="divDigitDone" class="digit-trial-verdict">
              三位都试完：商 = {{ divApproxLong.intPart }}.{{ divApproxLong.frac }}…，
              第 3 位「{{ divApproxJudge }}」{{ Number(divApproxJudge) >= 5 ? '≥ 5，第二位进 1' : '< 5，直接舍去' }}
              → {{ divApproxShown }}
            </p>
          </div>
        </div>
        <div class="next-digit-box" aria-label="商的四舍五入看下一位">
          <p class="next-digit-digits">
            商 <span class="keep-digit">{{ divApproxLong.intPart }}.{{ divApproxKeep }}</span><span class="next-digit">{{ divApproxJudge }}</span>…
            <span class="next-digit-tag">← 要保留两位，看第三位「{{ divApproxJudge }}」</span>
          </p>
          <p class="next-decision">{{ divApproxNextText }} → <b class="div-approx-final">{{ divApproxShown }}</b> 米/分</p>
        </div>
        <p class="approx-result">保留两位小数 → <b>{{ divApproxShown }}</b> 米/分</p>
        <p class="note">看小数点后第三位：≥5 进 1，&lt;5 舍去</p>
      </div>
    </template>

    <!-- 进一去尾 -->
    <template v-else-if="kind === 'round-life'">
      <div class="approx-card">
        <p class="div-title">
          {{ roundMethod === 0 ? `每支自动铅笔 3.5 元，${roundTotal} 元最多买多少支？` : `每个油壶最多装 2.5 千克油，${roundTotal} 千克油至少需要几个油壶？` }}
        </p>
        <p class="big-expr">
          {{ roundTotal }} ÷ {{ roundMethod === 0 ? '3.5' : '2.5' }} = {{ toFixed2(roundExact) }}
        </p>
        <div class="approx-bars">
          <div class="approx-row">
            <span class="approx-row-text">
              {{ roundMethod === 0
                ? `${roundResult} 支用 ${toFixed2(roundLifeResult.usedValue)} 元（还剩 ${toFixed2(roundLifeResult.remainder)} 元）`
                : `每个油壶装 2.5 千克，${roundResult - 1} 个只装 ${toFixed2(roundLifeResult.usedValue)} 千克` }}
            </span>
            <div class="approx-track">
              <div class="approx-fill used" :style="{ width: `${Math.min(100, (roundLifeResult.usedValue / Math.max(roundTotal, 1)) * 100)}%` }" />
            </div>
          </div>
          <div class="approx-row">
            <span class="approx-row-text">
              {{ roundMethod === 0 ? `一共带了 ${roundTotal} 元` : `要装的油一共 ${roundTotal} 千克（${roundResult} 个能装 ${toFixed2(roundLifeResult.nextValue)} 千克）` }}
            </span>
            <div class="approx-track">
              <div class="approx-fill total" :style="{ width: `${Math.min(100, (roundTotal / Math.max(roundTotal, roundLifeResult.nextValue)) * 100)}%` }" />
            </div>
          </div>
        </div>
        <p class="approx-result">
          {{ roundMethod === 0 ? '去尾法（最多买）' : '进一法（至少需要）' }} → <b>{{ roundResult }}</b> {{ roundMethod === 0 ? '支' : '个' }}
        </p>
        <p class="note">{{ roundExplain }}</p>
        <div class="round-cmp">
          <UButton
            size="xs"
            color="primary"
            variant="soft"
            class="round-cmp-toggle"
            @click="roundCompareOpen = !roundCompareOpen" data-act>
            {{ roundCompareOpen ? '收起三法对照' : '三法并排对照（去尾 / 进一 / 四舍五入）' }}
          </UButton>
          <div v-if="roundCompareOpen" class="round-cmp-rows" aria-label="三种取近似值方法对照">
            <div v-for="row in roundCompareRows" :key="row.key" class="round-cmp-row" :class="`is-${row.key}`">
              <span class="round-cmp-name">{{ row.name }} → {{ row.result }} {{ roundUnit }}</span>
              <span class="round-cmp-use">适用：{{ row.use }}</span>
              <span class="round-cmp-note">{{ row.note }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.decimal-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
}
.grid-model {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.grid-100 {
  display: grid;
  grid-template-columns: repeat(10, 22px);
  gap: 2px;
}
.grid-cell {
  width: 22px;
  height: 22px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 2px;
}
.grid-cell.filled {
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border-color: var(--ui-primary);
}
/* 已经数过的那几行：加粗描边，一行一行地数出来 */
.grid-cell.filled.row-on {
  background: var(--ui-primary);
  outline: 2px solid var(--ui-primary);
  outline-offset: -1px;
  transform: scale(1.06);
}
.row-count-bar,
.digit-trial-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.row-count-status,
.digit-trial-quot {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
}
.digit-trial {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.5rem 0.6rem;
  border: 1px dashed var(--ui-border);
  border-radius: 8px;
}
.digit-trial-row {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-variant-numeric: tabular-nums;
}
.digit-trial-rem {
  color: var(--ui-text-muted);
}
.digit-trial-verdict {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ui-primary);
}
.grid-label {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.compare-card,
.approx-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.approx-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-align: left;
}
.approx-row-text {
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.approx-track {
  height: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  overflow: hidden;
  background: var(--ui-bg-elevated, white);
}
.approx-fill {
  height: 100%;
}
.approx-fill.used {
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
}
.approx-fill.total {
  background: color-mix(in srgb, var(--ui-info, #38bdf8) 45%, white);
}
.approx-card,
.div-card {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 1rem 1.4rem;
  text-align: center;
  min-width: 22rem;
  max-width: 34rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.big-expr {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-line {
  font-size: 1.2rem;
  font-weight: 700;
}
.cmp-op {
  color: var(--ui-primary);
  font-size: 1.5rem;
}
.div-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.approx-result {
  font-size: 1.05rem;
  color: var(--ui-primary);
  font-weight: 700;
}
.transform-arrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.from,
.to {
  border-radius: 9999px;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border-accented);
  padding: 0.3rem 0.7rem;
  font-weight: 700;
}
.arrow {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.money-line {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.decimal-rule,
.round-flow {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
  width: 100%;
}
.decimal-rule span,
.round-flow span {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.decimal-rule span:first-child,
.round-flow span:last-child {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
/* 除以小数：小数点同步移动 */
.dp-track {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}
.dp-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.dp-tag {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-text-muted);
  min-width: 2.5rem;
  text-align: right;
}
.dp-chips {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
}
.dp-chip {
  font-family: ui-monospace, monospace;
  font-size: 1.05rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
  border: 1px solid var(--ui-border-accented);
  border-radius: 0.3rem;
  min-width: 1.4rem;
  text-align: center;
  padding: 0.1rem 0.15rem;
  color: var(--ui-text-highlighted);
}
.dp-chip.dot {
  background: transparent;
  border: none;
  color: var(--ui-primary);
  font-size: 1.3rem;
  min-width: 0.5rem;
}
.dp-chip.int {
  color: var(--ui-primary);
  border-color: var(--ui-primary);
}
.dp-arrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ui-warning, #f59e0b);
}
.align-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.align-note b {
  color: var(--ui-primary);
}
.eq-sym {
  color: var(--ui-text-muted);
}
/* 商的近似值：竖式多算一位 */
.long-div {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.long-box {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.4rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg);
}
.lb-quot {
  font-family: ui-monospace, monospace;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.lb-extra {
  color: var(--ui-primary);
}
.lb-cut {
  color: var(--ui-text-muted);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 22%, transparent);
  border-radius: 0.2rem;
  padding: 0 0.1rem;
}
.lb-note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
/* 三法并排对照：去尾 / 进一 / 四舍五入 */
.round-cmp {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.round-cmp-rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}
.round-cmp-row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.4rem 0.7rem;
  text-align: left;
}
.round-cmp-row.is-floor {
  border-color: color-mix(in srgb, var(--ui-primary) 55%, var(--ui-border));
}
.round-cmp-row.is-ceil {
  border-color: color-mix(in srgb, var(--ui-warning, #f59e0b) 60%, var(--ui-border));
}
.round-cmp-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.round-cmp-use {
  font-size: 0.76rem;
  color: var(--ui-text-toned);
}
.round-cmp-note {
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
/* 一个数乘小数：为什么积变小（同屏对照） */
.why-smaller {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
  width: 100%;
}
.why-line {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.why-op {
  color: var(--ui-primary);
  font-size: 1.25rem;
}
.why-prod {
  font-family: ui-monospace, monospace;
  color: var(--ui-primary);
}
.why-arrow {
  color: var(--ui-text-muted);
  margin: 0 0.25rem;
}
.grid-sync {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.sync-prod {
  color: var(--ui-primary);
}
/* 积与因数比较：三档一键对照 */
.mul-cmp {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.mul-cmp-rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}
.mul-cmp-row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.4rem 0.7rem;
  text-align: left;
  font-family: ui-monospace, monospace;
}
.mul-cmp-expr {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.mul-cmp-cmp {
  font-size: 0.82rem;
  color: var(--ui-text-toned);
}
.mul-cmp-prod,
.mul-cmp-sym {
  color: var(--ui-primary);
  font-size: 1.05rem;
}
.mul-cmp-why {
  font-family: inherit;
  color: var(--ui-text-muted);
  font-size: 0.72rem;
}
/* 四舍五入：看下一位 */
.next-digit-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  width: 100%;
}
.next-digit-box {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
  border: 1px solid var(--ui-primary);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.5rem 0.8rem;
  align-items: center;
}
.next-digit-digits {
  font-family: ui-monospace, monospace;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.keep-digit {
  color: var(--ui-text-highlighted);
}
.next-digit {
  color: var(--ui-warning, #f59e0b);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 24%, transparent);
  border-radius: 0.25rem;
  padding: 0 0.2rem;
}
.next-digit-tag {
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ui-text-muted);
}
.next-decision {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.approx-final,
.div-approx-final {
  font-family: ui-monospace, monospace;
}
/* 除以小数：一步一步转化 */
.div-steps {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  border-top: 1px dashed var(--ui-border-accented);
  padding-top: 0.5rem;
}
.div-step-count {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.div-step {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.4rem 0.7rem;
  text-align: left;
}
.div-step.current {
  border-color: var(--ui-primary);
}
.div-step-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.div-step-detail {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.div-step-btns {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
/* 商的近似值：单位换算链 */
.div-conv {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 100%;
}
.div-conv-step {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}
.div-conv-expr {
  color: var(--ui-text-toned);
}
.div-conv-result {
  font-weight: 800;
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
@media (max-width: 520px) {
  .compare-card,
  .approx-card,
  .div-card {
    padding: 0.85rem 0.75rem;
  }
  .big-expr {
    font-size: 1.15rem;
  }
}
</style>
