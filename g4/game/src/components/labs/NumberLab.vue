<script setup lang="ts">
/**
 * 多位数的认识 Lab：计数单位 / 数位顺序表 / 多位数组成 / 四舍五入 / 数字编码
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { COUNT_UNITS, digitsOf, formatBig } from '@/lib/engine/math'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 计数单位 ---------- */
const v = computed(() => Math.round(props.values.v ?? 10000))
const vUnits = computed(() => {
  if (v.value >= 1e8) return { unit: '亿', k: v.value / 1e8, prev: '10 个千万是一亿' }
  if (v.value >= 1e7) return { unit: '千万', k: v.value / 1e7, prev: '10 个百万是一千万' }
  if (v.value >= 1e6) return { unit: '百万', k: v.value / 1e6, prev: '10 个十万是一百万' }
  if (v.value >= 1e5) return { unit: '十万', k: v.value / 1e5, prev: '10 个一万是十万' }
  if (v.value >= 1e4) return { unit: '万', k: v.value / 1e4, prev: '10 个一千是一万' }
  if (v.value >= 1e3) return { unit: '千', k: v.value / 1e3, prev: '10 个一百是一千' }
  return { unit: '百', k: v.value / 100, prev: '10 个十是一百' }
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
const wanDigit = computed(() => digitsOf(approxV.value)[3] ?? 0)
const approxWan = computed(() => Math.round(approxV.value / 10000))

/* ---------- 身份证 ---------- */
const year = computed(() => Math.round(props.values.year ?? 2016))
const month = computed(() => Math.round(props.values.month ?? 2))
const day = computed(() => Math.round(props.values.day ?? 18))
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
      <p class="note">
        {{ formatBig(v) }} 里有 <b>{{ vUnits.k }}</b> 个{{ vUnits.unit }}
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
      <p class="note">
        由 {{ wan }} 个万{{ yi > 0 ? `和 ${yi} 个亿` : '' }}组成，写作 {{ formatBig(value) }}
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
          {{ formatBig(approxV) }} 的千位是 <b>{{ wanDigit }}</b>，
          {{ wanDigit >= 5 ? '向万位进 1' : '舍去千位及后面' }} → 约 <b>{{ approxWan }} 万</b>
        </p>
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
        <p class="note">
          第 7~14 位是<b>出生日期码</b>：{{ year }} 年 {{ month }} 月 {{ day }} 日 → {{ dateCode }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
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
