<template>
  <div class="ten-game">
    <p class="ten-target">选出的卡片相加 = {{ target }}</p>
    <div class="ten-model">
      <TenFrame :lit-count="frameLitCount" obj="●" />
      <p class="ten-sum">{{ sumNote }}</p>
    </div>
    <div class="cards">
      <button
        v-for="(card, i) in cards"
        :key="i"
        class="card"
        :class="{ chosen: chosen.includes(card) }"
        :data-card="card"
        :disabled="done"
        @click="toggle(card)"
      >{{ card }}</button>
    </div>
    <p class="ten-picked">已选：{{ chosen.join('、') || '（还没选）' }}</p>
    <button class="confirm-btn" :disabled="done || chosen.length === 0" @click="confirm">确定</button>
    <FeedbackOverlay :state="feedback" :correct-answer="answer.join('、')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import TenFrame from '@/components/ui/TenFrame.vue'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config as { target: number; cards: number[]; answer: number[] })
const target = computed(() => cfg.value.target)
const cards = computed(() => cfg.value.cards)
const answer = computed(() => cfg.value.answer)

const chosen = ref<number[]>([])
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

const chosenSum = computed(() => chosen.value.reduce((sum, card) => sum + card, 0))
const frameLitCount = computed(() => Math.min(chosenSum.value, 10))
const sumNote = computed(() => {
  if (chosenSum.value === 0) return `先选卡片，把十框填满到 ${target.value}`
  if (chosenSum.value < target.value) return `已选 ${chosen.value.join(' + ')} = ${chosenSum.value}，还差 ${target.value - chosenSum.value}`
  if (chosenSum.value === target.value) return `已选 ${chosen.value.join(' + ')} = ${target.value}，十框正好填满`
  return `已选 ${chosen.value.join(' + ')} = ${chosenSum.value}，多了 ${chosenSum.value - target.value}`
})

function toggle(card: number) {
  if (done.value) return
  chosen.value = chosen.value.includes(card)
    ? chosen.value.filter((c) => c !== card)
    : [...chosen.value, card]
}

function confirm() {
  if (done.value || chosen.value.length === 0) return
  const correct = isAnswerCorrect(props.question, chosen.value)
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
.ten-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.ten-target {
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.ten-model {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: min(100%, 24rem);
}
.ten-sum {
  min-height: 1.4rem;
  color: var(--ui-text-toned);
  font-size: 0.98rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}
.cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.card {
  width: 4.6rem;
  height: 6.4rem;
  font-size: 2.2rem;
  font-weight: bold;
  background: var(--ui-bg);
  border: 2px solid var(--ui-border-accented);
  border-radius: var(--ui-radius-xl);
  cursor: pointer;
  color: var(--ui-text-highlighted);
  transition: transform 0.15s, background 0.15s, border-color 0.15s;
  box-shadow: var(--ui-shadow);
}
.card:hover:not(:disabled) {
  transform: translateY(-6px) rotate(-3deg);
  border-color: var(--ui-primary);
}
.card.chosen {
  background: var(--ui-color-primary-100);
  border-color: var(--ui-primary);
  transform: translateY(-6px);
}
.card:disabled {
  cursor: default;
}
.ten-picked {
  color: var(--ui-text-muted);
  font-size: 1.1rem;
  min-height: 1.4rem;
}
.confirm-btn {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.6rem 3.2rem;
  border-radius: var(--ui-radius-lg);
  border: none;
  background: var(--ui-primary);
  color: var(--ui-bg-inverted);
  cursor: pointer;
  box-shadow: 0 4px 0 var(--ui-color-primary-600);
  transition: background 0.15s, transform 0.1s;
}
.confirm-btn:hover:not(:disabled) {
  background: var(--ui-color-primary-600);
}
.confirm-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--ui-color-primary-600);
}
.confirm-btn:disabled {
  opacity: 0.5;
  cursor: default;
  box-shadow: none;
}
</style>
