<template>
  <div class="frogjump-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/5 题</span>
      <p class="frog-q">
        青蛙在 <strong>{{ rd.from }}</strong>，向前跳 <strong>{{ rd.steps }}</strong> 格
      </p>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🐸 跳跳蛙回家啦！</p>
      <p class="finish-sub">5 题全对，共答错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="lily-line">
        <div
          v-for="n in lilyRange"
          :key="n"
          class="lily"
          :class="{ frog: n === rd.from, focus: n === landed }"
        >{{ n }}</div>
      </div>

      <AnswerPad
        :options="rd.options"
        :selected="selected"
        :disabled="done"
        :correct-value="rd.answer"
        :show-result="done"
        @select="onSelect"
      />
      <FeedbackOverlay :state="feedback" :correct-answer="rd.answer" />
      <UButton v-if="done && !finished" color="primary" size="lg" @click="nextRound">
        下一题
      </UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { newFrogRound, type FrogRound } from '@/lib/arcade/frogjump'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const ROUNDS = 5
const round = ref(1)
const rd = ref<FrogRound>(newFrogRound())
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const totalWrong = ref(0)
const finished = ref(false)
const landed = ref<number | null>(null)

const lilyRange = computed(() => {
  const from = Math.max(1, rd.value.from - 1)
  const to = rd.value.answer + 1
  const nums: number[] = []
  for (let i = from; i <= to; i++) nums.push(i)
  return nums
})

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = Number(v)
  if (Number(v) === rd.value.answer) {
    landed.value = rd.value.answer
    done.value = true
    feedback.value = 'correct'
    playCorrect()
  } else {
    totalWrong.value += 1
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
  rd.value = newFrogRound()
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  landed.value = null
}

function restart() {
  round.value = 1
  rd.value = newFrogRound()
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  totalWrong.value = 0
  finished.value = false
  landed.value = null
}
</script>

<style scoped>
.frogjump-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.frog-q {
  font-size: 1.25rem;
  color: var(--ui-text-highlighted);
}
.frog-q strong {
  color: var(--ui-primary);
  font-size: 1.5rem;
  margin: 0 0.2rem;
}
.lily-line {
  display: flex;
}
.lily {
  width: 3.2rem;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 -0.25rem;
  border-radius: 9999px;
  background: var(--ui-color-green-100);
  border: 2px solid var(--ui-color-green-500);
  color: var(--ui-color-green-700);
  font-weight: bold;
  font-size: 1.2rem;
}
.lily.frog {
  background: var(--ui-color-green-500);
  color: var(--ui-bg-inverted);
  font-size: 1.6rem;
}
.lily.focus {
  transform: scale(1.15);
  border-color: var(--ui-primary);
  box-shadow: 0 0 0 4px var(--ui-color-primary-200);
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