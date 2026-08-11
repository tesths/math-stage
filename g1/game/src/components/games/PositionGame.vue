<template>
  <div class="position-game">
    <div class="pos-stage">
      <template v-if="!isOrdinal && axis">
        <p class="axis-hint">
          以 <b>{{ target }}</b> 为参照
          <template v-if="position">，判断它{{ position === '上' ? '上面' : position === '下' ? '下面' : position === '左' ? '左边' : position === '右' ? '右边' : position === '前' ? '前面' : '后面' }}是谁</template>
        </p>
        <div
          class="pos-scene"
          :class="axisClass"
        >
          <template v-for="(item, i) in items" :key="item">
            <div
              class="pos-card"
              :class="{
                target: item === target,
                picked: done && item === correctItem,
                muted: otherItems.includes(item) && !done,
              }"
              :data-item="item"
              role="button"
              tabindex="0"
              @click="onItem(item)"
              @keydown.enter="onItem(item)"
            >
              <span v-if="item === target" class="target-badge">参照</span>
              <span class="pos-card-name">{{ item }}</span>
            </div>
            <div v-if="i < items.length - 1" class="axis-gap">
              <div
                v-if="isRelevantGap(i)"
                class="axis-arrow"
                :class="arrowClass"
              >
                <span class="axis-word">{{ position }}</span>
              </div>
            </div>
          </template>
        </div>
        <p v-if="feedback === 'wrong' && selectedItem" class="wrong-note">
          你选的是「{{ selectedItem }}」，它在{{ target }}的{{ directionPhrase(selectedItem) }}
        </p>
      </template>

      <template v-else>
        <div v-if="isOrdinal" class="ordinal-row">
          <div class="ordinal-track">
            <span class="ordinal-start">从{{ ordinalFrom }}数起 →</span>
            <div class="ordinal-items">
              <div
                v-for="(item, i) in items"
                :key="i"
                class="ordinal-item"
                :class="{
                  target: item === target,
                  picked: done && item === correctItem,
                  dim: !done && item !== target,
                }"
                :data-item="item"
                @click="onItem(item)"
              >
                <span class="ordinal-rank">{{ i + 1 }}</span>
                <span class="ordinal-emoji">{{ item }}</span>
              </div>
            </div>
          </div>
          <p class="ordinal-hint">
            数到第 <b>{{ targetIdx + 1 }}</b> 个就是「{{ target }}」——这里数的是<b>第几个</b>（位置），不是几个
          </p>
        </div>
        <div v-else class="pos-items">
          <span
            v-for="(item, i) in items"
            :key="i"
            class="pos-item"
            :class="{ picked: done && item === correctItem }"
            :data-item="item"
            @click="onItem(item)"
          >{{ item }}</span>
        </div>
        <AnswerPad
          v-if="isOrdinal"
          :options="ordinalOptions"
          :selected="selected"
          :disabled="done"
          :correct-value="answer"
          :show-result="done"
          @select="onSelect"
        />
      </template>
    </div>
    <FeedbackOverlay :state="feedback" :correct-answer="answer" :answer-text="answerText" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const isOrdinal = computed(() => props.question.type === 'ordinal')
const cfg = computed(() => props.question.config as { items: string[]; target?: string; position?: '上' | '下' | '左' | '右' | '前' | '后'; answer: number | string })
const items = computed(() => (cfg.value as { items: string[] }).items)
const answer = computed(() => (cfg.value as { answer: number | string }).answer)
const target = computed(() => (cfg.value as { target?: string }).target ?? '')
const position = computed(() => (cfg.value as { position?: '上' | '下' | '左' | '右' | '前' | '后' }).position ?? null)
const correctItem = computed(() => (cfg.value as { target?: string }).target ?? '')

/** 方位题排布：上/下竖向、左/右横向、前/后纵深队列 */
const axis = computed<'vertical' | 'horizontal' | 'depth' | null>(() => {
  if (isOrdinal.value) return null
  if (position.value === '上' || position.value === '下') return 'vertical'
  if (position.value === '左' || position.value === '右') return 'horizontal'
  if (position.value === '前' || position.value === '后') return 'depth'
  return null
})
const axisClass = computed(() => (axis.value === 'vertical' ? 'axis-vertical' : axis.value === 'horizontal' ? 'axis-horizontal' : 'axis-depth'))

const answerIdx = computed(() => items.value.indexOf(String(answer.value)))
const targetIdx = computed(() => items.value.indexOf(target.value))
const otherItems = computed(() => items.value.filter((it) => it !== target.value && it !== String(answer.value)))

/** 该间隙是否位于参照物与答案对象之间（相邻才画箭头） */
function isRelevantGap(i: number): boolean {
  return (items.value[i] === target.value && items.value[i + 1] === String(answer.value)) ||
    (items.value[i] === String(answer.value) && items.value[i + 1] === target.value)
}
const answerBeforeTarget = computed(() => answerIdx.value < targetIdx.value)
const arrowClass = computed(() => {
  if (axis.value === 'vertical') return answerBeforeTarget.value ? 'up' : 'down'
  if (axis.value === 'horizontal') return answerBeforeTarget.value ? 'left' : 'right'
  return answerBeforeTarget.value ? 'back' : 'front'
})

function directionPhrase(sel: string): string {
  const idx = items.value.indexOf(sel)
  if (idx < 0) return '？'
  if (idx < targetIdx.value) {
    return axis.value === 'vertical' ? '上面' : axis.value === 'depth' ? '前面' : '左边'
  }
  if (idx > targetIdx.value) {
    return axis.value === 'vertical' ? '下面' : axis.value === 'depth' ? '后面' : '右边'
  }
  return '同一位'
}

const ordinalOptions = computed(() => items.value.map((_, i) => i + 1))
const answerText = computed(() => (isOrdinal.value ? undefined : String(answer.value)))

/** 序数起点说明：默认从左往右，题面含"从前往后"时从前 */
const ordinalFrom = computed(() =>
  /从[前]{1,2}往/.test(props.question.prompt) ? '前' : '左',
)

const selected = ref<number | string | null>(null)
const selectedItem = ref<string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

function finish(value: number | string) {
  if (done.value) return
  selected.value = value
  selectedItem.value = typeof value === 'string' ? value : null
  const correct = isAnswerCorrect(props.question, value)
  emit('answered', { correct, attempts: attempts.value })
  if (correct) {
    done.value = true
    feedback.value = 'correct'
  } else {
    attempts.value += 1
    feedback.value = 'wrong'
  }
}

function onItem(item: string) {
  finish(item)
}
function onSelect(value: number | string) {
  finish(value)
}
</script>

<style scoped>
.position-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  width: 100%;
}
.pos-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.axis-hint {
  font-size: 1rem;
  color: var(--ui-text-toned);
  margin: 0;
}
.axis-hint b {
  color: var(--ui-primary);
}
.pos-scene {
  display: flex;
  align-items: center;
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-2xl);
  padding: 1.6rem 2.2rem;
  gap: 1.4rem;
}
.axis-vertical {
  flex-direction: column;
}
.pos-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 4.8rem;
  padding: 0.9rem 1.2rem;
  border-radius: 0.9rem;
  background: var(--ui-bg);
  border: 2px solid var(--ui-border-accented);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}
.pos-card:not(.muted):hover {
  transform: translateY(-3px);
  border-color: var(--ui-primary);
}
.pos-card.target {
  border-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg));
}
.pos-card.picked {
  border-color: var(--ui-color-success-500);
  background: var(--ui-color-success-100);
}
.pos-card.muted {
  opacity: 0.55;
}
.target-badge {
  position: absolute;
  top: -0.55rem;
  left: -0.55rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: white;
  background: var(--ui-primary);
  border-radius: 9999px;
  padding: 0.1rem 0.45rem;
}
.pos-card-name {
  line-height: 1;
}
.axis-gap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.6rem;
  min-height: 1.6rem;
}
.axis-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}
.axis-arrow.up::before {
  content: '▲';
  color: var(--ui-warning, #f59e0b);
  font-size: 0.9rem;
}
.axis-arrow.down::before {
  content: '▼';
  color: var(--ui-warning, #f59e0b);
  font-size: 0.9rem;
}
.axis-arrow.left::before {
  content: '◀';
  color: var(--ui-warning, #f59e0b);
  font-size: 0.9rem;
}
.axis-arrow.right::before {
  content: '▶';
  color: var(--ui-warning, #f59e0b);
  font-size: 0.9rem;
}
.axis-arrow.front::before {
  content: '◀';
  color: var(--ui-info, #0ea5e9);
  font-size: 0.9rem;
}
.axis-arrow.back::before {
  content: '▶';
  color: var(--ui-info, #0ea5e9);
  font-size: 0.9rem;
}
.axis-word {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ui-warning, #f59e0b);
}
.wrong-note {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  margin: 0;
}
.pos-items {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-2xl);
  padding: 1.4rem 2rem;
}
.ordinal-track {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--ui-bg-muted);
  border: 2px dashed var(--ui-border-accented);
  border-radius: var(--ui-radius-2xl);
  padding: 1.2rem 1.6rem;
}
.ordinal-start {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--ui-warning, #f59e0b);
  white-space: nowrap;
}
.ordinal-items {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}
.ordinal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  cursor: pointer;
  border-radius: 0.8rem;
  padding: 0.4rem 0.5rem;
  transition: transform 0.15s, background 0.15s, outline-color 0.15s;
  outline: 3px solid transparent;
  user-select: none;
}
.ordinal-item:hover {
  transform: translateY(-3px);
  background: var(--ui-color-primary-100);
}
.ordinal-item.target {
  outline-color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
}
.ordinal-item.picked {
  outline-color: var(--ui-color-success-500);
  background: var(--ui-color-success-100);
}
.ordinal-item.dim {
  opacity: 0.7;
}
.ordinal-rank {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ui-text-muted);
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  width: 1.3rem;
  height: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ordinal-item.target .ordinal-rank {
  background: var(--ui-primary);
  color: white;
  border-color: var(--ui-primary);
}
.ordinal-emoji {
  font-size: 2.4rem;
  line-height: 1;
}
.ordinal-hint {
  font-size: 0.95rem;
  color: var(--ui-text-toned);
  margin: 0;
  text-align: center;
}
.ordinal-hint b {
  color: var(--ui-primary);
}
.pos-item {
  font-size: 3rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 0.8rem;
  transition: transform 0.15s, background 0.15s, color 0.15s;
  user-select: none;
}
.pos-item:hover {
  transform: translateY(-4px) scale(1.1);
  background: var(--ui-color-primary-100);
}
.pos-item.picked {
  background: var(--ui-color-success-100);
  color: var(--ui-color-success-700);
}
</style>