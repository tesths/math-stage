<script setup lang="ts">
/**
 * 训练游戏：速度时间路程（路程=速度×时间）
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
    const v = randInt(5, 30) * 5
    const t = randInt(2, 8)
    const answer = v * t
    const opts = new Set<number>([answer])
    let guard = 0
    while (opts.size < 3 && guard++ < 50) {
      opts.add(Math.max(1, answer + randInt(-60, 60)))
    }
    return {
      desc: `小明每分钟走 ${v} 米`,
      question: `走 ${t} 分钟走了多少米？`,
      answer,
      options: [...opts].sort((x, y) => x - y),
    }
  }
  if (mode === 1) {
    const v = randInt(5, 30) * 5
    const t = randInt(2, 8)
    const answer = v
    const opts = new Set<number>([answer])
    let guard = 0
    while (opts.size < 3 && guard++ < 50) {
      opts.add(Math.max(5, answer + randInt(-30, 30)))
    }
    return {
      desc: `${v * t} 米路程用了 ${t} 分钟`,
      question: '平均每分钟走多少米？',
      answer,
      options: [...opts].sort((x, y) => x - y),
    }
  }
  const v = randInt(5, 30) * 5
  const t = randInt(2, 8)
  const answer = t
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 50) {
    opts.add(Math.max(1, answer + randInt(-3, 3)))
  }
  return {
    desc: `汽车每小时行 ${v} 千米`,
    question: `行驶 ${v * t} 千米需要多少小时？`,
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
      <p class="finish-title">🚗 行程高手！</p>
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
        <p class="hint">路程 = 速度 × 时间</p>
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
