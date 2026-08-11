<script setup lang="ts">
/**
 * 除法 Lab：口算除法（整十整百）、笔算除法（竖式）、首位不够除、有余数、商中间/末尾有0
 */
import { computed, ref } from 'vue'
import type { LabDef, ParamValues } from '@data/schema/lab'

const props = defineProps<{ lab: LabDef; values: ParamValues }>()

const kind = computed(() => props.lab.kind)
const id = computed(() => props.lab.id)

/** 按题面组装被除数：h/t/o（三位）→ tens/ones（两位）→ base（口算）→ total（有余数） */
const value = computed(() => {
  const v = props.values
  if (v.h !== undefined) return Math.round(v.h) * 100 + Math.round(v.t ?? 0) * 10 + Math.round(v.o ?? 0)
  if (v.tens !== undefined) return Math.round(v.tens) * 10 + Math.round(v.ones ?? 0)
  if (v.base !== undefined) return Math.round(v.base)
  if (v.total !== undefined) return Math.round(v.total)
  return Math.round(v.value ?? 648)
})
const divisor = computed(() => Math.round(props.values.div ?? props.values.divisor ?? 6))
const group = computed(() => Math.round(props.values.div ?? props.values.group ?? 6))

const quotient = computed(() => Math.floor(value.value / divisor.value))
const remainder = computed(() => value.value % divisor.value)

/** 口算：整十整百分组 */
const tens = computed(() => Math.floor(value.value / 10))
const groups = computed(() => {
  const per = Math.max(1, Math.floor(tens.value / group.value))
  const arr: number[] = []
  let left = tens.value
  while (left > 0) {
    const take = Math.min(per, left)
    arr.push(take)
    left -= take
  }
  return arr
})

/** 竖式步骤 */
const steps = computed(() => {
  const digits = String(value.value).split('').map(Number)
  let rem = 0
  let first = false
  const out: { col: number; qd: number; sub: number; rem: number; started: boolean }[] = []
  for (let i = 0; i < digits.length; i++) {
    rem = rem * 10 + digits[i]!
    const qd = Math.floor(rem / divisor.value)
    if (qd > 0 || first) {
      first = true
      const sub = qd * divisor.value
      out.push({ col: i, qd, sub, rem: rem - sub, started: true })
      rem = rem - sub
    } else {
      out.push({ col: i, qd, sub: 0, rem, started: false })
    }
  }
  return out
})

const isOral = computed(() => kind.value === 'div-oral')
const isRemainder = computed(() => kind.value === 'remainder')

/* ---------- 竖式逐步演示 ---------- */
const started = computed(() => steps.value.filter((s) => s.started))
/** 当前演示轮次（0 起，默认最后一轮） */
const cur = ref(Math.max(started.value.length - 1, 0))
const setCur = (i: number) => {
  cur.value = Math.min(Math.max(i, 0), started.value.length - 1)
}
const roundNotes = computed(() => {
  return started.value.map((s, i) => {
    const prev = i === 0 ? 0 : started.value[i - 1]!.rem
    const curVal = prev * 10 + Number(String(value.value).split('')[s.col])
    return { idx: i, col: s.col, qd: s.qd, sub: s.sub, rem: s.rem, curVal }
  })
})
const activeRound = computed(() => roundNotes.value[cur.value])
</script>

<template>
  <div class="div-wrap">
    <!-- 口算除法：整十整百分组 -->
    <template v-if="isOral">
      <div class="piles">
        <div v-for="(g, i) in groups" :key="i" class="pile">
          <div class="rod-block">
            <span v-for="j in Math.min(g, 10)" :key="j" class="ten-rod" />
          </div>
          <p class="pile-val">{{ g }} 个十</p>
        </div>
      </div>
      <div class="formula-row">
        <span class="chip">{{ value }} ÷ {{ group }} =</span>
        <span class="chip op">?</span>
      </div>
      <p class="tip">
        {{ value }} 是 {{ tens }} 个十，把 {{ tens }} 个十平均分成 {{ group }} 份，每份 {{ Math.round(tens / group) }} 个十，就是
        <b>{{ Math.round(tens / group) * 10 }}</b>
      </p>
    </template>

    <!-- 竖式：笔算 / 首位不够除 / 商有0 / 有余数 -->
    <template v-else>
      <svg viewBox="0 0 340 220" class="div-svg">
        <!-- 商位 -->
        <template v-for="(s, si) in steps" :key="'q' + si">
          <text
            :x="28 + s.col * 30"
            :y="26"
            text-anchor="middle"
            class="qd-digit"
            :class="{ active: s.started && started.findIndex((x) => x === s) === cur, zero: !s.started }"
          >{{ s.started ? s.qd : '' }}</text>
          <rect
            v-if="!s.started"
            :x="28 + s.col * 30 - 10"
            :y="12"
            width="20"
            height="26"
            rx="3"
            class="zero-box"
          />
        </template>

        <text x="28" y="30" class="divisor">{{ divisor }}</text>
        <text x="52" y="30" class="div-sym">)⎯</text>
        <text
          v-for="(d, i) in String(value).split('')"
          :key="'d' + i"
          :x="72 + i * 30"
          :y="30"
          text-anchor="middle"
          class="dd-digit"
          :class="{ colactive: roundNotes[cur] && roundNotes[cur]!.col === i }"
        >{{ d }}</text>

        <!-- 逐轮：当前轮高亮，连接线 -->
        <template v-for="(s, si) in started" :key="'r' + si">
          <g :class="si === cur ? 'round-active' : 'round-dim'">
            <text
              v-for="(d, di) in String(s.sub).padStart(s.col + 1, '0').split('')"
              :key="'s' + di"
              :x="72 + (s.col - String(s.sub).length + 1 + di) * 30"
              :y="58 + si * 38"
              text-anchor="middle"
              class="sub-digit"
            >{{ d === '0' ? '' : d }}</text>
            <line
              :x1="72 + (s.col - String(s.sub).length + 1) * 30 - 6"
              :y1="66 + si * 38"
              :x2="72 + s.col * 30 + 10"
              :y2="66 + si * 38"
              class="sub-line"
            />
            <text
              v-for="(d, di) in String(s.rem).split('')"
              :key="'rm' + di"
              :x="72 + (s.col - String(s.rem).length + 1 + di) * 30"
              :y="82 + si * 38"
              text-anchor="middle"
              class="rem-digit"
            >{{ d }}</text>
          </g>
          <!-- 连接线：商位 → 乘积 → 余数 -->
          <g v-if="si === cur" class="connector">
            <line :x1="28 + s.col * 30" :y1="26" :x2="72 + s.col * 30" :y2="56" class="conn-line" />
            <line :x1="72 + s.col * 30" :y1="66" :x2="72 + s.col * 30" :y2="84" class="conn-line" />
          </g>
        </template>
      </svg>

      <div class="step-bar">
        <button
          v-for="(n, i) in roundNotes"
          :key="i"
          type="button"
          class="step-chip"
          :class="{ on: i === cur }"
          @click="setCur(i)"
        >
          {{ i + 1 }}
        </button>
      </div>
      <p v-if="activeRound" class="round-note">
        第 {{ cur + 1 }} 轮：{{ activeRound.curVal }} ÷ {{ divisor }} = {{ activeRound.qd }}……{{ activeRound.rem }}（商写 {{ activeRound.qd }}，乘积 {{ activeRound.sub }}）
      </p>

      <div class="formula-row">
        <span class="chip">{{ value }} ÷ {{ divisor }} =</span>
        <span class="chip op">{{ quotient }}</span>
        <span v-if="isRemainder" class="chip op2">…… {{ remainder }}</span>
      </div>

      <p class="tip">
        <template v-if="isRemainder">
          除到被除数的哪一位，商就写在哪一位上面。余数<b>要比除数小</b>：{{ value }} ÷ {{ divisor }} = {{ quotient }}……{{ remainder }}
        </template>
        <template v-else-if="kind === 'div-zero'">
          哪一位上不够商 1，就在那一位上写 <b>0</b> 占位
        </template>
        <template v-else>
          从被除数的最高位除起，每次用除数试除被除数前几位，除到哪一位商就写在哪一位上面
        </template>
      </p>
    </template>
  </div>
</template>

<style scoped>
.div-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  width: 100%;
  padding: 0.5rem;
}
.piles {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pile {
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-lg);
  background: var(--ui-bg-muted);
  padding: 0.5rem 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.rod-block {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
}
.ten-rod {
  width: 8px;
  height: 18px;
  border-radius: 1px;
  background: color-mix(in srgb, var(--ui-primary) 60%, white);
}
.pile-val {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.formula-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  color: var(--ui-text-toned);
}
.chip.op {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: 800;
}
.chip.op2 {
  border-color: var(--ui-warning, #f59e0b);
  color: var(--ui-warning, #f59e0b);
  font-weight: 800;
}
.tip {
  font-size: 0.9rem;
  color: var(--ui-text-toned);
  text-align: center;
  max-width: 36rem;
}
.tip b {
  color: var(--ui-primary);
}
.div-svg {
  width: 100%;
  max-width: 31rem;
}
.qd-digit {
  fill: var(--ui-primary);
  font-size: 17px;
  font-weight: 800;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
  transition: opacity 0.2s ease;
}
.qd-digit.zero {
  fill: var(--ui-text-muted);
}
.qd-digit.active {
  fill: var(--ui-primary);
  font-size: 19px;
}
.zero-box {
  fill: none;
  stroke: var(--ui-text-muted);
  stroke-dasharray: 3 3;
}
.divisor {
  fill: var(--ui-text-highlighted);
  font-size: 16px;
  font-weight: 800;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
}
.div-sym {
  fill: var(--ui-text-muted);
  font-size: 15px;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
}
.dd-digit {
  fill: var(--ui-text-highlighted);
  font-size: 16px;
  font-weight: 700;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
}
.dd-digit.colactive {
  fill: var(--ui-primary);
  font-size: 18px;
}
.sub-digit {
  fill: var(--ui-text-muted);
  font-size: 14px;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
}
.rem-digit {
  fill: var(--ui-text-toned);
  font-size: 14px;
  font-family: 'SFMono-Regular', ui-monospace, monospace;
}
.sub-line {
  stroke: var(--ui-border-accented);
  stroke-width: 1.4;
}
.round-active .sub-digit {
  fill: var(--ui-primary);
  font-weight: 800;
}
.round-active .rem-digit {
  fill: var(--ui-primary);
  font-weight: 800;
}
.round-dim {
  opacity: 0.35;
}
.conn-line {
  stroke: var(--ui-warning, #f59e0b);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
}
.step-bar {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
}
.step-chip {
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 9999px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
  color: var(--ui-text-muted);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}
.step-chip:hover {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.step-chip.on {
  background: var(--ui-primary);
  border-color: var(--ui-primary);
  color: white;
}
.round-note {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-primary);
  text-align: center;
}
</style>
