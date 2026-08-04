<template>
  <div class="addsub-game">
    <div class="as-expression">
      <span class="as-num">{{ a }}</span>
      <span class="as-op" data-test="op">{{ opText }}</span>
      <span class="as-num">{{ b }}</span>
      <span class="as-eq">=</span>
      <span class="as-blank">?</span>
    </div>
    <div class="as-objects">
      <span
        v-for="(c, i) in allObjects"
        :key="i"
        class="obj-item"
        :class="{ removed: isRemove && i >= a - b }"
      >{{ c }}</span>
    </div>
    <AnswerPad
      :options="options"
      :selected="selected"
      :disabled="done"
      :correct-value="answer"
      :show-result="done"
      @select="onSelect"
    />
    <FeedbackOverlay :state="feedback" :correct-answer="answer" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { visibleUnits } from '@/lib/engine/count'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config as { a: number; b: number; op: '+' | '-'; answer: number; emoji: string; options: number[] })
const a = computed(() => cfg.value.a)
const b = computed(() => cfg.value.b)
const isRemove = computed(() => cfg.value.op === '-')
const answer = computed(() => cfg.value.answer)
const options = computed(() => cfg.value.options)
const opText = computed(() => (isRemove.value ? '−' : '+'))
const allObjects = computed(() => {
  const n = isRemove.value ? a.value : a.value + b.value
  return visibleUnits(cfg.value.emoji.repeat(n))
})

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

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
.addsub-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.as-expression {
  font-size: 3rem;
  color: var(--ui-text-highlighted);
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.as-num {
  min-width: 2.4rem;
  text-align: center;
}
.as-op {
  color: var(--ui-primary);
}
.as-blank {
  display: inline-grid;
  place-items: center;
  min-width: 2.6rem;
  height: 2.6rem;
  font-size: 1.8rem;
  color: var(--ui-bg-inverted);
  background: var(--ui-primary);
  border-radius: 0.5rem;
}
.as-objects {
  display: flex;
  flex-wrap: wrap;
  max-width: 42rem;
  justify-content: center;
}
.obj-item {
  font-size: 2.6rem;
  transition: transform 0.2s;
}
.obj-item.removed {
  opacity: 0.4;
  filter: grayscale(1);
  transform: translateY(0.4rem);
}
</style>