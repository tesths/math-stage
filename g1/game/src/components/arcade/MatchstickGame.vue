<template>
  <div class="matchstick-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }} / {{ questions.length }} 题</span>
      <span class="wrong-badge" v-if="wrongCount">答错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🪄 火柴魔法师！</p>
      <p class="finish-sub">全部答对，答错 {{ wrongCount }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <p class="match-tip">移动一根火柴，让算式成立。哪个算式才是对的？</p>
      <div class="match-expr" data-test="bad">
        <template v-for="(ch, i) in badChars" :key="i">
          <MatchstickDigit v-if="isDigit(ch)" :digit="ch" :width="34" />
          <span v-else class="match-op" :class="ch">{{ ch === '-' ? '−' : ch }}</span>
        </template>
      </div>

      <div class="match-options" data-test="options">
        <button
          v-for="(opt, i) in options"
          :key="i"
          class="match-opt"
          :class="{ chosen: selected === opt }"
          :data-expr="opt"
          @click="onSelect(opt)"
        >
          <template v-for="(ch, j) in opt.split('')" :key="j">
            <MatchstickDigit v-if="isDigit(ch)" :digit="ch" :width="24" />
            <span v-else class="match-op small">{{ ch === '-' ? '−' : ch }}</span>
          </template>
        </button>
      </div>

      <FeedbackOverlay :state="feedback" :correct-answer="current.good" />
      <UButton v-if="done && !finished" color="primary" size="lg" @click="nextRound">下一题</UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MATCHSTICK_LEVELS, type MatchstickItem } from '@/lib/arcade/matchstick'
import { shuffle } from '@/lib/engine/generator'
import MatchstickDigit from '@/components/arcade/MatchstickDigit.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const ROUNDS = 5
const questions = ref<MatchstickItem[]>(shuffle(MATCHSTICK_LEVELS).slice(0, ROUNDS))
const round = ref(1)
const current = computed<MatchstickItem>(() => questions.value[round.value - 1]!)
const options = ref<string[]>([])
const selected = ref<string | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const wrongCount = ref(0)
const finished = ref(false)

const badChars = computed(() => current.value.bad.split(''))

function isDigit(ch: string): boolean {
  return /[0-9]/.test(ch)
}

function startRound() {
  const q = current.value
  options.value = shuffle([q.good, q.bad, ...q.distractors])
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}

startRound()

function onSelect(expr: string) {
  if (done.value) return
  selected.value = expr
  if (expr === current.value.good) {
    done.value = true
    feedback.value = 'correct'
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
  startRound()
}

function restart() {
  questions.value = shuffle(MATCHSTICK_LEVELS).slice(0, ROUNDS)
  round.value = 1
  wrongCount.value = 0
  finished.value = false
  startRound()
}
</script>

<style scoped>
.matchstick-game {
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
.match-tip {
  color: var(--ui-text-toned);
  font-size: 1.1rem;
  text-align: center;
}
.match-expr {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  background: var(--ui-color-amber-50);
  border: 2px solid var(--ui-color-amber-300);
  border-radius: var(--ui-radius-xl);
  padding: 0.7rem 1.2rem;
}
.match-op {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ui-color-amber-700);
}
.match-op.small {
  font-size: 1.4rem;
}
.match-options {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: center;
}
.match-opt {
  display: flex;
  gap: 0.3rem;
  align-items: center;
  border-radius: var(--ui-radius-lg);
  border: 2px solid var(--ui-border-accented);
  background: var(--ui-bg);
  padding: 0.5rem 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.15s;
}
.match-opt:hover {
  border-color: var(--ui-primary);
  transform: translateY(-3px);
}
.match-opt.chosen {
  border-color: var(--ui-primary);
  background: var(--ui-color-primary-100);
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