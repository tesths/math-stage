<template>
  <div class="picking-game">
    <div v-if="!finished" class="game-top">
      <span>第 {{ round }}/5 题</span>
    </div>

    <div v-if="finished" class="finish-card">
      <p class="finish-title">🍎 果实丰收啦！</p>
      <p class="finish-sub">5 题全对，共答错 {{ totalWrong }} 次</p>
      <UButton color="primary" size="lg" @click="restart">再摘一次</UButton>
    </div>

    <template v-else>
      <div class="orchard">
        <p class="q-text" data-test="question">{{ questionText }}</p>
        <div class="tree" data-test="tree">
          <div class="tree-fruit">
            <span v-for="i in onTree" :key="i" class="apple">🍎</span>
          </div>
          <div class="trunk">🌳</div>
        </div>
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
      <UButton v-if="done && !finished" color="primary" size="lg" @click="nextRound">下一题</UButton>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { newPickingRound, type PickingRound } from '@/lib/arcade/picking'
import AnswerPad from '@/components/ui/AnswerPad.vue'
import FeedbackOverlay from '@/components/ui/FeedbackOverlay.vue'
import { playCorrect, playWrong } from '@/lib/sound'

const ROUNDS = 5
const round = ref(1)
const rd = ref<PickingRound>(newPickingRound(1))
const picked = ref(0)
const selected = ref<number | null>(null)
const done = ref(false)
const feedback = ref<'idle' | 'correct' | 'wrong'>('idle')
const totalWrong = ref(0)
const finished = ref(false)

/** 摘视动画：先摘前 picks 一部分再显示问题 */
const onTree = computed(() => (rd.value ? Math.max(0, rd.value.initial - picked.value) : 0))

const questionText = computed(() => {
  if (!rd.value) return ''
  const pickList = rd.value.picks.join(' 个、') + ' 个'
  return rd.value.mode === 'total'
    ? `小树上有 ${rd.value.initial} 个果子，第一次摘 ${rd.value.picks[0]} 个${rd.value.picks[1] ? `，又摘 ${rd.value.picks[1]} 个` : ''}，一共摘了多少个？`
    : `小树上有 ${rd.value.initial} 个果子，摘了 ${pickList}，还剩多少个？`
})

function onSelect(v: number | string) {
  if (done.value) return
  selected.value = Number(v)
  if (Number(v) === rd.value.answer) {
    picked.value = rd.value.picks.reduce((s, p) => s + p, 0)
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
  rd.value = newPickingRound(round.value)
  picked.value = 0
  selected.value = null
  done.value = false
  feedback.value = 'idle'
}

function restart() {
  round.value = 1
  rd.value = newPickingRound(1)
  picked.value = 0
  selected.value = null
  done.value = false
  feedback.value = 'idle'
  totalWrong.value = 0
  finished.value = false
}
</script>

<style scoped>
.picking-game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.game-top {
  font-size: 1.05rem;
  color: var(--ui-text-muted);
}
.orchard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
.q-text {
  max-width: 26rem;
  text-align: center;
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--ui-text-highlighted);
  min-height: 3.4rem;
}
.tree {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}
.tree-fruit {
  max-width: 20rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: center;
  background: var(--ui-color-green-100);
  border-radius: var(--ui-radius-xl);
  padding: 0.6rem 1rem;
}
.apple {
  font-size: 1.7rem;
  animation: drop-in 0.25s ease-out;
}
.trunk {
  font-size: 3.5rem;
  line-height: 1;
}
@keyframes drop-in {
  0% { transform: translateY(-1rem); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
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