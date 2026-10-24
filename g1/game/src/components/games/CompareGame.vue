<template>
  <div class="compare-game">
    <div class="cmp-stage">
      <div v-if="pairCols.length > 0" class="pair-grid" :style="{ gridTemplateColumns: `repeat(${pairCols.length}, ${pairColW})` }">
        <div class="pair-legend">
          <span class="legend-chip top">上排：{{ leftLabel }} {{ a }} 个</span>
          <span class="legend-chip bottom">下排：{{ rightLabel }} {{ b }} 个</span>
        </div>
        <div v-for="(col, i) in pairCols" :key="i" class="pair-col" :class="{ extra: col.extra, compact: isCompact }">
          <div v-if="col.top" class="pair-cell" :class="['top', { 'cell-empty': !col.paired }]">
            <span class="pair-obj">{{ col.top }}</span>
            <span v-if="col.extraTop && i + 1 <= shownPairs" class="extra-badge">多</span>
          </div>
          <div v-else class="pair-cell cell-placeholder"></div>
          <div class="pair-line" :class="{ on: col.paired && i + 1 <= shownPairs }"></div>
          <div v-if="col.bottom" class="pair-cell" :class="['bottom', { 'cell-empty': !col.paired }]">
            <span class="pair-obj">{{ col.bottom }}</span>
            <span v-if="col.extraBottom && i + 1 <= shownPairs" class="extra-badge">多</span>
          </div>
          <div v-else class="pair-cell cell-placeholder"></div>
        </div>
      </div>

      <div v-else class="cmp-sides">
        <div class="cmp-side">
          <div class="side-items">
            <span v-for="(c, i) in leftItems" :key="i" class="side-item">{{ c }}</span>
          </div>
        </div>
        <div class="cmp-symbols">
          <button
            v-for="sym in symbols"
            :key="sym"
            class="sym-btn"
            :class="{ selected: selected === sym }"
            :data-sym="sym"
            :disabled="done"
            @click="onSelect(sym)"
          >{{ sym }}</button>
        </div>
        <div class="cmp-side">
          <div class="side-items">
            <span v-for="(c, i) in rightItems" :key="i" class="side-item">{{ c }}</span>
          </div>
        </div>
      </div>

      <p v-if="pairCols.length > 0" class="pair-note" data-test="pair-note">
        <template v-if="counting">配到第 {{ shownPairs }} 对：{{ shownPairs < maxCount ? '还没配完，先别急着下结论' : extraCount > 0 ? `配完多出 ${extraCount} 个，所以 ${a} ${answer} ${b}` : `配完正好一样多，所以 ${a} = ${b}` }}</template>
        <template v-else-if="done">一一配对后：{{ a }} {{ answer }} {{ b }}</template>
        <template v-else-if="extraCount > 0">一一配对，红点表示多出的部分</template>
        <template v-else>一一配对，两组同样多</template>
      </p>

      <div v-if="pairCols.length > 0" class="pair-bar">
        <button type="button" class="pair-btn" data-test="pair-next" @click="nextPair">配对</button>
        <span class="pair-hint" data-test="pair-hint">
          {{ counting ? `一个对着一个，已经配了 ${shownPairs} 对` : '点「配对」，一个对着一个地配起来' }}
        </span>
      </div>

      <div v-if="pairCols.length > 0" class="cmp-symbols row">
        <button
          v-for="sym in symbols"
          :key="sym"
          class="sym-btn"
          :class="{ selected: selected === sym, correct: done && sym === answer }"
          :data-sym="sym"
          :disabled="done"
          @click="onSelect(sym)"
        >{{ sym }}</button>
      </div>
    </div>
    <FeedbackOverlay :state="feedback" :correct-answer="answer" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { visibleUnits } from '@/lib/engine/count'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config as {
  a: number
  b: number
  emoji?: string
  leftEmoji?: string
  rightEmoji?: string
  leftLabel?: string
  rightLabel?: string
  answer: '>' | '<' | '='
})
const a = computed(() => cfg.value.a)
const b = computed(() => cfg.value.b)
const answer = computed(() => cfg.value.answer as string)
const leftGlyph = computed(() => cfg.value.leftEmoji ?? cfg.value.emoji ?? '●')
const rightGlyph = computed(() => cfg.value.rightEmoji ?? cfg.value.emoji ?? '●')
const leftLabel = computed(() => cfg.value.leftLabel ?? '第一组')
const rightLabel = computed(() => cfg.value.rightLabel ?? '第二组')
const leftItems = computed(() => visibleUnits(leftGlyph.value.repeat(cfg.value.a)))
const rightItems = computed(() => visibleUnits(rightGlyph.value.repeat(cfg.value.b)))

/** 配对列：上下两行逐列对齐，一对对象画连接线；多出的列标红。上限 16，超过 12 用小格 */
const pairCols = computed(() => {
  const max = Math.max(a.value, b.value)
  if (max > 16) return []
  const cols: { top: string | null; bottom: string | null; paired: boolean; extra: boolean; extraTop: boolean; extraBottom: boolean }[] = []
  for (let i = 0; i < max; i++) {
    const hasTop = i < a.value
    const hasBottom = i < b.value
    cols.push({
      top: hasTop ? leftItems.value[i] ?? null : null,
      bottom: hasBottom ? rightItems.value[i] ?? null : null,
      paired: hasTop && hasBottom,
      extra: hasTop !== hasBottom,
      extraTop: hasTop && !hasBottom,
      extraBottom: hasBottom && !hasTop,
    })
  }
  return cols
})

const isCompact = computed(() => Math.max(a.value, b.value) > 7)
const pairColW = computed(() => (isCompact.value ? '1.9rem' : '2.7rem'))

const extraCount = computed(() => Math.abs(a.value - b.value))
const maxCount = computed(() => Math.max(a.value, b.value))

/* ---------- 过程态：一一配对，一对一对地配（原来 8 条连线一次全亮，等于没有过程） ---------- */
const pairStep = ref(0)
const counting = computed(() => pairStep.value > 0)
const shownPairs = computed(() => (counting.value ? pairStep.value : maxCount.value))

function nextPair() {
  pairStep.value = pairStep.value >= maxCount.value ? 0 : pairStep.value + 1
}
const symbols: ('>' | '<' | '=')[] = ['>', '<', '=']

const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const selected = ref<string | null>(null)

function onSelect(sym: '>' | '<' | '=') {
  if (done.value) return
  selected.value = sym
  const correct = isAnswerCorrect(props.question, sym)
  emit('answered', { correct, attempts: attempts.value })
  if (correct) {
    done.value = true
    feedback.value = 'correct'
  } else {
    attempts.value += 1
    feedback.value = 'wrong'
  }
}
</script>

<style scoped>
.compare-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.cmp-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.pair-grid {
  display: grid;
  gap: 0.45rem;
  justify-content: center;
  background: var(--ui-bg-muted);
  border: 2px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 1rem 1.2rem;
}
.pair-legend {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.legend-chip {
  border-radius: 9999px;
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-toned);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.35rem 0.6rem;
}
.legend-chip.top {
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
}
.legend-chip.bottom {
  color: var(--ui-color-warning-700, var(--ui-text-highlighted));
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 12%, var(--ui-bg));
}
.pair-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
}
.pair-col.compact .pair-cell {
  width: 1.9rem;
  height: 1.9rem;
  font-size: 1rem;
}
.pair-col.compact .extra-badge {
  min-width: 0.95rem;
  height: 0.95rem;
  font-size: 0.6rem;
  top: -0.28rem;
  right: -0.28rem;
}
.pair-cell {
  width: 2.7rem;
  height: 2.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.7rem;
  font-size: 1.6rem;
  background: var(--ui-bg);
  border: 1.5px solid var(--ui-border-accented);
  position: relative;
}
.pair-cell.top {
  background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
}
.pair-cell.bottom {
  background: color-mix(in srgb, var(--ui-secondary, var(--ui-info)) 10%, var(--ui-bg));
}
.pair-cell.cell-placeholder {
  background: transparent;
  border-color: transparent;
}
.pair-cell.cell-empty {
  border-style: dashed;
  border-color: var(--ui-warning, #f59e0b);
  background: color-mix(in srgb, var(--ui-warning, #f59e0b) 14%, var(--ui-bg));
}
.pair-line {
  width: 0.75rem;
  height: 0.14rem;
  border-radius: 9999px;
  background: var(--ui-border-accented);
  opacity: 0;
}
.pair-line.on {
  opacity: 1;
}
.extra-badge {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  min-width: 1.15rem;
  height: 1.15rem;
  border-radius: 9999px;
  background: var(--ui-warning, #f59e0b);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.2rem;
}
.pair-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pair-btn {
  border: 1px solid var(--ui-primary);
  background: var(--ui-bg);
  color: var(--ui-primary);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 0.22rem 0.9rem;
  cursor: pointer;
}
.pair-hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
}
.pair-note {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  margin: 0;
}
.cmp-symbols {
  display: flex;
  gap: 0.8rem;
}
.sym-btn {
  width: 3.6rem;
  height: 3.2rem;
  font-size: 1.9rem;
  border-radius: var(--ui-radius-lg);
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  cursor: pointer;
  color: var(--ui-text-highlighted);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.sym-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.sym-btn.selected {
  border-color: var(--ui-primary);
  background: var(--ui-color-primary-100);
  color: var(--ui-primary);
  font-weight: bold;
}
.sym-btn.correct {
  border-color: var(--ui-color-success-500);
  background: var(--ui-color-success-100);
  color: var(--ui-color-success-600);
}
.sym-btn:disabled {
  cursor: default;
}
.cmp-sides {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}
.side-items {
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 0.8rem 1.2rem;
  min-height: 4rem;
  max-width: 18rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.side-item {
  font-size: 2.4rem;
}
</style>
