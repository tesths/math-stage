<template>
  <div class="pattern-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/5 题</span>
      <p class="pattern-tip">找一找规律，空缺处填什么？</p>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🧩 规律大王！</p>
      <p class="finish-sub">5 题全对，共答错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="pattern-line">
        <span
          v-for="(v, i) in rd.sequence"
          :key="i"
          class="pattern-item"
          :class="{ blank: i === rd.blankIndex }"
        >{{ i === rd.blankIndex ? '❓' : v }}</span>
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
import { ref } from 'vue'
import { newPatternRound, type PatternRound } from '@/lib/arcade/pattern'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const ROUNDS = 5
const round = ref(1)
const rd = ref<PatternRound>(newPatternRound(1))
const selected = ref<number | string | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const totalWrong = ref(0)
const finished = ref(false)

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = v
  if (String(v) === String(rd.value.answer)) {
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
  rd.value = newPatternRound(round.value)
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}

function restart() {
  round.value = 1
  rd.value = newPatternRound(1)
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  totalWrong.value = 0
  finished.value = false
}
</script>

<style scoped>
.pattern-game {
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
.pattern-tip {
  color: var(--ui-text-toned);
}
.pattern-line {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.pattern-item {
  min-width: 3.4rem;
  height: 3.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-lg);
  border: 1px solid var(--ui-border-accented);
  background: var(--ui-bg);
  font-size: 1.7rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.pattern-item.blank {
  border: 2px dashed var(--ui-primary);
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