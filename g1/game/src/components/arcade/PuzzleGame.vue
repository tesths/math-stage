<template>
  <div class="puzzle-game">
    <div class="game-top">
      <span>已揭开 {{ opened.size }} / 9 块</span>
      <span v-if="lastWrong" class="wrong-badge">答错 {{ wrongCount }} 次</span>
    </div>

    <div class="puzzle-art">
      <div
        v-for="(row, r) in PUZZLE_ART"
        :key="'r' + r"
        class="puzzle-row"
      >
        <div
          v-for="(cell, c) in row"
          :key="c"
          class="puzzle-tile"
          :class="{ open: opened.has(r * 3 + c) }"
          :data-tile="r * 3 + c"
        >{{ cell }}</div>
      </div>
    </div>

    <template v-if="finished">
      <div class="finish-card">
        <p class="finish-title">🖼️ 拼图完成！</p>
        <p class="finish-sub">这是一只可爱的猫，答错 {{ wrongCount }} 次</p>
        <UButton color="primary" size="lg" @click="restart">再拼一张</UButton>
      </div>
    </template>

    <template v-else>
      <p class="puzzle-q" data-test="question">{{ current?.text }}</p>
      <AnswerPad
        :options="currentOptions"
        :selected="selected"
        :disabled="done"
        :correct-value="current?.answer"
        :show-result="done"
        @select="onSelect"
      />
      <FeedbackOverlay :state="feedback" :correct-answer="current.answer" />
      <UButton v-if="done" color="primary" size="lg" @click="nextTile">揭开拼图</UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { newPuzzleQuestion, PUZZLE_ART, type PuzzleQuestion } from '@/lib/arcade/puzzle'
import { optionsFor } from '@/lib/arcade/relay'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const TOTAL = 9
const opened = ref<Set<number>>(new Set())
const current = ref<PuzzleQuestion>(newPuzzleQuestion())
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const wrongCount = ref(0)
const lastWrong = ref(false)
const finished = ref(false)

const currentOptions = computed(() => optionsFor(current.value.answer))

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = Number(v)
  if (Number(v) === current.value.answer) {
    done.value = true
    feedback.value = 'correct'
    lastWrong.value = false
    playCorrect()
  } else {
    wrongCount.value += 1
    lastWrong.value = true
    feedback.value = 'wrong'
    playWrong()
  }
}

function nextTile() {
  const nextOpened = new Set([...opened.value, opened.value.size])
  opened.value = nextOpened
  if (opened.value.size >= TOTAL) {
    finished.value = true
    return
  }
  current.value = newPuzzleQuestion()
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  lastWrong.value = false
}

function restart() {
  opened.value = new Set()
  wrongCount.value = 0
  lastWrong.value = false
  finished.value = false
  current.value = newPuzzleQuestion()
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}
</script>

<style scoped>
.puzzle-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.wrong-badge {
  color: var(--ui-color-error-500);
}
.puzzle-art {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: var(--ui-color-primary-100);
  border-radius: var(--ui-radius-lg);
  padding: 0.25rem;
}
.puzzle-row {
  display: flex;
  gap: 0.25rem;
}
.puzzle-tile {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  background: var(--ui-bg-muted);
  border-radius: 0.5rem;
  color: transparent;
  border: 1px solid var(--ui-border-accented);
}
.puzzle-tile.open {
  background: var(--ui-bg);
  color: inherit;
  animation: pop 0.3s ease-out;
}
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0.3; }
  100% { transform: scale(1); opacity: 1; }
}
.puzzle-q {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
  min-height: 2rem;
}
.finish-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 1.2rem 0;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
}
</style>