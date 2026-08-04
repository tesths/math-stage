<template>
  <div class="split-game">
    <div class="split-stage">
      <div class="split-from">
        <p class="split-cap">已知有 {{ given }} 个</p>
        <div class="split-items">
          <span
            v-for="(c, i) in totalTokens"
            :key="i"
            class="split-item"
            :class="{ given: i < given }"
          >{{ c }}</span>
        </div>
        <p class="split-cap">共 {{ total }} 个，已分 {{ given }} 个，还要分 <span class="split-q">?</span></p>
      </div>
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

const cfg = computed(() => props.question.config as { total: number; given: number; answer: number })
const total = computed(() => cfg.value.total)
const given = computed(() => cfg.value.given)
const answer = computed(() => cfg.value.answer)

const token = '🔵'
const totalTokens = computed(() => visibleUnits(token.repeat(total.value)))

// 确定性选项：第 0 项为 0（干扰），第 1 项为正确答案，其余为 1..total 其余数
const options = computed(() => {
  const answerVal = answer.value
  const rest: number[] = []
  for (let i = 1; i <= total.value; i++) {
    if (i !== 0 && i !== answerVal) rest.push(i)
  }
  return [0, answerVal, ...rest].slice(0, total.value + 1)
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
.split-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.split-stage {
  display: flex;
  gap: 3rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}
.split-from, .split-into {
  text-align: center;
}
.split-cap {
  font-size: 1.15rem;
  color: var(--ui-text-toned);
  margin-bottom: 0.5rem;
}
.split-items {
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-xl);
  padding: 0.8rem 1.4rem;
  min-height: 4rem;
}
.split-item {
  font-size: 2.4rem;
}
.split-q {
  display: inline-block;
  min-width: 2rem;
  margin-left: 0.25rem;
  font-size: 1.6rem;
  line-height: 2rem;
  text-align: center;
  color: var(--ui-bg-inverted);
  background: var(--ui-primary);
  border-radius: 0.5rem;
  padding: 0 0.4rem;
}
.split-into {
  font-size: 1.5rem;
  color: var(--ui-text-highlighted);
}
</style>