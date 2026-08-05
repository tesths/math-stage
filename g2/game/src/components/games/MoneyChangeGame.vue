<script setup lang="ts">
/**
 * 训练游戏：欢乐购物（付钱与找零）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  price: number
  paid: number
  answer: number
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const price = randInt(1, 9)
  const paid = randInt(price + 1, price + 10)
  return { price, paid, answer: paid - price }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.answer)

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
      <p class="finish-title">🛒 购物过关！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">🧸 {{ rd.price }} 元</p>
        <p class="prompt">付 {{ rd.paid }} 元，应找回多少元？</p>
        <p class="hint">{{ rd.paid }} - {{ rd.price }} = ?（元）</p>
      </div>

      <GameAnswerBar :answer="answer" mode="input" label="找回（元）" @answered="onAnswered" />
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
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
}
.prompt {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
  margin-top: 0.3rem;
}
.hint {
  font-size: 0.85rem;
  color: var(--ui-text-muted);
  margin-top: 0.3rem;
  font-family: ui-monospace, monospace;
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
