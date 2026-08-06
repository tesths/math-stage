<template>
  <div class="count-game">
    <div class="count-stage">
      <template v-if="isCount">
        <div v-if="count === 0" class="empty-note">一个也没有，用0表示</div>
        <div v-else class="count-items">
          <span v-for="(c, i) in units" :key="i" class="count-item">{{ c }}</span>
        </div>
      </template>
      <template v-else-if="isWrite">
        <p class="write-hint">{{ hint }}</p>
        <div class="counter" data-test="counter">
          <div class="counter-frame">
            <div class="counter-col" aria-label="十位">
              <div class="counter-beads">
                <span v-for="i in tens" :key="i" class="counter-bead">
                  <span class="counter-hole"></span>
                </span>
              </div>
              <span class="counter-label">十位</span>
            </div>
            <div class="counter-rail"></div>
            <div class="counter-col" aria-label="个位">
              <div class="counter-beads">
                <span v-for="i in ones" :key="i" class="counter-bead">
                  <span class="counter-hole"></span>
                </span>
              </div>
              <span class="counter-label">个位</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    <AnswerPad
      :options="options"
      :selected="selected"
      :disabled="done"
      :correct-value="answer"
      :show-result="done"
      @select="onSelect"
    />
    <FeedbackOverlay :state="feedback" :correct-answer="answer" :answer-text="answerText" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { visibleUnits, countUnits, tensOf, onesOf } from '@/lib/engine/count'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config)
const isCount = computed(() => props.question.type === 'count')
const isWrite = computed(() => props.question.type === 'write')

const emojiStr = computed(() => (cfg.value as { emoji?: string }).emoji ?? '')
const units = computed(() => (isCount.value ? visibleUnits(emojiStr.value) : []))
const count = computed(() => (isCount.value ? countUnits(emojiStr.value) : 0))
const answer = computed(() => (cfg.value as { answer: number }).answer)
const options = computed(() => (cfg.value as { options: number[] }).options)
const hint = computed(() => (cfg.value as { hint: string }).hint)
const tens = computed(() => isWrite.value ? tensOf((cfg.value as { number: number }).number) : 0)
const ones = computed(() => isWrite.value ? onesOf((cfg.value as { number: number }).number) : 0)

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

const answerText = computed(() => (count.value === 0 ? '0' : undefined))

function onSelect(value: number | string) {
  if (done.value) return
  selected.value = value
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
</script>

<style scoped>
.count-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.count-stage {
  min-height: 9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.count-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  max-width: 42rem;
  justify-content: center;
}
.count-item {
  font-size: 3rem;
  animation: drop-in 0.3s ease-out;
}
.empty-note {
  font-size: 1.6rem;
  color: var(--ui-text-muted);
}
.write-hint {
  font-size: 1.25rem;
  color: var(--ui-text-toned);
}
.counter {
  display: flex;
  justify-content: center;
}
.counter-frame {
  display: flex;
  align-items: stretch;
  gap: 1.6rem;
  background: var(--ui-bg-muted);
  border: 2px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  padding: 0.9rem 1.8rem 0.6rem;
  position: relative;
}
.counter-frame::before,
.counter-frame::after {
  content: '';
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  width: 0.35rem;
  border-radius: 0.2rem;
  background: var(--ui-color-amber-500);
}
.counter-frame::before {
  left: 0.7rem;
}
.counter-frame::after {
  right: 0.7rem;
}
.counter-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  z-index: 1;
}
.counter-beads {
  min-height: 5.4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.35rem;
  width: 2.2rem;
  background: linear-gradient(180deg, var(--ui-color-amber-100), var(--ui-color-amber-50));
  border-radius: 1.1rem;
  border: 1px solid var(--ui-color-amber-300);
  padding: 0.3rem;
}
.counter-bead {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 9999px;
  background: linear-gradient(180deg, var(--ui-primary), var(--ui-color-primary-600));
  box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.counter-hole {
  width: 30%;
  height: 30%;
  border-radius: 9999px;
  background: var(--ui-bg);
  opacity: 0.7;
}
.counter-rail {
  width: 0.5rem;
  align-self: center;
  height: 5.6rem;
  border-radius: 0.25rem;
  background: var(--ui-color-amber-500);
  margin: 0 -0.2rem;
}
.counter-label {
  font-size: 1rem;
  color: var(--ui-text-muted);
  font-weight: 600;
}
@keyframes drop-in {
  0% { transform: translateY(-1.4rem); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
</style>