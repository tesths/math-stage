<template>
  <div class="codebreak-game">
    <div class="game-top">
      <span>解开 {{ solved }} / 3 道锁</span>
      <span v-if="wrongCount" class="wrong-badge">答错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🔓 宝箱打开啦！</p>
      <p class="finish-sub">🎁 宝箱里是：10 以内的加减法，都学会啦！</p>
      <UButton color="primary" size="lg" @click="restart">再闯一次</UButton>
    </div>

    <template v-else>
      <div class="locks" data-test="locks">
        <div
          v-for="i in 3"
          :key="i"
          class="lock"
          :class="{ solved: i <= solved, current: i === solved + 1 }"
        >🔒</div>
      </div>

      <p class="code-q" data-test="question">{{ question?.text }}</p>
      <AnswerPad
        :options="questionOptions"
        :selected="selected"
        :disabled="done"
        :correct-value="question?.answer"
        :show-result="done"
        @select="onSelect"
      />
      <FeedbackOverlay :state="feedback" :correct-answer="question.answer" />
      <UButton v-if="done" color="primary" size="lg" @click="nextLock">下一道锁</UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { newCodeQuestion, type CodeQuestion } from '@/lib/arcade/codebreak'
import { optionsFor } from '@/lib/arcade/relay'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const solved = ref(0)
const question = ref<CodeQuestion>(newCodeQuestion())
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const wrongCount = ref(0)
const finished = ref(false)

const questionOptions = computed(() => optionsFor(question.value.answer))

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = Number(v)
  if (Number(v) === question.value.answer) {
    done.value = true
    feedback.value = 'correct'
    playCorrect()
  } else {
    wrongCount.value += 1
    feedback.value = 'wrong'
    playWrong()
  }
}

function nextLock() {
  solved.value += 1
  if (solved.value >= 3) {
    finished.value = true
    return
  }
  question.value = newCodeQuestion()
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}

function restart() {
  solved.value = 0
  wrongCount.value = 0
  finished.value = false
  question.value = newCodeQuestion()
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}
</script>

<style scoped>
.codebreak-game {
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
.locks {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.lock {
  font-size: 2.8rem;
  filter: grayscale(1) opacity(0.4);
  transition: filter 0.3s;
}
.lock.solved {
  filter: none;
}
.lock.current {
  filter: grayscale(0.4);
  animation: wiggle 1s ease-in-out infinite;
}
@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}
.code-q {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
  min-height: 2.4rem;
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
.finish-sub {
  color: var(--ui-text-muted);
  margin-bottom: 0.6rem;
}
</style>