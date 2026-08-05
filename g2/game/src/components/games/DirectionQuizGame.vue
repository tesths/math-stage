<script setup lang="ts">
/**
 * 训练游戏：辨认方向（东、南、西、北与前后左右）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import { DIRECTIONS, leftOf, oppositeOf, rightOf } from '@/lib/engine/math'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  face: string
  faceIdx: number
  ask: 'back' | 'left' | 'right'
  answer: string
  options: string[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const faceIdx = randInt(0, 3)
  const face = DIRECTIONS[faceIdx]!
  const ask: Round['ask'] = (['back', 'left', 'right'] as const)[randInt(0, 2)]!
  const target =
    ask === 'back' ? DIRECTIONS[oppositeOf(faceIdx)]! : ask === 'left' ? DIRECTIONS[leftOf(faceIdx)]! : DIRECTIONS[rightOf(faceIdx)]!
  const options = [...DIRECTIONS.filter((d) => d !== target)].concat(target)
  return { face, faceIdx, ask, answer: target, options: options.sort(() => Math.random() - 0.5) }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.answer)
const options = computed(() => rd.value.options)
const askText = computed(() =>
  rd.value.ask === 'back' ? '后面' : rd.value.ask === 'left' ? '左边' : '右边',
)

function onAnswered(correct: boolean) {
  done.value = true
  if (correct) score.value++
}
function next() {
  if (roundNo.value >= 5) {
    finished.value = true
    playWin()
    return
  }
  roundNo.value++
  rd.value = makeRound()
  done.value = false
}
function restart() {
  roundNo.value = 1
  score.value = 0
  done.value = false
  finished.value = false
  rd.value = makeRound()
}
</script>

<template>
  <div class="game">
    <div v-if="finished" class="finish">
      <p class="finish-title">🧭 辨认方向过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">面向{{ rd.face }}，{{ askText }}是什么方向？</p>
        <p class="hint">东和西相对，南和北相对</p>
      </div>

      <GameAnswerBar :options="options" :answer="answer" @answered="onAnswered" />
      <UButton v-if="done" color="primary" size="lg" @click="next">
        {{ roundNo >= 5 ? '查看成绩' : '下一题' }}
      </UButton>
    </template>
  </div>
</template>

<style scoped>
.game {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  width: 100%;
}
.game-top {
  display: flex;
  gap: 1.5rem;
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}
.expr-card {
  text-align: center;
}
.expr {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.hint {
  font-size: 0.8rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
}
.finish {
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
}
</style>
