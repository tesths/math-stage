<script setup lang="ts">
/**
 * 线段图 Lab：求一个数的几分之几 / 比一个数多（少）几分之几 / 工程问题
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toFixed2 } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 求一个数的几分之几 ---------- */
const total = computed(() => props.values.total ?? 45)
const fn = computed(() => Math.round(props.values.fn ?? 2))
const fd = computed(() => Math.round(props.values.fd ?? 5))
const boys = computed(() => (total.value * fn.value) / fd.value)
const girls = computed(() => total.value - boys.value)

/* ---------- 比一个数多（少）几分之几 ---------- */
const base = computed(() => props.values.base ?? 14)
const mfn = computed(() => Math.round(props.values.fn ?? 2))
const mfd = computed(() => Math.round(props.values.fd ?? 7))
const mode = computed(() => Math.round(props.values.mode ?? 0))
const delta = computed(() => (base.value * mfn.value) / mfd.value)
const resultVal = computed(() => (mode.value === 0 ? base.value + delta.value : base.value - delta.value))

/* ---------- 工程问题 ---------- */
const a = computed(() => Math.round(props.values.a ?? 6))
const b = computed(() => Math.round(props.values.b ?? 3))
const rateA = computed(() => 1 / a.value)
const rateB = computed(() => 1 / b.value)
const rateSum = computed(() => rateA.value + rateB.value)
const hours = computed(() => 1 / rateSum.value)
</script>

<template>
  <div class="seg-wrap">
    <!-- 求一个数的几分之几：线段图 -->
    <template v-if="kind === 'segment'">
      <div class="segment-block">
        <p class="seg-title">总人数 {{ total }} 人，男运动员占 {{ fn }}/{{ fd }}</p>
        <div class="seg-line">
          <div class="seg-part boys" :style="{ width: `${(fn / fd) * 100}%` }">
            男 {{ fn }}/{{ fd }}
          </div>
          <div class="seg-part girls" :style="{ width: `${((fd - fn) / fd) * 100}%` }">
            女 {{ fd - fn }}/{{ fd }}
          </div>
        </div>
        <p class="seg-result">
          男运动员 = {{ total }} × {{ fn }}/{{ fd }} = {{ toFixed2(boys) }} 人
          <br />
          女运动员 = {{ total }} - {{ toFixed2(boys) }} = <b>{{ toFixed2(girls) }} 人</b>
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
              <div class="bar-base" :style="{ width: `${base}%` }">{{ base }} 天</div>
            </div>
          </div>
          <div class="bar-row">
            <span class="bar-label">现在</span>
            <div class="bar-track">
              <div class="bar-base result" :style="{ width: `${resultVal}%` }">
                {{ toFixed2(resultVal) }} 天
              </div>
              <div
                class="bar-delta"
                :style="{
                  width: `${delta}%`,
                  left: `${mode === 0 ? base : resultVal}%`,
                }"
              >
                ±{{ toFixed2(delta) }}
              </div>
            </div>
          </div>
        </div>
        <p class="seg-result">
          {{ mode === 0 ? '增加' : '减少' }}的部分 = {{ base }} × {{ mfn }}/{{ mfd }} = {{ toFixed2(delta) }} 天
          <br />
          结果 = {{ base }} {{ mode === 0 ? '+' : '-' }} {{ toFixed2(delta) }} = <b>{{ toFixed2(resultVal) }} 天</b>
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
        </div>
        <p class="seg-result">
          一起每小时 1/{{ a }} + 1/{{ b }} = {{ toFixed2(rateSum) }}
          <br />
          合作时间 = 1 ÷ {{ toFixed2(rateSum) }} = <b>{{ toFixed2(hours) }} 小时</b>
        </p>
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
.wp-rate {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  font-family: ui-monospace, monospace;
}
</style>
