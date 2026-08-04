<template>
  <div class="position-game">
    <div class="pos-stage">
      <div class="pos-items">
        <span
          v-for="(item, i) in items"
          :key="i"
          class="pos-item"
          :class="{ picked: done && item === correctItem }"
          :data-item="item"
          @click="onItem(item)"
        >{{ item }}</span>
      </div>
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
const cfg = computed(() => props.question.config)
const items = computed(() => (cfg.value as { items: string[] }).items)
const answer = computed(() => (cfg.value as { answer: number | string }).answer)
const correctItem = computed(() => (cfg.value as { target: string }).target)
const ordinalOptions = computed(() => items.value.map((_, i) => i + 1))
const answerText = computed(() => (isOrdinal.value ? undefined : String(answer.value)))

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

function finish(value: number | string) {
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