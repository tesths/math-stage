<script setup lang="ts">
/**
 * 训练游戏：面积挑战（长方形/正方形）
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
  const square = Math.random() < 0.5
  if (square) {
    const a = randInt(2, 15)
    const answer = a * a
    const opts = new Set<number>([answer])
    let guard = 0
    while (opts.size < 3 && guard++ < 50) {
      opts.add(Math.max(1, answer + randInt(-20, 20)))
    }
    return {
      desc: `正方形边长 ${a} 厘米`,
      question: '它的面积是多少平方厘米？',
      answer,
      options: [...opts].sort((x, y) => x - y),
    }
  }
  const a = randInt(3, 20)
  const b = randInt(2, 12)
  const answer = a * b
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 50) {
    opts.add(Math.max(1, answer + randInt(-12, 12)))
  }
  return {
    desc: `长方形长 ${a} 厘米、宽 ${b} 厘米`,
    question: '它的面积是多少平方厘米？',
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
      <p class="finish-title">📐 面积高手！</p>
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
        <p class="hint">长方形 S=a×b · 正方形 S=a×a</p>
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
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ui-text-highlighted);
}
.expr {
  font-size: 1.7rem;
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
