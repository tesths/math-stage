<script setup lang="ts">
/**
 * 训练游戏：购物总价（总价=单价×数量）
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  desc: string
  question: string
  answer: number
  options: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const mode = randInt(0, 2)
  if (mode === 0) {
    const price = randInt(2, 50)
    const count = randInt(2, 9)
    const answer = price * count
    const opts = new Set<number>([answer])
    let guard = 0
    while (opts.size < 3 && guard++ < 50) {
      opts.add(Math.max(1, answer + randInt(-20, 20)))
    }
    return {
      desc: `钢笔每支 ${price} 元`,
      question: `买 ${count} 支要付多少元？`,
      answer,
      options: [...opts].sort((x, y) => x - y),
    }
  }
  if (mode === 1) {
    const price = randInt(2, 50)
    const count = randInt(2, 9)
    const answer = price
    const opts = new Set<number>([answer])
    let guard = 0
    while (opts.size < 3 && guard++ < 50) {
      opts.add(Math.max(1, answer + randInt(-5, 5)))
    }
    return {
      desc: `买 ${count} 个笔记本共付 ${price * count} 元`,
      question: '每个笔记本多少元？',
      answer,
      options: [...opts].sort((x, y) => x - y),
    }
  }
  const price = randInt(2, 30)
  const count = randInt(2, 9)
  const answer = Math.floor((price * count * 2) / price)
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 50) {
    opts.add(Math.max(1, answer + randInt(-2, 2)))
  }
  return {
    desc: `文具盒单价 ${price} 元`,
    question: `用 ${price * count * 2} 元能买多少个？`,
    answer,
    options: [...opts].sort((x, y) => x - y),
  }
}

const roundNo = ref(1)
const rd = ref<Round>(makeRound())
const score = ref(0)
const done = ref(false)
const finished = ref(false)

const answer = computed(() => rd.value.answer)
const options = computed(() => rd.value.options)

function onAnswered(correct: boolean) {
  done.value = true
  if (correct) {
    score.value++
    playCorrect()
  }
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
      <p class="finish-title">🛒 购物高手！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="desc">{{ rd.desc }}</p>
        <p class="expr">{{ rd.question }}</p>
        <p class="hint">总价 = 单价 × 数量</p>
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
.desc {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.expr {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ui-primary);
  margin-top: 0.3rem;
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
