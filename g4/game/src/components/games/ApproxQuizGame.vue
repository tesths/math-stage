<script setup lang="ts">
/**
 * 训练游戏：四舍五入求近似数
 */
import { computed, ref } from 'vue'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  expr: string
  answer: string
  options: string[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const toYi = Math.random() < 0.4
  if (toYi) {
    const yi = randInt(1, 99)
    const extra = randInt(0, 99999999)
    const value = yi * 100000000 + extra
    const approx = Math.round(value / 100000000)
    const answer = `${approx} 亿`
    const opts = new Set<string>([answer])
    let guard = 0
    while (opts.size < 3 && guard++ < 20) {
      const d = approx + randInt(-2, 2)
      if (d > 0) opts.add(`${d} 亿`)
    }
    return {
      expr: `${value.toLocaleString('en-US')} ≈ ?`,
      answer,
      options: [...opts],
    }
  }
  const wan = randInt(10, 99)
  const extra = randInt(0, 9999)
  const value = wan * 10000 + extra
  const approx = Math.round(value / 10000)
  const answer = `${approx} 万`
  const opts = new Set<string>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 20) {
    const d = approx + randInt(-2, 2)
    if (d > 0) opts.add(`${d} 万`)
  }
  return {
    expr: `${value.toLocaleString('en-US')} ≈ ?`,
    answer,
    options: [...opts],
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
      <p class="finish-title">🔍 近似数高手！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="expr-card">
        <p class="expr">{{ rd.expr }}</p>
        <p class="hint">用"四舍五入"法求近似数</p>
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
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
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
