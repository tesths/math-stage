<script setup lang="ts">
/**
 * 两位数加、减两位数 Lab：数位模型演示（十连棒 + 单珠）
 *
 * 为什么十位要画成「十连棒」而不是「十位 N 颗珠子」：
 * 旧版十位、个位都画珠子，同一颗珠子在十位表示 10、在个位表示 1，学生看不出
 * 「1 个十 = 10 个一」，退位时「十位退 1 当 10」就成了空话。
 * 现在十位一根棒 = 10 个一（棒上画满 10 个点，能直接数出来），个位一颗珠 = 1 个一，
 * 于是「54 = 5 根棒 + 4 颗珠」「退位后 = 4 根棒 + 14 颗珠」在图上是数得出来的，
 * 而且「棒×10 + 珠 = 原数」由组件测试守住（拆开前后都守恒）。
 */
import { computed, ref, watch } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { borrowSub, carryAdd } from '@/lib/labs/process'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()
const emit = defineEmits<{ acted: [] }>()

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
/** 被减数比减数小：本册不学，明确提示而不是偷偷调换两个数（旧实现的 P0） */
const subInvalid = computed(() => subA.value < subB.value)

/* ---------- 过程态：0 = 全部摆好；1 个位 / 2 进位退位 / 3 十位与结果 ---------- */
const step = ref(0)
const doing = computed(() => step.value > 0)
const addProc = computed(() => carryAdd(ta.value, oa.value, tb.value, ob.value))
const subProc = computed(() => borrowSub(sta.value, soa.value, stb.value, sob.value))

/** 加法：10 个一已经捆成 1 根十连棒（第 2 步之后） */
const carryDone = computed(() => carry.value && doing.value && step.value >= 2)
/** 减法：十位那根棒已经拆成 10 颗散珠（第 2 步之后） */
const splitDone = computed(() => borrow.value && !subInvalid.value && doing.value && step.value >= 2)

/** 被减数在图上的实际摆法：拆开后十位少 1 根、个位多 10 颗，总数不变 */
const minTens = computed(() => (splitDone.value ? sta.value - 1 : sta.value))
const minOnes = computed(() => (splitDone.value ? soa.value + 10 : soa.value))
const minTotal = computed(() => minTens.value * 10 + minOnes.value)
/** 加法进位那一步：12 颗散珠里 10 颗捆成 1 根棒，个位剩 oResult 颗（加数本身不改，仍摆 28） */
const looseRest = computed(() => oResult.value)

const curSay = computed(() => {
  if (kind.value === 'twodigit-add') {
    const p = addProc.value
    if (step.value === 1) return `先算个位：${oa.value} + ${ob.value} = ${p.oSum}`
    if (step.value === 2)
      return p.carry
        ? `个位 ${p.oSum} 满十：10 个一捆成 1 根十连棒（1 个十），向十位进 1`
        : `个位 ${p.oSum} 不满十，不进位`
    if (step.value === 3) return `再算十位：${ta.value} + ${tb.value}${p.carry ? ' + 1（进上来的）' : ''} = ${p.tRes}，得 ${p.value}`
  } else {
    const p = subProc.value
    if (step.value === 1) return `先算个位：${soa.value} − ${sob.value}${p.borrow ? '，不够减' : ''}`
    if (step.value === 2)
      return p.borrow
        ? `个位不够减：十位 ${sta.value} 退 1，1 根十连棒拆成 10 颗散珠，${soa.value} + 10 = ${p.oBorrowed}（十位剩 ${sta.value - 1} 根）`
        : '个位够减，不退位'
    if (step.value === 3) return `再算十位：${sta.value}${p.borrow ? ' − 1（退掉的）' : ''} − ${stb.value} = ${p.tRes - stb.value}，得 ${p.value}`
  }
  return ''
})
const stepLabel = computed(() => (step.value === 0 ? (kind.value === 'twodigit-add' ? '算一算' : '减一减') : step.value >= 3 ? '从头再来' : '下一步'))
function nextStep() {
  step.value = step.value >= 3 ? 0 : step.value + 1
  if (step.value > 0) emit('acted')
}
watch([ta, oa, tb, ob, kind], () => {
  step.value = 0
})
</script>

<template>
  <div class="two-wrap">
    <!-- 加法：个位满十，10 个一捆成 1 根十连棒 -->
    <template v-if="kind === 'twodigit-add'">
      <div class="two-row">
        <div class="two-card" data-test="addend-a">
          <p class="two-num">{{ addA }}</p>
          <div class="two-col">
            <div class="two-t" data-test="tens">
              <span v-for="i in list(ta)" :key="i" class="rod" data-test="rod">
                <span v-for="d in 10" :key="d" class="rod-dot" />
              </span>
            </div>
            <div class="two-o" data-test="ones">
              <span v-for="i in list(oa)" :key="i" class="bead" data-test="one-bead" />
            </div>
          </div>
          <p class="pv-total" data-test="pv-total">{{ ta }} 根十连棒 + {{ oa }} 颗珠 = {{ addA }}</p>
        </div>
        <p class="op">＋</p>
        <div class="two-card" data-test="addend-b">
          <p class="two-num">{{ addB }}</p>
          <div class="two-col">
            <div class="two-t" data-test="tens">
              <span v-for="i in list(tb)" :key="i" class="rod" data-test="rod">
                <span v-for="d in 10" :key="d" class="rod-dot" />
              </span>
            </div>
            <div class="two-o" data-test="ones">
              <span v-for="i in list(ob)" :key="i" class="bead" data-test="one-bead" />
            </div>
          </div>
          <p class="pv-total" data-test="pv-total">{{ tb }} 根十连棒 + {{ ob }} 颗珠 = {{ addB }}</p>
        </div>
      </div>

      <p v-if="doing" class="proc-say" data-test="proc-say">{{ curSay }}</p>
      <div v-if="carry" class="carry-zone" :class="{ dim: doing && step < 2 }">
        <div class="ten-group">
          <p class="zone-label">个位：{{ oa }} + {{ ob }} = {{ oSum }}，其中 10 个一圈</p>
          <div class="loose-ten" :class="{ armed: carryDone }">
            <span v-for="i in 10" :key="i" class="bead ten-bead" data-test="carry-loose" />
          </div>
          <p class="zone-tag">10 个一（捆走的这 10 颗）</p>
        </div>
        <p class="op">→</p>
        <div class="ten-rod-new">
          <p class="zone-label">捆成 1 根十连棒，进到十位</p>
          <div class="rod rod-ten" :class="{ 'rod-new': carryDone }" data-test="carry-rod">
            <span v-for="d in 10" :key="d" class="rod-dot" />
          </div>
          <p class="zone-tag">1 个十（进位 1），个位还剩 {{ looseRest }} 颗</p>
        </div>
      </div>

      <div class="two-row result-row" :class="{ dim: doing && step < 3 }">
        <div class="two-card result" data-test="add-result">
          <p class="two-num">{{ addResult }}</p>
          <div class="two-col">
            <div class="two-t" data-test="tens">
              <span v-for="i in list(tResult)" :key="i" class="rod rod-result" data-test="rod">
                <span v-for="d in 10" :key="d" class="rod-dot" />
              </span>
            </div>
            <div class="two-o" data-test="ones">
              <span v-for="i in list(oResult)" :key="i" class="bead o-result" data-test="one-bead" />
            </div>
          </div>
          <p class="pv-total" data-test="pv-total">{{ tResult }} 根十连棒 + {{ oResult }} 颗珠 = {{ addResult }}</p>
        </div>
        <div class="vcalc">
          <p class="v-carry" v-if="carry">进1</p>
          <p class="v-line"><span class="v-a">{{ addA }}</span></p>
          <p class="v-line">+ <span class="v-b">{{ addB }}</span></p>
          <p class="v-rule"></p>
          <p class="v-line"><span class="v-res">{{ addResult }}</span></p>
        </div>
      </div>
      <p class="carry-note">{{ carry ? '个位满十：10 个一 = 1 个十（1 根十连棒），向十位进 1' : `个位相加 ${oSum}，不满十不进位` }}</p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">{{ stepLabel }}</button>
        <span class="step-say" data-test="step-say">{{ doing ? curSay : '点「算一算」，先个位、再看满十进 1、最后十位' }}</span>
      </div>
    </template>

    <!-- 减法：十位退 1，1 根十连棒拆成 10 颗散珠 -->
    <template v-else>
      <div class="two-row">
        <div class="two-card" data-test="minuend" :class="{ split: splitDone }">
          <p class="two-num">{{ subA }}</p>
          <div class="two-col">
            <div class="two-t" data-test="tens">
              <span
                v-for="i in list(minTens)"
                :key="i"
                class="rod"
                :class="{ 'rod-left': splitDone && i === 0 }"
                data-test="rod"
              >
                <span v-for="d in 10" :key="d" class="rod-dot" />
              </span>
            </div>
            <div class="two-o" data-test="ones">
              <span
                v-for="i in list(minOnes)"
                :key="i"
                class="bead"
                :class="{ 'bead-borrow': splitDone && i > soa }"
                data-test="one-bead"
              />
            </div>
          </div>
          <p class="pv-total" data-test="pv-total">
            {{ minTens }} 根十连棒 + {{ minOnes }} 颗珠 = {{ minTotal }}
            <span v-if="splitDone" class="pv-split-note">（拆开后的摆法，总数还是 {{ subA }}）</span>
          </p>
        </div>
        <p class="op">－</p>
        <div class="two-card" data-test="subtrahend">
          <p class="two-num">{{ subB }}</p>
          <div class="two-col">
            <div class="two-t" data-test="tens">
              <span v-for="i in list(stb)" :key="i" class="rod" data-test="rod">
                <span v-for="d in 10" :key="d" class="rod-dot" />
              </span>
            </div>
            <div class="two-o" data-test="ones">
              <span v-for="i in list(sob)" :key="i" class="bead" data-test="one-bead" />
            </div>
          </div>
          <p class="pv-total" data-test="pv-total">{{ stb }} 根十连棒 + {{ sob }} 颗珠 = {{ subB }}</p>
        </div>
      </div>

      <p v-if="subInvalid" class="proc-warn" data-test="proc-warn">
        被减数 {{ subA }} 比减数 {{ subB }} 小，本册还不学这种情况：先把被减数调大一些再减。
      </p>
      <p v-if="doing" class="proc-say" data-test="proc-say">{{ curSay }}</p>
      <div v-if="borrow && !subInvalid" class="borrow-zone" :class="{ dim: doing && step < 2 }">
        <div class="ten-group">
          <p class="zone-label">十位 {{ sta }} 退 1：1 个十拆成 10 个一</p>
          <div class="split-stage" :class="{ open: splitDone }" data-test="split-stage">
            <div class="rod rod-ten" :class="{ tearing: splitDone }" data-test="split-rod">
              <span v-for="d in 10" :key="d" class="rod-dot" />
            </div>
            <p class="op">→</p>
            <div class="loose-ten" :class="{ armed: splitDone }">
              <span v-for="i in 10" :key="i" class="bead borrow-bead" data-test="borrow-bead" />
            </div>
          </div>
          <p class="zone-tag">拆出的 10 个一，并入个位：{{ soa }} + 10 = {{ subOBorrowed }}</p>
        </div>
      </div>

      <div class="two-row result-row" :class="{ dim: doing && step < 3 }">
        <div class="two-card result" data-test="sub-result">
          <p class="two-num">{{ subResult }}</p>
          <div class="two-col">
            <div class="two-t" data-test="tens">
              <span v-for="i in list(tRes)" :key="i" class="rod rod-result" data-test="rod">
                <span v-for="d in 10" :key="d" class="rod-dot" />
              </span>
            </div>
            <div class="two-o" data-test="ones">
              <span v-for="i in list(oRes)" :key="i" class="bead o-result" data-test="one-bead" />
            </div>
          </div>
          <p class="pv-total" data-test="pv-total">{{ tRes }} 根十连棒 + {{ oRes }} 颗珠 = {{ subResult }}</p>
        </div>
        <div class="vcalc">
          <p class="v-carry" v-if="borrow">退1，个位变 {{ subOBorrowed }}</p>
          <p class="v-line"><span class="v-a">{{ subA }}</span></p>
          <p class="v-line">- <span class="v-b">{{ subB }}</span></p>
          <p class="v-rule"></p>
          <p class="v-line"><span class="v-res">{{ subResult }}</span></p>
        </div>
      </div>
      <p class="carry-note">{{ borrow ? '个位不够减，从十位退 1：1 根十连棒拆成 10 颗散珠（1 个十 = 10 个一）' : '个位相减够减' }}</p>
      <div class="step-bar">
        <button type="button" class="step-btn" data-test="step-next" @click="nextStep">{{ stepLabel }}</button>
        <span class="step-say" data-test="step-say">{{ doing ? curSay : '点「减一减」，先个位、再看退 1 当 10、最后十位' }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dim {
  opacity: 0.22;
}
.proc-say {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.proc-warn {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ui-error, #dc2626);
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
  max-width: 26rem;
  line-height: 1.4;
}
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
  transition: border-color 0.3s, background 0.3s;
}
.two-card.split {
  border-color: var(--ui-color-success-600, #16a34a);
  background: color-mix(in srgb, var(--ui-color-success-500, #22c55e) 10%, transparent);
}
.two-card.bundled {
  border-color: var(--ui-color-success-600, #16a34a);
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
  align-items: flex-start;
}
.two-t,
.two-o {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 8rem;
  align-items: flex-start;
}
/* 十连棒：一根 = 10 个一，棒上画满 10 个点，学生能直接数出来 */
.rod {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  padding: 2px;
  border-radius: 4px;
  border: 1.5px solid var(--ui-color-primary-700, #1d4ed8);
  background: color-mix(in srgb, var(--ui-primary) 18%, white);
  transition: opacity 0.35s, transform 0.35s, border-color 0.35s, background 0.35s;
}
.rod-dot {
  width: 0.16rem;
  height: 0.16rem;
  border-radius: 9999px;
  background: var(--ui-color-primary-700, #1d4ed8);
}
.rod-result {
  background: color-mix(in srgb, var(--ui-primary) 32%, white);
}
.rod.rod-new {
  border-color: var(--ui-color-success-600, #16a34a);
  background: color-mix(in srgb, var(--ui-color-success-500, #22c55e) 30%, white);
}
.rod.rod-left {
  border-color: var(--ui-color-success-600, #16a34a);
}
.rod.tearing {
  opacity: 0.4;
  border-style: dashed;
  transform: scaleY(0.9);
}
.rod-ten {
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 4px 6px;
}
.rod-ten .rod-dot {
  width: 0.2rem;
  height: 0.2rem;
}
.bead {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 55%, white);
  border: 1px solid var(--ui-primary);
  transition: background 0.3s, border-color 0.3s;
}
.bead.o-result {
  background: color-mix(in srgb, var(--ui-color-success-500, #22c55e) 60%, white);
  border-color: var(--ui-color-success-600, #16a34a);
}
.bead-borrow {
  background: color-mix(in srgb, var(--ui-color-success-500, #22c55e) 65%, white);
  border-color: var(--ui-color-success-600, #16a34a);
}
.pv-total {
  margin: 0.35rem 0 0;
  font-size: 0.72rem;
  color: var(--ui-text-muted);
}
.pv-split-note {
  color: var(--ui-color-success-600, #16a34a);
  font-weight: 700;
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
.split-stage {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.loose-ten {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  max-width: 6.4rem;
  border: 2px dashed var(--ui-border-accented);
  border-radius: 0.6rem;
  padding: 0.3rem;
  background: var(--ui-bg);
  opacity: 0.35;
  transition: opacity 0.35s, border-color 0.35s;
}
.loose-ten.armed {
  opacity: 1;
  border-color: var(--ui-color-success-600, #16a34a);
}
.bead.ten-bead {
  background: var(--ui-warning, #f59e0b);
  border-color: var(--ui-warning, #f59e0b);
}
.bead.borrow-bead {
  background: var(--ui-color-success-500, #22c55e);
  border-color: var(--ui-color-success-600, #16a34a);
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
