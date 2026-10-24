<script setup lang="ts">
/**
 * 线段图 Lab：求一个数的几分之几 / 比一个数多（少）几分之几 / 工程问题
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { playClick } from '@/lib/sound'
import { gcd, toFixed2 } from '@/lib/engine/math'
import { fractionCount, fractionDecimal, fractionText, snapUpToMultiple, unitFractionSum } from '@/lib/labs/fractions'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 求一个数的几分之几 ---------- */
const total = computed(() => props.values.total ?? 45)
const fn = computed(() => Math.round(props.values.fn ?? 2))
const fd = computed(() => Math.round(props.values.fd ?? 5))
const boysCount = computed(() => fractionCount(total.value, fn.value, fd.value))
const boys = computed(() => Math.round(boysCount.value.value * 100) / 100)
const girls = computed(() => Math.round((total.value - boys.value) * 100) / 100)

/**
 * 线段图分率刻度：男 fn/fd、女 1 − fn/fd，两段合起来正好是整条线段（单位「1」）。
 * 两种解法（先算男生再减 / 先算女生占 1 − fn/fd 再乘）结果相同，用按钮切换同步高亮。
 */
const boysPct = computed(() => (fn.value / fd.value) * 100)
const girlsPct = computed(() => ((fd.value - fn.value) / fd.value) * 100)
const girlsFractionText = computed(() => fractionText(fd.value - fn.value, fd.value))
const segMethod = ref(1)
const segMethodText = computed(() =>
  segMethod.value === 1
    ? `先算男生：${total.value} × ${fn.value}/${fd.value} = ${toFixed2(boys.value)} 人，再用总数减：${total.value} - ${toFixed2(boys.value)} = ${toFixed2(girls.value)} 人`
    : `先算女生占 1 - ${fn.value}/${fd.value} = ${girlsFractionText.value}，再乘总数：${total.value} × ${girlsFractionText.value} = ${toFixed2(girls.value)} 人`,
)

/* ---------- 比一个数多（少）几分之几 ---------- */
const base = computed(() => props.values.base ?? 14)
const mfn = computed(() => Math.round(props.values.fn ?? 2))
const mfd = computed(() => Math.round(props.values.fd ?? 7))
const mode = computed(() => Math.round(props.values.mode ?? 0))
const delta = computed(() => (base.value * mfn.value) / mfd.value)
const resultVal = computed(() => (mode.value === 0 ? base.value + delta.value : base.value - delta.value))
const moreMax = computed(() => Math.max(base.value, resultVal.value, 1))
const basePct = computed(() => (base.value / moreMax.value) * 100)
const resultPct = computed(() => (resultVal.value / moreMax.value) * 100)
const deltaPct = computed(() => (delta.value / moreMax.value) * 100)
const deltaLeftPct = computed(() => (mode.value === 0 ? basePct.value : resultPct.value))
const deltaSign = computed(() => (mode.value === 0 ? '+' : '-'))

/**
 * 「比一个数多（少）几分之几」两步步进：第 1 步先算增减量，第 2 步再 ±，
 * 并联排「原来 × (1 ± 分率)」的写法。分率一律用最简分数。
 */
const MORE_MAX_STEP = 2
const moreStep = ref(1)
const increase = computed(() => mode.value === 0)
const moreFractionText = computed(() => fractionText(mfn.value, mfd.value))
const moreIntegral = computed(() => Math.abs(resultVal.value - Math.round(resultVal.value)) < 1e-9)
const moreSteps = computed(() => [
  {
    title: `第 1 步 · 先算${increase.value ? '增加' : '减少'}的量`,
    detail: `${base.value} × ${moreFractionText.value} = ${toFixed2(delta.value)} 天`,
  },
  {
    title: `第 2 步 · 再${increase.value ? '加' : '减'}`,
    detail: `${base.value} ${deltaSign.value} ${toFixed2(delta.value)} = ${toFixed2(resultVal.value)} 天；也可以写成 ${base.value} × (1 ${deltaSign.value} ${moreFractionText.value}) = ${toFixed2(resultVal.value)} 天`,
  },
])
const moreVisibleSteps = computed(() => moreSteps.value.slice(0, moreStep.value))

/* ---------- 工程问题 ---------- */
const a = computed(() => Math.round(props.values.a ?? 6))
const b = computed(() => Math.round(props.values.b ?? 3))
const rateA = computed(() => 1 / a.value)
const rateB = computed(() => 1 / b.value)
const rateSum = computed(() => rateA.value + rateB.value)
/** 中间量用最简分数表达，避免「1 ÷ 0.34 = 2.92」这种自相矛盾的算式 */
const rateFraction = computed(() => unitFractionSum(a.value, b.value))
const rateText = computed(() => fractionText(rateFraction.value[0], rateFraction.value[1]))
const hoursFraction = computed(() => fractionDecimal(rateFraction.value[1], rateFraction.value[0], 2))
const hoursText = computed(() => fractionText(rateFraction.value[1], rateFraction.value[0]))
const hoursExact = computed(() => hoursFraction.value.exact || rateFraction.value[1] === 1)

/**
 * 效率条相加步进：第 1 步给各自效率，第 2 步把两个分率通分相加，
 * 第 3 步用「1 ÷ 效率和」求合作时间。全过程只用最简分数，不出现小数近似，
 * 避免「1 ÷ 0.34 = 2.94」这种自相矛盾的算式。
 */
const WORK_MAX_STEP = 3
const workStep = ref(1)
/** 通分用的最小公分母（a 与 b 的最小公倍数） */
const rateLcm = computed(() => (a.value * b.value) / gcd(a.value, b.value))
const rateLcmA = computed(() => rateLcm.value / a.value)
const rateLcmB = computed(() => rateLcm.value / b.value)
const rateSumNumer = computed(() => rateLcmA.value + rateLcmB.value)
/** 通分结果若还不是最简分数，就再写出最简形式 */
const rateCombineText = computed(() =>
  rateSumNumer.value === rateFraction.value[0] && rateLcm.value === rateFraction.value[1]
    ? `${rateSumNumer.value}/${rateLcm.value}`
    : `${rateSumNumer.value}/${rateLcm.value} = ${rateText.value}`,
)
const workSteps = computed(() => [
  {
    title: '第 1 步 · 各自的效率',
    detail: `把总工作量看作 1：志杰每小时完成 1/${a.value}，爸爸每小时完成 1/${b.value}`,
  },
  {
    title: '第 2 步 · 效率相加',
    detail: `通分：1/${a.value} + 1/${b.value} = ${rateLcmA.value}/${rateLcm.value} + ${rateLcmB.value}/${rateLcm.value} = ${rateCombineText.value}`,
  },
  {
    title: '第 3 步 · 用效率和求合作时间',
    detail: `合作时间 = 1 ÷ ${rateText.value} = ${hoursText.value} 小时`,
  },
])
const workVisibleSteps = computed(() => workSteps.value.slice(0, workStep.value))

/** 一键把总人数改成 fd 的倍数：把"只提示"变成"可操作修正" */
function fixTotalToMultiple() {
  props.values.total = snapUpToMultiple(total.value, fd.value)
  playClick()
}
</script>

<template>
  <div class="seg-wrap">
    <!-- 求一个数的几分之几：线段图 -->
    <template v-if="kind === 'segment'">
      <div class="segment-block">
        <p class="seg-title">总人数 {{ total }} 人，男运动员占 {{ fn }}/{{ fd }}</p>
        <div class="seg-line">
          <div class="seg-part boys" :class="{ hl: segMethod === 1 }" :style="{ width: `${boysPct}%` }">
            男 {{ fn }}/{{ fd }}
          </div>
          <div class="seg-part girls" :class="{ hl: segMethod === 2 }" :style="{ width: `${girlsPct}%` }">
            女 {{ fd - fn }}/{{ fd }}
          </div>
        </div>
        <div class="seg-ruler" aria-label="线段图分率刻度">
          <span class="seg-tick start">0</span>
          <span class="seg-tick frac" :style="{ left: `${boysPct}%` }">{{ fn }}/{{ fd }}</span>
          <span class="seg-tick end">单位「1」</span>
        </div>
        <p class="seg-result">
          男运动员 = {{ total }} × {{ fn }}/{{ fd }} = {{ toFixed2(boys) }} 人
          <br />
          女运动员 = {{ total }} - {{ toFixed2(boys) }} = <b>{{ toFixed2(girls) }} 人</b>
        </p>
        <div class="seg-methods" aria-label="两种解法同步高亮">
          <UButton
            size="xs"
            variant="soft"
            class="seg-method-btn m1"
            :class="{ active: segMethod === 1 }"
            @click="segMethod = 1" data-act>
            看法一（先算男生再减）
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            class="seg-method-btn m2"
            :class="{ active: segMethod === 2 }"
            @click="segMethod = 2"
          >
            看法二（先算女生占 1−{{ fn }}/{{ fd }}）
          </UButton>
        </div>
        <p class="seg-method-line">✓ {{ segMethodText }}</p>
        <p v-if="!boysCount.integral" class="seg-warn">
          人数必须是整数：{{ total }} 不是 {{ fd }} 的倍数，算出 {{ toFixed2(boysCount.value) }} 人。把总人数调成 {{ fd }} 的倍数（如 {{ snapUpToMultiple(total, fd) }} 人）才合适。
          <UButton
            size="xs"
            color="warning"
            variant="soft"
            class="seg-fix"
            @click="fixTotalToMultiple"
          >
            一键改成 {{ snapUpToMultiple(total, fd) }} 人
          </UButton>
        </p>
      </div>
    </template>

    <!-- 比一个数多（少）几分之几 -->
    <template v-else-if="kind === 'segment-more'">
      <div class="segment-block">
        <p class="seg-title">
          原来 {{ base }} 天，{{ mode === 0 ? '增加' : '减少' }} {{ mfn }}/{{ mfd }}
        </p>
        <div class="two-bars">
          <div class="bar-row">
            <span class="bar-label">原来</span>
            <div class="bar-track">
              <div class="bar-base" :style="{ width: `${basePct}%` }">{{ base }} 天</div>
            </div>
          </div>
          <div class="bar-row">
            <span class="bar-label">现在</span>
            <div class="bar-track">
              <div class="bar-base result" :style="{ width: `${resultPct}%` }">
                {{ toFixed2(resultVal) }} 天
              </div>
              <div
                class="bar-delta"
                :style="{
                  width: `${deltaPct}%`,
                  left: `${deltaLeftPct}%`,
                }"
              >
                {{ deltaSign }}{{ toFixed2(delta) }}
              </div>
            </div>
          </div>
        </div>
        <p class="scale-note">同一比例尺：整条线 = {{ toFixed2(moreMax) }} 天，彩色差量表示 {{ mfn }}/{{ mfd }} 个原来天数</p>
        <p class="seg-result">
          {{ mode === 0 ? '增加' : '减少' }}的部分 = {{ base }} × {{ mfn }}/{{ mfd }} = {{ toFixed2(delta) }} 天
          <br />
          结果 = {{ base }} {{ mode === 0 ? '+' : '-' }} {{ toFixed2(delta) }} = <b>{{ toFixed2(resultVal) }} 天</b>
        </p>
        <div class="more-steps" aria-label="先算增减量再加减">
          <div class="more-step-head">
            <span class="more-step-count">两步算：第 {{ moreStep }} / {{ MORE_MAX_STEP }} 步</span>
            <UButton size="xs" variant="soft" :disabled="moreStep <= 1" @click="moreStep -= 1">上一步</UButton>
            <UButton size="xs" color="primary" variant="soft" :disabled="moreStep >= MORE_MAX_STEP" @click="moreStep += 1">下一步</UButton>
          </div>
          <ol class="more-step-list">
            <li
              v-for="(s, i) in moreVisibleSteps"
              :key="s.title"
              class="more-step"
              :class="{ current: i === moreStep - 1 }"
            >
              <span class="more-step-title">{{ s.title }}</span>
              <span class="more-step-detail">{{ s.detail }}</span>
            </li>
          </ol>
        </div>
        <p v-if="!moreIntegral" class="seg-warn">
          注意实际意义：{{ base }} × {{ moreFractionText }} = {{ toFixed2(delta) }} 天不是整数，天数一般要取整数。
          把原来的天数调成 {{ mfd }} 的倍数（如 {{ snapUpToMultiple(base, mfd) }} 天）或换一组数据再算。
        </p>
      </div>
    </template>

    <!-- 工程问题 -->
    <template v-else>
      <div class="work-block">
        <p class="seg-title">把总工作量看作 1</p>
        <div class="work-parts">
          <div class="work-part">
            <span class="wp-name">志杰（单独 {{ a }} 时）</span>
            <div class="wp-track">
              <div class="wp-fill" :style="{ width: `${rateA * 100}%` }">1/{{ a }}</div>
            </div>
            <span class="wp-rate">每小时 1/{{ a }} = {{ toFixed2(rateA) }}</span>
          </div>
          <div class="work-part">
            <span class="wp-name">爸爸（单独 {{ b }} 时）</span>
            <div class="wp-track">
              <div class="wp-fill alt" :style="{ width: `${rateB * 100}%` }">1/{{ b }}</div>
            </div>
            <span class="wp-rate">每小时 1/{{ b }} = {{ toFixed2(rateB) }}</span>
          </div>
          <div class="work-part">
            <span class="wp-name">合作效率叠加</span>
            <div class="wp-track combined">
              <div class="wp-fill sum" :style="{ width: `${rateSum * 100}%` }">{{ rateText }}</div>
            </div>
            <span class="wp-rate">1/{{ a }} + 1/{{ b }} = {{ rateText }}（≈{{ toFixed2(rateSum) }}）</span>
          </div>
        </div>
        <p class="seg-result">
          合作每小时完成 1/{{ a }} + 1/{{ b }} = {{ rateText }}，把总工作量 1 按这个效率分：
          <br />
          合作时间 = 1 ÷ {{ rateText }} = <b>{{ hoursText }} 小时{{ hoursExact ? '' : ` ≈ ${hoursFraction.text} 小时` }}</b>
        </p>
        <div class="work-steps" aria-label="效率条相加步进">
          <div class="work-step-head">
            <span class="work-step-count">效率条相加：第 {{ workStep }} / {{ WORK_MAX_STEP }} 步</span>
            <UButton size="xs" variant="soft" :disabled="workStep <= 1" @click="workStep -= 1">上一步</UButton>
            <UButton size="xs" color="primary" variant="soft" :disabled="workStep >= WORK_MAX_STEP" @click="workStep += 1">下一步</UButton>
          </div>
          <ol class="work-step-list">
            <li
              v-for="(s, i) in workVisibleSteps"
              :key="s.title"
              class="work-step"
              :class="{ current: i === workStep - 1 }"
            >
              <span class="work-step-title">{{ s.title }}</span>
              <span class="work-step-detail">{{ s.detail }}</span>
            </li>
          </ol>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.seg-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.segment-block,
.work-block {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  width: 100%;
  max-width: 616px;
}
.seg-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.seg-line {
  display: flex;
  height: 2.6rem;
  border-radius: 0.6rem;
  overflow: hidden;
  width: 100%;
}
.seg-part {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: white;
  font-weight: 700;
  transition: width 0.3s;
}
.seg-part.boys {
  background: var(--ui-primary);
}
.seg-part.girls {
  background: color-mix(in srgb, var(--ui-primary) 40%, white);
  color: var(--ui-text-highlighted);
}
.seg-fix {
  margin-left: 0.4rem;
}
.seg-warn {
  margin-top: 0.35rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 14%, var(--ui-bg));
  color: #92400e;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  max-width: 34rem;
}
.seg-result {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  text-align: center;
  line-height: 1.7;
  font-family: ui-monospace, monospace;
}
.seg-result b {
  color: var(--ui-primary);
}
.scale-note {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  text-align: center;
  margin: -0.2rem 0 0;
}
.two-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.bar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bar-label {
  width: 2.4rem;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  flex-shrink: 0;
}
.bar-track {
  position: relative;
  flex: 1;
  height: 1.7rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  overflow: hidden;
}
.bar-base {
  height: 100%;
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  white-space: nowrap;
}
.bar-base.result {
  background: var(--ui-primary);
  color: white;
}
.bar-delta {
  position: absolute;
  top: 0;
  height: 100%;
  background: color-mix(in srgb, #f59e0b 60%, white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: #92400e;
}
.work-parts {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
}
.work-part {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.wp-name {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
.wp-track {
  height: 1.4rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 0.4rem;
  overflow: hidden;
}
.wp-fill {
  height: 100%;
  background: var(--ui-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wp-fill.alt {
  background: color-mix(in srgb, var(--ui-primary) 45%, white);
  color: var(--ui-text-highlighted);
}
.wp-track.combined {
  height: 1.8rem;
  border-color: var(--ui-warning, #f59e0b);
}
.wp-fill.sum {
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 62%, white);
  color: white;
}
.wp-rate {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
/* 效率条相加步进 */
.work-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.work-step-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.work-step-count {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.work-step-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.work-step {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.4rem 0.7rem;
}
.work-step.current {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg));
}
.work-step-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.work-step-detail {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
/* 线段图分率刻度 */
.seg-ruler {
  position: relative;
  width: 100%;
  height: 1.5rem;
  margin-top: -0.4rem;
}
.seg-tick {
  position: absolute;
  top: 0.1rem;
  transform: translateX(-50%);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}
.seg-tick::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -0.3rem;
  width: 1px;
  height: 0.4rem;
  background: var(--ui-border-accented);
}
.seg-tick.start {
  left: 0;
  transform: none;
}
.seg-tick.end {
  left: 100%;
  transform: translateX(-100%);
}
.seg-tick.frac {
  color: var(--ui-primary);
}
/* 两种解法同步高亮 */
.seg-part.hl {
  outline: 2px solid var(--ui-warning, #f59e0b);
  outline-offset: -2px;
}
.seg-methods {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.seg-method-btn.active {
  border-color: var(--ui-primary);
}
.seg-method-line {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  text-align: center;
  font-family: ui-monospace, monospace;
  max-width: 34rem;
}
/* 先算增减量再加减：两步步进 */
.more-steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.more-step-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.more-step-count {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.more-step-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.more-step {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg);
  padding: 0.4rem 0.7rem;
}
.more-step.current {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg));
}
.more-step-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.more-step-detail {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
</style>
