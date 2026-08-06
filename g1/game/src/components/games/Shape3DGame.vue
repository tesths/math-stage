<template>
  <div class="shape3d-game">
    <div ref="container" class="shape-canvas" data-test="shape-canvas"></div>
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { GameQuestion } from '@data/schema/example'
import { isAnswerCorrect } from '@/lib/engine/checker'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { useShapeRenderer } from '@/composables/useShapeRenderer'

const props = defineProps<{ question: GameQuestion }>()
const emit = defineEmits<{ answered: [result: { correct: boolean; attempts: number }] }>()

const cfg = computed(() => props.question.config as { shape: string; options: string[]; answer: string })
const options = computed(() => cfg.value.options)
const answer = computed(() => cfg.value.answer)
const shape = computed(() => cfg.value.shape)

const container = ref<HTMLElement | null>(null)
const renderer = useShapeRenderer(container, shape)

onMounted(() => renderer.mountCanvas())
onUnmounted(() => renderer.dispose())

const selected = ref<string | null>(null)
const attempts = ref(1)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')

function onSelect(value: number | string) {
  if (done.value) return
  selected.value = String(value)
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
.shape3d-game {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.shape-canvas {
  width: 16rem;
  height: 14rem;
  border-radius: var(--ui-radius-2xl);
  background: linear-gradient(180deg, var(--ui-bg-muted), var(--ui-bg));
  border: 1px solid var(--ui-border-accented);
}
</style>