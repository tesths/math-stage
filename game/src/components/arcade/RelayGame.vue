<template>
  <div class="relay-game">
    <div class="game-top">
      <span>第 {{ doneCount }} / {{ chain.length }} 题</span>
      <span class="relay-timer">⏱ {{ elapsed }} 秒</span>
      <span v-if="wrongCount" class="wrong-badge">答错 {{ wrongCount }} 次</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🐲 接龙完成！</p>
      <p class="finish-sub">用时 {{ elapsed }} 秒 · 答错 {{ wrongCount }} 次</p>
      <p class="finish-comment">{{ comment }}</p>
      <UButton color="primary" size="lg" @click="restart">再来一局</UButton>
    </div>

    <template v-else>
      <p class="relay-q" data-test="question">{{ current?.text }}</p>
      <p v-if="prevText" class="relay-prev">上一题得数 {{ prevAnswer }}，这题要用它哦</p>
      <AnswerPad
        :options="currentOptions"
        :selected="selected"
        :disabled="done"
        :correct-value="current?.answer"
        :show-result="done"
        @select="onSelect"
      />
      <FeedbackOverlay :state="feedback" :correct-answer="current?.answer ?? 0" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { generateChain, optionsFor, type RelayLink } from '@/lib/arcade/relay'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const LENGTH = 5
const chain = ref<RelayLink[]>(generateChain(LENGTH))
const index = ref(0)
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const wrongCount = ref(0)
const elapsed = ref(0)
const finished = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const current = computed<RelayLink | undefined>(() => chain.value[index.value])
const doneCount = computed(() => (finished.value ? LENGTH : index.value + (done.value ? 1 : 0)))
const currentOptions = computed(() => (current.value ? optionsFor(current.value.answer) : []))
const prevAnswer = computed(() => (index.value > 0 ? chain.value[index.value - 1]!.answer : null))
const prevText = computed(() => (prevAnswer.value === null ? '' : `上一题得数 ${prevAnswer.value}`))
const comment = computed(() => {
  if (wrongCount.value === 0) return '零失误，太棒了！'
  if (elapsed.value <= 40) return '又准又快！'
  return '再接再厉！'
})

function startTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    elapsed.value += 1
  }, 1000)
}
startTimer()

function onSelect(v: number | string) {
  if (done.value || !current.value) return
  selected.value = Number(v)
  if (Number(v) === current.value.answer) {
    done.value = true
    feedback.value = 'correct'
    playCorrect()
    setTimeout(() => {
      if (index.value >= LENGTH - 1) {
        finish()
      } else {
        index.value += 1
        selected.value = null
        done.value = false
        feedback.value = 'idle'
      }
    }, 900)
  } else {
    wrongCount.value += 1
    feedback.value = 'wrong'
    playWrong()
  }
}

function finish() {
  if (timer) clearInterval(timer)
  timer = null
  finished.value = true
}

function restart() {
  chain.value = generateChain(LENGTH)
  index.value = 0
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  wrongCount.value = 0
  elapsed.value = 0
  finished.value = false
  startTimer()
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.relay-game {
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
  flex-wrap: wrap;
  justify-content: center;
}
.relay-timer {
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.wrong-badge {
  color: var(--ui-color-error-500);
}
.relay-q {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--ui-text-highlighted);
}
.relay-prev {
  color: var(--ui-text-muted);
  font-size: 1.05rem;
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
}
.finish-comment {
  color: var(--ui-primary);
  font-weight: 600;
  margin-bottom: 0.6rem;
}
</style>