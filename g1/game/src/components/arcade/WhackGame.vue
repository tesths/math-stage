<template>
  <div class="whack-game">
    <div class="game-top">
      <span class="whack-timer">⏱ {{ remaining }} 秒</span>
      <span class="whack-score">得分 {{ score }}</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🐹 时间到！</p>
      <p class="finish-score">得分 {{ score }} 分</p>
      <p class="finish-comment">{{ comment }}</p>
      <UButton color="primary" size="lg" @click="restart">再来一局</UButton>
    </div>

    <template v-else>
      <p class="whack-q" data-test="question">{{ question?.text }} = ?</p>
      <div class="holes" data-test="holes">
        <button
          v-for="(v, i) in holeValues"
          :key="i"
          class="hole"
          :class="{ active: v !== null }"
          :data-value="String(v)"
          :data-active="v !== null"
          @click="hit(v)"
        >
          <span class="hole-mole">{{ v !== null ? v : '' }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { newWhackQuestion, pickWhackAnswers, type WhackQuestion } from '@/lib/arcade/whack'
import { playCorrect, playWrong } from '@/lib/sound'

const DURATION = 60
const remaining = ref(DURATION)
const score = ref(0)
const finished = ref(false)
const question = ref<WhackQuestion>(newWhackQuestion())
const holeValues = ref<(number | null)[]>(new Array(9).fill(null))
const hitThisRound = ref(false)
let tick: ReturnType<typeof setInterval> | null = null
let roundTimer: ReturnType<typeof setTimeout> | null = null

const comment = computed(() => {
  if (score.value >= 300) return '打鼠冠军！'
  if (score.value >= 180) return '手真快！'
  return '多练几局会更厉害'
})

function startRound() {
  question.value = newWhackQuestion()
  hitThisRound.value = false
  holeValues.value = pickWhackAnswers(question.value.answer).map((v) => v as number | null)
}

function startGame() {
  remaining.value = DURATION
  score.value = 0
  finished.value = false
  startRound()
  if (tick) clearInterval(tick)
  tick = setInterval(() => {
    remaining.value -= 1
    if (remaining.value <= 0) {
      endGame()
    }
  }, 1000)
  if (roundTimer) clearTimeout(roundTimer)
  roundTimer = setInterval(() => {
    if (!finished.value) startRound()
  }, 1500)
}

startGame()

function hit(v: number | null) {
  if (finished.value || v === null || hitThisRound.value) return
  hitThisRound.value = true
  holeValues.value = new Array(9).fill(null)
  if (v === question.value.answer) {
    score.value += 10
    playCorrect()
  } else {
    score.value = Math.max(0, score.value - 5)
    playWrong()
  }
}

function endGame() {
  if (tick) clearInterval(tick)
  tick = null
  if (roundTimer) clearTimeout(roundTimer)
  roundTimer = null
  holeValues.value = new Array(9).fill(null)
  finished.value = true
}

function restart() {
  startGame()
}

onUnmounted(() => {
  if (tick) clearInterval(tick)
  if (roundTimer) clearTimeout(roundTimer)
})
</script>

<style scoped>
.whack-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 1.15rem;
}
.whack-timer {
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.whack-score {
  color: var(--ui-primary);
  font-weight: bold;
}
.whack-q {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.holes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem;
  max-width: 21rem;
  width: 100%;
}
.hole {
  aspect-ratio: 1;
  border-radius: 9999px;
  border: 3px solid var(--ui-border-accented);
  background: var(--ui-color-stone-200);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.hole-mole {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--ui-color-amber-200);
  animation: mole-pop 0.18s ease-out;
}
@keyframes mole-pop {
  0% { transform: scale(0.3) translateY(1rem); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.hole:not(.active) {
  cursor: default;
}
.hole.active:hover {
  background: var(--ui-color-amber-100);
  border-color: var(--ui-primary);
}
.finish-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  padding: 2rem 0;
}
.finish-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.finish-score {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ui-primary);
}
.finish-comment {
  color: var(--ui-text-muted);
  margin-bottom: 0.6rem;
}
</style>