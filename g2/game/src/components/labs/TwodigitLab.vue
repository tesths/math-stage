<script setup lang="ts">
/**
 * 两位数加、减两位数 Lab：计数器演示（进位/退位）
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const list = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------- 加法 ---------- */
const ta = computed(() => props.values.ta ?? 3)
const oa = computed(() => props.values.oa ?? 4)
const tb = computed(() => props.values.tb ?? 2)
const ob = computed(() => props.values.ob ?? 8)
const addA = computed(() => ta.value * 10 + oa.value)
const addB = computed(() => tb.value * 10 + ob.value)
const oSum = computed(() => oa.value + ob.value)
const carry = computed(() => oSum.value >= 10)
const tSum = computed(() => ta.value + tb.value + (carry.value ? 1 : 0))
const addResult = computed(() => addA.value + addB.value)

/* ---------- 减法 ---------- */
const sta = computed(() => props.values.ta ?? 5)
const soa = computed(() => props.values.oa ?? 4)
const stb = computed(() => props.values.tb ?? 3)
const sob = computed(() => props.values.ob ?? 6)
const subA = computed(() => sta.value * 10 + soa.value)
const subB = computed(() => stb.value * 10 + sob.value)
const borrow = computed(() => soa.value < sob.value)
const oRes = computed(() => (borrow.value ? soa.value + 10 - sob.value : soa.value - sob.value))
const tRes = computed(() => sta.value - (borrow.value ? 1 : 0) - stb.value)
const subResult = computed(() => subA.value - subB.value)
</script>

<template>
  <div class="two-wrap">
    <!-- 加法 -->
    <template v-if="kind === 'twodigit-add'">
      <div class="two-row">
        <div class="two-card">
          <p class="two-num">{{ addA }}</p>
          <div class="two-col">
            <div class="two-t">
              <span v-for="i in list(ta)" :key="i" class="bead" />
            </div>
            <div class="two-o">
              <span v-for="i in list(oa)" :key="i" class="bead" />
            </div>
          </div>
        </div>
        <p class="op">＋</p>
        <div class="two-card">
          <p class="two-num">{{ addB }}</p>
          <div class="two-col">
            <div class="two-t">
              <span v-for="i in list(tb)" :key="i" class="bead" />
            </div>
            <div class="two-o">
              <span v-for="i in list(ob)" :key="i" class="bead" />
            </div>
          </div>
        </div>
        <p class="op">＝</p>
        <div class="two-card result">
          <p class="two-num">{{ addResult }}</p>
          <p class="carry-note">{{ carry ? '个位满十，向十位进 1' : '个位相加不满十' }}</p>
        </div>
      </div>
    </template>

    <!-- 减法 -->
    <template v-else>
      <div class="two-row">
        <div class="two-card">
          <p class="two-num">{{ subA }}</p>
          <div class="two-col">
            <div class="two-t">
              <span v-for="i in list(sta)" :key="i" class="bead" />
            </div>
            <div class="two-o">
              <span v-for="i in list(soa)" :key="i" class="bead" />
            </div>
          </div>
        </div>
        <p class="op">－</p>
        <div class="two-card">
          <p class="two-num">{{ subB }}</p>
          <div class="two-col">
            <div class="two-t">
              <span v-for="i in list(stb)" :key="i" class="bead" />
            </div>
            <div class="two-o">
              <span v-for="i in list(sob)" :key="i" class="bead" />
            </div>
          </div>
        </div>
        <p class="op">＝</p>
        <div class="two-card result">
          <p class="two-num">{{ subResult }}</p>
          <p class="carry-note">{{ borrow ? '个位不够减，从十位退 1 当 10' : '个位相减够减' }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.two-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  justify-content: center;
  min-height: 320px;
  width: 100%;
}
.two-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.two-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 0.8rem;
  text-align: center;
  min-width: 7rem;
}
.two-card.result {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
}
.two-num {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.op {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.two-col {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-top: 0.4rem;
}
.two-t,
.two-o {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 7rem;
}
.bead {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border: 1px solid var(--ui-primary);
}
.carry-note {
  font-size: 0.78rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
}
</style>
