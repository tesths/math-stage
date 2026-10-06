<script setup lang="ts">
/**
 * 数与运算 Lab：数位与计数单位 / 数的大小比较 / 运算意义一致性 / 二进制的秘密
 */
import { computed } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'
import { toBinary, toFixed2 } from '@/lib/engine/math'
import {
  CARRY_DEMO,
  binaryBits,
  binaryDivisionSteps,
  binaryReading,
  carryBoundary,
  comparePair,
  opExample,
  placeExample,
} from '@/lib/labs/numberSys'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)

/* ---------- 数位与计数单位（与 compute 共用同一份数据） ---------- */
const place = computed(() => placeExample(props.values.sel ?? 0))
const beads = (n: number) => Array.from({ length: Math.min(n, 12) }, (_, i) => i)

/* ---------- 数的大小比较 ---------- */
const pair = computed(() => comparePair(props.values.sel ?? 0))

/* ---------- 运算意义一致性 ---------- */
const op = computed(() => opExample(props.values.sel ?? 0))

/* ---------- 二进制的秘密 ---------- */
const dec = computed(() => Math.round(props.values.dec ?? 5))
const bin = computed(() => toBinary(dec.value))
/** 位权按实际位数算（原来写死 5 位，位数一多就会标错权重） */
const bits = computed(() => binaryBits(dec.value))
const binarySteps = computed(() => binaryDivisionSteps(dec.value))
const reading = computed(() => binaryReading(bin.value))
const boundary = computed(() => carryBoundary(dec.value))
</script>

<template>
  <div class="num-wrap">
    <!-- 数位与计数单位 -->
    <template v-if="kind === 'place-value'">
      <p class="pv-num">{{ place.label }}</p>
      <div class="pv-table">
        <div v-for="r in place.rows" :key="r.unit" class="pv-row">
          <span class="pv-unit">{{ r.unit }}</span>
          <div class="pv-beads">
            <span v-for="i in beads(r.val)" :key="i" class="pv-bead" />
          </div>
          <span class="pv-pow">{{ r.val }} × {{ toFixed2(r.pow) }}</span>
        </div>
      </div>
      <p class="note">{{ place.powText }}</p>
      <div class="carry-strip" aria-label="相邻计数单位的进率">
        <span v-for="d in CARRY_DEMO.slice(0, 4)" :key="d.low" class="carry-chip">
          {{ d.lowCount }} 个{{ d.low }} = 1 个{{ d.high }}
        </span>
      </div>
      <p class="verify-line">
        ✓ {{ place.text }}；最高位是{{ place.rows[0]!.unit }}，最低位是{{ place.rows[place.rows.length - 1]!.unit }}，相邻计数单位的进率都是 10
      </p>
    </template>

    <!-- 数的大小比较 -->
    <template v-else-if="kind === 'compare-unit'">
      <div class="cmp-card">
        <p class="cmp-big">
          {{ pair.a }} <span class="cmp-sym">{{ pair.gt ? '>' : '<' }}</span> {{ pair.b }}
        </p>
        <p class="cmp-how">{{ pair.how }}</p>
        <p class="note">比较数的大小 = 比较相同计数单位的个数</p>
      </div>
    </template>

    <!-- 运算意义一致性 -->
    <template v-else-if="kind === 'op-consistency'">
      <div class="cmp-card">
        <p class="cmp-big">{{ op.expr }} = {{ op.ans }}</p>
        <p class="cmp-how">{{ op.how }}</p>
        <div class="unit-pills">
          <span v-for="i in Math.min(op.n, 12)" :key="i" class="unit-pill">{{ op.unit }}</span>
          <span v-if="op.n > 12" class="unit-pill">…共 {{ op.n }} 个</span>
        </div>
        <p class="note">四则运算都是把相同计数单位的个数进行计算</p>
      </div>
    </template>

    <!-- 二进制的秘密 -->
    <template v-else>
      <p class="pv-num">十进制 {{ dec }} = 二进制（{{ bin }}）₂</p>
      <div class="bin-counter">
        <div v-for="bt in bits" :key="bt.weight" class="bin-bit">
          <span class="bin-weight">{{ bt.weight }}</span>
          <div class="bin-beads">
            <span v-for="i in bt.count" :key="i" class="bin-bead" />
          </div>
          <span class="bin-digit">{{ bt.bit }}</span>
        </div>
      </div>
      <div class="carry-demo">
        <div class="cd-group">
          <span class="cd-label">1 位权</span>
          <div class="cd-beads">
            <span class="cd-bead" />
            <span class="cd-bead" />
          </div>
          <span class="cd-expr">1 + 1 = 2</span>
        </div>
        <span class="cd-arrow">满二进一 →</span>
        <div class="cd-group">
          <span class="cd-label">2 位权</span>
          <div class="cd-beads">
            <span class="cd-bead big" />
          </div>
          <span class="cd-expr">2 个 1 = 1 个 2</span>
        </div>
      </div>
      <div class="bin-steps">
        <p v-for="(s, i) in binarySteps" :key="i" class="bin-step">
          {{ s.expr }} → {{ s.result }}
        </p>
      </div>
      <div class="carry-live" aria-label="满二进一的现场">
        <span class="carry-live-title">满二进一的现场（当前数附近）</span>
        <span class="carry-live-row">
          {{ boundary.from }} = （{{ boundary.fromBin }}）₂
          <b>＋1</b>
          {{ boundary.to }} = （{{ boundary.toBin }}）₂
          <em>位不够就向前进一位</em>
        </span>
      </div>
      <p class="verify-line">
        ✓ 十进制 {{ dec }} = 二进制（{{ bin }}）₂，读作"{{ reading }}"（二进制要逐位读，不能读成几十几）
      </p>
      <p class="note">二进制的位权从右往左是 1、2、4、8…，每一位上的数只能是 0 或 1，满 2 就向前进一位</p>
    </template>
  </div>
</template>

<style scoped>
.num-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: center;
  min-height: 320px;
  justify-content: center;
  width: 100%;
}
.carry-strip,
.carry-live {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  justify-content: center;
  align-items: center;
}
.carry-live {
  flex-direction: column;
  gap: 0.2rem;
}
.carry-live-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ui-text-muted);
}
.carry-live-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: ui-monospace, monospace;
  font-size: 0.95rem;
  color: var(--ui-text-highlighted);
}
.carry-live-row b {
  color: var(--ui-warning, #f59e0b);
}
.carry-live-row em {
  font-style: normal;
  font-size: 0.75rem;
  color: var(--ui-text-muted);
}
.carry-chip {
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  padding: 0.2rem 0.6rem;
  font-size: 0.76rem;
  color: var(--ui-text-toned);
  font-weight: 700;
}
.verify-line {
  border-radius: 8px;
  background: color-mix(in srgb, var(--ui-success, #16a34a) 12%, var(--ui-bg));
  color: var(--ui-success, #16a34a);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  text-align: center;
  max-width: 44rem;
}
.pv-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.pv-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.pv-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.pv-unit {
  width: 4rem;
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: right;
}
.pv-beads {
  display: flex;
  gap: 2px;
  min-width: 8.5rem;
}
.pv-bead {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
  border: 1px solid var(--ui-primary);
}
.pv-pow {
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.note {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  text-align: center;
}
.cmp-card {
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 1rem 1.4rem;
  text-align: center;
  min-width: 16rem;
  max-width: 31rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}
.cmp-big {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.cmp-sym {
  color: var(--ui-primary);
}
.cmp-how {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
}
.unit-pills {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
}
.unit-pill {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border: 1px solid var(--ui-primary);
  color: var(--ui-primary);
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
}
.bin-counter {
  display: flex;
  gap: 0.8rem;
}
.bin-bit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  padding: 0.5rem 0.6rem;
  background: var(--ui-bg-muted);
}
.bin-weight {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.bin-beads {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 6rem;
  justify-content: flex-start;
}
.bin-bead {
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.bin-digit {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.carry-demo {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
  border: 1px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.6rem 1rem;
}
.cd-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}
.cd-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-muted);
}
.cd-beads {
  display: flex;
  gap: 3px;
}
.cd-bead {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: var(--ui-primary);
}
.cd-bead.big {
  width: 1.3rem;
  height: 1.3rem;
  background: var(--ui-warning, #f59e0b);
}
.cd-expr {
  font-size: 0.8rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
.cd-arrow {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-primary);
}
.bin-steps {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.85rem;
  color: var(--ui-text-toned);
  font-family: ui-monospace, monospace;
}
</style>
