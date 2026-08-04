<script setup lang="ts">
/**
 * 训练游戏：公因数公倍数（求最大公因数或最小公倍数）
 */
import { computed, ref } from 'vue'
import { gcd, lcm } from '@/lib/engine/math'
import { playCorrect, playWin } from '@/lib/sound'
import GameAnswerBar from '@/components/ui/GameAnswerBar.vue'

interface Round {
  a: number
  b: number
  mode: 'gcd' | 'lcm'
  answer: number
  options: number[]
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function makeRound(): Round {
  const a = randInt(4, 24)
  const b = randInt(6, 28)
  const mode: 'gcd' | 'lcm' = Math.random() < 0.5 ? 'gcd' : 'lcm'
  const answer = mode === 'gcd' ? gcd(a, b) : lcm(a, b)
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 3 && guard++ < 60) {
    const delta = randInt(1, 6)
    const cands = [answer + delta, Math.max(1, answer - delta), gcd(a, b), lcm(a, b)]
    const c = cands[randInt(0, cands.length - 1)]!
    if (!opts.has(c)) opts.add(c)
  }
  return { a, b, mode, answer, options: [...opts].sort((x, y) => x - y) }
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
      <p class="finish-title">🤝 公因数公倍数高手！</p>
      <p class="finish-sub">5 题答对 {{ score }} 题</p>
      <UButton color="primary" size="lg" @click="restart">再玩一次</UButton>
    </div>

    <template v-else>
      <div class="game-top">
        <span>第 {{ roundNo }}/5 题</span>
        <span>得分 {{ score }}</span>
      </div>

      <div class="question-card">
        <p class="nums">{{ rd.a }} 和 {{ rd.b }}</p>
        <p class="ask">
          {{ rd.mode === 'gcd' ? '最大公因数' : '最小公倍数' }}是多少？
        </p>
        <p class="hint">
          {{ rd.mode === 'gcd' ? '分别列举因数，找公有的、最大的' : '分别列举倍数，找公有的、最小的' }}
        </p>
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
.question-card {
  text-align: center;
}
.nums {
  font-size: 2rem;
  font-weight: 800;
  color: var(--ui-text-highlighted);
  font-family: ui-monospace, monospace;
}
.ask {
  margin-top: 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ui-primary);
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
