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
const oResult = computed(() => (carry.value ? oSum.value - 10 : oSum.value))
const tResult = computed(() => ta.value + tb.value + (carry.value ? 1 : 0))
const addResult = computed(() => addA.value + addB.value)

/* ---------- 减法 ---------- */
const sta = computed(() => props.values.ta ?? 5)
const soa = computed(() => props.values.oa ?? 4)
const stb = computed(() => props.values.tb ?? 3)
const sob = computed(() => props.values.ob ?? 6)
const subA = computed(() => sta.value * 10 + soa.value)
const subB = computed(() => stb.value * 10 + sob.value)
const borrow = computed(() => soa.value < sob.value)
const subTAfter = computed(() => sta.value - (borrow.value ? 1 : 0))
const subOBorrowed = computed(() => (borrow.value ? soa.value + 10 : soa.value))
const oRes = computed(() => (borrow.value ? soa.value + 10 - sob.value : soa.value - sob.value))
const tRes = computed(() => sta.value - (borrow.value ? 1 : 0) - stb.value)
const subResult = computed(() => subA.value - subB.value)
</script>

<template>
  <div class="two-wrap">
    <!-- 加法：个位满十捆一 -->
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
      </div>

      <div v-if="carry" class="carry-zone">
        <div class="ten-group">
          <p class="zone-label">个位：{{ oa }} + {{ ob }} = {{ oSum }}，其中 10 个一圈</p>
          <div class="ten-wrap">
            <span v-for="i in 10" :key="i" class="bead ten-bead" />
          </div>
          <p class="zone-tag">10 个一</p>
        </div>
        <p class="op">→</p>
        <div class="ten-rod-new">
          <p class="zone-label">捆成 1 个十，进到十位</p>
          <div class="ten-rod-row">
            <span v-for="i in 10" :key="i" class="bead ten-bead" />
          </div>
          <p class="zone-tag">1 个十（进位 1）</p>
        </div>
      </div>

      <div class="two-row result-row">
        <div class="two-card result">
          <p class="two-num">{{ addResult }}</p>
          <div class="two-col">
            <div class="two-t">
              <span v-for="i in list(tResult)" :key="i" class="bead t-result" />
            </div>
            <div class="two-o">
              <span v-for="i in list(oResult)" :key="i" class="bead o-result" />
            </div>
          </div>
        </div>
        <div class="vcalc">
          <p class="v-carry" v-if="carry">进1</p>
          <p class="v-line"><span class="v-a">{{ addA }}</span></p>
          <p class="v-line">+ <span class="v-b">{{ addB }}</span></p>
          <p class="v-rule"></p>
          <p class="v-line"><span class="v-res">{{ addResult }}</span></p>
        </div>
      </div>
      <p class="carry-note">{{ carry ? '个位满十，10 个一 = 1 个十，向十位进 1' : `个位相加 ${oSum}，不满十不进位` }}</p>
    </template>

    <!-- 减法：十位退一拆十 -->
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
      </div>

      <div v-if="borrow" class="borrow-zone">
        <div class="ten-group">
          <p class="zone-label">十位 5 退 1：1 个十拆成 10 个一</p>
          <div class="bead-row">
            <span v-for="i in 10" :key="i" class="bead ten-bead borrow" />
          </div>
          <p class="zone-tag">拆出的 10 个一，并入个位：{{ soa }} + 10 = {{ subOBorrowed }}</p>
        </div>
      </div>

      <div class="two-row result-row">
        <div class="two-card result">
          <p class="two-num">{{ subResult }}</p>
          <div class="two-col">
            <div class="two-t">
              <span v-for="i in list(tRes)" :key="i" class="bead t-result" />
            </div>
            <div class="two-o">
              <span v-for="i in list(oRes)" :key="i" class="bead o-result" />
            </div>
          </div>
        </div>
        <div class="vcalc">
          <p class="v-line"><span class="v-a">{{ subA }}</span></p>
          <p class="v-line">- <span class="v-b">{{ subB }}</span></p>
          <p class="v-rule"></p>
          <p class="v-line"><span class="v-res">{{ subResult }}</span></p>
        </div>
      </div>
      <p class="carry-note">{{ borrow ? '个位不够减，从十位退 1 当 10（1 个十 = 10 个一）' : '个位相减够减' }}</p>
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
  align-items: flex-start;
}
.bead {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border: 1px solid var(--ui-primary);
}
.bead.t-result {
  background: color-mix(in srgb, var(--ui-primary) 75%, white);
}
.bead.o-result {
  background: color-mix(in srgb, var(--ui-color-success-500, #22c55e) 60%, white);
  border-color: var(--ui-color-success-600, #16a34a);
}
.carry-zone,
.borrow-zone {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-warning, #f59e0b);
  border-radius: var(--ui-radius-xl);
  padding: 0.7rem 1.2rem;
}
.ten-group,
.ten-rod-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.ten-wrap {
  display: grid;
  grid-template-columns: repeat(5, auto);
  gap: 2px;
  border: 2px solid var(--ui-warning, #f59e0b);
  border-radius: 0.6rem;
  padding: 0.35rem;
  background: var(--ui-bg);
}
.bead.ten-bead {
  width: 0.8rem;
  height: 0.8rem;
  background: var(--ui-warning, #f59e0b);
  border-color: var(--ui-warning, #f59e0b);
}
.bead.ten-bead.borrow {
  background: var(--ui-color-success-500, #22c55e);
  border-color: var(--ui-color-success-600, #16a34a);
}
.ten-rod-row {
  display: flex;
  gap: 2px;
  border: 2px solid var(--ui-warning, #f59e0b);
  border-radius: 0.6rem;
  padding: 0.35rem;
  background: var(--ui-bg);
}
.zone-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  margin: 0;
}
.zone-tag {
  font-size: 0.75rem;
  color: var(--ui-warning, #f59e0b);
  font-weight: 700;
  margin: 0;
}
.vcalc {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.4rem 0.9rem;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  font-family: ui-monospace, monospace;
}
.v-carry {
  margin: 0 0 0.1rem;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--ui-warning, #f59e0b);
  padding-right: 1.6rem;
}
.v-line {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.v-a {
  color: var(--ui-text-highlighted);
}
.v-b {
  color: var(--ui-text-highlighted);
}
.v-res {
  color: var(--ui-primary);
  font-weight: 800;
  font-size: 1.3rem;
}
.v-rule {
  border-top: 1.5px solid var(--ui-text-highlighted);
  width: 100%;
  margin: 0.1rem 0;
}
.carry-note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
}
</style>