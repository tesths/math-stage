<script setup lang="ts">
/**
 * 多位数的认识 Lab：计数单位 / 数位顺序表 / 多位数组成 / 四舍五入 / 数字编码
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { COUNT_UNITS, formatBig } from '@/lib/engine/math'
import { fourDigitGroups, roundToWan } from '@/lib/labs/number'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 计数单位 ---------- */
const v = computed(() => Math.round(props.values.v ?? 10000))
const vUnits = computed(() => {
  const table = [
    { size: 1e8, unit: '亿', prev: '10 个千万是一亿' },
    { size: 1e7, unit: '千万', prev: '10 个百万是一千万' },
    { size: 1e6, unit: '百万', prev: '10 个十万是一百万' },
    { size: 1e5, unit: '十万', prev: '10 个一万是十万' },
    { size: 1e4, unit: '万', prev: '10 个一千是一万' },
    { size: 1e3, unit: '千', prev: '10 个一百是一千' },
    { size: 100, unit: '百', prev: '10 个十是一百' },
  ]
  const hit = table.find((x) => v.value >= x.size) ?? table[table.length - 1]!
  // 不是整份数时如实写成"几个 + 余数"，不能出现 2.5 个万
  const whole = Math.floor(v.value / hit.size)
  const rest = v.value - whole * hit.size
  return { unit: hit.unit, k: whole, rest, prev: hit.prev }
})

/* ---------- 数位顺序表 ---------- */
const digit = computed(() => Math.round(props.values.digit ?? 3))
const place = computed(() => Math.round(props.values.place ?? 4))
const unitName = computed(() => COUNT_UNITS[place.value - 1] ?? '个')
/** 生成一个该数位上是 digit 的数（其余为 0） */
const placeNum = computed(() => digit.value * 10 ** (place.value - 1))

/* ---------- 多位数组成 ---------- */
const wan = computed(() => Math.round(props.values.wan ?? 1600))
const yi = computed(() => Math.round(props.values.yi ?? 0))
const value = computed(() => yi.value * 1e8 + wan.value * 1e4)
const valueDigits = computed(() => String(value.value).split('').reverse())

/* ---------- 四舍五入 ---------- */
const approxV = computed(() => Math.round(props.values.v ?? 384204))
/** 千位上的数字与四舍五入结果都走纯函数（旧实现取成了百位，判断进不进会错） */
const approxR = computed(() => roundToWan(approxV.value))
const wanDigit = computed(() => approxR.value.digit)
const approxWan = computed(() => approxR.value.wan)
/** 四位分级 */
const groups = computed(() => fourDigitGroups(value.value))

/* ---------- 身份证 ---------- */
const year = computed(() => Math.round(props.values.year ?? 2016))
const month = computed(() => Math.round(props.values.month ?? 2))
const day = computed(() => Math.round(props.values.day ?? 18))
/* ---------- 过程态 ---------- */
/** 计数单位：一个一个地数上去 */
const countShown = ref(0)
function nextUnit() {
  countShown.value = countShown.value >= vUnits.value.k ? 1 : countShown.value + 1
}
/** 数位顺序表：从高位往低位一位一位看 */
const placeCursor = ref(13 - 1)
function nextPlace() {
  placeCursor.value = placeCursor.value <= 1 ? 12 : placeCursor.value - 1
}
/** 多位数：四位一级分组 */
const grouped = ref(true)
function toggleGroup() {
  grouped.value = !grouped.value
}
/** 四舍五入：点一下看千位决定进不进 */
const approxShown = ref(true)
function toggleApprox() {
  approxShown.value = !approxShown.value
}
/** 身份证：一段一段读 */
const idStep = ref(3)
function nextId() {
  idStep.value = idStep.value >= 3 ? 1 : idStep.value + 1
}

const dateCode = computed(() => `${year.value}${String(month.value).padStart(2, '0')}${String(day.value).padStart(2, '0')}`)
</script>

<template>
  <div class="num-wrap">
    <!-- 计数单位 -->
    <template v-if="kind === 'num-count'">
      <div class="count-line">
        <span class="count-arrow">← {{ vUnits.prev }}</span>
      </div>
      <p class="big-num">{{ formatBig(v) }}</p>
      <div class="unit-blocks">
        <span v-for="i in vUnits.k" :key="'u' + i" class="unit-block" :class="{ dim: i > countShown }" />
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="count-next" @click="nextUnit">
          试一试：一个一个数（已数 {{ countShown }} / {{ vUnits.k }} 个{{ vUnits.unit }}）
        </button>
      </div>
      <p class="note" data-test="count-note">
        {{ formatBig(v) }} 里有 <b>{{ vUnits.k }}</b> 个{{ vUnits.unit }}{{ vUnits.rest ? `，还剩 ${formatBig(vUnits.rest)}` : '' }}
      </p>
    </template>

    <!-- 数位顺序表 -->
    <template v-else-if="kind === 'num-place'">
      <p class="big-num">{{ formatBig(placeNum) }}</p>
      <div class="place-table">
        <div class="place-head">
          <span v-for="i in 12" :key="'u' + i" class="place-unit">
            {{ COUNT_UNITS[12 - i] }}
          </span>
        </div>
        <div class="place-row">
          <span
            v-for="i in 12"
            :key="'d' + i"
            class="place-cell"
            :class="{ active: 12 - i + 1 === place }"
          >
            {{ 12 - i + 1 === place ? digit : 0 }}
          </span>
        </div>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="place-next" @click="nextPlace">
          试一试：从高位往低位一位一位看（当前第 {{ placeCursor }} 位）
        </button>
      </div>
      <p class="note">
        <b>{{ digit }}</b> 写在{{ unitName }}位上，表示 <b>{{ digit }} 个{{ unitName }}</b>
      </p>
    </template>

    <!-- 多位数组成 -->
    <template v-else-if="kind === 'num-multidigit'">
      <p class="big-num">{{ formatBig(value) }}</p>
      <div class="wan-chips">
        <span class="wan-chip yi" :class="{ hidden: yi === 0 }">{{ yi }} 个亿</span>
        <span class="wan-chip">{{ wan }} 个万</span>
      </div>
      <div class="digit-strip">
        <span
          v-for="(d, i) in valueDigits"
          :key="i"
          class="digit-cell"
          :class="{ zero: d === '0' }"
        >{{ d }}</span>
      </div>
      <div class="op-bar">
        <button type="button" class="op-btn primary" data-test="group-next" @click="toggleGroup">
          试一试：四位一级分组（{{ grouped ? '已分组' : '未分组' }}）
        </button>
      </div>
      <p class="note">
        由 {{ wan }} 个万{{ yi > 0 ? `和 ${yi} 个亿` : '' }}组成，写作 {{ formatBig(value) }}
        <template v-if="grouped">
          ；从右边起四位一级：
          {{ groups.map((g) => `${g.digits}（${g.name}）`).reverse().join(' | ') }}
        </template>
      </p>
    </template>

    <!-- 四舍五入 -->
    <template v-else-if="kind === 'num-approx'">
      <p class="big-num">{{ formatBig(approxV) }}</p>
      <div class="approx-box">
        <div class="approx-dots">
          <span
            v-for="i in 10"
            :key="i"
            class="approx-dot"
            :class="{ filled: i <= Math.round(((approxV % 10000) / 10000) * 10) }"
          />
        </div>
        <p class="approx-label">
          {{ formatBig(approxV) }} 的千位是 <b data-test="wan-digit">{{ wanDigit }}</b>，
          {{ wanDigit >= 5 ? '满 5 向万位进 1' : '不满 5，舍去千位及后面' }} → 约 <b>{{ approxWan }} 万</b>
        </p>
        <div class="op-bar">
          <button type="button" class="op-btn primary" data-test="approx-next" @click="toggleApprox">
            试一试：看千位决定进不进（{{ approxShown ? '已标出千位' : '未标出' }}）
          </button>
        </div>
      </div>
    </template>

    <!-- 身份证 -->
    <template v-else>
      <div class="idcode">
        <div class="id-title">身份证号码（示意）</div>
        <div class="id-cols">
          <span class="id-col">行政区划</span>
          <span class="id-col highlight">出生日期 {{ dateCode }}</span>
          <span class="id-col">顺序码</span>
        </div>
        <div class="id-digits">
          <span v-for="(ch, i) in dateCode" :key="i" class="id-digit">{{ ch }}</span>
        </div>
        <div class="op-bar">
          <button type="button" class="op-btn primary" data-test="id-next" @click="nextId">
            试一试：一段一段读（已读 {{ idStep }} / 3 段）
          </button>
        </div>
        <p class="note">
          第 7~14 位是<b>出生日期码</b>：{{ year }} 年 {{ month }} 月 {{ day }} 日 → {{ dateCode }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.unit-blocks {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 34rem;
}
.unit-block {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ui-primary) 50%, white);
  border: 1px solid var(--ui-primary);
}
.unit-block.dim {
  opacity: 0.28;
}
.op-bar {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.op-btn {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.28rem 0.75rem;
  cursor: pointer;
}
.op-btn.primary {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, transparent);
}
.num-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
.big-num {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.note {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.note b {
  color: var(--ui-primary);
}
.count-line {
  font-size: 0.9rem;
  color: var(--ui-text-muted);
}
.count-arrow {
  background: var(--ui-bg-muted);
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-md);
  padding: 0.3rem 0.7rem;
}
.place-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-x: auto;
  max-width: 100%;
}
.place-head,
.place-row {
  display: flex;
  gap: 2px;
}
.place-unit {
  min-width: 2.4rem;
  text-align: center;
  font-size: 0.72rem;
  color: var(--ui-text-muted);
  background: var(--ui-bg-muted);
  border-radius: 4px;
  padding: 0.2rem 0;
}
.place-cell {
  min-width: 2.4rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-text-toned);
  border: 1px solid var(--ui-border);
  border-radius: 4px;
  padding: 0.25rem 0;
}
.place-cell.active {
  background: color-mix(in srgb, var(--ui-primary) 25%, transparent);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.wan-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.wan-chip {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border: 1px solid var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
  padding: 0.25rem 0.8rem;
  font-size: 0.9rem;
}
.wan-chip.hidden {
  opacity: 0.4;
}
.digit-strip {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}
.digit-cell {
  width: 2.1rem;
  height: 2.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: color-mix(in srgb, var(--ui-primary) 25%, white);
  color: var(--ui-primary);
  font-weight: 800;
  font-size: 1rem;
}
.digit-cell.zero {
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-weight: 400;
}
.approx-box {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.approx-dots {
  display: flex;
  gap: 6px;
}
.approx-dot {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border-accented);
}
.approx-dot.filled {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
}
.approx-label {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
}
.approx-label b {
  color: var(--ui-primary);
}
.idcode {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  width: 100%;
  max-width: 588px;
}
.id-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-muted);
}
.id-cols {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.id-col {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  padding: 0.15rem 0.6rem;
}
.id-col.highlight {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 700;
}
.id-digits {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
}
.id-digit {
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: color-mix(in srgb, var(--ui-primary) 25%, white);
  color: var(--ui-primary);
  font-weight: 800;
  font-size: 0.9rem;
}
</style>
