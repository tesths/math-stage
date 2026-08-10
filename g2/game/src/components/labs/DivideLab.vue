<script setup lang="ts">
/**
 * 除法 Lab：平均分 / 每几个一份 / 用口诀求商
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { koujue } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

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
</script>

<template>
  <div class="div-wrap">
    <!-- 平均分 -->
    <template v-if="kind === 'divide-share'">
      <p class="lead">把 {{ total }} 个平均分成 {{ groups }} 份</p>
      <div class="share-box">
        <div v-for="c in shareCols" :key="c" class="share-col">
          <span v-for="rr in shareRows" :key="rr" class="share-item" />
        </div>
      </div>
      <p class="lead" :class="{ warn: r > 0 }">
        每份 {{ q }} 个<template v-if="r > 0">，还剩 {{ r }} 个</template>
      </p>
    </template>

    <!-- 每几个一份 -->
    <template v-else-if="kind === 'divide-group'">
      <p class="lead">把 {{ total }} 个，每 {{ per }} 个一份</p>
      <div class="pgroup-box">
        <div v-for="g in pgroups" :key="g" class="pgroup">
          <span v-for="cc in pcols" :key="cc" class="share-item" />
        </div>
        <div v-if="pgR > 0" class="pgroup pgroup-left">
          <span v-for="i in list(pgR)" :key="i" class="share-item leftover" />
        </div>
      </div>
      <p class="lead" :class="{ warn: pgR > 0 }">
        分成 {{ pgQ }} 份<template v-if="pgR > 0">，还剩 {{ pgR }} 个</template>
      </p>
    </template>

    <!-- 用口诀求商 -->
    <template v-else>
      <div class="kj-card">
        <p class="kj-expr">{{ prod }} ÷ {{ qb }} = {{ qa }}</p>
        <p class="kj-step">想：{{ qb }} × （ ）= {{ prod }}</p>
        <p class="kj-text">{{ koujue(qa, qb) }}</p>
        <p class="kj-note">商是 {{ qa }}</p>
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
