<script setup lang="ts">
/**
 * 除法 Lab：平均分 / 每几个一份 / 用口诀求商
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { koujue } from '@/lib/engine/math'
import { chunkGroups, packUp, shareRounds } from '@/lib/labs/process'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()
const emit = defineEmits<{ acted: [] }>()

const kind = computed(() => props.lab.kind)

const list = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------- 平均分：分成 groups 份，每份 q ---------- */
const total = computed(() => props.values.total ?? 8)
const groups = computed(() => props.values.groups ?? 2)
const q = computed(() => Math.floor(total.value / groups.value))
const r = computed(() => total.value % groups.value)
const shareCols = computed(() => list(groups.value))
const shareRows = computed(() => list(q.value))

/* ---------- 每几个一份 ---------- */
const per = computed(() => props.values.per ?? 2)
const pgQ = computed(() => Math.floor(total.value / per.value))
const pgR = computed(() => total.value % per.value)
const pgroups = computed(() => list(pgQ.value))
const pcols = computed(() => list(per.value))

/* ---------- 用口诀求商 ---------- */
const qb = computed(() => props.values.b ?? 2)
const qa = computed(() => props.values.a ?? 4)
const prod = computed(() => qb.value * qa.value)

/* ---------- 过程态：第几轮 / 圈到第几份 / 装到第几辆 ---------- */
/** 0 表示「已经全部分好」（结果状态），>0 表示正在演示第 k 步 */
const step = ref(0)
const rounds = computed(() => shareRounds(total.value, groups.value))
const chunks = computed(() => chunkGroups(total.value, per.value))
const packs = computed(() => packUp(qb.value, qa.value, koujue))

/** 平均分：当前每份已经分到几个 */
const curEach = computed(() => (step.value > 0 ? (rounds.value[step.value - 1]?.state.each ?? 0) : q.value))
const curLeft = computed(() =>
  step.value > 0 ? (rounds.value[step.value - 1]?.state.left ?? 0) : r.value,
)
/** 每几个一份：当前圈住几份 */
const curGroups = computed(() => (step.value > 0 ? (chunks.value[step.value - 1]?.state.groups ?? 0) : pgQ.value))
/** 求商：当前装了几辆 */
const curCars = computed(() => (step.value > 0 ? (packs.value[step.value - 1]?.state.cars ?? 0) : qa.value))
const curUsed = computed(() =>
  step.value > 0 ? (packs.value[step.value - 1]?.state.used ?? 0) : prod.value,
)
const curKj = computed(() =>
  step.value > 0 ? (packs.value[step.value - 1]?.state.koujue ?? '') : koujue(qa.value, qb.value),
)
const totalSteps = computed(() => {
  if (kind.value === 'divide-share') return rounds.value.length
  if (kind.value === 'divide-group') return chunks.value.length
  return packs.value.length
})
const doing = computed(() => step.value > 0)

function nextStep() {
  step.value = step.value >= totalSteps.value ? 0 : step.value + 1
  if (step.value > 0) emit('acted')
}

watch([total, groups, per, qa, qb, kind], () => {
  step.value = 0
})
</script>

<template>
  <div class="div-wrap">
    <!-- 平均分 -->
    <template v-if="kind === 'divide-share'">
      <p class="lead">把 {{ total }} 个平均分成 {{ groups }} 份</p>
      <div class="share-box">
        <div v-for="c in shareCols" :key="c" class="share-col" :data-each="curEach">
          <span
            v-for="rr in shareRows"
            :key="rr"
            class="share-item"
            :class="{ dim: rr + 1 > curEach }"
          />
        </div>
      </div>
      <p class="lead" :class="{ warn: curLeft > 0 }">
        每份 {{ curEach }} 个<template v-if="curLeft > 0">，还剩 {{ curLeft }} 个</template>
      </p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">分一分</button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `第 ${step} 轮：每一份再分 1 个，每份 ${curEach} 个，还剩 ${curLeft} 个`
              : '点「分一分」，一轮一轮地分：每轮每一份只分 1 个'
          }}
        </span>
      </div>
    </template>

    <!-- 每几个一份 -->
    <template v-else-if="kind === 'divide-group'">
      <p class="lead">把 {{ total }} 个，每 {{ per }} 个一份</p>
      <div class="pgroup-box">
        <div v-for="g in pgroups" :key="g" class="pgroup" :class="{ dim: g + 1 > curGroups }">
          <span v-for="cc in pcols" :key="cc" class="share-item" />
        </div>
        <div v-if="pgR > 0" class="pgroup pgroup-left">
          <span v-for="i in list(pgR)" :key="i" class="share-item leftover" />
        </div>
      </div>
      <p class="lead" :class="{ warn: pgR > 0 }">
        分成 {{ curGroups }} 份<template v-if="pgR > 0">，还剩 {{ pgR }} 个</template>
      </p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">圈一份</button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `圈出第 ${curGroups} 份：已经圈走 ${curGroups * per} 个，还剩 ${total - curGroups * per} 个`
              : `点「圈一份」，每 ${per} 个圈成一份，数数能圈出几份`
          }}
        </span>
      </div>
    </template>

    <!-- 用口诀求商 -->
    <template v-else>
      <div class="kj-card">
        <p class="kj-expr">{{ prod }} ÷ {{ qb }} = {{ qa }}</p>
        <p class="kj-step">想：{{ qb }} × （ ）= {{ prod }}</p>
        <p class="kj-text">{{ koujue(qa, qb) }}</p>
        <p class="kj-note">
          {{ doing ? `装了 ${curCars} 辆，用掉 ${curUsed} 个车轮，还剩 ${prod - curUsed} 个` : `商是 ${qa}` }}
        </p>
        <p class="kj-note">{{ curKj }}</p>
      </div>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">装一辆车</button>
        <span class="step-say" data-test="step-say">
          {{
            doing
              ? `第 ${curCars} 辆装好：一共用掉 ${curUsed} 个，还剩 ${prod - curUsed} 个`
              : `点「装一辆车」，每辆车要 ${qb} 个车轮，看能装几辆`
          }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.div-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.lead {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.dim {
  opacity: 0.22;
}
.step-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step-btn {
  border: 1px solid var(--ui-primary);
  background: var(--ui-bg);
  color: var(--ui-primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.22rem 0.9rem;
  cursor: pointer;
}
.step-say {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.lead.warn {
  color: var(--ui-error, #dc2626);
}
.share-box {
  display: flex;
  gap: 0.6rem;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.8rem;
  background: var(--ui-bg-muted);
}
.share-col {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  padding: 0.35rem;
}
.share-item {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 50%, white);
  border: 1px solid var(--ui-primary);
}
.pgroup-box {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.8rem;
  background: var(--ui-bg-muted);
  max-width: 36rem;
}
.pgroup {
  display: flex;
  gap: 0.3rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  padding: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.pgroup-left {
  border-style: dashed;
  border-color: var(--ui-error, #dc2626);
}
.share-item.leftover {
  background: var(--ui-error, #dc2626);
  border-color: var(--ui-error, #dc2626);
}
.kj-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  background: var(--ui-bg-muted);
  padding: 1rem 1.8rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: center;
  min-width: 14rem;
}
.kj-expr {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-primary);
  font-family: ui-monospace, monospace;
}
.kj-step {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.kj-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.kj-note {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}
</style>
