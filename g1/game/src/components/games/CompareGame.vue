<template>
  <div class="compare-game">
    <div class="cmp-stage">
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

const cfg = computed(() => props.question.config as { a: number; b: number; emoji?: string; answer: '>' | '<' | '=' })
const answer = computed(() => cfg.value.answer as string)
const leftItems = computed(() => visibleUnits((cfg.value.emoji ?? '●').repeat(cfg.value.a)))
const rightItems = computed(() => visibleUnits((cfg.value.emoji ?? '●').repeat(cfg.value.b)))
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
.cmp-symbols {
  display: flex;
  flex-direction: column;
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
.sym-btn:disabled {
  cursor: default;
}
</style>