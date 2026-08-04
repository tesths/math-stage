<template>
  <div class="shaperiddle-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/5 题</span>
      <span v-if="wrongCount" class="wrong-badge">答错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🧊 图形小侦探！</p>
      <p class="finish-sub">5 题全对，答错 {{ wrongCount }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再猜一次</UButton>
    </div>

    <template v-else>
      <p class="riddle-clue" data-test="clue">{{ rd.clue }}</p>
      <p v-if="revealed" class="riddle-art">{{ rd.art }}</p>

      <div v-if="!revealed" class="shape-options">
        <button
          v-for="s in rd.options"
          :key="s"
          class="shape-opt"
          :class="{ chosen: selected === s }"
          :data-shape="s"
          @click="onSelect(s)"
        >{{ s }}</button>
      </div>
      <FeedbackOverlay :state="feedback" :correct-answer="rd.target" />
      <UButton v-if="revealed && !finished" color="primary" size="lg" @click="nextRound">
        下一题
      </UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { newRiddleRound, type RiddleRound } from '@/lib/arcade/shaperiddle'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const ROUNDS = 5
const round = ref(1)
const rd = ref<RiddleRound>(newRiddleRound(1))
const selected = ref<string | null>(null)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const revealed = ref(false)
const wrongCount = ref(0)
const finished = ref(false)

function onSelect(s: string) {
  if (revealed.value) return
  selected.value = s
  if (s === rd.value.target) {
    feedback.value = 'correct'
    revealed.value = true
    playCorrect()
  } else {
    wrongCount.value += 1
    feedback.value = 'wrong'
    playWrong()
  }
}

function nextRound() {
  if (round.value >= ROUNDS) {
    finished.value = true
    return
  }
  round.value += 1
  rd.value = newRiddleRound(round.value)
  selected.value = null
  feedback.value = 'idle'
  revealed.value = false
}

function restart() {
  round.value = 1
  wrongCount.value = 0
  finished.value = false
  rd.value = newRiddleRound(1)
  selected.value = null
  feedback.value = 'idle'
  revealed.value = false
}
</script>

<style scoped>
.shaperiddle-game {
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
.riddle-clue {
  font-size: 1.35rem;
  line-height: 1.8;
  text-align: center;
  color: var(--ui-text-highlighted);
  font-weight: 600;
  max-width: 26rem;
  min-height: 4rem;
}
.riddle-art {
  font-size: 4rem;
  animation: pop 0.35s ease-out;
}
@keyframes pop {
  0% { transform: scale(0.4); }
  100% { transform: scale(1); }
}
.shape-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
  width: 100%;
  max-width: 18rem;
}
.shape-opt {
  padding: 1.1rem 0;
  font-size: 1.35rem;
  font-weight: bold;
  border-radius: var(--ui-radius-xl);
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  color: var(--ui-text-highlighted);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.shape-opt:hover {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
  transform: translateY(-3px);
}
.shape-opt.chosen {
  border-color: var(--ui-primary);
  background: var(--ui-color-primary-100);
  color: var(--ui-primary);
}
.finish-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2rem 0;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-sub {
  color: var(--ui-text-muted);
  margin-bottom: 0.6rem;
}
</style>