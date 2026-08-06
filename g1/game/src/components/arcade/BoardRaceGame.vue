<template>
  <div class="boardrace-game">
    <div class="race-top">
      <span class="race-pos">位置 {{ pos }} / 20</span>
      <span v-if="phase === 'question'" class="race-q">{{ q?.text }}</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🏁 到达终点啦！</p>
      <p class="finish-sub">共答错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="race-track" data-test="track">
        <div
          v-for="cell in 20"
          :key="cell"
          class="race-cell"
          :class="{ here: pos === cell, question: RACE_QUESTION_CELLS.has(cell), target: cell === 20 }"
        >
          <template v-if="pos === cell">🐸</template>
          <template v-else-if="cell === 20">🏁</template>
          <template v-else-if="RACE_QUESTION_CELLS.has(cell)">❓</template>
          <template v-else>{{ cell }}</template>
        </div>
      </div>

      <template v-if="phase === 'roll'">
        <button class="die-btn" data-test="roll" @click="roll">🎲 掷骰子</button>
        <p v-if="lastDie" class="die-result">掷出了 {{ lastDie }}！</p>
      </template>

      <template v-else-if="phase === 'question' && q">
        <AnswerPad
          :options="q.options"
          :selected="selected"
          :disabled="done"
          :correct-value="q.answer"
          :show-result="done"
          @select="onAnswer"
        />
        <FeedbackOverlay :state="feedback" :correct-answer="q.answer" />
        <UButton v-if="done" color="primary" size="lg" @click="continueRace">
          继续
        </UButton>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { newRaceQuestion, rollDie, RACE_GOAL, RACE_QUESTION_CELLS, type RaceQuestion } from '@/lib/arcade/boardrace'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong, playClick } from '@/lib/sound'

const pos = ref(1)
const phase = ref<'roll' | 'question' | 'done'>('roll')
const lastDie = ref(0)
const q = ref<RaceQuestion | null>(null)
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const totalWrong = ref(0)
const finished = ref(false)

function roll() {
  if (phase.value !== 'roll' || finished.value) return
  playClick()
  lastDie.value = rollDie()
  const next = Math.min(RACE_GOAL, pos.value + lastDie.value)
  pos.value = next
  if (next >= RACE_GOAL) {
    phase.value = 'done'
    finished.value = true
    return
  }
  if (RACE_QUESTION_CELLS.has(next)) {
    q.value = newRaceQuestion()
    selected.value = null
    done.value = false
    feedback.value = 'idle'
    phase.value = 'question'
  }
}

function onAnswer(v: number | string) {
  if (done.value) return
  selected.value = Number(v)
  if (Number(v) === q.value!.answer) {
    done.value = true
    feedback.value = 'correct'
    playCorrect()
  } else {
    totalWrong.value += 1
    done.value = true
    feedback.value = 'wrong'
    playWrong()
  }
}

function continueRace() {
  if (q.value!.answer === selected.value) {
    pos.value = Math.min(RACE_GOAL, pos.value + 2)
  } else {
    pos.value = Math.max(1, pos.value - 1)
  }
  q.value = null
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  if (pos.value >= RACE_GOAL) {
    finished.value = true
    return
  }
  phase.value = 'roll'
}

function restart() {
  pos.value = 1
  phase.value = 'roll'
  lastDie.value = 0
  q.value = null
  totalWrong.value = 0
  finished.value = false
  done.value = false
  feedback.value = 'idle'
}
</script>

<style scoped>
.boardrace-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.race-top {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  font-size: 1.1rem;
  color: var(--ui-text-muted);
  flex-wrap: wrap;
  justify-content: center;
}
.race-pos {
  color: var(--ui-text-highlighted);
  font-weight: bold;
}
.race-q {
  color: var(--ui-primary);
  font-weight: bold;
  font-size: 1.3rem;
}
.race-track {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.35rem;
  width: 100%;
  max-width: 34rem;
}
.race-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-muted);
  font-size: 1.05rem;
  color: var(--ui-text-toned);
}
.race-cell.question {
  background: var(--ui-color-primary-100);
  border-color: var(--ui-color-primary-300);
}
.race-cell.target {
  background: var(--ui-color-amber-100);
  border-color: var(--ui-color-amber-400);
}
.race-cell.here {
  background: var(--ui-primary);
  color: var(--ui-bg-inverted);
  font-size: 1.6rem;
  border-color: var(--ui-primary);
  transform: scale(1.12);
}
.die-btn {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0.7rem 2.6rem;
  border-radius: var(--ui-radius-lg);
  border: none;
  background: var(--ui-primary);
  color: var(--ui-bg-inverted);
  cursor: pointer;
  box-shadow: 0 4px 0 var(--ui-color-primary-600);
  transition: background 0.15s, transform 0.1s;
}
.die-btn:hover {
  background: var(--ui-color-primary-600);
}
.die-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--ui-color-primary-600);
}
.die-result {
  color: var(--ui-text-muted);
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
