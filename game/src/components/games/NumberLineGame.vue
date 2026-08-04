<template>
  <div class="numberline-game">
    <template v-if="isNumberline">
      <div class="num-line" data-test="numline">
        <span
          v-for="t in 20"
          :key="t"
          class="num-line-tick"
          :class="{ active: t - 1 === value }"
        >{{ t - 1 }}</span>
      </div>
    </template>
    <template v-else>
      <div class="seq-stage">
        <button
          v-for="v in seqButtons"
          :key="v"
          class="seq-btn"
          :class="{ picked: picked.includes(v) }"
          :disabled="picked.includes(v)"
          @click="onSeq(v)"
        >{{ v }}</button>
      </div>
      <p class="seq-tip">按从小到大的顺序点一点</p>
    </template>
    <AnswerPad
      v-if="isNumberline"
      :options="options"
      :selected="selected"
      :disabled="done"
      :correct-value="answer"
      :show-result="done"
      @select="onSelect"
    />
    <FeedbackOverlay :state="feedback" :correct-answer="fbAnswer" :answer-text="fbText" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import { shuffle } from '@/lib/engine/generator'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const isNumberline = computed(() => props.question.type === 'numberline')
const cfg = computed(() => props.question.config)
const value = computed(() => (cfg.value as { value: number }).value)
const options = computed(() => (cfg.value as { options: number[] }).options)
const seqNumbers = computed(() => (cfg.value as { answer: number[] }).answer)
const seqButtons = ref<number[]>([])
if (props.question.type === 'sequence') {
  seqButtons.value = shuffle(seqNumbers.value)
}

const fbText = computed(() => (isNumberline.value ? undefined : seqNumbers.value.join('、')))
const fbAnswer = computed(() => (isNumberline.value ? answer.value : seqNumbers.value.join('、')))
const answer = computed(() => (cfg.value as { answer: number }).answer)

const selected = ref<number | string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const picked = ref<number[]>([])

function onSelect(val: number | string) {
  if (done.value) return
  selected.value = val
  finish(val)
}

function onSeq(val: number) {
  if (done.value) return
  const next = [...picked.value, val]
  if (next.length === seqNumbers.value.length) {
    const correct = isAnswerCorrect(props.question, next)
    const attemptsNow = attempts.value
    if (!correct) attempts.value += 1
    finishSeq(next, correct, attemptsNow)
  } else {
    picked.value = next
  }
}

function finishSeq(values: number[], correct: boolean, attemptsNow: number) {
  emit('answered', { correct, attempts: attemptsNow })
  if (correct) {
    done.value = true
    feedback.value = 'correct'
  } else {
    feedback.value = 'wrong'
    picked.value = []
  }
}

function finish(val: number | string) {
  const correct = isAnswerCorrect(props.question, val)
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
.numberline-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.num-line {
  display: flex;
  gap: 0.35rem;
  max-width: 46rem;
  flex-wrap: wrap;
  justify-content: center;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 0.9rem 1.2rem;
}
.num-line-tick {
  width: 2.1rem;
  text-align: center;
  font-size: 1.15rem;
  color: var(--ui-text-toned);
}
.num-line-tick.active {
  background: var(--ui-primary);
  border-radius: 0.5rem;
  color: var(--ui-bg-inverted);
  font-weight: bold;
}
.seq-stage {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.seq-btn {
  width: 4rem;
  height: 4rem;
  font-size: 1.9rem;
  border-radius: var(--ui-radius-xl);
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  cursor: pointer;
  color: var(--ui-text-highlighted);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.seq-btn:hover:not(:disabled) {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}
.seq-btn.picked {
  background: var(--ui-color-primary-100);
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  font-weight: bold;
}
.seq-tip {
  color: var(--ui-text-muted);
  font-size: 1.1rem;
}
</style>